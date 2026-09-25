import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Product={id:string;nom:string;marque:string|null;contenance:string|null;prix_ttc_cents:number;image_url:string|null;category_id:number};

async function getProducts(){
 const {data,error}=await supabase.from("products").select("id,nom,marque,contenance,prix_ttc_cents,image_url,category_id").eq("actif",true).order("nom");
if (error) {
  console.error("Erreur Supabase products:", error);
  return [] as Product[];
}
 return (data??[]) as Product[];
}
function imageUrl(path:string|null){if(!path)return null;return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl}
export default async function Home(){
 const products=await getProducts();
 const meches=products.filter(p=>p.category_id===1), cosmetiques=products.filter(p=>p.category_id===2);
 return <main>
  <aside className="sidebar"><div className="brand"><div className="crown">♛</div><strong>BLACK CROWN</strong><span>SUPPLY</span><small>WHOLESALE PRO</small></div><nav><a href="#accueil">Accueil</a><a href="#meches">Mèches</a><a href="#cosmetiques">Cosmétiques</a><a href="#avantages">Nos avantages</a><a href="#contact">Contact</a></nav><div className="pro">ESPACE PRO<br/><button>Connexion salon</button></div></aside>
  <section className="content"><header><span>BLACK CROWN SUPPLY</span><div>Catalogue professionnel · Prix TTC</div></header>
  <section id="accueil" className="hero"><p className="eyebrow">BRO TRADE PRO PRÉSENTE</p><h1>Le catalogue pro<br/><em>qui va à l’essentiel.</em></h1><p>Produits capillaires sélectionnés pour les salons professionnels. Commande simple, livraison directe, relation terrain.</p><a href="#meches" className="cta">Découvrir le catalogue</a></section>
  <Catalog title="Mèches" subtitle="Notre sélection professionnelle" id="meches" products={meches}/>
  <Catalog title="Cosmétiques" subtitle="Soins & coiffage" id="cosmetiques" products={cosmetiques}/>
  <section id="avantages" className="advantages"><div><b>01</b><h3>Tarifs professionnels</h3><p>Une offre pensée pour le volume et la rentabilité des salons.</p></div><div><b>02</b><h3>Livraison directe</h3><p>Une relation simple et un service de proximité.</p></div><div><b>03</b><h3>Catalogue évolutif</h3><p>Besoin d’une référence ? Demandez-la directement à Black Crown.</p></div></section>
  <footer id="contact"><strong>BLACK CROWN SUPPLY</strong><span>Une marque Bro Trade Pro · Évry-Courcouronnes</span></footer></section>
 </main>
}
function Catalog({title,subtitle,id,products}:{title:string;subtitle:string;id:string;products:Product[]}){return <section className="catalog" id={id}><div className="sectionHead"><div><p>{subtitle}</p><h2>{title}</h2></div><span>{products.length} références</span></div><div className="grid">{products.map(p=>{const img=imageUrl(p.image_url);return <article className="card" key={p.id}>{img?<img src={img} alt={p.nom}/>:<div className="placeholder">BLACK CROWN</div>}<div className="cardBody">{p.marque&&<small>{p.marque}</small>}<h3>{p.nom}</h3>{p.contenance&&<p>{p.contenance}</p>}<div className="price">{(p.prix_ttc_cents/100).toFixed(2).replace(".",",")} € <span>TTC</span></div><button>Voir le produit</button></div></article>})}</div></section>}
