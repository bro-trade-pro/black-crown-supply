import Link from "next/link";

const gold="#c8a75b", cream="#f4efe4", border="#40351f";
const box={marginTop:28,padding:"24px 26px",background:"#171512",border:`1px solid ${border}`};

export default function ConfidentialitePage(){
 return <main className="productPage"><section className="content productContent">
  <header><span>BLACK CROWN SUPPLY</span><div>Protection des données personnelles</div></header>
  <article style={{maxWidth:950,margin:"0 auto",padding:"55px 25px 100px",color:cream,lineHeight:1.75}}>
   <p className="eyebrow">BRO TRADE PRO · BLACK CROWN SUPPLY</p>
   <h1 style={{fontSize:"clamp(34px,5vw,56px)",marginBottom:10}}>Politique de confidentialité</h1>
   <p style={{color:"#aaa",marginBottom:40}}>Version du 7 octobre 2026</p>
   <section style={box}><h2 style={{color:gold}}>1 — Responsable du traitement</h2>
    <p>BRO TRADE PRO, exploitant sous le nom commercial BLACK CROWN SUPPLY, 8 Allée Marie Hackin, 91080 Évry-Courcouronnes, est responsable des traitements de données personnelles réalisés dans le cadre du site.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>2 — Données traitées</h2>
    <p>Selon votre utilisation du site, nous pouvons traiter les informations de votre compte professionnel et de votre salon : identité, coordonnées professionnelles, adresse électronique, téléphone, adresse de livraison, SIRET, informations de connexion et d'authentification, contenu du panier, commandes, demandes de produits, commentaires et informations nécessaires au suivi de la relation commerciale.</p>
    <p>Nous ne vous demandons pas de communiquer de données sensibles dans les champs libres du site.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>3 — Pourquoi utilisons-nous ces données ?</h2>
    <p>Les données sont utilisées pour créer et sécuriser votre compte professionnel, vérifier et gérer votre accès, traiter et suivre vos commandes, organiser la livraison, assurer le service client, gérer les demandes de produits, prévenir les abus ou fraudes et respecter nos obligations comptables, fiscales et légales.</p>
    <p>Ces traitements reposent, selon leur finalité, sur l'exécution de mesures précontractuelles ou du contrat, le respect d'obligations légales et l'intérêt légitime de BRO TRADE PRO à sécuriser son activité et gérer sa relation commerciale.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>4 — Destinataires et prestataires</h2>
    <p>Les données sont accessibles uniquement aux personnes habilitées de BRO TRADE PRO et, lorsque cela est nécessaire, à ses prestataires techniques ou opérationnels intervenant pour le fonctionnement du site, l'authentification, l'hébergement, l'envoi d'e-mails transactionnels, le paiement ou la livraison.</p>
    <p>Le site utilise notamment Supabase pour son infrastructure de données et d'authentification et Vercel pour son hébergement. Les e-mails transactionnels peuvent être acheminés par Resend.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>5 — Durées de conservation</h2>
    <p>Les données du compte et de la relation client sont conservées pendant la durée nécessaire à la relation commerciale puis, lorsqu'elles ne sont plus utiles au service actif, supprimées ou archivées selon les obligations légales applicables. Les pièces et informations devant être conservées pour des motifs comptables, fiscaux, probatoires ou de contentieux le sont pendant les durées prévues par la réglementation.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>6 — Transferts hors de l'Union européenne</h2>
    <p>Certains prestataires techniques peuvent traiter des données depuis des pays situés hors de l'Union européenne. Dans ce cas, BRO TRADE PRO s'appuie sur les mécanismes et garanties prévus par la réglementation applicable et les engagements contractuels de ses prestataires.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>7 — Vos droits</h2>
    <p>Dans les conditions prévues par la réglementation, vous pouvez demander l'accès à vos données, leur rectification, leur effacement ou la limitation de leur traitement. Vous pouvez également exercer, lorsqu'ils sont applicables, vos droits d'opposition et de portabilité.</p>
    <p>Pour exercer vos droits, vous pouvez écrire à : BRO TRADE PRO — Protection des données, 8 Allée Marie Hackin, 91080 Évry-Courcouronnes, France. Afin de protéger vos données, une preuve d'identité pourra être demandée uniquement lorsque cela est nécessaire pour vérifier votre identité.</p>
    <p>Vous disposez également du droit d'introduire une réclamation auprès de la CNIL.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>8 — Sécurité</h2>
    <p>BRO TRADE PRO met en œuvre des mesures techniques et organisationnelles destinées à protéger les données contre l'accès non autorisé, la perte, l'altération ou la divulgation. L'accès aux espaces et opérations réservés est soumis à authentification et à des contrôles d'autorisation.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>9 — Cookies et stockage technique</h2>
    <p>Le site peut utiliser les mécanismes techniques nécessaires à l'authentification, à la sécurité, au maintien de la session et au fonctionnement du panier. Si des outils facultatifs de mesure d'audience, de publicité ou de suivi nécessitant un consentement sont ajoutés ultérieurement, le dispositif d'information et de choix sera adapté avant leur activation.</p>
   </section>
   <section style={box}><h2 style={{color:gold}}>10 — Mise à jour</h2>
    <p>Cette politique peut évoluer afin de refléter les changements du site, de nos prestataires ou de la réglementation. La date de la version en vigueur est indiquée en haut de cette page.</p>
   </section>
   <div style={{marginTop:45,paddingTop:25,borderTop:`1px solid ${border}`}}><Link href="/" style={{color:gold,textDecoration:"none"}}>← Retour au catalogue</Link></div>
  </article>
 </section></main>
}
