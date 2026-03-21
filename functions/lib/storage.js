/**
 * STORAGE-AGNOSTIC SERVICE LAYER
 *
 * Architecture:
 *   API route → getStorageService(env) → StorageService impl → Provider (R2, S3, …)
 *
 * To swap storage later: add a new class extending StorageService, update
 * getStorageService() to return it. Zero other changes needed.
 *
 * Rule: store only file_path (e.g. "team/123.jpg") in the DB.
 *       URLs are built at request time via buildFileUrl().
 */

// ── Base (interface) ─────────────────────────────────────────────────────────

export class StorageService {
  /**
   * Upload a file buffer to the given path.
   * @param {string} path  - generic path, e.g. "team/1234.jpg"
   * @param {ArrayBuffer} buffer
   * @param {object} options - { contentType, customMetadata }
   * @returns {Promise<string>} the same path (for chaining)
   */
  async upload(path, buffer, options = {}) {
    throw new Error('StorageService.upload() not implemented');
  }

  /**
   * Delete the file at path.
   * @param {string} path
   */
  async delete(path) {
    throw new Error('StorageService.delete() not implemented');
  }
}

// ── Cloudflare R2 implementation ─────────────────────────────────────────────

export class R2StorageService extends StorageService {
  /** @param {R2Bucket} bucket - the Cloudflare R2 binding */
  constructor(bucket) {
    super();
    this.bucket = bucket;
  }

  async upload(path, buffer, options = {}) {
    const { contentType = 'application/octet-stream', customMetadata = {} } = options;
    await this.bucket.put(path, buffer, {
      httpMetadata: { contentType },
      customMetadata,
    });
    return path;
  }

  async delete(path) {
    await this.bucket.delete(path);
  }
}

// ── Future: AWS S3 (drop-in replacement) ────────────────────────────────────
//
// export class S3StorageService extends StorageService {
//   constructor(client, bucket) { super(); this.client = client; this.bucket = bucket; }
//   async upload(path, buffer, options = {}) {
//     await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: path, Body: buffer, ContentType: options.contentType }));
//     return path;
//   }
//   async delete(path) {
//     await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: path }));
//   }
// }

// ── URL builder (provider-agnostic) ─────────────────────────────────────────

/**
 * Build a public URL for a stored file path.
 *
 * Only ONE env var matters: STORAGE_BASE_URL
 * Changing it is the ONLY thing needed to switch CDN/provider.
 *
 * @param {string} filePath - e.g. "team/1234.jpg"
 * @param {object} env      - Cloudflare env object
 * @returns {string|null}
 */
export function buildFileUrl(filePath, env) {
  const base = env.STORAGE_BASE_URL;
  if (!base || !filePath) return null;
  return `${base.replace(/\/+$/, '')}/${filePath}`;
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Returns the configured StorageService, or null if no binding is available.
 * Adding a new provider: detect its env binding here, return its service class.
 *
 * @param {object} env - Cloudflare env object
 * @returns {StorageService|null}
 */
export function getStorageService(env) {
  // Cloudflare R2 binding (one of several possible names for flexibility)
  const r2Bucket =
    env.STUDYGLOBAL_UPLOADS ||
    env.UPLOADS_BUCKET ||
    env.R2_BUCKET ||
    env.BUCKET;

  if (r2Bucket && typeof r2Bucket.put === 'function') {
    return new R2StorageService(r2Bucket);
  }

  // Future providers would be detected here:
  // if (env.S3_BUCKET) return new S3StorageService(...);
  // if (env.SUPABASE_STORAGE_URL) return new SupabaseStorageService(...);

  return null;
}

// ── Shared path helpers ───────────────────────────────────────────────────────

/**
 * Sanitize a filename to be safe for storage.
 * @param {string} name
 * @returns {string}
 */
export function sanitizeFileName(name = '') {
  return String(name).trim().replace(/[^\w.\-]/g, '_') || 'file';
}
