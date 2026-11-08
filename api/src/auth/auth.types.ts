import { Role } from '@prisma/client';
import type { PublicUser } from '../users/users.types.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface Session {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}