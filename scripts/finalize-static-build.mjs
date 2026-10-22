#!/usr/bin/env node
/**
 * Post-build step for the prerendered (outputMode: "static") Angular build.
 *
 * Angular writes the prerendered homepage to browser/index.html and the
 * client-only app shell to browser/index.csr.html. Cloudflare's SPA fallback
 * always serves /index.html for routes that aren't files (account pages,
 * unknown URLs), so that file must be the client shell. We move the
 * prerendered home to browser/_home/index.html, which the Worker serves for "/".
 */
import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const browser = join(root, 'apps/web/dist/web/browser');
const shell = join(browser, 'index.csr.html');
const home = join(browser, 'index.html');

if (!existsSync(shell)) {
  console.log('finalize-static-build: no index.csr.html (not a prerendered build) — nothing to do');
  process.exit(0);
}
mkdirSync(join(browser, '_home'), { recursive: true });
renameSync(home, join(browser, '_home/index.html'));
renameSync(shell, home);
console.log('finalize-static-build: prerendered home -> /_home/index.html, app shell -> /index.html');
