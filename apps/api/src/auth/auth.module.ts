import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsService } from './sessions.service';
import { AuditService } from '../common/audit.service';

@Module({
  imports: [ThrottlerModule],
  controllers: [AuthController],
  providers: [AuthService, SessionsService, AuditService],
  exports: [AuthService],
})
export class AuthModule {}

