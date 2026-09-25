
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Product = {
  id: string;
  nom: string;
  marque: string | null;
  description: string | null;
  contenance: string | null;
  prix_ttc_cents: number;
  image_url: string | null;
};

type Variant = {
  id: string;
  nom: string;
  reference: string | null;
  image_url: string | null;
  ordre: number;
};

async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,nom,marque,description,contenance,prix_ttc_cents,image_url"
    )
    .eq("id", id)
    .eq("actif", true)
    .maybeSingle();

  if (error) {
    console.error("Erreur produit :", error);
    return null;
  }

  return data as Product | null;
}

async function getVariants(productId: string) {
  const { data, error } = await supabase
    .from("product_variants")
    .select("id,nom,reference,image_url,ordre")
    .eq("product_id", productId)
    .eq("actif", true)
    .order("ordre");

  if (error) {
    console.error("Erreur variantes :", error);
    return [] as Variant[];
  }

  return (data ?? []) as Variant[];
}

function imageUrl(path: string | null) {
  if (!path) return null;

  return supabase.storage
    .from("product-images")
    .getPublicUrl(path).data.publicUrl;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const variants = await getVariants(product.id);
  const img = imageUrl(product.image_url);

  return (
    <main className="productPage">

      <div className="productTopbar">
        <Link href="/#meches" className="backLink">
          ← Retour au catalogue
        </Link>

        <span>BLACK CROWN SUPPLY</span>
      </div>

      <section className="productDetail">

        <div className="productVisual">
          {img ? (
            <img src={img} alt={product.nom} />
          ) : (
            <div className="productPlaceholder">
              BLACK CROWN
            </div>
          )}
        </div>

        <div className="productInfo">

          {product.marque && (
            <p className="productBrand">
              {product.marque}
            </p>
          )}

          <h1>{product.nom}</h1>

          {product.contenance && (
            <p className="productSize">
              {product.contenance}
            </p>
          )}

          {product.description && (
            <p className="productDescription">
              {product.description}
            </p>
          )}

          <div className="productPrice">
            {(product.prix_ttc_cents / 100)
              .toFixed(2)
              .replace(".", ",")}{" "}
            €
            <span>TTC</span>
          </div>

          <div className="productDivider" />

          {variants.length > 0 ? (
            <>
              <div className="variantHeader">
                <div>
                  <p className="variantEyebrow">
                    COMPOSEZ VOTRE COMMANDE
                  </p>

                  <h2>
                    Choisissez vos couleurs
                  </h2>
                </div>

                <span>
                  {variants.length} couleurs disponibles
                </span>
              </div>

              <div className="variantList">
                {variants.map((variant) => (
                  <div
                    className="variantRow"
                    key={variant.id}
                  >
                    <div className="variantName">
                      <strong>{variant.nom}</strong>

                      {variant.reference &&
                        variant.reference !== variant.nom && (
                          <small>
                            Réf. {variant.reference}
                          </small>
                        )}
                    </div>

                    <div className="quantityControl">
                      <button type="button">−</button>
                      <span>0</span>
                      <button type="button">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="variantEyebrow">
                QUANTITÉ
              </p>

              <div className="singleQuantity">
                <div className="quantityControl">
                  <button type="button">−</button>
                  <span>0</span>
                  <button type="button">+</button>
                </div>
              </div>
            </>
          )}

          <div className="productOrderSummary">
            <div>
              <small>TOTAL</small>
              <strong>0 article</strong>
            </div>

            <div className="summaryPrice">
              0,00 €
              <span>TTC</span>
            </div>
          </div>

          <button
            className="addToCart"
            type="button"
            disabled
          >
            Ajouter au panier
          </button>

        </div>
      </section>
    </main>
  );
}
