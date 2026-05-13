import { useState, useCallback, useRef, useEffect } from 'react';
import { FeedAPI }         from '../api/feed';
import { parseError }      from '../api/errors';
import { socket }          from '../api/websocket';
import { useFeedStore }    from '../../features/feed/store';
import type { Video }      from '../api/types';

export function useFeed() {
  const [loading,     setLoading]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const {
    videos, appendVideos, setVideos,
    likeVideo, voteVideo, saveVideo,
    hasMore,
  } = useFeedStore();

  const page    = useRef(1);
  const fetching= useRef(false);

  // ── جلب الفيد ──
  const fetchFeed = useCallback(async (reset = false) => {
    if (fetching.current) return;
    fetching.current = true;

    try {
      if (reset) {
        setRefreshing(true);
        page.current = 1;
      } else {
        setLoading(true);
      }

      const res = await FeedAPI.getFeed(page.current);
      const newVideos = res.data ?? [];

      if (reset) {
        setVideos(newVideos);
      } else {
        appendVideos(newVideos);
      }

      if (res.hasMore) page.current++;

    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetching.current = false;
    }
  }, [setVideos, appendVideos]);

  // ── تحميل الأول ──
  useEffect(() => {
    fetchFeed(true);

    // الاستماع لفائز جديد من WS
    const unsub = socket.on('new_winner', (payload: Video) => {
      useFeedStore.getState().setWinner(payload);
    });

    return () => { unsub(); };
  }, []);

  // ── تحميل المزيد ──
  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchFeed(false);
  }, [loading, hasMore, fetchFeed]);

  const refresh = useCallback(() => fetchFeed(true), [fetchFeed]);

  // ── Optimistic Actions ──
  const handleLike = useCallback(async (videoId: string) => {
    likeVideo(videoId); // Optimistic
    try {
      await FeedAPI.like(videoId);
    } catch {
      likeVideo(videoId); // Rollback
    }
  }, [likeVideo]);

  const handleVote = useCallback(async (videoId: string) => {
    voteVideo(videoId);
    try {
      await FeedAPI.vote(videoId);
    } catch {
      voteVideo(videoId);
    }
  }, [voteVideo]);

  const handleSave = useCallback(async (videoId: string) => {
    saveVideo(videoId);
    try {
      await FeedAPI.save(videoId);
    } catch {
      saveVideo(videoId);
    }
  }, [saveVideo]);

  const handleView = useCallback((videoId: string, watchTime: number) => {
    FeedAPI.view(videoId, watchTime).catch(() => {});
  }, []);

  return {
    videos,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    handleLike,
    handleVote,
    handleSave,
    handleView,
  };
}
