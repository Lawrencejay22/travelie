import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module.js';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { loadConfig } from './config/configuration.js';
import { DestinationsModule } from './destinations/destinations.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [loadConfig] }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DestinationsModule,
    FavoritesModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}