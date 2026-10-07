import Link from "next/link";

const gold="#c8a75b", cream="#f4efe4", border="#40351f";
const box={marginTop:28,padding:"24px 26px",background:"#171512",border:`1px solid ${border}`};

export default function MentionsLegalesPage(){
 return <main className="productPage"><section className="content productContent">
  <header><span>BLACK CROWN SUPPLY</span><div>Informations légales</div></header>
  <article style={{maxWidth:950,margin:"0 auto",padding:"55px 25px 100px",color:cream,lineHeight:1.75}}>
   <p className="eyebrow">BRO TRADE PRO · BLACK CROWN SUPPLY</p>
   <h1 style={{fontSize:"clamp(34px,5vw,56px)",marginBottom:10}}>Mentions légales</h1>
   <p style={{color:"#aaa",marginBottom:40}}>Version du 7 octobre 2026</p>
   <section style={box}><h2 style={{color:gold}}>Éditeur du site</h2>
    <p>BRO TRADE PRO, société par actions simplifiée au capital de 5 000 €.</p>
    <p>Nom commercial : BLACK CROWN SUPPLY<br/>Siège social : 8 Allée Marie Hackin, 91080 Évry-Courcouronnes, France<br/>RCS Évry : 107 209 991<br/>N° de gestion : 2026B04182</p>
    <p>Activité : commerce de gros de produits capillaires.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>Direction de la publication</h2>
    <p>Directeur de la publication : Florian LEMEGRE, Président de BRO TRADE PRO.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>Hébergement</h2>
    <p>Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>Propriété intellectuelle</h2>
    <p>La structure, les textes, graphismes, éléments visuels et signes distinctifs du site sont protégés par les règles applicables en matière de propriété intellectuelle, sous réserve des droits appartenant à des tiers. Toute reproduction ou exploitation non autorisée est interdite.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>Données personnelles</h2>
    <p>Pour connaître les traitements de données réalisés dans le cadre du site et les modalités d'exercice de vos droits, consultez notre <Link href="/confidentialite" style={{color:gold}}>Politique de confidentialité</Link>.</p>
   </section>
   <div style={{marginTop:45,paddingTop:25,borderTop:`1px solid ${border}`}}><Link href="/" style={{color:gold,textDecoration:"none"}}>← Retour au catalogue</Link></div>
  </article>
 </section></main>
}
