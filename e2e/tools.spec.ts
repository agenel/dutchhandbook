import { test, expect } from '@playwright/test';

test.describe('Tools Pages', () => {
  const tools = [
    { path: '/tools/verb-explorer', name: 'Verb Explorer' },
    { path: '/tools/de-het', name: 'De/Het' },
    { path: '/tools/quiz', name: 'Grammar Quiz' },
    { path: '/tools/sentence-builder', name: 'Sentence Builder' },
    { path: '/tools/flashcards', name: 'Flashcards' },
    { path: '/tools/knm-exam', name: 'KNM Exam' }
  ];

  for (const tool of tools) {
    test(`should render ${tool.name} without crashing`, async ({ page }) => {
      await page.goto(tool.path);

      // Verify the page doesn't throw a 404 or 500 error
      // And the main content container loads
      const mainContent = page.locator('main, .container, .tool-container').first();
      await expect(mainContent).toBeVisible({ timeout: 10000 });

      // Verify no horizontal scrollbar (responsive design check)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    });
  }
});
