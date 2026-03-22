import { getSupabase } from './_supabase.js';
import { logAuditEvent, validateDocumentUpload } from './_matching.js';

// ── Allowed document status values ────────────────────────────────────────────
const ALLOWED_STATUSES = new Set(['pending', 'verified', 'rejected']);

// ── Hard cap on list queries ───────────────────────────────────────────────────
const MAX_LIMIT = 500;

function mergeProfiles(documents, profiles) {
  const profileByUserId = new Map(
    (profiles || []).map((item) => [item.user_id, { name: item.name, email: item.email }])
  );
  return (documents || []).map((document) => ({
    ...document,
    profiles: profileByUserId.get(document.user_id) || null
  }));
}

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HEADERS });
}

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: HEADERS });

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return err('Unauthorized', 401);

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return err('Invalid token', 401);

    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    // ── GET ──────────────────────────────────────────────────────────────────
    if (request.method === 'GET') {
      const url    = new URL(request.url);
      const userId = url.searchParams.get('user_id');
      const rawLimit = Number(url.searchParams.get('limit') || 0);
      const limit  = rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : 0;
      const minimal = url.searchParams.get('minimal') === '1';

      const selectFields = minimal
        ? 'id, user_id, document_type, file_name, file_url, file_size, status, created_at'
        : '*';

      let query = supabase.from('documents').select(selectFields);

      if (isAdmin && userId) {
        query = query.eq('user_id', userId);
      } else if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      if (limit > 0) query = query.limit(limit);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      if (!isAdmin || !data?.length) {
        return new Response(JSON.stringify(data || []), { headers: HEADERS });
      }

      const userIds = [...new Set(data.map((d) => d.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      return new Response(JSON.stringify(mergeProfiles(data, profiles)), { headers: HEADERS });
    }

    const body = await request.json().catch(() => ({}));

    // ── POST — student uploads a document record ──────────────────────────────
    if (request.method === 'POST') {
      const { document_type, file_name, file_url, file_size, mime_type } = body;

      const validationError = validateDocumentUpload(document_type, file_name, file_size);
      if (validationError) return err(validationError);

      // Validate that the stored URL belongs to our storage bucket.
      // This prevents students from pointing document records at arbitrary URLs.
      const storageBase = env.STORAGE_BASE_URL || env.VITE_STORAGE_BASE_URL || '';
      if (file_url && storageBase) {
        try {
          const parsedUrl = new URL(file_url);
          const parsedBase = new URL(storageBase);
          if (parsedUrl.hostname !== parsedBase.hostname) {
            return err('file_url must point to the configured storage bucket');
          }
        } catch {
          return err('Invalid file_url');
        }
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({ user_id: user.id, document_type, file_name, file_url, file_size, mime_type, status: 'pending' })
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

      return new Response(JSON.stringify(data), { status: 201, headers: HEADERS });
    }

    // ── PUT — admin reviews a document status ─────────────────────────────────
    if (request.method === 'PUT') {
      if (!isAdmin) return err('Admin access required', 403);

      const { id, status } = body;

      if (!id)                          return err('id is required');
      if (!ALLOWED_STATUSES.has(status)) return err(`status must be one of: ${[...ALLOWED_STATUSES].join(', ')}`);

      const { data, error } = await supabase
        .from('documents')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logAuditEvent(supabase, {
        user_id: data.user_id,
        actor_user_id: user.id,
        action: 'document.reviewed',
        entity_type: 'document',
        entity_id: String(data.id),
        details: { status }
      });

      return new Response(JSON.stringify(data), { headers: HEADERS });
    }

    // ── DELETE — student deletes their own document ───────────────────────────
    if (request.method === 'DELETE') {
      const { id } = body;
      if (!id) return err('id is required');

      // .eq('user_id', user.id) prevents students from deleting others' documents
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: HEADERS });
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('[documents] error:', e);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
      { status: 500, headers: HEADERS }
    );
  }
}
