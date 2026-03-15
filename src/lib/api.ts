import supabase from './supabase';

const getToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export const api = {
  async get(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const token = await getToken();
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },

  async post(endpoint: string, data: Record<string, any>): Promise<any> {
    const token = await getToken();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },

  async put(endpoint: string, data: Record<string, any>): Promise<any> {
    const token = await getToken();
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },

  async delete(endpoint: string, data: Record<string, any>): Promise<any> {
    const token = await getToken();
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  }
};
