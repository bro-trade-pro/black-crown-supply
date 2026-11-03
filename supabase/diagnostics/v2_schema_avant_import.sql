-- BLACK CROWN SUPPLY V2 — diagnostic lecture seule avant import définitif
-- Aucune suppression, insertion ou modification.
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public'
  and table_name in ('products','categories','product_variants')
order by table_name, ordinal_position;

select 'products' as source, count(*) as total from public.products
union all
select 'product_variants', count(*) from public.product_variants;
