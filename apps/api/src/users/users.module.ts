import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersCleanupService } from './users-cleanup.service';

@Module({
  providers: [UsersService, UsersCleanupService],
  exports: [UsersService],
})
export class UsersModule {}

