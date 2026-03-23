import { getSupabase } from './_supabase.js';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HEADERS });
}

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: HEADERS });
  }

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return err('Unauthorized', 401);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return err('Invalid token', 401);

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const { action } = body;

      // Update last_seen_at and is_online status
      const now = new Date().toISOString();
      
      if (action === 'heartbeat' || action === 'active') {
        // User is active - update last_seen and set online
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_online: true, 
            last_seen_at: now 
          })
          .eq('user_id', user.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, last_seen_at: now }), { headers: HEADERS });
      }

      if (action === 'offline' || action === 'logout') {
        // User is going offline
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_online: false, 
            last_seen_at: now 
          })
          .eq('user_id', user.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, last_seen_at: now }), { headers: HEADERS });
      }

      return err('Invalid action. Use: heartbeat, active, offline, or logout');
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('[activity] error:', e);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { status: 500, headers: HEADERS }
    );
  }
}
