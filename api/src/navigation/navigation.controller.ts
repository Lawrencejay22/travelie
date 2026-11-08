import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ComputeRouteDto } from './dto/compute-route.dto.js';
import { NavigationService } from './navigation.service.js';

@ApiTags('navigation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post('route')
  computeRoute(@Body() dto: ComputeRouteDto) {
    return this.navigationService.computeRoute(dto);
  }
}
