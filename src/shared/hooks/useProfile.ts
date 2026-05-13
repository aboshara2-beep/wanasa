import { useState, useEffect, useCallback } from 'react';
import { GET, POST, DELETE } from '../api/interceptors';
import { parseError }        from '../api/errors';
import { useAuthStore }      from '../../features/auth/store';

interface Profile {
  id: string; name: string; username: string;
  avatar: string; points: number; streak: number;
  isOnline: boolean; isFollowing: boolean; isBlocked: boolean;
  stats: { followers: number; following: number; videos: number; wins: number; };
}

interface StreakInfo {
  current: number; graceUsed: boolean; lastDay: string;
}

export function useProfile(userID: string) {
  const [profile,  setProfile]  = useState<Profile | null>(null);
  const [streak,   setStreak]   = useState<StreakInfo | null>(null);
  const [videos,   setVideos]   = useState<any[]>([]);
  const [badges,   setBadges]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);

  const myID = useAuthStore(s => s.user?.id);
  const isMe = userID === 'me' || userID === myID;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, videosRes] = await Promise.all([
        GET<any>(`/users/${userID}`),
        GET<any>(`/users/${userID}/videos`),
      ]);
      setProfile(profileRes.data);
      setVideos(videosRes.data ?? []);

      if (isMe) {
        const [streakRes, badgesRes] = await Promise.all([
          GET<any>('/users/me/streak'),
          GET<any>('/users/me/badges'),
        ]);
        setStreak(streakRes.data);
        setBadges(badgesRes.data ?? []);
      }
    } catch (err) {
      console.error(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, [userID, isMe]);

  const follow = useCallback(async () => {
    if (!profile) return;
    // Optimistic
    setProfile(p => p ? { ...p, isFollowing: !p.isFollowing,
      stats: { ...p.stats,
        followers: p.isFollowing ? p.stats.followers-1 : p.stats.followers+1
      }
    } : null);
    try {
      await POST(`/users/${userID}/follow`);
    } catch {
      load(); // rollback
    }
  }, [profile, userID, load]);

  const block = useCallback(async () => {
    await POST(`/users/${userID}/block`);
    setProfile(p => p ? { ...p, isBlocked: true } : null);
  }, [userID]);

  const unblock = useCallback(async () => {
    await DELETE(`/users/${userID}/block`);
    setProfile(p => p ? { ...p, isBlocked: false } : null);
  }, [userID]);

  useEffect(() => { load(); }, [load]);

  return {
    profile, streak, videos, badges,
    loading, isMe,
    follow, block, unblock, refresh: load,
  };
}
