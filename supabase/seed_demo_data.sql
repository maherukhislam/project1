-- Demo data seed for StudyGlobal.
-- Run after auth users are reset and after running reset_all.sql.

begin;

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
  );

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
  );

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intake_periods,
  scholarship_available
)
select id, 'Computer Science', 'Master', '2 years', 52000, 3.2, 6.5, 'Fall, Spring', true
from public.universities where name = 'Harvard University';

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intake_periods,
  scholarship_available
)
select id, 'Business Administration', 'Bachelor', '4 years', 48000, 3.0, 6.0, 'Fall', true
from public.universities where name = 'University of Oxford';

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intake_periods,
  scholarship_available
)
select id, 'Data Science', 'Master', '1.5 years', 32000, 3.1, 6.5, 'Fall, Winter', true
from public.universities where name = 'University of Toronto';

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intake_periods,
  scholarship_available
)
select id, 'Mechanical Engineering', 'Bachelor', '4 years', 36000, 3.0, 6.0, 'Spring, Fall', false
from public.universities where name = 'University of Melbourne';

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intake_periods,
  scholarship_available
)
select id, 'Robotics and AI', 'Master', '2 years', 5000, 3.3, 6.5, 'Fall', true
from public.universities where name = 'Technical University of Munich';

insert into public.programs (
  university_id,
  name,
  degree_level,
  duration,
  tuition_fee,
  min_gpa_required,
  min_english_score,
  intake_periods,
  scholarship_available
)
select id, 'Civil Engineering', 'Master', '2 years', 17000, 3.0, 6.5, 'Fall, Spring', false
from public.universities where name = 'Delft University of Technology';

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
from public.universities where name = 'Harvard University';

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
from public.universities where name = 'University of Toronto';

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
from public.universities where name = 'Technical University of Munich';

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
  (select id from auth.users where email = 'admin@studyglobal.com' limit 1);

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
  (select id from auth.users where email = 'admin@studyglobal.com' limit 1);

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

commit;
