import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { TripsService } from './trips.service.js';

describe('TripsService', () => {
  const findTrip = vi.fn();
  const prisma = {
    trip: { findFirst: findTrip },
  } as unknown as PrismaService;
  const service = new TripsService(prisma);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not return a trip owned by another user', async () => {
    findTrip.mockResolvedValue(null);

    await expect(service.get('user-1', 'trip-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(findTrip).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'trip-1', userId: 'user-1' } }),
    );
  });
});
