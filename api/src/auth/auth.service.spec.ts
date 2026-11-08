import { ServiceUnavailableException } from '@nestjs/common';
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
});
