/**
 * E2E Tests - Character Select
 */

import { test, expect } from '@playwright/test';

test.describe('Character Select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://6c3f4401.buy-a-buddy.pages.dev');
    await page.waitForTimeout(3000);
  });

  test('should render game canvas', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should accept keyboard navigation', async ({ page }) => {
    await page.click('canvas');
    
    // Arrow keys
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowUp');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
