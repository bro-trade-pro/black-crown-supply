
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConnexionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(
          "Connexion impossible. Vérifiez vos identifiants et la confirmation de votre email."
        );
        return;
      }

      // En attendant la création de l'espace client.
      router.push("/panier");
      router.refresh();
    } catch {
      setError(
        "Une erreur est survenue. Réessayez dans quelques instants."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "15px",
    background: "#111",
    color: "#f4efe4",
    border: "1px solid #4b4029",
    fontSize: 15,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0e0d0b",
        color: "#f4efe4",
        padding: "35px 20px 90px",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            color: "#c8a75b",
            textDecoration: "none",
            fontSize: 13,
          }}
        >
          ← Retour au catalogue
        </Link>

        <div
          style={{
            textAlign: "center",
            padding: "55px 0 35px",
          }}
        >
          <div
            style={{
              color: "#c8a75b",
              fontSize: 48,
            }}
          >
            ♛
          </div>

          <p
            style={{
              color: "#c8a75b",
              letterSpacing: 3,
              fontSize: 12,
            }}
          >
            BLACK CROWN SUPPLY
          </p>

          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(36px, 5vw, 52px)",
              margin: "20px 0",
            }}
          >
            Connexion salon
          </h1>

          <p style={{ color: "#aaa" }}>
            Retrouvez votre espace professionnel.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: "clamp(22px, 5vw, 40px)",
            background: "#171512",
            border: "1px solid #40351f",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: 10,
                color: "#d3c4a5",
                fontSize: 13,
              }}
            >
              Email professionnel
            </span>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              style={inputStyle}
            />
          </label>

          <label style={{ display: "block" }}>
            <span
              style={{
                display: "block",
                marginBottom: 10,
                color: "#d3c4a5",
                fontSize: 13,
              }}
            >
              Mot de passe
            </span>

            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              style={inputStyle}
            />
          </label>

          {error && (
            <p
              role="alert"
              style={{
                padding: 15,
                marginTop: 25,
                color: "#ffd1c7",
                background: "#4b201b",
                fontSize: 13,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 30,
              padding: 17,
              background: "#c8a75b",
              color: "#111",
              border: 0,
              fontWeight: 700,
              letterSpacing: 1,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading
              ? "CONNEXION..."
              : "ME CONNECTER"}
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: 30,
              color: "#aaa",
              fontSize: 13,
            }}
          >
            Pas encore de compte ?{" "}
            <Link
              href="/inscription"
              style={{ color: "#c8a75b" }}
            >
              Créer mon compte pro
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
