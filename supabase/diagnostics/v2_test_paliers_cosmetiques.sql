-- TEST LECTURE SEULE : aucun achat ni modification.
-- Contrôle les paliers et la cohérence TTC sur les 12 cosmétiques.
WITH quantites(qte) AS (VALUES (1),(11),(12),(23),(24),(30)),
calcul AS (
 SELECT p.nom,p.prix_ttc_cents AS base_ttc_cents,q.qte,
 round(p.prix_ttc_cents::numeric / 1.20)::integer AS base_ht_cents,
 CASE WHEN q.qte>=24 THEN 0.90
      WHEN q.qte>=12 THEN 0.95 ELSE 1.00 END AS coefficient
 FROM public.products p CROSS JOIN quantites q
 WHERE p.category_id=2 AND p.actif=true
), resultats AS (
 SELECT nom,qte,base_ttc_cents,
 round(round(base_ht_cents*coefficient)*1.20)::integer AS prix_unitaire_ttc_cents
 FROM calcul
)
SELECT nom,qte,base_ttc_cents,prix_unitaire_ttc_cents,
 qte*prix_unitaire_ttc_cents AS total_ligne_ttc_cents
FROM resultats ORDER BY nom,qte;

-- Vérifier que la fonction de commande comporte le correctif.
SELECT position(
 'V2 : recalcul des lignes avec remises cosmétiques'
 IN pg_get_functiondef('public.passer_commande(jsonb,text,text)'::regprocedure)
) > 0 AS remise_serveur_installee;
