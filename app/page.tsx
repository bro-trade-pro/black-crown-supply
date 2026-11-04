
import Link from "next/link";
import ProductGrid, { type Product } from "@/components/CatalogProductGrid";
import { categories } from "@/lib/catalogCategories";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function Home() {
  const products = await getProducts();


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

      <section aria-labelledby="parrainage-title" style={{ margin: "30px auto 55px", maxWidth: 1180, padding: "35px 30px", border: "1px solid #c8a75b", background: "#17130d", textAlign: "center" }}>
        <p className="eyebrow">PROGRAMME PARRAINAGE</p>
        <h2 id="parrainage-title" style={{ fontFamily: "Georgia,serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 400, color: "#f4efe4" }}>Recommandez Black Crown, profitez ensemble.</h2>
        <p style={{ color: "#e0c78d", fontSize: 20, lineHeight: 1.6 }}><strong>−10 %</strong> sur la première commande de votre filleul · <strong>−20 %</strong> sur votre prochaine commande</p>
        <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.7 }}>La récompense du parrain est débloquée après la première commande effectivement payée du filleul. Offre soumise aux conditions du programme.</p>
        <Link href="/inscription" className="cta" style={{ display: "inline-block", marginTop: 15 }}>Créer mon compte pro</Link>
      </section>

      <section className="categoryDirectory" id="categories" aria-labelledby="categoryDirectoryTitle">
        <div className="sectionHead">
          <div><p>LE CATALOGUE BLACK CROWN</p><h2 id="categoryDirectoryTitle">Trouvez votre univers</h2></div>
          <span>10 catégories</span>
        </div>
        <div className="categoryDirectoryGrid">
          {categories.map((category, index) => (
            <a key={category.id} href={`/categorie/${category.id}`} className="categoryDirectoryLink">
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

