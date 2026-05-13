import { useCallback } from 'react';
import { POST }        from '../api/interceptors';
import { useAuthStore }from '../../features/auth/store';

type EventType =
  | 'session_start' | 'video_watch' | 'video_upload'
  | 'vote' | 'comment' | 'challenge_view' | 'feed_scroll';

export function useAnalytics() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  const track = useCallback((
    type:     EventType,
    metadata: Record<string, any> = {},
  ) => {
    if (!isAuthenticated) return;
    // Fire and forget
    POST('/analytics/track', { type, metadata }).catch(() => {});
  }, [isAuthenticated]);

  return { track };
}
