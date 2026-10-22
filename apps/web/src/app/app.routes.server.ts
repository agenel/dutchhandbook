import { RenderMode, type ServerRoute } from '@angular/ssr';
import { SHEET_REGISTRY, TOOL_REGISTRY } from '@moredutch/shared';

/**
 * Build-time prerendering for the public, content-only pages so phones get
 * real HTML (hero, headings, sheet tables) before the JavaScript boots.
 * Account pages stay client-rendered: they depend on the signed-in user.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'cheatsheets', renderMode: RenderMode.Prerender },
  { path: 'help', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  {
    path: 'sheets/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => SHEET_REGISTRY.map((s) => ({ slug: s.slug })),
  },
  ...TOOL_REGISTRY.map((t): ServerRoute => ({ path: `tools/${t.slug}`, renderMode: RenderMode.Prerender })),
  { path: '**', renderMode: RenderMode.Client },
];
