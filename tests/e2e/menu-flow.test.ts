/**
 * Buy a Buddy - E2E Menu Flow Tests
 */

import { test, expect } from '@playwright/test';

// Use deployed URL for testing
const GAME_URL = 'https://0aea4eb7.buy-a-buddy.pages.dev';

/**
 * Helper to click a Phaser button via internal event emission
 * This works around the fact that Phaser 3's input system doesn't
 * respond to Playwright's synthetic mouse events in headless Chrome
 */
async function clickPhaserButton(page: any, buttonIndex: number): Promise<void> {
  await page.evaluate((index: number) => {
    const game = (window as any).phaserGame;
    if (!game) return;

    // Find the active scene
    const activeScene = game.scene.scenes.find((s: any) => s.scene?.isActive());
    if (!activeScene || !activeScene.buttons) return;

    const button = activeScene.buttons[index];
    if (button) {
      button.emit('pointerdown');
    }
  }, buttonIndex);
}

/**
 * Get the current active scene key
 */
async function getActiveScene(page: any): Promise<string | null> {
  return page.evaluate(() => {
    const game = (window as any).phaserGame;
    if (!game) return null;
    return game.scene.scenes.find((s: any) => s.scene?.isActive())?.scene?.key || null;
  });
}

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

    // Verify we're on MainMenuScene
    await page.waitForFunction(() => {
      const game = (window as any).phaserGame;
      if (!game) return false;
      return game.scene.scenes.find((s: any) => s.scene?.key === 'MainMenuScene')?.scene?.isActive();
    }, { timeout: 10000 });

    console.log('Canvas is visible and MainMenuScene is active');
  });

  test('can click NEW GAME button and transition to character select', async ({ page }) => {
    await page.goto(GAME_URL);

    // Wait for game to load fully (BootScene + MainMenuScene)
    await page.waitForTimeout(5000);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for MainMenuScene to be active
    await page.waitForFunction(() => {
      const game = (window as any).phaserGame;
      return game?.scene?.scenes?.find((s: any) => s.scene?.key === 'MainMenuScene')?.scene?.isActive();
    }, { timeout: 10000 });

    // Use Phaser emit to click the NEW GAME button (index 0)
    await clickPhaserButton(page, 0);

    // Wait for scene transition to CharacterSelectScene
    await page.waitForFunction(() => {
      const game = (window as any).phaserGame;
      return game?.scene?.scenes?.find((s: any) => s.scene?.key === 'CharacterSelectScene')?.scene?.isActive();
    }, { timeout: 10000 });

    const activeScene = await getActiveScene(page);
    expect(activeScene).toBe('CharacterSelectScene');
    console.log('Successfully transitioned to CharacterSelectScene');
  });

  test('keyboard ENTER key triggers NEW GAME', async ({ page }) => {
    await page.goto(GAME_URL);

    // Wait for game to load fully
    await page.waitForTimeout(5000);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Wait for MainMenuScene to be active
    await page.waitForFunction(() => {
      const game = (window as any).phaserGame;
      return game?.scene?.scenes?.find((s: any) => s.scene?.key === 'MainMenuScene')?.scene?.isActive();
    }, { timeout: 10000 });

    // Press ENTER to select NEW GAME (first button is selected by default)
    console.log('Pressing ENTER key');
    await page.keyboard.press('Enter');

    // Wait for scene transition
    await page.waitForFunction(() => {
      const game = (window as any).phaserGame;
      return game?.scene?.scenes?.find((s: any) => s.scene?.key === 'CharacterSelectScene')?.scene?.isActive();
    }, { timeout: 10000 });

    const activeScene = await getActiveScene(page);
    expect(activeScene).toBe('CharacterSelectScene');
    console.log('Keyboard ENTER successfully transitioned to CharacterSelectScene');
  });

  test('full game start flow - MainMenu -> CharacterSelect -> WorldScene', async ({ page }) => {
    await page.goto(GAME_URL);

    // Wait for game to load
    await page.waitForTimeout(5000);

    // Verify MainMenuScene is active
    await page.waitForFunction(() => {
      const game = (window as any).phaserGame;
      return game?.scene?.scenes?.find((s: any) => s.scene?.key === 'MainMenuScene')?.scene?.isActive();
    }, { timeout: 10000 });
    console.log('Step 1: MainMenuScene active');

    // Click NEW GAME
    await clickPhaserButton(page, 0);

    // Wait for CharacterSelectScene
    await page.waitForFunction(() => {
      const game = (window as any).phaserGame;
      return game?.scene?.scenes?.find((s: any) => s.scene?.key === 'CharacterSelectScene')?.scene?.isActive();
    }, { timeout: 10000 });
    console.log('Step 2: CharacterSelectScene active');

    // Click START ADVENTURE (find the green start button)
    await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const charSelect = game.scene.scenes.find((s: any) => s.scene?.key === 'CharacterSelectScene');

      // Find the green start button (fillColor 0x22c55e = 2278750)
      const startBtn = charSelect.children.list.find((c: any) =>
        c.type === 'Rectangle' && c.fillColor === 2278750 && c.y === 640
      );

      if (startBtn) {
        startBtn.emit('pointerdown');
      }
    });

    // Wait for WorldScene
    await page.waitForFunction(() => {
      const game = (window as any).phaserGame;
      return game?.scene?.scenes?.find((s: any) => s.scene?.key === 'WorldScene')?.scene?.isActive();
    }, { timeout: 10000 });

    const activeScene = await getActiveScene(page);
    expect(activeScene).toBe('WorldScene');
    console.log('Step 3: WorldScene active - Full flow works!');
  });
});
