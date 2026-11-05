import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PendingOrder = {
  id: string;
  statut: string;
  acompte_paye_cents: number;
  stripe_checkout_session_id: string | null;
};

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!url || !serviceKey || !stripeSecret) {
    return NextResponse.json({ error: "Configuration incomplète" }, { status: 503 });
  }

  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const deadline = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from("orders")
    .select("id,statut,acompte_paye_cents,stripe_checkout_session_id")
    .eq("statut", "en_attente_acompte")
    .eq("acompte_paye_cents", 0)
    .lt("created_at", deadline)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Expiration: lecture des commandes impossible", error.code);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }

  let cancelled = 0;
  let skipped = 0;
  let failed = 0;

  for (const order of (data ?? []) as PendingOrder[]) {
    const sessionId = order.stripe_checkout_session_id;
    // Sans session Stripe traçable, aucune annulation automatique.
    if (!sessionId || !/^cs_(test_|live_)[A-Za-z0-9]+$/.test(sessionId)) {
      skipped++;
      continue;
    }

    try {
      const headers = { Authorization: `Bearer ${stripeSecret}` };
      const lookup = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
        { headers, cache: "no-store" }
      );
      if (!lookup.ok) {
        failed++;
        console.error("Expiration: vérification Stripe échouée", order.id, lookup.status);
        continue;
      }

      let session = await lookup.json() as {
        id?: string;
        status?: string;
        payment_status?: string;
        client_reference_id?: string | null;
        metadata?: { order_id?: string } | null;
      };

      if (session.id !== sessionId ||
          session.client_reference_id !== order.id ||
          session.metadata?.order_id !== order.id ||
          session.payment_status !== "unpaid") {
        skipped++;
        continue;
      }

      if (session.status === "open") {
        const expire = await fetch(
          `https://api.stripe.com/v1/checkout/sessions/${sessionId}/expire`,
          { method: "POST", headers, cache: "no-store" }
        );
        if (!expire.ok) {
          failed++;
          console.error("Expiration: fermeture Stripe échouée", order.id, expire.status);
          continue;
        }
        session = await expire.json();
      }

      if (session.status !== "expired" || session.payment_status !== "unpaid") {
        skipped++;
        continue;
      }

      // Condition atomique côté base : jamais annuler un acompte déjà enregistré.
      // Le trigger Supabase libère automatiquement les réductions réservées.
      const { data: updated, error: updateError } = await db
        .from("orders")
        .update({ statut: "annulee", updated_at: new Date().toISOString() })
        .eq("id", order.id)
        .eq("statut", "en_attente_acompte")
        .eq("acompte_paye_cents", 0)
        .eq("stripe_checkout_session_id", sessionId)
        .select("id");

      if (updateError) {
        failed++;
        console.error("Expiration: annulation impossible", order.id, updateError.code);
      } else if (updated?.length) {
        cancelled++;
      } else {
        skipped++;
      }
    } catch (err) {
      failed++;
      console.error("Expiration: erreur de traitement", order.id, err);
    }
  }

  return NextResponse.json({ checked: data?.length ?? 0, cancelled, skipped, failed });
}
