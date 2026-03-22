/**
 * GET /api/admin/file-proxy?url=<encoded-url>
 *
 * Server-side proxy for fetching files that may have CORS restrictions
 * when fetched directly from the browser (e.g. R2, S3 buckets).
 *
 * Used exclusively by the PDF generator to embed student photos and documents.
 * Requires admin JWT.
 *
 * Security:
 *  - Admin-only (JWT checked against profiles table)
 *  - URL must belong to the configured STORAGE_BASE_URL (allowlist)
 *  - SSRF protection: private/reserved IP ranges and internal hostnames blocked
 *  - Response content-type must be an allowed media type
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

// ── SSRF protection ───────────────────────────────────────────────────────────
// Block known private/link-local/loopback hostnames and IP literals.
// This prevents an authenticated admin from probing internal services
// (cloud metadata endpoints, internal APIs, localhost, etc.).
const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,         // 127.0.0.0/8   loopback
  /^10\.\d+\.\d+\.\d+$/,          // 10.0.0.0/8    RFC-1918
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // 172.16.0.0/12 RFC-1918
  /^192\.168\.\d+\.\d+$/,          // 192.168.0.0/16 RFC-1918
  /^169\.254\.\d+\.\d+$/,          // 169.254.0.0/16 link-local (AWS/GCP metadata)
  /^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\.\d+\.\d+$/, // 100.64.0.0/10 CGNAT
  /^::1$/,                          // IPv6 loopback
  /^fc[0-9a-f][0-9a-f]:/i,        // IPv6 unique-local fc00::/7
  /^fd[0-9a-f][0-9a-f]:/i,
  /^fe80:/i,                        // IPv6 link-local
  /^0\.0\.0\.0$/,
  /^metadata\.google\.internal$/i,
  /\.internal$/i,
  /\.local$/i,
];

function isBlockedHost(hostname) {
  return BLOCKED_HOSTNAME_PATTERNS.some((re) => re.test(hostname));
}

function err(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'GET')    return err('Method not allowed', 405);

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return err('Unauthorized', 401);

  const supabase = getSupabase(env);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return err('Invalid token', 401);

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') return err('Admin access required', 403);

  const reqUrl    = new URL(request.url);
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

  // ── Domain allowlist — URL must belong to our configured storage bucket ────
  // This is the primary SSRF defence: we only ever proxy our own storage URLs.
  const storageBase = env.STORAGE_BASE_URL || '';
  if (storageBase) {
    try {
      const allowedHost = new URL(storageBase).hostname;
      if (parsed.hostname !== allowedHost) {
        return err('URL is not in the allowed storage domain');
      }
    } catch {
      return err('Server storage configuration error', 500);
    }
  }

  // ── Secondary SSRF defence — block private/reserved IPs ───────────────────
  // Catches cases where the storage domain resolves to an internal address,
  // or where no STORAGE_BASE_URL is configured.
  if (isBlockedHost(parsed.hostname)) {
    return err('URL resolves to a blocked address');
  }

  try {
    const upstream = await fetch(targetUrl, { method: 'GET' });
    if (!upstream.ok) {
      return err(`Upstream fetch failed: ${upstream.status}`, 502);
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const baseType    = contentType.split(';')[0].trim().toLowerCase();

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
    console.error('[file-proxy] upstream fetch error:', e);
    return err('Failed to retrieve the requested file', 502);
  }
}
