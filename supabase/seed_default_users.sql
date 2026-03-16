-- Default profiles for local/demo use.
-- Auth users should be created via the Admin API script:
-- `npm run seed:users`

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
