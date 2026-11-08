import { Platform } from 'react-native';
import type {
  Category,
  Destination,
  Paginated,
  Session,
  User,
} from '../types';

const fallbackBase = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';

export const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? fallbackBase).replace(/\/+$/, '');
const API_ORIGIN = API_BASE.replace(/\/api$/, '');

export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path}`;
}

let getSession: () => Session | null = () => null;
let persistSession: (session: Session | null) => Promise<void> | void = () => {};

export function configureSessionBridge(
  read: () => Session | null,
  write: (session: Session | null) => Promise<void> | void,
) {
  getSession = read;
  persistSession = write;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshSession(): Promise<Session | null> {
  const token = getSession()?.refreshToken;
  if (!token) return null;

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  });

  if (!response.ok) {
    await persistSession(null);
    return null;
  }

  const session = (await response.json()) as Session;
  await persistSession(session);
  return session;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers: rawHeaders, ...rest } = options;

  const send = async (): Promise<Response> => {
    const headers = new Headers(rawHeaders);
    const isForm = body instanceof FormData;
    if (body !== undefined && !isForm && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (auth) {
      const token = getSession()?.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  };

  let response = await send();
  if (response.status === 401 && auth) {
    const refreshed = await refreshSession();
    if (refreshed) response = await send();
  }

  if (!response.ok) {
    const details = await response.json().catch(() => undefined);
    const message =
      (details as { message?: string | string[] } | undefined)?.message ?? 'Something went wrong';
    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status, details);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  register: (payload: { email: string; displayName: string; password: string }) =>
    apiRequest<Session>('/auth/register', { method: 'POST', body: payload, auth: false }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<Session>('/auth/login', { method: 'POST', body: payload, auth: false }),

  logout: (refreshToken: string) =>
    apiRequest<{ message: string }>('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string; devResetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      auth: false,
    }),

  updateProfile: (payload: { displayName?: string }) =>
    apiRequest<User>('/users/me', { method: 'PATCH', body: payload }),

  uploadAvatar: (file: { uri: string; name: string; type: string }) => {
    const form = new FormData();
    form.append('file', file as unknown as Blob);
    return apiRequest<User>('/users/me/avatar', { method: 'POST', body: form });
  },

  destinations: (params: Record<string, string | number | boolean | undefined> = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value));
    });
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return apiRequest<Paginated<Destination>>(`/destinations${suffix}`);
  },

  destination: (slug: string) => apiRequest<Destination>(`/destinations/${slug}`),

  categories: () => apiRequest<Category[]>('/categories'),

  favorites: () => apiRequest<Destination[]>('/favorites'),

  addFavorite: (destinationId: string) =>
    apiRequest<{ destinationId: string; favorited: boolean }>(`/favorites/${destinationId}`, { method: 'POST' }),

  removeFavorite: (destinationId: string) =>
    apiRequest<{ destinationId: string; favorited: boolean }>(`/favorites/${destinationId}`, { method: 'DELETE' }),
};