import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const debug = process.env.SUPABASE_DEBUG === '1';
const projectRef = (() => {
  try {
    return new URL(supabaseUrl).hostname.split('.')[0];
  } catch {
    return 'unknown';
  }
})();

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
  const perPage = Number(process.env.SUPABASE_USERS_PAGE_SIZE || 1000);
  let page = 1;
  let existing = null;
  let totalScanned = 0;

  while (!existing) {
    const { data: list, error: listError } =
      await supabase.auth.admin.listUsers({
        page,
        perPage
      });
    if (listError) throw listError;
    const users = list?.users || [];
    totalScanned += users.length;
    if (debug) {
      const firstEmail = users[0]?.email || 'none';
      const lastEmail = users[users.length - 1]?.email || 'none';
      console.log(
        `[debug] page ${page} users=${users.length} first=${firstEmail} last=${lastEmail}`
      );
    }
    existing = users.find((u) => u.email === user.email) || null;
    if (users.length < perPage) break;
    page += 1;
    if (page > 50) break;
  }

  if (!existing) {
    throw new Error(
      `User ${user.email} not found after scanning ${totalScanned} users. ` +
        `Check you are using the correct Service Role key for project ${projectRef}.`
    );
  }

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
