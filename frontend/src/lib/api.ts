import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

let csrfToken: string | null = null;
async function ensureCsrf() {
  if (!csrfToken) {
    const { data } = await api.get('/auth/csrf');
    csrfToken = data.csrfToken;
  }
}

api.interceptors.request.use(async (config) => {
  const token = typeof window !== 'undefined' ? useAuthStore.getState().accessToken : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = (config.method || 'get').toUpperCase();
  if (!['GET','HEAD','OPTIONS'].includes(method)) {
    await ensureCsrf();
    if (csrfToken) config.headers['x-csrf-token'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use((res) => res, async (error) => {
  const original: any = error.config;
  if (error.response?.status === 401 && !original._retry) {
    original._retry = true;
    try {
      const resp = await api.post('/auth/refresh'); 
      useAuthStore.getState().setAccessToken(resp.data.accessToken);
      original.headers.Authorization = `Bearer ${resp.data.accessToken}`;
      return api(original);
    } catch {
      useAuthStore.getState().logout();
    }
  }
  return Promise.reject(error);
});

export default api;

export async function loginApi(
  email: string,
  password: string
): Promise<{ accessToken: string; user: { id: string; email: string; name: string } }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}
