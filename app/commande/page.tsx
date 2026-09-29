
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../CartContext";
import { supabase } from "@/lib/supabase";

type Salon = {
  nom_salon: string;
  adresse: string;
  code_postal: string;
  ville: string;
  telephone: string;
  email: string;
};

function euros(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export default function CommandePage() {
  const { items, ready, totalQuantity, totalCents } = useCart();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [demande, setDemande] = useState("");
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    async function chargerSalon() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        setLoading(false);
        return;
      }

      const { data: profil } = await supabase
        .from("profiles")
        .select("salon_id")
        .eq("id", auth.user.id)
        .single();

      if (profil?.salon_id) {
        const { data } = await supabase
          .from("salons")
          .select(
            "nom_salon,adresse,code_postal,ville,telephone,email"
          )
          .eq("id", profil.salon_id)
          .single();

        setSalon(data);
      }

      setLoading(false);
    }

    chargerSalon();
  }, []);

  return (
    <main className="productPage">
      <section className="content productContent">
        <div
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            padding: "55px 25px 100px",
          }}
        >
          <Link href="/panier" style={{ color: "#c8a75b" }}>
            ← Retour au panier
          </Link>

          <p className="eyebrow" style={{ marginTop: 45 }}>
            BLACK CROWN SUPPLY
          </p>

          <h1 style={{ fontSize: "clamp(35px,5vw,58px)" }}>
            Finaliser ma commande
          </h1>

          {!ready || loading ? (
            <p>Chargement...</p>
          ) : !salon ? (
            <section style={bloc}>
              <h2>Connectez-vous pour commander</h2>
              <p>
                Retrouvez votre compte professionnel pour
                finaliser vos achats.
              </p>
              <Link href="/connexion" style={{ color: "#c8a75b" }}>
                Connexion salon →
              </Link>
            </section>
          ) : items.length === 0 ? (
            <section style={bloc}>
              <h2>Votre panier est vide</h2>
              <Link href="/" style={{ color: "#c8a75b" }}>
                Retour au catalogue →
              </Link>
            </section>
          ) : (
            <>
              <section style={bloc}>
                <p className="eyebrow">01 — LIVRAISON</p>
                <h2>Votre salon</h2>
                <p><strong>{salon.nom_salon}</strong></p>
                <p>{salon.adresse}</p>
                <p>{salon.code_postal} {salon.ville}</p>
                <p>{salon.telephone}</p>
                <p>{salon.email}</p>
                <small style={{ color: "#aaa" }}>
                  Ces coordonnées proviennent de votre compte pro.
                </small>
              </section>

              <section style={bloc}>
                <p className="eyebrow">02 — VOTRE SÉLECTION</p>
                <h2>Récapitulatif</h2>

                {items.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 20,
                      borderBottom: "1px solid #40351f",
                      padding: "16px 0",
                    }}
                  >
                    <div>
                      <strong>{item.productName}</strong>
                      {item.variantName && (
                        <p style={{ color: "#c8a75b" }}>
                          {item.variantName}
                        </p>
                      )}
                      <small>Quantité : {item.quantity}</small>
                    </div>
                    <strong>
                      {euros(item.priceCents * item.quantity)}
                    </strong>
                  </div>
                ))}

                <p>{totalQuantity} articles</p>
                <h2 style={{ color: "#c8a75b" }}>
                  Total produits : {euros(totalCents)}
                </h2>
                <small>
                  Hors frais de livraison éventuels.
                </small>
              </section>

              <section style={bloc}>
                <p className="eyebrow">03 — VOS DEMANDES</p>
                <h2>Un besoin particulier ?</h2>

                <label htmlFor="demande-produit">
                  Un produit manque à notre catalogue ?
                </label>
                <textarea
                  id="demande-produit"
                  value={demande}
                  onChange={(e) => setDemande(e.target.value)}
                  placeholder="Marque, référence, quantité souhaitée..."
                  style={champ}
                />

                <label htmlFor="commentaire">
                  Commentaire sur votre commande
                </label>
                <textarea
                  id="commentaire"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Précisions pour votre livraison..."
                  style={champ}
                />
              </section>

              <section style={bloc}>
                <p className="eyebrow">04 — VALIDATION</p>
                <h2>Votre commande</h2>
                <p>Total produits : {euros(totalCents)}</p>
                <p>
                  Acompte prévu : 50 % à la commande.
                  Solde : 50 % à la livraison.
                </p>

                <button
                  type="button"
                  disabled
                  style={{
                    ...champ,
                    background: "#554a31",
                    color: "#ddd",
                    cursor: "not-allowed",
                    textAlign: "center",
                  }}
                >
                  CONFIRMER MA COMMANDE — PROCHAINE ÉTAPE
                </button>

                <small style={{ color: "#aaa" }}>
                  Aucun paiement ni aucune commande
                  ne sont encore déclenchés.
                </small>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

const bloc = {
  marginTop: 30,
  padding: 30,
  background: "#171512",
  border: "1px solid #40351f",
};

const champ = {
  display: "block" as const,
  width: "100%",
  margin: "12px 0 25px",
  padding: 15,
  background: "#111",
  color: "#f4efe4",
  border: "1px solid #4b4029",
  fontSize: 14,
};
