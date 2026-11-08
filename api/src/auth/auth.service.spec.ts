import {
  ConflictException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const findUser = vi.fn();
  const prisma = {
    user: { findUnique: findUser },
  } as unknown as PrismaService;
  const service = new AuthService(
    prisma,
    {} as JwtService,
    {} as ConfigService,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails closed until a trusted password reset email provider is configured', async () => {
    await expect(service.forgotPassword()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(findUser).not.toHaveBeenCalled();
  });

  it('limits login lookup to columns available before the additive migration', async () => {
    findUser.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'admin@travelie.app',
        password: 'invalid-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(findUser).toHaveBeenCalledWith({
      where: { email: 'admin@travelie.app' },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        passwordHash: true,
      },
    });
  });

  it('checks registration conflicts without selecting columns added by the migration', async () => {
    findUser.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({
        email: 'admin@travelie.app',
        password: 'unused-password',
        displayName: 'Admin',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(findUser).toHaveBeenCalledWith({
      where: { email: 'admin@travelie.app' },
      select: { id: true },
    });
  });
});
