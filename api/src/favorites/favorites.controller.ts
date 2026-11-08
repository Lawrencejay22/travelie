import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { FavoritesService } from './favorites.service.js';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.list(user.sub);
  }

  @Post(':destinationId')
  add(@CurrentUser() user: JwtPayload, @Param('destinationId') destinationId: string) {
    return this.favoritesService.add(user.sub, destinationId);
  }

  @Delete(':destinationId')
  remove(@CurrentUser() user: JwtPayload, @Param('destinationId') destinationId: string) {
    return this.favoritesService.remove(user.sub, destinationId);
  }
}