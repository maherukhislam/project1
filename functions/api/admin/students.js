import { getSupabase } from '../_supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers });
    }

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      
      if (id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, applications(*, programs(name, universities(name)))')
          .eq('id', parseInt(id))
          .single();
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers });
      }
      
      const minimal = url.searchParams.get('minimal') === '1';
      const limit = Number(url.searchParams.get('limit') || 0);
      const selectFields = minimal
        ? 'id, user_id, name, email, role, created_at, profile_completion'
        : '*';

      let query = supabase
        .from('profiles')
        .select(selectFields)
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const { id, ...updates } = body;
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Admin students error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
