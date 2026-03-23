-- Fix for Supabase Security Linter Warnings
-- This script sets immutable search_path on functions to prevent search_path injection attacks
-- Run this in the Supabase SQL editor

begin;

-- Fix set_updated_at function - add search_path parameter
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fix notify_user function - add search_path parameter
create or replace function public.notify_user(
  p_user_id uuid,
  p_type    text,
  p_title   text,
  p_message text default null,
  p_link    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, link)
  values (p_user_id, p_type, p_title, p_message, p_link);
end;
$$;

commit;

-- NOTE: For the "Leaked Password Protection Disabled" warning:
-- This must be enabled in the Supabase Dashboard:
-- 1. Go to Authentication > Providers > Email
-- 2. Enable "Leaked password protection"
-- This feature checks passwords against HaveIBeenPwned.org database
