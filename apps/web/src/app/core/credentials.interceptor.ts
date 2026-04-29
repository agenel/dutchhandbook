import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Always send the session cookie when calling our own API.
 * `withCredentials: true` is required for HttpOnly cookie sessions to round-trip.
 *
 * We only attach it for same-origin or our configured api host — never to
 * arbitrary third-party URLs (avoids leaking auth to e.g. fonts.googleapis.com).
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isOurApi(req.url)) return next(req);
  return next(req.clone({ withCredentials: true }));
};

function isOurApi(url: string): boolean {
  if (url.startsWith('/')) return true;
  try {
    return new URL(url).origin === new URL(environment.apiBaseUrl).origin;
  } catch {
    return false;
  }
}
