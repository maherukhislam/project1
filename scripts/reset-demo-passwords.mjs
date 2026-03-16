import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const targets = [
  { email: 'admin@studyglobal.com', password: 'Admin123!' },
  { email: 'student@studyglobal.com', password: 'Student123!' }
];

async function findUserByEmail(email) {
  const perPage = 1000;
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    });
    if (error) throw error;
    const users = data?.users || [];
    const match = users.find((u) => u.email === email);
    if (match) return match;
    if (users.length < perPage) return null;
    page += 1;
    if (page > 200) return null;
  }
}

for (const t of targets) {
  // eslint-disable-next-line no-console
  console.log(`Resetting ${t.email}...`);
  const user = await findUserByEmail(t.email);
  if (!user) {
    throw new Error(`User not found: ${t.email}`);
  }
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: t.password,
    email_confirm: true
  });
  if (error) throw error;
}

// eslint-disable-next-line no-console
console.log('Demo passwords reset.');
