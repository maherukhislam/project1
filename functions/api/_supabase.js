import { createClient } from '@supabase/supabase-js';

const getSupabaseUrl = (env) =>
  env.SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  env.VITE_SUPABASE_URL;

const getSupabaseAnonKey = (env) =>
  env.SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getSupabaseServiceRoleKey = (env) =>
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_KEY ||
  env.SUPABASE_SECRET_KEY ||
  env.SUPABASE_SERVICE_ROLE;

export function getSupabase(env) {
  const url = getSupabaseUrl(env);
  const key = getSupabaseServiceRoleKey(env) || getSupabaseAnonKey(env);

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

export function hasSupabaseServiceRoleKey(env) {
  return Boolean(getSupabaseServiceRoleKey(env));
}
