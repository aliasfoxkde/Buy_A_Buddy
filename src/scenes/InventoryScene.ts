/**
 * Inventory Scene
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

export class InventoryScene extends Phaser.Scene {
  private slots: Phaser.GameObjects.Container[] = [];
  private equipmentSlots: Phaser.GameObjects.Container[] = [];
  private selectedSlot: number = -1;
  
  constructor() {
    super({ key: 'InventoryScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
    
    // Title
    this.add.text(width / 2, 40, 'INVENTORY', {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Stats display
    this.createStats(width / 2, 100);
    
    // Equipment slots
    this.createEquipment(width / 2, 180);
    
    // Inventory grid
    this.createInventoryGrid(100, 350);
    
    // Gold display
    const gold = gameSystems.inventory.getGold();
    this.add.text(width - 100, 40, `💰 ${gold}`, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
    
    // Close button
    const closeBtn = this.add.rectangle(width - 50, height - 50, 80, 50, 0xef4444);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width - 50, height - 50, 'CLOSE', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.close());
    
    // Keyboard
    this.input.keyboard?.on('keydown-I', () => this.close());
    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }
  
  private createStats(x: number, y: number): void {
    const stats = gameSystems.getPlayerStats();
    if (!stats) return;
    
    const statText = [
      `LVL ${stats.level}`,
      `HP: ${stats.health}/${stats.maxHealth}`,
      `MP: ${stats.mana}/${stats.maxMana}`,
      `ATK: ${stats.attack}`,
      `DEF: ${stats.defense}`,
      `SPD: ${stats.speed}`,
      `LCK: ${stats.luck}`
    ].join('\n');
    
    this.add.text(x, y, statText, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
      align: 'left',
      lineSpacing: 8
    }).setOrigin(0, 0);
  }
  
  private createEquipment(x: number, y: number): void {
    const slotNames = ['HEAD', 'CHEST', 'WEAPON', 'SHIELD', 'BOOTS', 'RING1', 'RING2'];
    const slotTypes = ['head', 'chest', 'weapon', 'shield', 'boots', 'accessory1', 'accessory2'] as const;
    
    const startX = x - 250;
    
    for (let i = 0; i < 7; i++) {
      const slotX = startX + (i % 4) * 130;
      const slotY = y + Math.floor(i / 4) * 130;
      
      const container = this.add.container(slotX, slotY);
      
      const bg = this.add.rectangle(0, 0, 100, 100, 0x2d1b4e);
      bg.setStrokeStyle(2, 0x555);
      
      const label = this.add.text(0, -55, slotNames[i], {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#888'
      }).setOrigin(0.5);
      
      const icon = this.add.text(0, 0, '—', {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        color: '#444'
      }).setOrigin(0.5);
      
      container.add([bg, label, icon]);
      container.setSize(100, 100);
      container.setInteractive({ useHandCursor: true });
      
      this.equipmentSlots.push(container);
    }
  }
  
  private createInventoryGrid(startX: number, startY: number): void {
    const inventory = gameSystems.inventory.getInventory();
    
    for (let i = 0; i < 24; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      
      const x = startX + col * 90;
      const y = startY + row * 90;
      
      const container = this.add.container(x, y);
      
      const bg = this.add.rectangle(0, 0, 80, 80, 0x2d1b4e);
      bg.setStrokeStyle(1, 0x3d2b5e);
      
      const countText = this.add.text(60, 60, '', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff'
      }).setOrigin(1, 1);
      
      // Add item if exists
      const slot = inventory.slots[i];
      if (slot && slot.itemId) {
        const itemIcon = this.add.text(0, 0, this.getItemEmoji(slot.itemId), {
          fontSize: '36px'
        }).setOrigin(0.5);
        
        if (slot.quantity > 1) {
          countText.setText(slot.quantity.toString());
        }
        
        container.add([bg, itemIcon, countText]);
      } else {
        container.add([bg, countText]);
      }
      
      container.setSize(80, 80);
      container.setInteractive({ useHandCursor: true });
      
      container.on('pointerdown', () => {
        this.selectSlot(i);
      });
      
      this.slots.push(container);
    }
  }
  
  private getItemEmoji(itemId: string): string {
    if (itemId.includes('sword')) return '⚔️';
    if (itemId.includes('potion')) return '🧪';
    if (itemId.includes('armor')) return '🛡️';
    if (itemId.includes('herb')) return '🌿';
    if (itemId.includes('key')) return '🔑';
    if (itemId.includes('scroll')) return '📜';
    if (itemId.includes('ring')) return '💍';
    if (itemId.includes('amulet')) return '📿';
    if (itemId.includes('coin')) return '🪙';
    if (itemId.includes('gem')) return '💎';
    return '📦';
  }
  
  private selectSlot(index: number): void {
    // Highlight selected
    this.slots.forEach((slot, i) => {
      const bg = slot.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(1, i === index ? 0x22c55e : 0x3d2b5e);
    });
    
    this.selectedSlot = index;
    
    // Could show item tooltip or context menu
  }
  
  private close(): void {
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
