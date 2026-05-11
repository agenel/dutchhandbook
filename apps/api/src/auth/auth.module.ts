import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsService } from './sessions.service';
import { AuditService } from '../common/audit.service';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [ThrottlerModule],
  controllers: [AuthController],
  providers: [AuthService, SessionsService, AuditService, Reflector],
  exports: [AuthService],
})
export class AuthModule {}

