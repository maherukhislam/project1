import { getSupabase } from '../_supabase.js';

// ── Cryptographically-secure temporary password ───────────────────────────────
// Uses crypto.getRandomValues() — Math.random() is NOT safe for this purpose.
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

// ── Basic email format check ───────────────────────────────────────────────────
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: HEADERS });
}

function normalizeSpecializations(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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
    if (profile?.role !== 'admin') return err('Admin access required', 403);

    if (request.method === 'GET') {
      if (request.method !== 'GET') return err('Method not allowed', 405);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, name, email, created_at, role, preferred_country, counselor_specializations, counselor_capacity, counselor_active')
        .in('role', ['admin', 'counselor'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: HEADERS });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const name  = typeof body.name === 'string' ? body.name.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const role = body.role === 'counselor' ? 'counselor' : 'admin';
      const preferredCountry = typeof body.preferred_country === 'string' ? body.preferred_country.trim() : null;
      const counselorSpecializations = normalizeSpecializations(body.counselor_specializations);
      const counselorCapacity = Number(body.counselor_capacity || 30);
      const counselorActive = body.counselor_active !== false;

      if (!name)               return err('Name is required');
      if (name.length > 120)   return err('Name is too long');
      if (!isValidEmail(email)) return err('A valid email address is required');
      if (role === 'counselor' && (!Number.isFinite(counselorCapacity) || counselorCapacity < 1 || counselorCapacity > 500)) {
        return err('Counselor capacity must be between 1 and 500');
      }

      const tempPassword = generateTemporaryPassword();

      const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name, role }
      });

      if (authCreateError) throw authCreateError;

      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        name,
        email,
        role,
        profile_completion: 100,
        profile_status: 'complete',
        needs_rematch: false,
        preferred_country: role === 'counselor' ? preferredCountry : null,
        counselor_specializations: role === 'counselor' ? counselorSpecializations : [],
        counselor_capacity: role === 'counselor' ? counselorCapacity : 30,
        counselor_active: role === 'counselor' ? counselorActive : true
      });

      if (profileError) throw profileError;

      // The temporary password is returned only because this is an admin-only
      // endpoint. Ensure it is shared through a secure channel and changed
      // immediately on first login.
      return new Response(JSON.stringify({
        success: true,
        user: { id: authData.user.id, email, name, role },
        temporaryPassword: tempPassword,
        notice: 'Share this password through a secure channel. The recipient must change it on first login.'
      }), { status: 201, headers: HEADERS });
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('[admins] error:', e);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
      { status: 500, headers: HEADERS }
    );
  }
}
