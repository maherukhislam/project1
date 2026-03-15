import { getSupabase } from './_supabase.js';

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
    const { gpa, english_score, budget_max, preferred_country, preferred_subject, study_level } = await request.json();

    let query = supabase.from('programs').select('*, universities(*)').eq('degree_level', study_level || 'Master');
    
    const { data: programs, error } = await query;
    if (error) throw error;

    const scoredPrograms = programs.map(program => {
      let score = 0;
      let matches = [];
      
      if (gpa && program.min_gpa_required) {
        if (gpa >= program.min_gpa_required) {
          score += 25;
          matches.push('GPA meets requirement');
        }
      } else {
        score += 15;
      }
      
      if (english_score && program.min_english_score) {
        if (english_score >= program.min_english_score) {
          score += 25;
          matches.push('English score meets requirement');
        }
      } else {
        score += 15;
      }
      
      if (budget_max && program.tuition_fee) {
        if (program.tuition_fee <= budget_max) {
          score += 20;
          matches.push('Within budget');
        }
      } else {
        score += 10;
      }
      
      if (preferred_country && program.universities?.country) {
        if (program.universities.country === preferred_country) {
          score += 15;
          matches.push('Preferred country');
        }
      } else {
        score += 5;
      }
      
      if (preferred_subject) {
        if (program.name.toLowerCase().includes(preferred_subject.toLowerCase())) {
          score += 15;
          matches.push('Matches subject interest');
        }
      } else {
        score += 5;
      }
      
      if (program.scholarship_available) {
        score += 10;
        matches.push('Scholarship available');
      }
      
      return { ...program, match_score: score, match_reasons: matches };
    });

    const topMatches = scoredPrograms
      .filter(p => p.match_score >= 40)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 20);

    return new Response(JSON.stringify(topMatches), { headers });
  } catch (err) {
    console.error('University match error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
