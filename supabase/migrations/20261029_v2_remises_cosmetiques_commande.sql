-- Black Crown Supply V2 : appliquer les remises cosmétiques côté serveur.
-- Utilise la fonction passer_commande EXISTANTE : conserve contrôles, livraison et acompte.
-- Exécuter une seule fois dans Supabase SQL Editor. Transaction atomique.
BEGIN;
DO $migration$
DECLARE
  v_source text;
  v_marker text := '  -- 4. Calcul des frais de livraison.';
  v_patch text := $patch$
  -- V2 : recalcul des lignes avec remises cosmétiques PAR PRODUIT,
  -- y compris si une référence apparaît dans plusieurs lignes/variantes.
  -- Ne fait jamais confiance aux prix envoyés par le navigateur.
  DECLARE
    v_ligne jsonb;
    v_qte_ref bigint;
    v_categorie integer;
    v_base_ht bigint;
    v_prix_remise bigint;
    v_lignes_recalculees jsonb := '[]'::jsonb;
  BEGIN
    v_total_produits := 0;
    FOR v_ligne IN SELECT value FROM jsonb_array_elements(v_articles_valides)
    LOOP
      SELECT p.category_id INTO v_categorie
      FROM public.products p WHERE p.id = (v_ligne->>'productId')::uuid;

      v_prix_remise := (v_ligne->>'prixCents')::bigint;
      IF v_categorie = 2 THEN
        SELECT sum((e.value->>'quantite')::bigint)
        INTO v_qte_ref
        FROM jsonb_array_elements(v_articles_valides) e(value)
        WHERE (e.value->>'productId')::uuid = (v_ligne->>'productId')::uuid;

        -- Même convention que le panier : arrondi HT au centime,
        -- remise sur prix unitaire HT, puis reconversion TTC.
        v_base_ht := round(v_prix_remise::numeric / 1.20);
        IF v_qte_ref >= 24 THEN
          v_base_ht := round(v_base_ht * 0.90);
        ELSIF v_qte_ref >= 12 THEN
          v_base_ht := round(v_base_ht * 0.95);
        END IF;
        v_prix_remise := round(v_base_ht * 1.20);
      END IF;

      v_total_produits := v_total_produits
        + v_prix_remise * (v_ligne->>'quantite')::bigint;
      v_lignes_recalculees := v_lignes_recalculees ||
        jsonb_build_array(jsonb_set(v_ligne, '{prixCents}', to_jsonb(v_prix_remise)));
    END LOOP;
    IF v_total_produits > 2147482207 THEN
      RAISE EXCEPTION 'Montant de commande trop élevé.';
    END IF;
    v_articles_valides := v_lignes_recalculees;
  END;

$patch$;
BEGIN
  SELECT pg_get_functiondef(p.oid)
  INTO v_source
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='passer_commande'
    AND pg_get_function_identity_arguments(p.oid) = 'p_articles jsonb, p_commentaire text, p_demande text';

  IF v_source IS NULL THEN
    RAISE EXCEPTION 'Fonction passer_commande(jsonb,text,text) introuvable : aucune modification.';
  END IF;
  IF position('V2 : recalcul des lignes avec remises cosmétiques' in v_source) > 0 THEN
    RAISE NOTICE 'Remises déjà installées : aucune modification.';
    RETURN;
  END IF;
  IF position(v_marker in v_source) = 0 THEN
    RAISE EXCEPTION 'Structure de la fonction modifiée : aucune modification.';
  END IF;
  v_source := replace(v_source, v_marker, v_patch || v_marker);
  EXECUTE v_source;
END
$migration$;
COMMIT;

-- Contrôle de présence du correctif (sans créer de commande).
SELECT position(
 'V2 : recalcul des lignes avec remises cosmétiques'
 IN pg_get_functiondef('public.passer_commande(jsonb,text,text)'::regprocedure)
) > 0 AS remise_serveur_installee;
