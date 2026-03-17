import { getSupabase } from '../_supabase.js';

const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, name, email, created_at, role')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'POST') {
      const { name, email } = await request.json();

      if (!name || !email) {
        return new Response(JSON.stringify({ error: 'Name and email are required' }), { status: 400, headers });
      }

      const tempPassword = generateTemporaryPassword();

      const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name, role: 'admin' }
      });

      if (authCreateError) throw authCreateError;

      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        name,
        email,
        role: 'admin',
        profile_completion: 100
      });

      if (profileError) throw profileError;

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email,
          name,
          role: 'admin'
        },
        temporaryPassword: tempPassword
      }), { status: 201, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Admin admin-management error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
