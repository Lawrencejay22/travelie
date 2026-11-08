import { Prisma } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;