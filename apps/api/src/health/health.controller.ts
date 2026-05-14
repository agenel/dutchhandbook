import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async ok(): Promise<{ ok: true; db: boolean }> {
    try {
      // Fast ping to verify DB connection
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, db: true };
    } catch (e) {
      throw new ServiceUnavailableException({ ok: false, db: false });
    }
  }
}

