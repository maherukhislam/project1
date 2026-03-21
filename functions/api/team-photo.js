/**
 * POST /api/team-photo
 * Uploads a team member profile photo to Cloudflare R2.
 *
 * Multipart form fields:
 *   file   – the image file (JPEG / PNG / WebP)
 *
 * R2 binding:  STUDYGLOBAL_UPLOADS  (set in Cloudflare Pages dashboard)
 * Env var:     R2_PUBLIC_BASE_URL   (e.g. https://pub-xxx.r2.dev)
 */

function getUploadsBucket(env) {
  const candidates = [
    env.STUDYGLOBAL_UPLOADS,
    env.UPLOADS_BUCKET,
    env.R2_BUCKET,
    env.BUCKET,
  ];
  return candidates.find(b => b && typeof b.put === 'function') || null;
}

function buildPublicUrl(env, key) {
  const base = env.R2_PUBLIC_BASE_URL || env.UPLOADS_PUBLIC_BASE_URL || env.PUBLIC_UPLOAD_BASE_URL;
  if (!base) return null;
  return `${String(base).replace(/\/+$/, '')}/${key}`;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });
  }

  const bucket = getUploadsBucket(env);
  if (!bucket) {
    return new Response(
      JSON.stringify({ error: 'R2 bucket binding not configured. Add STUDYGLOBAL_UPLOADS binding in Cloudflare Pages.' }),
      { status: 500, headers: CORS }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Missing file field' }), { status: 400, headers: CORS });
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Only JPEG, PNG, WebP, or GIF images are allowed' }), { status: 400, headers: CORS });
    }

    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.jpg';
    const key = `team/${Date.now()}${ext}`;

    const buffer = await file.arrayBuffer();
    await bucket.put(key, buffer, {
      httpMetadata: { contentType: file.type },
      customMetadata: { kind: 'team_photo' },
    });

    const publicUrl = buildPublicUrl(env, key);
    if (!publicUrl) {
      return new Response(
        JSON.stringify({ error: 'Upload succeeded but R2_PUBLIC_BASE_URL is not set.' }),
        { status: 500, headers: CORS }
      );
    }

    return new Response(JSON.stringify({ url: publicUrl, key }), { status: 201, headers: CORS });
  } catch (err) {
    console.error('Team photo upload error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), { status: 500, headers: CORS });
  }
}
