/**
 * Save/Load Scene - Game save slot management
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

interface SaveSlot {
  slotId: number;
  timestamp: number;
  playerName: string;
  level: number;
  playTime: string;
  zone: string;
  quests: number;
}

export class SaveLoadScene extends Phaser.Scene {
  private mode: 'save' | 'load' = 'load';
  private slots: SaveSlot[] = [];
  private slotContainers: Phaser.GameObjects.Container[] = [];
  private selectedSlot: number = -1;
  
  constructor() {
    super({ key: 'SaveLoadScene' });
  }
  
  init(data: { mode?: 'save' | 'load' }): void {
    this.mode = data.mode || 'load';
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
    
    // Title
    const titleText = this.mode === 'save' ? 'SAVE GAME' : 'LOAD GAME';
    const titleColor = this.mode === 'save' ? '#22c55e' : '#3b82f6';
    
    this.add.text(width / 2, 50, titleText, {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: titleColor
    }).setOrigin(0.5);
    
    // Load save slots
    this.loadSlots();
    
    // Create slot display
    this.createSlotDisplay(width / 2, 180);
    
    // Create buttons
    this.createButtons(width / 2, height - 80);
    
    // Close button
    const closeBtn = this.add.rectangle(width - 50, 50, 80, 50, 0xef4444);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width - 50, 50, 'X', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.close());
    
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-ENTER', () => this.confirm());
  }
  
  private loadSlots(): void {
    // Get saved games from storage
    const savedGames = gameSystems.storage.getAllSaves();
    
    this.slots = [];
    
    // Create slot data from saved games
    for (let i = 0; i < 6; i++) {
      const saveData = savedGames[i] as any;
      
      if (saveData && saveData.player) {
        this.slots.push({
          slotId: i,
          timestamp: saveData.timestamp || 0,
          playerName: saveData.player.name || 'Unknown',
          level: saveData.player.stats?.level || 1,
          playTime: this.formatPlayTime(saveData.player.playTime || 0),
          zone: saveData.zone || 'Unknown',
          quests: 0 // Would need to track this
        });
      } else {
        // Empty slot
        this.slots.push({
          slotId: i,
          timestamp: 0,
          playerName: 'Empty',
          level: 0,
          playTime: '0:00',
          zone: '-',
          quests: 0
        });
      }
    }
  }
  
  private formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  
  private createSlotDisplay(x: number, startY: number): void {
    this.slotContainers = [];
    
    for (let i = 0; i < 3; i++) {
      const y = startY + i * 150;
      
      // Left slot
      const leftSlot = this.createSlotCard(x - 250, y, this.slots[i], i);
      this.slotContainers.push(leftSlot);
      
      // Right slot
      const rightSlot = this.createSlotCard(x + 250, y, this.slots[i + 3], i + 3);
      this.slotContainers.push(rightSlot);
    }
  }
  
  private createSlotCard(x: number, y: number, slot: SaveSlot, index: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Background
    const bg = this.add.rectangle(0, 0, 400, 130, 0x2d1b4e);
    bg.setStrokeStyle(2, index === this.selectedSlot ? 0xa855f7 : 0x555);
    
    // Slot number
    const slotNumBg = this.add.rectangle(-170, -50, 40, 30, 0xa855f7);
    this.add.text(-170, -50, `${index + 1}`, {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Player name
    const name = this.add.text(-130, -50, slot.playerName, {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: slot.timestamp > 0 ? '#fff' : '#666'
    });
    
    // Level badge
    if (slot.level > 0) {
      const levelBadge = this.add.rectangle(150, -50, 60, 30, 0x22c55e);
      this.add.text(150, -50, `LV ${slot.level}`, {
        fontSize: '14px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff'
      }).setOrigin(0.5);
    }
    
    // Stats row
    const statsY = -15;
    
    // Zone
    this.add.text(-180, statsY, 'Zone:', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    });
    this.add.text(-100, statsY, slot.zone, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    });
    
    // Play time
    this.add.text(50, statsY, 'Time:', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    });
    this.add.text(110, statsY, slot.playTime, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    });
    
    // Quests
    this.add.text(-180, statsY + 25, 'Quests:', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    });
    this.add.text(-110, statsY + 25, `${slot.quests} completed`, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    });
    
    // Timestamp
    if (slot.timestamp > 0) {
      const date = new Date(slot.timestamp);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      this.add.text(50, statsY + 25, dateStr, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: '#666'
      });
    } else {
      this.add.text(50, statsY + 25, 'No save data', {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#555'
      });
    }
    
    container.add([bg, slotNumBg, name]);
    container.setSize(400, 130);
    container.setInteractive({ useHandCursor: true });
    
    // Selection highlight
    container.on('pointerdown', () => {
      this.selectedSlot = index;
      this.updateSlotSelection();
    });
    
    container.on('pointerover', () => {
      if (index !== this.selectedSlot) {
        bg.setStrokeStyle(2, 0x888);
      }
    });
    
    container.on('pointerout', () => {
      if (index !== this.selectedSlot) {
        bg.setStrokeStyle(2, 0x555);
      }
    });
    
    return container;
  }
  
  private updateSlotSelection(): void {
    this.slotContainers.forEach((container, i) => {
      const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(2, i === this.selectedSlot ? 0xa855f7 : 0x555);
    });
  }
  
  private createButtons(x: number, y: number): void {
    // Confirm button
    const confirmText = this.mode === 'save' ? 'SAVE' : 'LOAD';
    const confirmColor = this.mode === 'save' ? 0x22c55e : 0x3b82f6;
    
    const confirmBtn = this.add.rectangle(x - 150, y, 200, 60, confirmColor);
    confirmBtn.setStrokeStyle(2, 0xfff);
    confirmBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(x - 150, y, confirmText, {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    confirmBtn.on('pointerdown', () => this.confirm());
    
    // Delete button (only show for existing saves)
    const deleteBtn = this.add.rectangle(x + 150, y, 200, 60, 0xef4444);
    deleteBtn.setStrokeStyle(2, 0xfff);
    deleteBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(x + 150, y, 'DELETE', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    deleteBtn.on('pointerdown', () => this.deleteSlot());
    
    // Auto-save button
    const autoSaveBtn = this.add.rectangle(x, y, 180, 50, 0x7c3aed);
    autoSaveBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(x, y, 'AUTO-SAVE', {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    autoSaveBtn.on('pointerdown', () => this.autoSave());
  }
  
  private confirm(): void {
    if (this.selectedSlot < 0) {
      this.showMessage('Select a slot first!', 0xef4444);
      return;
    }
    
    if (this.mode === 'save') {
      this.saveGame(this.selectedSlot);
    } else {
      this.loadGame(this.selectedSlot);
    }
  }
  
  private saveGame(slotIndex: number): void {
    // Get current game state
    const stats = gameSystems.getPlayerStats();
    if (!stats) {
      this.showMessage('No game data to save!', 0xef4444);
      return;
    }
    
    // Create save data
    const saveData = {
      slotId: slotIndex,
      timestamp: Date.now(),
      playerName: stats.name || 'Hero',
      level: stats.level,
      playTime: gameSystems.storage.getPlayTime(),
      zone: 'village_start',
      completedQuests: 0,
      gold: stats.gold,
      health: stats.health,
      mana: stats.mana,
      experience: stats.experience,
      inventory: gameSystems.inventory.getInventory(),
      quests: gameSystems.quests.getActiveQuests()
    };
    
    // Save to storage
    const success = gameSystems.storage.saveGame(saveData as any, slotIndex);
    
    if (success) {
      this.showMessage('Game saved!', 0x22c55e);
      
      // Reload slots
      this.loadSlots();
      this.scene.restart({ mode: this.mode });
    } else {
      this.showMessage('Save failed!', 0xef4444);
    }
  }
  
  private loadGame(slotIndex: number): void {
    const saveData = gameSystems.storage.loadGame(slotIndex);
    
    if (!saveData) {
      this.showMessage('No save data in this slot!', 0xef4444);
      return;
    }
    
    // Restore game state from saveData
    // This would need to restore all systems from save data
    
    this.showMessage('Game loaded!', 0x3b82f6);
    
    // Return to world scene
    this.time.delayedCall(1000, () => {
      this.scene.stop();
      this.scene.start('WorldScene');
    });
  }
  
  private deleteSlot(): void {
    if (this.selectedSlot < 0) {
      this.showMessage('Select a slot first!', 0xef4444);
      return;
    }
    
    // Confirm dialog
    const { width, height } = this.scale;
    
    const confirmBg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x1a1a2e);
    confirmBg.setStrokeStyle(3, 0xef4444);
    
    this.add.text(width / 2, height / 2 - 50, 'Delete this save?', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ef4444'
    }).setOrigin(0.5);
    
    const yesBtn = this.add.rectangle(width / 2 - 80, height / 2 + 30, 120, 50, 0xef4444);
    yesBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2 - 80, height / 2 + 30, 'YES', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    const noBtn = this.add.rectangle(width / 2 + 80, height / 2 + 30, 120, 50, 0x22c55e);
    noBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2 + 80, height / 2 + 30, 'NO', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    yesBtn.on('pointerdown', () => {
      // Delete save
      gameSystems.storage.deleteSave(this.selectedSlot);
      this.showMessage('Save deleted!', 0x22c55e);
      
      // Reload slots
      this.loadSlots();
      this.scene.restart({ mode: this.mode });
    });
    
    noBtn.on('pointerdown', () => {
      confirmBg.destroy();
      yesBtn.destroy();
      noBtn.destroy();
    });
  }
  
  private autoSave(): void {
    // Save to auto-save slot (usually slot 0)
    const success = gameSystems.storage.saveGame({
      slotId: 0,
      timestamp: Date.now(),
      playerName: 'AutoSave',
      level: 1,
      playTime: 0,
      zone: 'village_start',
      completedQuests: 0,
      gold: 200,
      health: 100,
      mana: 50,
      experience: 0,
      inventory: gameSystems.inventory.getInventory(),
      quests: []
    } as any, 0);
    
    if (success) {
      this.showMessage('Auto-saved!', 0x22c55e);
    } else {
      this.showMessage('Auto-save failed!', 0xef4444);
    }
  }
  
  private showMessage(text: string, color: number): void {
    const { width, height } = this.scale;
    
    const msg = this.add.rectangle(width / 2, height - 150, 300, 50, color);
    msg.setStrokeStyle(2, 0xfff);
    
    this.add.text(width / 2, height - 150, text, {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Flash and fade
    this.tweens.add({
      targets: msg,
      alpha: 0,
      duration: 2000,
      onComplete: () => msg.destroy()
    });
  }
  
  private close(): void {
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
