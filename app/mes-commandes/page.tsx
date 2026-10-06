
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCart, type NewCartItem } from "../CartContext";

const gold = "#c8a75b";
const cream = "#f4efe4";
const border = "#40351f";

type LigneCommande = {
  productId: string | null;
  variantId: string | null;
  nomProduit: string;
  nomVariante: string | null;
  quantite: number;
  prixUnitaireCents: number;
  totalLigneCents: number;
};

type Commande = {
  id: string;
  numero: string;
  date: string;
  statut: string;
  totalTtcCents: number;
  acompteCents: number;
  acomptePayeCents: number;
  soldeCents: number;
  commentaire: string | null;
  demande: string | null;
  articles: LigneCommande[];
};

type ProduitActuel = {
  id: string;
  nom: string;
  prix_ttc_cents: number;
  image_url: string | null;
  actif: boolean;
};

type VarianteActuelle = {
  id: string;
  product_id: string;
  nom: string;
  image_url: string | null;
  actif: boolean;
};

function euros(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function dateFr(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function libelleStatut(statut: string) {
  const statuts: Record<string, string> = {
    en_attente_acompte: "En attente d'acompte",
    acompte_paye: "Acompte payé",
    en_preparation: "En préparation",
    prete: "Prête",
    livree: "Livrée",
    annulee: "Annulée",
  };

  return statuts[statut] ?? statut;
}

export default function MesCommandesPage() {
  const router = useRouter();
  const { items, ready, addItems } = useCart();

  const [chargement, setChargement] = useState(true);
  const [connecte, setConnecte] = useState(false);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [recommandeEnCours, setRecommandeEnCours] =
    useState<string | null>(null);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let actif = true;

    async function charger() {
      try {
        const { data: auth, error: erreurAuth } =
          await supabase.auth.getUser();

        if (erreurAuth) throw erreurAuth;
        if (!actif) return;

        if (!auth.user) {
          setConnecte(false);
          return;
        }

        setConnecte(true);

        // Cette fonction ne renvoie que les commandes
        // du salon auquel appartient l'utilisateur.
        const { data, error } =
          await supabase.rpc("mes_commandes");

        if (error) throw error;
        if (!actif) return;

        setCommandes(
          Array.isArray(data) ? (data as Commande[]) : []
        );
      } catch (e) {
        if (actif) {
          setErreur(
            e instanceof Error
              ? e.message
              : "Impossible de charger vos commandes."
          );
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();

    return () => {
      actif = false;
    };
  }, []);

  async function recommander(commande: Commande) {
    if (!ready || recommandeEnCours) return;

    setErreur("");
    setMessage("");
    setRecommandeEnCours(commande.id);

    try {
      const ids = [
        ...new Set(
          commande.articles
            .map((article) => article.productId)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      if (ids.length === 0) {
        throw new Error(
          "Les produits de cette commande ne sont plus disponibles."
        );
      }

      // On récupère les prix et les disponibilités
      // actuels, jamais ceux de l'ancienne commande.
      const { data: produits, error: erreurProduits } =
        await supabase
          .from("products")
          .select(
            "id,nom,prix_ttc_cents,image_url,actif"
          )
          .in("id", ids);

      if (erreurProduits) throw erreurProduits;

      const idsVariantes = [
        ...new Set(
          commande.articles
            .map((article) => article.variantId)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      let variantes: VarianteActuelle[] = [];

      if (idsVariantes.length > 0) {
        const { data, error } = await supabase
          .from("product_variants")
          .select(
            "id,product_id,nom,image_url,actif"
          )
          .in("id", idsVariantes);

        if (error) throw error;
        variantes = (data ?? []) as VarianteActuelle[];
      }

      const catalogue = new Map(
        ((produits ?? []) as ProduitActuel[]).map(
          (produit) => [produit.id, produit]
        )
      );

      const couleurs = new Map(
        variantes.map((variante) => [
          variante.id,
          variante,
        ])
      );

      const nouveauxArticles: NewCartItem[] = [];
      const indisponibles: string[] = [];

      for (const article of commande.articles) {
        const produit = article.productId
          ? catalogue.get(article.productId)
          : undefined;

        if (
          !produit ||
          !produit.actif ||
          !Number.isInteger(produit.prix_ttc_cents) ||
          produit.prix_ttc_cents < 0
        ) {
          indisponibles.push(article.nomProduit);
          continue;
        }

        let variante: VarianteActuelle | undefined;

        if (article.variantId) {
          variante = couleurs.get(article.variantId);

          if (
            !variante ||
            !variante.actif ||
            variante.product_id !== produit.id
          ) {
            indisponibles.push(
              article.nomProduit +
                (article.nomVariante
                  ? ` — ${article.nomVariante}`
                  : "")
            );
            continue;
          }
        }

        if (
          !Number.isInteger(article.quantite) ||
          article.quantite <= 0
        ) {
          continue;
        }

        nouveauxArticles.push({
          productId: produit.id,
          productName: produit.nom,
          variantId: variante?.id ?? null,
          variantName: variante?.nom ?? null,
          imageUrl:
            variante?.image_url ||
            produit.image_url ||
            null,
          priceCents: produit.prix_ttc_cents,
          quantity: article.quantite,
        });
      }

      if (nouveauxArticles.length === 0) {
        throw new Error(
          "Aucune référence de cette commande " +
          "n'est actuellement disponible."
        );
      }

      if (indisponibles.length > 0) {
        const continuer = window.confirm(
          "Certaines références ne sont plus disponibles :\n\n" +
            indisponibles.join("\n") +
            "\n\nVoulez-vous ajouter les autres produits au panier ?"
        );

        if (!continuer) return;
      }

      if (items.length > 0) {
        const continuer = window.confirm(
          "Votre panier contient déjà des produits.\n\n" +
            "Les articles de cette ancienne commande " +
            "seront ajoutés à votre panier actuel. " +
            "Les quantités identiques seront additionnées.\n\n" +
            "Continuer ?"
        );

        if (!continuer) return;
      }

      addItems(nouveauxArticles);
      router.push("/panier");
    } catch (e) {
      setErreur(
        e instanceof Error
          ? e.message
          : "Impossible de préparer cette commande."
      );
    } finally {
      setRecommandeEnCours(null);
    }
  }

  return (
    <main className="productPage">
      <section className="content productContent">
        <header>
          <span>BLACK CROWN SUPPLY</span>
          <div>Votre espace professionnel</div>
        </header>

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "45px 25px 100px",
          }}
        >
          <p className="eyebrow">ESPACE PROFESSIONNEL</p>

          <h1
            style={{
              fontSize: "clamp(36px,5vw,60px)",
              margin: "12px 0",
            }}
          >
            Mes commandes
          </h1>

          <p
            style={{
              color: "#aaa",
              marginBottom: 35,
              lineHeight: 1.7,
            }}
          >
            Retrouvez vos commandes et renouvelez
            vos achats en quelques clics.
          </p>

          {chargement ? (
            <p style={{ color: "#aaa" }}>
              Chargement de votre espace…
            </p>
          ) : !connecte ? (
            <section style={blocCentre}>
              <div style={couronne}>♛</div>

              <h2>Votre espace vous attend</h2>

              <p style={texteSecondaire}>
                Connectez-vous à votre compte
                professionnel pour retrouver
                vos commandes.
              </p>

              <Link href="/connexion" style={boutonOr}>
                ME CONNECTER →
              </Link>
            </section>
          ) : erreur && commandes.length === 0 ? (
            <section style={blocCentre}>
              <h2>Impossible de charger vos commandes</h2>
              <p style={{ color: "#ffaaaa" }}>
                {erreur}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={boutonOr}
              >
                RÉESSAYER
              </button>
            </section>
          ) : commandes.length === 0 ? (
            <section style={blocCentre}>
              <div style={couronne}>♛</div>

              <p className="eyebrow">
                VOTRE PREMIÈRE COMMANDE
              </p>

              <h2
                style={{
                  fontFamily: "Georgia,serif",
                  fontSize: "clamp(28px,4vw,42px)",
                  fontWeight: 400,
                  color: cream,
                }}
              >
                Votre histoire avec
                Black Crown commence ici.
              </h2>

              <p
                style={{
                  ...texteSecondaire,
                  maxWidth: 520,
                  margin: "15px auto 30px",
                }}
              >
                Votre première commande n'attend
                plus que vous ! Nous avons hâte
                de voir cette page se remplir
                de vos prochaines commandes.
              </p>

              <Link href="/#meches" style={boutonOr}>
                DÉCOUVRIR NOTRE CATALOGUE →
              </Link>
            </section>
          ) : (
            <>
              {erreur && (
                <p role="alert" style={{ color: "#ffaaaa" }}>
                  {erreur}
                </p>
              )}

              {message && (
                <p style={{ color: "#90d6a2" }}>
                  {message}
                </p>
              )}

              <p
                style={{
                  color: "#aaa",
                  fontSize: 13,
                  marginBottom: 22,
                }}
              >
                {commandes.length} commande
                {commandes.length > 1 ? "s" : ""}
              </p>

              {commandes.map((commande) => {
                const detailOuvert =
                  ouverte === commande.id;

                const nombreArticles =
                  commande.articles.reduce(
                    (total, article) =>
                      total + article.quantite,
                    0
                  );

                return (
                  <article
                    key={commande.id}
                    style={{
                      background: "#171512",
                      border: `1px solid ${border}`,
                      padding: 26,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 20,
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: gold,
                            fontSize: 13,
                            fontWeight: 700,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {commande.numero}
                        </p>

                        <h2
                          style={{
                            fontFamily: "Georgia,serif",
                            fontWeight: 400,
                            fontSize: 25,
                          }}
                        >
                          {dateFr(commande.date)}
                        </h2>

                        <p
                          style={{
                            color: "#aaa",
                            fontSize: 13,
                          }}
                        >
                          {commande.articles.length} référence
                          {commande.articles.length > 1
                            ? "s"
                            : ""}{" "}
                          · {nombreArticles} article
                          {nombreArticles > 1 ? "s" : ""}
                        </p>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "8px 12px",
                            border: `1px solid ${gold}`,
                            color: gold,
                            fontSize: 11,
                          }}
                        >
                          {libelleStatut(commande.statut)}
                        </span>

                        <h2
                          style={{
                            color: gold,
                            fontSize: 28,
                            marginTop: 18,
                          }}
                        >
                          {euros(commande.totalTtcCents)}
                        </h2>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        marginTop: 22,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          recommander(commande)
                        }
                        disabled={
                          !ready ||
                          recommandeEnCours !== null
                        }
                        style={{
                          ...boutonOr,
                          cursor: "pointer",
                          opacity:
                            recommandeEnCours !== null
                              ? 0.6
                              : 1,
                        }}
                      >
                        {recommandeEnCours === commande.id
                          ? "PRÉPARATION…"
                          : "RECOMMANDER →"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setOuverte(
                            detailOuvert
                              ? null
                              : commande.id
                          )
                        }
                        style={{
                          padding: "14px 22px",
                          background: "transparent",
                          color: cream,
                          border: `1px solid ${border}`,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {detailOuvert
                          ? "MASQUER LE DÉTAIL"
                          : "VOIR LE DÉTAIL"}
                      </button>
                    </div>

                    {detailOuvert && (
                      <div
                        style={{
                          marginTop: 28,
                          borderTop: `1px solid ${border}`,
                          paddingTop: 20,
                        }}
                      >
                        <h3>Articles commandés</h3>

                        {commande.articles.map(
                          (article, index) => (
                            <div
                              key={`${commande.id}-${index}`}
                              style={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                gap: 20,
                                padding: "15px 0",
                                borderBottom:
                                  `1px solid ${border}`,
                              }}
                            >
                              <div>
                                <strong>
                                  {article.nomProduit}
                                </strong>

                                {article.nomVariante && (
                                  <p
                                    style={{
                                      color: gold,
                                      fontSize: 13,
                                    }}
                                  >
                                    Couleur / variante :{" "}
                                    <strong>
                                      {article.nomVariante}
                                    </strong>
                                  </p>
                                )}

                                <small
                                  style={{
                                    color: "#aaa",
                                  }}
                                >
                                  {article.quantite} ×{" "}
                                  {euros(
                                    article.prixUnitaireCents
                                  )}
                                </small>
                              </div>

                              <strong>
                                {euros(
                                  article.totalLigneCents
                                )}
                              </strong>
                            </div>
                          )
                        )}

                        <div
                          style={{
                            marginTop: 24,
                            color: "#ccc",
                            lineHeight: 1.9,
                          }}
                        >
                          <p>
                            Total TTC :{" "}
                            <strong>
                              {euros(
                                commande.totalTtcCents
                              )}
                            </strong>
                          </p>

                          <p>
                            Acompte prévu :{" "}
                            {euros(
                              commande.acompteCents
                            )}
                          </p>

                          <p>
                            Acompte payé :{" "}
                            {euros(
                              commande.acomptePayeCents
                            )}
                          </p>

                          <p>
                            Solde prévu à la livraison :{" "}
                            {euros(
                              commande.soldeCents
                            )}
                          </p>
                        </div>

                        {commande.commentaire && (
                          <div style={{ marginTop: 22 }}>
                            <strong>
                              Commentaire
                            </strong>
                            <p style={texteSecondaire}>
                              {commande.commentaire}
                            </p>
                          </div>
                        )}

                        {commande.demande && (
                          <div style={{ marginTop: 22 }}>
                            <strong>
                              Produit demandé
                            </strong>
                            <p style={texteSecondaire}>
                              {commande.demande}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

const blocCentre = {
  padding: "65px 25px",
  marginTop: 35,
  textAlign: "center" as const,
  background: "#171512",
  border: `1px solid ${border}`,
};

const couronne = {
  color: gold,
  fontSize: 55,
  marginBottom: 20,
};

const texteSecondaire = {
  color: "#aaa",
  lineHeight: 1.8,
  fontSize: 14,
};

const boutonOr = {
  display: "inline-block" as const,
  padding: "14px 22px",
  background: gold,
  color: "#080808",
  border: 0,
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.5,
};
