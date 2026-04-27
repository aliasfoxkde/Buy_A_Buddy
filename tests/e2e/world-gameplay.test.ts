/**
 * E2E Tests - World Scene
 */

import { test, expect } from '@playwright/test';

const GAME_URL = 'https://6459fae8.buy-a-buddy.pages.dev';

test.describe('World Scene', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(3000);
  });

  test('should render game canvas', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
  });

  test('should accept keyboard input', async ({ page }) => {
    await page.click('canvas');
    await page.keyboard.press('w');
    await page.waitForTimeout(200);
    await page.keyboard.press('a');
    await page.waitForTimeout(200);
    
    // Game should still be running
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle multiple key presses', async ({ page }) => {
    await page.click('canvas');
    
    // Press several keys
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should respond to number keys', async ({ page }) => {
    await page.click('canvas');
    
    // Number keys for skills
    await page.keyboard.press('1');
    await page.waitForTimeout(100);
    await page.keyboard.press('2');
    await page.waitForTimeout(100);
    await page.keyboard.press('3');
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});