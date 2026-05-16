import { useEffect, useCallback, useRef } from 'react';
import { API_CONFIG }   from '../api/config';
import { useAuthStore } from '../../features/auth/store';
import { useFeedStore } from '../../features/feed/store';
import type { Video }   from '../../features/feed/store';

export function useFeed() {
  const { videos, hasMore, isLoading, setVideos, appendVideos, setLoading } = useFeedStore();
  const token = useAuthStore(s => s.token);
  const page  = useRef(1);
  const loaded = useRef(false);

  const mapVideo = (v: any): Video => ({
    id:          v.id          ?? '',
    userId:      v.userId      ?? v.user_id     ?? '',
    userName:    v.userName    ?? v.user_name   ?? 'مستخدم',
    userAvatar:  v.userAvatar  ?? v.user_avatar ?? '',
    url:         v.url         ?? v.videoUrl    ?? v.video_url ?? '',
    thumbnail:   v.thumbnail   ?? v.thumbnailUrl ?? v.thumbnail_url ?? '',
    title:       v.title       ?? '',
    description: v.description ?? '',
    likes:       v.likes       ?? v.likesCount    ?? v.likes_count    ?? 0,
    votes:       v.votes       ?? v.votesCount    ?? v.votes_count    ?? 0,
    comments:    v.comments    ?? v.commentsCount ?? v.comments_count ?? 0,
    saves:       v.saves       ?? v.savesCount    ?? v.saves_count    ?? 0,
    views:       v.views       ?? v.viewsCount    ?? v.views_count    ?? 0,
    duration:    v.duration    ?? 30,
    isLiked:     v.isLiked     ?? v.is_liked     ?? false,
    isVoted:     v.isVoted     ?? v.is_voted     ?? false,
    isSaved:     v.isSaved     ?? v.is_saved     ?? false,
    isWinner:    v.isWinner    ?? v.is_winner    ?? false,
    isSponsored: v.isSponsored ?? v.is_sponsored ?? false,
    feedType:    v.feedType    ?? v.feed_type    ?? 'for_you',
    createdAt:   v.createdAt   ?? v.created_at  ?? new Date().toISOString(),
  });

  const loadFeed = useCallback(async (reset = false) => {
    if (!token || isLoading) return;
    setLoading(true);
    try {
      const p = reset ? 1 : page.current;
      const res = await fetch(`${API_CONFIG.BASE_URL}/feed?page=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const raw  = data?.data?.videos ?? data?.videos ?? [];
      const newVideos = raw.map(mapVideo);

      if (reset) {
        setVideos(newVideos);
        page.current = 2;
      } else {
        appendVideos(newVideos);
        page.current += 1;
      }
    } catch (e) {
      console.log('Feed error:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && !loaded.current) {
      loaded.current = true;
      loadFeed(true);
    }
  }, [token]);

  return {
    videos,
    hasMore,
    isLoading,
    refresh:  () => { loaded.current = false; loadFeed(true); },
    loadMore: () => hasMore && !isLoading && loadFeed(false),
  };
}
