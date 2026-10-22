export const environment = {
  production: true,
  // Same-origin: the Cloudflare Worker proxies /api/* to the API server. Relative
  // also means a locally run production build (wrangler dev) never calls production.
  apiBaseUrl: '/api/v1',
  siteUrl: 'https://moredutch.com',
};
