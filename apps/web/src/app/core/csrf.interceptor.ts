import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Double-submit-cookie CSRF defense.
 *
 * The API issues a non-HttpOnly cookie named `mc_csrf` containing a random
 * token at session creation. For every state-changing request we read that
 * cookie and echo its value in the `X-CSRF-Token` header. The API verifies
 * cookie === header, so a cross-site request (which can't read our cookies)
 * cannot forge a matching header.
 *
 * Safe verbs (GET / HEAD / OPTIONS) are skipped to avoid breaking caching.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  if (!isBrowser) return next(req);
  const safe = req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';
  if (safe) return next(req);
  if (!isOurApi(req.url)) return next(req);

  const token = readCsrfCookie();
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { 'X-CSRF-Token': token } }));
};

function isOurApi(url: string): boolean {
  if (url.startsWith('/')) return true;
  try {
    return new URL(url).origin === new URL(environment.apiBaseUrl).origin;
  } catch {
    return false;
  }
}

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)mc_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
