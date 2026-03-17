import { getSupabase } from './_supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const status = url.searchParams.get('status');
      const limit = Number(url.searchParams.get('limit') || 0);
      const minimal = url.searchParams.get('minimal') === '1';
      const countOnly = url.searchParams.get('count_only') === '1';

      if (countOnly) {
        let countQuery = supabase.from('applications').select('id', { count: 'exact', head: true });
        if (!isAdmin) countQuery = countQuery.eq('user_id', user.id);
        if (status) countQuery = countQuery.eq('status', status);
        const { count, error } = await countQuery;
        if (error) throw error;
        return new Response(JSON.stringify({ count: count || 0 }), { headers });
      }

      const selectFields = minimal
        ? `id, user_id, status, created_at, intake, programs(name, universities(name)), profiles(name, email)`
        : `
          *,
          programs(name, degree_level, universities(name, country, logo_url)),
          profiles(name, email)
        `;

      let query = supabase.from('applications').select(selectFields);

      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      if (status) query = query.eq('status', status);
      if (limit > 0) query = query.limit(limit);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    const body = await request.json();

    if (request.method === 'POST') {
      const { program_id, intake, notes } = body;
      const { data, error } = await supabase
        .from('applications')
        .insert({ user_id: user.id, program_id, intake, notes, status: 'draft' })
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 201, headers });
    }

    if (request.method === 'PUT') {
      const { id, ...updates } = body;
      
      if (!isAdmin && (updates.status || updates.counselor_id)) {
        delete updates.status;
        delete updates.counselor_id;
      }
      
      const { data, error } = await supabase.from('applications').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'DELETE') {
      const { id } = body;
      const { error } = await supabase.from('applications').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Applications error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
