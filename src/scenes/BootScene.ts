// ==========================================
// BOOT SCENE - Loading screen
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Create loading animation
    this.createLoadingScreen();
    
    // Transition to menu after brief delay
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(300, 13, 13, 26);
      this.time.delayedCall(300, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }

  private createLoadingScreen(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Title
    this.add.text(width / 2, height * 0.3, 'BUY A BUDDY', {
      fontSize: '42px',
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5);
    
    // Loading bar background
    const barWidth = width * 0.6;
    const barHeight = 16;
    const barX = (width - barWidth) / 2;
    const barY = height * 0.6;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 1);
    bg.fillRoundedRect(barX, barY, barWidth, barHeight, 8);
    
    // Progress bar
    const progress = this.add.graphics();
    progress.fillStyle(0xa855f7, 1);
    progress.fillRoundedRect(barX + 4, barY + 4, barWidth - 8, barHeight - 8, 4);
    
    // Animate progress
    const tween = this.tweens.add({
      targets: progress,
      scaleX: { from: 0, to: 1 },
      duration: 1200,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.add.text(width / 2, barY + barHeight + 30, 'Loading complete!', {
          fontSize: '16px',
          color: COLORS.textSecondary,
        }).setOrigin(0.5);
      }
    });
    
    // Loading text
    this.add.text(width / 2, barY + barHeight + 20, 'Preparing your adventure...', {
      fontSize: '14px',
      color: COLORS.textSecondary,
    }).setOrigin(0.5);
    
    // Floating particles
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(100, height - 100);
      
      const particle = this.add.text(x, y, '✨', {
        fontSize: '16px',
      }).setAlpha(0.4);
      
      this.tweens.add({
        targets: particle,
        y: y - 30,
        alpha: 0.1,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }
    
    // Version
    this.add.text(width / 2, height - 30, 'v2.0.0', {
      fontSize: '12px',
      color: '#666666',
    }).setOrigin(0.5);
  }
}