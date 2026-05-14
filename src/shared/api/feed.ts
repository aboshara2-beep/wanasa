import { apiFetch } from './interceptors';

export const FeedAPI = {
  getFeed: (page = 1) =>
    apiFetch<{ videos: any[]; hasMore: boolean }>(`/feed?page=${page}`),

  like:    (id: string) => apiFetch(`/videos/${id}/like`,    { method: 'POST' }),
  vote:    (id: string) => apiFetch(`/videos/${id}/vote`,    { method: 'POST' }),
  save:    (id: string) => apiFetch(`/videos/${id}/save`,    { method: 'POST' }),
  view:    (id: string) => apiFetch(`/videos/${id}/view`,    { method: 'POST' }),
  comment: (id: string, text: string) =>
    apiFetch(`/videos/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content: text }),
    }),
};
