import { useState, useEffect, useCallback } from 'react';
import { LeaderboardAPI }  from '../api/leaderboard';
import { parseError }      from '../api/errors';
import { socket }          from '../api/websocket';
import type { LeaderEntry }from '../api/types';

interface MyRank { rank: number; points: number; }

export function useLeaderboard() {
  const [leaders,   setLeaders]   = useState<LeaderEntry[]>([]);
  const [myRank,    setMyRank]    = useState<MyRank | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [nearWin,   setNearWin]   = useState<{ rank: number; gap: number } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [top, me] = await Promise.all([
        LeaderboardAPI.getTop(),
        LeaderboardAPI.getMyRank(),
      ]);
      setLeaders(top.data ?? []);
      setMyRank(me.data);
    } catch (err) {
      console.error(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // WS: تحديث فوري للترتيب
    const unsubLB = socket.on('leaderboard_update', () => load());

    // WS: Near Win
    const unsubNW = socket.on('near_win', (payload: { rank: number; gap: number }) => {
      setNearWin(payload);
    });

    // WS: فائز أسبوعي
    const unsubWin = socket.on('weekly_winner', () => load());

    return () => { unsubLB(); unsubNW(); unsubWin(); };
  }, [load]);

  return { leaders, myRank, loading, nearWin, refresh: load };
}
