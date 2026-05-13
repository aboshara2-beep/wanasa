import { POST, GET }      from './interceptors';
import { ApiResponse, AuthResponse, User } from './types';

export const AuthAPI = {
  // تسجيل الدخول بفيسبوك
  facebook: (accessToken: string) =>
    POST<ApiResponse<AuthResponse>>('/auth/facebook', { accessToken }, { auth: false }),

  // جلب بيانات المستخدم الحالي
  me: () =>
    GET<ApiResponse<User>>('/auth/me'),
};
