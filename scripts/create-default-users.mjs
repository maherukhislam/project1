import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const users = [
  {
    email: 'admin@studyglobal.com',
    password: 'Admin123!',
    name: 'Admin',
    role: 'admin',
    profile_completion: 100
  },
  {
    email: 'student@studyglobal.com',
    password: 'Student123!',
    name: 'Demo Student',
    role: 'student',
    profile_completion: 40
  }
];

async function ensureUser(user) {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });
  if (listError) throw listError;

  const existing = list?.users?.find((u) => u.email === user.email);

  if (existing) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      existing.id,
      {
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name, role: user.role }
      }
    );
    if (updateError) throw updateError;
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { name: user.name, role: user.role }
  });
  if (error) throw error;
  return data.user.id;
}

async function ensureProfile(userId, user) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_completion: user.profile_completion
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}

for (const user of users) {
  // eslint-disable-next-line no-console
  console.log(`Ensuring ${user.email}...`);
  const userId = await ensureUser(user);
  await ensureProfile(userId, user);
}

// eslint-disable-next-line no-console
console.log('Default users ready.');
