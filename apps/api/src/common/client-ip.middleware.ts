import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Resolve the real visitor IP and expose it as `req.ip`.
 *
 * The API sits behind nginx (and, for site traffic, the Cloudflare Worker), so
 * the socket peer is always 127.0.0.1. Without this, every visitor shares one
 * rate-limit bucket and audit logs / lastLoginIp record the proxy, not the user.
 *
 * Trust order:
 *  1. `x-md-client-ip` — set by our Cloudflare Worker from CF-Connecting-IP, and
 *     only trusted when `x-md-proxy-key` matches the shared secret (so a request
 *     sent straight to api.moredutch.com can't spoof it).
 *  2. `x-real-ip` — set by nginx to the TCP peer; nginx overwrites any
 *     client-supplied value, and port 3000 isn't publicly reachable.
 *  3. The socket address (local development, no proxy).
 *
 * Overriding `req.ip` on the instance means ThrottlerGuard, the audit log, and
 * session/login IP tracking all pick up the resolved value with no other changes.
 */
export function clientIpMiddleware(sharedKey: string | undefined) {
  const expected = sharedKey ? Buffer.from(sharedKey) : null;

  const keyMatches = (provided: unknown): boolean => {
    if (!expected || typeof provided !== 'string') return false;
    const got = Buffer.from(provided);
    return got.length === expected.length && timingSafeEqual(got, expected);
  };

  return (req: Request, _res: Response, next: NextFunction) => {
    const header = (name: string) => {
      const v = req.headers[name];
      return (Array.isArray(v) ? v[0] : v)?.trim() ?? '';
    };

    const fromEdge = keyMatches(req.headers['x-md-proxy-key']) ? header('x-md-client-ip') : '';
    const resolved = fromEdge || header('x-real-ip') || req.socket.remoteAddress || '';

    Object.defineProperty(req, 'ip', { value: resolved, configurable: true });
    next();
  };
}
