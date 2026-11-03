-- Black Crown Supply V2: rôles administrateurs indépendants des comptes de test.
-- À exécuter dans le SQL Editor du projet Supabase concerné.
-- Les utilisateurs doivent d'abord être créés/invités dans Supabase Auth.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- Ne pas créer de policy d'écriture côté client : service_role / SQL Editor uniquement.
revoke all on public.admin_users from anon, authenticated;
-- Autoriser uniquement la lecture de son propre statut administrateur.
grant select on public.admin_users to authenticated;
drop policy if exists "read own admin status" on public.admin_users;
create policy "read own admin status"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

-- Lier les 2 administrateurs UNIQUEMENT si leurs comptes Auth existent.
insert into public.admin_users (user_id)
select id from auth.users
where lower(email) in ('flo.blackcrownsup@gmail.com', 'benoit.lemegre@gmail.com')
on conflict (user_id) do nothing;

-- Contrôle : doit retourner exactement deux lignes après création des comptes Auth.
select u.email, a.created_at
from public.admin_users a join auth.users u on u.id = a.user_id
order by u.email;
