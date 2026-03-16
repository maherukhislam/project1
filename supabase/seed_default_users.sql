-- Default users for local/demo use.
-- Run this in Supabase SQL editor (service role).

-- Ensure required extensions
create extension if not exists pgcrypto;

-- Admin user
insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
values (
  gen_random_uuid(),
  'admin@studyglobal.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Admin","role":"admin"}'::jsonb,
  'authenticated',
  'authenticated'
)
where not exists (
  select 1 from auth.users where email = 'admin@studyglobal.com'
);

-- Demo student user
insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
values (
  gen_random_uuid(),
  'student@studyglobal.com',
  crypt('Student123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Demo Student","role":"student"}'::jsonb,
  'authenticated',
  'authenticated'
)
where not exists (
  select 1 from auth.users where email = 'student@studyglobal.com'
);

-- Profiles (assumes a profiles table with user_id, name, email, role columns)
insert into public.profiles (user_id, name, email, role, profile_completion, created_at)
select id, 'Admin', email, 'admin', 100, now()
from auth.users
where email = 'admin@studyglobal.com'
on conflict (user_id) do nothing;

insert into public.profiles (user_id, name, email, role, profile_completion, created_at)
select id, 'Demo Student', email, 'student', 40, now()
from auth.users
where email = 'student@studyglobal.com'
on conflict (user_id) do nothing;
