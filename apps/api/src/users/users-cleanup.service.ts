import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersCleanupService {
  private readonly logger = new Logger(UsersCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Automatically delete accounts that are not verified after 1 year.
   * Runs daily at midnight.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupUnverifiedAccounts() {
    this.logger.log('Starting cleanup of unverified accounts...');
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    try {
      const result = await this.prisma.user.deleteMany({
        where: {
          emailVerified: false,
          createdAt: {
            lt: oneYearAgo,
          },
          // Don't delete admins even if unverified (safety measure)
          isAdmin: false,
        },
      });

      if (result.count > 0) {
        this.logger.log(`Successfully deleted ${result.count} unverified accounts older than 1 year.`);
      } else {
        this.logger.log('No unverified accounts found for deletion.');
      }
    } catch (err) {
      this.logger.error('Failed to cleanup unverified accounts', err);
    }
  }
}
