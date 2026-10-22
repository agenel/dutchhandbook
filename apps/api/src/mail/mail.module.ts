import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

// MailPreviewController lives in AdminModule (it needs AdminGuard -> AuthService,
// and AuthModule already imports this module).
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
