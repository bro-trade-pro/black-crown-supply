"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer l'email. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0e0d0b", color: "#f4efe4", padding: "65px 20px" }}>
      <section style={{ maxWidth: 520, margin: "auto", padding: 35, background: "#171512", border: "1px solid #40351f" }}>
        <p style={{ color: "#c8a75b", letterSpacing: 2 }}>♛ BLACK CROWN SUPPLY</p>
        <h1 style={{ fontFamily: "Georgia,serif", fontWeight: 400, fontSize: 36 }}>Mot de passe oublié ?</h1>
        {sent ? (
          <p role="status" style={{ lineHeight: 1.8 }}>Si un compte existe avec cette adresse, vous recevrez un email contenant un lien pour créer un nouveau mot de passe. Vérifiez également vos courriers indésirables.</p>
        ) : (
          <form onSubmit={submit}>
            <p style={{ color: "#aaa", lineHeight: 1.7 }}>Indiquez l'adresse email de votre compte professionnel.</p>
            <label htmlFor="email">Email professionnel</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 15, marginTop: 10, background: "#111", color: "#f4efe4", border: "1px solid #4b4029" }} />
            {error && <p role="alert" style={{ color: "#ffb9ad" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 25, padding: 16, background: "#c8a75b", color: "#111", border: 0, fontWeight: 700, cursor: "pointer" }}>{loading ? "ENVOI..." : "RECEVOIR LE LIEN"}</button>
          </form>
        )}
        <p style={{ marginTop: 28 }}><Link href="/connexion" style={{ color: "#c8a75b" }}>Retour à la connexion</Link></p>
      </section>
    </main>
  );
}
