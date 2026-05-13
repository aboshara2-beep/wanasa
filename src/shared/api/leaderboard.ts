import { GET }           from './interceptors';
import { ApiResponse, LeaderEntry } from './types';

export const LeaderboardAPI = {
  // أفضل 20 مستخدم
  getTop: () =>
    GET<ApiResponse<LeaderEntry[]>>('/leaderboard'),

  // ترتيب المستخدم الحالي
  getMyRank: () =>
    GET<ApiResponse<{ rank: number; points: number }>>('/leaderboard/me'),
};
