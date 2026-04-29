import { Injectable, Type } from '@angular/core';

/**
 * Maps a sheet slug to a standalone Angular component that renders its
 * full educational content.
 *
 * Until each sheet has a hand-ported component, the page falls back to
 * the placeholder card in `SheetPageComponent`. New sheet components are
 * registered here as they are migrated from `legacy/sheets/<slug>.html`.
 */
@Injectable({ providedIn: 'root' })
export class SheetContentRegistry {
  private readonly map = new Map<string, Type<unknown>>();

  register(slug: string, component: Type<unknown>): void {
    this.map.set(slug, component);
  }

  get(slug: string): Type<unknown> | null {
    return this.map.get(slug) ?? null;
  }
}
