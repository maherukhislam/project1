-- Admin RLS policies for managing destinations (countries) table
-- Run this in Supabase SQL Editor to enable admin CRUD operations on destinations

-- Ensure RLS is enabled
alter table public.countries enable row level security;

-- Create or replace the is_admin function if it doesn't exist
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
    and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Drop existing policies to avoid conflicts
drop policy if exists "Public read countries" on public.countries;
drop policy if exists "Admin manage countries" on public.countries;

-- Public read access for all users (anonymous and authenticated)
create policy "Public read countries"
on public.countries
for select
to anon, authenticated
using (true);

-- Admin full CRUD access (insert, update, delete)
create policy "Admin manage countries"
on public.countries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
