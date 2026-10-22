import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { csrfInterceptor } from './core/csrf.interceptor';
import { credentialsInterceptor } from './core/credentials.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([credentialsInterceptor, csrfInterceptor])),
    // Reuse the prerendered DOM instead of re-rendering it (no flash / layout shift);
    // clicks made before the app boots are replayed.
    provideClientHydration(withEventReplay()),
  ],
};
