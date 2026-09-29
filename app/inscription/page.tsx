
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FormData = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  nom_salon: string;
  siret: string;
  adresse: string;
  code_postal: string;
  ville: string;
  password: string;
  confirmPassword: string;
};

const initialForm: FormData = {
  prenom: "",
  nom: "",
  telephone: "",
  email: "",
  nom_salon: "",
  siret: "",
  adresse: "",
  code_postal: "",
  ville: "",
  password: "",
  confirmPassword: "",
};

export default function InscriptionPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field: keyof FormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Choisis un mot de passe d'au moins 8 caractères.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo:
            `${window.location.origin}/auth/callback`,
          data: {
            prenom: form.prenom.trim(),
            nom: form.nom.trim(),
            telephone: form.telephone.trim(),
            nom_salon: form.nom_salon.trim(),
            siret: form.siret.trim(),
            adresse: form.adresse.trim(),
            code_postal: form.code_postal.trim(),
            ville: form.ville.trim(),
          },
        },
      });

      if (signupError) {
        throw signupError;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Erreur inscription :", err);
      setError(
        "L'inscription n'a pas abouti. Vérifie tes informations ou contacte-nous."
      );
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle = {
    width: "100%",
    padding: "14px 15px",
    background: "#111",
    color: "#f4efe4",
    border: "1px solid #4b4029",
    borderRadius: 0,
    fontSize: 15,
  };

  const labelStyle = {
    display: "block",
    marginBottom: 8,
    color: "#d3c4a5",
    fontSize: 12,
  };

  function field(
    label: string,
    name: keyof FormData,
    options?: {
      type?: string;
      required?: boolean;
      autoComplete?: string;
      placeholder?: string;
    }
  ) {
    return (
      <label style={{ display: "block" }}>
        <span style={labelStyle}>
          {label}
          {options?.required !== false ? " *" : ""}
        </span>

        <input
          type={options?.type ?? "text"}
          value={form[name]}
          onChange={(event) =>
            update(name, event.target.value)
          }
          required={options?.required !== false}
          autoComplete={options?.autoComplete}
          placeholder={options?.placeholder}
          style={fieldStyle}
        />
      </label>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0e0d0b",
        color: "#f4efe4",
        padding: "35px 18px 90px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            color: "#c8a75b",
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          ← Retour au catalogue
        </Link>

        <div
          style={{
            textAlign: "center",
            padding: "45px 0 35px",
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
              fontSize: 12,
              letterSpacing: 3,
            }}
          >
            BLACK CROWN SUPPLY
          </p>

          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(36px, 6vw, 54px)",
              fontWeight: 400,
              margin: "15px 0",
            }}
          >
            Créer mon compte pro
          </h1>

          <p style={{ color: "#aaa" }}>
            Rejoignez notre catalogue réservé aux professionnels.
          </p>
        </div>

        {success ? (
          <section
            role="status"
            style={{
              padding: 35,
              background: "#17150f",
              border: "1px solid #c8a75b",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                color: "#c8a75b",
                fontFamily: "Georgia, serif",
                fontSize: 30,
              }}
            >
              Vérifiez votre boîte mail !
            </h2>

            <p style={{ lineHeight: 1.8 }}>
              Si cette adresse peut être inscrite, vous
              recevrez un lien de confirmation.
              Cliquez dessus pour activer votre compte.
            </p>

            <Link
              href="/connexion"
              style={{
                display: "inline-block",
                marginTop: 20,
                color: "#c8a75b",
              }}
            >
              Aller à la connexion →
            </Link>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "clamp(20px, 5vw, 40px)",
              background: "#171512",
              border: "1px solid #40351f",
            }}
          >
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 400,
                marginBottom: 25,
              }}
            >
              Vos coordonnées
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {field("Prénom", "prenom", {
                autoComplete: "given-name",
              })}
              {field("Nom", "nom", {
                autoComplete: "family-name",
              })}
              {field("Téléphone", "telephone", {
                type: "tel",
                autoComplete: "tel",
              })}
              {field("Email professionnel", "email", {
                type: "email",
                autoComplete: "email",
              })}
            </div>

            <div
              style={{
                borderTop: "1px solid #40351f",
                margin: "35px 0",
              }}
            />

            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 400,
                marginBottom: 25,
              }}
            >
              Votre salon
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {field("Nom du salon", "nom_salon")}
              {field("SIRET", "siret", {
                required: false,
                placeholder: "Facultatif",
              })}
              {field("Adresse", "adresse", {
                autoComplete: "street-address",
              })}
              {field("Code postal", "code_postal", {
                autoComplete: "postal-code",
              })}
              {field("Ville", "ville", {
                autoComplete: "address-level2",
              })}
            </div>

            <div
              style={{
                borderTop: "1px solid #40351f",
                margin: "35px 0",
              }}
            />

            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 400,
                marginBottom: 25,
              }}
            >
              Sécurisez votre compte
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {field("Mot de passe", "password", {
                type: "password",
                autoComplete: "new-password",
              })}
              {field(
                "Confirmer le mot de passe",
                "confirmPassword",
                {
                  type: "password",
                  autoComplete: "new-password",
                }
              )}
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  marginTop: 25,
                  padding: 15,
                  color: "#ffd1c7",
                  background: "#4b201b",
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
                marginTop: 35,
                padding: 18,
                background: "#c8a75b",
                border: 0,
                color: "#111",
                fontWeight: 700,
                letterSpacing: 1,
                cursor: loading
                  ? "wait"
                  : "pointer",
              }}
            >
              {loading
                ? "CRÉATION DU COMPTE..."
                : "CRÉER MON COMPTE PRO"}
            </button>

            <p
              style={{
                marginTop: 25,
                textAlign: "center",
                color: "#aaa",
                fontSize: 13,
              }}
            >
              Déjà client ?{" "}
              <Link
                href="/connexion"
                style={{ color: "#c8a75b" }}
              >
                Se connecter
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
