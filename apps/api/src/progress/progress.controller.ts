import { Body, Controller, Get, HttpCode, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import {
  KnmAttemptSchema,
  MasteryToggleSchema,
  NounSyncSchema,
  PreferencesPatchSchema,
  ProgressMigrationSchema,
  QuizAttemptSchema,
  VerbSyncSchema,
  CommonWordSyncSchema,
  type AttemptItem,
  type KnmAttemptDto,
  type MasteryToggleDto,
  type PreferencesPatchDto,
  type ProgressMigrationDto,
  type QuizAttemptDto,
  type VerbSyncDto,
  type NounSyncDto,
  type CommonWordSyncDto,
} from '@moredutch/shared';
import { ZodValidationPipe } from '../common/zod.pipe';
import { AuthService } from '../auth/auth.service';
import { ProgressService } from './progress.service';

@Controller({ path: 'progress', version: '1' })
export class ProgressController {
  constructor(
    private readonly auth: AuthService,
    private readonly progress: ProgressService,
  ) {}

  // ── Sheet mastery ────────────────────────────────────────────────────────────

  @Get('mastery')
  async mastery(@Req() req: Request): Promise<Record<string, boolean>> {
    const user = await this.auth.requireUser(req);
    return this.progress.getMastery(user.id);
  }

  @Post('mastery')
  @HttpCode(204)
  async setMastery(
    @Body(new ZodValidationPipe(MasteryToggleSchema)) dto: MasteryToggleDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = await this.auth.requireUser(req);
    await this.progress.setMastery(user.id, dto.sheetSlug, dto.mastered);
  }

  @Post('migrate')
  @HttpCode(204)
  async migrate(
    @Body(new ZodValidationPipe(ProgressMigrationSchema)) dto: ProgressMigrationDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = await this.auth.requireUser(req);
    await this.progress.migrateMastery(user.id, dto.masteredSlugs);
    if (dto.preferences) {
      await this.progress.mergePreferencesFromMigration(user.id, dto.preferences);
    }
  }

  @Get('preferences')
  async getPreferences(@Req() req: Request) {
    const user = await this.auth.requireUser(req);
    return this.progress.getPreferences(user.id);
  }

  @Patch('preferences')
  @HttpCode(204)
  async patchPreferences(
    @Body(new ZodValidationPipe(PreferencesPatchSchema)) dto: PreferencesPatchDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = await this.auth.requireUser(req);
    await this.progress.patchPreferences(user.id, dto);
  }

  // ── Verb mastery ─────────────────────────────────────────────────────────────

  @Get('verbs')
  async getVerbs(@Req() req: Request): Promise<string[]> {
    const user = await this.auth.requireUser(req);
    return this.progress.getVerbs(user.id);
  }

  @Post('verbs/sync')
  @HttpCode(204)
  async syncVerbs(
    @Body(new ZodValidationPipe(VerbSyncSchema)) dto: VerbSyncDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = await this.auth.requireUser(req);
    await this.progress.syncVerbs(user.id, dto.masteredIds);
  }

  // ── Noun mastery ─────────────────────────────────────────────────────────────

  @Get('nouns')
  async getNouns(@Req() req: Request): Promise<string[]> {
    const user = await this.auth.requireUser(req);
    return this.progress.getNouns(user.id);
  }

  @Post('nouns/sync')
  @HttpCode(204)
  async syncNouns(
    @Body(new ZodValidationPipe(NounSyncSchema)) dto: NounSyncDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = await this.auth.requireUser(req);
    await this.progress.syncNouns(user.id, dto.masteredIds);
  }

  // ── Common words mastery ─────────────────────────────────────────────────────

  @Get('common-words')
  async getCommonWords(@Req() req: Request): Promise<string[]> {
    const user = await this.auth.requireUser(req);
    return this.progress.getCommonWords(user.id);
  }

  @Post('common-words/sync')
  @HttpCode(204)
  async syncCommonWords(
    @Body(new ZodValidationPipe(CommonWordSyncSchema)) dto: CommonWordSyncDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = await this.auth.requireUser(req);
    await this.progress.syncCommonWords(user.id, dto.masteredIds);
  }

  // ── Quiz attempts ────────────────────────────────────────────────────────────

  @Post('quiz-attempt')
  @HttpCode(204)
  async saveQuizAttempt(
    @Body(new ZodValidationPipe(QuizAttemptSchema)) dto: QuizAttemptDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = await this.auth.requireUser(req);
    await this.progress.saveQuizAttempt(user.id, dto);
  }

  // ── KNM attempts ─────────────────────────────────────────────────────────────

  @Post('knm-attempt')
  @HttpCode(204)
  async saveKnmAttempt(
    @Body(new ZodValidationPipe(KnmAttemptSchema)) dto: KnmAttemptDto,
    @Req() req: Request,
  ): Promise<void> {
    const user = await this.auth.requireUser(req);
    await this.progress.saveKnmAttempt(user.id, dto);
  }

  // ── Combined history + stats ──────────────────────────────────────────────────

  @Get('attempts')
  async getAttempts(@Req() req: Request): Promise<AttemptItem[]> {
    const user = await this.auth.requireUser(req);
    return this.progress.getAttempts(user.id);
  }

  @Get('stats')
  async getStats(@Req() req: Request): Promise<{
    masteredSheets: number;
    masteredVerbs: number;
    masteredNouns: number;
    masteredCommonWords: number;
    totalQuizAttempts: number;
    totalKnmAttempts: number;
  }> {
    const user = await this.auth.requireUser(req);
    return this.progress.getStats(user.id);
  }
}
