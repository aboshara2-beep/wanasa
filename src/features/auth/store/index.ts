import { create }   from 'zustand';
import type { User } from '../../../shared/api/types';
import { socket }    from '../../../shared/api/websocket';

interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;

  setUser:   (user: User)  => void;
  setToken:  (token: string) => void;
  logout:    () => void;
  updatePoints: (delta: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  token:           null,
  isAuthenticated: false,
  isLoading:       false,

  setUser:  (user)  => set({ user, isAuthenticated: true }),
  setToken: (token) => set({ token }),

  logout: () => {
    socket.disconnect();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updatePoints: (delta) => set(s => ({
    user: s.user
      ? { ...s.user, points: s.user.points + delta,
          weeklyPoints: (s.user as any).weeklyPoints + delta }
      : null,
  })),
}));
