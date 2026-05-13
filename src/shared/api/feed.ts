import { GET, POST }       from './interceptors';
import { PagedResponse, ApiResponse, Video } from './types';

export const FeedAPI = {
  // الفيد الهجين — Backend يطبق الخوارزمية
  getFeed: (page = 1) =>
    GET<PagedResponse<Video>>(`/feed?page=${page}`),

  // تفاعلات
  like:    (id: string) =>
    POST<ApiResponse<{ liked: boolean }>>(`/videos/${id}/like`),

  vote:    (id: string) =>
    POST<ApiResponse<{ voted: boolean }>>(`/videos/${id}/vote`),

  save:    (id: string) =>
    POST<ApiResponse<{ saved: boolean }>>(`/videos/${id}/save`),

  view: (id: string, watchTime: number, deviceHash?: string) =>
    POST<ApiResponse<{ counted: boolean }>>(`/videos/${id}/view`, {
      watchTime,
      deviceHash: deviceHash ?? '',
    }),

  comment: (id: string, content: string, parentId?: string) =>
    POST<ApiResponse<{ id: string }>>(`/videos/${id}/comment`, {
      content,
      parentId,
    }),

  report: (id: string, reason: string) =>
    POST<ApiResponse<null>>(`/videos/${id}/report`, { reason }),
};
