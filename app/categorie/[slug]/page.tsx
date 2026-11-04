import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductGrid, { type Product } from "@/components/CatalogProductGrid";
import { categories, categoryBySlug } from "@/lib/catalogCategories";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  const { data, error } = await supabase
    .from("products")
    .select("id,nom,marque,contenance,prix_ttc_cents,image_url,category_id")
    .eq("actif", true)
    .eq("category_id", category.categoryId)
    .order("nom");

  if (error) console.error("Erreur catalogue catégorie :", error);
  const products = (data ?? []) as Product[];

  return (
    <main className="content categoryPage">
      <header><span>BLACK CROWN SUPPLY</span><div>Catalogue professionnel · Prix TTC</div></header>
      <div className="categoryPageIntro">
        <Link href="/#categories" className="categoryBack">← Tous les univers</Link>
        <p className="eyebrow">BLACK CROWN SUPPLY · CATALOGUE PROFESSIONNEL</p>
        <h1>{category.title}</h1>
        <p>Découvrez notre sélection professionnelle de {category.title.toLowerCase()}.</p>
        <span className="categoryCount">{products.length} {products.length > 1 ? "références" : "référence"}</span>
      </div>
      <section className="catalog categoryPageCatalog">
        {error ? <p>Le catalogue est momentanément indisponible.</p> : products.length ? <ProductGrid products={products} /> : <p>Aucun produit disponible pour le moment.</p>}
      </section>
      <div className="categoryPageOther">
        <h2>Explorer les autres univers</h2>
        <div className="categoryPageLinks">
          {categories.filter((item) => item.id !== slug).map((item) => (
            <Link href={`/categorie/${item.id}`} key={item.id}>{item.title} ↗</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
