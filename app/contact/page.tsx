"use client";

import { useState } from "react";

const gold = "#c8a75b";
const field: React.CSSProperties = { width: "100%", background: "#151310", color: "#f4efe4", border: "1px solid #51452c", borderRadius: 4, padding: "14px 15px", font: "inherit", boxSizing: "border-box" };

export default function ContactPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("Demande de renseignements");
  const [message, setMessage] = useState("");
  const [copie, setCopie] = useState(false);
  const [erreur, setErreur] = useState("");

  function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    if (!nom.trim() || !email.trim() || !message.trim()) {
      setErreur("Merci de renseigner votre nom, votre email et votre message.");
      return;
    }
    const destinataire = "contact@blackcrownsupply.fr";
    const objet = `[Black Crown Supply] ${sujet}`;
    const corps = `Nom / salon : ${nom}\nEmail : ${email}\n\n${message}`;
    const lien = `mailto:${destinataire}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
    setCopie(true);
    window.location.href = lien;
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
            {erreur && <p role="alert" style={{ color: "#ffb0a8" }}>{erreur}</p>}
            <button type="submit" style={{ background: gold, color: "#090909", border: 0, padding: "17px 22px", fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>PRÉPARER MON MESSAGE →</button>
            {copie && <p role="status" style={{ color: "#e0d2af", lineHeight: 1.7 }}>Votre application email doit s'ouvrir avec le message prérempli. Vérifiez son contenu puis cliquez sur « Envoyer ». Si rien ne s'ouvre, utilisez l'adresse email ci-dessous.</p>}
            <p style={{ color: "#a9a39a", fontSize: 13, lineHeight: 1.7, margin: 0 }}>Ce formulaire ouvre votre logiciel de messagerie : aucun message n'est envoyé automatiquement depuis le site.</p>
          </form>
        </div>
        <div style={{ marginTop: 35, borderTop: "1px solid #40351f", paddingTop: 25 }}>
          <h2 style={{ color: gold, fontFamily: "Georgia,serif", fontWeight: 400 }}>Nous écrire directement</h2>
          <a href="mailto:contact@blackcrownsupply.fr" style={{ color: "#f4efe4", overflowWrap: "anywhere" }}>contact@blackcrownsupply.fr</a>
          <p style={{ color: "#aaa", fontSize: 13 }}>BRO TRADE PRO — Distribution réservée aux professionnels.</p>
        </div>
      </div>
    </main>
  );
}
