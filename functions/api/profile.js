import { getSupabase, hasSupabaseServiceRoleKey } from './_supabase.js';
import { computeProfileState, logAuditEvent } from './_matching.js';

const DEFAULT_BOOTSTRAP_ADMIN_EMAIL = 'maherukhislam2007@gmail.com';

const buildDefaultName = (user) => {
  if (user.user_metadata?.name) return user.user_metadata.name;
  if (user.email) return user.email.split('@')[0];
  return 'New User';
};

const isRecursiveProfilesPolicyError = (error) =>
  Boolean(error?.message?.includes('infinite recursion detected in policy for relation "profiles"'));

const buildFallbackProfile = (user, isBootstrapCandidate) => {
  const role = user.user_metadata?.role || (isBootstrapCandidate ? 'admin' : 'student');
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
    created_at: new Date().toISOString(),
    fallback: true
  };
};

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  const bootstrapAdminEmail = (env.FIRST_ADMIN_EMAIL || DEFAULT_BOOTSTRAP_ADMIN_EMAIL).toLowerCase();
  
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
      const isBootstrapCandidate = user.email?.toLowerCase() === bootstrapAdminEmail;
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
          return new Response(JSON.stringify({ ...updated, ...computeProfileState(updated) }), { headers });
        }
        return new Response(JSON.stringify({ ...data, ...computed }), { headers });
      }

      if (isRecursiveProfilesPolicyError(error)) {
        const fallbackProfile = buildFallbackProfile(user, isBootstrapCandidate);
        const details = hasSupabaseServiceRoleKey(env)
          ? 'The profiles table is rejecting its own RLS policy. Apply supabase/rls_profiles.sql to replace the recursive policy.'
          : 'The server is querying Supabase without a service-role key, so recursive RLS on public.profiles is still being enforced. Set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY / SUPABASE_SECRET_KEY) in Pages and apply supabase/rls_profiles.sql.';

        return new Response(JSON.stringify({
          ...fallbackProfile,
          warning: 'Profile loaded from auth metadata fallback because the profiles RLS policy is recursive.',
          details
        }), { headers });
      }

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Logic for new user profile creation
      let role = isBootstrapCandidate ? 'admin' : 'student';

      const payload = {
        user_id: user.id,
        email: user.email,
        name: buildDefaultName(user),
        role,
        profile_completion: role === 'admin' ? 100 : 10,
        profile_status: role === 'admin' ? 'complete' : 'incomplete'
      };

      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert(payload)
        .select('*')
        .single();

      if (isRecursiveProfilesPolicyError(createError)) {
        return new Response(JSON.stringify({
          ...buildFallbackProfile(user, isBootstrapCandidate),
          warning: 'Profile could not be persisted because the profiles RLS policy is recursive.'
        }), { headers });
      }

      if (createError) throw createError;

      return new Response(JSON.stringify({ ...created, ...computeProfileState(created) }), { headers });
    }

    if (request.method === 'PUT') {
      const updates = await request.json();
      const mergedProfile = {
        ...(await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()).data,
        ...updates,
        user_id: user.id,
        email: user.email,
        name: updates.name || buildDefaultName(user),
        role: user.user_metadata?.role || (user.email?.toLowerCase() === bootstrapAdminEmail ? 'admin' : 'student')
      };
      const computed = computeProfileState(mergedProfile);
      const isAdminRole = mergedProfile.role === 'admin';
      const payload = {
        user_id: user.id,
        email: user.email,
        name: mergedProfile.name,
        role: mergedProfile.role,
        ...updates,
        profile_completion: isAdminRole ? 100 : computed.profile_completion,
        profile_status: isAdminRole ? 'complete' : computed.profile_status
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (isRecursiveProfilesPolicyError(error)) {
        return new Response(JSON.stringify({
          ...buildFallbackProfile(user, user.email?.toLowerCase() === bootstrapAdminEmail),
          ...updates,
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
      return new Response(JSON.stringify({ ...data, ...computed }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Profile error:', err);
    const errorMessage = err?.message || 'Unknown error';
    const details = errorMessage.includes('infinite recursion detected in policy for relation "profiles"')
      ? 'Supabase RLS on public.profiles is recursively querying public.profiles. Apply supabase/rls_profiles.sql to replace the recursive policy with the non-recursive version.'
      : undefined;

    return new Response(JSON.stringify({ error: errorMessage, details }), { status: 500, headers });
  }
}
