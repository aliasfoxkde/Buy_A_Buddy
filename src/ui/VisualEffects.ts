/**
 * Visual Effects - Damage Numbers, Particles, Floating Text
 */

import Phaser from 'phaser';

export type FloatingTextStyle = 'damage' | 'heal' | 'xp' | 'gold' | 'critical' | 'miss' | 'levelup';

interface FloatingTextConfig {
  x: number;
  y: number;
  text: string;
  style: FloatingTextStyle;
  duration?: number;
}

/**
 * Create floating damage/heal numbers
 */
export function createFloatingText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  style: FloatingTextStyle
): Phaser.GameObjects.Text {
  const colors: Record<FloatingTextStyle, string> = {
    damage: '#ef4444',
    heal: '#22c55e',
    xp: '#f59e0b',
    gold: '#fbbf24',
    critical: '#a855f7',
    miss: '#888888',
    levelup: '#22c55e'
  };

  const sizes: Record<FloatingTextStyle, number> = {
    damage: 28,
    heal: 28,
    xp: 20,
    gold: 20,
    critical: 42,
    miss: 18,
    levelup: 48
  };

  const color = colors[style];
  const size = sizes[style];

  const floatingText = scene.add.text(x, y, text, {
    fontSize: `${size}px`,
    fontFamily: 'Arial Black, sans-serif',
    color: color,
    stroke: '#000',
    strokeThickness: 4,
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000',
      blur: 4,
      fill: true
    }
  }).setOrigin(0.5);

  // Determine direction based on style
  const direction = style === 'heal' || style === 'xp' || style === 'gold' ? -1 : 1;
  const startY = y;
  const endY = y + direction * 80;

  // Fade and float animation
  scene.tweens.add({
    targets: floatingText,
    y: endY,
    alpha: 0,
    scale: style === 'critical' ? 1.3 : style === 'levelup' ? 1.5 : 1.1,
    duration: 1000,
    ease: 'Power2',
    onComplete: () => floatingText.destroy()
  });

  // Add shake for criticals
  if (style === 'critical' || style === 'levelup') {
    scene.tweens.add({
      targets: floatingText,
      x: x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3
    });
  }

  return floatingText;
}

/**
 * Create damage number with number animation
 */
export function createDamageNumber(
  scene: Phaser.Scene,
  x: number,
  y: number,
  damage: number,
  options: {
    isCritical?: boolean;
    isHeal?: boolean;
    element?: string;
  } = {}
): void {
  const { isCritical = false, isHeal = false, element } = options;
  
  let text = '';
  if (isHeal) text = `+${damage}`;
  else if (damage === 0) text = 'MISS';
  else if (isCritical) text = `${damage}!`;
  else text = `-${damage}`;
  
  let style: FloatingTextStyle = 'damage';
  if (isHeal) style = 'heal';
  if (isCritical) style = 'critical';
  if (damage === 0) style = 'miss';
  
  createFloatingText(scene, x, y, text, style);
  
  // Add element indicator
  if (element && element !== 'physical') {
    const elementSymbols: Record<string, string> = {
      fire: '🔥',
      ice: '❄️',
      lightning: '⚡',
      dark: '🌑',
      light: '☀️'
    };
    createFloatingText(scene, x + 30, y - 20, elementSymbols[element] || '', 'xp');
  }
}

/**
 * Create level up effect
 */
export function createLevelUpEffect(scene: Phaser.Scene, x: number, y: number): void {
  // Level up text
  createFloatingText(scene, x, y - 50, 'LEVEL UP!', 'levelup');
  
  // Screen flash
  const flash = scene.add.rectangle(
    scene.cameras.main.centerX,
    scene.cameras.main.centerY,
    scene.cameras.main.width,
    scene.cameras.main.height,
    0x22c55e,
    0.3
  );
  
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 500,
    onComplete: () => flash.destroy()
  });
  
  // Ring effect
  const ring = scene.add.circle(x, y, 10, 0x22c55e, 0.5);
  ring.setStrokeStyle(4, 0x22c55e);
  
  scene.tweens.add({
    targets: ring,
    scale: 5,
    alpha: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => ring.destroy()
  });
}

/**
 * Create achievement popup
 */
export function createAchievementPopup(
  scene: Phaser.Scene,
  title: string,
  description: string
): void {
  const { width } = scene.scale;
  
  // Create popup container
  const container = scene.add.container(width + 200, 100);
  
  const bg = scene.add.rectangle(0, 0, 350, 80, 0x1a1a2e);
  bg.setStrokeStyle(3, 0xf59e0b);
  
  const icon = scene.add.text(-140, 0, '🏆', { fontSize: '32px' }).setOrigin(0.5);
  const titleText = scene.add.text(-80, -15, title, {
    fontSize: '18px',
    fontFamily: 'Arial Black, sans-serif',
    color: '#f59e0b'
  });
  const descText = scene.add.text(-80, 12, description, {
    fontSize: '12px',
    fontFamily: 'Arial, sans-serif',
    color: '#fff'
  });
  
  container.add([bg, icon, titleText, descText]);
  
  // Slide in from right
  scene.tweens.add({
    targets: container,
    x: width - 200,
    duration: 300,
    ease: 'Back.out'
  });
  
  // Slide out after 3 seconds
  scene.tweens.add({
    targets: container,
    x: width + 350,
    delay: 3000,
    duration: 300,
    ease: 'Power2.in',
    onComplete: () => container.destroy()
  });
}

/**
 * Create quest notification
 */
export function createQuestNotification(
  scene: Phaser.Scene,
  questName: string,
  type: 'start' | 'complete' | 'failed'
): void {
  const sceneWidth = scene.scale.width;
  const sceneHeight = scene.scale.height;
  
  const colors = {
    start: '#3b82f6',
    complete: '#22c55e',
    failed: '#ef4444'
  };
  
  const icons = {
    start: '📜',
    complete: '✅',
    failed: '❌'
  };
  
  const container = scene.add.container(sceneWidth + 200, sceneHeight * 0.2);
  
  const bg = scene.add.rectangle(0, 0, 300, 60, 0x1a1a2e);
  bg.setStrokeStyle(2, parseInt(colors[type].replace('#', ''), 16));
  
  const iconText = scene.add.text(-120, 0, icons[type], { fontSize: '28px' }).setOrigin(0.5, 0.5);
  const questText = scene.add.text(-60, 0, questName, {
    fontSize: '16px',
    fontFamily: 'Arial Black, sans-serif',
    color: colors[type]
  }).setOrigin(0, 0.5);
  
  const labelText = scene.add.text(100, 0, type.toUpperCase(), {
    fontSize: '10px',
    fontFamily: 'Arial, sans-serif',
    color: '#888'
  }).setOrigin(0.5);
  
  container.add([bg, iconText, questText, labelText]);
  
  scene.tweens.add({
    targets: container,
    x: sceneWidth - 180,
    duration: 300,
    ease: 'Back.out'
  });
  
  scene.tweens.add({
    targets: container,
    x: sceneWidth + 300,
    delay: 2500,
    duration: 300,
    ease: 'Power2.in',
    onComplete: () => container.destroy()
  });
}

/**
 * Create coin pickup animation
 */
export function createCoinPickup(
  scene: Phaser.Scene,
  x: number,
  y: number,
  amount: number
): void {
  // Spawn multiple coins that fly to the gold counter
  const coinCount = Math.min(amount, 10);
  const amountPerCoin = Math.ceil(amount / coinCount);
  
  for (let i = 0; i < coinCount; i++) {
    scene.time.delayedCall(i * 50, () => {
      const coin = scene.add.text(x + randomInt(-20, 20), y + randomInt(-20, 20), '💰', {
        fontSize: '20px'
      });
      
      // Animate to gold counter
      scene.tweens.add({
        targets: coin,
        x: 250,
        y: 40,
        scale: 0.5,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => coin.destroy()
      });
    });
  }
  
  // Show total
  createFloatingText(scene, x, y - 30, `+${amount}`, 'gold');
}

/**
 * Create screen shake
 */
export function createScreenShake(
  scene: Phaser.Scene,
  intensity: number = 0.01,
  duration: number = 200
): void {
  const camera = scene.cameras.main;
  
  scene.tweens.add({
    targets: camera,
    shakeX: intensity * 100,
    shakeY: intensity * 50,
    duration: duration,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
}

/**
 * Create pulse effect on object
 */
export function createPulseEffect(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Container | Phaser.GameObjects.Sprite,
  scale: number = 1.1,
  duration: number = 200
): void {
  scene.tweens.add({
    targets: target,
    scaleX: scale,
    scaleY: scale,
    duration: duration,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
}

/**
 * Random integer helper
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
