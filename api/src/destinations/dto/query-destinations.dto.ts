import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class QueryDestinationsDto {
  @ApiPropertyOptional({ description: 'Free-text search across name, summary and city' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @ApiPropertyOptional({ description: 'Category slug, e.g. beach' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'City slug, e.g. el-nido' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ enum: ['popular', 'newest', 'name'], default: 'popular' })
  @IsOptional()
  @IsIn(['popular', 'newest', 'name'])
  sort: 'popular' | 'newest' | 'name' = 'popular';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 12;
}