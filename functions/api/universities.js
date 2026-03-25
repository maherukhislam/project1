import { getSupabase } from './_supabase.js';

const buildHeaders = (request, extras = {}) => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  ...(request.method === 'GET'
    ? { 'Cache-Control': 'public, max-age=120, s-maxage=900, stale-while-revalidate=3600' }
    : {}),
  ...extras
});

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  const headers = buildHeaders(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const country = url.searchParams.get('country');
      const search = url.searchParams.get('search');
      const limit = Number.parseInt(url.searchParams.get('limit') || '', 10);
      const degreeLevel = url.searchParams.get('degree_level');
      const maxTuition = Number.parseInt(url.searchParams.get('max_tuition') || '', 10);
      const scholarship = url.searchParams.get('scholarship');
      const includePrograms = url.searchParams.get('include_programs');

      const selectFields = includePrograms === 'full'
        ? 'id, name, country, description, ranking, logo_url, tuition_min, tuition_max, acceptance_rate, programs(*)'
        : 'id, name, country, description, ranking, logo_url, tuition_min, tuition_max, acceptance_rate, programs(id, degree_level, scholarship_available)';

      let query = supabase.from('universities').select(selectFields);

      if (country) query = query.eq('country', country);
      if (search) query = query.ilike('name', `%${search}%`);
      if (Number.isFinite(maxTuition)) query = query.lte('tuition_min', maxTuition);
      if (Number.isFinite(limit) && limit > 0) query = query.limit(Math.min(limit, 100));

      const { data, error } = await query.order('ranking', { ascending: true });
      if (error) throw error;

      let filtered = data || [];

      if (degreeLevel) {
        filtered = filtered.filter((university) =>
          Array.isArray(university.programs) &&
          university.programs.some((program) => program?.degree_level === degreeLevel)
        );
      }

      if (scholarship === 'true') {
        filtered = filtered.filter((university) =>
          Array.isArray(university.programs) &&
          university.programs.some((program) => program?.scholarship_available)
        );
      }

      return new Response(JSON.stringify(filtered), { headers });
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
