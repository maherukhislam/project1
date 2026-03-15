import { getSupabase } from './_supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const country = url.searchParams.get('country');
      const search = url.searchParams.get('search');
      const limit = url.searchParams.get('limit');
      
      let query = supabase.from('universities').select('*, programs(*)');
      
      if (country) query = query.eq('country', country);
      if (search) query = query.ilike('name', `%${search}%`);
      if (limit) query = query.limit(parseInt(limit));
      
      const { data, error } = await query.order('ranking', { ascending: true });
      if (error) throw error;
      
      return new Response(JSON.stringify(data), { headers });
    }

    // For POST, PUT, DELETE - check admin auth
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
    }
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers });
    }

    const body = await request.json();

    if (request.method === 'POST') {
      const { data, error } = await supabase
        .from('universities')
        .insert(body)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 201, headers });
    }

    if (request.method === 'PUT') {
      const { id, ...updates } = body;
      const { data, error } = await supabase
        .from('universities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'DELETE') {
      const { id } = body;
      const { error } = await supabase.from('universities').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Universities error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
