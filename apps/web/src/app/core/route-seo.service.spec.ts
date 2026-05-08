import { Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { MetaService } from './meta.service';
import { RouteSeoService } from './route-seo.service';

@Component({ standalone: true, template: '' })
class SeoDummyComponent {}

const testRoutes: Routes = [
  {
    path: 'help',
    component: SeoDummyComponent,
    data: {
      title: 'Learning Guide — More Dutch',
      description: 'Guide text.',
      canonicalPath: '/help',
    },
  },
];

describe('RouteSeoService', () => {
  it('applies meta from route data after navigation', fakeAsync(() => {
    const metaSpy = jasmine.createSpyObj<MetaService>('MetaService', ['set']);
    TestBed.configureTestingModule({
      imports: [SeoDummyComponent],
      providers: [
        provideRouter(testRoutes),
        { provide: MetaService, useValue: metaSpy },
        RouteSeoService,
      ],
    });

    TestBed.inject(RouteSeoService);
    const router = TestBed.inject(Router);
    router.initialNavigation();
    tick();

    router.navigateByUrl('/help');
    tick();
    expect(metaSpy.set).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Learning Guide — More Dutch',
        description: 'Guide text.',
        canonicalPath: '/help',
      }),
    );
  }));
});
