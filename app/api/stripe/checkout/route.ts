import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!secret || !url || !anonKey) {
      return NextResponse.json({ error: "Paiement non configuré." }, { status: 503 });
    }
    // Ne jamais démarrer un paiement réel pendant l'intégration initiale.
    if (!secret.startsWith("sk_test_")) {
      return NextResponse.json({ error: "Mode test requis." }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

    const supabase = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth.user) {
      return NextResponse.json({ error: "Session expirée." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const orderId = body?.orderId;
    if (typeof orderId !== "string" || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return NextResponse.json({ error: "Commande invalide." }, { status: 400 });
    }

    // RLS : seules les commandes accessibles à ce salon sont consultables.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,numero,user_id,statut,acompte_du_cents,acompte_paye_cents")
      .eq("id", orderId)
      .eq("user_id", auth.user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }
    if (order.statut !== "en_attente_acompte" || order.acompte_paye_cents !== 0) {
      return NextResponse.json({ error: "Acompte déjà traité ou commande non éligible." }, { status: 409 });
    }
    const amount = order.acompte_du_cents;
    if (!Number.isSafeInteger(amount) || amount < 50) {
      return NextResponse.json({ error: "Montant d'acompte invalide." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("payment_method_types[0]", "card");
    params.set("line_items[0][price_data][currency]", "eur");
    params.set("line_items[0][price_data][unit_amount]", String(amount));
    params.set("line_items[0][price_data][product_data][name]", `Acompte 50 % — ${order.numero}`);
    params.set("line_items[0][quantity]", "1");
    params.set("client_reference_id", order.id);
    params.set("metadata[order_id]", order.id);
    params.set("metadata[payment_type]", "acompte");
    params.set("success_url", `${origin}/mes-commandes?stripe=success`);
    params.set("cancel_url", `${origin}/mes-commandes?stripe=cancel`);

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    });
    const session = await stripeResponse.json();
    if (!stripeResponse.ok || typeof session.url !== "string" || !session.url.startsWith("https://checkout.stripe.com/")) {
      console.error("Stripe Checkout creation failed", stripeResponse.status, session?.error?.type);
      return NextResponse.json({ error: "Impossible de préparer le paiement Stripe." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout route error", error);
    return NextResponse.json({ error: "Erreur de préparation du paiement." }, { status: 500 });
  }
}
