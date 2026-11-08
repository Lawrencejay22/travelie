import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/auth.types.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  update(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('me/avatar')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (_req, file, callback) =>
          callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
          callback(new BadRequestException('Only JPEG, PNG or WebP images are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('A file field named "file" is required');
    }
    return this.usersService.updateProfile(user.sub, { avatarUrl: `/static/uploads/${file.filename}` });
  }
}