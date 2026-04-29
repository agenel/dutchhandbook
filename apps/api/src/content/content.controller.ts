import { Controller, Get } from '@nestjs/common';

/**
 * Placeholder content API.
 *
 * The SPA currently ships its learning content as static JSON assets.
 * This module exists so we can later move content into the database and
 * expose admin editing. For now we only expose a tiny version endpoint
 * to prove the API is alive.
 */
@Controller({ path: 'content', version: '1' })
export class ContentController {
  @Get('version')
  version(): { ok: true; version: string } {
    return { ok: true, version: '1' };
  }
}

