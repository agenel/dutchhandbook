import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { MetaService } from './meta.service';

describe('MetaService', () => {
  let service: MetaService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetaService);
    doc = TestBed.inject(DOCUMENT);
    TestBed.inject(Title);
    TestBed.inject(Meta);
  });

  it('sets title, description, canonical, and robots', () => {
    service.set({
      title: 'Test Page — More Dutch',
      description: 'A test description.',
      canonicalPath: '/test',
      robots: 'noindex, follow',
    });
    expect(TestBed.inject(Title).getTitle()).toBe('Test Page — More Dutch');
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'A test description.',
    );
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain('/test');
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
  });
});
