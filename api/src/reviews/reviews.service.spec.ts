import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReviewsService } from './reviews.service.js';

describe('ReviewsService', () => {
  const findDestination = vi.fn();
  const upsertReview = vi.fn();
  const findReview = vi.fn();
  const upsertReport = vi.fn();
  const prisma = {
    destination: { findFirst: findDestination },
    review: { upsert: upsertReview, findFirst: findReview },
    reviewReport: { upsert: upsertReport },
  } as unknown as PrismaService;
  const service = new ReviewsService(prisma);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not accept reviews for unpublished or missing destinations', async () => {
    findDestination.mockResolvedValue(null);

    await expect(
      service.submit('user-1', {
        destinationId: 'place-1',
        rating: 5,
        content: 'A wonderful place to visit.',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(upsertReview).not.toHaveBeenCalled();
  });

  it('prevents users from reporting their own review', async () => {
    findReview.mockResolvedValue({
      id: 'review-1',
      userId: 'user-1',
    } as never);

    await expect(
      service.report('user-1', 'review-1', 'This review is not appropriate'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(upsertReport).not.toHaveBeenCalled();
  });
});
