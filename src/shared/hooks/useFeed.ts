import { useEffect, useCallback, useRef } from 'react';
import { FeedAPI }      from '../api/feed';
import { useFeedStore } from '../../features/feed/store';

export function useFeed() {
  const { videos, hasMore, isLoading, setVideos, appendVideos, setLoading } = useFeedStore();
  const page = useRef(1);

  const loadFeed = useCallback(async (reset = false) => {
    if (isLoading) return;
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page.current;
      const data = await FeedAPI.getFeed(currentPage);

      if (reset) {
        setVideos(data.videos ?? []);
        page.current = 2;
      } else {
        appendVideos(data.videos ?? []);
        page.current += 1;
      }
    } catch (err) {
      console.log('Feed error:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    loadFeed(true);
  }, []);

  return {
    videos,
    hasMore,
    isLoading,
    refresh:  () => loadFeed(true),
    loadMore: () => hasMore && !isLoading && loadFeed(false),
  };
}
