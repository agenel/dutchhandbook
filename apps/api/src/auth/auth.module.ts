import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsService } from './sessions.service';
import { AuditService } from '../common/audit.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [ThrottlerModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, SessionsService, AuditService],
  exports: [AuthService],
})
export class AuthModule {}

