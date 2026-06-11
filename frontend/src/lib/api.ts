import { browser } from '$app/environment';

export const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787';

export type EventItem = {
  id: string;
  timestamp: string;
  type: string;
  status: 'resolved' | 'unresolved' | 'pending';
  room: string | null;
  guest: string | null;
  description: string;
  source: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priorityOverride: 'critical' | 'high' | 'medium' | 'low' | null;
  prioritySource: 'computed' | 'manual';
  priorityReason: string;
};

export type User = { id: string; email: string; name: string; createdAt: string };

export type EventThread = {
  id: string;
  eventId: string;
  message: string;
  imageUrl: string | null;
  imageKey: string | null;
  statusAfter: EventItem['status'] | null;
  priorityAfter: EventItem['priority'] | null;
  createdByUserId: string | null;
  createdAt: string;
  authorName: string | null;
  authorEmail: string | null;
};

export function getToken() {
  return browser ? localStorage.getItem('token') : null;
}

export function setToken(token: string) {
  if (browser) localStorage.setItem('token', token);
}

export function clearToken() {
  if (browser) localStorage.removeItem('token');
}

export async function api(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const auth = getToken();
  if (auth) headers.set('Authorization', `Bearer ${auth}`);
  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) clearToken();
  if (!response.ok) throw new Error(data.error ?? `Request failed: ${response.status}`);
  return data;
}

export async function currentUser(): Promise<User | null> {
  if (!getToken()) return null;
  try {
    const data = await api('/auth/me');
    return data.user;
  } catch {
    clearToken();
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new Error('Authentication required');
  return user;
}

export function priorityOrder(priority: EventItem['priority']) {
  return ({ critical: 0, high: 1, medium: 2, low: 3 } as const)[priority];
}


export async function apiForm(path: string, form: FormData) {
  const headers = new Headers();
  const auth = getToken();
  if (auth) headers.set('Authorization', `Bearer ${auth}`);
  const response = await fetch(`${apiBase}${path}`, { method: 'POST', headers, body: form });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) clearToken();
  if (!response.ok) throw new Error(data.error ?? `Request failed: ${response.status}`);
  return data;
}
