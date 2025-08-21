'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: string; email: string; name: string };
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  setAccessToken: (t: string) => void;
  logout: () => void;
  isAuthed: () => boolean;
};

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setAuth: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
  setAccessToken: (t) => set({ accessToken: t }),
  logout: () => set({ accessToken: null, refreshToken: null, user: null }),
  isAuthed: () => !!get().accessToken,
}), { name: 'auth-store' }));
