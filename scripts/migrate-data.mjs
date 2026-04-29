#!/usr/bin/env node
/**
 * One-shot data migration.
 *
 * The legacy site shipped its data as plain `<script>` tags assigning
 * arrays/objects to `window.SOMETHING_X = [ ... ]`. We need that data in two
 * places now:
 *
 *   1. As bundled JSON assets the Angular app fetches at runtime.
 *   2. As Prisma seeds the API uses to populate Postgres.
 *
 * This script reads each legacy file, extracts everything after the first
 * `=` sign, evaluates it in a sandboxed VM context (so we trust *our own*
 * data — never run this against untrusted JS), and writes it as JSON.
 *
 * Run with: `node scripts/migrate-data.mjs`
 */

import { promises as fs } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LEGACY_DATA = join(ROOT, 'legacy', 'data');
const WEB_ASSETS = join(ROOT, 'apps', 'web', 'public', 'assets', 'data');
const KNM_ASSETS = join(WEB_ASSETS, 'knm');
const SHEET_HTML_ASSETS = join(WEB_ASSETS, 'sheet-html');
const SEED_OUT = join(ROOT, 'apps', 'api', 'prisma', 'seed-data');
const SHEET_HTML_SEED = join(SEED_OUT, 'sheet-html');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function evalLegacy(file, globalNames) {
  const src = await fs.readFile(file, 'utf8');
  // Each legacy file looks like `window.X = [...];` — sometimes multiple.
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(src, ctx, { filename: relative(ROOT, file), timeout: 5000 });
  const out = {};
  for (const name of globalNames) {
    if (ctx.window[name] !== undefined) out[name] = ctx.window[name];
  }
  return out;
}

async function writeJson(file, data) {
  await ensureDir(dirname(file));
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
  console.log('  ->', relative(ROOT, file), `(${JSON.stringify(data).length} bytes)`);
}

async function writeText(file, text) {
  await ensureDir(dirname(file));
  await fs.writeFile(file, text.trim() + '\n');
  console.log('  ->', relative(ROOT, file), `(${text.length} bytes)`);
}

async function copyVerbsJson() {
  const src = join(LEGACY_DATA, 'verbs.json');
  const dst = join(WEB_ASSETS, 'verbs.json');
  try {
    const txt = await fs.readFile(src, 'utf8');
    const parsed = JSON.parse(txt);
    await writeJson(dst, parsed);
    await writeJson(join(SEED_OUT, 'verbs.json'), parsed);
  } catch (err) {
    console.warn('  (skipping verbs.json — not found)', err.message);
  }
}

async function migrateVerbsData() {
  const globals = await evalLegacy(join(LEGACY_DATA, 'verbs-data.js'), [
    'DUTCH_VERBS',
    'COMMON_VERBS',
    'VERBS_DATA',
  ]);
  const data = globals.DUTCH_VERBS ?? globals.COMMON_VERBS ?? globals.VERBS_DATA ?? null;
  if (!data) {
    console.warn('  (no verbs-data global found)');
    return;
  }
  await writeJson(join(WEB_ASSETS, 'verbs-data.json'), data);
  await writeJson(join(SEED_OUT, 'verbs-data.json'), data);
  // Keep the SPA verb payload byte-for-byte complete with the legacy data.
  // The explorer needs rank, helper, examples and full conjugation groups.
  await writeJson(join(WEB_ASSETS, 'verbs.json'), data);
}

async function migrateNouns() {
  const { DUTCH_NOUNS } = await evalLegacy(join(LEGACY_DATA, 'nouns-data.js'), ['DUTCH_NOUNS']);
  if (!DUTCH_NOUNS) return;
  await writeJson(join(WEB_ASSETS, 'nouns.json'), DUTCH_NOUNS);
  await writeJson(join(SEED_OUT, 'nouns.json'), DUTCH_NOUNS);
}

async function migrateFlashcards() {
  const { DUTCH_FLASHCARDS } = await evalLegacy(join(LEGACY_DATA, 'flashcards-data.js'), [
    'DUTCH_FLASHCARDS',
  ]);
  if (!DUTCH_FLASHCARDS) return;
  await writeJson(join(WEB_ASSETS, 'flashcards.json'), DUTCH_FLASHCARDS);
  await writeJson(join(SEED_OUT, 'flashcards.json'), DUTCH_FLASHCARDS);
}

async function migrateQuiz() {
  const { DUTCH_QUIZ_DATA } = await evalLegacy(join(LEGACY_DATA, 'quiz-data.js'), [
    'DUTCH_QUIZ_DATA',
  ]);
  if (!DUTCH_QUIZ_DATA) return;
  // Flatten the categories into a single list of questions for the simple
  // /tools/quiz UI; categories are preserved in the seed payload.
  const flat = DUTCH_QUIZ_DATA.flatMap((cat) =>
    cat.questions.map((q, i) => ({
      id: `${cat.id}-${i}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correct,
      explanation: q.explanation,
      category: cat.category,
    })),
  );
  await writeJson(join(WEB_ASSETS, 'quiz.json'), flat);
  await writeJson(join(SEED_OUT, 'quiz.json'), DUTCH_QUIZ_DATA);
}

async function migrateSentences() {
  const { DUTCH_SENTENCE_DATA } = await evalLegacy(join(LEGACY_DATA, 'sentence-data.js'), [
    'DUTCH_SENTENCE_DATA',
  ]);
  if (!DUTCH_SENTENCE_DATA) return;
  // Same flattening for the SentenceBuilder UI.
  const flat = DUTCH_SENTENCE_DATA.flatMap((cat, ci) =>
    cat.sentences.map((s, si) => ({
      id: `s-${ci}-${si}`,
      english: s.translation,
      words: s.correct,
      rule: cat.category,
      explanation: s.explanation,
    })),
  );
  await writeJson(join(WEB_ASSETS, 'sentences.json'), flat);
  await writeJson(join(SEED_OUT, 'sentences.json'), DUTCH_SENTENCE_DATA);
}

async function migrateSheetsRegistry() {
  const { DUTCH_SHEETS } = await evalLegacy(join(LEGACY_DATA, 'sheets-data.js'), [
    'DUTCH_SHEETS',
  ]);
  const sharedRegistry = await readSharedSheetRegistry();
  const data =
    sharedRegistry.length >= (DUTCH_SHEETS?.length ?? 0)
      ? sharedRegistry
      : (DUTCH_SHEETS ?? []);
  if (!data.length) return;
  await writeJson(join(WEB_ASSETS, 'sheets.json'), data);
  await writeJson(join(SEED_OUT, 'sheets.json'), data);
}

async function readSharedSheetRegistry() {
  const src = await fs.readFile(
    join(ROOT, 'packages', 'shared', 'src', 'types', 'sheet.ts'),
    'utf8',
  );
  const match = src.match(/export const SHEET_REGISTRY: SheetMeta\[] = (\[[\s\S]*?\]);/);
  if (!match) return [];
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(`registry = ${match[1]}`, ctx, {
    filename: 'packages/shared/src/types/sheet.ts',
    timeout: 5000,
  });
  return ctx.registry ?? [];
}

function rewriteLegacyLinks(html) {
  return html
    .replace(/href="(?:\.\.\/)?index\.html"/g, 'href="/"')
    .replace(/href="(?:\.\.\/)?cheatsheets\.html"/g, 'href="/cheatsheets"')
    .replace(/href="(?:\.\.\/)?help\.html"/g, 'href="/help"')
    .replace(/href="(?:\.\.\/)?tools\/([^"]+)\.html"/g, 'href="/tools/$1"')
    .replace(/href="([^"\/.]+)\.html"/g, 'href="/sheets/$1"')
    .replace(/href="(?:\.\.\/)?sheets\/([^"]+)\.html"/g, 'href="/sheets/$1"');
}

function stripDocumentChrome(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<title[\s\S]*?<\/title>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .trim();
}

function extractDivAt(html, start) {
  if (start < 0) return '';
  const tagPattern = /<\/?div\b[^>]*>/gi;
  tagPattern.lastIndex = start;
  let depth = 0;
  let match;

  while ((match = tagPattern.exec(html))) {
    if (match[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) return html.slice(start, tagPattern.lastIndex);
    } else {
      depth += 1;
    }
  }

  return '';
}

async function migrateSheetHtml() {
  const sheetsDir = join(ROOT, 'legacy', 'sheets');
  const files = (await fs.readdir(sheetsDir)).filter((file) => file.endsWith('.html')).sort();
  const index = [];

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    const src = await fs.readFile(join(sheetsDir, file), 'utf8');
    const styles = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
      .map((match) => `<style>${match[1].trim()}</style>`)
      .join('\n');
    const pageStart = src.search(/<div class="page"[^>]*>/);
    const helpStart = pageStart >= 0 ? src.lastIndexOf('<div class="help-modal"', pageStart) : -1;
    const helpModal = helpStart >= 0 ? stripDocumentChrome(extractDivAt(src, helpStart)) : '';
    const page = src.match(/<div class="page"[^>]*>([\s\S]*?)<\/div>\s*<script/);
    if (!page) {
      console.warn(`  (skipping sheet html ${file}: page wrapper not found)`);
      continue;
    }

    const body = stripDocumentChrome(page[1].replace(/<footer[\s\S]*?<\/footer>/g, ''));
    const html = rewriteLegacyLinks(`${styles}\n${helpModal}\n${body}`);
    await writeText(join(SHEET_HTML_ASSETS, `${slug}.html`), html);
    await writeText(join(SHEET_HTML_SEED, `${slug}.html`), html);
    index.push({ slug, bytes: html.length });
  }

  await writeJson(join(SHEET_HTML_ASSETS, 'index.json'), index);
  await writeJson(join(SHEET_HTML_SEED, 'index.json'), index);
}

async function migrateKnm() {
  const index = [];
  for (let i = 1; i <= 10; i++) {
    const file = join(LEGACY_DATA, 'knm-data', `ch${i}-data.js`);
    try {
      const ctx = { window: {} };
      vm.createContext(ctx);
      const src = await fs.readFile(file, 'utf8');
      vm.runInContext(src, ctx, { filename: relative(ROOT, file), timeout: 5000 });
      // Each chapter sets window.KNM_CHAPTER_<n> or similar — pick the first
      // array we find on `window`.
      const chapter = Object.values(ctx.window).find((v) => Array.isArray(v));
      if (!chapter) continue;
      // Normalize question shape for the UI.
      const flat = chapter.map((q, idx) => ({
        id: `ch${i}-${idx}`,
        topic: q.topic ?? `Chapter ${i}`,
        question: q.question ?? q.q ?? '',
        options: q.options ?? q.choices ?? [],
        answer: q.answer,
        correctIndex:
          typeof q.correct === 'number'
            ? q.correct
            : typeof q.correctIndex === 'number'
              ? q.correctIndex
              : typeof q.answer === 'string' && Array.isArray(q.options)
                ? q.options.indexOf(q.answer)
              : 0,
      }));
      await writeJson(join(KNM_ASSETS, `ch${i}.json`), flat);
      await writeJson(join(SEED_OUT, 'knm', `ch${i}.json`), chapter);
      index.push({ id: `ch${i}`, title: `Chapter ${i}` });
    } catch (err) {
      console.warn(`  (skipping ch${i}: ${err.message})`);
    }
  }
  await writeJson(join(KNM_ASSETS, 'index.json'), index);
}

async function main() {
  console.log('Migrating legacy data...');
  await ensureDir(WEB_ASSETS);
  await ensureDir(KNM_ASSETS);
  await ensureDir(SHEET_HTML_ASSETS);
  await ensureDir(SEED_OUT);
  await ensureDir(SHEET_HTML_SEED);

  await copyVerbsJson();
  await migrateVerbsData();
  await migrateNouns();
  await migrateFlashcards();
  await migrateQuiz();
  await migrateSentences();
  await migrateSheetsRegistry();
  await migrateSheetHtml();
  await migrateKnm();

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
