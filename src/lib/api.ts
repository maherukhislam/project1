import supabase from './supabase';

type JsonValue = Record<string, any> | null;

const PUBLIC_CACHE_RULES: Array<{ prefix: string; ttlMs: number }> = [
  { prefix: '/api/countries', ttlMs: 30 * 60 * 1000 },
  { prefix: '/api/universities', ttlMs: 5 * 60 * 1000 },
  { prefix: '/api/scholarships', ttlMs: 5 * 60 * 1000 },
  { prefix: '/api/blog', ttlMs: 5 * 60 * 1000 },
  { prefix: '/api/programs', ttlMs: 2 * 60 * 1000 }
];

const getCacheTtl = (url: string) =>
  PUBLIC_CACHE_RULES.find((rule) => url.startsWith(rule.prefix))?.ttlMs ?? 0;

const responseCache = new Map<string, { expiresAt: number; value: any }>();
const inFlightGets = new Map<string, Promise<any>>();

let cachedToken: string | null = null;
let tokenFetchedAt = 0;
let tokenPromise: Promise<string | null> | null = null;

const invalidateGetCache = () => {
  responseCache.clear();
  inFlightGets.clear();
};

const getToken = async (): Promise<string | null> => {
  const now = Date.now();
  if (cachedToken && now - tokenFetchedAt < 30_000) {
    return cachedToken;
  }

  if (!tokenPromise) {
    tokenPromise = supabase.auth.getSession()
      .then(({ data: { session } }) => {
        cachedToken = session?.access_token || null;
        tokenFetchedAt = Date.now();
        return cachedToken;
      })
      .finally(() => {
        tokenPromise = null;
      });
  }

  return tokenPromise;
};

async function parseError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json?.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

async function requestJson(url: string, init: RequestInit = {}): Promise<JsonValue> {
  const token = await getToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...init,
    headers
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json().catch(() => null);
}

export const api = {
  async get(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    const ttlMs = getCacheTtl(url);
    const now = Date.now();

    if (ttlMs > 0) {
      const cached = responseCache.get(url);
      if (cached && cached.expiresAt > now) {
        return cached.value;
      }
    }

    const pending = inFlightGets.get(url);
    if (pending) {
      return pending;
    }

    const request = requestJson(url)
      .then((data) => {
        if (ttlMs > 0) {
          responseCache.set(url, { value: data, expiresAt: Date.now() + ttlMs });
        }
        return data;
      })
      .finally(() => {
        inFlightGets.delete(url);
      });

    inFlightGets.set(url, request);
    return request;
  },

  async post(endpoint: string, data: Record<string, any>): Promise<any> {
    invalidateGetCache();
    return requestJson(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async put(endpoint: string, data: Record<string, any>): Promise<any> {
    invalidateGetCache();
    return requestJson(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(endpoint: string, data: Record<string, any>): Promise<any> {
    invalidateGetCache();
    return requestJson(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(data)
    });
  }
};
