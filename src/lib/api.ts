import axios from 'axios';

export function createApiClient() {
  const base = (import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:4000';
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const instance = axios.create({ baseURL: base, headers: { Authorization: token ? `Bearer ${token}` : '' } });
  instance.interceptors.request.use((cfg) => {
    const t = localStorage.getItem('token');
    if (t) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${t}` };
    return cfg;
  });
  return instance;
}
