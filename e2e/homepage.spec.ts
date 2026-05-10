import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and render main header', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/More Dutch/i);

    // Check main navigation/header exists
    const header = page.locator('header, nav, .p-menubar').first();
    await expect(header).toBeVisible();

    // Check main call to action or content exists
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('should have working mobile menu on small screens', async ({ page, isMobile }) => {
    // Only run this test on mobile viewports
    if (!isMobile) test.skip();

    await page.goto('/');

    const menuButton = page.locator('.hub-hamburger').first();
    await expect(menuButton).toBeVisible();

    // Click the menu button to expand
    await menuButton.click();

    // Verify the dropdown or mobile menu panel appears
    const menuContent = page.locator('.hub-mobile-menu').first();
    await expect(menuContent).toBeVisible();
  });
});
