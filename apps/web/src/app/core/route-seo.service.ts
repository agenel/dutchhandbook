import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router, type ActivatedRouteSnapshot } from '@angular/router';
import { SHEET_REGISTRY } from '@moredutch/shared';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MetaService } from './meta.service';

/** Merged from root → leaf route `data` (child overrides parent). */
function mergeRouteData(root: ActivatedRouteSnapshot): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  let r: ActivatedRouteSnapshot | null = root;
  while (r) {
    Object.assign(out, r.data);
    r = r.firstChild;
  }
  return out;
}

function homeJsonLd(site: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'More Dutch Hub',
    url: site,
    description:
      'Interactive tools and grammar cheat sheets for learning Dutch (A1-B1).',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    inLanguage: ['en', 'nl'],
    author: { '@type': 'Organization', name: 'More Dutch', url: site },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };
}

function cheatsheetsJsonLd(site: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Dutch grammar cheat sheets',
    numberOfItems: SHEET_REGISTRY.length,
    itemListElement: SHEET_REGISTRY.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${site}/sheets/${s.slug}`,
      name: s.title,
      description: s.description,
    })),
  };
}

/**
 * Applies `title`, `description`, `canonicalPath`, `robots`, `ogType`, and optional
 * JSON-LD from route `data` on every navigation (including auth pages that do not
 * set meta in their components).
 */
@Injectable({ providedIn: 'root' })
export class RouteSeoService {
  constructor() {
    const router = inject(Router);
    const meta = inject(MetaService);

    router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      const data = mergeRouteData(router.routerState.snapshot.root) as {
        title?: string;
        description?: string;
        canonicalPath?: string;
        robots?: string;
        ogType?: 'website' | 'article';
        seoJsonLd?: 'home' | 'cheatsheets';
        keywords?: string;
      };

      if (typeof data.title !== 'string') return;

      const pathFromRouter = router.url.split('?')[0].split('#')[0] || '/';
      const canonicalPath =
        typeof data.canonicalPath === 'string' ? data.canonicalPath : pathFromRouter;

      let jsonLd: Record<string, unknown> | undefined;
      if (data.seoJsonLd === 'home') jsonLd = homeJsonLd(environment.siteUrl);
      else if (data.seoJsonLd === 'cheatsheets') jsonLd = cheatsheetsJsonLd(environment.siteUrl);

      meta.set({
        title: data.title,
        description: data.description ?? '',
        canonicalPath,
        robots: data.robots,
        type: data.ogType,
        jsonLd,
        keywords: data.keywords,
      });
    });
  }
}
