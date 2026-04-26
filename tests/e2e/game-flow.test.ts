/**
 * Buy a Buddy - E2E Game Flow Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Buy a Buddy Game Flow', () => {
  const baseUrl = 'https://82dac3a9.buy-a-buddy.pages.dev';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForTimeout(3000);
  });

  test('boot screen loads - canvas visible', async ({ page }) => {
    // Wait for Phaser to initialize
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
  });

  test('game canvas has size', async ({ page }) => {
    // Wait for Phaser to initialize
    await page.waitForTimeout(3000);
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    // Check canvas has reasonable size
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  });
});
