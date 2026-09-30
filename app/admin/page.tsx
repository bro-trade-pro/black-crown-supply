
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const GOLD = "#c8a75b";
const CREAM = "#f4efe4";
const BORDER = "#40351f";

type Article = {
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
  salonId: string;
  nomSalon: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  totalTtcCents: number;
  acompteCents: number;
  acomptePayeCents: number;
  soldeCents: number;
  commentaire: string | null;
  demande: string | null;
  articles: Article[];
};

const STATUTS: Record<string, string> = {
  en_attente_acompte: "En attente d'acompte",
  acompte_paye: "Acompte payé",
  en_preparation: "En préparation",
  prete: "Prête",
  livree: "Livrée",
  annulee: "Annulée",
};

function euros(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function dateFr(date: string) {
  return new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [chargement, setChargement] = useState(true);
  const [autorise, setAutorise] = useState(false);
  const [erreur, setErreur] = useState("");
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [ouverte, setOuverte] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      try {
        const { data: auth, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        if (!auth.user) {
          setErreur(
            "Connectez-vous avec votre compte administrateur."
          );
          return;
        }

        const { data: estAdmin, error: roleError } =
          await supabase.rpc("est_admin");

        if (roleError) throw roleError;

        if (!estAdmin) {
          setErreur(
            "Accès non autorisé. " +
            "Cette page est réservée aux administrateurs."
          );
          return;
        }

        if (!actif) return;
        setAutorise(true);

        const { data, error } =
          await supabase.rpc("admin_commandes");

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
              : "Impossible de charger l'administration."
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

  const commandesFiltrees = useMemo(() => {
    const texte = recherche.trim().toLowerCase();

    return commandes.filter((commande) => {
      const correspondStatut =
        filtre === "tous" || commande.statut === filtre;

      const correspondRecherche =
        !texte ||
        [
          commande.numero,
          commande.nomSalon,
          commande.ville,
          commande.email,
        ].some((valeur) =>
          (valeur ?? "").toLowerCase().includes(texte)
        );

      return correspondStatut && correspondRecherche;
    });
  }, [commandes, recherche, filtre]);

  const chiffres = useMemo(() => {
    return {
      total: commandes.length,
      attente: commandes.filter(
        (c) => c.statut === "en_attente_acompte"
      ).length,
      preparation: commandes.filter(
        (c) => c.statut === "en_preparation"
      ).length,
      chiffreAffaires: commandes
        .filter((c) => c.statut !== "annulee")
        .reduce((somme, c) => somme + c.totalTtcCents, 0),
    };
  }, [commandes]);

  return (
    <main className="productPage">
      <section className="content productContent">
        <div
          style={{
            maxWidth: 1250,
            margin: "0 auto",
            padding: "45px 25px 100px",
          }}
        >
          <p className="eyebrow">
            BLACK CROWN SUPPLY · ADMINISTRATION
          </p>

          <h1
            style={{
              fontSize: "clamp(35px,5vw,56px)",
              margin: "12px 0 30px",
            }}
          >
            Gestion des commandes
          </h1>

          {chargement ? (
            <p style={{ color: "#aaa" }}>
              Vérification de votre accès…
            </p>
          ) : erreur ? (
            <section style={bloc}>
              <h2>Accès administrateur</h2>

              <p style={{ color: "#ffaaaa" }}>
                {erreur}
              </p>

              <a
                href="/connexion"
                style={{ color: GOLD }}
              >
                Se connecter →
              </a>
            </section>
          ) : autorise ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(180px,1fr))",
                  gap: 15,
                  marginBottom: 35,
                }}
              >
                <CarteStat
                  titre="COMMANDES"
                  valeur={String(chiffres.total)}
                />

                <CarteStat
                  titre="EN ATTENTE D'ACOMPTE"
                  valeur={String(chiffres.attente)}
                />

                <CarteStat
                  titre="EN PRÉPARATION"
                  valeur={String(chiffres.preparation)}
                />

                <CarteStat
                  titre="COMMANDES NON ANNULÉES TTC"
                  valeur={euros(chiffres.chiffreAffaires)}
                />
              </div>

              <div
                style={{
                  ...bloc,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 15,
                  marginBottom: 25,
                }}
              >
                <input
                  type="search"
                  aria-label="Rechercher une commande"
                  placeholder={
                    "Salon, numéro, ville ou email..."
                  }
                  value={recherche}
                  onChange={(e) =>
                    setRecherche(e.target.value)
                  }
                  style={{
                    ...champ,
                    flex: "2 1 260px",
                  }}
                />

                <select
                  aria-label="Filtrer par statut"
                  value={filtre}
                  onChange={(e) =>
                    setFiltre(e.target.value)
                  }
                  style={{
                    ...champ,
                    flex: "1 1 200px",
                  }}
                >
                  <option value="tous">
                    Tous les statuts
                  </option>

                  {Object.entries(STATUTS).map(
                    ([valeur, libelle]) => (
                      <option
                        key={valeur}
                        value={valeur}
                      >
                        {libelle}
                      </option>
                    )
                  )}
                </select>
              </div>

              <p
                style={{
                  color: "#aaa",
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                {commandesFiltrees.length} commande
                {commandesFiltrees.length > 1 ? "s" : ""}
                {" "}affichée
                {commandesFiltrees.length > 1 ? "s" : ""}
              </p>

              {commandesFiltrees.length === 0 ? (
                <section style={bloc}>
                  <p style={{ color: "#aaa" }}>
                    Aucune commande ne correspond
                    à votre recherche.
                  </p>
                </section>
              ) : (
                commandesFiltrees.map((commande) => {
                  const detailOuvert =
                    ouverte === commande.id;

                  const quantiteTotale =
                    commande.articles.reduce(
                      (somme, article) =>
                        somme + article.quantite,
                      0
                    );

                  return (
                    <article
                      key={commande.id}
                      style={{
                        ...bloc,
                        marginBottom: 18,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          flexWrap: "wrap",
                          gap: 20,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              color: GOLD,
                              fontWeight: 700,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {commande.numero}
                          </p>

                          <h2
                            style={{
                              fontFamily:
                                "Georgia,serif",
                              fontWeight: 400,
                              fontSize: 27,
                              margin: "8px 0",
                            }}
                          >
                            {commande.nomSalon}
                          </h2>

                          <p
                            style={{
                              color: "#aaa",
                              fontSize: 13,
                            }}
                          >
                            {dateFr(commande.date)}
                          </p>

                          <p
                            style={{
                              color: "#aaa",
                              fontSize: 13,
                            }}
                          >
                            {commande.articles.length}
                            {" "}références ·{" "}
                            {quantiteTotale} articles
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
                              border:
                                `1px solid ${GOLD}`,
                              color: GOLD,
                              padding: "8px 12px",
                              fontSize: 12,
                            }}
                          >
                            {STATUTS[commande.statut] ??
                              commande.statut}
                          </span>

                          <h2
                            style={{
                              color: GOLD,
                              fontSize: 29,
                              margin: "18px 0",
                            }}
                          >
                            {euros(
                              commande.totalTtcCents
                            )}
                          </h2>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setOuverte(
                            detailOuvert
                              ? null
                              : commande.id
                          )
                        }
                        style={bouton}
                      >
                        {detailOuvert
                          ? "MASQUER LE DÉTAIL"
                          : "VOIR LA COMMANDE →"}
                      </button>

                      {detailOuvert && (
                        <div
                          style={{
                            borderTop:
                              `1px solid ${BORDER}`,
                            marginTop: 25,
                            paddingTop: 25,
                          }}
                        >
                          <h3>Coordonnées du salon</h3>

                          <p>
                            {commande.nomSalon}
                            <br />
                            {commande.adresse}
                            <br />
                            {commande.codePostal}{" "}
                            {commande.ville}
                          </p>

                          <p>
                            Téléphone :{" "}
                            <a
                              href={
                                "tel:" +
                                commande.telephone
                              }
                              style={{ color: GOLD }}
                            >
                              {commande.telephone}
                            </a>
                          </p>

                          <p>
                            Email :{" "}
                            <a
                              href={
                                "mailto:" +
                                commande.email
                              }
                              style={{ color: GOLD }}
                            >
                              {commande.email}
                            </a>
                          </p>

                          <h3
                            style={{
                              marginTop: 35,
                            }}
                          >
                            Produits commandés
                          </h3>

                          {commande.articles.map(
                            (article, index) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  justifyContent:
                                    "space-between",
                                  gap: 20,
                                  borderBottom:
                                    `1px solid ${BORDER}`,
                                  padding: "15px 0",
                                }}
                              >
                                <div>
                                  <strong>
                                    {article.nomProduit}
                                  </strong>

                                  {article.nomVariante && (
                                    <p
                                      style={{
                                        color: GOLD,
                                      }}
                                    >
                                      {article.nomVariante}
                                    </p>
                                  )}

                                  <small
                                    style={{
                                      color: "#aaa",
                                    }}
                                  >
                                    {article.quantite}
                                    {" "}×{" "}
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
                              marginTop: 30,
                              padding: 20,
                              background: "#100f0d",
                              border:
                                `1px solid ${BORDER}`,
                              lineHeight: 2,
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
                              Acompte attendu :{" "}
                              {euros(
                                commande.acompteCents
                              )}
                            </p>

                            <p>
                              Acompte encaissé :{" "}
                              {euros(
                                commande.acomptePayeCents
                              )}
                            </p>

                            <p>
                              Solde prévu :{" "}
                              {euros(
                                commande.soldeCents
                              )}
                            </p>
                          </div>

                          {commande.commentaire && (
                            <div
                              style={{
                                marginTop: 25,
                              }}
                            >
                              <h3>
                                Commentaire client
                              </h3>

                              <p
                                style={{
                                  whiteSpace:
                                    "pre-wrap",
                                  }}
                              >
                                {commande.commentaire}
                              </p>
                            </div>
                          )}

                          {commande.demande && (
                            <div
                              style={{
                                marginTop: 25,
                              }}
                            >
                              <h3>
                                Demande de produit
                              </h3>

                              <p
                                style={{
                                  whiteSpace:
                                    "pre-wrap",
                                }}
                              >
                                {commande.demande}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function CarteStat({
  titre,
  valeur,
}: {
  titre: string;
  valeur: string;
}) {
  return (
    <div style={bloc}>
      <p
        style={{
          color: "#aaa",
          fontSize: 11,
          letterSpacing: 1,
          lineHeight: 1.6,
        }}
      >
        {titre}
      </p>

      <h2
        style={{
          color: GOLD,
          fontSize: 28,
          overflowWrap: "anywhere",
        }}
      >
        {valeur}
      </h2>
    </div>
  );
}

const bloc = {
  padding: 25,
  background: "#171512",
  border: `1px solid ${BORDER}`,
};

const champ = {
  padding: 14,
  background: "#100f0d",
  color: CREAM,
  border: `1px solid ${BORDER}`,
  fontSize: 14,
  minWidth: 0,
};

const bouton = {
  display: "inline-block",
  padding: "14px 22px",
  background: GOLD,
  color: "#080808",
  border: 0,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};
