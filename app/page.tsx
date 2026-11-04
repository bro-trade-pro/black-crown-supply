
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

  const featured = [1, 3, 4, 6].map((id) => products.find((product) => product.category_id === id)).filter((product): product is Product => Boolean(product));

  return (
    <main className="content">
      <header>
        <span>BLACK CROWN SUPPLY</span>
        <div>Catalogue professionnel · Prix TTC</div>
      </header>

      <section id="accueil" className="hero heroV2">
        <div className="heroV2Content">
          <p className="eyebrow">BLACK CROWN SUPPLY · DISTRIBUTION B2B</p>
          <h1>La coiffure afro mérite <em>une distribution à sa hauteur.</em></h1>
          <p>Vos essentiels professionnels, au même endroit. Mèches, crochets, perruques, soins et accessoires : une sélection pensée pour les salons.</p>
          <div className="heroV2Actions">
            <a href="#categories" className="cta">Explorer les 10 univers</a>
            <Link href="/panier" className="cta ctaSecondary">Mon panier</Link>
          </div>
          <div className="heroV2Stats">
            <span><strong>{products.length}</strong> références</span>
            <span><strong>{categories.length}</strong> univers</span>
            <span><strong>100 %</strong> professionnel</span>
          </div>
        </div>
        <div className="heroV2Crown" aria-hidden="true">♛</div>
      </section>

      <section className="categoryDirectory" id="categories" aria-labelledby="categoryDirectoryTitle">
        <div className="sectionHead">
          <div><p>LE CATALOGUE BLACK CROWN</p><h2 id="categoryDirectoryTitle">Trouvez votre univers</h2></div>
          <span>10 catégories</span>
        </div>
        <div className="categoryDirectoryGrid">
          {categories.map((category, index) => (
            <a key={category.id} href={`#${category.id}`} className="categoryDirectoryLink">
              <span className="categoryDirectoryNumber">{String(index + 1).padStart(2, "0")}</span>
              <strong>{category.title}</strong>
              <span className="categoryDirectoryArrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="catalog featuredCatalog" id="selection">
          <div className="sectionHead">
            <div><p>À DÉCOUVRIR</p><h2>La sélection Black Crown</h2></div>
            <span>Une sélection de notre catalogue</span>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}

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

      <ProductGrid products={products} />
    </section>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
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
