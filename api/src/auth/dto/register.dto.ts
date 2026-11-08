import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'traveler@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'Maria Santos', minLength: 2, maxLength: 60 })
  @IsString()
  @Length(2, 60)
  displayName!: string;

  @ApiProperty({ example: 'Explore123!', minLength: 8, maxLength: 72 })
  @IsString()
  @Length(8, 72)
  @Matches(/[A-Za-z]/, { message: 'password must contain at least one letter' })
  @Matches(/[0-9]/, { message: 'password must contain at least one number' })
  password!: string;
}