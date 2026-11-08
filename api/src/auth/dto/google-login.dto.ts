import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google OpenID Connect ID token' })
  @IsString()
  @MinLength(100)
  @MaxLength(10000)
  idToken!: string;
}
