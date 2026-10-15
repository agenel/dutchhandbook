import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import type { LoginDto, RegisterDto, PasswordResetRequestDto, PasswordResetConfirmDto, PublicUser } from '@moredutch/shared';
import {
  LoginSchema,
  RegisterSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  VerifyEmailSchema,
} from '../schemas/validation';
import { SkipCsrf } from '../common/csrf.guard';
import { ZodValidationPipe } from '../common/zod.pipe';
import { AuthService } from './auth.service';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  async me(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const user = await this.auth.requireUser(req, res);
    return user;
  }

  @SkipCsrf()
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const { user } = await this.auth.register(dto, req, res);
    return user;
  }

  @SkipCsrf()
  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    const { user } = await this.auth.login(dto, req, res);
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(req, res);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<PublicUser> {
    const user = await this.auth.refresh(req, res);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @SkipCsrf()
  @Throttle({ long: { limit: 5, ttl: 60000 } })
  @Post('password/request-reset')
  @HttpCode(204)
  async requestReset(
    @Body(new ZodValidationPipe(PasswordResetRequestSchema)) dto: PasswordResetRequestDto,
    @Req() req: Request,
  ): Promise<void> {
    // Always 204 to avoid user enumeration.
    await this.auth.requestPasswordReset(dto.email, req);
  }

  @SkipCsrf()
  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @Post('password/confirm-reset')
  @HttpCode(204)
  async confirmReset(
    @Body(new ZodValidationPipe(PasswordResetConfirmSchema)) dto: PasswordResetConfirmDto
  ): Promise<void> {
    await this.auth.confirmPasswordReset(dto.token, dto.password);
  }

  @SkipCsrf()
  @Throttle({ long: { limit: 10, ttl: 60000 } })
  @Post('email/verify')
  @HttpCode(204)
  async verifyEmail(
    @Body(new ZodValidationPipe(VerifyEmailSchema)) dto: { token: string },
  ): Promise<void> {
    await this.auth.verifyEmail(dto.token);
  }
}

