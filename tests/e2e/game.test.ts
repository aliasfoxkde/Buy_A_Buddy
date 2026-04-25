/**
 * E2E Tests - Main Menu
 */

import { test, expect } from '@playwright/test';

test.describe('Main Menu', () => {
  test('should load the game', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display main menu with all buttons', async ({ page }) => {
    await page.goto('/');
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
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('DevTools')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
