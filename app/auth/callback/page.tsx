
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function finishConfirmation() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (url.searchParams.get("error")) {
          throw new Error("Lien de confirmation invalide ou expiré.");
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) throw exchangeError;
        } else {
          const { error: sessionError } =
            await supabase.auth.getSession();

          if (sessionError) throw sessionError;
        }

        if (active) {
          router.replace("/connexion?confirmed=1");
        }
      } catch (err) {
        console.error("Confirmation :", err);

        if (active) {
          setError(
            "Impossible de confirmer votre email. Le lien est peut-être expiré."
          );
        }
      }
    }

    finishConfirmation();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 25,
        background: "#0e0d0b",
        color: "#f4efe4",
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 45,
            color: "#c8a75b",
          }}
        >
          ♛
        </div>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 400,
          }}
        >
          {error
            ? "Confirmation impossible"
            : "Confirmation de votre compte..."}
        </h1>

        {error ? (
          <>
            <p>{error}</p>
            <Link
              href="/connexion"
              style={{ color: "#c8a75b" }}
            >
              Retour à la connexion
            </Link>
          </>
        ) : (
          <p style={{ color: "#aaa" }}>
            Encore un instant, nous préparons votre accès.
          </p>
        )}
      </div>
    </main>
  );
}
