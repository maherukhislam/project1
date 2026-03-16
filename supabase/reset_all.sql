-- WARNING: This deletes ALL data in the public schema tables for this app.
-- Run in Supabase SQL editor with service role.

begin;

truncate table
  public.applications,
  public.documents,
  public.scholarships,
  public.programs,
  public.universities,
  public.countries,
  public.blog_posts,
  public.profiles
restart identity cascade;

commit;
