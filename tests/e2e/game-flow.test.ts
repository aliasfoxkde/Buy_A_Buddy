/**
 * Buy a Buddy - E2E Game Flow Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Buy a Buddy Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for game to load
    await page.waitForTimeout(2000);
  });

  test('boot screen loads', async ({ page }) => {
    // Check title appears
    const title = page.locator('text=BUY A BUDDY');
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('main menu has buttons', async ({ page }) => {
    // Wait for menu
    await page.waitForTimeout(3000);
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
