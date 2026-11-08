import { Body, Controller, Get, Headers, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type { JwtPayload } from './auth.types.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Headers('user-agent') userAgent?: string) {
    return this.authService.register(dto, userAgent);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Headers('user-agent') userAgent?: string) {
    return this.authService.login(dto, userAgent);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto, @Headers('user-agent') userAgent?: string) {
    return this.authService.refresh(dto.refreshToken, userAgent);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }
}