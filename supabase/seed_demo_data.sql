-- Demo data seed for StudyGlobal.
-- Run after auth users are reset and after running reset_all.sql.

begin;

-- One-time dedupe cleanup for environments where seed was run multiple times.
delete from public.programs p
using public.programs p2
where p.id < p2.id
  and p.university_id = p2.university_id
  and p.name = p2.name
  and p.degree_level = p2.degree_level;

delete from public.scholarships s
using public.scholarships s2
where s.id < s2.id
  and s.university_id = s2.university_id
  and s.name = s2.name;

insert into public.countries (
  name,
  description,
  flag_emoji,
  image_url,
  university_count,
  avg_tuition,
  intl_students,
  popular_cities,
  highlights
)
values
  (
    'United States',
    'Home to world-leading research institutions and a flexible education system.',
    'US',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop',
    1200,
    35000,
    '1,000,000+',
    'New York, Boston, Chicago, San Francisco',
    'Top-ranked universities, diverse campuses, strong research'
  ),
  (
    'United Kingdom',
    'Historic universities with globally recognized degrees and strong career outcomes.',
    'UK',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop',
    160,
    28000,
    '500,000+',
    'London, Manchester, Edinburgh, Birmingham',
    'One-year masters, global reputation, vibrant cities'
  ),
  (
    'Canada',
    'High-quality education with a welcoming, multicultural environment.',
    'CA',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
    100,
    24000,
    '400,000+',
    'Toronto, Vancouver, Montreal, Ottawa',
    'Post-study work options, safe cities, strong STEM'
  ),
  (
    'Australia',
    'Top universities, excellent student support, and a strong job market.',
    'AU',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    120,
    26000,
    '700,000+',
    'Sydney, Melbourne, Brisbane, Perth',
    'High quality of life, research excellence, coastal lifestyle'
  ),
  (
    'Germany',
    'Affordable education with world-class engineering and research.',
    'DE',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop',
    90,
    8000,
    '350,000+',
    'Berlin, Munich, Hamburg, Frankfurt',
    'Low tuition, strong industry links, innovation hubs'
  ),
  (
    'Netherlands',
    'English-taught programs and a strong international student community.',
    'NL',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
    60,
    18000,
    '120,000+',
    'Amsterdam, Rotterdam, Utrecht, Eindhoven',
    'English programs, innovative teaching, EU access'
  )
on conflict (name) do update
set
  description = excluded.description,
  flag_emoji = excluded.flag_emoji,
  image_url = excluded.image_url,
  university_count = excluded.university_count,
  avg_tuition = excluded.avg_tuition,
  intl_students = excluded.intl_students,
  popular_cities = excluded.popular_cities,
  highlights = excluded.highlights;

insert into public.universities (
  name,
  country,
  description,
  ranking,
  logo_url,
  tuition_min,
  tuition_max,
  acceptance_rate
)
values
  (
    'Harvard University',
    'United States',
    'An Ivy League institution known for excellence across disciplines.',
    1,
    'https://upload.wikimedia.org/wikipedia/en/2/29/Harvard_shield_wreath.svg',
    45000,
    55000,
    4.0
  ),
  (
    'University of Oxford',
    'United Kingdom',
    'Historic university with world-leading research and teaching.',
    2,
    'https://upload.wikimedia.org/wikipedia/en/d/d1/Oxford_University_Circlet.svg',
    32000,
    44000,
    17.0
  ),
  (
    'University of Toronto',
    'Canada',
    'Top-ranked Canadian university with strong global reputation.',
    18,
    'https://upload.wikimedia.org/wikipedia/en/0/0b/UofT_Logo.svg',
    22000,
    36000,
    43.0
  ),
  (
    'University of Melbourne',
    'Australia',
    'Leading Australian university with comprehensive programs.',
    14,
    'https://upload.wikimedia.org/wikipedia/en/4/49/University_of_Melbourne_coat_of_arms.svg',
    24000,
    38000,
    30.0
  ),
  (
    'Technical University of Munich',
    'Germany',
    'Renowned for engineering and innovation with strong industry ties.',
    28,
    'https://upload.wikimedia.org/wikipedia/commons/9/9e/TUM_Logo.svg',
    1000,
    6000,
    20.0
  ),
  (
    'Delft University of Technology',
    'Netherlands',
    'Top technical university with strong engineering programs.',
    47,
    'https://upload.wikimedia.org/wikipedia/en/2/2d/TU_Delft_logo.svg',
    11000,
    19000,
    25.0
  )
on conflict (name) do update
set
  country = excluded.country,
  description = excluded.description,
  ranking = excluded.ranking,
  logo_url = excluded.logo_url,
  tuition_min = excluded.tuition_min,
  tuition_max = excluded.tuition_max,
  acceptance_rate = excluded.acceptance_rate;

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intakes,
  intake_periods,
  scholarship_available
)
select id, 'Computer Science', 'Master', '2 years', 52000, 3.2, 6.5,
  '[
    {"name":"Fall","year":2026,"application_deadline":"2026-07-15T00:00:00Z","start_date":"2026-09-05T00:00:00Z","status":"Open"},
    {"name":"Spring","year":2027,"application_deadline":"2026-11-15T00:00:00Z","start_date":"2027-01-10T00:00:00Z","status":"Upcoming"}
  ]'::jsonb,
  'Fall 2026, Spring 2027', true
from public.universities u
where u.name = 'Harvard University'
  and not exists (
    select 1
    from public.programs p
    where p.university_id = u.id
      and p.name = 'Computer Science'
      and p.degree_level = 'Master'
  );
insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intakes,
  intake_periods,
  scholarship_available
)
select id, 'Business Administration', 'Bachelor', '4 years', 48000, 3.0, 6.0,
  '[{"name":"Fall","year":2026,"application_deadline":"2026-06-30T00:00:00Z","start_date":"2026-09-20T00:00:00Z","status":"Open"}]'::jsonb,
  'Fall 2026', true
from public.universities u
where u.name = 'University of Oxford'
  and not exists (
    select 1
    from public.programs p
    where p.university_id = u.id
      and p.name = 'Business Administration'
      and p.degree_level = 'Bachelor'
  );

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intakes,
  intake_periods,
  scholarship_available
)
select id, 'Data Science', 'Master', '1.5 years', 32000, 3.1, 6.5,
  '[
    {"name":"Fall","year":2026,"application_deadline":"2026-08-01T00:00:00Z","start_date":"2026-09-15T00:00:00Z","status":"Open"},
    {"name":"Winter","year":2027,"application_deadline":"2026-10-20T00:00:00Z","start_date":"2027-01-05T00:00:00Z","status":"Upcoming"}
  ]'::jsonb,
  'Fall 2026, Winter 2027', true
from public.universities u
where u.name = 'University of Toronto'
  and not exists (
    select 1
    from public.programs p
    where p.university_id = u.id
      and p.name = 'Data Science'
      and p.degree_level = 'Master'
  );

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intakes,
  intake_periods,
  scholarship_available
)
select id, 'Mechanical Engineering', 'Bachelor', '4 years', 36000, 3.0, 6.0,
  '[
    {"name":"Spring","year":2027,"application_deadline":"2026-10-15T00:00:00Z","start_date":"2027-02-02T00:00:00Z","status":"Upcoming"},
    {"name":"Fall","year":2026,"application_deadline":"2026-06-20T00:00:00Z","start_date":"2026-09-01T00:00:00Z","status":"Open"}
  ]'::jsonb,
  'Spring 2027, Fall 2026', false
from public.universities u
where u.name = 'University of Melbourne'
  and not exists (
    select 1
    from public.programs p
    where p.university_id = u.id
      and p.name = 'Mechanical Engineering'
      and p.degree_level = 'Bachelor'
  );

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intakes,
  intake_periods,
  scholarship_available
)
select id, 'Robotics and AI', 'Master', '2 years', 5000, 3.3, 6.5,
  '[{"name":"Fall","year":2026,"application_deadline":"2026-05-30T00:00:00Z","start_date":"2026-10-01T00:00:00Z","status":"Open"}]'::jsonb,
  'Fall 2026', true
from public.universities u
where u.name = 'Technical University of Munich'
  and not exists (
    select 1
    from public.programs p
    where p.university_id = u.id
      and p.name = 'Robotics and AI'
      and p.degree_level = 'Master'
  );

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intakes,
  intake_periods,
  scholarship_available
)
select id, 'Civil Engineering', 'Master', '2 years', 17000, 3.0, 6.5,
  '[
    {"name":"Fall","year":2026,"application_deadline":"2026-07-20T00:00:00Z","start_date":"2026-09-10T00:00:00Z","status":"Open"},
    {"name":"Spring","year":2027,"application_deadline":"2026-12-01T00:00:00Z","start_date":"2027-02-01T00:00:00Z","status":"Upcoming"}
  ]'::jsonb,
  'Fall 2026, Spring 2027', false
from public.universities u
where u.name = 'Delft University of Technology'
  and not exists (
    select 1
    from public.programs p
    where p.university_id = u.id
      and p.name = 'Civil Engineering'
      and p.degree_level = 'Master'
  );

insert into public.scholarships (
  name,
  university_id,
  funding_type,
  amount,
  description,
  eligibility,
  min_gpa_required,
  deadline
)
select
  'Global Merit Scholarship',
  id,
  'Full',
  50000,
  'Covers tuition and living expenses for top applicants.',
  'Strong academic record, leadership, community involvement.',
  3.6,
  now() + interval '90 days'
from public.universities u
where u.name = 'Harvard University'
  and not exists (
    select 1
    from public.scholarships s
    where s.university_id = u.id
      and s.name = 'Global Merit Scholarship'
  );

insert into public.scholarships (
  name,
  university_id,
  funding_type,
  amount,
  description,
  eligibility,
  min_gpa_required,
  deadline
)
select
  'Excellence Award',
  id,
  'Partial',
  15000,
  'Merit-based partial tuition support.',
  'GPA 3.2+, strong personal statement.',
  3.2,
  now() + interval '120 days'
from public.universities u
where u.name = 'University of Toronto'
  and not exists (
    select 1
    from public.scholarships s
    where s.university_id = u.id
      and s.name = 'Excellence Award'
  );

insert into public.scholarships (
  name,
  university_id,
  funding_type,
  amount,
  description,
  eligibility,
  min_gpa_required,
  deadline
)
select
  'Innovation Grant',
  id,
  'Tuition',
  8000,
  'Supports innovative student projects.',
  'STEM applicants with project portfolio.',
  3.0,
  now() + interval '150 days'
from public.universities u
where u.name = 'Technical University of Munich'
  and not exists (
    select 1
    from public.scholarships s
    where s.university_id = u.id
      and s.name = 'Innovation Grant'
  );

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  image_url,
  category,
  published,
  created_at,
  author_id
)
select
  'How to Choose the Right University',
  'how-to-choose-the-right-university',
  'A practical guide to evaluating programs, campus culture, and outcomes.',
  'Choosing a university is about fit, outcomes, and long-term goals. Start with your program, then compare locations, costs, and support services.',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
  'Study Guides',
  true,
  now(),
  (select id from auth.users where email = 'admin@studyglobal.com' limit 1)
on conflict (slug) do update
set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  image_url = excluded.image_url,
  category = excluded.category,
  published = excluded.published,
  created_at = excluded.created_at,
  author_id = excluded.author_id;

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  image_url,
  category,
  published,
  created_at,
  author_id
)
select
  'Visa Checklist for First-Time Applicants',
  'visa-checklist-for-first-time-applicants',
  'Everything you need to prepare before your embassy appointment.',
  'Gather documents early, show financial proof, and prepare for common interview questions.',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600&auto=format&fit=crop',
  'Visa Tips',
  true,
  now() - interval '7 days',
  (select id from auth.users where email = 'admin@studyglobal.com' limit 1)
on conflict (slug) do update
set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  image_url = excluded.image_url,
  category = excluded.category,
  published = excluded.published,
  created_at = excluded.created_at,
  author_id = excluded.author_id;

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

-- Enrich existing student profiles for admin testing views.
with ranked_students as (
  select
    p.id,
    p.user_id,
    p.email,
    row_number() over (order by p.created_at, p.id) as idx
  from public.profiles p
  where p.role = 'student'
)
update public.profiles p
set
  name = coalesce(nullif(p.name, ''), concat('Demo Student ', rs.idx)),
  phone = coalesce(p.phone, concat('+1-555-01', lpad(rs.idx::text, 2, '0'))),
  nationality = coalesce(p.nationality, case when rs.idx % 2 = 0 then 'Bangladeshi' else 'Indian' end),
  preferred_country = coalesce(p.preferred_country, case when rs.idx % 3 = 0 then 'Canada' when rs.idx % 3 = 1 then 'United States' else 'United Kingdom' end),
  education_level = coalesce(p.education_level, case when rs.idx % 2 = 0 then 'Bachelor' else 'High School' end),
  academic_system = coalesce(p.academic_system, 'SSC/HSC'),
  gpa = coalesce(p.gpa, case when rs.idx % 3 = 0 then 3.60 when rs.idx % 3 = 1 then 3.20 else 2.95 end),
  gpa_scale = coalesce(p.gpa_scale, 4.00),
  medium_of_instruction = coalesce(p.medium_of_instruction, 'English Medium'),
  english_test_type = coalesce(p.english_test_type, 'IELTS'),
  english_score = coalesce(p.english_score, case when rs.idx % 2 = 0 then 7.0 else 6.5 end),
  last_education_year = coalesce(p.last_education_year, 2024 - (rs.idx % 3)),
  study_level = coalesce(p.study_level, case when rs.idx % 2 = 0 then 'Master' else 'Bachelor' end),
  preferred_subject = coalesce(p.preferred_subject, case when rs.idx % 2 = 0 then 'Computer Science' else 'Business Administration' end),
  preferred_intake_name = coalesce(p.preferred_intake_name, case when rs.idx % 2 = 0 then 'Fall' else 'Spring' end),
  preferred_intake_year = coalesce(p.preferred_intake_year, 2027),
  intake = coalesce(p.intake, case when rs.idx % 2 = 0 then 'Fall 2027' else 'Spring 2027' end),
  budget_min = coalesce(p.budget_min, 8000),
  budget_max = coalesce(p.budget_max, case when rs.idx % 2 = 0 then 28000 else 22000 end),
  profile_completion = greatest(coalesce(p.profile_completion, 0), 75)
from ranked_students rs
where p.id = rs.id;

-- Add demo documents for student users (idempotent).
with student_profiles as (
  select p.user_id, p.email
  from public.profiles p
  where p.role = 'student'
),
document_templates as (
  select *
  from (values
    ('passport', 'passport.pdf', 'verified'),
    ('transcript', 'transcript.pdf', 'pending'),
    ('cv', 'cv.pdf', 'verified')
  ) as t(document_type, file_name, status)
)
insert into public.documents (user_id, document_type, file_name, file_url, file_size, mime_type, status, created_at)
select
  sp.user_id,
  dt.document_type,
  dt.file_name,
  concat('https://files.demo.studyglobal.example/documents/', sp.user_id::text, '/', dt.file_name),
  245760,
  'application/pdf',
  dt.status,
  now()
from student_profiles sp
cross join document_templates dt
where not exists (
  select 1
  from public.documents d
  where d.user_id = sp.user_id
    and d.document_type = dt.document_type
);

-- Add demo applications for admin pipeline testing (idempotent).
with student_profiles as (
  select p.user_id, p.email, row_number() over (order by p.created_at, p.id) as idx
  from public.profiles p
  where p.role = 'student'
),
target_programs as (
  select id, name
  from public.programs
  where name in ('Computer Science', 'Data Science', 'Business Administration')
),
pairings as (
  select
    sp.user_id,
    tp.id as program_id,
    case
      when sp.idx % 3 = 0 then 'under_review'
      when sp.idx % 3 = 1 then 'submitted'
      else 'draft'
    end as status,
    case
      when sp.idx % 2 = 0 then 'Fall 2027'
      else 'Spring 2027'
    end as intake
  from student_profiles sp
  join target_programs tp
    on (sp.idx % 3 = 0 and tp.name = 'Computer Science')
    or (sp.idx % 3 = 1 and tp.name = 'Data Science')
    or (sp.idx % 3 = 2 and tp.name = 'Business Administration')
)
insert into public.applications (
  user_id,
  program_id,
  intake,
  notes,
  status,
  timeline,
  next_steps,
  created_at
)
select
  pr.user_id,
  pr.program_id,
  pr.intake,
  'Seeded demo application for admin testing.',
  pr.status,
  '[]'::jsonb,
  '[]'::jsonb,
  now()
from pairings pr
where not exists (
  select 1
  from public.applications a
  where a.user_id = pr.user_id
    and a.program_id = pr.program_id
);

commit;
