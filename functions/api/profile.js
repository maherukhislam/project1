import { getSupabase, hasSupabaseServiceRoleKey } from './_supabase.js';
import { computeProfileState, getRematchState, logAuditEvent, shouldTriggerRematch } from './_matching.js';

// ── Bootstrap admin ───────────────────────────────────────────────────────────
// Only configured via the FIRST_ADMIN_EMAIL environment variable — no hardcoded
// fallback email. Set this in Cloudflare Pages dashboard during initial setup.
const getBootstrapAdminEmail = (env) =>
  (env.FIRST_ADMIN_EMAIL || '').toLowerCase().trim();

// ── Fields users can never write to themselves ────────────────────────────────
const USER_BLOCKED_FIELDS = new Set([
  'role', 'user_id', 'email', 'id',
  'profile_completion', 'profile_status',
  'lead_score', 'lead_temperature',
  'visa_risk_score', 'visa_risk_level',
  'needs_rematch', 'last_matched_at',
  'assigned_counselor_id', 'counselor_id',
  'duplicate_flags', 'fraud_flags',
  'document_requirements',
  'created_at', 'updated_at',
]);

const buildDefaultName = (user) => {
  if (user.user_metadata?.name) return user.user_metadata.name;
  if (user.email) return user.email.split('@')[0];
  return 'New User';
};

const buildPreferredIntakeLabel = (name, year) => {
  if (!name) return null;
  return year ? `${name} ${year}` : name;
};

const isRecursiveProfilesPolicyError = (error) =>
  Boolean(error?.message?.includes('infinite recursion detected in policy for relation "profiles"'));

const buildFallbackProfile = (user, isBootstrapCandidate) => {
  const role = isBootstrapCandidate ? 'admin' : 'student';
  const computed = computeProfileState({
    user_id: user.id,
    email: user.email,
    name: buildDefaultName(user)
  });

  return {
    id: 0,
    user_id: user.id,
    email: user.email,
    name: buildDefaultName(user),
    role,
    profile_completion: role === 'admin' ? 100 : computed.profile_completion,
    profile_status: role === 'admin' ? 'complete' : computed.profile_status,
    completion_details: computed.completion_details,
    validation_errors: computed.validation_errors,
    blocking_reasons: computed.blocking_reasons,
    document_requirements: computed.document_requirements,
    needs_rematch: true,
    last_matched_at: null,
    created_at: new Date().toISOString(),
    fallback: true
  };
};

// ── Sanitize errors — never leak internal details in 500 responses ─────────────
function internalError(err, label = 'Request') {
  console.error(`[${label}] error:`, err);
  // Check for known safe messages to surface
  if (isRecursiveProfilesPolicyError(err)) {
    return {
      error: 'Database policy configuration error',
      details: 'Apply supabase/rls_profiles.sql to fix the recursive RLS policy.'
    };
  }
  return { error: 'An internal error occurred. Please try again.' };
}

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  const bootstrapAdminEmail = getBootstrapAdminEmail(env);

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
      const isBootstrapCandidate = bootstrapAdminEmail && user.email?.toLowerCase() === bootstrapAdminEmail;
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();

      if (!error && data) {
        const computed = computeProfileState(data);
        if (isBootstrapCandidate && data.role !== 'admin') {
          const { data: updated, error: promoteError } = await supabase
            .from('profiles')
            .update({ role: 'admin', profile_completion: Math.max(computed.profile_completion || 0, 100), profile_status: 'complete' })
            .eq('user_id', user.id)
            .select('*')
            .single();
          if (promoteError) throw promoteError;
          return new Response(JSON.stringify({ ...updated, ...computeProfileState(updated), ...getRematchState(updated) }), { headers });
        }
        return new Response(JSON.stringify({ ...data, ...computed, ...getRematchState(data) }), { headers });
      }

      if (isRecursiveProfilesPolicyError(error)) {
        const fallbackProfile = buildFallbackProfile(user, isBootstrapCandidate);
        const details = hasSupabaseServiceRoleKey(env)
          ? 'The profiles table is rejecting its own RLS policy. Apply supabase/rls_profiles.sql to replace the recursive policy.'
          : 'The server is querying Supabase without a service-role key, so recursive RLS on public.profiles is still being enforced. Set SUPABASE_SERVICE_ROLE_KEY in Pages and apply supabase/rls_profiles.sql.';

        return new Response(JSON.stringify({
          ...fallbackProfile,
          warning: 'Profile loaded from auth metadata fallback because the profiles RLS policy is recursive.',
          details
        }), { headers });
      }

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // New user — create profile
      const isBootstrapNew = bootstrapAdminEmail && user.email?.toLowerCase() === bootstrapAdminEmail;
      const role = isBootstrapNew ? 'admin' : 'student';
      const isOperationalRole = role === 'admin' || role === 'counselor' || role === 'editor';

      const payload = {
        user_id: user.id,
        email: user.email,
        name: buildDefaultName(user),
        role,
        needs_rematch: !isOperationalRole,
        last_matched_at: null,
        profile_completion: isOperationalRole ? 100 : 10,
        profile_status: isOperationalRole ? 'complete' : 'incomplete'
      };

      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert(payload)
        .select('*')
        .single();

      if (isRecursiveProfilesPolicyError(createError)) {
        return new Response(JSON.stringify({
          ...buildFallbackProfile(user, isBootstrapNew),
          warning: 'Profile could not be persisted because the profiles RLS policy is recursive.'
        }), { headers });
      }

      if (createError) throw createError;

      return new Response(JSON.stringify({ ...created, ...computeProfileState(created) }), { headers });
    }

    if (request.method === 'PUT') {
      const updates = await request.json();

      // ── Strip every field the user is not allowed to set ──────────────────
      // This prevents role escalation, user_id spoofing, and tampering with
      // system-managed fields regardless of what the request body contains.
      const safeUpdates = {};
      for (const [key, value] of Object.entries(updates)) {
        if (!USER_BLOCKED_FIELDS.has(key)) {
          safeUpdates[key] = value;
        }
      }

      if ('preferred_intake_name' in safeUpdates || 'preferred_intake_year' in safeUpdates) {
        safeUpdates.intake = buildPreferredIntakeLabel(
          safeUpdates.preferred_intake_name,
          safeUpdates.preferred_intake_year
        );
      }

      // ── Read existing profile to preserve server-controlled fields ────────
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Role is always read from the database — never from request body or
      // user_metadata (which the user can influence).
      const isBootstrapCandidate = bootstrapAdminEmail && user.email?.toLowerCase() === bootstrapAdminEmail;
      const existingRole = existingProfile?.role || (isBootstrapCandidate ? 'admin' : 'student');

      const mergedProfile = {
        ...existingProfile,
        ...safeUpdates,
        user_id: user.id,
        email: user.email,
        name: safeUpdates.name || existingProfile?.name || buildDefaultName(user),
        role: existingRole,
      };

      const computed = computeProfileState(mergedProfile);
      const isOperationalRole = ['admin', 'counselor', 'editor'].includes(existingRole);
      const rematchTriggered = !isOperationalRole && shouldTriggerRematch(existingProfile || {}, safeUpdates);

      const payload = {
        ...safeUpdates,
        user_id: user.id,
        email: user.email,
        name: mergedProfile.name,
        role: existingRole,                                                     // always from DB
        profile_completion: isOperationalRole ? 100 : computed.profile_completion,   // always server-computed
        profile_status:     isOperationalRole ? 'complete' : computed.profile_status, // always server-computed
        needs_rematch: isOperationalRole ? false : rematchTriggered || existingProfile?.needs_rematch || false,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (isRecursiveProfilesPolicyError(error)) {
        return new Response(JSON.stringify({
          ...buildFallbackProfile(user, isBootstrapCandidate),
          ...safeUpdates,
          profile_completion: computed.profile_completion,
          profile_status: computed.profile_status,
          validation_errors: computed.validation_errors,
          warning: 'Profile changes could not be persisted because the profiles RLS policy is recursive.'
        }), { headers });
      }

      if (error) throw error;

      await logAuditEvent(supabase, {
        user_id: user.id,
        actor_user_id: user.id,
        action: 'profile.updated',
        entity_type: 'profile',
        entity_id: String(data.id),
        details: {
          profile_completion: computed.profile_completion,
          profile_status: computed.profile_status
        }
      });
      return new Response(JSON.stringify({ ...data, ...computed, ...getRematchState(data) }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    return new Response(JSON.stringify(internalError(err, 'Profile')), { status: 500, headers });
  }
}
