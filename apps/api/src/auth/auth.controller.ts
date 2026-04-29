import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginSchema, RegisterSchema, type LoginDto, type RegisterDto } from '@moredutch/shared';
import { SkipCsrf } from '../common/csrf.guard';
import { ZodValidationPipe } from '../common/zod.pipe';
import { AuthService } from './auth.service';
import type { PublicUser } from '@moredutch/shared';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  async me(@Req() req: Request): Promise<PublicUser> {
    const user = await this.auth.requireUser(req);
    return user;
  }

  @SkipCsrf()
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
  @Post('password/request-reset')
  @HttpCode(204)
  async requestReset(
    @Body() body: { email?: string },
    @Req() req: Request,
  ): Promise<void> {
    // Always 204 to avoid user enumeration.
    const email = String(body?.email ?? '').trim().toLowerCase();
    if (!email) return;
    await this.auth.requestPasswordReset(email, req);
  }

  @SkipCsrf()
  @Post('password/confirm-reset')
  @HttpCode(204)
  async confirmReset(@Body() body: { token?: string; password?: string }): Promise<void> {
    const token = String(body?.token ?? '');
    const password = String(body?.password ?? '');
    if (!token || !password) throw new UnauthorizedException();
    await this.auth.confirmPasswordReset(token, password);
  }

  @SkipCsrf()
  @Post('email/verify')
  @HttpCode(204)
  async verifyEmail(@Body() body: { token?: string }): Promise<void> {
    const token = String(body?.token ?? '');
    if (!token) throw new UnauthorizedException();
    await this.auth.verifyEmail(token);
  }
}

