import { create } from 'zustand';

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

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
  isGuest: !initialToken,
  isLoading: false,
  error: null,

  setGuestMode: () => set({ isGuest: true, user: null, isAuthenticated: false }),

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
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          set({ user: data.user, isAuthenticated: true, isGuest: false });
        }
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isGuest: true });
      }
    } catch (err) {
      console.warn('[checkAuth] Profile refresh warning:', err.message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isGuest: true });
  },
}));
