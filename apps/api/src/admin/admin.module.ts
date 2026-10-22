import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { AuditService } from '../common/audit.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from '../mail/mail.module';
import { MailPreviewController } from '../mail/mail-preview.controller';

@Module({
  imports: [AuthModule, ThrottlerModule, MailModule],
  controllers: [AdminController, MailPreviewController],
  providers: [AdminService, AuditService],
})
export class AdminModule {}
