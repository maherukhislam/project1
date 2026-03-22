import { getSupabase } from './_supabase.js';
import { computeMatchResults } from './_matching.js';

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const body = await request.json();
    let profile = body;
    let authenticatedUser = null;

    if (token) {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser(token);

      if (authError) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
      }

      if (user) {
        authenticatedUser = user;
        const { data: savedProfile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
        profile = { ...(savedProfile || {}), ...body };
      }
    }

    const degreeLevel = profile.study_level || 'Master';
    const preferredCountry = profile.preferred_country;
    const preferredSubject = profile.preferred_subject;

    let programsQuery = supabase
      .from('programs')
      .select('*, universities(id, name, country, logo_url, acceptance_rate)')
      .eq('degree_level', degreeLevel)
      .neq('is_active', false);

    if (preferredSubject) {
      programsQuery = programsQuery.or(`name.ilike.%${preferredSubject}%,subject_area.ilike.%${preferredSubject}%`);
    }

    const [{ data: programs, error: programError }, { data: countries, error: countriesError }, { data: scholarships, error: scholarshipsError }] =
      await Promise.all([
        programsQuery,
        supabase.from('countries').select('*'),
        supabase.from('scholarships').select('*')
      ]);

    if (programError) throw programError;
    if (countriesError) throw countriesError;
    if (scholarshipsError) throw scholarshipsError;

    const result = computeMatchResults({
      profile,
      programs: programs || [],
      countries: countries || [],
      scholarships: scholarships || []
    });

    const limit = Number(body.limit) > 0 ? Number(body.limit) : 20;

    const matchedAt = new Date().toISOString();
    if (authenticatedUser) {
        await supabase
          .from('profiles')
          .update({ needs_rematch: false, last_matched_at: matchedAt })
          .eq('user_id', authenticatedUser.id);
    }

    return new Response(
      JSON.stringify({
        profile: authenticatedUser ? { ...result.profile, needs_rematch: false, last_matched_at: matchedAt } : result.profile,
        meta: result.meta,
        matches: result.matches.slice(0, limit)
      }),
      { headers }
    );
  } catch (err) {
    console.error('University match error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
