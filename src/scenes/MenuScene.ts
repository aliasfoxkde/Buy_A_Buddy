// ==========================================
// MENU SCENE - Title screen
// ==========================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

export class MenuScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Create starfield
    this.createStarfield();
    
    // Create nebula effect
    this.createNebula();
    
    // Title
    this.createTitle();
    
    // Buttons
    this.createButtons();
    
    // Animate title
    this.tweens.add({
      targets: this.children.getByName('title'),
      y: 180,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createStarfield(): void {
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.2, 1);
      
      const star = this.add.text(x, y, '✦', {
        fontSize: `${size * 8}px`,
        color: i % 3 === 0 ? '#FFD700' : '#FFFFFF',
      }).setAlpha(alpha);
      
      this.stars.push(star);
      
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  private createNebula(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xa855f7, 0.1);
    graphics.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 3, 300);
  }

  private createTitle(): void {
    // Shadow
    this.add.text(GAME_WIDTH / 2 + 3, 203, 'BUY A BUDDY', {
      fontSize: '42px',
      fontFamily: 'Georgia, serif',
      color: '#000000',
    }).setOrigin(0.5).setName('titleShadow');
    
    // Main title
    const title = this.add.text(GAME_WIDTH / 2, 200, 'BUY A BUDDY', {
      fontSize: '42px',
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      stroke: '#ffffff',
      strokeThickness: 1,
    }).setOrigin(0.5).setName('title');
    
    // Subtitle
    this.add.text(GAME_WIDTH / 2, 250, 'An Epic Adventure', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: COLORS.secondary,
      fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private createButtons(): void {
    // Play button
    this.createButton(GAME_WIDTH / 2, 380, '▶ PLAY', () => {
      this.cameras.main.flash(300, 168, 85, 247);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene');
      });
    });
    
    // Continue button (if save exists)
    this.createButton(GAME_WIDTH / 2, 450, '⏩ CONTINUE', () => {
      this.scene.start('GameScene');
    }, '#6B21A8');
    
    // Settings button
    this.createButton(GAME_WIDTH / 2, 520, '⚙️ SETTINGS', () => {
      // Settings scene would go here
    }, '#4d3b6e');
  }

  private createButton(
    x: number, 
    y: number, 
    text: string, 
    onClick: () => void,
    color: string = COLORS.buttonPrimary
  ): void {
    const container = this.add.container(x, y);
    
    // Glow
    const glow = this.add.graphics();
    glow.fillStyle(0xa855f7, 0.3);
    glow.fillRoundedRect(-80, -25, 160, 50, 12);
    container.add(glow);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(parseInt(color.replace('#', ''), 16), 1);
    bg.fillRoundedRect(-75, -20, 150, 40, 10);
    bg.lineStyle(2, 0xa855f7, 0.8);
    bg.strokeRoundedRect(-75, -20, 150, 40, 10);
    container.add(bg);
    
    // Text
    const label = this.add.text(0, 0, text, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);
    container.add(label);
    
    // Make interactive
    container.setSize(150, 40);
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
      });
      glow.clear().fillStyle(0xa855f7, 0.5).fillRoundedRect(-85, -30, 170, 60, 15);
    });
    
    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
      });
      glow.clear().fillStyle(0xa855f7, 0.3).fillRoundedRect(-80, -25, 160, 50, 12);
    });
    
    container.on('pointerdown', onClick);
  }
}