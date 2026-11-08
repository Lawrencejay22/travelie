import { randomBytes, createHash } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service.js';
import { publicUserSelect, type PublicUser } from '../users/users.types.js';
import type { JwtPayload, Session } from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');
const createOpaqueToken = () => randomBytes(48).toString('base64url');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, userAgent?: string): Promise<Session> {
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: dto.displayName.trim(),
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
      },
      select: publicUserSelect,
    });

    return this.createSession(user, userAgent);
  }

  async login(dto: LoginDto, userAgent?: string): Promise<Session> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    const valid = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash: _passwordHash, ...rest } = user;
    const publicUser = this.toPublicUser(rest);
    return this.createSession(publicUser, userAgent);
  }

  async googleLogin(idToken: string, userAgent?: string): Promise<Session> {
    const clientIds = this.config.get<string[]>('googleOAuthClientIds') ?? [];
    if (!clientIds.length) {
      throw new ServiceUnavailableException(
        'Google sign-in is not configured on this server',
      );
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await new OAuth2Client().verifyIdToken({
        idToken,
        audience: clientIds,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException(
        'Google sign-in token could not be verified',
      );
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException(
        'Google account must have a verified email address',
      );
    }

    const linkedUser = await this.prisma.user.findUnique({
      where: { googleId: payload.sub },
      select: publicUserSelect,
    });
    if (linkedUser) return this.createSession(linkedUser, userAgent);

    const email = payload.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { ...publicUserSelect, googleId: true },
    });
    if (existing?.googleId && existing.googleId !== payload.sub) {
      throw new ConflictException(
        'This email is linked to a different Google account',
      );
    }

    const user = existing
      ? await this.prisma.user.update({
          where: { id: existing.id },
          data: { googleId: payload.sub },
          select: publicUserSelect,
        })
      : await this.prisma.user.create({
          data: {
            email,
            googleId: payload.sub,
            displayName: payload.name?.trim() || email.split('@')[0],
            avatarUrl: payload.picture,
            passwordHash: await bcrypt.hash(createOpaqueToken(), BCRYPT_ROUNDS),
          },
          select: publicUserSelect,
        });

    return this.createSession(user, userAgent);
  }

  async refresh(refreshToken: string, userAgent?: string): Promise<Session> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: { select: publicUserSelect } },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (stored.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token has already been used');
    }
    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    return this.createSession(stored.user, userAgent);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Signed out' };
  }

  async forgotPassword(): Promise<never> {
    throw new ServiceUnavailableException(
      'Password reset is unavailable because email delivery is not configured',
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(dto.token) },
    });
    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Reset link is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password has been reset. You can sign in now.' };
  }

  private async createSession(
    user: PublicUser,
    userAgent?: string,
  ): Promise<Session> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = createOpaqueToken();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        userAgent: userAgent?.slice(0, 255),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.config.getOrThrow<string>('jwtAccessTtl'),
    };
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    role: PublicUser['role'];
    createdAt: Date;
  }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
