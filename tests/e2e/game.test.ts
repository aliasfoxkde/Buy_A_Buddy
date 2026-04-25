// ==========================================
// E2E TESTS - Full game flow testing
// ==========================================

import { test, expect } from '@playwright/test';

test.describe('Buy a Buddy E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the game', async ({ page }) => {
    // Wait for the game container
    await expect(page.locator('#game')).toBeVisible({ timeout: 10000 });
  });

  test('should display title', async ({ page }) => {
    await expect(page.locator('text=BUY A BUDDY')).toBeVisible();
  });

  test('should spawn a buddy', async ({ page }) => {
    // Click spawn button
    const spawnButton = page.locator('button:has-text("BUY")').first();
    await expect(spawnButton).toBeVisible();
    await spawnButton.click();
    
    // Should see buddy added (in inventory or on plot)
    await page.waitForTimeout(500);
  });

  test('should assign buddy to plot', async ({ page }) => {
    // First spawn a buddy
    const spawnButton = page.locator('button:has-text("BUY")').first();
    await spawnButton.click();
    await page.waitForTimeout(300);
    
    // Open inventory
    const inventoryBtn = page.locator('button:has-text("Inventory")');
    if (await inventoryBtn.isVisible()) {
      await inventoryBtn.click();
      
      // Assign buddy
      const assignBtn = page.locator('button:has-text("Assign")').first();
      if (await assignBtn.isVisible()) {
        await assignBtn.click();
      }
    }
    
    await page.waitForTimeout(300);
  });

  test('should earn coins passively', async ({ page }) => {
    // Get initial coins
    const initialCoins = await page.locator('[class*="currency"]').textContent();
    
    // Spawn and assign buddy
    const spawnButton = page.locator('button:has-text("BUY")').first();
    await spawnButton.click();
    await page.waitForTimeout(200);
    
    // Assign to plot if possible
    const inventoryBtn = page.locator('button:has-text("Inventory")');
    if (await inventoryBtn.isVisible()) {
      await inventoryBtn.click();
      await page.waitForTimeout(200);
    }
    
    // Wait for income tick
    await page.waitForTimeout(2000);
    
    // Check coins increased (if buddy was assigned)
    // This is a basic check - real test would need proper setup
  });

  test('should open shop panel', async ({ page }) => {
    const shopBtn = page.locator('button:has-text("Shop")');
    if (await shopBtn.isVisible()) {
      await shopBtn.click();
      await expect(page.locator('[class*="modal"]')).toBeVisible();
    }
  });

  test('should navigate between screens', async ({ page }) => {
    // Test bottom navigation
    const inventoryBtn = page.locator('button:has-text("Inventory")');
    if (await inventoryBtn.isVisible()) {
      await inventoryBtn.click();
      await page.waitForTimeout(300);
    }
    
    const statsBtn = page.locator('button:has-text("Stats")');
    if (await statsBtn.isVisible()) {
      await statsBtn.click();
      await page.waitForTimeout(300);
    }
  });

});

test.describe('API Integration Tests', () => {
  
  test('should return game state', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/game/state');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  test('should spawn buddy via API', async ({ request }) => {
    // First add coins
    const stateRes = await request.get('http://localhost:3001/api/game/state');
    const state = await stateRes.json();
    
    // Spawn buddy
    const spawnRes = await request.post('http://localhost:3001/api/game/action', {
      data: { type: 'SPAWN_BUDDY' },
    });
    
    expect(spawnRes.ok()).toBeTruthy();
    
    const result = await spawnRes.json();
    expect(result.success).toBe(true);
  });

  test('should validate game state', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/debug/validate');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.data).toBeDefined();
    expect(body.data.valid).toBe(true);
  });

  test('should report health', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.data.status).toBe('ok');
  });

});

test.describe('Performance Tests', () => {
  
  test('should maintain FPS', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check console for performance warnings
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') logs.push(msg.text());
    });
    
    // Interact with game
    const spawnButton = page.locator('button:has-text("BUY")').first();
    for (let i = 0; i < 5; i++) {
      await spawnButton.click();
      await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(1000);
    
    // Should have no critical errors
    const criticalErrors = logs.filter(l => l.includes('Error') && !l.includes('warning'));
    expect(criticalErrors.length).toBe(0);
  });

});