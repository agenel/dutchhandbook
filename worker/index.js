/**
 * More Dutch frontend Worker (Cloudflare Workers + Static Assets).
 *
 * Only runs first for /api/* (see run_worker_first in wrangler.jsonc). It
 * reverse-proxies those requests to the NestJS API on Render so the browser
 * always talks to a single origin (moredutch.com) — which keeps the session
 * cookies and the JS-readable CSRF token working. Everything else is served
 * straight from the static assets, with SPA fallback to index.html.
 */
const DEFAULT_API_ORIGIN = 'https://api.moredutch.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      // API_ORIGIN can be overridden for local testing (`wrangler dev --var API_ORIGIN:...`).
      const target = (env.API_ORIGIN || DEFAULT_API_ORIGIN) + url.pathname + url.search;
      // Preserve method, headers (incl. Cookie), and body. Pass the visitor's
      // real IP (CF-Connecting-IP is set by Cloudflare's edge and can't be
      // spoofed by the client) plus a shared key, so the API can rate-limit
      // per visitor instead of seeing every request as the proxy's IP.
      const headers = new Headers(request.headers);
      headers.set('x-md-client-ip', request.headers.get('cf-connecting-ip') ?? '');
      if (env.MD_PROXY_KEY) headers.set('x-md-proxy-key', env.MD_PROXY_KEY);
      const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
      // Don't auto-follow redirects so the API's own responses pass through unchanged.
      return fetch(target, {
        method: request.method,
        headers,
        body: hasBody ? request.body : undefined,
        redirect: 'manual',
      });
    }

    // The homepage is prerendered, but /index.html must stay the client-only app
    // shell because it is also the SPA fallback for account pages (/profile,
    // /auth/*, /admin) — hydrating the prerendered home there would break them.
    // So the build moves the prerendered home to /_home/ and we serve it for "/".
    if (url.pathname === '/') {
      return env.ASSETS.fetch(new Request(new URL('/_home', url), request));
    }

    // Any other request that reached the Worker: hand it to the static-asset server.
    return env.ASSETS.fetch(request);
  },
};
