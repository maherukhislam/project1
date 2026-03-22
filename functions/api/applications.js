import { getSupabase } from './_supabase.js';
import {
  assignCounselor,
  buildDeadlineSnapshot,
  computeDocumentReadiness,
  computeLeadScore,
  computeProfileStrength,
  computeProfileState,
  computeVisaRisk,
  deriveCountryRules,
  determineNextSteps,
  evaluateProgram,
  getDocumentRequirements,
  logAuditEvent,
  suggestAlternatives,
  upsertTimelineEvent
} from './_matching.js';

function mergeProfiles(applications, profiles) {
  const profileByUserId = new Map(
    (profiles || []).map((item) => [item.user_id, { name: item.name, email: item.email }])
  );

  return (applications || []).map((application) => ({
    ...application,
    profiles: profileByUserId.get(application.user_id) || null
  }));
}

function resolveSelectedIntake(program, intakeLabel) {
  if (!Array.isArray(program?.intakes) || !program.intakes.length || !intakeLabel) return null;
  return program.intakes.find((item) => `${item?.name || ''} ${item?.year || ''}`.trim() === String(intakeLabel).trim()) || null;
}

function buildStatusTimeline(application, userId) {
  let timeline = upsertTimelineEvent(application.timeline, {
    stage: 'created',
    label: 'Created',
    actor_user_id: userId,
    at: application.created_at
  });

  if (application.status === 'submitted') {
    timeline = upsertTimelineEvent(timeline, { stage: 'submitted', label: 'Submitted', actor_user_id: userId });
  }
  if (application.status === 'under_review') {
    timeline = upsertTimelineEvent(timeline, { stage: 'review', label: 'Under Review', actor_user_id: userId });
  }
  if (application.status === 'accepted' || application.offer_received_at) {
    timeline = upsertTimelineEvent(timeline, {
      stage: 'offer',
      label: 'Offer Received',
      actor_user_id: userId,
      at: application.offer_received_at || undefined,
      meta: { offer_type: application.offer_type || null }
    });
  }
  if (application.status === 'visa_processing') {
    timeline = upsertTimelineEvent(timeline, { stage: 'visa', label: 'Visa Processing', actor_user_id: userId });
  }
  if (application.status === 'rejected') {
    timeline = upsertTimelineEvent(timeline, { stage: 'decision', label: 'Rejected', actor_user_id: userId });
  }

  return timeline;
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
        ? 'id, user_id, counselor_id, status, created_at, intake, notes, program_id, offer_type, offer_received_at, next_steps, deadline_snapshot, timeline, programs(id, name, degree_level, universities(id, name, country, logo_url))'
        : '*, programs(*, universities(id, name, country, logo_url))';

      let query = supabase.from('applications').select(selectFields);
      if (!isAdmin) query = query.eq('user_id', user.id);
      if (status) query = query.eq('status', status);
      if (limit > 0) query = query.limit(limit);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const normalized = (data || []).map((application) => ({
        ...application,
        deadline_snapshot: application.deadline_snapshot || buildDeadlineSnapshot(application.programs || {}, resolveSelectedIntake(application.programs, application.intake)),
        timeline: buildStatusTimeline(application, application.user_id)
      }));

      if (!isAdmin || !normalized.length) {
        return new Response(JSON.stringify(normalized), { headers });
      }

      const userIds = [...new Set(normalized.map((application) => application.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      return new Response(JSON.stringify(mergeProfiles(normalized, profiles)), { headers });
    }

    const body = await request.json();

    if (request.method === 'POST') {
      const { program_id, intake, notes, admin_override = false, override_reason = '' } = body;
      const { data: fullProfile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      const profileState = computeProfileState(fullProfile || profile || {});

      const { data: existingApplication, error: existingError } = await supabase
        .from('applications')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('program_id', program_id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existingApplication) {
        return new Response(
          JSON.stringify({ error: 'You already have an application for this program.', existing_application: existingApplication }),
          { status: 409, headers }
        );
      }

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
      const lead = computeLeadScore(profileState);
      const documentReadiness = computeDocumentReadiness(
        { ...profileState, preferred_country: program.universities?.country },
        documents || []
      );
      const enrichedProfile = { ...profileState, lead_score: lead.score, lead_temperature: lead.temperature };
      const programEvaluation = evaluateProgram(
        enrichedProfile,
        program,
        countryRules,
        scholarships || [],
        { documentReadiness }
      );
      const uploadedDocs = new Set((documents || []).filter((doc) => doc.status !== 'rejected').map((doc) => doc.document_type));
      const missingDocuments = documentReadiness.missing_documents;
      const applicationBlocked =
        profileState.profile_status !== 'complete' ||
        !programEvaluation.eligible_for_application ||
        documentReadiness.score < 100 ||
        programEvaluation.deadline_snapshot?.expired;

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

      const counselorAssignment = await assignCounselor(supabase, {
        preferredCountry: program.universities?.country,
        preferredSubject: profileState.preferred_subject
      });
      const selectedIntake = resolveSelectedIntake(program, intake) || programEvaluation.selected_intake || null;
      const deadlineSnapshot = buildDeadlineSnapshot(program, selectedIntake);
      const visaRisk = computeVisaRisk(profileState, countryRules, {
        countryName: program.universities?.country,
        documentReadiness,
        deadlineSnapshot
      });
      const profileStrengthScore = computeProfileStrength({
        leadScore: lead.score,
        visaRiskScore: visaRisk.score,
        documentReadinessScore: documentReadiness.score,
        matchScore: programEvaluation.match_score
      });
      let timeline = upsertTimelineEvent([], {
        stage: 'created',
        label: 'Created',
        actor_user_id: user.id,
        meta: { match_score: programEvaluation.match_score }
      });
      if (uploadedDocs.size > 0) {
        timeline = upsertTimelineEvent(timeline, {
          stage: 'documents',
          label: 'Documents Uploaded',
          actor_user_id: user.id,
          meta: { uploaded_count: uploadedDocs.size }
        });
      }

      const nextSteps = determineNextSteps({
        status: 'draft',
        visaRiskLevel: visaRisk.level,
        missingDocuments,
        deadlineSnapshot
      });

      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          program_id,
          counselor_id: counselorAssignment?.counselor?.user_id || null,
          intake,
          notes,
          status: 'draft',
          eligibility_snapshot: {
            profile_completion: profileState.profile_completion,
            profile_status: profileState.profile_status,
            lead_score: lead.score,
            lead_temperature: lead.temperature,
            program_evaluation: {
              match_score: programEvaluation.match_score,
              match_category: programEvaluation.match_category,
              hard_failures: programEvaluation.hard_failures,
              recommendation_flags: programEvaluation.recommendation_flags
            },
            missing_documents: missingDocuments,
            document_readiness: documentReadiness,
            profile_strength_score: profileStrengthScore,
            acceptance_probability: programEvaluation.acceptance_probability
          },
          risk_snapshot: {
            visa_risk_score: visaRisk.score,
            visa_risk_level: visaRisk.level,
            visa_risk_reasons: visaRisk.reasons,
            financial_risk: programEvaluation.financial_risk,
            visa_timeline: visaRisk.timeline
          },
          timeline,
          deadline_snapshot: deadlineSnapshot,
          next_steps: nextSteps,
          admin_override: Boolean(isAdmin && admin_override),
          override_reason: isAdmin && admin_override ? override_reason || 'Manual override' : null
        })
        .select()
        .single();
      if (error) throw error;

      await supabase
        .from('profiles')
        .update({
          assigned_counselor_id: counselorAssignment?.counselor?.user_id || fullProfile?.assigned_counselor_id || null,
          lead_score: lead.score,
          lead_temperature: lead.temperature,
          visa_risk_score: visaRisk.score,
          visa_risk_level: visaRisk.level
        })
        .eq('user_id', user.id);

      await logAuditEvent(supabase, {
        user_id: user.id,
        actor_user_id: user.id,
        action: isAdmin && admin_override ? 'application.created_override' : 'application.created',
        entity_type: 'application',
        entity_id: String(data.id),
        details: {
          program_id,
          counselor_id: counselorAssignment?.counselor?.user_id || null,
          profile_status: profileState.profile_status,
          match_score: programEvaluation.match_score,
          acceptance_probability: programEvaluation.acceptance_probability,
          lead_score: lead.score,
          visa_risk_level: visaRisk.level,
          missing_documents: missingDocuments,
          profile_strength_score: profileStrengthScore
        }
      });

      return new Response(JSON.stringify(data), { status: 201, headers });
    }

    if (request.method === 'PUT') {
      const { id, ...updates } = body;
      if (!isAdmin && (updates.status || updates.counselor_id || updates.offer_type || updates.offer_received_at)) {
        delete updates.status;
        delete updates.counselor_id;
        delete updates.offer_type;
        delete updates.offer_received_at;
        delete updates.offer_letter_file_url;
      }

      let existingQuery = supabase
        .from('applications')
        .select('*, programs(*, universities(id, name, country, logo_url))')
        .eq('id', id);
      if (!isAdmin) existingQuery = existingQuery.eq('user_id', user.id);

      const { data: currentApplication, error: currentError } = await existingQuery.single();
      if (currentError) throw currentError;

      const { data: studentProfile } = await supabase.from('profiles').select('*').eq('user_id', currentApplication.user_id).maybeSingle();
      const profileState = computeProfileState(studentProfile || {});
      const deadlineSnapshot = buildDeadlineSnapshot(
        currentApplication.programs || {},
        resolveSelectedIntake(currentApplication.programs, currentApplication.intake)
      );
      const { data: docs } = await supabase.from('documents').select('*').eq('user_id', currentApplication.user_id);
      const documentReadiness = computeDocumentReadiness(
        { ...profileState, preferred_country: currentApplication.programs?.universities?.country },
        docs || []
      );
      const uploadedDocs = new Set((docs || []).filter((doc) => doc.status !== 'rejected').map((doc) => doc.document_type));
      const missingDocuments = documentReadiness.missing_documents;
      const visaRisk = computeVisaRisk(profileState, deriveCountryRules(currentApplication.programs?.universities?.country), {
        countryName: currentApplication.programs?.universities?.country,
        documentReadiness,
        deadlineSnapshot
      });

      let timeline = currentApplication.timeline || [];
      if (uploadedDocs.size > 0) {
        timeline = upsertTimelineEvent(timeline, {
          stage: 'documents',
          label: 'Documents Uploaded',
          actor_user_id: user.id,
          meta: { uploaded_count: uploadedDocs.size }
        });
      }

      const nextStatus = updates.status || currentApplication.status;
      const nextOfferType = updates.offer_type || currentApplication.offer_type;

      if (nextStatus === 'submitted') {
        timeline = upsertTimelineEvent(timeline, { stage: 'submitted', label: 'Submitted', actor_user_id: user.id });
      }
      if (nextStatus === 'under_review') {
        timeline = upsertTimelineEvent(timeline, { stage: 'review', label: 'Under Review', actor_user_id: user.id });
      }
      if (nextStatus === 'accepted' || updates.offer_received_at || updates.offer_letter_file_url) {
        timeline = upsertTimelineEvent(timeline, {
          stage: 'offer',
          label: 'Offer Received',
          actor_user_id: user.id,
          at: updates.offer_received_at || currentApplication.offer_received_at || undefined,
          meta: { offer_type: nextOfferType || null }
        });
      }
      if (nextStatus === 'visa_processing') {
        timeline = upsertTimelineEvent(timeline, { stage: 'visa', label: 'Visa Processing', actor_user_id: user.id });
      }
      if (nextStatus === 'rejected') {
        timeline = upsertTimelineEvent(timeline, { stage: 'decision', label: 'Rejected', actor_user_id: user.id });
      }

      let rejectionSuggestions = [];
      if (nextStatus === 'rejected') {
        rejectionSuggestions = await suggestAlternatives(supabase, profileState, currentApplication.programs, 3);
      }

      const nextSteps = determineNextSteps({
        status: nextStatus,
        offerType: nextOfferType,
        visaRiskLevel: visaRisk.level,
        missingDocuments,
        deadlineSnapshot,
        rejectionSuggestions
      });

      const payload = {
        ...updates,
        timeline,
        deadline_snapshot: deadlineSnapshot,
        next_steps: nextSteps,
        risk_snapshot: {
          ...(currentApplication.risk_snapshot || {}),
          visa_risk_score: visaRisk.score,
          visa_risk_level: visaRisk.level,
          visa_risk_reasons: visaRisk.reasons,
          visa_timeline: visaRisk.timeline,
          document_readiness: documentReadiness
        }
      };

      let updateQuery = supabase.from('applications').update(payload).eq('id', id);
      if (!isAdmin) updateQuery = updateQuery.eq('user_id', user.id);

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
    console.error('[applications] error:', err);
    return new Response(JSON.stringify({ error: 'An internal error occurred. Please try again.' }), { status: 500, headers });
  }
}
