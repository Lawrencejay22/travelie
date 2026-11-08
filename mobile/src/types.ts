export type Role = 'TRAVELER' | 'CONTENT_MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface Photo {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  destinationCount?: number;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string | null;
  openingHours: string | null;
  entranceFee: string | number | null;
  currency: string;
  isFeatured: boolean;
  isPublished: boolean;
  city: {
    id?: string;
    name: string;
    slug: string;
    country?: { name: string; code: string };
  };
  categories: Category[];
  photos: Photo[];
  _count?: { favorites: number };
  favoritedAt?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}