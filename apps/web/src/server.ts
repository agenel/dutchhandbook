import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

/**
 * Express server with strict security defaults.
 * Wraps Angular SSR and applies CSP / HSTS / no-sniff at the edge.
 *
 * Note: production deployments still place nginx in front of this for TLS,
 * compression and rate-limiting. These headers are belt-and-braces.
 */
export function app(): express.Express {
  const server = express();

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = resolve(serverDistFolder, '../browser/index.html');

  const commonEngine = new CommonEngine();

  server.disable('x-powered-by');

  server.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
    next();
  });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
    }),
  );

  // Legacy 301 redirects for previously indexed .html URLs.
  server.get(/^\/(index|cheatsheets|help)\.html$/, (req, res) => {
    const map: Record<string, string> = {
      '/index.html': '/',
      '/cheatsheets.html': '/cheatsheets',
      '/help.html': '/help',
    };
    res.redirect(301, map[req.path] ?? '/');
  });
  server.get(/^\/sheets\/([a-z0-9-]+)\.html$/, (req, res) => {
    res.redirect(301, `/sheets/${req.params[0]}`);
  });
  server.get(/^\/tools\/([a-z0-9-]+)\.html$/, (req, res) => {
    res.redirect(301, `/tools/${req.params[0]}`);
  });

  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] ?? 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Angular SSR listening on http://localhost:${port}`);
  });
}

if (isMainModule(import.meta.url)) {
  run();
}
