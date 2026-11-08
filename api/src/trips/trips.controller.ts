import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateTripDto } from './dto/create-trip.dto.js';
import { CreateTripExpenseDto } from './dto/create-trip-expense.dto.js';
import { CreateTripStopDto } from './dto/create-trip-stop.dto.js';
import { UpdateTripDto } from './dto/update-trip.dto.js';
import { TripsService } from './trips.service.js';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.tripsService.list(user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTripDto) {
    return this.tripsService.create(user.sub, dto);
  }

  @Get(':tripId')
  get(@CurrentUser() user: JwtPayload, @Param('tripId') tripId: string) {
    return this.tripsService.get(user.sub, tripId);
  }

  @Patch(':tripId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('tripId') tripId: string,
    @Body() dto: UpdateTripDto,
  ) {
    return this.tripsService.update(user.sub, tripId, dto);
  }

  @Delete(':tripId')
  remove(@CurrentUser() user: JwtPayload, @Param('tripId') tripId: string) {
    return this.tripsService.remove(user.sub, tripId);
  }

  @Post(':tripId/stops')
  addStop(
    @CurrentUser() user: JwtPayload,
    @Param('tripId') tripId: string,
    @Body() dto: CreateTripStopDto,
  ) {
    return this.tripsService.addStop(user.sub, tripId, dto);
  }

  @Delete(':tripId/stops/:stopId')
  removeStop(
    @CurrentUser() user: JwtPayload,
    @Param('tripId') tripId: string,
    @Param('stopId') stopId: string,
  ) {
    return this.tripsService.removeStop(user.sub, tripId, stopId);
  }

  @Post(':tripId/expenses')
  addExpense(
    @CurrentUser() user: JwtPayload,
    @Param('tripId') tripId: string,
    @Body() dto: CreateTripExpenseDto,
  ) {
    return this.tripsService.addExpense(user.sub, tripId, dto);
  }

  @Delete(':tripId/expenses/:expenseId')
  removeExpense(
    @CurrentUser() user: JwtPayload,
    @Param('tripId') tripId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.tripsService.removeExpense(user.sub, tripId, expenseId);
  }
}
