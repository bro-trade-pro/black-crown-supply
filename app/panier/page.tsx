
"use client";

import Link from "next/link";
import { useCart } from "../CartContext";

const gold = "#c8a75b";
const cream = "#f4efe4";
const border = "#30291c";
const FRANCO_TTC = 60000;
const LIVRAISON_TTC = 1440;

function money(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export default function CartPage() {
  const {
    items,
    ready,
    updateQuantity,
    removeItem,
    clearCart,
    totalQuantity,
    totalCents,
  } = useCart();

  // Hypothèse actuelle : TVA de 20 % sur tous les produits.
  const totalHT = totalCents / 1.2;
  const francoAtteint = totalCents >= FRANCO_TTC;
  const resteTTC = Math.max(0, FRANCO_TTC - totalCents);
  const progression = Math.min(
    100,
    (totalCents / FRANCO_TTC) * 100
  );
  const livraison = francoAtteint ? 0 : LIVRAISON_TTC;
  const totalCommande = totalCents + livraison;

  return (
    <main className="productPage">
      <section className="content productContent">
        <header>
          <span>BLACK CROWN SUPPLY</span>
          <div>Catalogue professionnel · Prix TTC</div>
        </header>

        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "45px 30px 90px",
          }}
        >
          <Link
            href="/#meches"
            style={{
              color: gold,
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            ← Continuer mes achats
          </Link>

          <p className="eyebrow" style={{ marginTop: 55 }}>
            VOTRE COMMANDE
          </p>

          <h1
            style={{
              fontSize: "clamp(38px,5vw,65px)",
              margin: "10px 0 15px",
            }}
          >
            Mon panier
          </h1>

          <p
            style={{
              color: "#999",
              fontSize: 14,
              marginBottom: 38,
            }}
          >
            Vérifiez vos références et vos quantités
            avant de passer commande.
          </p>

          {!ready ? (
            <p style={{ color: "#999" }}>
              Chargement de votre panier…
            </p>
          ) : items.length === 0 ? (
            <div
              style={{
                border: `1px solid ${border}`,
                background: "#111",
                padding: "65px 25px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  color: gold,
                  marginBottom: 18,
                }}
              >
                ♛
              </div>

              <h2
                style={{
                  fontFamily: "Georgia,serif",
                  fontWeight: 400,
                  fontSize: 30,
                }}
              >
                Votre panier est vide
              </h2>

              <p style={{ color: "#999" }}>
                Retrouvez toutes nos références
                dans le catalogue.
              </p>

              <Link
                href="/#meches"
                style={{
                  display: "inline-block",
                  marginTop: 25,
                  padding: "15px 28px",
                  background: gold,
                  color: "#080808",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                DÉCOUVRIR LE CATALOGUE
              </Link>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gap: 12 }}>
                {items.map((item) => (
                  <article
                    key={item.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 22,
                      padding: 20,
                      border: `1px solid ${border}`,
                      background: "#111",
                    }}
                  >
                    <Link
                      href={`/produit/${item.productId}`}
                      style={{
                        width: 92,
                        height: 100,
                        flexShrink: 0,
                        background: "#f4f1eb",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            padding: 8,
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            color: "#111",
                            fontSize: 10,
                          }}
                        >
                          BLACK CROWN
                        </span>
                      )}
                    </Link>

                    <div
                      style={{
                        flex: "1 1 210px",
                        minWidth: 0,
                      }}
                    >
                      <Link
                        href={`/produit/${item.productId}`}
                        style={{
                          color: cream,
                          textDecoration: "none",
                          fontFamily: "Georgia,serif",
                          fontSize: 19,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.productName}
                      </Link>

                      {item.variantName && (
                        <p
                          style={{
                            color: gold,
                            margin: "9px 0",
                            fontSize: 13,
                          }}
                        >
                          Couleur / variante :{" "}
                          <strong>{item.variantName}</strong>
                        </p>
                      )}

                      <p
                        style={{
                          color: "#999",
                          fontSize: 12,
                        }}
                      >
                        Prix unitaire :{" "}
                        {money(item.priceCents)} TTC
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.key)
                        }
                        style={{
                          border: 0,
                          padding: 0,
                          marginTop: 8,
                          background: "transparent",
                          color: "#b8a58a",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Supprimer cette référence
                      </button>
                    </div>

                    <div
                      className="quantityControl"
                      style={{ marginLeft: "auto" }}
                    >
                      <button
                        type="button"
                        aria-label={`Diminuer ${item.productName}`}
                        onClick={() =>
                          updateQuantity(
                            item.key,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Augmenter ${item.productName}`}
                        onClick={() =>
                          updateQuantity(
                            item.key,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <div
                      style={{
                        minWidth: 105,
                        textAlign: "right",
                      }}
                    >
                      <small
                        style={{
                          display: "block",
                          color: "#777",
                          fontSize: 10,
                          marginBottom: 8,
                        }}
                      >
                        SOUS-TOTAL TTC
                      </small>

                      <strong
                        style={{
                          color: gold,
                          fontFamily: "Georgia,serif",
                          fontSize: 23,
                          fontWeight: 400,
                        }}
                      >
                        {money(
                          item.priceCents * item.quantity
                        )}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>

              <div
                style={{
                  maxWidth: 440,
                  margin: "35px 0 0 auto",
                  padding: 28,
                  border: `1px solid ${border}`,
                  background: "#12110e",
                }}
              >
                <p className="eyebrow" style={{ marginTop: 0 }}>
                  RÉCAPITULATIF
                </p>

                <h2
                  style={{
                    fontFamily: "Georgia,serif",
                    fontWeight: 400,
                    fontSize: 29,
                    marginBottom: 30,
                  }}
                >
                  Votre commande
                </h2>

                <div style={ligne}>
                  <span>Nombre d'articles</span>
                  <strong>{totalQuantity}</strong>
                </div>

                <div style={ligne}>
                  <span>Total produits HT</span>
                  <strong>
                    {money(Math.round(totalHT))}
                  </strong>
                </div>

                <div style={ligne}>
                  <span>Total produits TTC</span>
                  <strong>{money(totalCents)}</strong>
                </div>

                <div
                  style={{
                    margin: "26px 0",
                    padding: 20,
                    border: `1px solid ${border}`,
                    background: "#19160f",
                  }}
                >
                  {francoAtteint ? (
                    <p
                      style={{
                        color: "#8ed3a2",
                        fontWeight: 700,
                        marginTop: 0,
                      }}
                    >
                      ✓ Livraison offerte !
                    </p>
                  ) : (
                    <p
                      style={{
                        color: gold,
                        fontWeight: 700,
                        lineHeight: 1.6,
                        marginTop: 0,
                      }}
                    >
                      Plus que {money(resteTTC)} TTC
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
                        width: `${progression}%`,
                        height: "100%",
                        background: francoAtteint
                          ? "#8ed3a2"
                          : gold,
                        borderRadius: 20,
                        transition: "width 0.2s",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      color: "#aaa",
                      fontSize: 12,
                    }}
                  >
                    <span>
                      {money(Math.round(totalHT))} HT
                    </span>
                    <span>500 € HT</span>
                  </div>

                  <p
                    style={{
                      color: "#aaa",
                      fontSize: 12,
                      lineHeight: 1.7,
                      marginBottom: 0,
                    }}
                  >
                    Franco de port : 500 € HT,
                    soit 600 € TTC.
                  </p>
                </div>

                <div style={ligne}>
                  <span>Livraison</span>
                  <strong
                    style={{
                      color: francoAtteint
                        ? "#8ed3a2"
                        : cream,
                    }}
                  >
                    {francoAtteint
                      ? "OFFERTE"
                      : "14,40 € TTC"}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 15,
                    padding: "24px 0",
                    borderTop: `1px solid ${border}`,
                    color: cream,
                  }}
                >
                  <strong>TOTAL TTC</strong>
                  <strong
                    style={{
                      color: gold,
                      fontFamily: "Georgia,serif",
                      fontSize: 30,
                      fontWeight: 400,
                    }}
                  >
                    {money(totalCommande)}
                  </strong>
                </div>

                <div
                  style={{
                    padding: 16,
                    margin: "22px 0",
                    border: `1px solid ${border}`,
                    color: "#aaa",
                    fontSize: 12,
                    lineHeight: 1.8,
                  }}
                >
                  Acompte à la commande :{" "}
                  <strong style={{ color: gold }}>
                    {money(Math.ceil(totalCommande / 2))}
                  </strong>
                  <br />
                  Solde à la livraison :{" "}
                  <strong style={{ color: gold }}>
                    {money(Math.floor(totalCommande / 2))}
                  </strong>
                </div>

                <Link
                  href="/commande"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 17,
                    background: gold,
                    color: "#080808",
                    textAlign: "center",
                    textDecoration: "none",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  FINALISER MA COMMANDE →
                </Link>
              </div>

              <div style={{ marginTop: 30 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Voulez-vous vraiment vider tout votre panier ?"
                      )
                    ) {
                      clearCart();
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "#999",
                    textDecoration: "underline",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Vider tout le panier
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

const ligne = {
  display: "flex",
  justifyContent: "space-between" as const,
  gap: 20,
  marginBottom: 18,
  color: "#bbb",
  fontSize: 14,
};
