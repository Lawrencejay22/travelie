import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTripDto } from './dto/create-trip.dto.js';
import { UpdateTripDto } from './dto/update-trip.dto.js';
import { CreateTripStopDto } from './dto/create-trip-stop.dto.js';
import { CreateTripExpenseDto } from './dto/create-trip-expense.dto.js';

const tripInclude = {
  stops: {
    orderBy: [{ day: 'asc' as const }, { sortOrder: 'asc' as const }],
    include: {
      destination: {
        select: {
          id: true,
          slug: true,
          name: true,
          latitude: true,
          longitude: true,
          city: { select: { name: true } },
          photos: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
        },
      },
    },
  },
  expenses: { orderBy: { incurredAt: 'desc' as const } },
};

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.trip.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: tripInclude,
    });
  }

  async get(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: tripInclude,
    });
    if (!trip) throw new NotFoundException('Trip not found');
    const expensesByCurrency = trip.expenses.reduce<Record<string, number>>(
      (totals, expense) => {
        totals[expense.currency] =
          (totals[expense.currency] ?? 0) + Number(expense.amount);
        return totals;
      },
      {},
    );
    return { ...trip, expensesByCurrency };
  }

  async create(userId: string, dto: CreateTripDto) {
    this.validateDates(dto.startDate, dto.endDate);
    return this.prisma.trip.create({
      data: {
        userId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      include: tripInclude,
    });
  }

  async update(userId: string, tripId: string, dto: UpdateTripDto) {
    const trip = await this.requireTrip(userId, tripId);
    const startDate =
      dto.startDate === undefined
        ? trip.startDate
        : dto.startDate
          ? new Date(dto.startDate)
          : null;
    const endDate =
      dto.endDate === undefined
        ? trip.endDate
        : dto.endDate
          ? new Date(dto.endDate)
          : null;
    this.validateDates(startDate?.toISOString(), endDate?.toISOString());
    return this.prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim() || null,
        }),
        ...(dto.startDate !== undefined && { startDate }),
        ...(dto.endDate !== undefined && { endDate }),
      },
      include: tripInclude,
    });
  }

  async remove(userId: string, tripId: string) {
    await this.requireTrip(userId, tripId);
    await this.prisma.trip.delete({ where: { id: tripId } });
    return { id: tripId, deleted: true };
  }

  async addStop(userId: string, tripId: string, dto: CreateTripStopDto) {
    await this.requireTrip(userId, tripId);
    const destination = await this.prisma.destination.findFirst({
      where: { id: dto.destinationId, isPublished: true },
      select: { id: true },
    });
    if (!destination) throw new NotFoundException('Destination not found');

    const lastStop = await this.prisma.tripStop.findFirst({
      where: { tripId, day: dto.day },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const stop = await this.prisma.tripStop.create({
      data: {
        tripId,
        destinationId: dto.destinationId,
        day: dto.day,
        sortOrder: (lastStop?.sortOrder ?? -1) + 1,
        notes: dto.notes?.trim() || null,
      },
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            slug: true,
            latitude: true,
            longitude: true,
            city: { select: { name: true } },
            photos: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        },
      },
    });
    await this.prisma.trip.update({
      where: { id: tripId },
      data: { updatedAt: new Date() },
    });
    return stop;
  }

  async removeStop(userId: string, tripId: string, stopId: string) {
    await this.requireTrip(userId, tripId);
    const deleted = await this.prisma.tripStop.deleteMany({
      where: { id: stopId, tripId },
    });
    if (!deleted.count) throw new NotFoundException('Trip stop not found');
    await this.prisma.trip.update({
      where: { id: tripId },
      data: { updatedAt: new Date() },
    });
    return { id: stopId, deleted: true };
  }

  async addExpense(userId: string, tripId: string, dto: CreateTripExpenseDto) {
    await this.requireTrip(userId, tripId);
    const expense = await this.prisma.tripExpense.create({
      data: {
        tripId,
        title: dto.title.trim(),
        category: dto.category.trim(),
        amount: dto.amount,
        currency: dto.currency,
        incurredAt: dto.incurredAt ? new Date(dto.incurredAt) : undefined,
      },
    });
    await this.prisma.trip.update({
      where: { id: tripId },
      data: { updatedAt: new Date() },
    });
    return expense;
  }

  async removeExpense(userId: string, tripId: string, expenseId: string) {
    await this.requireTrip(userId, tripId);
    const deleted = await this.prisma.tripExpense.deleteMany({
      where: { id: expenseId, tripId },
    });
    if (!deleted.count) throw new NotFoundException('Trip expense not found');
    await this.prisma.trip.update({
      where: { id: tripId },
      data: { updatedAt: new Date() },
    });
    return { id: expenseId, deleted: true };
  }

  private async requireTrip(userId: string, tripId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  private validateDates(start?: string, end?: string) {
    if (start && end && new Date(start) > new Date(end)) {
      throw new BadRequestException(
        'Trip end date must be on or after the start date',
      );
    }
  }
}
