/**
 * Visual Effects Utility
 * Screen shake, particles, and other juice
 */

import Phaser from 'phaser';

export class VisualEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Screen shake effect
   */
  shake(intensity: number = 0.01, duration: number = 100): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  /**
   * Heavy screen shake (damage taken)
   */
  heavyShake(): void {
    this.scene.cameras.main.shake(200, 0.02);
  }

  /**
   * Flash effect (white overlay)
   */
  flash(color: number = 0xffffff, duration: number = 50): void {
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.scrollX + this.scene.scale.width / 2,
      this.scene.cameras.main.scrollY + this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      color,
      0.5
    );
    flash.setDepth(1000);
    flash.setScrollFactor(0);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: duration,
      onComplete: () => flash.destroy()
    });
  }

  /**
   * Hit particles (damage indicator)
   */
  showHitParticles(x: number, y: number, color: number = 0xff4444): void {
    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.circle(x, y, 4, color);
      const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
      const distance = 30 + Math.random() * 20;

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Pickup particles (items, coins)
   */
  showPickupParticles(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(x, y, 3, 0xffdd44);
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 15;

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 30,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Heal particles
   */
  showHealParticles(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const particle = this.scene.add.circle(x, y, 5, 0x44ff44);
      particle.setAlpha(0.8);

      this.scene.tweens.add({
        targets: particle,
        y: y - 50 - i * 10,
        alpha: 0,
        duration: 600,
        delay: i * 50,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Level up burst
   */
  showLevelUpBurst(x: number, y: number): void {
    const center = this.scene.add.circle(x, y - 30, 10, 0xffaa00);
    center.setAlpha(0.9);

    this.scene.tweens.add({
      targets: center,
      scale: 3,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => center.destroy()
    });

    // Particles around
    for (let i = 0; i < 12; i++) {
      const particle = this.scene.add.circle(x, y - 30, 4, 0xffdd00);
      const angle = (Math.PI * 2 / 12) * i;
      const dist = 60;

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y - 30 + Math.sin(angle) * dist,
        alpha: 0,
        duration: 700,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * Bounce animation helper
   */
  bounce(target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image): void {
    this.scene.tweens.add({
      targets: target,
      scaleY: target.scaleX * 0.8,
      scaleX: target.scaleX * 1.2,
      duration: 80,
      yoyo: true,
      ease: 'Power2'
    });
  }
}

export default VisualEffects;
