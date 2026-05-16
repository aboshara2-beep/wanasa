import { useState, useEffect } from 'react';
import { API_CONFIG }   from '../api/config';
import { useAuthStore } from '../../features/auth/store';

export function useProfile() {
  const token   = useAuthStore(s => s.token);
  const user    = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const [videos,   setVideos]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchMyVideos();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res  = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setUser({
          ...user!,
          ...data.data,
          weeklyPoints: user?.weeklyPoints ?? 0,
          graceUsed:    user?.graceUsed    ?? false,
          isOnline:     true,
          blockedUsers: user?.blockedUsers ?? [],
          badges:       user?.badges       ?? [],
          stats:        data.data.stats ?? user?.stats ?? { videos:0, followers:0, following:0, wins:0 },
        });
      }
    } catch {}
  };

  const fetchMyVideos = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_CONFIG.BASE_URL}/users/me/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVideos(data?.data?.videos ?? data?.videos ?? []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return { user, videos, loading, refresh: fetchProfile };
}
