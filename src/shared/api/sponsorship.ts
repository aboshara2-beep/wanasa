import { GET }           from './interceptors';
import { ApiResponse, SponsoredState } from './types';

export const SponsorshipAPI = {
  // حالة الرعاية — يُستدعى عند فتح التطبيق
  getState: () =>
    GET<ApiResponse<SponsoredState>>('/sponsored/state', { auth: false }),
};
