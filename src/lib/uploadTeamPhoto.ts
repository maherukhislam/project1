/**
 * Upload a team member photo.
 *
 * Production (Cloudflare Pages): POSTs to /api/team-photo → stored in R2.
 * Development (local / Replit):  Converts to a base64 data URL stored in-memory.
 */

export async function uploadTeamPhoto(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/team-photo', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      if (json.url) return json.url as string;
    }

    const text = await res.text().catch(() => '');
    console.warn('R2 upload unavailable, falling back to local preview.', text);
  } catch (err) {
    console.warn('R2 upload failed (likely local dev), using base64 fallback.', err);
  }

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
