import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { Request } from 'express';
import type { 
  AdminUserDto, 
  AdminStatsDto, 
  AdminSignupChartDto, 
  AdminAttemptsChartDto,
  AdminAuditLogDto,
  AdminUserPatchDto,
  PaginatedResult,
  AdminChartRange
} from '@moredutch/shared';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getUsers(page: number, limit: number, search: string): Promise<PaginatedResult<AdminUserDto>> {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { email: { contains: search } },
        { displayName: { contains: search } }
      ]
    } : {};

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              mastery: { where: { mastered: true } },
              verbMastery: true,
              quizAttempts: true,
              knmAttempts: true
            }
          }
        }
      })
    ]);

    const data: AdminUserDto[] = users.map(u => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      emailVerified: u.emailVerified,
      hasTotp: u.hasTotp,
      createdAt: u.createdAt.toISOString(),
      isAdmin: u.isAdmin,
      isBanned: u.isBanned,
      bannedReason: u.bannedReason,
      bannedAt: u.bannedAt?.toISOString() ?? null,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      masteredSheets: u._count.mastery,
      masteredVerbs: u._count.verbMastery,
      totalAttempts: u._count.quizAttempts + u._count.knmAttempts
    }));

    return { data, total, page, pageSize: limit };
  }

  async getUser(id: string): Promise<AdminUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            mastery: { where: { mastered: true } },
            verbMastery: true,
            quizAttempts: true,
            knmAttempts: true
          }
        }
      }
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      hasTotp: user.hasTotp,
      createdAt: user.createdAt.toISOString(),
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
      bannedReason: user.bannedReason,
      bannedAt: user.bannedAt?.toISOString() ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      masteredSheets: user._count.mastery,
      masteredVerbs: user._count.verbMastery,
      totalAttempts: user._count.quizAttempts + user._count.knmAttempts
    };
  }

  async patchUser(id: string, dto: AdminUserPatchDto, req: Request): Promise<AdminUserDto> {
    const admin = await this.prisma.user.findFirst({ where: { isAdmin: true } }); // This is just for types, we'll get real admin from req in controller
    let updateData: any = {};
    if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
    if (dto.isAdmin !== undefined) updateData.isAdmin = dto.isAdmin;
    
    if (dto.isBanned !== undefined) {
      updateData.isBanned = dto.isBanned;
      if (dto.isBanned) {
        updateData.bannedAt = new Date();
        updateData.bannedReason = dto.bannedReason ?? null;
      } else {
        updateData.bannedAt = null;
        updateData.bannedReason = null;
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: updateData
    });

    // If banned, revoke sessions
    if (dto.isBanned) {
       await this.prisma.session.updateMany({
         where: { userId: id, revokedAt: null },
         data: { revokedAt: new Date() }
       });
    }

    await this.audit.logEvent(null, 'ADMIN_PATCH_USER', req, { targetId: id, ...dto });
    return this.getUser(id);
  }

  async deleteUser(id: string, req: Request): Promise<void> {
    await this.audit.logEvent(null, 'ADMIN_DELETE_USER', req, { targetId: id });
    await this.prisma.user.delete({ where: { id } });
  }

  async exportUsers(req: Request): Promise<string> {
    await this.audit.logEvent(null, 'ADMIN_EXPORT_USERS', req);
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            mastery: { where: { mastered: true } },
            verbMastery: true,
            quizAttempts: true,
            knmAttempts: true
          }
        }
      }
    });

    const header = ['ID', 'Email', 'DisplayName', 'Admin', 'Banned', 'JoinedAt', 'LastLogin', 'MasteredSheets', 'MasteredVerbs', 'TotalAttempts'];
    const rows = users.map(u => [
      u.id,
      u.email,
      u.displayName || '',
      u.isAdmin ? 'Yes' : 'No',
      u.isBanned ? 'Yes' : 'No',
      u.createdAt.toISOString(),
      u.lastLoginAt?.toISOString() || '',
      u._count.mastery,
      u._count.verbMastery,
      u._count.quizAttempts + u._count.knmAttempts
    ]);

    return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  async getStats(): Promise<AdminStatsDto> {
    const now = new Date();
    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers24h, activeUsers7d, totalQuizAttempts, totalKnmAttempts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { lastLoginAt: { gte: ago24h } } }),
      this.prisma.user.count({ where: { lastLoginAt: { gte: ago7d } } }),
      this.prisma.quizAttempt.count(),
      this.prisma.knmAttempt.count()
    ]);

    return { totalUsers, activeUsers24h, activeUsers7d, totalQuizAttempts, totalKnmAttempts };
  }

  async getSignupChart(range: AdminChartRange = '1m'): Promise<AdminSignupChartDto[]> {
    const { start, intervalMs, points } = this.getRangeParams(range);
    
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true }
    });

    const result: AdminSignupChartDto[] = [];
    const now = Date.now();

    for (let i = points - 1; i >= 0; i--) {
      const pStart = new Date(now - i * intervalMs);
      const pEnd = new Date(now - (i - 1) * intervalMs);
      
      const count = users.filter(u => u.createdAt >= pStart && u.createdAt < pEnd).length;
      result.push({ date: this.formatLabel(pStart, range), count });
    }

    return result;
  }

  async getAttemptsChart(range: AdminChartRange = '1m'): Promise<AdminAttemptsChartDto[]> {
    const { start, intervalMs, points } = this.getRangeParams(range);
    
    const [quiz, knm] = await Promise.all([
      this.prisma.quizAttempt.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true }
      }),
      this.prisma.knmAttempt.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true }
      })
    ]);

    const result: AdminAttemptsChartDto[] = [];
    const now = Date.now();

    for (let i = points - 1; i >= 0; i--) {
      const pStart = new Date(now - i * intervalMs);
      const pEnd = new Date(now - (i - 1) * intervalMs);
      
      const quizCount = quiz.filter(q => q.createdAt >= pStart && q.createdAt < pEnd).length;
      const knmCount = knm.filter(k => k.createdAt >= pStart && k.createdAt < pEnd).length;
      
      result.push({ 
        date: this.formatLabel(pStart, range), 
        quizCount,
        knmCount
      });
    }

    return result;
  }

  private getRangeParams(range: AdminChartRange) {
    const now = Date.now();
    switch (range) {
      case '1h': return { start: new Date(now - 3600 * 1000), intervalMs: 60 * 1000, points: 60 }; // 60 mins
      case '1d': return { start: new Date(now - 24 * 3600 * 1000), intervalMs: 3600 * 1000, points: 24 }; // 24 hours
      case '1w': return { start: new Date(now - 7 * 24 * 3600 * 1000), intervalMs: 24 * 3600 * 1000, points: 7 }; // 7 days
      case '1m': return { start: new Date(now - 30 * 24 * 3600 * 1000), intervalMs: 24 * 3600 * 1000, points: 30 }; // 30 days
      case '1y': return { start: new Date(now - 365 * 24 * 3600 * 1000), intervalMs: 30 * 24 * 3600 * 1000, points: 12 }; // 12 months-ish
      case 'all': return { start: new Date(0), intervalMs: 365 * 24 * 3600 * 1000, points: 5 }; // 5 years-ish
      default: return { start: new Date(now - 30 * 24 * 3600 * 1000), intervalMs: 24 * 3600 * 1000, points: 30 };
    }
  }

  private formatLabel(date: Date, range: AdminChartRange): string {
    if (range === '1h') return date.toLocaleTimeString([], { minute: '2-digit' });
    if (range === '1d') return date.getHours() + ':00';
    if (range === '1w' || range === '1m') return date.getDate() + '/' + (date.getMonth() + 1);
    if (range === '1y' || range === 'all') return (date.getMonth() + 1) + '/' + date.getFullYear().toString().substring(2);
    return date.toISOString().split('T')[0];
  }

  async getAuditLogs(page: number, limit: number, event?: string): Promise<PaginatedResult<AdminAuditLogDto>> {
    const skip = (page - 1) * limit;
    
    const where = event ? { event } : {};

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } }
      })
    ]);

    const data: AdminAuditLogDto[] = logs.map(l => ({
      id: l.id,
      userId: l.userId,
      userEmail: l.user?.email ?? null,
      event: l.event,
      ip: l.ip,
      userAgent: l.userAgent,
      meta: l.meta ? JSON.parse(l.meta) : null,
      createdAt: l.createdAt.toISOString()
    }));

    return { data, total, page, pageSize: limit };
  }
}
