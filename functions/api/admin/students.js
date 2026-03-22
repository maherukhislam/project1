import { getSupabase } from '../_supabase.js';
import { computeLeadScore, computeProfileState, computeVisaRisk } from '../_matching.js';

// ── Allowlist: only these profile fields may be updated via admin PUT ─────────
// Anything not listed here is silently dropped. This prevents overwriting
// system-managed or identity columns (user_id, email, role, etc.).
const ADMIN_UPDATABLE_FIELDS = new Set([
  'name', 'phone', 'nationality', 'date_of_birth', 'address',
  'preferred_country', 'preferred_subject', 'study_level',
  'intake', 'preferred_intake_name', 'preferred_intake_year',
  'budget_min', 'budget_max',
  'profile_picture_url',
  'passport_number', 'passport_expiry',
  'emergency_contact_name', 'emergency_contact_phone',
  'language_test_type', 'language_test_score',
  'gpa', 'highest_qualification',
  'notes', 'internal_notes',
  'assigned_counselor_id',
  'document_requirements',
]);

function deriveStage(student, applications = []) {
  if (applications.some((app) => app.status === 'visa_processing' || app.status === 'accepted')) return 'visa';
  if (applications.some((app) => ['submitted', 'under_review'].includes(app.status))) return 'review';
  if (applications.length > 0) return 'applied';
  if ((student.profile_completion || 0) >= 80) return 'profile_ready';
  return 'new_lead';
}

function enrichStudent(student, applications = []) {
  const profileState = computeProfileState(student);
  const lead = computeLeadScore(profileState, applications.length);
  const visaRisk = computeVisaRisk(profileState);

  return {
    ...student,
    profile_completion: profileState.profile_completion,
    profile_status: profileState.profile_status,
    lead_score: lead.score,
    lead_temperature: lead.temperature,
    visa_risk_score: visaRisk.score,
    visa_risk_level: visaRisk.level,
    crm_stage: deriveStage(profileState, applications),
    application_count: applications.length
  };
}

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
    if (profile?.role !== 'admin') return err('Admin access required', 403);

    if (request.method === 'GET') {
      const url     = new URL(request.url);
      const id      = url.searchParams.get('id');
      const minimal = url.searchParams.get('minimal') === '1';
      const rawLimit = Number(url.searchParams.get('limit') || 0);
      const limit   = rawLimit > 0 ? Math.min(rawLimit, 500) : 0; // cap at 500

      if (id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', parseInt(id, 10))
          .single();
        if (error) throw error;

        const { data: applications, error: applicationsError } = await supabase
          .from('applications')
          .select('*, programs(name, degree_level, universities(name, country))')
          .eq('user_id', data.user_id)
          .order('created_at', { ascending: false });
        if (applicationsError) throw applicationsError;

        return new Response(
          JSON.stringify({ ...enrichStudent(data, applications || []), applications: applications || [] }),
          { headers: HEADERS }
        );
      }

      let query = supabase
        .from('profiles')
        .select(
          minimal
            ? 'id, user_id, name, email, profile_picture_url, role, created_at, profile_completion, lead_score, lead_temperature, visa_risk_level, duplicate_flags, fraud_flags'
            : '*'
        )
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (limit > 0) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;

      const userIds = (data || []).map((item) => item.user_id).filter(Boolean);
      let applications = [];
      if (userIds.length) {
        const { data: applicationRows, error: applicationsError } = await supabase
          .from('applications')
          .select('user_id, status')
          .in('user_id', userIds);
        if (applicationsError) throw applicationsError;
        applications = applicationRows || [];
      }

      const applicationsByUser = new Map();
      (applications || []).forEach((application) => {
        const items = applicationsByUser.get(application.user_id) || [];
        items.push(application);
        applicationsByUser.set(application.user_id, items);
      });

      const enriched = (data || []).map((student) =>
        enrichStudent(student, applicationsByUser.get(student.user_id) || [])
      );
      return new Response(JSON.stringify(enriched), { headers: HEADERS });
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const { id } = body;

      if (!id || typeof id !== 'number') return err('A numeric id is required');

      // ── Field allowlist — prevent mass-assignment of sensitive columns ─────
      const updates = {};
      for (const [key, value] of Object.entries(body)) {
        if (key !== 'id' && ADMIN_UPDATABLE_FIELDS.has(key)) {
          updates[key] = value;
        }
      }

      if (!Object.keys(updates).length) {
        return err('No valid fields to update');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: HEADERS });
    }

    return err('Method not allowed', 405);
  } catch (e) {
    console.error('[admin/students] error:', e);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
      { status: 500, headers: HEADERS }
    );
  }
}
