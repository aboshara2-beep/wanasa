import { GET, PATCH, POST } from './interceptors';
import { ApiResponse, Notification } from './types';

export const NotificationsAPI = {
  // جلب الإشعارات
  getAll: () =>
    GET<ApiResponse<Notification[]>>('/notifications'),

  // تعليم كمقروء
  markRead: (id: string) =>
    PATCH<ApiResponse<null>>(`/notifications/${id}/read`),

  // تعليم الكل كمقروء
  markAllRead: () =>
    PATCH<ApiResponse<null>>('/notifications/all/read'),

  // تسجيل Expo Push Token
  registerToken: (token: string, platform: 'ios' | 'android') =>
    POST<ApiResponse<null>>('/notifications/token', { token, platform }),
};
