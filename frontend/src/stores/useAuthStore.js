import { create } from 'zustand';
import { useUserStore } from './useUserStore';
import { useCoverStore } from './useCoverStore';

const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

const initialUser = getInitialUser();
const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

import { API_BASE_URL } from '../config/apiConfig';

const clearStudentSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('studentName');
  localStorage.removeItem('studentID');
  localStorage.removeItem('departmentName');
  try {
    useUserStore.getState().clearProfile();
  } catch (e) {}
  try {
    useCoverStore.getState().clearStudentInfo();
  } catch (e) {}
};

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
  isGuest: !initialToken,
  isLoading: false,
  error: null,

  setGuestMode: () => {
    clearStudentSession();
    set({ isGuest: true, user: null, isAuthenticated: false });
  },

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isGuest: false, error: null });
  },

  updateUser: (partialData) =>
    set((state) => {
      const updated = state.user ? { ...state.user, ...partialData } : partialData;
      if (updated) {
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return { user: updated };
    }),

  checkAuth: async () => {
    const token = get().token || localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          set({ user: data.user, isAuthenticated: true, isGuest: false });
        }
      } else if (res.status === 401 || res.status === 403) {
        clearStudentSession();
        set({ user: null, token: null, isAuthenticated: false, isGuest: true });
      }
    } catch (err) {
      console.warn('[checkAuth] Profile refresh warning:', err.message);
    }
  },

  logout: () => {
    clearStudentSession();
    set({ user: null, token: null, isAuthenticated: false, isGuest: true });
  },
}));
