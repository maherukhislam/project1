import { getSupabase } from './_supabase.js';

function getUploadsBucket(env) {
  const candidates = [
    env.STUDYGLOBAL_UPLOADS,
    env.UPLOADS_BUCKET,
    env.R2_BUCKET,
    env.BUCKET
  ];

  return candidates.find((bucket) => bucket && typeof bucket.put === 'function') || null;
}

function sanitizeFileName(fileName = '') {
  const normalized = String(fileName).trim().replace(/[^\w.\-]/g, '_');
  return normalized || 'file';
}

function buildPublicUrl(env, key) {
  const base = env.R2_PUBLIC_BASE_URL || env.UPLOADS_PUBLIC_BASE_URL || env.PUBLIC_UPLOAD_BASE_URL;
  if (!base) return null;
  return `${String(base).replace(/\/+$/, '')}/${key}`;
}

export async function onRequest(context) {
  const { request, env } = context;
  const supabase = getSupabase(env);
  const bucket = getUploadsBucket(env);

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

  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  if (!bucket) {
    return new Response(
      JSON.stringify({ error: 'R2 bucket binding is missing. Configure STUDYGLOBAL_UPLOADS (or UPLOADS_BUCKET / R2_BUCKET).' }),
      { status: 500, headers }
    );
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const kind = String(formData.get('kind') || 'document').toLowerCase();
    const documentType = String(formData.get('document_type') || 'other').toLowerCase();

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Missing file' }), { status: 400, headers });
    }

    const safeKind = ['document', 'profile_picture'].includes(kind) ? kind : 'document';
    const safeName = sanitizeFileName(file.name);
    const extension = safeName.includes('.') ? safeName.slice(safeName.lastIndexOf('.')) : '';
    const timestamp = Date.now();
    const key =
      safeKind === 'profile_picture'
        ? `profiles/${user.id}/${timestamp}${extension}`
        : `documents/${user.id}/${documentType}/${timestamp}-${safeName}`;

    const buffer = await file.arrayBuffer();
    await bucket.put(key, buffer, {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
      customMetadata: {
        user_id: user.id,
        kind: safeKind,
        document_type: documentType
      }
    });

    const publicUrl = buildPublicUrl(env, key);
    if (!publicUrl) {
      return new Response(
        JSON.stringify({
          error: 'Upload succeeded but no public URL base is configured. Set R2_PUBLIC_BASE_URL.'
        }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({
        key,
        url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream'
      }),
      { status: 201, headers }
    );
  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), { status: 500, headers });
  }
}
