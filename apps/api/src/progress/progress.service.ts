import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getMastery(userId: string): Promise<Record<string, boolean>> {
    const rows = await this.prisma.masteryEntry.findMany({ where: { userId } });
    const out: Record<string, boolean> = {};
    for (const r of rows) out[r.sheetSlug] = r.mastered;
    return out;
  }

  async setMastery(userId: string, sheetSlug: string, mastered: boolean): Promise<void> {
    if (mastered) {
      await this.prisma.masteryEntry.upsert({
        where: { userId_sheetSlug: { userId, sheetSlug } },
        update: { mastered: true },
        create: { userId, sheetSlug, mastered: true },
      });
    } else {
      await this.prisma.masteryEntry.deleteMany({ where: { userId, sheetSlug } });
    }
  }

  async migrateMastery(userId: string, masteredSlugs: string[]): Promise<void> {
    if (!masteredSlugs.length) return;
    await this.prisma.masteryEntry.createMany({
      data: masteredSlugs.map((sheetSlug) => ({ userId, sheetSlug, mastered: true })),
    });
  }
}

