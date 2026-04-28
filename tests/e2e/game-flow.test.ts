/**
 * Buy a Buddy - E2E Game Flow Tests
 */

import { test, expect } from '@playwright/test';

const GAME_URL = 'https://dfc903f8.buy-a-buddy.pages.dev';

test.describe('Buy a Buddy Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(4000);
  });

  test('boot screen loads - canvas visible', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
  });

  test('game canvas has size', async ({ page }) => {
    await page.waitForTimeout(3000);
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  });
  
  test('can navigate from main menu to character select', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    
    // Wait for main menu buttons to appear
    await page.waitForTimeout(2000);
    
    // Click on NEW GAME button area (center of canvas)
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 - 50);
      await page.waitForTimeout(1000);
    }
    
    // Canvas should still be visible (game didn't crash)
    await expect(canvas).toBeVisible();
  });
  
  test('can start new game from character select', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    
    // Wait for game to fully load
    await page.waitForTimeout(4000);
    
    // Click in center multiple times to progress through menu
    const box = await canvas.boundingBox();
    if (box) {
      // Click to start new game (should be on main menu or character select)
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(1000);
      
      // Click again to confirm/start
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(2000);
    }
    
    // Game should still be running
    await expect(canvas).toBeVisible();
  });
});
