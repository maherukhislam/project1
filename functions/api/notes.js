import { getSupabase } from './_supabase.js';
import { logAuditEvent } from './_matching.js';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function err(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), { status, headers: HEADERS });
}

async function getRequesterProfile(supabase, userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, role, name')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

async function getAccessibleStudent(supabase, requester, studentUserId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, name, role, assigned_counselor_id')
    .eq('user_id', studentUserId)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.role !== 'student') return null;
  if (requester.role === 'admin') return data;
  if (requester.role === 'counselor' && data.assigned_counselor_id === requester.user_id) return data;
  return null;
}

function mergeAuthorProfiles(notes, profiles) {
  const authorByUserId = new Map((profiles || []).map((item) => [item.user_id, item]));
  return (notes || []).map((note) => ({
    ...note,
    author: authorByUserId.get(note.author_user_id) || null
  }));
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

    const requester = await getRequesterProfile(supabase, user.id);
    if (!['admin', 'counselor'].includes(requester?.role)) return err('Admin or counselor access required', 403);

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const studentUserId = url.searchParams.get('user_id');
      if (!studentUserId) return err('user_id is required');

      const student = await getAccessibleStudent(supabase, requester, studentUserId);
      if (!student) return err('Student not found or not assigned to you', 404);

      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('student_user_id', studentUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const authorIds = [...new Set((notes || []).map((item) => item.author_user_id).filter(Boolean))];
      if (!authorIds.length) return new Response(JSON.stringify([]), { headers: HEADERS });

      const { data: authors, error: authorsError } = await supabase
        .from('profiles')
        .select('user_id, name, role, email')
        .in('user_id', authorIds);
      if (authorsError) throw authorsError;

      return new Response(JSON.stringify(mergeAuthorProfiles(notes, authors)), { headers: HEADERS });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const studentUserId = typeof body.student_user_id === 'string' ? body.student_user_id : '';
      const note = typeof body.note === 'string' ? body.note.trim() : '';

      if (!studentUserId) return err('student_user_id is required');
      if (!note) return err('note is required');
      if (note.length > 4000) return err('note is too long');

      const student = await getAccessibleStudent(supabase, requester, studentUserId);
      if (!student) return err('Student not found or not assigned to you', 404);

      const { data, error } = await supabase
        .from('notes')
        .insert({
          student_user_id: studentUserId,
          author_user_id: user.id,
          author_role: requester.role,
          note
        })
        .select('*')
        .single();
      if (error) throw error;

      await logAuditEvent(supabase, {
        user_id: studentUserId,
        actor_user_id: user.id,
        action: 'student.note_added',
        entity_type: 'note',
        entity_id: String(data.id),
        details: { author_role: requester.role }
      });

      return new Response(JSON.stringify({
        ...data,
        author: {
          user_id: requester.user_id,
          name: requester.name,
          role: requester.role
        }
      }), { status: 201, headers: HEADERS });
    }

    return err('Method not allowed', 405);
  } catch (error) {
    console.error('[notes] error:', error);
    return new Response(JSON.stringify({ error: 'An internal error occurred. Please try again.' }), { status: 500, headers: HEADERS });
  }
}
