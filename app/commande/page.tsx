
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../CartContext";
import { supabase } from "@/lib/supabase";

const gold = "#c8a75b";
const cream = "#f4efe4";
const border = "#40351f";
const FRANCO_TTC = 60000;
const LIVRAISON_TTC = 1440;

type Salon = {
  nom_salon: string;
  adresse: string;
  code_postal: string;
  ville: string;
  telephone: string;
  email: string;
};

type CommandeCreee = {
  orderId: string;
  numero: string;
  produitsTtcCents: number;
  livraisonTtcCents: number;
  totalTtcCents: number;
  acompteCents: number;
  soldeCents: number;
  nombreArticles: number;
};

function euros(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

const bloc = {
  marginTop: 30,
  padding: 30,
  background: "#171512",
  border: `1px solid ${border}`,
};

const champ = {
  display: "block" as const,
  width: "100%",
  margin: "12px 0 25px",
  padding: 15,
  background: "#111",
  color: cream,
  border: "1px solid #4b4029",
  fontSize: 14,
};

export default function CommandePage() {
  const {
    items,
    ready,
    totalQuantity,
    totalCents,
    clearCart,
  } = useCart();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [demande, setDemande] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [cgvAcceptees, setCgvAcceptees] = useState(false);
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState("");
  const [erreur, setErreur] = useState("");
  const [commande, setCommande] =
    useState<CommandeCreee | null>(null);

  // Hypothèse actuelle : TVA de 20 %.
  const totalHT = totalCents / 1.2;
  const francoAtteint = totalCents >= FRANCO_TTC;
  const resteTTC = Math.max(0, FRANCO_TTC - totalCents);
  const progression = Math.min(
    100,
    (totalCents / FRANCO_TTC) * 100
  );
  const livraisonCents = francoAtteint
    ? 0
    : LIVRAISON_TTC;
  const totalAvecLivraison =
    totalCents + livraisonCents;
  const acompteCents =
    Math.ceil(totalAvecLivraison / 2);
  const soldeCents =
    totalAvecLivraison - acompteCents;

  useEffect(() => {
    async function chargerSalon() {
      try {
        const { data: auth, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        if (!auth.user) return;

        const { data: profil, error: profilError } =
          await supabase
            .from("profiles")
            .select("salon_id")
            .eq("id", auth.user.id)
            .single();

        if (profilError) throw profilError;

        if (profil?.salon_id) {
          const { data, error: salonError } =
            await supabase
              .from("salons")
              .select(
                "nom_salon,adresse,code_postal,ville,telephone,email"
              )
              .eq("id", profil.salon_id)
              .single();

          if (salonError) throw salonError;
          setSalon(data);
        }
      } catch (error) {
        console.error("Chargement du salon :", error);
        setErreur(
          "Impossible de charger votre salon. " +
          "Actualisez la page ou reconnectez-vous."
        );
      } finally {
        setLoading(false);
      }
    }

    chargerSalon();
  }, []);

  async function confirmerCommande() {
    if (envoi || commande || !ready || !salon) return;

    if (items.length === 0) {
      setErreur("Votre panier est vide.");
      return;
    }

    if (!cgvAcceptees) {
      setErreur("Vous devez accepter les Conditions Générales de Vente pour confirmer votre commande.");
      return;
    }

    setEnvoi(true);
    setErreur("");

    try {
      const articles = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.rpc(
        "passer_commande",
        {
          p_articles: articles,
          p_commentaire: commentaire.trim() || null,
          p_demande: demande.trim() || null,
        }
      );

      if (error) throw error;

      if (
        !data ||
        typeof data !== "object" ||
        typeof data.orderId !== "string" ||
        typeof data.numero !== "string"
      ) {
        throw new Error(
          "Réponse du serveur incomplète. " +
          "Vérifiez vos commandes avant de réessayer."
        );
      }

      const resultat = data as CommandeCreee;

      setCommande(resultat);
      clearCart();
    } catch (error) {
      console.error("Commande :", error);

      setErreur(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer votre commande."
      );
    } finally {
      setEnvoi(false);
    }
  }

  async function payerAcompte() {
    if (!commande || paiementEnCours) return;
    setPaiementEnCours(true);
    setErreurPaiement("");
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session.session?.access_token) {
        throw new Error("Reconnectez-vous pour régler votre acompte.");
      }
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ orderId: commande.orderId }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string") {
        throw new Error(result.error || "Impossible d'ouvrir le paiement Stripe.");
      }
      window.location.assign(result.url);
    } catch (error) {
      setErreurPaiement(error instanceof Error ? error.message : "Paiement indisponible.");
      setPaiementEnCours(false);
    }
  }

  return (
    <main className="productPage">
      <section className="content productContent">
        <header>
          <span>BLACK CROWN SUPPLY</span>
          <div>Catalogue professionnel · Prix TTC</div>
        </header>

        <div
          style={{
            maxWidth: 1050,
            margin: "0 auto",
            padding: "55px 25px 100px",
          }}
        >
          {commande ? (
            <section
              style={{
                ...bloc,
                textAlign: "center",
                padding: "65px 30px",
              }}
            >
              <div
                style={{
                  color: gold,
                  fontSize: 55,
                  marginBottom: 15,
                }}
              >
                ♛
              </div>

              <p className="eyebrow">
                COMMANDE ENREGISTRÉE
              </p>

              <h1
                style={{
                  fontSize: "clamp(32px,5vw,52px)",
                  margin: "15px 0",
                }}
              >
                Merci pour votre commande !
              </h1>

              <p
                style={{
                  color: "#bbb",
                  fontSize: 15,
                }}
              >
                Votre commande a bien été enregistrée.
                Votre panier est maintenant vide.
              </p>

              <div
                style={{
                  maxWidth: 440,
                  margin: "35px auto",
                  padding: 25,
                  background: "#100f0d",
                  border: `1px solid ${border}`,
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  NUMÉRO DE COMMANDE
                </p>

                <h2
                  style={{
                    color: gold,
                    overflowWrap: "anywhere",
                  }}
                >
                  {commande.numero}
                </h2>

                <p>
                  Articles : {commande.nombreArticles}
                </p>

                <p>
                  Produits :{" "}
                  {euros(commande.produitsTtcCents)}
                </p>

                <p>
                  Livraison :{" "}
                  {commande.livraisonTtcCents === 0
                    ? "Offerte"
                    : euros(
                        commande.livraisonTtcCents
                      )}
                </p>

                <div
                  style={{
                    borderTop: `1px solid ${border}`,
                    marginTop: 20,
                    paddingTop: 20,
                  }}
                >
                  <h2 style={{ color: gold }}>
                    Total :{" "}
                    {euros(commande.totalTtcCents)}
                  </h2>

                  <p>
                    Acompte à régler :{" "}
                    <strong>
                      {euros(commande.acompteCents)}
                    </strong>
                  </p>

                  <p>
                    Solde à la livraison :{" "}
                    <strong>
                      {euros(commande.soldeCents)}
                    </strong>
                  </p>
                </div>
              </div>

              <p style={{ color: "#bbb" }}>
                Statut : en attente d'acompte.
                Aucun paiement n'a encore été effectué.
              </p>

              {erreurPaiement && (
                <p role="alert" style={{ color: "#ffaaaa" }}>{erreurPaiement}</p>
              )}
              <button
                type="button"
                disabled={paiementEnCours}
                onClick={payerAcompte}
                style={{ ...boutonOr, border: 0, cursor: paiementEnCours ? "wait" : "pointer", marginTop: 20 }}
              >
                {paiementEnCours ? "OUVERTURE DU PAIEMENT…" : "RÉGLER MON ACOMPTE PAR CARTE (TEST) →"}
              </button>
              <p style={{ color: "#aaa", fontSize: 12 }}>
                Mode test Stripe : aucune carte réelle ne sera débitée.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 25,
                }}
              >
                <Link href="/" style={boutonOr}>
                  RETOUR AU CATALOGUE
                </Link>

                <Link
                  href="/mes-commandes"
                  style={boutonContour}
                >
                  MES COMMANDES →
                </Link>
              </div>
            </section>
          ) : (
            <>
              <Link
                href="/panier"
                style={{
                  color: gold,
                  textDecoration: "none",
                }}
              >
                ← Retour au panier
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: 45 }}
              >
                BLACK CROWN SUPPLY
              </p>

              <h1
                style={{
                  fontSize: "clamp(35px,5vw,58px)",
                }}
              >
                Finaliser ma commande
              </h1>

              {!ready || loading ? (
                <p style={{ color: "#999" }}>
                  Chargement de votre commande…
                </p>
              ) : !salon ? (
                <section style={bloc}>
                  <h2>Connectez-vous pour commander</h2>

                  <p>
                    Retrouvez votre compte professionnel
                    pour finaliser vos achats.
                  </p>

                  {erreur && (
                    <p style={{ color: "#ff9999" }}>
                      {erreur}
                    </p>
                  )}

                  <Link
                    href="/connexion"
                    style={{ color: gold }}
                  >
                    Connexion salon →
                  </Link>
                </section>
              ) : items.length === 0 ? (
                <section style={bloc}>
                  <h2>Votre panier est vide</h2>

                  <Link href="/" style={{ color: gold }}>
                    Retour au catalogue →
                  </Link>
                </section>
              ) : (
                <>
                  <section style={bloc}>
                    <p className="eyebrow">
                      01 — LIVRAISON
                    </p>

                    <h2>Votre salon</h2>

                    <p>
                      <strong>{salon.nom_salon}</strong>
                    </p>

                    <p>{salon.adresse}</p>

                    <p>
                      {salon.code_postal}{" "}
                      {salon.ville}
                    </p>

                    <p>{salon.telephone}</p>
                    <p>{salon.email}</p>

                    <small style={{ color: "#aaa" }}>
                      Ces coordonnées proviennent
                      de votre compte professionnel.
                    </small>
                  </section>

                  <section style={bloc}>
                    <p className="eyebrow">
                      02 — VOTRE SÉLECTION
                    </p>

                    <h2>Récapitulatif</h2>

                    {items.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: 20,
                          borderBottom:
                            `1px solid ${border}`,
                          padding: "16px 0",
                        }}
                      >
                        <div>
                          <strong>
                            {item.productName}
                          </strong>

                          {item.variantName && (
                            <p
                              style={{
                                color: gold,
                              }}
                            >
                              {item.variantName}
                            </p>
                          )}

                          <small>
                            Quantité :{" "}
                            {item.quantity}
                          </small>
                        </div>

                        <strong>
                          {euros(
                            item.priceCents *
                              item.quantity
                          )}
                        </strong>
                      </div>
                    ))}

                    <p style={{ marginTop: 25 }}>
                      {totalQuantity} articles
                    </p>

                    <div
                      style={{
                        borderTop:
                          `1px solid ${border}`,
                        marginTop: 20,
                        paddingTop: 20,
                      }}
                    >
                      <p>
                        Total produits HT :{" "}
                        <strong>
                          {euros(
                            Math.round(totalHT)
                          )}
                        </strong>
                      </p>

                      <p>
                        Total produits TTC :{" "}
                        <strong>
                          {euros(totalCents)}
                        </strong>
                      </p>

                      <div
                        style={{
                          padding: 20,
                          margin: "25px 0",
                          border:
                            `1px solid ${border}`,
                          background: "#100f0d",
                        }}
                      >
                        {francoAtteint ? (
                          <p
                            style={{
                              color: "#8ed3a2",
                              fontWeight: 700,
                            }}
                          >
                            ✓ Livraison offerte !
                          </p>
                        ) : (
                          <p
                            style={{
                              color: gold,
                              fontWeight: 700,
                              lineHeight: 1.7,
                            }}
                          >
                            Plus que{" "}
                            {euros(resteTTC)} TTC
                            pour la livraison offerte !
                          </p>
                        )}

                        <div
                          style={{
                            height: 10,
                            background: "#383126",
                            borderRadius: 20,
                            overflow: "hidden",
                            margin: "18px 0 10px",
                          }}
                        >
                          <div
                            style={{
                              width:
                                `${progression}%`,
                              height: "100%",
                              background:
                                francoAtteint
                                  ? "#8ed3a2"
                                  : gold,
                              borderRadius: 20,
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: 12,
                            color: "#aaa",
                            fontSize: 12,
                          }}
                        >
                          <span>
                            {euros(
                              Math.round(totalHT)
                            )}{" "}
                            HT
                          </span>
                          <span>
                            500 € HT
                          </span>
                        </div>

                        <p
                          style={{
                            color: "#aaa",
                            fontSize: 12,
                            lineHeight: 1.7,
                            marginBottom: 0,
                          }}
                        >
                          Franco de port :
                          500 € HT,
                          soit 600 € TTC.
                        </p>
                      </div>

                      <p>
                        Livraison :{" "}
                        <strong
                          style={{
                            color: francoAtteint
                              ? "#8ed3a2"
                              : cream,
                          }}
                        >
                          {francoAtteint
                            ? "Offerte"
                            : "14,40 € TTC (12 € HT)"}
                        </strong>
                      </p>

                      <h2
                        style={{
                          color: gold,
                          marginTop: 25,
                        }}
                      >
                        Total TTC :{" "}
                        {euros(
                          totalAvecLivraison
                        )}
                      </h2>
                    </div>

                    <small
                      style={{ color: "#aaa" }}
                    >
                      Le montant définitif
                      sera recalculé par le serveur
                      lors de la commande.
                    </small>
                  </section>

                  <section style={bloc}>
                    <p className="eyebrow">
                      03 — VOS DEMANDES
                    </p>

                    <h2>
                      Un besoin particulier ?
                    </h2>

                    <label htmlFor="demande-produit">
                      Un produit manque
                      à notre catalogue ?
                    </label>

                    <textarea
                      id="demande-produit"
                      value={demande}
                      onChange={(e) =>
                        setDemande(
                          e.target.value
                        )
                      }
                      placeholder={
                        "Marque, référence, " +
                        "quantité souhaitée..."
                      }
                      rows={4}
                      maxLength={2000}
                      style={champ}
                    />

                    <label htmlFor="commentaire">
                      Commentaire sur
                      votre commande
                    </label>

                    <textarea
                      id="commentaire"
                      value={commentaire}
                      onChange={(e) =>
                        setCommentaire(
                          e.target.value
                        )
                      }
                      placeholder={
                        "Précisions pour " +
                        "votre livraison..."
                      }
                      rows={4}
                      maxLength={2000}
                      style={champ}
                    />
                  </section>

                  <section style={bloc}>
                    <p className="eyebrow">
                      04 — VALIDATION
                    </p>

                    <h2>Votre commande</h2>

                    <p>
                      Total TTC :{" "}
                      <strong>
                        {euros(
                          totalAvecLivraison
                        )}
                      </strong>
                    </p>

                    <p>
                      Acompte de 50 % :{" "}
                      <strong
                        style={{ color: gold }}
                      >
                        {euros(acompteCents)}
                      </strong>
                    </p>

                    <p>
                      Solde à la livraison :{" "}
                      <strong>
                        {euros(soldeCents)}
                      </strong>
                    </p>

                    <p
                      style={{
                        color: "#aaa",
                        fontSize: 13,
                        lineHeight: 1.7,
                        margin: "25px 0",
                      }}
                    >
                      En confirmant, votre
                      commande sera enregistrée
                      avec le statut
                      « En attente d'acompte ».
                      Aucun paiement ne sera
                      prélevé à cette étape.
                    </p>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        margin: "22px 0",
                        color: "#ccc",
                        fontSize: 13,
                        lineHeight: 1.6,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={cgvAcceptees}
                        onChange={(e) => setCgvAcceptees(e.target.checked)}
                        style={{ marginTop: 4 }}
                      />
                      <span>
                        J'ai lu et j'accepte les{" "}
                        <Link
                          href="/cgv"
                          target="_blank"
                          style={{ color: gold }}
                        >
                          Conditions Générales de Vente
                        </Link>.
                      </span>
                    </label>

                    {erreur && (
                      <div
                        role="alert"
                        style={{
                          padding: 16,
                          marginBottom: 20,
                          color: "#ffaaaa",
                          background: "#351b1b",
                          border:
                            "1px solid #a44",
                        }}
                      >
                        {erreur}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={envoi}
                      onClick={
                        confirmerCommande
                      }
                      style={{
                        display: "block",
                        width: "100%",
                        padding: 19,
                        background: envoi
                          ? "#554a31"
                          : gold,
                        color: envoi
                          ? "#ddd"
                          : "#080808",
                        border: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 1,
                        cursor: envoi
                          ? "wait"
                          : "pointer",
                      }}
                    >
                      {envoi
                        ? "ENREGISTREMENT EN COURS…"
                        : "CONFIRMER MA COMMANDE"}
                    </button>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

const boutonOr = {
  display: "inline-block" as const,
  padding: "16px 25px",
  background: gold,
  color: "#080808",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 700,
};

const boutonContour = {
  display: "inline-block" as const,
  padding: "15px 24px",
  border: `1px solid ${gold}`,
  color: gold,
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 700,
};
