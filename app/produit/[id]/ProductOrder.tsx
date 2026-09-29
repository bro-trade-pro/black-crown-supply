
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "../../CartContext";

type Variant = {
  id: string;
  nom: string;
  reference: string | null;
  image_url: string | null;
  ordre: number;
};

type Props = {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  variants: Variant[];
  priceCents: number;
  categoryId: number;
};

export default function ProductOrder({
  productId,
  productName,
  productImageUrl,
  variants,
  priceCents,
  categoryId,
}: Props) {
  const { addItems } = useCart();

  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<
    Record<string, number>
  >({});
  const [simpleQuantity, setSimpleQuantity] = useState(0);
  const [added, setAdded] = useState(false);

  const hasVariants = variants.length > 0;

  const filteredVariants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return variants;

    return variants.filter(
      (variant) =>
        variant.nom.toLowerCase().includes(query) ||
        (variant.reference ?? "").toLowerCase().includes(query)
    );
  }, [variants, search]);

  const totalQuantity = hasVariants
    ? Object.values(quantities).reduce(
        (sum, quantity) => sum + quantity,
        0
      )
    : simpleQuantity;

  const totalCents = totalQuantity * priceCents;

  function changeQuantity(id: string, change: number) {
    setAdded(false);

    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + change),
    }));
  }

  function addToCart() {
    if (totalQuantity === 0) return;

    if (hasVariants) {
      const selected = variants
        .filter((variant) => (quantities[variant.id] ?? 0) > 0)
        .map((variant) => ({
          productId,
          productName,
          variantId: variant.id,
          variantName: variant.nom,
          imageUrl: productImageUrl,
          priceCents,
          quantity: quantities[variant.id],
        }));

      addItems(selected);
      setQuantities({});
    } else {
      addItems([
        {
          productId,
          productName,
          variantId: null,
          variantName: null,
          imageUrl: productImageUrl,
          priceCents,
          quantity: simpleQuantity,
        },
      ]);

      setSimpleQuantity(0);
    }

    setAdded(true);
  }

  const money = (cents: number) =>
    (cents / 100).toFixed(2).replace(".", ",") + " €";

  return (
    <div className="variantSection">
      <p className="eyebrow">
        {hasVariants
          ? "COMPOSEZ VOTRE COMMANDE"
          : "COMMANDE PROFESSIONNELLE"}
      </p>

      {hasVariants ? (
        <>
          <h2>
            Choisissez vos{" "}
            {categoryId === 1 ? "couleurs" : "variantes"}
          </h2>

          <p className="variantCount">
            {variants.length}{" "}
            {categoryId === 1
              ? "couleurs disponibles"
              : "variantes disponibles"}
          </p>

          <div className="variantSearch">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                categoryId === 1
                  ? "Rechercher une couleur : 1B, 613, T2/30..."
                  : "Rechercher une variante..."
              }
              aria-label="Rechercher une variante"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Effacer la recherche"
              >
                ×
              </button>
            )}
          </div>

          <div className="variantScroll">
            <div className="variantGrid">
              {filteredVariants.map((variant) => {
                const quantity =
                  quantities[variant.id] ?? 0;

                return (
                  <div
                    key={variant.id}
                    className={`variantRow ${
                      quantity > 0
                        ? "variantSelected"
                        : ""
                    }`}
                  >
                    <div className="variantIdentity">
                      <div>
                        <strong>{variant.nom}</strong>

                        {variant.reference &&
                          variant.reference !==
                            variant.nom && (
                            <small>
                              Réf. {variant.reference}
                            </small>
                          )}
                      </div>
                    </div>

                    <div className="quantityControl">
                      <button
                        type="button"
                        disabled={quantity === 0}
                        onClick={() =>
                          changeQuantity(variant.id, -1)
                        }
                        aria-label={`Retirer ${variant.nom}`}
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(variant.id, 1)
                        }
                        aria-label={`Ajouter ${variant.nom}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredVariants.length === 0 && (
                <div className="noVariantResult">
                  Aucune variante trouvée.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <h2>Quantité</h2>

          <div className="simpleQuantity">
            <button
              type="button"
              disabled={simpleQuantity === 0}
              onClick={() => {
                setAdded(false);
                setSimpleQuantity((q) =>
                  Math.max(0, q - 1)
                );
              }}
              aria-label="Diminuer la quantité"
            >
              −
            </button>

            <span>{simpleQuantity}</span>

            <button
              type="button"
              onClick={() => {
                setAdded(false);
                setSimpleQuantity((q) => q + 1);
              }}
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>
        </>
      )}

      <div className="orderSummary">
        <div>
          <small>VOTRE SÉLECTION</small>
          <strong>
            {totalQuantity}{" "}
            {totalQuantity > 1
              ? "articles"
              : "article"}
          </strong>
        </div>

        <div className="orderTotal">
          <small>TOTAL TTC</small>
          <strong>{money(totalCents)}</strong>
        </div>
      </div>

      <button
        className="addCartButton"
        type="button"
        disabled={totalQuantity === 0}
        onClick={addToCart}
      >
        Ajouter au panier
      </button>

      {added && (
        <div
          role="status"
          style={{
            marginTop: 18,
            padding: 18,
            border: "1px solid #c8a75b",
            background: "#17150f",
            color: "#f4efe4",
          }}
        >
          <strong style={{ color: "#c8a75b" }}>
            ✓ Articles ajoutés au panier
          </strong>

          <p style={{ fontSize: 13 }}>
            Tu peux poursuivre tes achats ou consulter
            ton panier.
          </p>

          <Link
            href="/panier"
            style={{
              color: "#c8a75b",
              fontWeight: "bold",
            }}
          >
            Voir mon panier →
          </Link>
        </div>
      )}
    </div>
  );
}
