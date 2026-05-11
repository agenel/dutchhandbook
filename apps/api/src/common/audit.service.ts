import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logEvent(userId: string | null, event: string, req: Request, meta?: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          event,
          ip: req.ip ?? 'unknown',
          userAgent: req.get('user-agent') ?? 'unknown',
          meta: meta ? JSON.stringify(meta) : null,
        },
      });
    } catch (err) {
      // Fail silently for audit logs to not block main flow
      // eslint-disable-next-line no-console
      console.error('[audit-log-error]', err);
    }
  }
}
