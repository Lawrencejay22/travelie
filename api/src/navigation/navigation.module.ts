import { Module } from '@nestjs/common';
import { NavigationController } from './navigation.controller.js';
import { NavigationService } from './navigation.service.js';

@Module({
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
