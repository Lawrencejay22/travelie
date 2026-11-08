import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsLatitude, IsLongitude } from 'class-validator';

export class ComputeRouteDto {
  @ApiProperty({ minimum: -90, maximum: 90 })
  @Type(() => Number)
  @IsLatitude()
  originLatitude!: number;

  @ApiProperty({ minimum: -180, maximum: 180 })
  @Type(() => Number)
  @IsLongitude()
  originLongitude!: number;

  @ApiProperty({ minimum: -90, maximum: 90 })
  @Type(() => Number)
  @IsLatitude()
  destinationLatitude!: number;

  @ApiProperty({ minimum: -180, maximum: 180 })
  @Type(() => Number)
  @IsLongitude()
  destinationLongitude!: number;

  @ApiProperty({ enum: ['WALK', 'DRIVE'], default: 'WALK' })
  @IsIn(['WALK', 'DRIVE'])
  travelMode: 'WALK' | 'DRIVE' = 'WALK';
}
