export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: "TRAVELER" | "CONTENT_MANAGER" | "ADMIN";
  createdAt: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  summary: string;
  latitude: number;
  longitude: number;
  entranceFee: string | number | null;
  currency: string;
  isFeatured: boolean;
  isPublished: boolean;
  categories: Category[];
  photos: { id: string; url: string; alt: string | null }[];
  city: { name: string; slug: string };
  _count?: { favorites: number };
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Stats {
  counts: {
    users: number;
    publishedDestinations: number;
    cities: number;
    categories: number;
    favorites: number;
  };
  recentUsers: User[];
  topDestinations: {
    id: string;
    name: string;
    slug: string;
    isPublished: boolean;
    city: { name: string };
    _count: { favorites: number };
  }[];
}

export interface PendingReview {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  createdAt: string;
  user: { id: string; displayName: string; email: string };
  destination: { id: string; name: string; slug: string };
  _count: { reports: number };
}

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");
export const API_ORIGIN = API_URL.replace(/\/api$/, "");
const STORAGE_KEY = "travelie.admin.session";

export const assetUrl = (path?: string | null) =>
  !path ? undefined : /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path}`;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

let session: Session | null = readSession();

export const getSession = () => session;

export function setSession(next: Session | null) {
  session = next;
  if (next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } else {
    localStorage.removeItem(STORAGE_KEY);
    if (window.location.pathname.startsWith("/dashboard")) {
      window.location.assign("/login");
    }
  }
}

async function refreshSession(): Promise<Session | null> {
  if (!session?.refreshToken) return null;
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  if (!response.ok) {
    setSession(null);
    return null;
  }
  const next = (await response.json()) as Session;
  setSession(next);
  return next;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers: rawHeaders, ...rest } = options;

  const send = async () => {
    const headers = new Headers(rawHeaders);
    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (auth && session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let response = await send();
  if (response.status === 401 && auth) {
    const refreshed = await refreshSession();
    if (refreshed) response = await send();
  }

  if (!response.ok) {
    const details = await response.json().catch(() => undefined);
    const value = (details as { message?: string | string[] } | undefined)
      ?.message;
    throw new ApiError(
      Array.isArray(value) ? value.join(", ") : (value ?? "Request failed"),
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<Session>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),

  logout: (refreshToken: string) =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    }),

  stats: () => request<Stats>("/admin/stats"),

  destinations: (params: Record<string, string | number | undefined> = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") search.set(key, String(value));
    });
    return request<Paginated<Destination>>(
      `/destinations?${search.toString()}`,
    );
  },

  users: (page = 1, limit = 50) =>
    request<Paginated<User & { _count: { favorites: number } }>>(
      `/admin/users?page=${page}&limit=${limit}`,
    ),

  pendingReviews: () => request<PendingReview[]>("/reviews/moderation/pending"),

  moderateReview: (reviewId: string, status: "APPROVED" | "REJECTED") =>
    request<{ id: string; status: string; updatedAt: string }>(
      `/reviews/${reviewId}/moderation`,
      { method: "PATCH", body: { status } },
    ),
};
