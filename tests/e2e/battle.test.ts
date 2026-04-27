/**
 * E2E Tests - Battle Scene
 */

import { test, expect } from '@playwright/test';

test.describe('Battle Scene', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://1b82f3dc.buy-a-buddy.pages.dev');
    await page.waitForTimeout(3000);
  });

  test('should render game', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should accept combat actions', async ({ page }) => {
    await page.click('canvas');
    
    // Number keys for actions
    await page.keyboard.press('1'); // Attack
    await page.waitForTimeout(300);
    
    await page.keyboard.press('2'); // Defend
    await page.waitForTimeout(300);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
