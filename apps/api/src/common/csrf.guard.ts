import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

const CSRF_COOKIE = 'mc_csrf';
const CSRF_HEADER = 'x-csrf-token';
const SKIP_CSRF = 'skip-csrf';

/** Decorator: opt OUT of CSRF for a specific endpoint (e.g. webhooks). */
export const SkipCsrf = (): MethodDecorator => SetMetadata(SKIP_CSRF, true);

/**
 * Double-submit-cookie CSRF guard.
 *
 * For state-changing methods we require:
 *   header(X-CSRF-Token) === cookie(mc_csrf)  AND  cookie is non-empty.
 *
 * This stops cross-site forgers because:
 *   - they cannot read the `mc_csrf` cookie (it's same-origin, and although
 *     it's not HttpOnly so JS *here* can echo it, JS on `evil.com` cannot).
 *   - their forged request will not be able to add the matching header.
 *
 * Authentication endpoints that *create* a session (e.g. POST /auth/login)
 * are exempted via @SkipCsrf() because no session yet exists. The login
 * response itself sets `mc_csrf`.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true;

    const cookieToken = (req.cookies?.[CSRF_COOKIE] as string | undefined) ?? '';
    const headerToken = (req.headers[CSRF_HEADER] as string | undefined) ?? '';
    if (!cookieToken || !headerToken || !timingSafeEqual(cookieToken, headerToken)) {
      throw new ForbiddenException('Invalid CSRF token');
    }
    return true;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
