import Link from "next/link";

const gold = "#c8a75b";
const cream = "#f4efe4";
const border = "#40351f";

export default function CGVPage() {
  return (
    <main className="productPage">
      <section className="content productContent">
        <header>
          <span>BLACK CROWN SUPPLY</span>
          <div>Conditions générales de vente · Professionnels</div>
        </header>

        <article style={{ maxWidth: 950, margin: "0 auto", padding: "55px 25px 100px", color: cream, lineHeight: 1.75 }}>
          <p className="eyebrow">BRO TRADE PRO · BLACK CROWN SUPPLY</p>
          <h1 style={{ fontSize: "clamp(34px,5vw,56px)", marginBottom: 10 }}>Conditions générales de vente</h1>
          <p style={{ color: "#aaa", marginBottom: 40 }}>Ventes exclusivement destinées aux professionnels · Version du 7 octobre 2026</p>

          <Section title="1 — Identité du vendeur">
            <p>
              Les présentes conditions générales de vente (CGV) sont celles de BRO TRADE PRO, société par actions simplifiée au capital de 5 000 €, immatriculée au RCS d'Évry sous le numéro 107 209 991, dont le siège social est situé 8 Allée Marie Hackin, 91080 Évry-Courcouronnes, exploitant sous le nom commercial BLACK CROWN SUPPLY.
            </p>
          </Section>

          <Section title="2 — Champ d'application">
            <p>
              Les présentes CGV s'appliquent aux ventes de produits proposées par BLACK CROWN SUPPLY à des clients agissant à des fins professionnelles, notamment les salons de coiffure et autres professionnels du secteur. Toute commande implique l'acceptation des présentes CGV dans leur version applicable au jour de la commande.
            </p>
          </Section>

          <Section title="3 — Produits et disponibilité">
            <p>
              Les caractéristiques essentielles des produits sont présentées sur le site. Les photographies et visuels sont fournis à titre illustratif. Les offres sont valables dans la limite des stocks disponibles. En cas d'indisponibilité après commande, BLACK CROWN SUPPLY informe le client et propose, selon la situation, un produit de remplacement, un avoir ou le remboursement des sommes correspondant aux produits indisponibles.
            </p>
          </Section>

          <Section title="4 — Prix">
            <p>
              Les prix applicables sont ceux affichés sur le site au moment de la commande. Le catalogue indique les prix TTC et le récapitulatif de commande présente les montants correspondants. BLACK CROWN SUPPLY peut modifier ses tarifs à tout moment, sans effet rétroactif sur une commande déjà enregistrée.
            </p>
            <p>
              Sauf accord commercial particulier expressément accepté par BLACK CROWN SUPPLY, aucune réduction, remise ou ristourne n'est acquise au client. Aucun escompte n'est accordé pour paiement anticipé.
            </p>
          </Section>

          <Section title="5 — Commande">
            <p>
              Le client vérifie le contenu de son panier, les quantités, variantes éventuelles, coordonnées de livraison et montants avant validation. La commande est enregistrée après sa confirmation sur le site. BLACK CROWN SUPPLY se réserve le droit de refuser ou suspendre une commande en cas d'informations manifestement erronées, d'incident de paiement antérieur, de suspicion de fraude ou d'impossibilité d'approvisionnement.
            </p>
          </Section>

          <Section title="6 — Paiement">
            <p>
              Sauf conditions particulières convenues par écrit, le règlement s'effectue en deux échéances : un acompte de 50 % du montant total TTC de la commande, frais de livraison compris, puis le solde de 50 % au plus tard lors de la livraison. La préparation de la commande peut être suspendue jusqu'à l'encaissement effectif de l'acompte.
            </p>
            <p>
              En cas de retard de paiement, des pénalités sont exigibles de plein droit dès le jour suivant la date d'échéance, sans rappel préalable, au taux de refinancement de la Banque centrale européenne applicable majoré de 10 points de pourcentage. Tout professionnel en retard de paiement est également redevable de plein droit d'une indemnité forfaitaire de 40 € pour frais de recouvrement. Une indemnisation complémentaire peut être réclamée, sur justificatifs, lorsque les frais de recouvrement réellement engagés sont supérieurs à ce montant.
            </p>
          </Section>

          <Section title="7 — Livraison">
            <p>
              Les frais de livraison sont de 12 € HT (14,40 € TTC au taux de TVA de 20 %) pour toute commande dont le montant des produits est inférieur à 500 € HT. La livraison est offerte à partir de 500 € HT de produits, soit 600 € TTC au taux de TVA de 20 %.
            </p>
            <p>
              Les délais éventuellement communiqués sont estimatifs sauf engagement écrit contraire. Le client doit fournir une adresse et des informations permettant la livraison. Tout surcoût résultant d'une adresse erronée, d'une absence ou d'une impossibilité de livraison imputable au client pourra lui être facturé.
            </p>
          </Section>

          <Section title="8 — Réception et réclamations">
            <p>
              Le client est tenu de vérifier l'état, les références et les quantités des marchandises lors de leur réception. Toute anomalie apparente, produit manquant ou dommage lié au transport doit être signalé sans délai et, lorsque cela est applicable, faire l'objet de réserves précises auprès du transporteur. Le client doit ensuite contacter BLACK CROWN SUPPLY dans les meilleurs délais avec les éléments permettant de traiter sa réclamation, notamment le numéro de commande et des photographies en cas de dommage.
            </p>
          </Section>

          <Section title="9 — Retours">
            <p>
              Les ventes sont conclues entre professionnels. Aucun retour ne peut être effectué sans accord préalable de BLACK CROWN SUPPLY. Les modalités de retour, d'échange, d'avoir ou de remboursement sont déterminées selon la nature de la réclamation et les obligations légales applicables. Les produits retournés sans autorisation préalable peuvent être refusés.
            </p>
          </Section>

          <Section title="10 — Réserve de propriété">
            <p>
              BLACK CROWN SUPPLY conserve la propriété des marchandises vendues jusqu'au paiement intégral du prix, principal et accessoires. Le client s'engage à conserver les marchandises de manière à permettre leur identification jusqu'au complet paiement.
            </p>
          </Section>

          <Section title="11 — Responsabilité">
            <p>
              BLACK CROWN SUPPLY répond des obligations qui lui incombent en vertu de la loi et du contrat. Sa responsabilité ne saurait être engagée pour les conséquences d'une utilisation des produits non conforme à leur destination, aux instructions du fabricant ou aux règles professionnelles applicables. BLACK CROWN SUPPLY ne saurait davantage être tenue responsable d'un retard ou d'une inexécution résultant d'un cas de force majeure au sens du droit français.
            </p>
          </Section>

          <Section title="12 — Données personnelles">
            <p>
              Les données communiquées par le client sont utilisées pour la création et la gestion du compte professionnel, le traitement des commandes, la livraison, la facturation, le service client et le respect des obligations légales de BRO TRADE PRO. Les modalités détaillées relatives aux données personnelles sont précisées dans la politique de confidentialité du site.
            </p>
          </Section>

          <Section title="13 — Propriété intellectuelle">
            <p>
              Les éléments du site BLACK CROWN SUPPLY, notamment sa marque, ses textes, graphismes, visuels et éléments de présentation, sont protégés par les droits de propriété intellectuelle applicables. Leur reproduction ou exploitation sans autorisation préalable est interdite, sous réserve des droits appartenant à des tiers.
            </p>
          </Section>

          <Section title="14 — Droit applicable et litiges">
            <p>
              Les présentes CGV et les ventes auxquelles elles s'appliquent sont régies par le droit français. En cas de différend, les parties rechercheront en priorité une solution amiable. À défaut, le litige sera porté devant la juridiction compétente selon les règles de procédure applicables.
            </p>
          </Section>

          <Section title="15 — Modification des CGV">
            <p>
              BLACK CROWN SUPPLY peut modifier les présentes CGV. La version opposable à une commande est celle acceptée par le client lors de sa validation.
            </p>
          </Section>

          <div style={{ marginTop: 45, paddingTop: 25, borderTop: `1px solid ${border}` }}>
            <Link href="/" style={{ color: gold, textDecoration: "none" }}>← Retour au catalogue</Link>
          </div>
        </article>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 32, padding: "24px 26px", background: "#171512", border: `1px solid ${border}` }}>
      <h2 style={{ color: gold, fontSize: 19, marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}
