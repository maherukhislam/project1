-- Public read policies for anonymous browsing pages.
-- Run this in Supabase SQL editor for your project.

-- Countries
alter table public.countries enable row level security;
drop policy if exists "Public read countries" on public.countries;
create policy "Public read countries"
on public.countries
for select
to anon, authenticated
using (true);

-- Universities
alter table public.universities enable row level security;
drop policy if exists "Public read universities" on public.universities;
create policy "Public read universities"
on public.universities
for select
to anon, authenticated
using (true);

-- Programs
alter table public.programs enable row level security;
drop policy if exists "Public read programs" on public.programs;
create policy "Public read programs"
on public.programs
for select
to anon, authenticated
using (true);

-- Scholarships
alter table public.scholarships enable row level security;
drop policy if exists "Public read scholarships" on public.scholarships;
create policy "Public read scholarships"
on public.scholarships
for select
to anon, authenticated
using (true);

-- Blog posts
alter table public.blog_posts enable row level security;
drop policy if exists "Public read blog posts" on public.blog_posts;
create policy "Public read blog posts"
on public.blog_posts
for select
to anon, authenticated
using (true);
