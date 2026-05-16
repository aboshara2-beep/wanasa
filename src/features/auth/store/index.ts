import { create }      from 'zustand';
import { persist }     from 'zustand/middleware';
import AsyncStorage    from '@react-native-async-storage/async-storage';

export interface User {
  id: string; name: string; username: string; avatar: string;
  role: 'user' | 'moderator' | 'admin';
  points: number; weeklyPoints: number; streak: number;
  graceUsed: boolean; isOnline: boolean;
  stats: { videos:number; followers:number; following:number; wins:number };
  blockedUsers: string[]; badges: any[];
  createdAt: string;
}

interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  setUser:         (u: User)   => void;
  setToken:        (t: string) => void;
  logout:          ()          => void;
  updatePoints:    (d: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, token: null,
      isAuthenticated: false, isLoading: false,

      setUser:  (user)  => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout:   ()      => set({ user:null, token:null, isAuthenticated:false }),
      updatePoints: (delta) => set(s => ({
        user: s.user ? {
          ...s.user,
          points:       s.user.points + delta,
          weeklyPoints: s.user.weeklyPoints + delta,
        } : null,
      })),
    }),
    {
      name: 'wanasa-auth',
      storage: {
        getItem:    async (k) => { const v = await AsyncStorage.getItem(k); return v ? JSON.parse(v) : null; },
        setItem:    async (k, v) => AsyncStorage.setItem(k, JSON.stringify(v)),
        removeItem: async (k)   => AsyncStorage.removeItem(k),
      },
    }
  )
);
