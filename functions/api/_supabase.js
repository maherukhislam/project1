import { createClient } from '@supabase/supabase-js';

export function getSupabase(env) {
  const url =
    env.SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    env.VITE_SUPABASE_URL;
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return createClient('https://placeholder.supabase.co', 'public-anon-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
  }

  return createClient(url, key);
}
