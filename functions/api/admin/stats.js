import { getSupabase } from '../_supabase.js';

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
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

    const [students, universities, programs, scholarships, applications] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
      supabase.from('universities').select('id', { count: 'exact' }),
      supabase.from('programs').select('id', { count: 'exact' }),
      supabase.from('scholarships').select('id', { count: 'exact' }),
      supabase.from('applications').select('id, status')
    ]);

    const appsByStatus = {};
    applications.data?.forEach(app => {
      appsByStatus[app.status] = (appsByStatus[app.status] || 0) + 1;
    });

    return new Response(JSON.stringify({
      totalStudents: students.count || 0,
      totalUniversities: universities.count || 0,
      totalPrograms: programs.count || 0,
      totalScholarships: scholarships.count || 0,
      totalApplications: applications.data?.length || 0,
      applicationsByStatus: appsByStatus
    }), { headers });
  } catch (err) {
    console.error('Admin stats error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
