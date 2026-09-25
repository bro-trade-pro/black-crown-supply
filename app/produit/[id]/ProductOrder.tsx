"use client";

import { useMemo, useState } from "react";

type Variant = {
  id: string;
  nom: string;
  reference: string | null;
  image_url: string | null;
  ordre: number;
};

type Props = {
  variants: Variant[];
  priceCents: number;
  categoryId: number;
};

export default function ProductOrder({
  variants,
  priceCents,
  categoryId,
}: Props) {
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filteredVariants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return variants;

    return variants.filter((variant) => {
      const nom = variant.nom.toLowerCase();
      const reference = variant.reference?.toLowerCase() ?? "";

      return nom.includes(query) || reference.includes(query);
    });
  }, [variants, search]);

  const totalQuantity = Object.values(quantities).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const totalCents = totalQuantity * priceCents;

  function changeQuantity(variantId: string, change: number) {
    setQuantities((current) => {
      const previous = current[variantId] ?? 0;
      const next = Math.max(0, previous + change);

      return {
        ...current,
        [variantId]: next,
      };
    });
  }

  return (
    <div className="variantSection">
      <p className="eyebrow">COMPOSEZ VOTRE COMMANDE</p>

      <h2>
        Choisissez vos {categoryId === 1 ? "couleurs" : "variantes"}
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
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            categoryId === 1
              ? "Rechercher une couleur : 1B, 613, T2/30..."
              : "Rechercher une variante..."
          }
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
            const quantity = quantities[variant.id] ?? 0;

            return (
              <div
                className={`variantRow ${
                  quantity > 0 ? "variantSelected" : ""
                }`}
                key={variant.id}
              >
                <div className="variantIdentity">
                  <div>
                    <strong>{variant.nom}</strong>

                    {variant.reference &&
                      variant.reference !== variant.nom && (
                        <small>Réf. {variant.reference}</small>
                      )}
                  </div>
                </div>

                <div className="quantityControl">
                  <button
                    type="button"
                    onClick={() => changeQuantity(variant.id, -1)}
                    aria-label={`Retirer ${variant.nom}`}
                    disabled={quantity === 0}
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() => changeQuantity(variant.id, 1)}
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
              Aucune couleur ne correspond à « {search} ».
            </div>
          )}
        </div>
      </div>

      <div className="orderSummary">
        <div>
          <small>VOTRE SÉLECTION</small>

          <strong>
            {totalQuantity} {totalQuantity > 1 ? "articles" : "article"}
          </strong>
        </div>

        <div className="orderTotal">
          <small>TOTAL TTC</small>

          <strong>
            {(totalCents / 100).toFixed(2).replace(".", ",")} €
          </strong>
        </div>
      </div>

      <button
        className="addCartButton"
        type="button"
        disabled={totalQuantity === 0}
      >
        Ajouter au panier
      </button>
    </div>
  );
}
