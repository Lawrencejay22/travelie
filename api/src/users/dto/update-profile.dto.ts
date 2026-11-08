import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 60 })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  displayName?: string;

  @ApiPropertyOptional({ example: '/static/uploads/avatar.jpg' })
  @IsOptional()
  @IsString()
  @Matches(/^(https?:\/\/|\/static\/)/, { message: 'avatarUrl must be an absolute URL or a /static path' })
  avatarUrl?: string;
}