import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryNearbyDto } from './dto/query-nearby.dto.js';
import { QueryDestinationsDto } from './dto/query-destinations.dto.js';

const destinationInclude = {
  city: {
    select: {
      id: true,
      name: true,
      slug: true,
      country: { select: { name: true, code: true } },
    },
  },
  categories: { select: { id: true, name: true, slug: true } },
  photos: { orderBy: { sortOrder: 'asc' as const } },
  _count: { select: { favorites: true } },
} satisfies Prisma.DestinationInclude;

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryDestinationsDto) {
    const where: Prisma.DestinationWhereInput = { isPublished: true };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
        { city: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.category) {
      where.categories = { some: { slug: query.category } };
    }
    if (query.city) {
      where.city = { slug: query.city };
    }
    if (query.featured !== undefined) {
      where.isFeatured = query.featured;
    }

    const orderBy: Prisma.DestinationOrderByWithRelationInput =
      query.sort === 'newest'
        ? { createdAt: 'desc' }
        : query.sort === 'name'
          ? { name: 'asc' }
          : { favorites: { _count: 'desc' } };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.destination.findMany({
        where,
        include: destinationInclude,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.destination.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findNearby(query: QueryNearbyDto) {
    const radiusMeters = query.radiusKm * 1000;
    const nearby = await this.prisma.$queryRaw<
      Array<{ id: string; distanceMeters: number }>
    >`
      SELECT "id", ST_Distance(
        "location",
        ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography
      ) AS "distanceMeters"
      FROM "Destination"
      WHERE "isPublished" = true
        AND "location" IS NOT NULL
        AND ST_DWithin(
          "location",
          ST_SetSRID(ST_MakePoint(${query.longitude}, ${query.latitude}), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY "distanceMeters" ASC
      LIMIT 50
    `;
    if (!nearby.length) return [];

    const destinations = await this.prisma.destination.findMany({
      where: { id: { in: nearby.map((place) => place.id) } },
      include: destinationInclude,
    });
    const byId = new Map(
      destinations.map((destination) => [destination.id, destination]),
    );
    return nearby.flatMap(({ id, distanceMeters }) => {
      const destination = byId.get(id);
      return destination ? [{ ...destination, distanceMeters }] : [];
    });
  }

  async findBySlug(slug: string) {
    const destination = await this.prisma.destination.findUnique({
      where: { slug },
      include: destinationInclude,
    });
    if (!destination || !destination.isPublished) {
      throw new NotFoundException('Destination not found');
    }
    return destination;
  }

  async listCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { destinations: { where: { isPublished: true } } } },
      },
    });
    return categories.map(({ _count, ...category }) => ({
      ...category,
      destinationCount: _count.destinations,
    }));
  }

  async listCities() {
    const cities = await this.prisma.city.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        country: { select: { name: true, code: true } },
        _count: { select: { destinations: { where: { isPublished: true } } } },
      },
    });
    return cities.map(({ _count, ...city }) => ({
      ...city,
      destinationCount: _count.destinations,
    }));
  }
}
