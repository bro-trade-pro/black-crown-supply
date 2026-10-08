"use client";

import { useState, type CSSProperties, type FormEvent } from "react";

const gold = "#c8a75b";
const field: CSSProperties = { width: "100%", background: "#151310", color: "#f4efe4", border: "1px solid #51452c", borderRadius: 4, padding: "14px 15px", font: "inherit", boxSizing: "border-box" };

export default function ContactPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("Demande de renseignements");
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setSucces(false);
    setErreur("");
    try {
      const website = (e.currentTarget.elements.namedItem("website") as HTMLInputElement)?.value ?? "";
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom, email, sujet, message, website }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Envoi impossible.");
      setSucces(true);
      setNom(""); setEmail(""); setMessage("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080808", color: "#f4efe4", padding: "55px 22px 100px" }}>
      <div style={{ maxWidth: 850, margin: "0 auto" }}>
        <p style={{ color: gold, letterSpacing: 4, fontSize: 12 }}>BLACK CROWN SUPPLY — WHOLESALE PRO</p>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(40px, 6vw, 66px)", fontWeight: 400, margin: "18px 0" }}>Contactez-nous</h1>
        <p style={{ color: "#c8c2b7", lineHeight: 1.8, maxWidth: 650 }}>Vous êtes professionnel de la coiffure ? Une question sur nos mèches, nos cosmétiques, nos tarifs ou une commande ? Écrivez-nous.</p>
        <div style={{ border: "1px solid #40351f", padding: "clamp(22px, 4vw, 38px)", marginTop: 35, background: "#100f0d" }}>
          <h2 style={{ color: gold, fontFamily: "Georgia,serif", fontWeight: 400, marginTop: 0 }}>Votre demande</h2>
          <form onSubmit={envoyer} style={{ display: "grid", gap: 20 }}>
            <label style={{ display: "grid", gap: 8 }}>Nom ou salon *<input value={nom} onChange={e => setNom(e.target.value)} required maxLength={120} style={field} placeholder="Votre nom / nom du salon" /></label>
            <label style={{ display: "grid", gap: 8 }}>Adresse email *<input value={email} onChange={e => setEmail(e.target.value)} type="email" required maxLength={254} style={field} placeholder="vous@salon.fr" /></label>
            <label style={{ display: "grid", gap: 8 }}>Objet<select value={sujet} onChange={e => setSujet(e.target.value)} style={field}><option>Demande de renseignements</option><option>Produits et disponibilité</option><option>Tarifs professionnels</option><option>Livraison et commande</option><option>Autre demande</option></select></label>
            <label style={{ display: "grid", gap: 8 }}>Message *<textarea value={message} onChange={e => setMessage(e.target.value)} required maxLength={5000} rows={7} style={{ ...field, resize: "vertical" }} placeholder="Comment pouvons-nous vous aider ?" /></label>
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
            {erreur && <p role="alert" style={{ color: "#ffb0a8" }}>{erreur}</p>}
            {succes && <p role="status" style={{ color: "#b5e4bb" }}>Votre message a bien été envoyé. Nous vous répondrons dès que possible.</p>}
            <button type="submit" disabled={envoi} style={{ background: gold, color: "#090909", border: 0, padding: "17px 22px", fontWeight: 700, cursor: envoi ? "wait" : "pointer", letterSpacing: 1, opacity: envoi ? 0.7 : 1 }}>{envoi ? "ENVOI EN COURS…" : "ENVOYER MON MESSAGE →"}</button>
            <p style={{ color: "#a9a39a", fontSize: 13, lineHeight: 1.7, margin: 0 }}>Votre message est transmis directement à notre équipe, sans ouvrir votre messagerie.</p>
          </form>
        </div>
        <div style={{ marginTop: 35, borderTop: "1px solid #40351f", paddingTop: 25 }}>
          <h2 style={{ color: gold, fontFamily: "Georgia,serif", fontWeight: 400 }}>Nous écrire directement</h2>
          <a href="mailto:flo.blackcrownsup@gmail.com" style={{ color: "#f4efe4", overflowWrap: "anywhere" }}>flo.blackcrownsup@gmail.com</a>
          <p style={{ color: "#aaa", fontSize: 13 }}>BRO TRADE PRO — Distribution réservée aux professionnels.</p>
        </div>
      </div>
    </main>
  );
}
