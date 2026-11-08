import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForDestination(destinationId: string) {
    const destination = await this.prisma.destination.findFirst({
      where: { id: destinationId, isPublished: true },
      select: { id: true },
    });
    if (!destination) throw new NotFoundException('Destination not found');

    const [reviews, aggregate, ratings] = await Promise.all([
      this.prisma.review.findMany({
        where: { destinationId, status: ReviewStatus.APPROVED },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      }),
      this.prisma.review.aggregate({
        where: { destinationId, status: ReviewStatus.APPROVED },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { destinationId, status: ReviewStatus.APPROVED },
        _count: { _all: true },
      }),
    ]);

    return {
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count._all,
      ratingCounts: Object.fromEntries(
        [1, 2, 3, 4, 5].map((rating) => [
          rating,
          ratings.find((item) => item.rating === rating)?._count._all ?? 0,
        ]),
      ),
      reviews,
    };
  }

  async mine(userId: string, destinationId: string) {
    return this.prisma.review.findUnique({
      where: { userId_destinationId: { userId, destinationId } },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async submit(userId: string, dto: CreateReviewDto) {
    const destination = await this.prisma.destination.findFirst({
      where: { id: dto.destinationId, isPublished: true },
      select: { id: true },
    });
    if (!destination) throw new NotFoundException('Destination not found');

    return this.prisma.review.upsert({
      where: {
        userId_destinationId: { userId, destinationId: dto.destinationId },
      },
      create: {
        userId,
        destinationId: dto.destinationId,
        rating: dto.rating,
        title: dto.title?.trim() || null,
        content: dto.content.trim(),
      },
      update: {
        rating: dto.rating,
        title: dto.title?.trim() || null,
        content: dto.content.trim(),
        status: ReviewStatus.PENDING,
      },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new ForbiddenException('You can only remove your own review');
    await this.prisma.review.delete({ where: { id: reviewId } });
    return { id: reviewId, deleted: true };
  }

  async report(userId: string, reviewId: string, reason: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, status: ReviewStatus.APPROVED },
      select: { id: true, userId: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId === userId)
      throw new ConflictException('You cannot report your own review');

    return this.prisma.reviewReport.upsert({
      where: { reviewId_userId: { reviewId, userId } },
      create: { reviewId, userId, reason: reason.trim() },
      update: { reason: reason.trim() },
      select: { id: true, reviewId: true, reason: true, createdAt: true },
    });
  }

  pending() {
    return this.prisma.review.findMany({
      where: { status: ReviewStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
        user: { select: { id: true, displayName: true, email: true } },
        destination: { select: { id: true, name: true, slug: true } },
        _count: { select: { reports: true } },
      },
    });
  }

  async moderate(reviewId: string, status: 'APPROVED' | 'REJECTED') {
    if (status !== ReviewStatus.APPROVED && status !== ReviewStatus.REJECTED) {
      throw new ConflictException('Invalid moderation status');
    }
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
  }
}
