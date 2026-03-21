/**
 * POST /api/team-photo
 *
 * Uploads a team member profile photo.
 * Storage logic lives in functions/lib/storage.js — zero changes here when
 * switching from R2 to S3, Supabase Storage, or any other provider.
 *
 * Request:  multipart/form-data   { file: <image> }
 * Response: { file_path, url }
 *
 * Callers must store file_path (not url).
 * Use VITE_STORAGE_BASE_URL + buildFileUrl() on the frontend to render images.
 */

import { getStorageService, buildFileUrl } from '../lib/storage.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'POST') return err('Method not allowed', 405);

  // ── Storage service ────────────────────────────────────────────────────────
  const storage = getStorageService(env);
  if (!storage) {
    return err(
      'Storage not configured. Add STUDYGLOBAL_UPLOADS binding and STORAGE_BASE_URL in Cloudflare Pages.',
      500
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) return err('Missing file field');
    if (!ALLOWED_TYPES.has(file.type)) return err('Only JPEG, PNG, WebP, or GIF images are allowed');
    if (file.size > 5 * 1024 * 1024) return err('Image must be under 5 MB');

    // Generic path — no r2 / cloudflare / provider prefix
    const ext      = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.jpg';
    const filePath = `team/${Date.now()}${ext}`;

    const buffer = await file.arrayBuffer();
    await storage.upload(filePath, buffer, {
      contentType:    file.type,
      customMetadata: { kind: 'team_photo' },
    });

    const url = buildFileUrl(filePath, env);
    if (!url) {
      return err('Upload succeeded but STORAGE_BASE_URL is not set in environment variables.', 500);
    }

    // Always return file_path (store this) + url (for immediate display)
    return new Response(
      JSON.stringify({ file_path: filePath, url }),
      { status: 201, headers: CORS }
    );
  } catch (e) {
    console.error('[team-photo] error:', e);
    return err(e.message || 'Upload failed', 500);
  }
}
