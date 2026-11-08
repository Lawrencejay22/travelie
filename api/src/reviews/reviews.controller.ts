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
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ModerateReviewDto } from './dto/moderate-review.dto.js';
import { ReportReviewDto } from './dto/report-review.dto.js';
import { ReviewsService } from './reviews.service.js';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('destination/:destinationId')
  list(@Param('destinationId') destinationId: string) {
    return this.reviewsService.listForDestination(destinationId);
  }

  @Get('mine/:destinationId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  mine(
    @CurrentUser() user: JwtPayload,
    @Param('destinationId') destinationId: string,
  ) {
    return this.reviewsService.mine(user.sub, destinationId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  submit(@CurrentUser() user: JwtPayload, @Body() dto: CreateReviewDto) {
    return this.reviewsService.submit(user.sub, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.reviewsService.remove(user.sub, id);
  }

  @Post(':id/report')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  report(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviewsService.report(user.sub, id, dto.reason);
  }

  @Get('moderation/pending')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  pending() {
    return this.reviewsService.pending();
  }

  @Patch(':id/moderation')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderate(id, dto.status);
  }
}
