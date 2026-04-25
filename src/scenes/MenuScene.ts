/**
 * In-Game Menu Scene
 */

import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive(); // Click to close
    
    // Menu panel
    const panel = this.add.rectangle(width / 2, height / 2, 400, 500, 0x1a1a2e);
    panel.setStrokeStyle(3, 0xa855f7);
    
    // Title
    this.add.text(width / 2, height / 2 - 200, 'PAUSED', {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Menu options
    const options = [
      { text: 'RESUME', action: () => this.resume() },
      { text: 'SETTINGS', action: () => this.openSettings() },
      { text: 'INVENTORY', action: () => this.openInventory() },
      { text: 'QUEST LOG', action: () => this.openQuests() },
      { text: 'SAVE GAME', action: () => this.saveGame() },
      { text: 'MAIN MENU', action: () => this.goToMainMenu() }
    ];
    
    const startY = height / 2 - 100;
    const spacing = 60;
    
    for (let i = 0; i < options.length; i++) {
      const btn = this.add.rectangle(
        width / 2,
        startY + i * spacing,
        250,
        50,
        0x2d1b4e
      );
      btn.setStrokeStyle(2, 0xa855f7);
      btn.setInteractive({ useHandCursor: true });
      
      this.add.text(width / 2, startY + i * spacing, options[i].text, {
        fontSize: '20px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff'
      }).setOrigin(0.5);
      
      btn.on('pointerover', () => btn.setFillStyle(0x3d2b5e));
      btn.on('pointerout', () => btn.setFillStyle(0x2d1b4e));
      btn.on('pointerdown', options[i].action);
    }
    
    // Close on ESC
    this.input.keyboard?.once('keydown-ESC', () => this.resume());
    
    // Close on overlay click
    overlay.on('pointerdown', () => this.resume());
  }
  
  private resume(): void {
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
  
  private openSettings(): void {
    this.scene.pause();
    this.scene.launch('SettingsScene');
  }
  
  private openInventory(): void {
    this.scene.pause();
    this.scene.launch('InventoryScene');
  }
  
  private openQuests(): void {
    this.scene.pause();
    this.scene.launch('QuestScene');
  }
  
  private saveGame(): void {
    const { width, height } = this.scale;
    
    // Show save notification
    const notification = this.add.rectangle(width / 2, height - 100, 300, 60, 0x22c55e);
    notification.setStrokeStyle(2, 0x166534);
    
    this.add.text(width / 2, height - 100, 'Game Saved!', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Auto-hide
    this.time.delayedCall(1500, () => {
      notification.destroy();
    });
    
    // Actually save
    // gameSystems.saveGame();
  }
  
  private goToMainMenu(): void {
    this.scene.stop('WorldScene');
    this.scene.start('MainMenuScene');
  }
}
