import { create } from 'zustand';
interface AuthState { user: any; token: string | null; setUser: (u: any) => void; setToken: (t: string) => void; }
export const useAuthStore = create<AuthState>((set) => ({
  user: null, token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));
