import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

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
    /*
      On branchera ici la validation réelle
      de l'acompte Black Crown.

      Pour l'instant :
      - Stripe envoie l'événement
      - nous vérifions cryptographiquement sa signature
      - nous confirmons sa réception

      On ajoutera la mise à jour Supabase après avoir
      créé notre Checkout Session Stripe.
    */

    console.log(
      "Stripe checkout.session.completed reçu."
    );
  }

  return NextResponse.json({
    received: true,
  });
}
