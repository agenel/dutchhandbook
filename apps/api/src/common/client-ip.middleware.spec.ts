import type { Request, Response } from 'express';
import { clientIpMiddleware } from './client-ip.middleware';

function resolve(sharedKey: string | undefined, headers: Record<string, string>, socket = '127.0.0.1') {
  const req = { headers, socket: { remoteAddress: socket } } as unknown as Request;
  clientIpMiddleware(sharedKey)(req, {} as Response, () => undefined);
  return req.ip;
}

describe('clientIpMiddleware', () => {
  const KEY = 'secret-proxy-key-0123456789';

  it('trusts the edge-provided IP when the proxy key matches', () => {
    expect(
      resolve(KEY, { 'x-md-proxy-key': KEY, 'x-md-client-ip': '203.0.113.7', 'x-real-ip': '162.158.1.1' }),
    ).toBe('203.0.113.7');
  });

  it('ignores a spoofed edge IP when the key is wrong', () => {
    expect(
      resolve(KEY, { 'x-md-proxy-key': 'guess', 'x-md-client-ip': '6.6.6.6', 'x-real-ip': '198.51.100.9' }),
    ).toBe('198.51.100.9');
  });

  it('ignores the edge IP entirely when no key is configured', () => {
    expect(
      resolve(undefined, { 'x-md-proxy-key': '', 'x-md-client-ip': '6.6.6.6', 'x-real-ip': '198.51.100.9' }),
    ).toBe('198.51.100.9');
  });

  it('falls back to the socket address without any proxy headers', () => {
    expect(resolve(KEY, {}, '::1')).toBe('::1');
  });
});
