-- V2 Black Crown Supply : 7 Brésiliennes, catégorie 4.
-- Prix TTC en centimes, TVA 20 %, tarifs HT validés.
INSERT INTO public.products (nom,slug,category_id,prix_ttc_cents,actif)
VALUES
('Mèche Brésilienne naturelle 10″','v2-meche-bresilienne-naturelle-10',4,2339,true),
('Tissage Brésilien lisse 100 % vierge naturelle','v2-tissage-bresilien-lisse-vierge-naturelle',4,1499,true),
('Tissage Brésilien naturel 8″','v2-tissage-bresilien-naturel-8',4,2099,true),
('Tissage Brésilien naturel 10″','v2-tissage-bresilien-naturel-10',4,2339,true),
('Tissage Brésilien naturel 12″','v2-tissage-bresilien-naturel-12',4,2099,true),
('Tissage Deep Wave naturel 10″','v2-tissage-deep-wave-naturel-10',4,2339,true),
('Tissage Kinky Curly naturel 8″','v2-tissage-kinky-curly-naturel-8',4,2099,true)
ON CONFLICT (slug) DO UPDATE SET
 nom=EXCLUDED.nom,
 category_id=EXCLUDED.category_id,
 prix_ttc_cents=EXCLUDED.prix_ttc_cents,
 actif=EXCLUDED.actif;
SELECT nom,prix_ttc_cents,image_url FROM public.products WHERE category_id=4 ORDER BY nom;