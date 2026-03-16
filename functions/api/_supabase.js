import { createClient } from '@supabase/supabase-js';

export function getSupabase(env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables for Pages Functions.');
  }

  return createClient(url, key);
}
