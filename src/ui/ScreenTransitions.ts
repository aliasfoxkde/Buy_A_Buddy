/**
 * Screen Transitions - Fade, flash, and wipe effects
 */

import Phaser from 'phaser';

export type TransitionType = 'fade' | 'flash' | 'wipe-left' | 'wipe-right' | 'circle';

export class ScreenTransition {
  private scene: Phaser.Scene;
  private overlay!: Phaser.GameObjects.Rectangle;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Fade out effect
   */
  public fadeOut(duration: number = 500, color: number = 0x000000): Promise<void> {
    return new Promise((resolve) => {
      const { width, height } = this.scene.scale;
      
      this.overlay = this.scene.add.rectangle(
        width / 2, height / 2,
        width, height,
        color, 0
      );
      this.overlay.setScrollFactor(0);
      this.overlay.setDepth(9999);
      
      this.scene.tweens.add({
        targets: this.overlay,
        fillAlpha: 1,
        duration,
        ease: 'Power2',
        onComplete: () => resolve()
      });
    });
  }
  
  /**
   * Fade in effect
   */
  public fadeIn(duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.overlay,
        fillAlpha: 0,
        duration,
        ease: 'Power2',
        onComplete: () => {
          this.overlay.destroy();
          resolve();
        }
      });
    });
  }
  
  /**
   * Complete fade transition
   */
  public async fade(duration: number = 500, color: number = 0x000000): Promise<void> {
    await this.fadeOut(duration / 2, color);
    await this.fadeIn(duration / 2);
  }
  
  /**
   * Flash effect
   */
  public flash(color: number = 0xffffff, duration: number = 100): Promise<void> {
    return new Promise((resolve) => {
      const { width, height } = this.scene.scale;
      
      const flash = this.scene.add.rectangle(
        width / 2, height / 2,
        width, height,
        color, 0.5
      );
      flash.setScrollFactor(0);
      flash.setDepth(9999);
      
      this.scene.tweens.add({
        targets: flash,
        fillAlpha: 0,
        duration,
        ease: 'Power2',
        onComplete: () => {
          flash.destroy();
          resolve();
        }
      });
    });
  }
  
  /**
   * Screen shake effect
   */
  public shake(intensity: number = 0.01, duration: number = 200): void {
    this.scene.cameras.main.shake(duration, intensity);
  }
  
  /**
   * Heavy screen shake
   */
  public heavyShake(): void {
    this.scene.cameras.main.shake(300, 0.03);
  }
  
  /**
   * Camera zoom pulse
   */
  public zoomPulse(scale: number = 1.1, duration: number = 200): Promise<void> {
    return new Promise((resolve) => {
      const camera = this.scene.cameras.main;
      const originalZoom = camera.zoom;
      
      this.scene.tweens.add({
        targets: camera,
        zoom: scale,
        duration: duration / 2,
        ease: 'Power2',
        yoyo: true,
        onComplete: () => {
          camera.zoom = originalZoom;
          resolve();
        }
      });
    });
  }
  
  /**
   * Color tint flash
   */
  public colorFlash(color: number, duration: number = 150): Promise<void> {
    return new Promise((resolve) => {
      this.scene.cameras.main.flash(duration, 
        (color >> 16) & 0xff,
        (color >> 8) & 0xff,
        color & 0xff,
        true,
        (cam: any, progress: number) => {
          if (progress === 1) resolve();
        }
      );
    });
  }
  
  /**
   * Victory effect - gold particles burst
   */
  public victoryBurst(x: number, y: number, count: number = 20): void {
    const colors = [0xfbbf24, 0xf59e0b, 0x22c55e, 0x3b82f6];
    
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = this.scene.add.circle(x, y, Phaser.Math.Between(3, 8), color);
      
      const angle = Math.random() * Math.PI * 2;
      const distance = Phaser.Math.Between(50, 150);
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(600, 1000),
        ease: 'Power2',
        delay: i * 30,
        onComplete: () => particle.destroy()
      });
    }
  }
  
  /**
   * Damage effect - red vignette flash
   */
  public damageFlash(): Promise<void> {
    return this.colorFlash(0xef4444, 150);
  }
  
  /**
   * Heal effect - green vignette flash
   */
  public healFlash(): Promise<void> {
    return this.colorFlash(0x22c55e, 150);
  }
  
  /**
   * Level up effect - gold pulse
   */
  public levelUpFlash(): Promise<void> {
    return new Promise(async (resolve) => {
      await this.colorFlash(0xfbbf24, 200);
      this.scene.time.delayedCall(100, () => {
        this.colorFlash(0x22c55e, 200).then(() => resolve());
      });
    });
  }
  
  /**
   * Boss warning - red pulsing effect
   */
  public bossWarning(duration: number = 2000): void {
    const { width, height } = this.scene.scale;
    
    const warning = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0xef4444, 0
    );
    warning.setScrollFactor(0);
    warning.setDepth(9998);
    
    // Pulsing red overlay
    this.scene.tweens.add({
      targets: warning,
      fillAlpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: Math.floor(duration / 600) - 1,
      onComplete: () => warning.destroy()
    });
    
    // Screen shake
    this.shake(0.005, duration);
  }
}

/**
 * Particle burst effect
 */
export class ParticleBurst {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Create particle burst at position
   */
  public burst(x: number, y: number, color: number = 0xffffff, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.circle(x, y, Phaser.Math.Between(2, 6), color);
      
      const angle = (Math.PI * 2 / count) * i;
      const distance = Phaser.Math.Between(30, 80);
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }
  
  /**
   * Trail particles
   */
  public trail(x: number, y: number, color: number = 0xa855f7): void {
    const particle = this.scene.add.circle(x, y, 4, color);
    
    this.scene.tweens.add({
      targets: particle,
      alpha: 0,
      scale: 0,
      y: y + 20,
      duration: 300,
      onComplete: () => particle.destroy()
    });
  }
}
