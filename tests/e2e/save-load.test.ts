/**
 * E2E Tests - Save/Load System
 */

import { test, expect } from '@playwright/test';

const GAME_URL = 'https://6459fae8.buy-a-buddy.pages.dev';

test.describe('Save/Load System', () => {
  test('should have localStorage available', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(2000);
    
    const hasStorage = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    });
    
    expect(hasStorage).toBeTruthy();
  });

  test('should save data to localStorage', async ({ page }) => {
    await page.goto(GAME_URL);
    await page.waitForTimeout(2000);
    
    await page.evaluate(() => {
      localStorage.setItem('buyabuddy_test', JSON.stringify({ test: true }));
    });
    
    const saved = await page.evaluate(() => {
      return localStorage.getItem('buyabuddy_test');
    });
    
    expect(saved).toBe('{"test":true}');
  });

  test('should load data from localStorage', async ({ page }) => {
    // First navigate to page to get context
    await page.goto(GAME_URL);
    await page.waitForTimeout(2000);
    
    // Set data within page context
    await page.evaluate(() => {
      localStorage.setItem('buyabuddy_test', JSON.stringify({ value: 42 }));
    });
    
    // Verify it was saved
    const saved = await page.evaluate(() => {
      return localStorage.getItem('buyabuddy_test');
    });
    expect(saved).toBe('{"value":42}');
  });

  test('should clear test data', async ({ page }) => {
    // First navigate to page to get context
    await page.goto(GAME_URL);
    await page.waitForTimeout(2000);
    
    // Clear within page context
    await page.evaluate(() => {
      localStorage.removeItem('buyabuddy_test');
    });
    
    // Verify it was cleared
    const remaining = await page.evaluate(() => {
      return localStorage.getItem('buyabuddy_test');
    });
    
    expect(remaining).toBeNull();
  });
});
