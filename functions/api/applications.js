import { getSupabase } from './_supabase.js';
import { computeProfileState, deriveCountryRules, evaluateProgram, getDocumentRequirements, logAuditEvent } from './_matching.js';

function mergeProfiles(applications, profiles) {
  const profileByUserId = new Map(
    (profiles || []).map((item) => [item.user_id, { name: item.name, email: item.email }])
  );

  return (applications || []).map((application) => ({
    ...application,
    profiles: profileByUserId.get(application.user_id) || null
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

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const status = url.searchParams.get('status');
      const limit = Number(url.searchParams.get('limit') || 0);
      const minimal = url.searchParams.get('minimal') === '1';
      const countOnly = url.searchParams.get('count_only') === '1';

      if (countOnly) {
        let countQuery = supabase.from('applications').select('id', { count: 'exact', head: true });
        if (!isAdmin) countQuery = countQuery.eq('user_id', user.id);
        if (status) countQuery = countQuery.eq('status', status);
        const { count, error } = await countQuery;
        if (error) throw error;
        return new Response(JSON.stringify({ count: count || 0 }), { headers });
      }

      const selectFields = minimal
        ? `id, user_id, status, created_at, intake, notes, program_id, programs(id, name, degree_level, universities(id, name, country, logo_url))`
        : `
          *,
          programs(id, name, degree_level, universities(id, name, country, logo_url))
        `;

      let query = supabase.from('applications').select(selectFields);

      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      if (status) query = query.eq('status', status);
      if (limit > 0) query = query.limit(limit);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      if (!isAdmin || !data?.length) {
        return new Response(JSON.stringify(data || []), { headers });
      }

      const userIds = [...new Set(data.map((application) => application.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      return new Response(JSON.stringify(mergeProfiles(data, profiles)), { headers });
    }

    const body = await request.json();

    if (request.method === 'POST') {
      const { program_id, intake, notes, admin_override = false, override_reason = '' } = body;
      const { data: fullProfile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      const profileState = computeProfileState(fullProfile || profile || {});
      const { data: program, error: programError } = await supabase
        .from('programs')
        .select('*, universities(id, name, country, logo_url)')
        .eq('id', program_id)
        .single();
      if (programError) throw programError;

      const [{ data: countryRecord }, { data: scholarships }, { data: documents }] = await Promise.all([
        supabase.from('countries').select('*').eq('name', program.universities?.country || '').maybeSingle(),
        supabase.from('scholarships').select('*'),
        supabase.from('documents').select('*').eq('user_id', user.id)
      ]);

      const countryRules = deriveCountryRules(program.universities?.country, countryRecord);
      const programEvaluation = evaluateProgram(profileState, program, countryRules, scholarships || []);
      const requiredDocuments = getDocumentRequirements({ ...profileState, preferred_country: program.universities?.country });
      const uploadedDocs = new Set((documents || []).filter((doc) => doc.status !== 'rejected').map((doc) => doc.document_type));
      const missingDocuments = requiredDocuments.filter((docType) => !uploadedDocs.has(docType));
      const applicationBlocked =
        profileState.profile_status !== 'complete' ||
        !programEvaluation.eligible_for_application ||
        missingDocuments.length > 0;

      if (applicationBlocked && !(isAdmin && admin_override)) {
        return new Response(
          JSON.stringify({
            error: 'Application blocked by eligibility rules.',
            profile_status: profileState.profile_status,
            blocking_reasons: [
              ...profileState.blocking_reasons,
              ...programEvaluation.hard_failures,
              ...(missingDocuments.length ? [`Missing required documents: ${missingDocuments.join(', ')}`] : [])
            ].filter(Boolean),
            missing_documents: missingDocuments,
            program_evaluation: programEvaluation
          }),
          { status: 400, headers }
        );
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          program_id,
          intake,
          notes,
          status: 'draft',
          eligibility_snapshot: {
            profile_completion: profileState.profile_completion,
            profile_status: profileState.profile_status,
            program_evaluation: {
              match_score: programEvaluation.match_score,
              match_category: programEvaluation.match_category,
              hard_failures: programEvaluation.hard_failures,
              recommendation_flags: programEvaluation.recommendation_flags
            },
            missing_documents: missingDocuments
          },
          admin_override: Boolean(isAdmin && admin_override),
          override_reason: isAdmin && admin_override ? override_reason || 'Manual override' : null
        })
        .select()
        .single();
      if (error) throw error;
      await logAuditEvent(supabase, {
        user_id: user.id,
        actor_user_id: user.id,
        action: isAdmin && admin_override ? 'application.created_override' : 'application.created',
        entity_type: 'application',
        entity_id: String(data.id),
        details: {
          program_id,
          profile_status: profileState.profile_status,
          match_score: programEvaluation.match_score,
          missing_documents: missingDocuments
        }
      });
      return new Response(JSON.stringify(data), { status: 201, headers });
    }

    if (request.method === 'PUT') {
      const { id, ...updates } = body;
      
      if (!isAdmin && (updates.status || updates.counselor_id)) {
        delete updates.status;
        delete updates.counselor_id;
      }

      let updateQuery = supabase.from('applications').update(updates).eq('id', id);
      if (!isAdmin) {
        updateQuery = updateQuery.eq('user_id', user.id);
      }

      const { data, error } = await updateQuery.select().single();
      if (error) throw error;
      await logAuditEvent(supabase, {
        user_id: data.user_id,
        actor_user_id: user.id,
        action: 'application.updated',
        entity_type: 'application',
        entity_id: String(data.id),
        details: updates
      });
      return new Response(JSON.stringify(data), { headers });
    }

    if (request.method === 'DELETE') {
      const { id } = body;
      const { error } = await supabase.from('applications').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    console.error('Applications error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
