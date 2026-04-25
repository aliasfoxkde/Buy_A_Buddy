// ==========================================
// BOOT SCENE - Asset loading
// ==========================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x2d1b4e, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: COLORS.primary,
    }).setOrigin(0.5);
    
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: COLORS.text,
    }).setOrigin(0.5);
    
    // Loading progress
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xa855f7, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(`${Math.round(value * 100)}%`);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    // Load assets
    this.createPlaceholderAssets();
  }

  create(): void {
    // Create sprite textures programmatically
    this.createSpriteTextures();
    
    // Start menu scene
    this.scene.start('MenuScene');
  }

  private createPlaceholderAssets(): void {
    // Create placeholder textures
    // In a full game, these would be actual image files
  }

  private createSpriteTextures(): void {
    // Create player sprite
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    
    // Player body (cyan blob)
    playerGraphics.fillStyle(0x06b6d4, 1);
    playerGraphics.fillCircle(16, 16, 14);
    
    // Highlight
    playerGraphics.fillStyle(0x67e8f9, 0.6);
    playerGraphics.fillCircle(12, 12, 5);
    
    // Eyes
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(11, 15, 4);
    playerGraphics.fillCircle(21, 15, 4);
    
    // Pupils
    playerGraphics.fillStyle(0x1a1a2e, 1);
    playerGraphics.fillCircle(12, 14, 2);
    playerGraphics.fillCircle(22, 14, 2);
    
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Create buddy sprites for each rarity
    const rarities = ['common', 'rare', 'epic', 'legendary'];
    const colors = [0x87CEEB, 0x9370DB, 0xFF69B4, 0xFFD700];
    
    rarities.forEach((rarity, i) => {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      
      // Glow
      graphics.fillStyle(colors[i], 0.3);
      graphics.fillCircle(16, 16, 16);
      
      // Body
      graphics.fillStyle(colors[i], 1);
      graphics.fillCircle(16, 16, 12);
      
      // Highlight
      graphics.fillStyle(0xffffff, 0.4);
      graphics.fillCircle(13, 13, 5);
      
      // Eyes
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(11, 15, 3);
      graphics.fillCircle(21, 15, 3);
      
      graphics.fillStyle(0x1a1a2e, 1);
      graphics.fillCircle(12, 14, 1.5);
      graphics.fillCircle(22, 14, 1.5);
      
      graphics.generateTexture(`buddy-${rarity}`, 32, 32);
      graphics.destroy();
    });

    // Create plot sprite
    const plotGraphics = this.make.graphics({ x: 0, y: 0 });
    plotGraphics.fillStyle(0x3d2b5e, 1);
    plotGraphics.fillRoundedRect(0, 0, 32, 32, 6);
    plotGraphics.lineStyle(2, 0xa855f7, 0.5);
    plotGraphics.strokeRoundedRect(0, 0, 32, 32, 6);
    plotGraphics.generateTexture('plot', 32, 32);
    plotGraphics.destroy();

    // Create particle sprite
    const particleGraphics = this.make.graphics({ x: 0, y: 0 });
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();

    // Create coin sprite
    const coinGraphics = this.make.graphics({ x: 0, y: 0 });
    coinGraphics.fillStyle(0xfbbf24, 1);
    coinGraphics.fillCircle(8, 8, 7);
    coinGraphics.fillStyle(0xfde68a, 0.6);
    coinGraphics.fillCircle(6, 6, 3);
    coinGraphics.generateTexture('coin', 16, 16);
    coinGraphics.destroy();
  }
}