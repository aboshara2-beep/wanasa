// ═══════════════════════════════════════════════
// 🌐 Wanasa API Service — جاهز للـ Backend
// ═══════════════════════════════════════════════

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

// ── HTTP Client ──
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }

  return res.json();
}

// ── Feed API ──
export const FeedAPI = {
  // GET /feed?page=1&limit=10
  // Backend يطبق Hybrid Feed Engine تلقائياً
  getFeed: (page: number, token: string) =>
    request<{ data: any[]; hasMore: boolean }>(
      `/feed?page=${page}&limit=10`,
      { method: 'GET' },
      token,
    ),
};

// ── Videos API ──
export const VideosAPI = {
  // POST /videos/:id/like
  like: (id: string, token: string) =>
    request(`/videos/${id}/like`, { method: 'POST' }, token),

  // POST /videos/:id/vote
  vote: (id: string, token: string) =>
    request(`/videos/${id}/vote`, { method: 'POST' }, token),

  // POST /videos/:id/save
  save: (id: string, token: string) =>
    request(`/videos/${id}/save`, { method: 'POST' }, token),

  // POST /videos/:id/view
  view: (id: string, token: string) =>
    request(`/videos/${id}/view`, { method: 'POST' }, token),

  // POST /videos/upload — multipart
  upload: (formData: FormData, token: string) =>
    request('/videos/upload', {
      method:  'POST',
      body:    formData,
      headers: { Authorization: `Bearer ${token}` } as any,
    }, token),
};

// ── Challenges API ──
export const ChallengesAPI = {
  // GET /challenges/active
  getActive: (token: string) =>
    request<{ data: any }>('/challenges/active', { method: 'GET' }, token),

  // GET /challenges/ideas?tab=all|friends|top
  getIdeas: (tab: string, token: string) =>
    request<{ data: any[] }>(`/challenges/ideas?tab=${tab}`, { method: 'GET' }, token),

  // POST /challenges/ideas
  submitIdea: (body: { title: string; description?: string }, token: string) =>
    request('/challenges/ideas', { method: 'POST', body: JSON.stringify(body) }, token),

  // POST /challenges/ideas/:id/vote
  voteIdea: (id: string, token: string) =>
    request(`/challenges/ideas/${id}/vote`, { method: 'POST' }, token),
};

// ── Leaderboard API ──
export const LeaderboardAPI = {
  // GET /leaderboard?period=weekly
  get: (token: string) =>
    request<{ data: any[] }>('/leaderboard?period=weekly', { method: 'GET' }, token),
};

// ── Notifications API ──
export const NotificationsAPI = {
  // GET /notifications
  get: (token: string) =>
    request<{ data: any[] }>('/notifications', { method: 'GET' }, token),

  // PATCH /notifications/:id/read
  markRead: (id: string, token: string) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }, token),
};

// ── Auth API ──
export const AuthAPI = {
  // POST /auth/facebook
  facebook: (accessToken: string) =>
    request<{ token: string; user: any }>('/auth/facebook', {
      method: 'POST',
      body:   JSON.stringify({ accessToken }),
    }),
};
