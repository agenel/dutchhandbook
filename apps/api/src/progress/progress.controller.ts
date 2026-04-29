import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { MasteryToggleSchema, ProgressMigrationSchema, type MasteryToggleDto, type ProgressMigrationDto } from '@moredutch/shared';
import { ZodValidationPipe } from '../common/zod.pipe';
import { AuthService } from '../auth/auth.service';
import { ProgressService } from './progress.service';

@Controller({ path: 'progress', version: '1' })
export class ProgressController {
  constructor(
    private readonly auth: AuthService,
    private readonly progress: ProgressService,
  ) {}

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
  }
}

