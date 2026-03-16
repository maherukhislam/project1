import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const confirm = process.env.SUPABASE_RESET_CONFIRM;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (confirm !== 'DELETE_ALL') {
  console.error(
    'Refusing to run. Set SUPABASE_RESET_CONFIRM=DELETE_ALL to proceed.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const newUsers = [
  {
    email: 'admin@studyglobal.com',
    password: 'Admin123!',
    name: 'Admin',
    role: 'admin'
  },
  {
    email: 'student@studyglobal.com',
    password: 'Student123!',
    name: 'Demo Student',
    role: 'student'
  }
];

async function listAllUsers() {
  const perPage = 1000;
  let page = 1;
  let all = [];
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    });
    if (error) throw error;
    const batch = data?.users || [];
    all = all.concat(batch);
    if (batch.length < perPage) break;
    page += 1;
    if (page > 200) break;
  }
  return all;
}

async function deleteAllUsers() {
  const users = await listAllUsers();
  for (const user of users) {
    // eslint-disable-next-line no-console
    console.log(`Deleting ${user.email || user.id}...`);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
  }
  // eslint-disable-next-line no-console
  console.log(`Deleted ${users.length} users.`);
}

async function createUser(u) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { name: u.name, role: u.role }
  });
  if (error) throw error;
  return data.user.id;
}

// eslint-disable-next-line no-console
console.log('Resetting auth users...');
await deleteAllUsers();

for (const u of newUsers) {
  // eslint-disable-next-line no-console
  console.log(`Creating ${u.email}...`);
  await createUser(u);
}

// eslint-disable-next-line no-console
console.log('Auth users reset complete.');
