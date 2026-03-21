/**
 * FRONTEND STORAGE UTILITIES
 *
 * Mirrors the backend storage abstraction for the frontend.
 * Only VITE_STORAGE_BASE_URL matters — change it to switch CDN/provider.
 *
 * Rules:
 *   - Store only file_path in state/DB (e.g. "team/1234.jpg")
 *   - Call buildFileUrl(path) only when rendering <img src=…>
 *   - Never hardcode r2.dev, cloudflare, or any provider URL
 */

const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL ?? '';

/**
 * Convert a stored file_path to a full public URL.
 *
 * Handles three cases:
 *   1. Already a full URL (http/https)   → returned as-is  (legacy / external)
 *   2. Base64 data URL (data:…)          → returned as-is  (local dev fallback)
 *   3. A generic file path               → prepend STORAGE_BASE_URL
 */
export function buildFileUrl(filePath: string): string {
  if (!filePath) return '';
  if (filePath.startsWith('http') || filePath.startsWith('data:')) return filePath;
  if (!STORAGE_BASE_URL) return filePath; // no base URL configured yet
  return `${STORAGE_BASE_URL.replace(/\/+$/, '')}/${filePath}`;
}

/**
 * Upload a team member photo.
 *
 * Returns a file_path (e.g. "team/1234.jpg") that should be stored
 * in state / DB. Use buildFileUrl() to render it.
 *
 * Production (Cloudflare Pages): POSTs to /api/team-photo → stored in R2.
 * Dev (Replit / local):          Falls back to a base64 data URL (acts as file_path).
 */
export async function uploadTeamPhoto(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/team-photo', { method: 'POST', body: formData });

    if (res.ok) {
      const json: { file_path?: string; url?: string } = await res.json();
      // Prefer file_path (storage-agnostic). Fall back to url for older API versions.
      if (json.file_path) return json.file_path;
      if (json.url) return json.url;
    }

    const errText = await res.text().catch(() => '');
    console.warn('[storage] Upload API unavailable, using local preview fallback.', errText);
  } catch (err) {
    console.warn('[storage] Upload failed (likely local dev), using base64 fallback.', err);
  }

  // Dev fallback: base64 data URL — treated as file_path, rendered directly by buildFileUrl
  return toBase64(file);
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
