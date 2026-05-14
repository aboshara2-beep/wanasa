import { apiFetch } from './interceptors';

export const SponsorshipAPI = {
  getState: () => apiFetch('/sponsored/state', { auth: false } as any)
    .catch(() => null),
};
