import { getSupabase } from '../_supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const { email, password, name } = await request.json();
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'student' }
    });

    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        name,
        email,
        role: 'student',
        profile_completion: 10
      });

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ success: true, user: authData.user }), { status: 201, headers });
  } catch (err) {
    console.error('Signup error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
