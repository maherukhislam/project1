import { getSupabase } from '../_supabase.js';

function escapePdfText(input = '') {
  return String(input)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?');
}

function wrapLine(text, maxLen = 95) {
  const raw = String(text || '').trim();
  if (!raw) return ['-'];
  const words = raw.split(/\s+/);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    if (!current) {
      current = word;
      return;
    }
    if (`${current} ${word}`.length <= maxLen) {
      current = `${current} ${word}`;
      return;
    }
    lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines;
}

function buildPdfFromLines(lines) {
  const linesPerPage = 45;
  const pages = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  if (!pages.length) pages.push(['No data']);

  const totalObjects = 3 + pages.length * 2;
  const objects = new Array(totalObjects + 1);

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  const pageRefs = [];
  pages.forEach((pageLines, index) => {
    const pageObjectId = 4 + index * 2;
    const contentObjectId = pageObjectId + 1;
    pageRefs.push(`${pageObjectId} 0 R`);

    const streamLines = ['BT', '/F1 10 Tf', '50 760 Td'];
    pageLines.forEach((line, lineIndex) => {
      streamLines.push(`(${escapePdfText(line)}) Tj`);
      if (lineIndex !== pageLines.length - 1) streamLines.push('0 -15 Td');
    });
    streamLines.push('ET');
    const stream = `${streamLines.join('\n')}\n`;
    const streamLength = new TextEncoder().encode(stream).length;

    objects[contentObjectId] = `<< /Length ${streamLength} >>\nstream\n${stream}endstream`;
    objects[pageObjectId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pages.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 1; i <= totalObjects; i += 1) {
    offsets[i] = new TextEncoder().encode(pdf).length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${totalObjects + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= totalObjects; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function buildReportLines({ student, documents, applications }) {
  const lines = [];
  const addField = (label, value) => {
    wrapLine(`${label}: ${value ?? '-'}`).forEach((line) => lines.push(line));
  };

  lines.push('StudyGlobal Student Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  lines.push('Profile');
  addField('Name', student.name);
  addField('Email', student.email);
  addField('Phone', student.phone);
  addField('Nationality', student.nationality);
  addField('Role', student.role);
  addField('Preferred Country', student.preferred_country);
  addField('Preferred Subject', student.preferred_subject);
  addField('Study Level', student.study_level);
  addField('Intake', student.intake || `${student.preferred_intake_name || ''} ${student.preferred_intake_year || ''}`.trim());
  addField('Profile Completion', `${student.profile_completion || 0}%`);
  addField('Profile Picture URL', student.profile_picture_url || '-');
  addField('Created At', student.created_at);
  lines.push('');

  lines.push(`Documents (${documents.length})`);
  if (!documents.length) {
    lines.push('- No documents uploaded');
  } else {
    documents.forEach((doc, index) => {
      addField(`Document ${index + 1}`, `${doc.document_type} | ${doc.file_name} | ${doc.status}`);
      addField(`Document ${index + 1} URL`, doc.file_url || '-');
    });
  }

  lines.push('');
  lines.push(`Applications (${applications.length})`);
  if (!applications.length) {
    lines.push('- No applications');
  } else {
    applications.forEach((app, index) => {
      addField(
        `Application ${index + 1}`,
        `${app.programs?.name || 'Program'} @ ${app.programs?.universities?.name || 'University'} | ${app.status}`
      );
      addField(`Application ${index + 1} Intake`, app.intake || '-');
      addField(`Application ${index + 1} Created`, app.created_at || '-');
    });
  }

  return lines;
}

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: requesterProfile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (requesterProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const [{ data: student, error: studentError }, { data: documents, error: docsError }, { data: applications, error: appsError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('id, status, intake, created_at, programs(name, universities(name, country))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);

    if (studentError || !student) throw studentError || new Error('Student not found');
    if (docsError) throw docsError;
    if (appsError) throw appsError;

    const lines = buildReportLines({
      student,
      documents: documents || [],
      applications: applications || []
    });
    const pdfBytes = buildPdfFromLines(lines);
    const fileName = `${String(student.name || 'student').replace(/[^\w.-]/g, '_')}-report.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=\"${fileName}\"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    console.error('Student report error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to generate report' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
