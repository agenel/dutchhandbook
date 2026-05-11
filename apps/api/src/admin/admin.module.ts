import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { AuditService } from '../common/audit.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [AuthModule, ThrottlerModule],
  controllers: [AdminController],
  providers: [AdminService, AuditService, Reflector],
})
export class AdminModule {}
