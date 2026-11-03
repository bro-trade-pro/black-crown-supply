-- V2 : suppression des ANCIENNES mèches (catégorie 1).
-- À exécuter uniquement après vérification que les commandes de test sont vidées.
-- N'affecte pas les cosmétiques (catégorie 2) ni les autres catégories.
-- Transaction : si une contrainte empêche la suppression, tout est annulé.
begin;
delete from public.product_variants
where product_id in (select id from public.products where category_id = 1);
delete from public.products where category_id = 1;
commit;

-- Contrôle : zéro ancienne mèche attendu.
select count(*) as anciennes_meches_restantes
from public.products where category_id = 1;
