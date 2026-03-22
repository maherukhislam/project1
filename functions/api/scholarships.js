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

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const country       = url.searchParams.get('country');
      const university_id = url.searchParams.get('university_id');
      const funding_type  = url.searchParams.get('funding_type');
      const min_gpa       = url.searchParams.get('min_gpa');
      const study_level   = url.searchParams.get('study_level');
      const intake        = url.searchParams.get('intake');
      const app_type      = url.searchParams.get('application_type');
      const merit_based   = url.searchParams.get('merit_based');
      const need_based    = url.searchParams.get('need_based');
      const include_all   = url.searchParams.get('include_all'); // admin: show inactive

      let query = supabase.from('scholarships').select('*, universities(name, country)');

      if (!include_all) query = query.eq('is_active', true);
      if (university_id) query = query.eq('university_id', parseInt(university_id));
      if (funding_type)  query = query.eq('funding_type', funding_type);
      if (min_gpa)       query = query.lte('min_gpa_required', parseFloat(min_gpa));
      if (study_level && study_level !== 'Any')
        query = query.or(`study_level.eq.${study_level},study_level.eq.Any,study_level.is.null`);
      if (app_type)      query = query.eq('application_type', app_type);
      if (merit_based === 'true') query = query.eq('merit_based', true);
      if (need_based  === 'true') query = query.eq('need_based', true);

      const { data, error } = await query.order('is_featured', { ascending: false })
                                         .order('deadline', { ascending: true, nullsFirst: false });
      if (error) throw error;

      let filtered = data;
      if (country) {
        filtered = filtered.filter(s => s.universities?.country === country);
      }
      if (intake && intake !== 'Any') {
        filtered = filtered.filter(
          s => !s.intake || s.intake === 'Any' || s.intake === intake
        );
      }

      return new Response(JSON.stringify(filtered), { headers });
    }

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('user_id', user.id).single();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers });
    }

    const body = await request.json();

    if (request.method === 'POST') {
      const { data, error } = await supabase.from('scholarships').insert(body).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 201, headers });
    }

    if (request.method === 'PUT') {
      const { id, ...updates } = body;
      const { data, error } = await supabase
        .from('scholarships').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'DELETE') {
      const { id } = body;
      const { error } = await supabase.from('scholarships').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Scholarships error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
