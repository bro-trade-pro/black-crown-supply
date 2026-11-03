-- Black Crown Supply V2 — Import des 10 Crochets (catégorie 3)
-- Idempotent : une nouvelle exécution met à jour les mêmes fiches.
-- Ne touche pas aux mèches ni aux cosmétiques.
INSERT INTO public.products (nom, slug, category_id, prix_ttc_cents, actif)
VALUES
 ('Boho Curl Europe USA','v2-boho-curl-europe-usa',3,335,true),
 ('Boho Passion Twist Best Seller','v2-boho-passion-twist-best-seller',3,347,true),
 ('Boucle italienne double petite','v2-boucle-italienne-double-petite',3,215,true),
 ('Boucle italienne synthétique','v2-boucle-italienne-synthetique',3,215,true),
 ('Crochet Braid Twist africaine','v2-crochet-braid-twist-africaine',3,203,true),
 ('Deep Wave Bulk longue','v2-deep-wave-bulk-longue',3,383,true),
 ('Loose Wave Crochet Europe USA','v2-loose-wave-crochet-europe-usa',3,311,true),
 ('Marley Braid grosse chenille','v2-marley-braid-grosse-chenille',3,359,true),
 ('Ondulation corps export','v2-ondulation-corps-export',3,203,true),
 ('Spring Twist petite boucle','v2-spring-twist-petite-boucle',3,395,true)
ON CONFLICT (slug) DO UPDATE SET
 nom=EXCLUDED.nom,
 category_id=EXCLUDED.category_id,
 prix_ttc_cents=EXCLUDED.prix_ttc_cents,
 actif=EXCLUDED.actif;

SELECT nom, prix_ttc_cents, image_url FROM public.products
WHERE category_id=3 ORDER BY nom;