
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductOrder from "./ProductOrder";

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
  category_id: number;
};

type Variant = {
  id: string;
  nom: string;
  reference: string | null;
  image_url: string | null;
  ordre: number;
};

function imageUrl(path: string | null) {
  if (!path) return null;

  return supabase.storage
    .from("product-images")
    .getPublicUrl(path).data.publicUrl;
}

async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,nom,marque,description,contenance,prix_ttc_cents,image_url,category_id"
    )
    .eq("id", id)
    .eq("actif", true)
    .single();

  if (error || !data) {
    console.error("Erreur produit :", error);
    return null;
  }

  return data as Product;
}

async function getVariants(productId: string) {
  const { data, error } = await supabase
    .from("product_variants")
    .select("id,nom,reference,image_url,ordre")
    .eq("product_id", productId)
    .eq("actif", true)
    .order("ordre", { ascending: true });

  if (error) {
    console.error("Erreur variantes :", error);
    return [] as Variant[];
  }

  return (data ?? []) as Variant[];
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

  const categoryLabel =
    product.category_id === 1
      ? "Mèches"
      : "Cosmétiques";

  const categoryLink =
    product.category_id === 1
      ? "/#meches"
      : "/#cosmetiques";

  return (
    <main className="productPage">
      {/* MENU LATÉRAL */}
      <aside className="sidebar">
        <div className="brand">
          <div className="crown">♛</div>
          <strong>BLACK CROWN</strong>
          <span>SUPPLY</span>
          <small>WHOLESALE PRO</small>
        </div>

        <nav>
          <Link href="/#accueil">Accueil</Link>
          <Link href="/#meches">Mèches</Link>
          <Link href="/#cosmetiques">
            Cosmétiques
          </Link>
          <Link href="/#avantages">
            Nos avantages
          </Link>
          <Link href="/#contact">Contact</Link>

          <Link
            href="/panier"
            style={{ color: "#c8a75b" }}
          >
            Mon panier →
          </Link>
        </nav>

        <div className="pro">
          ESPACE PRO
          <br />
          <button>Connexion salon</button>
        </div>
      </aside>

      {/* CONTENU */}
      <section className="content productContent">
        <header>
          <span>BLACK CROWN SUPPLY</span>
          <div>
            Catalogue professionnel · Prix TTC
          </div>
        </header>

        <div className="productBack">
          <Link href={categoryLink}>
            ← Retour au catalogue
          </Link>

          <span>{categoryLabel}</span>
        </div>

        {/* PRODUIT */}
        <section className="productHero">
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

            <h1 className="productTitle">
              {product.nom}
            </h1>

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

            <ProductOrder
              productId={product.id}
              productName={product.nom}
              productImageUrl={img}
              variants={variants}
              priceCents={
                product.prix_ttc_cents
              }
              categoryId={
                product.category_id
              }
            />
          </div>
        </section>

        {/* AVANTAGES */}
        <section className="productBenefits">
          <div>
            <span>01</span>
            <strong>
              Tarifs professionnels
            </strong>
            <p>
              Une offre dédiée aux salons et
              professionnels de la coiffure.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>Livraison directe</strong>
            <p>
              Une commande simple et une
              relation terrain avec
              Black Crown Supply.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>
              Besoin d'une référence ?
            </strong>
            <p>
              Demandez-nous les produits que
              vous souhaitez retrouver au
              catalogue.
            </p>
          </div>
        </section>

        <footer>
          <strong>
            BLACK CROWN SUPPLY
          </strong>
          <span>
            Une marque Bro Trade Pro ·
            Évry-Courcouronnes
          </span>
        </footer>
      </section>
    </main>
  );
}
