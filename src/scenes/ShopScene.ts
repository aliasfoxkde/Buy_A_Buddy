/**
 * Shop Scene - NPC shop interactions
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';
import { audioManager } from '../audio/AudioManager';

interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'accessory';
  quantity?: number;
}

export class ShopScene extends Phaser.Scene {
  private shopType: string = 'general_store';
  private shopItems: ShopItem[] = [];
  private cart: Map<number, number> = new Map();
  private selectedTab: number = 0;
  private itemContainers: Phaser.GameObjects.Container[] = [];
  
  constructor() {
    super({ key: 'ShopScene' });
  }
  
  init(data: { shopType?: string }): void {
    this.shopType = data.shopType || 'general_store';
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
    
    // Shop header
    this.createShopHeader(width / 2, 50);
    
    // Tab navigation
    this.createTabs(100, 110);
    
    // Items grid
    this.createItemsGrid(100, 170);
    
    // Cart panel
    this.createCartPanel(width - 180, height / 2);
    
    // Player gold
    this.createGoldDisplay(width - 180, 60);
    
    // Close button
    const closeBtn = this.add.rectangle(width - 30, 30, 50, 50, 0xef4444);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width - 30, 30, 'X', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.close());
    
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    
    // Load shop items
    this.loadShopItems();
    
    // Play shop music
    audioManager.playShopMusic();
  }
  
  private createShopHeader(x: number, y: number): void {
    const shopNames: Record<string, string> = {
      'general_store': '🏪 General Store',
      'weapon_shop': '⚔️ Weapon Smith',
      'potion_shop': '🧪 Potion Shop',
      'armor_shop': '🦺 Armor Smith',
      'magic_shop': '✨ Magic Shop'
    };
    
    const name = shopNames[this.shopType] || '🏪 Shop';
    
    const header = this.add.rectangle(x, y, 600, 60, 0x2d1b4e);
    header.setStrokeStyle(3, 0xa855f7);
    
    this.add.text(x, y, name, {
      fontSize: '28px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
  }
  
  private createTabs(x: number, y: number): void {
    const tabs = [
      { text: '⚔️ Weapons', type: 'weapon' },
      { text: '🛡️ Armor', type: 'armor' },
      { text: '🧪 Potions', type: 'consumable' },
      { text: '📦 Materials', type: 'material' }
    ];
    
    tabs.forEach((tab, i) => {
      const tx = x + i * 130;
      const btn = this.add.rectangle(tx, y, 120, 40, i === this.selectedTab ? 0xa855f7 : 0x2d1b4e);
      btn.setStrokeStyle(2, 0xa855f7);
      btn.setInteractive({ useHandCursor: true });
      
      this.add.text(tx, y, tab.text, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff'
      }).setOrigin(0.5);
      
      btn.on('pointerdown', () => {
        this.selectedTab = i;
        this.updateTabs();
        this.filterItems(tab.type);
      });
    });
  }
  
  private updateTabs(): void {
    // Update tab colors
    // This would need to track tab buttons
  }
  
  private createItemsGrid(x: number, y: number): void {
    this.itemContainers = [];
    
    const items = this.getItemsForShop();
    
    for (let i = 0; i < Math.min(items.length, 12); i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      
      const ix = x + col * 200;
      const iy = y + row * 150;
      
      const container = this.createItemCard(ix, iy, items[i], i);
      this.itemContainers.push(container);
    }
  }
  
  private createItemCard(x: number, y: number, item: ShopItem, index: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Card background
    const bg = this.add.rectangle(0, 0, 180, 130, 0x2d1b4e);
    bg.setStrokeStyle(2, 0x555);
    
    // Item icon
    const icon = this.add.text(0, -30, item.icon, {
      fontSize: '40px'
    }).setOrigin(0.5);
    
    // Item name
    const name = this.add.text(0, 15, item.name, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Price
    const priceColor = this.canAfford(item.price) ? '#fbbf24' : '#ef4444';
    const price = this.add.text(0, 40, `💰 ${item.price}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: priceColor
    }).setOrigin(0.5);
    
    // Quantity controls
    const qty = this.cart.get(index) || 0;
    const qtyText = this.add.text(0, 60, qty > 0 ? `x${qty}` : '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
    
    container.add([bg, icon, name, price, qtyText]);
    container.setSize(180, 130);
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerdown', () => {
      this.addToCart(index, item);
    });
    
    container.on('pointerover', () => {
      bg.setStrokeStyle(2, 0xa855f7);
    });
    
    container.on('pointerout', () => {
      bg.setStrokeStyle(2, 0x555);
    });
    
    return container;
  }
  
  private createCartPanel(x: number, y: number): void {
    // Panel
    const panel = this.add.rectangle(x, y, 300, 400, 0x1a1a2e);
    panel.setStrokeStyle(2, 0xa855f7);
    
    // Title
    this.add.text(x, y - 180, '🛒 CART', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Cart items
    this.updateCartDisplay(x, y);
    
    // Total
    const total = this.calculateTotal();
    this.add.text(x, y + 160, `Total: 💰 ${total}`, {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
    
    // Buy button
    const buyBtn = this.add.rectangle(x, y + 200, 200, 50, total > 0 && this.canAfford(total) ? 0x22c55e : 0x555);
    buyBtn.setInteractive({ useHandCursor: total > 0 && this.canAfford(total) });
    
    this.add.text(x, y + 200, 'BUY', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    if (total > 0) {
      buyBtn.on('pointerdown', () => this.purchase());
    }
    
    // Sell button
    const sellBtn = this.add.rectangle(x, y + 260, 200, 40, 0x3b82f6);
    sellBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(x, y + 260, 'SELL ITEMS', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    sellBtn.on('pointerdown', () => this.openSellMode());
  }
  
  private updateCartDisplay(x: number, y: number): void {
    // Clear previous
    // ... would need to track and destroy
    
    let displayY = y - 140;
    let total = 0;
    
    this.cart.forEach((qty, index) => {
      if (qty > 0 && this.shopItems[index]) {
        const item = this.shopItems[index];
        total += item.price * qty;
        
        this.add.text(x - 120, displayY, `${item.icon} ${item.name} x${qty}`, {
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          color: '#fff'
        });
        
        this.add.text(x + 100, displayY, `💰${item.price * qty}`, {
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          color: '#fbbf24'
        }).setOrigin(1, 0);
        
        displayY += 25;
      }
    });
  }
  
  private createGoldDisplay(x: number, y: number): void {
    const gold = gameSystems.inventory.getGold();
    
    this.add.text(x, y, `💰 Gold: ${gold}`, {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
  }
  
  private loadShopItems(): void {
    // Define items based on shop type
    const itemsByShop: Record<string, ShopItem[]> = {
      'general_store': [
        { id: 'potion_health_small', name: 'Small Health Potion', price: 25, icon: '🧪', type: 'consumable' },
        { id: 'potion_mana_small', name: 'Small Mana Potion', price: 30, icon: '💙', type: 'consumable' },
        { id: 'herb_green', name: 'Green Herb', price: 10, icon: '🌿', type: 'material' },
        { id: 'torch', name: 'Torch', price: 15, icon: '🔦', type: 'consumable' },
        { id: 'rope', name: 'Rope', price: 20, icon: '🪢', type: 'material' },
        { id: 'bandage', name: 'Bandage', price: 15, icon: '🩹', type: 'consumable' }
      ],
      'weapon_shop': [
        { id: 'weapon_wooden_sword', name: 'Wooden Sword', price: 50, icon: '⚔️', type: 'weapon' },
        { id: 'weapon_iron_sword', name: 'Iron Sword', price: 150, icon: '🗡️', type: 'weapon' },
        { id: 'weapon_steel_sword', name: 'Steel Sword', price: 400, icon: '⚔️', type: 'weapon' },
        { id: 'weapon_magic_staff', name: 'Magic Staff', price: 300, icon: '🪄', type: 'weapon' },
        { id: 'weapon_bow', name: 'Hunting Bow', price: 120, icon: '🏹', type: 'weapon' }
      ],
      'potion_shop': [
        { id: 'potion_health_small', name: 'Small HP Potion', price: 25, icon: '🧪', type: 'consumable' },
        { id: 'potion_health_medium', name: 'Medium HP Potion', price: 75, icon: '🧪', type: 'consumable' },
        { id: 'potion_health_large', name: 'Large HP Potion', price: 200, icon: '🧪', type: 'consumable' },
        { id: 'potion_mana_small', name: 'Small MP Potion', price: 30, icon: '💙', type: 'consumable' },
        { id: 'potion_mana_medium', name: 'Medium MP Potion', price: 80, icon: '💙', type: 'consumable' },
        { id: 'antidote', name: 'Antidote', price: 40, icon: '💊', type: 'consumable' }
      ],
      'armor_shop': [
        { id: 'armor_leather', name: 'Leather Armor', price: 100, icon: '🥋', type: 'armor' },
        { id: 'armor_chain', name: 'Chain Mail', price: 250, icon: '🛡️', type: 'armor' },
        { id: 'armor_plate', name: 'Plate Armor', price: 500, icon: '🦺', type: 'armor' },
        { id: 'helmet_iron', name: 'Iron Helmet', price: 80, icon: '⛑️', type: 'armor' },
        { id: 'shield_wooden', name: 'Wooden Shield', price: 60, icon: '🛡️', type: 'armor' }
      ],
      'magic_shop': [
        { id: 'scroll_fireball', name: 'Fireball Scroll', price: 100, icon: '📜', type: 'consumable' },
        { id: 'scroll_heal', name: 'Heal Scroll', price: 80, icon: '📜', type: 'consumable' },
        { id: 'gem_blue', name: 'Blue Gem', price: 150, icon: '💎', type: 'material' },
        { id: 'gem_red', name: 'Red Gem', price: 150, icon: '💎', type: 'material' },
        { id: 'wand_wood', name: 'Wooden Wand', price: 75, icon: '🪄', type: 'weapon' }
      ],
      // Rare items shop
      'rare_shop': [
        { id: 'weapon_silver_sword', name: 'Silver Sword', price: 500, icon: '⚔️', type: 'weapon' },
        { id: 'armor_mithril', name: 'Mithril Armor', price: 800, icon: '🥋', type: 'armor' },
        { id: 'potion_health_legendary', name: 'Legendary HP Potion', price: 300, icon: '🧪', type: 'consumable' },
        { id: 'ring_power', name: 'Ring of Power', price: 600, icon: '💍', type: 'accessory' },
        { id: 'amulet_luck', name: 'Amulet of Luck', price: 400, icon: '📿', type: 'accessory' }
      ]
    };
    
    this.shopItems = itemsByShop[this.shopType] || itemsByShop['general_store'];
  }
  
  private getItemsForShop(): ShopItem[] {
    const types = ['weapon', 'armor', 'consumable', 'material'];
    const selectedType = types[this.selectedTab];
    
    return this.shopItems.filter(item => item.type === selectedType);
  }
  
  private filterItems(type: string): void {
    // Clear and recreate items grid
    for (const container of this.itemContainers) {
      container.destroy();
    }
    
    this.createItemsGrid(100, 170);
  }
  
  private addToCart(index: number, item: ShopItem): void {
    const currentQty = this.cart.get(index) || 0;
    const total = this.calculateTotal() + item.price;
    
    if (this.canAfford(total)) {
      this.cart.set(index, currentQty + 1);
    }
  }
  
  private calculateTotal(): number {
    let total = 0;
    
    this.cart.forEach((qty, index) => {
      if (qty > 0 && this.shopItems[index]) {
        total += this.shopItems[index].price * qty;
      }
    });
    
    return total;
  }
  
  private canAfford(amount: number): boolean {
    return gameSystems.inventory.getGold() >= amount;
  }
  
  private purchase(): void {
    const total = this.calculateTotal();
    
    if (!this.canAfford(total)) {
      audioManager.playSound('error');
      this.showMessage('Not enough gold!', 0xef4444);
      return;
    }
    
    // Deduct gold
    gameSystems.inventory.removeGold(total);
    
    // Add items to inventory
    this.cart.forEach((qty, index) => {
      if (qty > 0 && this.shopItems[index]) {
        const item = this.shopItems[index];
        gameSystems.inventory.addItem(item.id, qty);
        audioManager.playCoin();
      }
    });
    
    // Clear cart
    this.cart.clear();
    
    audioManager.playSound('success');
    this.showMessage('Purchase complete!', 0x22c55e);
    
    // Refresh display
    this.scene.restart({ shopType: this.shopType });
  }
  
  private openSellMode(): void {
    // Could implement sell mode to buy back items
    this.showMessage('Coming soon!', 0x888);
  }
  
  private showMessage(text: string, color: number): void {
    const msg = this.add.rectangle(this.scale.width / 2, 300, 300, 60, color);
    msg.setStrokeStyle(2, 0x000);
    
    this.add.text(this.scale.width / 2, 300, text, {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
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
