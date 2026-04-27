/**
 * Buy a Buddy - E2E Menu Flow Tests
 */

import { test, expect } from '@playwright/test';

// Use deployed URL for testing
const GAME_URL = 'https://e8445b18.buy-a-buddy.pages.dev';

test.describe('Buy a Buddy Menu Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });
  });

  test('game loads and shows main menu', async ({ page }) => {
    await page.goto(GAME_URL);
    
    // Wait for Phaser to initialize
    await page.waitForTimeout(3000);
    
    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });
    
    console.log('Canvas is visible');
  });

  test('can click NEW GAME button', async ({ page }) => {
    await page.goto(GAME_URL);
    
    // Wait for game to load
    await page.waitForTimeout(4000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Click in the center of the screen where NEW GAME button should be
    const box = await canvas.boundingBox();
    if (box) {
      // NEW GAME button is typically in the center-lower area
      const clickX = box.x + box.width / 2;
      const clickY = box.y + box.height / 2 - 50;
      
      console.log(`Clicking at ${clickX}, ${clickY}`);
      await page.mouse.click(clickX, clickY);
      
      // Wait a bit for scene transition
      await page.waitForTimeout(2000);
      
      // Game should still be running (canvas should exist)
      const canvasStillExists = await canvas.isVisible();
      expect(canvasStillExists).toBeTruthy();
      console.log('Game still running after click');
    }
  });
});
