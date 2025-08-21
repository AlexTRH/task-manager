import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? useAuthStore.getState().accessToken : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((res) => res, async (error) => {
  const original: any = error.config;
  if (error.response?.status === 401 && !original._retry) {
    original._retry = true;
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        const resp = await api.post('/auth/refresh', { refreshToken });
        useAuthStore.getState().setAccessToken(resp.data.accessToken);
        original.headers.Authorization = `Bearer ${resp.data.accessToken}`;
        return api(original);
      } catch (_) {
        useAuthStore.getState().logout();
      }
    }
  }
  return Promise.reject(error);
});

export default api;

export async function loginApi(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}
