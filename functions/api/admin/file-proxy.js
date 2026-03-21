/**
 * GET /api/admin/file-proxy?url=<encoded-url>
 *
 * Server-side proxy for fetching files that may have CORS restrictions
 * when fetched directly from the browser (e.g. R2, S3 buckets).
 *
 * Used exclusively by the PDF generator to embed student photos and documents.
 * Requires admin JWT.
 */

import { getSupabase } from '../_supabase.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
]);

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'GET') return err('Method not allowed', 405);

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return err('Unauthorized', 401);

  const supabase = getSupabase(env);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return err('Invalid token', 401);

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') return err('Admin access required', 403);

  const reqUrl = new URL(request.url);
  const targetUrl = reqUrl.searchParams.get('url');
  if (!targetUrl) return err('url parameter is required');

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return err('Invalid url parameter');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return err('Only http/https URLs are allowed');
  }

  try {
    const upstream = await fetch(targetUrl, { method: 'GET' });
    if (!upstream.ok) {
      return err(`Upstream fetch failed: ${upstream.status} ${upstream.statusText}`, 502);
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const baseType = contentType.split(';')[0].trim().toLowerCase();

    if (!ALLOWED_CONTENT_TYPES.has(baseType)) {
      return err(`File type not allowed for embedding: ${baseType}`, 415);
    }

    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (e) {
    console.error('[file-proxy] error:', e);
    return err(e.message || 'Failed to proxy file', 500);
  }
}
