import { Module } from '@nestjs/common';
import { DestinationsController, TaxonomyController } from './destinations.controller.js';
import { DestinationsService } from './destinations.service.js';

@Module({
  controllers: [DestinationsController, TaxonomyController],
  providers: [DestinationsService],
  exports: [DestinationsService],
})
export class DestinationsModule {}