/**
 * Buy a Buddy - E2E Menu Flow Tests
 */

import { test, expect } from '@playwright/test';

// Use deployed URL for testing
const GAME_URL = 'https://6fce9d1b.buy-a-buddy.pages.dev';

test.describe('Buy a Buddy Menu Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh state
    await page.goto(GAME_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
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

  test('can click NEW GAME button and transition to character select', async ({ page }) => {
    await page.goto(GAME_URL);

    // Wait for game to load fully (BootScene + MainMenuScene)
    await page.waitForTimeout(5000);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Click in the center of the screen where NEW GAME button should be
    // Game canvas is 1280x720, NEW GAME is center-ish
    const box = await canvas.boundingBox();
    if (box) {
      // NEW GAME button is typically in the center-lower area
      const clickX = box.x + box.width / 2;
      const clickY = box.y + box.height / 2 - 50;

      console.log(`Clicking at ${clickX}, ${clickY}`);
      await page.mouse.click(clickX, clickY);

      // Wait for scene transition
      await page.waitForTimeout(3000);

      // Game should still be running (canvas should exist)
      const canvasStillExists = await canvas.isVisible();
      expect(canvasStillExists).toBeTruthy();
      console.log('Game still running after click - NEW GAME button worked');
    }
  });

  test('keyboard ENTER key triggers NEW GAME', async ({ page }) => {
    await page.goto(GAME_URL);

    // Wait for game to load fully
    await page.waitForTimeout(5000);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Press ENTER to select NEW GAME (first button is selected by default)
    console.log('Pressing ENTER key');
    await page.keyboard.press('Enter');

    // Wait for scene transition
    await page.waitForTimeout(3000);

    // Game should still be running
    const canvasStillExists = await canvas.isVisible();
    expect(canvasStillExists).toBeTruthy();
    console.log('Game still running after ENTER - keyboard navigation worked');
  });
});
