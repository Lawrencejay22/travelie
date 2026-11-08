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

export interface NearbyDestination extends Destination {
  distanceMeters: number;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
  user?: { id: string; displayName: string; avatarUrl: string | null };
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  ratingCounts: Record<number, number>;
  reviews: Review[];
}

export interface TripStop {
  id: string;
  day: number;
  sortOrder: number;
  notes: string | null;
  destination: Omit<
    Pick<
      Destination,
      'id' | 'name' | 'slug' | 'latitude' | 'longitude' | 'city' | 'photos'
    >,
    'city' | 'photos'
  > & {
    city: { name: string };
    photos: Photo[];
  };
}

export interface TripExpense {
  id: string;
  title: string;
  category: string;
  amount: string | number;
  currency: string;
  incurredAt: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  stops: TripStop[];
  expenses: TripExpense[];
  expensesByCurrency?: Record<string, number>;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface NavigationRoute {
  encodedPolyline: string;
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStep[];
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
