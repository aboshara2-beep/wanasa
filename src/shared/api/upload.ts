import { API_CONFIG } from './config';
import { useAuthStore } from '../../features/auth/store';

export async function uploadVideo(params: {
  videoUri:  string;
  title:     string;
  description?: string;
  duration?: number;
}): Promise<{ id: string; message: string }> {
  const token = useAuthStore.getState().token;

  // في Termux: نرسل الـ URI مباشرة كـ URL محلي
  const body = JSON.stringify({
    title:       params.title,
    description: params.description ?? '',
    videoUrl:    params.videoUri,
    duration:    params.duration ?? 30,
  });

  const res = await fetch(`${API_CONFIG.BASE_URL}/videos`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'فشل الرفع');
  return data.data;
}
