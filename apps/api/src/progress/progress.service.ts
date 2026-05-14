import { Injectable } from '@nestjs/common';
import type {
  AttemptItem,
  KnmAttemptDto,
  PreferencesDto,
  QuizAttemptDto,
} from '@moredutch/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Sheet mastery ────────────────────────────────────────────────────────────

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
      skipDuplicates: true,
    } as never);
  }

  // ── Verb mastery ─────────────────────────────────────────────────────────────

  async getVerbs(userId: string): Promise<string[]> {
    const rows = await this.prisma.verbMastery.findMany({ where: { userId }, select: { verbId: true } });
    return rows.map((r: { verbId: string }) => r.verbId);
  }

  async syncVerbs(userId: string, masteredIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.verbMastery.deleteMany({ where: { userId } }),
      this.prisma.verbMastery.createMany({
        data: masteredIds.map((verbId) => ({ userId, verbId })),
        skipDuplicates: true,
      } as never),
    ]);
  }

  // ── Noun mastery ─────────────────────────────────────────────────────────────

  async getNouns(userId: string): Promise<string[]> {
    const rows = await this.prisma.nounMastery.findMany({ where: { userId }, select: { nounId: true } });
    return rows.map((r: { nounId: string }) => r.nounId);
  }

  async syncNouns(userId: string, masteredIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.nounMastery.deleteMany({ where: { userId } }),
      this.prisma.nounMastery.createMany({
        data: masteredIds.map((nounId) => ({ userId, nounId })),
        skipDuplicates: true,
      } as never),
    ]);
  }

  // ── Common words mastery ─────────────────────────────────────────────────────

  async getCommonWords(userId: string): Promise<string[]> {
    const rows = await this.prisma.commonWordMastery.findMany({
      where: { userId },
      select: { wordId: true },
    });
    return rows.map((r: { wordId: string }) => r.wordId);
  }

  async syncCommonWords(userId: string, masteredIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.commonWordMastery.deleteMany({ where: { userId } }),
      this.prisma.commonWordMastery.createMany({
        data: masteredIds.map((wordId) => ({ userId, wordId })),
        skipDuplicates: true,
      } as never),
    ]);
  }

  // ── Quiz attempts ────────────────────────────────────────────────────────────

  async saveQuizAttempt(userId: string, dto: QuizAttemptDto): Promise<void> {
    await this.prisma.quizAttempt.create({
      data: { userId, ...dto },
    });
  }

  // ── KNM attempts ─────────────────────────────────────────────────────────────

  async saveKnmAttempt(userId: string, dto: KnmAttemptDto): Promise<void> {
    await this.prisma.knmAttempt.create({
      data: { userId, ...dto },
    });
  }

  // ── Combined attempts list ───────────────────────────────────────────────────

  async getAttempts(userId: string): Promise<AttemptItem[]> {
    const [quiz, knm] = await Promise.all([
      this.prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.knmAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const items: AttemptItem[] = [
      ...quiz.map((q: any) => ({
        id: q.id,
        tool: 'quiz' as const,
        score: q.score,
        total: q.total,
        correct: q.correct,
        durationMs: q.durationMs,
        createdAt: q.createdAt.toISOString(),
      })),
      ...knm.map((k: any) => ({
        id: k.id,
        tool: 'knm' as const,
        score: k.score,
        total: k.total,
        correct: k.correct,
        durationMs: k.durationMs,
        createdAt: k.createdAt.toISOString(),
      })),
    ];

    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  }

  // ── Stats summary ────────────────────────────────────────────────────────────

  async getStats(userId: string): Promise<{
    masteredSheets: number;
    masteredVerbs: number;
    masteredNouns: number;
    masteredCommonWords: number;
    totalQuizAttempts: number;
    totalKnmAttempts: number;
  }> {
    const [
      masteredSheets,
      masteredVerbs,
      masteredNouns,
      masteredCommonWords,
      totalQuizAttempts,
      totalKnmAttempts,
    ] = await Promise.all([
      this.prisma.masteryEntry.count({ where: { userId, mastered: true } }),
      this.prisma.verbMastery.count({ where: { userId } }),
      this.prisma.nounMastery.count({ where: { userId } }),
      this.prisma.commonWordMastery.count({ where: { userId } }),
      this.prisma.quizAttempt.count({ where: { userId } }),
      this.prisma.knmAttempt.count({ where: { userId } }),
    ]);
    return {
      masteredSheets,
      masteredVerbs,
      masteredNouns,
      masteredCommonWords,
      totalQuizAttempts,
      totalKnmAttempts,
    };
  }

  // ── UI preferences (theme, library filters) ─────────────────────────────────

  async getPreferences(userId: string): Promise<PreferencesDto> {
    const row = await this.prisma.userPreference.findUnique({ where: { userId } });
    return {
      darkMode: row?.darkMode ?? false,
      flashcardMode: row?.flashcardMode ?? false,
      hideMastered: row?.hideMastered ?? false,
    };
  }

  async patchPreferences(userId: string, dto: Partial<PreferencesDto>): Promise<void> {
    const data: { darkMode?: boolean; flashcardMode?: boolean; hideMastered?: boolean } = {};
    if (dto.darkMode !== undefined) data.darkMode = dto.darkMode;
    if (dto.flashcardMode !== undefined) data.flashcardMode = dto.flashcardMode;
    if (dto.hideMastered !== undefined) data.hideMastered = dto.hideMastered;
    if (Object.keys(data).length === 0) return;

    await this.prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        darkMode: dto.darkMode ?? false,
        flashcardMode: dto.flashcardMode ?? false,
        hideMastered: dto.hideMastered ?? false,
      },
      update: data,
    });
  }

  async mergePreferencesFromMigration(userId: string, dto: Partial<PreferencesDto>): Promise<void> {
    await this.prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        darkMode: dto.darkMode ?? false,
        flashcardMode: dto.flashcardMode ?? false,
        hideMastered: dto.hideMastered ?? false,
      },
      update: {
        ...(dto.darkMode !== undefined && { darkMode: dto.darkMode }),
        ...(dto.flashcardMode !== undefined && { flashcardMode: dto.flashcardMode }),
        ...(dto.hideMastered !== undefined && { hideMastered: dto.hideMastered }),
      },
    });
  }
}
