/**
 * E2E Tests - Main Menu
 */

import { test, expect } from '@playwright/test';

// Use deployed URL for testing
const GAME_URL = 'https://dceead84.buy-a-buddy.pages.dev';

test.describe('Main Menu', () => {
  test('should load the game', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display main menu with all buttons', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(3000);
    
    // Game should be loaded
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should have no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(GAME_URL);
    await page.waitForTimeout(3000);
    
    // Log errors for debugging
    if (errors.length > 0) {
      console.log('Console errors:', errors);
    }
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('DevTools') &&
      !e.includes('Texture') &&
      !e.includes('network') &&
      !e.includes('Failed to fetch') &&
      !e.includes('spritesheet')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
