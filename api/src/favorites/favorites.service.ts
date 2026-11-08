import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        destination: {
          include: {
            city: { select: { name: true, slug: true } },
            photos: { orderBy: { sortOrder: 'asc' }, take: 1 },
            categories: { select: { name: true, slug: true } },
            _count: { select: { favorites: true } },
          },
        },
      },
    });
    return favorites.map((favorite) => ({
      ...favorite.destination,
      favoritedAt: favorite.createdAt,
    }));
  }

  async add(userId: string, destinationId: string) {
    const destination = await this.prisma.destination.findFirst({
      where: { id: destinationId, isPublished: true },
      select: { id: true },
    });
    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    await this.prisma.favorite.upsert({
      where: { userId_destinationId: { userId, destinationId } },
      create: { userId, destinationId },
      update: {},
    });
    return { destinationId, favorited: true };
  }

  async remove(userId: string, destinationId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, destinationId } });
    return { destinationId, favorited: false };
  }
}