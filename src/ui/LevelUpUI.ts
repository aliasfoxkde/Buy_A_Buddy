/**
 * Level Up UI - Player level progression feedback
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';
import { ParticleSystem } from '../utils/ParticleSystem';

export class LevelUpUI {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isActive: boolean = false;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  public showLevelUp(newLevel: number, stats: { hp: number; attack: number; defense: number }): void {
    if (this.isActive) return;
    this.isActive = true;
    
    const { width, height } = this.scene.scale;
    
    // Create container
    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(1000);
    
    // Background overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    overlay.setInteractive();
    this.container.add(overlay);
    
    // Level up banner
    const banner = this.scene.add.rectangle(0, 0, 400, 300, 0x1a1a2e);
    banner.setStrokeStyle(4, 0xfbbf24);
    this.container.add(banner);
    
    // "LEVEL UP!" text with animation
    const levelText = this.scene.add.text(0, -100, 'LEVEL UP!', {
      fontSize: '48px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.container.add(levelText);
    
    // Level number
    const levelNum = this.scene.add.text(0, -40, `Level ${newLevel}`, {
      fontSize: '32px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    this.container.add(levelNum);
    
    // Stats increase display
    const statsY = 30;
    const statIncrease = this.scene.add.text(0, statsY, [
      `+${stats.hp} Max HP`,
      `+${stats.attack} Attack`,
      `+${stats.defense} Defense`
    ].join('\n'), {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#22c55e',
      align: 'center'
    }).setOrigin(0.5);
    this.container.add(statIncrease);
    
    // Continue prompt
    const continueText = this.scene.add.text(0, 110, 'Press SPACE or Click to continue', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    }).setOrigin(0.5);
    this.container.add(continueText);
    
    // Pulse animation
    this.scene.tweens.add({
      targets: levelText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Emit particles for level up celebration
    this.scene.time.delayedCall(300, () => {
      if (this.scene instanceof Phaser.Scene) {
        const particleSystem = new ParticleSystem(this.scene);
        particleSystem.levelUpCelebration(width / 2, height / 2);
      }
    });
    
    // Fade in
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
    
    // Input handling
    const dismiss = () => {
      if (!this.isActive) return;
      this.dismiss();
    };
    
    this.scene.input.keyboard?.once('keydown-SPACE', dismiss);
    overlay.once('pointerdown', dismiss);
    
    // Auto-dismiss after 5 seconds
    this.scene.time.delayedCall(5000, () => {
      if (this.isActive) this.dismiss();
    });
  }
  
  private dismiss(): void {
    if (!this.isActive) return;
    this.isActive = false;
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.destroy();
      }
    });
  }
  
  public destroy(): void {
    if (this.container) {
      this.container.destroy();
    }
    this.isActive = false;
  }
}