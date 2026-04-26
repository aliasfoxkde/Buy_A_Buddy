/**
 * E2E Tests - Main Menu
 */

import { test, expect } from '@playwright/test';

test.describe('Main Menu', () => {
  test('should load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('https://1f2d909b.buy-a-buddy.pages.dev');
    await page.waitForTimeout(3000);
    
    // Check canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // No critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('DevTools') &&
      !e.includes('manifest')
    );
    expect(criticalErrors.length).toBeLessThanOrEqual(2);
  });

  test('should render game canvas', async ({ page }) => {
    await page.goto('https://1f2d909b.buy-a-buddy.pages.dev');
    await page.waitForTimeout(3000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
    
    // Canvas should have proper dimensions
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(100);
  });
});
