import { getSupabase } from './_supabase.js';

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

    if (request.method === 'GET') {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'PUT') {
      const updates = await request.json();
      
      // Calculate profile completion
      const fields = ['name', 'phone', 'nationality', 'preferred_country', 'education_level', 'gpa', 'english_score', 'english_test_type', 'study_level', 'preferred_subject', 'budget_min', 'budget_max', 'intake'];
      const filledFields = fields.filter(f => updates[f] || updates[f] === 0).length;
      const completion = Math.round((filledFields / fields.length) * 100);
      updates.profile_completion = completion;

      const { data, error } = await supabase.from('profiles').update(updates).eq('user_id', user.id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Profile error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
