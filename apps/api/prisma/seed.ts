import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Seed script: populates the read-only content tables (sheet registry,
 * verbs, nouns, etc.). User accounts are NOT seeded — the only privileged
 * account is the optional `INITIAL_ADMIN_EMAIL` env (which still has to
 * register normally; we only flag it as admin afterwards).
 *
 * Run: `npm run seed`
 */

const prisma = new PrismaClient();

function readJson<T>(rel: string): T {
  const file = path.join(__dirname, 'seed-data', rel);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

async function main() {
  // The current schema doesn't include content-management tables — they were
  // intentionally kept out of v1 so the SPA can keep its bundled JSON assets
  // as the source of truth. This seed exists as a hook for future content
  // tables (Sheet, Verb, Noun, Quiz). For now we just verify the JSON is
  // present and parseable, so the migration -> seed pipeline is wired up.
  const datasets = [
    'verbs.json',
    'verbs-data.json',
    'nouns.json',
    'flashcards.json',
    'quiz.json',
    'sentences.json',
    'sheets.json',
    'sheet-html/index.json',
    ...Array.from({ length: 10 }, (_, i) => `knm/ch${i + 1}.json`),
  ];
  for (const f of datasets) {
    try {
      const data = readJson<unknown[]>(f);
      console.log(`✓ ${f}: ${Array.isArray(data) ? data.length : 'object'} records`);
    } catch (err) {
      console.warn(`! ${f} not found or invalid:`, (err as Error).message);
    }
  }
  console.log('Seed verification complete. Add real seeders here as content tables ship.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
