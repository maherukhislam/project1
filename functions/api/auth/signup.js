import { getSupabase } from '../_supabase.js';
import { computeLeadScore, computeProfileState, computeVisaRisk, detectDuplicateSignals } from '../_matching.js';

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
    const { email, password, name, phone, preferred_country } = await request.json();
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), { status: 400, headers });
    }

    const emailLower = String(email).trim().toLowerCase();
    const phoneValue = phone ? String(phone).trim() : null;

    const [{ data: emailProfiles, error: emailError }, { data: phoneProfiles, error: phoneError }, { data: recentProfiles, error: recentError }] = await Promise.all([
      supabase.from('profiles').select('email, phone, created_at').eq('email', emailLower),
      phoneValue
        ? supabase.from('profiles').select('email, phone, created_at').eq('phone', phoneValue)
        : Promise.resolve({ data: [], error: null }),
      supabase.from('profiles').select('email, phone, created_at').gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()).order('created_at', { ascending: false }).limit(10)
    ]);

    if (emailError) throw emailError;
    if (phoneError) throw phoneError;
    if (recentError) throw recentError;

    const existingProfiles = [...(emailProfiles || []), ...(phoneProfiles || [])];

    const duplicateSignals = detectDuplicateSignals({
      profile: { email: emailLower, phone: phoneValue },
      existingProfiles: existingProfiles || [],
      recentProfiles: recentProfiles || []
    });

    if (duplicateSignals.duplicate_flags.includes('Duplicate email')) {
      return new Response(
        JSON.stringify({ error: 'An account with this email already exists.', duplicate_flags: duplicateSignals.duplicate_flags }),
        { status: 409, headers }
      );
    }
    if (duplicateSignals.duplicate_flags.includes('Duplicate phone')) {
      return new Response(
        JSON.stringify({ error: 'An account with this phone number already exists.', duplicate_flags: duplicateSignals.duplicate_flags }),
        { status: 409, headers }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: emailLower,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'student', phone: phoneValue }
    });

    if (authError) throw authError;

    const profileState = computeProfileState({
      name,
      email: emailLower,
      phone: phoneValue,
      preferred_country
    });
    const lead = computeLeadScore(profileState);
    const visaRisk = computeVisaRisk(profileState);

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      name,
      email: emailLower,
      phone: phoneValue,
      preferred_country,
      role: 'student',
      profile_completion: profileState.profile_completion,
      profile_status: profileState.profile_status,
      lead_score: lead.score,
      lead_temperature: lead.temperature,
      duplicate_flags: duplicateSignals.duplicate_flags,
      fraud_flags: duplicateSignals.fraud_flags,
      visa_risk_score: visaRisk.score,
      visa_risk_level: visaRisk.level
    });

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        lead_score: lead.score,
        lead_temperature: lead.temperature,
        duplicate_flags: duplicateSignals.duplicate_flags,
        fraud_flags: duplicateSignals.fraud_flags
      }),
      { status: 201, headers }
    );
  } catch (err) {
    console.error('Signup error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
