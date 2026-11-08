import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { publicUserSelect } from '../users/users.types.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [users, publishedDestinations, cities, categories, favorites, recentUsers, topDestinations] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.destination.count({ where: { isPublished: true } }),
        this.prisma.city.count(),
        this.prisma.category.count(),
        this.prisma.favorite.count(),
        this.prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: publicUserSelect,
        }),
        this.prisma.destination.findMany({
          orderBy: { favorites: { _count: 'desc' } },
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            isPublished: true,
            city: { select: { name: true } },
            _count: { select: { favorites: true } },
          },
        }),
      ]);

    return {
      counts: { users, publishedDestinations, cities, categories, favorites },
      recentUsers,
      topDestinations,
    };
  }

  async users(page = 1, limit = 20) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          ...publicUserSelect,
          _count: { select: { favorites: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}