import { test, expect } from '@playwright/test';

test.describe('Mobile View Functionality', () => {
  test('homepage renders and navigation menu works', async ({ page }) => {
    await page.goto('/');

    // Ensure the page title is correct (or at least page loaded)
    await expect(page).toHaveTitle(/More Dutch/i);

    // Verify there is no horizontal scrollbar by evaluating scrollWidth vs innerWidth
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

    // Find the mobile hamburger menu icon (the exact selector depends on PrimeNG/Angular UI)
    // usually it has a class like p-menubar-button or a common ID.
    // We can click on it by looking for the nav toggle
    const menuButton = page.locator('.p-menubar-button, .mobile-menu-toggle, [aria-label="Menu"]');
    if (await menuButton.count() > 0) {
      await menuButton.click();
      
      // Wait for the menu to appear
      const menu = page.locator('.p-menubar-root-list, .mobile-menu-content');
      await expect(menu).toBeVisible();

      // Click on a tool link like Grammar Quiz or De/Het
      const toolLink = menu.locator('a:has-text("Grammar Quiz"), a:has-text("De/Het")').first();
      if (await toolLink.count() > 0) {
        await toolLink.click();
        
        // Ensure the tool page loads
        await expect(page).toHaveURL(/.*tools.*/);
      }
    }
  });

  test('grammar quiz tool renders on mobile', async ({ page }) => {
    // Navigate directly to the tool page to test its responsiveness
    await page.goto('/tools/quiz');

    // Make sure the main content is visible
    const mainContent = page.locator('main, .container, .tool-container').first();
    await expect(mainContent).toBeVisible();

    // Verify again no horizontal scrolling
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
});
