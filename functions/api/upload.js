/**
 * POST /api/upload
 *
 * General-purpose document / profile-picture upload endpoint.
 * Storage logic is fully isolated in functions/lib/storage.js — swap providers
 * by updating that file only.
 *
 * Response always returns:
 *   { file_path, url, file_name, file_size, mime_type }
 *
 * Callers should store file_path and resolve URLs via buildFileUrl().
 */

import { getSupabase } from './_supabase.js';
import { getStorageService, buildFileUrl, sanitizeFileName } from '../lib/storage.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: CORS });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'POST') return err('Method not allowed', 405);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return err('Unauthorized', 401);

  const supabase = getSupabase(env);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return err('Invalid token', 401);

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
    const file     = formData.get('file');
    const kind     = String(formData.get('kind') || 'document').toLowerCase();
    const docType  = String(formData.get('document_type') || 'other').toLowerCase();

    if (!(file instanceof File)) return err('Missing file field');

    const safeKind = ['document', 'profile_picture'].includes(kind) ? kind : 'document';
    const safeName = sanitizeFileName(file.name);
    const ext      = safeName.includes('.') ? safeName.slice(safeName.lastIndexOf('.')) : '';
    const ts       = Date.now();

    // Generic path — no provider-specific prefix
    const filePath =
      safeKind === 'profile_picture'
        ? `profiles/${user.id}/${ts}${ext}`
        : `documents/${user.id}/${docType}/${ts}-${safeName}`;

    const buffer = await file.arrayBuffer();
    await storage.upload(filePath, buffer, {
      contentType:    file.type || 'application/octet-stream',
      customMetadata: { user_id: user.id, kind: safeKind, document_type: docType },
    });

    const url = buildFileUrl(filePath, env);
    if (!url) {
      return err('Upload succeeded but STORAGE_BASE_URL is not set in environment variables.', 500);
    }

    return new Response(
      JSON.stringify({
        file_path: filePath,
        url,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || 'application/octet-stream',
      }),
      { status: 201, headers: CORS }
    );
  } catch (e) {
    console.error('[upload] error:', e);
    return err(e.message || 'Upload failed', 500);
  }
}
