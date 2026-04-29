import { Controller, Get } from '@nestjs/common';

@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Get()
  ok(): { ok: true } {
    return { ok: true };
  }
}

