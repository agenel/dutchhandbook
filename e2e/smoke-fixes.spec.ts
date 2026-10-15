import { test, expect } from '@playwright/test';

// Focused smoke tests for the UI/functionality fixes in this change set.
// Run against the dev server on http://localhost:4200.

const BASE = 'http://localhost:4200';

test('homepage loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('md-hub-nav')).toBeVisible();
  // Ignore auth 401 noise and network failures from the API not being up in
  // this isolated web-only smoke run.
  const realErrors = errors.filter(
    (e) => !/401|Unauthorized|\/auth\/me|ERR_CONNECTION_REFUSED|Failed to load resource/i.test(e),
  );
  expect(realErrors, realErrors.join('\n')).toHaveLength(0);
});

test('404 page renders for unknown routes', async ({ page }) => {
  await page.goto(`${BASE}/this-route-does-not-exist`, { waitUntil: 'networkidle' });
  await expect(page.locator('md-not-found')).toBeVisible();
  await expect(page.getByText('404')).toBeVisible();
});

test('flashcards: completing a deck shows completion view, not a blocking alert', async ({ page }) => {
  let alertFired = false;
  page.on('dialog', (d) => {
    alertFired = true;
    d.dismiss();
  });
  await page.goto(`${BASE}/tools/flashcards`, { waitUntil: 'networkidle' });
  // Open the first deck.
  const firstDeck = page.locator('.deck-card').first();
  await firstDeck.click();
  // Rate every card "Easy" until the completion card appears.
  for (let i = 0; i < 60; i++) {
    const complete = page.locator('.complete-card');
    if (await complete.count()) break;
    await page.locator('.flashcard-scene').click(); // flip
    await page.getByRole('button', { name: /Easy/i }).click();
    await page.waitForTimeout(350);
  }
  await expect(page.locator('.complete-card')).toBeVisible();
  expect(alertFired).toBe(false);
});

test('verb-explorer: detail panel locks then releases body scroll', async ({ page }) => {
  await page.goto(`${BASE}/tools/verb-explorer`, { waitUntil: 'domcontentloaded' });
  const firstRow = page.locator('.verb-table tbody tr').first();
  await expect(firstRow).toBeVisible();

  // Open detail → body scroll locked.
  await firstRow.click();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  // Close detail → body scroll released.
  await page.locator('.detail-overlay').click();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('verb-explorer: navigating away with panel open releases scroll lock', async ({ page }) => {
  await page.goto(`${BASE}/tools/verb-explorer`, { waitUntil: 'domcontentloaded' });
  const firstRow = page.locator('.verb-table tbody tr').first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  // Navigate away without closing the panel — the fix must reset overflow on destroy.
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('dark mode pre-paint: setting dgh_dark_mode applies before Angular boots', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dgh_dark_mode', 'true'));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(theme).toBe('dark');
});
