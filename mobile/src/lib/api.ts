import { Platform } from 'react-native';
import type {
  Category,
  Destination,
  Paginated,
  NearbyDestination,
  NavigationRoute,
  Review,
  ReviewSummary,
  Session,
  Trip,
  TripExpense,
  TripStop,
  User,
} from '../types';

const fallbackBase =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000/api'
    : 'http://localhost:4000/api';

export const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL ?? fallbackBase
).replace(/\/+$/, '');
const API_ORIGIN = API_BASE.replace(/\/api$/, '');

export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path}`;
}

let getSession: () => Session | null = () => null;
let persistSession: (
  session: Session | null,
) => Promise<void> | void = () => {};

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

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
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
      body:
        body === undefined
          ? undefined
          : isForm
            ? (body as FormData)
            : JSON.stringify(body),
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
      (details as { message?: string | string[] } | undefined)?.message ??
      'Something went wrong';
    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : message,
      response.status,
      details,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  register: (payload: {
    email: string;
    displayName: string;
    password: string;
  }) =>
    apiRequest<Session>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<Session>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  googleLogin: (idToken: string) =>
    apiRequest<Session>('/auth/google', {
      method: 'POST',
      body: { idToken },
      auth: false,
    }),

  logout: (refreshToken: string) =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/forgot-password', {
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

  destinations: (
    params: Record<string, string | number | boolean | undefined> = {},
  ) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value));
    });
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return apiRequest<Paginated<Destination>>(`/destinations${suffix}`);
  },

  destination: (slug: string) =>
    apiRequest<Destination>(`/destinations/${slug}`),

  categories: () => apiRequest<Category[]>('/categories'),

  favorites: () => apiRequest<Destination[]>('/favorites'),

  addFavorite: (destinationId: string) =>
    apiRequest<{ destinationId: string; favorited: boolean }>(
      `/favorites/${destinationId}`,
      { method: 'POST' },
    ),

  removeFavorite: (destinationId: string) =>
    apiRequest<{ destinationId: string; favorited: boolean }>(
      `/favorites/${destinationId}`,
      { method: 'DELETE' },
    ),

  nearby: (latitude: number, longitude: number, radiusKm = 10) =>
    apiRequest<NearbyDestination[]>(
      `/destinations/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=${radiusKm}`,
      { auth: false },
    ),

  reviews: (destinationId: string) =>
    apiRequest<ReviewSummary>(`/reviews/destination/${destinationId}`, {
      auth: false,
    }),

  myReview: (destinationId: string) =>
    apiRequest<Review | null>(`/reviews/mine/${destinationId}`),

  submitReview: (payload: {
    destinationId: string;
    rating: number;
    title?: string;
    content: string;
  }) => apiRequest<Review>('/reviews', { method: 'POST', body: payload }),

  deleteReview: (reviewId: string) =>
    apiRequest<{ id: string; deleted: boolean }>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),

  reportReview: (reviewId: string, reason: string) =>
    apiRequest<{ id: string; reviewId: string; reason: string }>(
      `/reviews/${reviewId}/report`,
      {
        method: 'POST',
        body: { reason },
      },
    ),

  trips: () => apiRequest<Trip[]>('/trips'),

  createTrip: (payload: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }) => apiRequest<Trip>('/trips', { method: 'POST', body: payload }),

  trip: (tripId: string) => apiRequest<Trip>(`/trips/${tripId}`),

  deleteTrip: (tripId: string) =>
    apiRequest<{ id: string; deleted: boolean }>(`/trips/${tripId}`, {
      method: 'DELETE',
    }),

  addTripStop: (
    tripId: string,
    payload: { destinationId: string; day?: number; notes?: string },
  ) =>
    apiRequest<TripStop>(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: payload,
    }),

  removeTripStop: (tripId: string, stopId: string) =>
    apiRequest<{ id: string; deleted: boolean }>(
      `/trips/${tripId}/stops/${stopId}`,
      {
        method: 'DELETE',
      },
    ),

  addTripExpense: (
    tripId: string,
    payload: {
      title: string;
      category: string;
      amount: number;
      currency?: string;
    },
  ) =>
    apiRequest<TripExpense>(`/trips/${tripId}/expenses`, {
      method: 'POST',
      body: payload,
    }),

  removeTripExpense: (tripId: string, expenseId: string) =>
    apiRequest<{ id: string; deleted: boolean }>(
      `/trips/${tripId}/expenses/${expenseId}`,
      {
        method: 'DELETE',
      },
    ),

  computeRoute: (payload: {
    originLatitude: number;
    originLongitude: number;
    destinationLatitude: number;
    destinationLongitude: number;
    travelMode: 'WALK' | 'DRIVE';
  }) =>
    apiRequest<NavigationRoute>('/navigation/route', {
      method: 'POST',
      body: payload,
    }),
};
