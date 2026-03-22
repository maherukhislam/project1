import { getSupabase } from '../_supabase.js';
import { computeDocumentReadiness, computeProfileState, detectDropOffStage } from '../_matching.js';

function percentage(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function collectProgramIntakes(program = {}) {
  if (Array.isArray(program.intakes) && program.intakes.length) return program.intakes;
  if (!program.application_deadline) return [];
  return [{ application_deadline: program.application_deadline, status: program.is_active === false ? 'Closed' : 'Open' }];
}

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

    const [students, universities, programs, scholarships, applications, counselors, documents] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'student'),
      supabase.from('universities').select('id', { count: 'exact' }),
      supabase.from('programs').select('id, is_active, application_deadline, intakes'),
      supabase.from('scholarships').select('id', { count: 'exact' }),
      supabase.from('applications').select('id, user_id, status, counselor_id, programs(universities(country, name))'),
      supabase.from('profiles').select('user_id, name').eq('role', 'counselor'),
      supabase.from('documents').select('user_id, document_type, status, quality_flag, quality_flags')
    ]);

    const appsByStatus = {};
    const byCountry = {};
    const byUniversity = {};
    const byCounselor = {};
    let offerCount = 0;
    let visaCount = 0;

    (applications.data || []).forEach((app) => {
      appsByStatus[app.status] = (appsByStatus[app.status] || 0) + 1;
      const country = app.programs?.universities?.country;
      const university = app.programs?.universities?.name;
      if (country) byCountry[country] = (byCountry[country] || 0) + 1;
      if (university) byUniversity[university] = (byUniversity[university] || 0) + 1;
      if (app.counselor_id) byCounselor[app.counselor_id] = (byCounselor[app.counselor_id] || 0) + 1;
      if (app.status === 'accepted') offerCount += 1;
      if (app.status === 'visa_processing') visaCount += 1;
    });

    const counselorDirectory = new Map((counselors.data || []).map((item) => [item.user_id, item.name]));
    const counselorStats = Object.entries(byCounselor).map(([id, count]) => ({
      counselor_id: id,
      counselor_name: counselorDirectory.get(id) || 'Unassigned counselor',
      application_count: count
    }));

    const activePrograms = (programs.data || []).filter((program) => {
      if (program.is_active === false) return false;
      const intakes = collectProgramIntakes(program);
      if (!intakes.length) return true;
      return intakes.some((intake) => intake?.status !== 'Closed' && (!intake?.application_deadline || new Date(intake.application_deadline).getTime() >= Date.now()));
    }).length;
    const expiringPrograms = (programs.data || []).filter((program) => {
      const intakes = collectProgramIntakes(program);
      return intakes.some((intake) => {
        if (!intake?.application_deadline || intake?.status === 'Closed') return false;
        const diff = new Date(intake.application_deadline).getTime() - Date.now();
        return diff >= 0 && diff <= 14 * 24 * 60 * 60 * 1000;
      });
    }).length;

    const hotLeadCount = (students.data || []).filter((student) => student.lead_temperature === 'Hot Lead').length;
    const warmLeadCount = (students.data || []).filter((student) => student.lead_temperature === 'Warm Lead').length;
    const applicationsByUser = new Map();
    (applications.data || []).forEach((application) => {
      const items = applicationsByUser.get(application.user_id) || [];
      items.push(application);
      applicationsByUser.set(application.user_id, items);
    });

    const documentsByUser = new Map();
    (documents.data || []).forEach((document) => {
      const items = documentsByUser.get(document.user_id) || [];
      items.push(document);
      documentsByUser.set(document.user_id, items);
    });

    const dropOffCounts = {};
    (students.data || []).forEach((student) => {
      const profileState = computeProfileState(student);
      const documentReadiness = computeDocumentReadiness(profileState, documentsByUser.get(student.user_id) || []);
      const stage = detectDropOffStage({
        profileState,
        applicationCount: (applicationsByUser.get(student.user_id) || []).length,
        documentReadiness
      });
      dropOffCounts[stage] = (dropOffCounts[stage] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        totalStudents: students.count || 0,
        totalUniversities: universities.count || 0,
        totalPrograms: activePrograms,
        totalScholarships: scholarships.count || 0,
        totalApplications: applications.data?.length || 0,
        applicationsByStatus: appsByStatus,
        hotLeadCount,
        warmLeadCount,
        conversion: {
          leads_to_applications: percentage(applications.data?.length || 0, students.count || 0),
          applications_to_offers: percentage(offerCount, applications.data?.length || 0),
          offers_to_visas: percentage(visaCount, offerCount)
        },
        topCountries: Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
        topUniversities: Object.entries(byUniversity).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
        counselorPerformance: counselorStats.sort((a, b) => b.application_count - a.application_count),
        dropOffStages: dropOffCounts,
        deadlineAlerts: {
          expiringPrograms,
          activePrograms
        }
      }),
      { headers }
    );
  } catch (err) {
    console.error('[admin/stats] error:', err);
    return new Response(JSON.stringify({ error: 'An internal error occurred. Please try again.' }), { status: 500, headers });
  }
}
