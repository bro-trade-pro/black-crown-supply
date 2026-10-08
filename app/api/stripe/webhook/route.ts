import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string
) {
  const parts = header.split(",").map((part) => part.trim());

  const timestamp = parts
    .find((part) => part.startsWith("t="))
    ?.slice(2);

  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const age = Math.abs(
    Math.floor(Date.now() / 1000) - Number(timestamp)
  );

  if (!Number.isFinite(age) || age > 300) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  return signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expected, "hex")
      );
    } catch {
      return false;
    }
  });
}

export async function POST(request: NextRequest) {
  const webhookSecrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_TEST_WEBHOOK_SECRET,
  ].filter((secret): secret is string => Boolean(secret));

  if (webhookSecrets.length === 0) {
    console.error("Aucune clé de signature Stripe configurée.");

    return NextResponse.json(
      { error: "Configuration Stripe incomplète." },
      { status: 500 }
    );
  }

  const payload = await request.text();

  const signature =
    request.headers.get("stripe-signature");

  if (
    !signature ||
    !webhookSecrets.some((secret) =>
      verifyStripeSignature(payload, signature, secret)
    )
  ) {
    return NextResponse.json(
      { error: "Signature Stripe invalide." },
      { status: 400 }
    );
  }

  let event: {
    type?: string;
    data?: {
      object?: unknown;
    };
  };

  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json(
      { error: "Payload invalide." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object as {
      id?: string;
      mode?: string;
      payment_status?: string;
      amount_total?: number;
      currency?: string;
      payment_intent?: string | { id?: string } | null;
      client_reference_id?: string | null;
      metadata?: { order_id?: string; payment_type?: string } | null;
      livemode?: boolean;
    } | undefined;

    if (!session || session.payment_status !== "paid") {
      // Ne jamais confirmer un acompte avant le paiement effectif.
      return NextResponse.json({ received: true, paid: false });
    }

    // Le site n'accepte actuellement que des paiements de test.
    // Ne jamais traiter des paiements réels avec cette configuration.
    if (session.livemode !== false || session.mode !== "payment") {
      console.error("Stripe: mode de paiement inattendu.");
      return NextResponse.json({ error: "Mode Stripe non autorisé." }, { status: 400 });
    }

    const orderId = session.metadata?.order_id;
    const intentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
    const amount = session.amount_total;

    if (
      session.metadata?.payment_type !== "acompte" ||
      !orderId ||
      session.client_reference_id !== orderId ||
      !/^[0-9a-f-]{36}$/i.test(orderId) ||
      !intentId ||
      !/^pi_[A-Za-z0-9]+$/.test(intentId) ||
      !Number.isSafeInteger(amount) ||
      (amount ?? 0) <= 0 ||
      session.currency?.toLowerCase() !== "eur"
    ) {
      console.error("Stripe: métadonnées ou montant invalides.");
      return NextResponse.json({ error: "Paiement invalide." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error("Stripe: configuration Supabase serveur manquante.");
      return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc("enregistrer_acompte_stripe", {
      p_order_id: orderId,
      p_payment_intent_id: intentId,
      p_montant_cents: amount,
    });

    if (error || !data?.success) {
      console.error("Stripe: échec d'enregistrement de l'acompte", error?.code, error?.message);
      // Réponse non-2xx pour permettre les nouvelles tentatives de Stripe.
      return NextResponse.json({ error: "Enregistrement du paiement impossible." }, { status: 500 });
    }

    console.log("Acompte Stripe enregistré", orderId, data.already_processed ? "déjà traité" : "nouveau");
  }

  return NextResponse.json({
    received: true,
  });
}
