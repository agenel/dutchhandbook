import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test('login page should render inputs', async ({ page }) => {
    await page.goto('/auth/login');

    // Check for email and password inputs
    const emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"]').first();
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"], input[name="password"], input[id="password"]').first();
    await expect(passwordInput).toBeVisible();

    // Check for submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first();
    await expect(submitBtn).toBeVisible();
  });

  test('register page should render inputs', async ({ page }) => {
    await page.goto('/auth/register');

    const emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"]').first();
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"], input[name="password"], input[id="password"]').first();
    await expect(passwordInput).toBeVisible();

    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")').first();
    await expect(submitBtn).toBeVisible();
  });
});
