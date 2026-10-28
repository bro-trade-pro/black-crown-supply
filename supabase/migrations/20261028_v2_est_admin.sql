-- V2 : aligner la vérification d'accès du tableau de bord existant sur admin_users.
-- L'interface /admin appelle déjà supabase.rpc('est_admin').
-- À exécuter après la migration 20261028_v2_admin_users.sql.
create or replace function public.est_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.est_admin() from public, anon;
grant execute on function public.est_admin() to authenticated;

-- Vérification de la présence des comptes autorisés (sans simuler une session).
select u.email, a.user_id is not null as admin_actif
from auth.users u
left join public.admin_users a on a.user_id = u.id
where lower(u.email) in ('benoit.lemegre@gmail.com','flo.blackcrownsup@gmail.com')
order by u.email;
