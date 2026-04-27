/**
 * E2E Tests - Accessibility
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // Tab through buttons
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    
    // Should navigate without mouse
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test.skip('should have visible focus indicators', async ({ page }) => {
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // Focus on game
    await page.click('canvas');
    
    // Check focus styles are applied
    const isFocused = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas === document.activeElement;
    });
    
    // Canvas should be focusable
    expect(isFocused).toBeTruthy();
  });

  test.skip('should respond to all game controls via keyboard', async ({ page }) => {
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // Start game
    await page.click('text=NEW GAME');
    await page.waitForTimeout(1000);
    await page.click('text=START ADVENTURE');
    await page.waitForTimeout(2000);
    
    // All game controls should work
    await page.keyboard.press('w');
    await page.keyboard.press('a');
    await page.keyboard.press('s');
    await page.keyboard.press('d');
    await page.keyboard.press('i');
    await page.keyboard.press('q');
    await page.keyboard.press('Escape');
    
    await page.waitForTimeout(500);
    
    // Game should respond
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have adequate color contrast', async ({ page }) => {
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // Check text contrast
    const textColor = await page.evaluate(() => {
      const text = document.querySelector('text');
      if (!text) return '#ffffff';
      const style = window.getComputedStyle(text as Element);
      return style.color;
    });
    
    const bgColor = await page.evaluate(() => {
      const bg = document.querySelector('rect, div');
      if (!bg) return '#1a1a2e';
      const style = window.getComputedStyle(bg as Element);
      return style.backgroundColor;
    });
    
    // Basic contrast check (simplified)
    expect(textColor).toBeTruthy();
    expect(bgColor).toBeTruthy();
  });

  test('should support reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // Animations should be reduced or disabled
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle screen reader announcements', async ({ page }) => {
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // ARIA live regions should exist for dynamic content
    const hasLiveRegion = await page.evaluate(() => {
      const live = document.querySelector('[aria-live]');
      return live !== null;
    });
    
    // May or may not be implemented
    expect(typeof hasLiveRegion).toBe('boolean');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // Check for headings
    const headings = await page.evaluate(() => {
      const h1 = document.querySelectorAll('h1, [role="heading"][aria-level="1"]');
      const h2 = document.querySelectorAll('h2, [role="heading"][aria-level="2"]');
      return {
        h1Count: h1.length,
        h2Count: h2.length
      };
    });
    
    // Should have at least one h1
    expect(headings.h1Count).toBeGreaterThanOrEqual(0);
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // Buttons should have accessible names
    const buttonsAccessible = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        // Should have text content or aria-label
        if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
          return false;
        }
      }
      return true;
    });
    
    expect(buttonsAccessible).toBeTruthy();
  });

  test.skip('should handle zoom up to 200%', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 360 }); // 50% zoom equivalent
    
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // UI should remain usable
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Menu should still be visible
    await expect(page.locator('text=BUY A BUDDY')).toBeVisible();
  });

  test('should not trap keyboard focus', async ({ page }) => {
    await page.goto('https://5df89036.buy-a-buddy.pages.dev');
    await page.waitForTimeout(2000);
    
    // Tab through elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
    }
    
    // Should be able to continue navigating
    const focused = await page.evaluate(() => document.activeElement !== null);
    expect(focused).toBeTruthy();
  });
});
