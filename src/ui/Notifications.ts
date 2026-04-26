/**
 * Achievement Popup - Notification when achievements are unlocked
 */

import Phaser from 'phaser';

export class AchievementPopup {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Show achievement unlocked popup
   */
  public show(achievement: { name: string; description: string; icon: string }): void {
    const { width, height } = this.scene.scale;
    
    // Create container
    this.container = this.scene.add.container(width + 200, 100);
    this.container.setDepth(2000);
    
    // Background panel
    const bg = this.scene.add.rectangle(0, 0, 350, 100, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(3, 0xfbbf24);
    
    // Icon
    const icon = this.scene.add.text(-140, 0, achievement.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);
    
    // Title
    const title = this.scene.add.text(0, -25, 'ACHIEVEMENT UNLOCKED!', {
      fontSize: '14px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
    
    // Name
    const name = this.scene.add.text(20, 5, achievement.name, {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    
    // Description
    const desc = this.scene.add.text(20, 30, achievement.description, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#a1a1aa'
    }).setOrigin(0, 0.5);
    
    this.container.add([bg, icon, title, name, desc]);
    
    // Animate in from right
    this.scene.tweens.add({
      targets: this.container,
      x: width - 200,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Pulse animation on border
    this.scene.tweens.add({
      targets: bg,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 300,
      yoyo: true,
      repeat: 2
    });
    
    // Auto-dismiss after 4 seconds
    this.scene.time.delayedCall(4000, () => {
      this.dismiss();
    });
  }
  
  /**
   * Dismiss popup with animation
   */
  private dismiss(): void {
    if (!this.container) return;
    
    this.scene.tweens.add({
      targets: this.container,
      x: this.scene.scale.width + 200,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.container.destroy();
      }
    });
  }
}

/**
 * Toast notification - Quick message popup
 */
export class ToastNotification {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Show a toast notification
   */
  public show(text: string, color: number = 0x22c55e, duration: number = 2000): void {
    const { width } = this.scene.scale;
    
    // Container
    const container = this.scene.add.container(width / 2, 80);
    container.setDepth(1500);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, 300, 50, 0x1a1a2e, 0.9);
    bg.setStrokeStyle(2, color);
    
    // Text
    const txt = this.scene.add.text(0, 0, text, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    container.add([bg, txt]);
    
    // Fade in
    container.setAlpha(0);
    container.setScale(0.8);
    
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      y: 50,
      duration: 300,
      delay: duration - 300,
      onComplete: () => container.destroy()
    });
  }
  
  /**
   * Show success toast (green)
   */
  public success(text: string, duration?: number): void {
    this.show(text, 0x22c55e, duration);
  }
  
  /**
   * Show error toast (red)
   */
  public error(text: string, duration?: number): void {
    this.show(text, 0xef4444, duration);
  }
  
  /**
   * Show info toast (blue)
   */
  public info(text: string, duration?: number): void {
    this.show(text, 0x3b82f6, duration);
  }
  
  /**
   * Show warning toast (orange)
   */
  public warning(text: string, duration?: number): void {
    this.show(text, 0xf59e0b, duration);
  }
}

/**
 * Item pickup notification
 */
export class ItemPickupNotification {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Show item pickup animation at position
   */
  public show(x: number, y: number, itemName: string, emoji: string = '📦'): void {
    // Container
    const container = this.scene.add.container(x, y);
    container.setDepth(150);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, 150, 40, 0x1a1a2e, 0.9);
    bg.setStrokeStyle(2, 0xfbbf24);
    
    // Emoji
    const icon = this.scene.add.text(-60, 0, emoji, {
      fontSize: '24px'
    }).setOrigin(0.5);
    
    // Text
    const txt = this.scene.add.text(0, 0, itemName, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
    
    container.add([bg, icon, txt]);
    
    // Float up and fade
    this.scene.tweens.add({
      targets: container,
      y: y - 60,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => container.destroy()
    });
  }
}
