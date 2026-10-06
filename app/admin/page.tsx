
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type Historique = {
  id: string;
  date: string;
  action: string;
  ancienStatut: string;
  nouveauStatut: string;
  admin: string;
};

type Suivi = {
  orderId: string;
  acompteEncaisseCents: number;
  soldeEncaisseCents: number;
  historique: Historique[];
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

function nomAction(action: string) {
  const noms: Record<string, string> = {
    acompte_encaisse: "Acompte encaissé",
    solde_encaisse: "Solde encaissé",
    changement_statut: "Changement de statut",
  };

  return noms[action] ?? action;
}

export default function AdminPage() {
  const [chargement, setChargement] = useState(true);
  const [autorise, setAutorise] = useState(false);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [suivis, setSuivis] = useState<Suivi[]>([]);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [actionEnCours, setActionEnCours] = useState<string | null>(
    null
  );

  const chargerDonnees = useCallback(async () => {
    const [resultatCommandes, resultatSuivis] =
      await Promise.all([
        supabase.rpc("admin_commandes"),
        supabase.rpc("admin_suivi_commandes"),
      ]);

    if (resultatCommandes.error) {
      throw resultatCommandes.error;
    }

    if (resultatSuivis.error) {
      throw resultatSuivis.error;
    }

    setCommandes(
      Array.isArray(resultatCommandes.data)
        ? (resultatCommandes.data as Commande[])
        : []
    );

    setSuivis(
      Array.isArray(resultatSuivis.data)
        ? (resultatSuivis.data as Suivi[])
        : []
    );
  }, []);

  useEffect(() => {
    let actif = true;

    async function initialiser() {
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
            "Accès non autorisé. Cette page est réservée " +
            "aux administrateurs."
          );
          return;
        }

        if (!actif) return;

        setAutorise(true);
        await chargerDonnees();
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

    initialiser();

    return () => {
      actif = false;
    };
  }, [chargerDonnees]);

  const suiviParCommande = useMemo(
    () =>
      new Map(
        suivis.map((suivi) => [suivi.orderId, suivi])
      ),
    [suivis]
  );

  const commandesFiltrees = useMemo(() => {
    const texte = recherche.trim().toLowerCase();

    return commandes.filter((commande) => {
      const statutOK =
        filtre === "tous" || commande.statut === filtre;

      const rechercheOK =
        !texte ||
        [
          commande.numero,
          commande.nomSalon,
          commande.ville,
          commande.email,
        ].some((valeur) =>
          (valeur ?? "").toLowerCase().includes(texte)
        );

      return statutOK && rechercheOK;
    });
  }, [commandes, recherche, filtre]);

  const statistiques = useMemo(() => {
    const valides = commandes.filter(
      (c) => c.statut !== "annulee"
    );

    const totalCommandes = valides.reduce(
      (total, c) => total + c.totalTtcCents,
      0
    );

    const totalEncaisse = valides.reduce(
      (total, c) => {
        const suivi = suiviParCommande.get(c.id);

        return (
          total +
          (suivi?.acompteEncaisseCents ?? 0) +
          (suivi?.soldeEncaisseCents ?? 0)
        );
      },
      0
    );

    return {
      commandes: commandes.length,
      attente: commandes.filter(
        (c) => c.statut === "en_attente_acompte"
      ).length,
      preparation: commandes.filter(
        (c) => c.statut === "en_preparation"
      ).length,
      totalCommandes,
      totalEncaisse,
    };
  }, [commandes, suiviParCommande]);

  async function enregistrerPaiement(
    commande: Commande,
    type: "acompte" | "solde"
  ) {
    if (actionEnCours) return;

    const suivi = suiviParCommande.get(commande.id);

    const montant =
      type === "acompte"
        ? commande.acompteCents -
          (suivi?.acompteEncaisseCents ?? 0)
        : commande.soldeCents -
          (suivi?.soldeEncaisseCents ?? 0);

    if (montant <= 0) return;

    const libelle =
      type === "acompte" ? "l'acompte" : "le solde";

    const confirme = window.confirm(
      `COMMANDE ${commande.numero}\n\n` +
        `Confirmez-vous avoir réellement reçu ${libelle} ` +
        `de ${euros(montant)} ?\n\n` +
        "Cette action enregistrera le paiement " +
        "dans Supabase. Elle ne prélèvera pas le client."
    );

    if (!confirme) return;

    setActionEnCours(commande.id);
    setErreur("");
    setMessage("");

    try {
      const { error } = await supabase.rpc(
        "admin_enregistrer_paiement",
        {
          p_order_id: commande.id,
          p_type: type,
        }
      );

      if (error) throw error;

      await chargerDonnees();

      setMessage(
        `${commande.numero} : ${libelle} enregistré.`
      );
    } catch (e) {
      setErreur(
        e instanceof Error
          ? e.message
          : "Impossible d'enregistrer le paiement."
      );
    } finally {
      setActionEnCours(null);
    }
  }

  async function changerStatut(
    commande: Commande,
    nouveauStatut: string
  ) {
    if (actionEnCours) return;

    const confirme = window.confirm(
      `Commande ${commande.numero}\n\n` +
        `Passer de « ${STATUTS[commande.statut]} » ` +
        `à « ${STATUTS[nouveauStatut]} » ?`
    );

    if (!confirme) return;

    setActionEnCours(commande.id);
    setErreur("");
    setMessage("");

    try {
      const { error } = await supabase.rpc(
        "admin_changer_statut",
        {
          p_order_id: commande.id,
          p_nouveau_statut: nouveauStatut,
        }
      );

      if (error) throw error;

      await chargerDonnees();

      setMessage(
        `${commande.numero} : statut mis à jour.`
      );
    } catch (e) {
      setErreur(
        e instanceof Error
          ? e.message
          : "Impossible de modifier le statut."
      );
    } finally {
      setActionEnCours(null);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: CREAM,
        padding: "40px 22px 100px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={eyebrow}>
          BLACK CROWN SUPPLY · ADMINISTRATION
        </p>

        <h1
          style={{
            fontFamily: "Georgia,serif",
            fontSize: "clamp(34px,5vw,58px)",
            fontWeight: 400,
            margin: "15px 0 35px",
          }}
        >
          Gestion des commandes
        </h1>

        {chargement ? (
          <p>Vérification de votre accès…</p>
        ) : !autorise ? (
          <section style={bloc}>
            <h2>Accès administrateur</h2>
            <p role="alert" style={{ color: "#ffaaaa" }}>
              {erreur}
            </p>
            <a href="/connexion" style={{ color: GOLD }}>
              Se connecter →
            </a>
          </section>
        ) : (
          <>
            <div style={grilleStats}>
              <CarteStat
                titre="COMMANDES"
                valeur={String(statistiques.commandes)}
              />

              <CarteStat
                titre="EN ATTENTE D'ACOMPTE"
                valeur={String(statistiques.attente)}
              />

              <CarteStat
                titre="EN PRÉPARATION"
                valeur={String(statistiques.preparation)}
              />

              <CarteStat
                titre="COMMANDES NON ANNULÉES TTC"
                valeur={euros(statistiques.totalCommandes)}
              />

              <CarteStat
                titre="PAIEMENTS ENREGISTRÉS"
                valeur={euros(statistiques.totalEncaisse)}
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
                placeholder="Salon, numéro, ville ou email…"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                style={{ ...champ, flex: "2 1 260px" }}
              />

              <select
                aria-label="Filtrer par statut"
                value={filtre}
                onChange={(e) => setFiltre(e.target.value)}
                style={{ ...champ, flex: "1 1 200px" }}
              >
                <option value="tous">Tous les statuts</option>

                {Object.entries(STATUTS).map(
                  ([valeur, libelle]) => (
                    <option key={valeur} value={valeur}>
                      {libelle}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={async () => {
                  setErreur("");
                  setMessage("");

                  try {
                    await chargerDonnees();
                    setMessage("Données actualisées.");
                  } catch (e) {
                    setErreur(
                      e instanceof Error
                        ? e.message
                        : "Actualisation impossible."
                    );
                  }
                }}
                style={boutonContour}
              >
                ACTUALISER ↻
              </button>
            </div>

            {erreur && (
              <div role="alert" style={alerteErreur}>
                {erreur}
              </div>
            )}

            {message && (
              <div role="status" style={alerteSucces}>
                {message}
              </div>
            )}

            <p style={{ color: "#aaa", fontSize: 13 }}>
              {commandesFiltrees.length} commande
              {commandesFiltrees.length > 1 ? "s" : ""} affichée
              {commandesFiltrees.length > 1 ? "s" : ""}
            </p>

            {commandesFiltrees.length === 0 ? (
              <section style={bloc}>
                Aucune commande à afficher.
              </section>
            ) : (
              commandesFiltrees.map((commande) => {
                const detailOuvert =
                  ouverte === commande.id;

                const suivi =
                  suiviParCommande.get(commande.id);

                const acompteEncaisse =
                  suivi?.acompteEncaisseCents ?? 0;

                const soldeEncaisse =
                  suivi?.soldeEncaisseCents ?? 0;

                const resteAcompte = Math.max(
                  0,
                  commande.acompteCents - acompteEncaisse
                );

                const resteSolde = Math.max(
                  0,
                  commande.soldeCents - soldeEncaisse
                );

                const occupe =
                  actionEnCours !== null;

                const quantiteTotale =
                  commande.articles.reduce(
                    (total, article) =>
                      total + article.quantite,
                    0
                  );

                return (
                  <article
                    key={commande.id}
                    style={{
                      ...bloc,
                      marginTop: 18,
                    }}
                  >
                    <div style={enteteCommande}>
                      <div>
                        <strong
                          style={{
                            color: GOLD,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {commande.numero}
                        </strong>

                        <h2
                          style={{
                            fontFamily: "Georgia,serif",
                            fontWeight: 400,
                            fontSize: 27,
                            margin: "12px 0 8px",
                          }}
                        >
                          {commande.nomSalon}
                        </h2>

                        <p style={texteSecondaire}>
                          {dateFr(commande.date)}
                        </p>

                        <p style={texteSecondaire}>
                          {commande.articles.length} références ·{" "}
                          {quantiteTotale} articles
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span style={badgeStatut}>
                          {STATUTS[commande.statut] ??
                            commande.statut}
                        </span>

                        <h2
                          style={{
                            color: GOLD,
                            fontSize: 29,
                            marginTop: 20,
                          }}
                        >
                          {euros(commande.totalTtcCents)}
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
                      style={boutonOr}
                    >
                      {detailOuvert
                        ? "MASQUER LE DÉTAIL"
                        : "VOIR LA COMMANDE →"}
                    </button>

                    {detailOuvert && (
                      <div
                        style={{
                          borderTop: `1px solid ${BORDER}`,
                          marginTop: 28,
                          paddingTop: 25,
                        }}
                      >
                        <h3>Coordonnées du salon</h3>

                        <p style={{ lineHeight: 1.8 }}>
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
                            href={`tel:${commande.telephone}`}
                            style={{ color: GOLD }}
                          >
                            {commande.telephone}
                          </a>
                        </p>

                        <p>
                          Email :{" "}
                          <a
                            href={`mailto:${commande.email}`}
                            style={{ color: GOLD }}
                          >
                            {commande.email}
                          </a>
                        </p>

                        <h3 style={{ marginTop: 35 }}>
                          Articles commandés
                        </h3>

                        {commande.articles.map(
                          (article, index) => (
                            <div
                              key={index}
                              style={ligneArticle}
                            >
                              <div>
                                <strong>
                                  {article.nomProduit}
                                </strong>

                                {article.nomVariante && (
                                  <p style={{ color: GOLD }}>
                                    Couleur / variante :{" "}
                                    <strong>
                                      {article.nomVariante}
                                    </strong>
                                  </p>
                                )}

                                <small style={texteSecondaire}>
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

                        <section
                          style={{
                            ...bloc,
                            marginTop: 30,
                            background: "#100f0d",
                          }}
                        >
                          <h3>Suivi financier</h3>

                          <LigneMontant
                            libelle="Total commande TTC"
                            montant={commande.totalTtcCents}
                          />

                          <LigneMontant
                            libelle="Acompte attendu"
                            montant={commande.acompteCents}
                          />

                          <LigneMontant
                            libelle="Acompte encaissé"
                            montant={acompteEncaisse}
                          />

                          <LigneMontant
                            libelle="Solde attendu"
                            montant={commande.soldeCents}
                          />

                          <LigneMontant
                            libelle="Solde encaissé"
                            montant={soldeEncaisse}
                          />

                          <div
                            style={{
                              borderTop: `1px solid ${BORDER}`,
                              paddingTop: 15,
                              marginTop: 15,
                            }}
                          >
                            <LigneMontant
                              libelle="Reste à encaisser"
                              montant={
                                resteAcompte + resteSolde
                              }
                              couleur={GOLD}
                            />
                          </div>
                        </section>

                        <section
                          style={{
                            ...bloc,
                            marginTop: 25,
                          }}
                        >
                          <h3>Gestion de la commande</h3>

                          <p style={texteSecondaire}>
                            Chaque action est enregistrée
                            avec le compte administrateur
                            et la date.
                          </p>

                          <div style={groupeBoutons}>
                            {commande.statut ===
                              "en_attente_acompte" &&
                              resteAcompte > 0 && (
                                <button
                                  type="button"
                                  disabled={occupe}
                                  onClick={() =>
                                    enregistrerPaiement(
                                      commande,
                                      "acompte"
                                    )
                                  }
                                  style={boutonOr}
                                >
                                  CONFIRMER L'ACOMPTE REÇU
                                  {" · "}
                                  {euros(resteAcompte)}
                                </button>
                              )}

                            {commande.statut ===
                              "acompte_paye" && (
                                <button
                                  type="button"
                                  disabled={occupe}
                                  onClick={() =>
                                    changerStatut(
                                      commande,
                                      "en_preparation"
                                    )
                                  }
                                  style={boutonOr}
                                >
                                  COMMENCER LA PRÉPARATION
                                </button>
                              )}

                            {commande.statut ===
                              "en_preparation" && (
                                <button
                                  type="button"
                                  disabled={occupe}
                                  onClick={() =>
                                    changerStatut(
                                      commande,
                                      "prete"
                                    )
                                  }
                                  style={boutonOr}
                                >
                                  MARQUER COMME PRÊTE
                                </button>
                              )}

                            {commande.statut ===
                              "prete" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={occupe}
                                    onClick={() =>
                                      changerStatut(
                                        commande,
                                        "livree"
                                      )
                                    }
                                    style={boutonOr}
                                  >
                                    CONFIRMER LA LIVRAISON
                                  </button>

                                  <button
                                    type="button"
                                    disabled={occupe}
                                    onClick={() =>
                                      changerStatut(
                                        commande,
                                        "en_preparation"
                                      )
                                    }
                                    style={boutonContour}
                                  >
                                    RETOUR EN PRÉPARATION
                                  </button>
                                </>
                              )}

                            {commande.statut === "livree" &&
                              resteSolde > 0 && (
                                <button
                                  type="button"
                                  disabled={occupe}
                                  onClick={() =>
                                    enregistrerPaiement(
                                      commande,
                                      "solde"
                                    )
                                  }
                                  style={boutonOr}
                                >
                                  CONFIRMER LE SOLDE REÇU
                                  {" · "}
                                  {euros(resteSolde)}
                                </button>
                              )}

                            {commande.statut === "livree" &&
                              resteSolde === 0 && (
                                <p
                                  style={{
                                    color: "#8ed3a2",
                                    fontWeight: 700,
                                  }}
                                >
                                  ✓ Commande livrée et
                                  intégralement encaissée
                                </p>
                              )}

                            {commande.statut === "annulee" && (
                              <p style={texteSecondaire}>
                                Commande annulée.
                                Aucune autre action disponible.
                              </p>
                            )}
                          </div>

                          {commande.statut !== "livree" &&
                            commande.statut !== "annulee" && (
                              <div
                                style={{
                                  borderTop:
                                    `1px solid ${BORDER}`,
                                  marginTop: 25,
                                  paddingTop: 20,
                                }}
                              >
                                <button
                                  type="button"
                                  disabled={occupe}
                                  onClick={() =>
                                    changerStatut(
                                      commande,
                                      "annulee"
                                    )
                                  }
                                  style={{
                                    ...boutonContour,
                                    borderColor: "#a65d5d",
                                    color: "#e8a1a1",
                                  }}
                                >
                                  ANNULER LA COMMANDE
                                </button>

                                {acompteEncaisse > 0 && (
                                  <p
                                    style={{
                                      ...texteSecondaire,
                                      marginTop: 12,
                                    }}
                                  >
                                    Attention : un acompte
                                    a été enregistré.
                                    L'annulation ne rembourse
                                    pas automatiquement
                                    le client.
                                  </p>
                                )}
                              </div>
                            )}
                        </section>

                        {commande.commentaire && (
                          <section style={{ marginTop: 30 }}>
                            <h3>Commentaire client</h3>
                            <p
                              style={{
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {commande.commentaire}
                            </p>
                          </section>
                        )}

                        {commande.demande && (
                          <section style={{ marginTop: 30 }}>
                            <h3>Demande de produit</h3>
                            <p
                              style={{
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {commande.demande}
                            </p>
                          </section>
                        )}

                        <section
                          style={{
                            ...bloc,
                            marginTop: 30,
                          }}
                        >
                          <h3>Historique des actions</h3>

                          {!suivi ||
                          suivi.historique.length === 0 ? (
                            <p style={texteSecondaire}>
                              Aucune action administrateur
                              enregistrée pour le moment.
                            </p>
                          ) : (
                            suivi.historique.map(
                              (evenement) => (
                                <div
                                  key={evenement.id}
                                  style={{
                                    borderBottom:
                                      `1px solid ${BORDER}`,
                                    padding: "16px 0",
                                  }}
                                >
                                  <strong
                                    style={{ color: GOLD }}
                                  >
                                    {nomAction(
                                      evenement.action
                                    )}
                                  </strong>

                                  {evenement.ancienStatut !==
                                    evenement.nouveauStatut && (
                                    <p
                                      style={{
                                        ...texteSecondaire,
                                        margin: "8px 0",
                                      }}
                                    >
                                      {STATUTS[
                                        evenement.ancienStatut
                                      ] ??
                                        evenement.ancienStatut}
                                      {" → "}
                                      {STATUTS[
                                        evenement.nouveauStatut
                                      ] ??
                                        evenement.nouveauStatut}
                                    </p>
                                  )}

                                  <small
                                    style={texteSecondaire}
                                  >
                                    {evenement.admin}
                                    {" · "}
                                    {dateFr(
                                      evenement.date
                                    )}
                                  </small>
                                </div>
                              )
                            )
                          )}
                        </section>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </>
        )}
      </div>
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
      <p style={eyebrow}>{titre}</p>

      <h2
        style={{
          color: GOLD,
          fontSize: 27,
          overflowWrap: "anywhere",
          marginBottom: 0,
        }}
      >
        {valeur}
      </h2>
    </div>
  );
}

function LigneMontant({
  libelle,
  montant,
  couleur = CREAM,
}: {
  libelle: string;
  montant: number;
  couleur?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        padding: "8px 0",
      }}
    >
      <span style={{ color: "#bbb" }}>{libelle}</span>
      <strong style={{ color: couleur }}>
        {euros(montant)}
      </strong>
    </div>
  );
}

const eyebrow = {
  color: GOLD,
  fontSize: 11,
  letterSpacing: 2,
  lineHeight: 1.6,
};

const texteSecondaire = {
  color: "#aaa",
  fontSize: 13,
  lineHeight: 1.7,
};

const bloc = {
  padding: 25,
  background: "#171512",
  border: `1px solid ${BORDER}`,
};

const grilleStats = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(190px,1fr))",
  gap: 15,
  marginBottom: 35,
};

const champ = {
  padding: 14,
  background: "#100f0d",
  color: CREAM,
  border: `1px solid ${BORDER}`,
  fontSize: 14,
  minWidth: 0,
};

const enteteCommande = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap" as const,
  gap: 20,
};

const badgeStatut = {
  display: "inline-block",
  border: `1px solid ${GOLD}`,
  color: GOLD,
  padding: "8px 12px",
  fontSize: 12,
};

const ligneArticle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  padding: "15px 0",
  borderBottom: `1px solid ${BORDER}`,
};

const groupeBoutons = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 12,
  marginTop: 25,
};

const boutonOr = {
  padding: "14px 20px",
  background: GOLD,
  color: "#080808",
  border: 0,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};

const boutonContour = {
  padding: "13px 19px",
  background: "transparent",
  color: GOLD,
  border: `1px solid ${GOLD}`,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};

const alerteErreur = {
  padding: 18,
  margin: "20px 0",
  color: "#ffaaaa",
  background: "#351b1b",
  border: "1px solid #a44",
};

const alerteSucces = {
  padding: 18,
  margin: "20px 0",
  color: "#8ed3a2",
  background: "#17271b",
  border: "1px solid #386849",
};
