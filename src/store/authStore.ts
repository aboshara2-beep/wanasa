import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user:          User | null;
  token:         string | null;
  isLoading:     boolean;
  isAuthenticated: boolean;

  setUser:       (user: User) => void;
  setToken:      (token: string) => void;
  logout:        () => void;
  updatePoints:  (points: number) => void;
  updateStreak:  (streak: number, graceUsed: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  token:           null,
  isLoading:       false,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setToken: (token) => set({ token }),

  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  updatePoints: (delta) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            points:       state.user.points + delta,
            weeklyPoints: state.user.weeklyPoints + delta,
          }
        : null,
    })),

  updateStreak: (streak, graceUsed) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, streak, graceUsed }
        : null,
    })),
}));
