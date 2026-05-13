import { GET, POST, PATCH, DELETE } from './interceptors';
import { ApiResponse, AdminStats }  from './types';

export const AdminAPI = {
  // إحصائيات
  getStats: () =>
    GET<ApiResponse<AdminStats>>('/admin/stats'),

  // فيديوهات
  getVideos: () =>
    GET<ApiResponse<any[]>>('/admin/videos'),

  updateVideo: (id: string, status: string) =>
    PATCH<ApiResponse<null>>(`/admin/videos/${id}`, { status }),

  deleteVideo: (id: string) =>
    DELETE<ApiResponse<null>>(`/admin/videos/${id}`),

  // بلاغات
  getReports: () =>
    GET<ApiResponse<any[]>>('/admin/reports'),

  resolveReport: (id: string, status: 'resolved' | 'rejected') =>
    PATCH<ApiResponse<null>>(`/admin/reports/${id}`, { status }),

  // مستخدمون
  getUsers: () =>
    GET<ApiResponse<any[]>>('/admin/users'),

  banUser: (id: string, ban: boolean, reason?: string) =>
    PATCH<ApiResponse<null>>(`/admin/users/${id}/ban`, { ban, reason }),

  // حملات ممولة
  getCampaigns: () =>
    GET<ApiResponse<any[]>>('/admin/campaigns'),

  createCampaign: (data: {
    sponsorName: string; title: string; description: string;
    logoUrl: string; themeColor: string; budget: number;
    startAt: string; endAt: string; priority: number;
  }) => POST<ApiResponse<{ id: string }>>('/admin/campaigns', data),

  activateCampaign: (id: string, lockChallenges: boolean, pinToFeed: boolean) =>
    POST<ApiResponse<null>>(`/admin/campaigns/${id}/activate`, {
      lockChallenges, pinToFeed,
    }),

  endCampaign: (id: string) =>
    POST<ApiResponse<null>>(`/admin/campaigns/${id}/end`),
};
