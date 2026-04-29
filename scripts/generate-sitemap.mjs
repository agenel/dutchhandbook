#!/usr/bin/env node
/**
 * Generates `sitemap.xml` and `robots.txt` from the canonical route list.
 * Runs after `ng build` so the output lands in `apps/web/dist/web/browser/`.
 */
import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ROUTES_FILE = join(ROOT, 'apps', 'web', 'src', 'prerender-routes.txt');
const OUT_DIR = join(ROOT, 'apps', 'web', 'dist', 'web', 'browser');
const SITE_URL = process.env.SITE_URL ?? 'https://moredutch.com';

async function main() {
  const txt = await fs.readFile(ROUTES_FILE, 'utf8');
  const routes = txt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const today = new Date().toISOString().slice(0, 10);

  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${SITE_URL}${r === '/' ? '' : r}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${r === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
    )
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(join(OUT_DIR, 'sitemap.xml'), sitemap);
  await fs.writeFile(join(OUT_DIR, 'robots.txt'), robots);
  console.log('Wrote sitemap.xml and robots.txt to', OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
