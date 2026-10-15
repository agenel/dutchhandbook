/**
 * More Dutch frontend Worker (Cloudflare Workers + Static Assets).
 *
 * Only runs first for /api/* (see run_worker_first in wrangler.jsonc). It
 * reverse-proxies those requests to the NestJS API on Render so the browser
 * always talks to a single origin (moredutch.com) — which keeps the session
 * cookies and the JS-readable CSRF token working. Everything else is served
 * straight from the static assets, with SPA fallback to index.html.
 */
const API_ORIGIN = 'https://dutchhandbook.onrender.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const target = API_ORIGIN + url.pathname + url.search;
      // Preserve method, headers (incl. Cookie), and body; don't auto-follow
      // redirects so the API's own responses pass through unchanged.
      return fetch(new Request(target, request), { redirect: 'manual' });
    }

    // Non-API request reached the Worker: hand it to the static-asset server.
    return env.ASSETS.fetch(request);
  },
};
