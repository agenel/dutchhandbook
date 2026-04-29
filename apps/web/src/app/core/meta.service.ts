import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

export interface PageMeta {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
}

/**
 * Centralized SEO header writer.
 * Re-creates the inline meta tags + JSON-LD that the legacy static pages had,
 * but as a per-route service that runs during SSR so crawlers see filled values.
 */
@Injectable({ providedIn: 'root' })
export class MetaService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc = inject(DOCUMENT);

  set(meta: PageMeta): void {
    const fullTitle = meta.title;
    const description = meta.description ?? '';
    const url = `${environment.siteUrl}${meta.canonicalPath ?? '/'}`;
    const ogImage = meta.ogImage ?? `${environment.siteUrl}/assets/og-image.png`;

    this.title.setTitle(fullTitle);
    this.upsertName('description', description);
    this.upsertName('robots', 'index, follow');

    this.upsertProperty('og:type', meta.type ?? 'website');
    this.upsertProperty('og:url', url);
    this.upsertProperty('og:title', fullTitle);
    this.upsertProperty('og:description', description);
    this.upsertProperty('og:image', ogImage);

    this.upsertProperty('twitter:card', 'summary_large_image');
    this.upsertProperty('twitter:url', url);
    this.upsertProperty('twitter:title', fullTitle);
    this.upsertProperty('twitter:description', description);
    this.upsertProperty('twitter:image', ogImage);

    this.setCanonical(url);
    this.setJsonLd(meta.jsonLd);
  }

  private upsertName(name: string, content: string): void {
    if (this.meta.getTag(`name="${name}"`)) {
      this.meta.updateTag({ name, content });
    } else {
      this.meta.addTag({ name, content });
    }
  }

  private upsertProperty(property: string, content: string): void {
    if (this.meta.getTag(`property="${property}"`)) {
      this.meta.updateTag({ property, content });
    } else {
      this.meta.addTag({ property, content });
    }
  }

  private setCanonical(url: string): void {
    const head = this.doc.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      head.appendChild(link);
    }
    link.href = url;
  }

  private setJsonLd(data: Record<string, unknown> | undefined): void {
    const head = this.doc.head;
    head
      .querySelectorAll('script[data-md-jsonld="true"]')
      .forEach((node) => node.parentNode?.removeChild(node));
    if (!data) return;
    const script = this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-md-jsonld', 'true');
    script.text = JSON.stringify(data);
    head.appendChild(script);
  }
}
