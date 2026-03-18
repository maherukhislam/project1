-- Fix recursive RLS policies on public.profiles.
--
-- Run this in the Supabase SQL editor with a service-role connection.
-- The previous policy likely queried public.profiles from inside a
-- public.profiles policy, which causes:
--   infinite recursion detected in policy for relation "profiles"

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format(
      'drop policy if exists %I on public.profiles',
      policy_row.policyname
    );
  end loop;
end
$$;

create policy "Profiles select own or admin"
on public.profiles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
);

create policy "Profiles insert own or admin"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = user_id
  or public.is_admin()
);

create policy "Profiles update own or admin"
on public.profiles
for update
to authenticated
using (
  auth.uid() = user_id
  or public.is_admin()
)
with check (
  auth.uid() = user_id
  or public.is_admin()
);

create policy "Profiles delete admin only"
on public.profiles
for delete
to authenticated
using (public.is_admin());
