import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const sujets = new Set(["Demande de renseignements", "Produits et disponibilité", "Tarifs professionnels", "Livraison et commande", "Autre demande"]);
const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
    }
    const body = await req.json();
    const nom = typeof body.nom === "string" ? body.nom.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const sujet = typeof body.sujet === "string" ? body.sujet : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const honeypot = typeof body.website === "string" ? body.website : "";
    if (honeypot) return NextResponse.json({ ok: true });
    if (!nom || nom.length > 120 || !emailValide.test(email) || email.length > 254 || !sujets.has(sujet) || !message || message.length > 5000) {
      return NextResponse.json({ error: "Vérifiez les champs du formulaire." }, { status: 400 });
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Contact: RESEND_API_KEY manquante");
      return NextResponse.json({ error: "Service de contact temporairement indisponible." }, { status: 503 });
    }
    const from = process.env.CONTACT_FROM_EMAIL || "Black Crown Supply <contact@blackcrownsupply.fr>";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: ["flo.blackcrownsup@gmail.com"],
        reply_to: email,
        subject: `[Black Crown Supply] ${sujet}`,
        text: `Nom / salon : ${nom}\nEmail : ${email}\nObjet : ${sujet}\n\n${message}`,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Contact: échec Resend", response.status);
      return NextResponse.json({ error: "Envoi impossible pour le moment. Réessayez ou contactez-nous par email." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Impossible de traiter votre demande." }, { status: 400 });
  }
}
