import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';

export class CreateTripExpenseDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  title!: string;

  @ApiProperty({ maxLength: 40 })
  @IsString()
  @MaxLength(40)
  category!: string;

  @ApiProperty({ minimum: 0.01 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999)
  amount!: number;

  @ApiPropertyOptional({
    example: 'PHP',
    pattern: '^[A-Z]{3}$',
    default: 'PHP',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency = 'PHP';

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  incurredAt?: string;
}
