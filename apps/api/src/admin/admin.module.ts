import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { AuditService } from '../common/audit.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [AuthModule, ThrottlerModule, MailModule],
  controllers: [AdminController],
  providers: [AdminService, AuditService],
})
export class AdminModule {}
