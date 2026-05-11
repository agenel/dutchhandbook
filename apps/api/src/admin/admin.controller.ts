import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Query, 
  Param, 
  Body, 
  UseGuards,
  HttpCode,
  Res
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { ZodValidationPipe } from '../common/zod.pipe';
import { AdminUserPatchSchema, AdminUserPatchDto, AdminChartRange } from '@moredutch/shared';

@Controller({ path: 'admin', version: '1' })
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  async getUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    return this.admin.getUsers(p, l, search || '');
  }

  @Get('users-export')
  async exportUsers(@Res() res: any) {
    const csv = await this.admin.exportUsers();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
    return res.send(csv);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Patch('users/:id')
  async patchUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AdminUserPatchSchema)) dto: AdminUserPatchDto
  ) {
    return this.admin.patchUser(id, dto);
  }

  @Delete('users/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    await this.admin.deleteUser(id);
  }

  @Get('stats')
  async getStats() {
    return this.admin.getStats();
  }

  @Get('stats/signups')
  async getSignupChart(@Query('range') range: AdminChartRange) {
    return this.admin.getSignupChart(range);
  }

  @Get('stats/attempts')
  async getAttemptsChart(@Query('range') range: AdminChartRange) {
    return this.admin.getAttemptsChart(range);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('event') event: string
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    return this.admin.getAuditLogs(p, l, event || undefined);
  }
}
