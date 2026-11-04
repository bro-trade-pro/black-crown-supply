"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NouveauMotDePasse() {
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const query = new URLSearchParams(window.location.search);
        const hashError = hash.get("error_description") || query.get("error_description");
        if (hashError) throw new Error(hashError);
        const tokenHash = query.get("token_hash");
        const type = query.get("type");
        if (tokenHash && type === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
          if (verifyError) throw verifyError;
        } else if (hash.get("access_token") && hash.get("refresh_token")) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: hash.get("access_token")!,
            refresh_token: hash.get("refresh_token")!,
          });
          if (sessionError) throw sessionError;
        } else if (query.get("code")) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(query.get("code")!);
          if (exchangeError) throw exchangeError;
        }
        const { data } = await supabase.auth.getSession();
        if (active) {
          setValid(Boolean(data.session));
          if (!data.session) setError("Lien invalide ou expiré. Demandez un nouveau lien.");
        }
        window.history.replaceState({}, "", "/nouveau-mot-de-passe");
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Lien invalide ou expiré.");
      } finally {
        if (active) setReady(true);
      }
    }
    void init();
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || loading) return;
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    setError("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      await supabase.auth.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier le mot de passe.");
    } finally { setLoading(false); }
  }

  const inputStyle = { display: "block" as const, width: "100%", boxSizing: "border-box" as const, padding: 15, margin: "10px 0 22px", background: "#111", color: "#f4efe4", border: "1px solid #4b4029" };
  return (
    <main style={{ minHeight: "100vh", background: "#0e0d0b", color: "#f4efe4", padding: "65px 20px" }}>
      <section style={{ maxWidth: 520, margin: "auto", padding: 35, background: "#171512", border: "1px solid #40351f" }}>
        <p style={{ color: "#c8a75b", letterSpacing: 2 }}>♛ BLACK CROWN SUPPLY</p>
        <h1 style={{ fontFamily: "Georgia,serif", fontWeight: 400, fontSize: 36 }}>Nouveau mot de passe</h1>
        {!ready ? <p>Vérification de votre lien...</p> : success ? <p role="status">Votre mot de passe a été modifié. Vous pouvez vous connecter.</p> : valid ? (
          <form onSubmit={submit}>
            <label htmlFor="password">Nouveau mot de passe</label>
            <input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            <label htmlFor="confirm">Confirmer le mot de passe</label>
            <input id="confirm" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
            {error && <p role="alert" style={{ color: "#ffb9ad" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: 16, background: "#c8a75b", color: "#111", border: 0, fontWeight: 700, cursor: "pointer" }}>{loading ? "ENREGISTREMENT..." : "ENREGISTRER MON MOT DE PASSE"}</button>
          </form>
        ) : <p role="alert" style={{ color: "#ffb9ad" }}>{error || "Lien invalide ou expiré."}</p>}
        <p style={{ marginTop: 28 }}><Link href={valid || success ? "/connexion" : "/mot-de-passe-oublie"} style={{ color: "#c8a75b" }}>{valid || success ? "Retour à la connexion" : "Demander un nouveau lien"}</Link></p>
      </section>
    </main>
  );
}
