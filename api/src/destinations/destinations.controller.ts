import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service.js';
import { QueryNearbyDto } from './dto/query-nearby.dto.js';
import { QueryDestinationsDto } from './dto/query-destinations.dto.js';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  findAll(@Query() query: QueryDestinationsDto) {
    return this.destinationsService.findAll(query);
  }

  @Get('nearby')
  findNearby(@Query() query: QueryNearbyDto) {
    return this.destinationsService.findNearby(query);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.destinationsService.findBySlug(slug);
  }
}

@ApiTags('taxonomy')
@Controller()
export class TaxonomyController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get('categories')
  categories() {
    return this.destinationsService.listCategories();
  }

  @Get('cities')
  cities() {
    return this.destinationsService.listCities();
  }
}
