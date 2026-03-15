import { createClient } from '@supabase/supabase-js';

export function getSupabase(env) {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
}
