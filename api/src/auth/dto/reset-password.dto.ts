import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(20)
  token!: string;

  @ApiProperty({ example: 'NewExplore123!', minLength: 8, maxLength: 72 })
  @IsString()
  @Length(8, 72)
  @Matches(/[A-Za-z]/, { message: 'password must contain at least one letter' })
  @Matches(/[0-9]/, { message: 'password must contain at least one number' })
  password!: string;
}