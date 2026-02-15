import axios from 'axios';

export function createApiClient() {
  const base = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:4000';
  const instance = axios.create({ baseURL: base });
  instance.interceptors.request.use((cfg) => {
    try {
      const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
      if (t) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${t}` };
    } catch (e) {}
    return cfg;
  });
  instance.interceptors.response.use((r) => r, (err) => {
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {}
      // reload to go to login
      if (typeof window !== 'undefined') window.location.reload();
    }
    return Promise.reject(err);
  });
  return instance;
}
