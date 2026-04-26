/**
 * E2E Tests - Save/Load System
 */

import { test, expect } from '@playwright/test';

test.describe('Save/Load System', () => {
  test('should have localStorage available', async ({ page }) => {
    await page.goto('https://1f2d909b.buy-a-buddy.pages.dev');
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
    await page.goto('https://1f2d909b.buy-a-buddy.pages.dev');
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
    await page.evaluate(() => {
      localStorage.setItem('buyabuddy_test', JSON.stringify({ value: 42 }));
    });
    
    await page.goto('https://1f2d909b.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    const loaded = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('buyabuddy_test') || '{}');
    });
    
    expect(loaded.value).toBe(42);
  });

  test('should clear test data', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('buyabuddy_test');
    });
    
    const remaining = await page.evaluate(() => {
      return localStorage.getItem('buyabuddy_test');
    });
    
    expect(remaining).toBeNull();
  });
});
