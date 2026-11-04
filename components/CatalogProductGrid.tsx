import Link from "next/link";
import { supabase } from "@/lib/supabase";
export type Product = {
  id: string;
  nom: string;
  marque: string | null;
  contenance: string | null;
  prix_ttc_cents: number;
  image_url: string | null;
  category_id: number;
};


function imageUrl(path: string | null) {
  if (!path) return null;

  return supabase.storage
    .from("product-images")
    .getPublicUrl(path).data.publicUrl;
}


export default function ProductGrid({ products }: { products: Product[] }) {
  return (
      <div className="grid">
        {products.map((product) => {
          const img = imageUrl(product.image_url);

          return (
            <article
              className="card"
              key={product.id}
            >
              {img ? (
                <img
                  src={img}
                  alt={product.nom}
                />
              ) : (
                <div className="placeholder">
                  BLACK CROWN
                </div>
              )}

              <div className="cardBody">
                {product.marque && (
                  <small>{product.marque}</small>
                )}

                <h3>{product.nom}</h3>

                {product.contenance && (
                  <p>{product.contenance}</p>
                )}

                <div className="price">
                  {(product.prix_ttc_cents / 100)
                    .toFixed(2)
                    .replace(".", ",")}{" "}
                  €
                  <span>TTC</span>
                </div>

                <Link
                  className="productButton"
                  href={`/produit/${product.id}`}
                >
                  Voir le produit
                </Link>
              </div>
            </article>
          );
        })}
      </div>
  );
}
