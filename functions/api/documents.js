import { getSupabase } from './_supabase.js';
import { logAuditEvent, validateDocumentUpload } from './_matching.js';

function mergeProfiles(documents, profiles) {
  const profileByUserId = new Map(
    (profiles || []).map((item) => [item.user_id, { name: item.name, email: item.email }])
  );

  return (documents || []).map((document) => ({
    ...document,
    profiles: profileByUserId.get(document.user_id) || null
  }));
}

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

    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const user_id = url.searchParams.get('user_id');
      const limit = Number(url.searchParams.get('limit') || 0);
      const minimal = url.searchParams.get('minimal') === '1';

      const selectFields = isAdmin
        ? (minimal
          ? 'id, user_id, document_type, file_name, file_url, file_size, status, created_at'
          : '*')
        : (minimal
          ? 'id, user_id, document_type, file_name, file_url, file_size, status, created_at'
          : '*');

      let query = supabase.from('documents').select(selectFields);

      if (isAdmin && user_id) {
        query = query.eq('user_id', user_id);
      } else if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      if (limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      if (!isAdmin || !data?.length) {
        return new Response(JSON.stringify(data || []), { headers });
      }

      const userIds = [...new Set(data.map((document) => document.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      return new Response(JSON.stringify(mergeProfiles(data, profiles)), { headers });
    }

    const body = await request.json();

    if (request.method === 'POST') {
      const { document_type, file_name, file_url, file_size } = body;
      const validationError = validateDocumentUpload(document_type, file_name, file_size);
      if (validationError) {
        return new Response(JSON.stringify({ error: validationError }), { status: 400, headers });
      }
      const { data, error } = await supabase
        .from('documents')
        .insert({ user_id: user.id, document_type, file_name, file_url, file_size, status: 'pending' })
        .select()
        .single();
      if (error) throw error;
      await logAuditEvent(supabase, {
        user_id: user.id,
        actor_user_id: user.id,
        action: 'document.uploaded',
        entity_type: 'document',
        entity_id: String(data.id),
        details: { document_type, file_name, file_size }
      });
      return new Response(JSON.stringify(data), { status: 201, headers });
    }

    if (request.method === 'PUT') {
      const { id, status } = body;
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers });
      }
      
      const { data, error } = await supabase.from('documents').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      await logAuditEvent(supabase, {
        user_id: data.user_id,
        actor_user_id: user.id,
        action: 'document.reviewed',
        entity_type: 'document',
        entity_id: String(data.id),
        details: { status }
      });
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'DELETE') {
      const { id } = body;
      const { error } = await supabase.from('documents').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Documents error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
