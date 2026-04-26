/**
 * In-Game Menu Scene
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }
  
  create(): void {
    // Auto-save when opening menu
    this.autoSave();
    
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
      { text: 'SAVE / LOAD', action: () => this.openSaveLoad() },
      { text: 'INVENTORY', action: () => this.openInventory() },
      { text: 'QUEST LOG', action: () => this.openQuests() },
      { text: 'CHARACTER STATS', action: () => this.openStats() },
      { text: 'SETTINGS', action: () => this.openSettings() },
      { text: 'MAIN MENU', action: () => this.goToMainMenu() }
    ];
    
    const startY = height / 2 - 100;
    const spacing = 55;
    
    for (let i = 0; i < options.length; i++) {
      const btn = this.add.rectangle(
        width / 2,
        startY + i * spacing,
        250,
        45,
        0x2d1b4e
      );
      btn.setStrokeStyle(2, 0xa855f7);
      btn.setInteractive({ useHandCursor: true });
      
      this.add.text(width / 2, startY + i * spacing, options[i].text, {
        fontSize: '18px',
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
  
  private openStats(): void {
    this.scene.pause();
    this.scene.launch('StatsScene');
  }
  
  private autoSave(): void {
    try {
      // Auto-save to slot 0 (auto-save slot)
      gameSystems.saveGame('auto');
      console.log('Auto-saved game');
    } catch (e) {
      console.warn('Auto-save failed:', e);
    }
  }
  
  private openSaveLoad(): void {
    this.scene.pause();
    this.scene.launch('SaveLoadScene', { mode: 'save' });
  }
  
  private goToMainMenu(): void {
    this.scene.stop('WorldScene');
    this.scene.start('MainMenuScene');
  }
}
