import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AdminGuard } from '../admin/admin.guard';
import { verificationTemplate, passwordResetTemplate } from './templates';

/**
 * Email template previews for the admin "Mail templates" page (shown in an
 * iframe). Admin-only: registered in AdminModule so AdminGuard can resolve.
 */
@Controller('mail-preview')
@UseGuards(AdminGuard)
export class MailPreviewController {
  constructor(private readonly config: ConfigService) {}

  @Get('verify')
  viewVerify(@Res() res: Response) {
    return this.send(res, verificationTemplate('https://moredutch.com/auth/verify?token=example-token'));
  }

  @Get('reset')
  viewReset(@Res() res: Response) {
    return this.send(res, passwordResetTemplate('https://moredutch.com/auth/reset?token=example-token'));
  }

  private send(res: Response, html: string) {
    // The template is inline-styled HTML meant to be framed by the admin page,
    // so it gets its own CSP instead of the API's default "frame nothing" policy.
    const frameAncestors = ["'self'", ...this.allowedOrigins()].join(' ');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'none'; style-src 'unsafe-inline'; img-src https: data:; frame-ancestors ${frameAncestors}`,
    );
    res.removeHeader('X-Frame-Options'); // superseded by frame-ancestors above
    return res.send(html);
  }

  private allowedOrigins(): string[] {
    return (this.config.get<string>('CORS_ALLOWED_ORIGINS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
