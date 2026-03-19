import { getSupabase } from './_supabase.js';

const hasActiveIntake = (program, now = Date.now()) => {
  if (program.is_active === false) return false;

  if (Array.isArray(program.intakes) && program.intakes.length) {
    return program.intakes.some((intake) => {
      if (intake?.status === 'Closed') return false;
      if (!intake?.application_deadline) return true;
      return new Date(intake.application_deadline).getTime() >= now;
    });
  }

  if (!program.application_deadline) return true;
  return new Date(program.application_deadline).getTime() >= now;
};

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
      const university_id = url.searchParams.get('university_id');
      const degree_level = url.searchParams.get('degree_level');
      const subject = url.searchParams.get('subject');
      const includeExpired = url.searchParams.get('include_expired') === '1';
      
      let query = supabase.from('programs').select('*, universities(name, country, logo_url)');
      
      if (university_id) query = query.eq('university_id', parseInt(university_id));
      if (degree_level) query = query.eq('degree_level', degree_level);
      if (subject) query = query.ilike('name', `%${subject}%`);
      
      const { data, error } = await query.order('name');
      if (error) throw error;
      const now = Date.now();
      const filtered = includeExpired
        ? data || []
        : (data || []).filter((program) => hasActiveIntake(program, now));
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
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers });
    }

    const body = await request.json();

    if (request.method === 'POST') {
      const { data, error } = await supabase.from('programs').insert(body).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { status: 201, headers });
    }

    if (request.method === 'PUT') {
      const { id, ...updates } = body;
      const { data, error } = await supabase.from('programs').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'DELETE') {
      const { id } = body;
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Programs error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
