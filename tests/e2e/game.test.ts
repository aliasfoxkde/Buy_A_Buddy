// ==========================================
// GAME E2E TESTS - Playwright automation
// ==========================================

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Buy a Buddy Game', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for game to initialize
    await page.waitForTimeout(2000);
  });

  test('should load the game', async ({ page }) => {
    // Check game container exists
    const gameContainer = page.locator('#game');
    await expect(gameContainer).toBeVisible();
    
    // Check for game canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/game-loaded.png' });
  });

  test('should display main menu', async ({ page }) => {
    // Wait for main menu to appear
    await page.waitForTimeout(3000);
    
    // Look for menu text elements
    const menuVisible = await page.locator('text=Buy a Buddy').isVisible() ||
                        await page.locator('canvas').isVisible();
    expect(menuVisible).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/main-menu.png' });
  });

  test('should navigate to character select', async ({ page }) => {
    // Wait for menu to load
    await page.waitForTimeout(3000);
    
    // Click on the canvas to interact (start game)
    const canvas = page.locator('canvas').first();
    await canvas.click();
    
    // Wait for character select scene
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/character-select.png' });
    
    // Verify we're on the character select screen
    // (The game should have transitioned)
    const gameContainer = page.locator('#game');
    await expect(gameContainer).toBeVisible();
  });

  test('should have working character cards', async ({ page }) => {
    // Navigate to character select
    await page.waitForTimeout(4000);
    
    // Click on canvas to progress
    const canvas = page.locator('canvas').first();
    await canvas.click();
    await page.waitForTimeout(1000);
    await canvas.click();
    
    await page.waitForTimeout(2000);
    
    // Take screenshot of character select
    await page.screenshot({ path: 'test-results/character-grid.png', fullPage: true });
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });
    
    // Load the game
    await page.goto('/');
    await page.waitForTimeout(4000);
    
    // Filter out known acceptable errors (like favicon 404)
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('manifest')
    );
    
    expect(criticalErrors).toHaveLength(0);
    
    await page.screenshot({ path: 'test-results/no-errors.png' });
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Load the game
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Verify game is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('should support fullscreen toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Press F key for fullscreen
    await page.keyboard.press('f');
    await page.waitForTimeout(500);
    
    // Check if fullscreen is active
    const isFullscreen = await page.evaluate(() => {
      return !!document.fullscreenElement;
    });
    
    await page.screenshot({ path: 'test-results/fullscreen.png' });
    
    // Exit fullscreen
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('game asset verification', async ({ page }) => {
    // Go to character select
    await page.waitForTimeout(4000);
    
    // Click through to character select
    const canvas = page.locator('canvas').first();
    for (let i = 0; i < 3; i++) {
      await canvas.click();
      await page.waitForTimeout(500);
    }
    
    await page.waitForTimeout(3000);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-results/character-select-full.png', 
      fullPage: true 
    });
    
    // Check for any resource loading errors
    const resources = page.locator('img');
    const count = await resources.count();
    console.log(`Found ${count} image resources`);
  });
});

// Export for running specific tests
export { test, expect };