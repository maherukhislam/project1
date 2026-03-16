-- Default users for local/demo use.
-- Run this in Supabase SQL editor (service role).

-- Ensure required extensions
create extension if not exists pgcrypto;

-- Admin user
insert into auth.users (
  id,
  instance_id,
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
select
  gen_random_uuid(),
  (select id from auth.instances limit 1),
  'admin@studyglobal.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Admin","role":"admin"}'::jsonb,
  'authenticated',
  'authenticated'
where not exists (
  select 1 from auth.users where email = 'admin@studyglobal.com'
);

update auth.users
set
  encrypted_password = crypt('Admin123!', gen_salt('bf')),
  email_confirmed_at = now(),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = '{"name":"Admin","role":"admin"}'::jsonb,
  aud = 'authenticated',
  role = 'authenticated',
  updated_at = now()
where email = 'admin@studyglobal.com';

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.email,
  now(),
  now(),
  now()
from auth.users u
where u.email = 'admin@studyglobal.com'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );

-- Demo student user
insert into auth.users (
  id,
  instance_id,
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
select
  gen_random_uuid(),
  (select id from auth.instances limit 1),
  'student@studyglobal.com',
  crypt('Student123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Demo Student","role":"student"}'::jsonb,
  'authenticated',
  'authenticated'
where not exists (
  select 1 from auth.users where email = 'student@studyglobal.com'
);

update auth.users
set
  encrypted_password = crypt('Student123!', gen_salt('bf')),
  email_confirmed_at = now(),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = '{"name":"Demo Student","role":"student"}'::jsonb,
  aud = 'authenticated',
  role = 'authenticated',
  updated_at = now()
where email = 'student@studyglobal.com';

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.email,
  now(),
  now(),
  now()
from auth.users u
where u.email = 'student@studyglobal.com'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );
-- Profiles (assumes a profiles table with user_id, name, email, role columns)
insert into public.profiles (user_id, name, email, role, profile_completion, created_at)
select id, 'Admin', email, 'admin', 100, now()
from auth.users
where email = 'admin@studyglobal.com'
  and not exists (
    select 1 from public.profiles p
    where p.user_id = auth.users.id
  );

insert into public.profiles (user_id, name, email, role, profile_completion, created_at)
select id, 'Demo Student', email, 'student', 40, now()
from auth.users
where email = 'student@studyglobal.com'
  and not exists (
    select 1 from public.profiles p
    where p.user_id = auth.users.id
  );
