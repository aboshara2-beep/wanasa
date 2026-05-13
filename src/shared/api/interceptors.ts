import { useAuthStore } from '../../features/auth/store';
import { API_CONFIG }   from './config';
import { ApiError }     from './errors';

interface RequestOptions extends RequestInit {
  timeout?: number;
  auth?:    boolean;
}

// ── Core Fetch ──
export async function apiFetch<T>(
  endpoint: string,
  options:  RequestOptions = {},
): Promise<T> {
  const {
    timeout = API_CONFIG.TIMEOUT,
    auth    = true,
    ...init
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  };

  // JWT Token
  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timer);

    // 401 → logout
    if (res.status === 401) {
      useAuthStore.getState().logout();
      throw new ApiError(401, 'انتهت الجلسة — سجّل الدخول مجدداً');
    }

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        res.status,
        body.message ?? 'حدث خطأ',
      );
    }

    return body as T;

  } catch (err) {
    clearTimeout(timer);
    if (err instanceof ApiError) throw err;
    if ((err as any)?.name === 'AbortError')
      throw new ApiError(0, 'انتهت مهلة الاتصال');
    throw new ApiError(0, 'تعذّر الاتصال بالخادم');
  }
}

// ── Helpers ──
export const GET  = <T>(url: string, opts?: RequestOptions) =>
  apiFetch<T>(url, { method: 'GET',    ...opts });

export const POST = <T>(url: string, data?: unknown, opts?: RequestOptions) =>
  apiFetch<T>(url, { method: 'POST',   body: JSON.stringify(data), ...opts });

export const PATCH = <T>(url: string, data?: unknown, opts?: RequestOptions) =>
  apiFetch<T>(url, { method: 'PATCH',  body: JSON.stringify(data), ...opts });

export const DELETE = <T>(url: string, opts?: RequestOptions) =>
  apiFetch<T>(url, { method: 'DELETE', ...opts });
