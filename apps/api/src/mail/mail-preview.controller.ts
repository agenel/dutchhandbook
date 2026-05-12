import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { verificationTemplate, passwordResetTemplate } from './templates';

@Controller('mail-preview')
export class MailPreviewController {
  @Get('verify')
  viewVerify(@Res() res: Response) {
    const html = verificationTemplate('https://moredutch.com/auth/verify?token=example-token');
    res.setHeader('Content-Type', 'text/html');
    res.removeHeader('X-Frame-Options'); // Allow iframing for preview
    return res.send(html);
  }

  @Get('reset')
  viewReset(@Res() res: Response) {
    const html = passwordResetTemplate('https://moredutch.com/auth/reset?token=example-token');
    res.setHeader('Content-Type', 'text/html');
    res.removeHeader('X-Frame-Options'); // Allow iframing for preview
    return res.send(html);
  }
}
