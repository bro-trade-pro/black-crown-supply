
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Product = {
  id: string;
  nom: string;
  marque: string | null;
  contenance: string | null;
  prix_ttc_cents: number;
  image_url: string | null;
  category_id: number;
};

async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,nom,marque,contenance,prix_ttc_cents,image_url,category_id"
    )
    .eq("actif", true)
    .order("nom");

  if (error) {
    console.error("Erreur Supabase products:", error);
    return [] as Product[];
  }

  return (data ?? []) as Product[];
}

function imageUrl(path: string | null) {
  if (!path) return null;

  return supabase.storage
    .from("product-images")
    .getPublicUrl(path).data.publicUrl;
}

export default async function Home() {
  const products = await getProducts();

  const categories = [{"title":"Mèches","id":"meches","categoryId":1},{"title":"Crochets","id":"crochets","categoryId":3},{"title":"Brésiliennes","id":"bresiliennes","categoryId":4},{"title":"Closures","id":"closures","categoryId":5},{"title":"Perruques","id":"perruques","categoryId":6},{"title":"Postiches","id":"postiches","categoryId":7},{"title":"Dreadlocks","id":"dreadlocks","categoryId":8},{"title":"Cosmétiques","id":"cosmetiques","categoryId":2},{"title":"Bijoux","id":"bijoux","categoryId":9},{"title":"Accessoires","id":"accessoires","categoryId":10}];

  return (
    <main className="content">
      <header>
        <span>BLACK CROWN SUPPLY</span>
        <div>Catalogue professionnel · Prix TTC</div>
      </header>

      <section id="accueil" className="hero">
        <p className="eyebrow">
          BLACK CROWN SUPPLY · DISTRIBUTION PROFESSIONNELLE
        </p>

        <h1>
          Le catalogue pro
          <br />
          <em>qui va à l’essentiel.</em>
        </h1>

        <p>
          Produits capillaires sélectionnés pour les
          salons professionnels. Commande simple,
          livraison directe, relation terrain.
        </p>

        <a href="#meches" className="cta">
          Découvrir le catalogue
        </a>
      </section>

      {categories.map((category) => (
        <Catalog
          key={category.id}
          title={category.title}
          subtitle="Sélection professionnelle"
          id={category.id}
          products={products.filter((product) => product.category_id === category.categoryId)}
        />
      ))}

      <section id="avantages" className="advantages">
        <div>
          <b>01</b>
          <h3>Tarifs professionnels</h3>
          <p>
            Une offre pensée pour le volume et la
            rentabilité des salons.
          </p>
        </div>

        <div>
          <b>02</b>
          <h3>Livraison directe</h3>
          <p>
            Une relation simple et un service de proximité.
          </p>
        </div>

        <div>
          <b>03</b>
          <h3>Catalogue évolutif</h3>
          <p>
            Besoin d’une référence ? Demandez-la
            directement à Black Crown.
          </p>
        </div>
      </section>

      <footer id="contact">
        <strong>BLACK CROWN SUPPLY</strong>
        <span>
          Une marque Bro Trade Pro · Évry-Courcouronnes
        </span>
      </footer>
    </main>
  );
}

function Catalog({
  title,
  subtitle,
  id,
  products,
}: {
  title: string;
  subtitle: string;
  id: string;
  products: Product[];
}) {
  return (
    <section className="catalog" id={id}>
      <div className="sectionHead">
        <div>
          <p>{subtitle}</p>
          <h2>{title}</h2>
        </div>

        <span>{products.length} références</span>
      </div>

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
    </section>
  );
}
