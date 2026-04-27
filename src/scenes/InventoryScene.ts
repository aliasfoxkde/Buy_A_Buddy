/**
 * Inventory Scene
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';
import { SetBonusDisplay } from '../ui/SetBonusDisplay';
import { TooltipManager } from '../ui/TooltipManager';

export class InventoryScene extends Phaser.Scene {
  private slots: Phaser.GameObjects.Container[] = [];
  private equipmentSlots: Phaser.GameObjects.Container[] = [];
  private selectedSlot: number = -1;
  private tooltip!: TooltipManager;
  private setBonusDisplay!: SetBonusDisplay;
  private showSetBonus: boolean = false;
  
  constructor() {
    super({ key: 'InventoryScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Initialize tooltip manager
    this.tooltip = new TooltipManager(this);
    
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
    
    // Set bonus display button
    this.createSetBonusButton(width / 2, 290);
    
    // Equipment slots
    this.createEquipment(width / 2, 340);
    
    // Inventory grid
    this.createInventoryGrid(100, 500);
    
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
    
    // Set bonus display (right side panel)
    this.setBonusDisplay = new SetBonusDisplay(this);
    this.setBonusDisplay.create(width - 300, 400);
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
  
  private createSetBonusButton(x: number, y: number): void {
    const btn = this.add.rectangle(x, y, 180, 40, 0x4c1d95);
    btn.setStrokeStyle(2, 0xfbbf24);
    btn.setInteractive({ useHandCursor: true });
    
    const btnText = this.add.text(x, y, '🎯 SET BONUSES', {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
    
    btn.on('pointerover', () => {
      btn.setFillStyle(0x5b21b6);
    });
    
    btn.on('pointerout', () => {
      btn.setFillStyle(0x4c1d95);
    });
    
    btn.on('pointerdown', () => {
      this.toggleSetBonus();
    });
  }
  
  private toggleSetBonus(): void {
    this.showSetBonus = !this.showSetBonus;
    
    if (this.showSetBonus) {
      // Get equipped items
      const equippedIds = gameSystems.inventory.getEquippedItemIds();
      this.setBonusDisplay.show(equippedIds);
    } else {
      this.setBonusDisplay.hide();
    }
  }
  
  private createEquipment(x: number, y: number): void {
    const slotNames = ['HEAD', 'CHEST', 'WEAPON', 'SHIELD', 'BOOTS', 'RING1', 'RING2'];
    
    const startX = x - 250;
    
    // Get equipped items
    const equipped = gameSystems.inventory.getEquipment();
    
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
      
      // Check if slot has item
      const slot = equipped[i];
      let iconText = '—';
      let iconColor = '#444';
      
      if (slot?.item) {
        iconText = this.getItemEmoji(slot.item.id);
        iconColor = '#fff';
      }
      
      const icon = this.add.text(0, 0, iconText, {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        color: iconColor
      }).setOrigin(0.5);
      
      container.add([bg, label, icon]);
      container.setSize(100, 100);
      container.setInteractive({ useHandCursor: true });
      
      // Add tooltip for equipment slots
      container.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        if (slot?.item) {
          this.tooltip.showItemTooltip(slot.item.id, pointer.x, pointer.y, { slot: i });
        } else {
          this.tooltip.showInfoTooltip(slotNames[i] + ' (Empty)', pointer.x, pointer.y);
        }
      });
      
      container.on('pointerout', () => {
        this.tooltip.hide();
      });
      
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
      
      // Add hover tooltip for items
      container.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        if (slot && slot.itemId) {
          this.tooltip.showItemTooltip(slot.itemId, pointer.x, pointer.y, {
            quantity: slot.quantity,
            slot: i
          });
        }
      });
      
      container.on('pointerout', () => {
        this.tooltip.hide();
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
    if (itemId.includes('bow')) return '🏹';
    if (itemId.includes('staff')) return '🪄';
    if (itemId.includes('dagger')) return '🗡️';
    if (itemId.includes('cloak')) return '🧥';
    if (itemId.includes('boots')) return '👢';
    if (itemId.includes('spear')) return '🔱';
    return '📦';
  }
  
  private selectSlot(index: number): void {
    // Highlight selected
    this.slots.forEach((slot, i) => {
      const bg = slot.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(1, i === index ? 0x22c55e : 0x3d2b5e);
    });
    
    this.selectedSlot = index;
  }
  
  private close(): void {
    if (this.tooltip) {
      this.tooltip.hide();
    }
    this.setBonusDisplay.destroy();
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
