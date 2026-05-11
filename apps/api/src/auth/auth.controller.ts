import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { 
  LoginSchema, 
  RegisterSchema, 
  PasswordResetRequestSchema, 
  PasswordResetConfirmSchema,
  type LoginDto, 
  type RegisterDto,
  type PasswordResetRequestDto,
  type PasswordResetConfirmDto
} from '@moredutch/shared';
import { SkipCsrf } from '../common/csrf.guard';
import { ZodValidationPipe } from '../common/zod.pipe';
import { AuthService } from './auth.service';
import type { PublicUser } from '@moredutch/shared';

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
    @Body(new ZodValidationPipe(PasswordResetRequestSchema)) dto: PasswordResetRequestDto,
    @Req() req: Request,
  ): Promise<void> {
    // Always 204 to avoid user enumeration.
    await this.auth.requestPasswordReset(dto.email, req);
  }

  @SkipCsrf()
  @Post('password/confirm-reset')
  @HttpCode(204)
  async confirmReset(
    @Body(new ZodValidationPipe(PasswordResetConfirmSchema)) dto: PasswordResetConfirmDto
  ): Promise<void> {
    await this.auth.confirmPasswordReset(dto.token, dto.password);
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

