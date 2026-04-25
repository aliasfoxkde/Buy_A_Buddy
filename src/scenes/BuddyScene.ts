// ==========================================
// BUDDY SCENE - Buddy collection and management
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';
import { GameStateService } from '../services/GameStateService';
import { getCharacterName, getAllCharacterTypes, generateName } from '../sprites/SpriteRenderer';
import type { BuddyType, RarityType } from '../sprites/SpriteRenderer';

export class BuddyScene extends Phaser.Scene {
  private stateService = GameStateService.getInstance();
  private buddies: any[] = [];
  private selectedBuddy: any = null;
  private buddyCards: Phaser.GameObjects.Container[] = [];
  
  constructor() {
    super({ key: 'BuddyScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.buddies = this.stateService.getState().buddies;
    
    // Create header
    this.createHeader();
    
    // Create buddy list
    this.createBuddyList();
    
    // Create detail panel
    this.createDetailPanel();
    
    // Create actions
    this.createActions();
    
    // Create back button
    this.createBackButton();
    
    console.log('🐾 Buddy collection opened');
  }

  private createHeader(): void {
    const width = this.scale.width;
    
    // Header background
    const header = this.add.graphics();
    header.fillStyle(0x1a0a2e, 0.95);
    header.fillRect(0, 0, width, 70);
    header.lineStyle(2, 0xa855f7, 0.5);
    header.lineBetween(0, 70, width, 70);
    
    // Title
    this.add.text(width / 2, 35, '🐾 Your Buddies', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Count
    this.add.text(20, 35, `${this.buddies.length} Buddies`, {
      fontSize: '14px',
      color: COLORS.textSecondary,
    }).setOrigin(0, 0.5);
  }

  private createBuddyList(): void {
    const startY = 90;
    const cardHeight = 80;
    const cardSpacing = 10;
    
    // If no buddies, show message
    if (this.buddies.length === 0) {
      this.add.text(this.scale.width / 2, this.scale.height / 2, 'No buddies yet!\nGo catch some!', {
        fontSize: '18px',
        color: '#666666',
        align: 'center',
      }).setOrigin(0.5);
      return;
    }
    
    this.buddies.forEach((buddy, index) => {
      const y = startY + index * (cardHeight + cardSpacing);
      
      const card = this.createBuddyCard(buddy, y);
      this.buddyCards.push(card);
    });
  }

  private createBuddyCard(buddy: any, y: number): Phaser.GameObjects.Container {
    const width = this.scale.width;
    const card = this.add.container(0, y);
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(20, 0, width - 40, 70, 10);
    bg.lineStyle(2, this.getRarityColor(buddy.rarity), 0.6);
    bg.strokeRoundedRect(20, 0, width - 40, 70, 10);
    card.add(bg);
    
    // Buddy icon (colored circle)
    const iconBg = this.add.graphics();
    iconBg.fillStyle(this.getRarityColor(buddy.rarity), 1);
    iconBg.fillCircle(60, 35, 25);
    card.add(iconBg);
    
    // Buddy icon emoji
    const icon = this.add.text(60, 35, this.getBuddyEmoji(buddy.type), {
      fontSize: '28px',
    }).setOrigin(0.5);
    card.add(icon);
    
    // Name
    this.add.text(110, 20, buddy.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0);
    
    // Type & Level
    this.add.text(110, 45, `${buddy.type} • Lv.${buddy.level}`, {
      fontSize: '14px',
      color: COLORS.textSecondary,
    }).setOrigin(0, 0);
    
    // HP bar
    const hpBar = this.add.graphics();
    hpBar.fillStyle(0x2d1b4e, 1);
    hpBar.fillRoundedRect(250, 25, 80, 12, 4);
    const hpFill = (buddy.hp / buddy.maxHp) * 76;
    hpBar.fillStyle(0x22c55e, 1);
    hpBar.fillRoundedRect(252, 27, Math.max(0, hpFill), 8, 2);
    card.add(hpBar);
    
    // HP text
    this.add.text(335, 31, `${buddy.hp}/${buddy.maxHp}`, {
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(0, 0);
    
    // Rarity indicator
    const rarityIcon = this.add.text(width - 50, 35, this.getRarityIcon(buddy.rarity), {
      fontSize: '24px',
    }).setOrigin(0.5);
    card.add(rarityIcon);
    
    // Hit area
    const hit = this.add.rectangle(width / 2, 35, width - 40, 70).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    card.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.selectBuddy(buddy);
    });
    
    hit.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x4d3b6e, 1);
      bg.fillRoundedRect(20, 0, width - 40, 70, 10);
      bg.lineStyle(3, this.getRarityColor(buddy.rarity), 0.9);
      bg.strokeRoundedRect(20, 0, width - 40, 70, 10);
    });
    
    hit.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2d1b4e, 0.9);
      bg.fillRoundedRect(20, 0, width - 40, 70, 10);
      bg.lineStyle(2, this.getRarityColor(buddy.rarity), 0.6);
      bg.strokeRoundedRect(20, 0, width - 40, 70, 10);
    });
    
    return card;
  }

  private createDetailPanel(): void {
    // Placeholder for selected buddy details
    // In full implementation, this would show stats, abilities, etc.
  }

  private selectBuddy(buddy: any): void {
    this.selectedBuddy = buddy;
    // Update detail panel with selected buddy info
  }

  private createActions(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Add buddy button
    const addBtn = this.add.container(width - 80, height - 80);
    
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillCircle(0, 0, 35);
    bg.lineStyle(3, 0xffffff, 0.5);
    bg.strokeCircle(0, 0, 35);
    addBtn.add(bg);
    
    const icon = this.add.text(0, 0, '+', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    addBtn.add(icon);
    
    const hit = this.add.rectangle(0, 0, 80, 80).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    addBtn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      // Add new buddy (for testing)
      this.addTestBuddy();
    });
    
    hit.on('pointerover', () => {
      this.tweens.add({ targets: addBtn, scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });
    
    hit.on('pointerout', () => {
      this.tweens.add({ targets: addBtn, scaleX: 1, scaleY: 1, duration: 100 });
    });
  }

  private addTestBuddy(): void {
    const types: BuddyType[] = ['buddy1', 'buddy2', 'buddy3', 'buddy4', 'buddy5', 'buddy6'];
    const rarities: RarityType[] = ['common', 'rare', 'epic', 'legendary'];
    const weights = [60, 25, 12, 3];
    
    // Weighted rarity roll
    const roll = Math.random() * 100;
    let rarity: RarityType = 'common';
    let cumulative = 0;
    for (let i = 0; i < rarities.length; i++) {
      cumulative += weights[i];
      if (roll < cumulative) {
        rarity = rarities[i];
        break;
      }
    }
    
    const buddy = {
      id: `buddy_${Date.now()}`,
      name: generateName(),
      type: types[Math.floor(Math.random() * types.length)],
      rarity,
      level: 1,
      hp: 80,
      maxHp: 80,
      atk: 12,
      def: 8,
      speed: 15,
    };
    
    this.stateService.processAction({ type: 'ADD_BUDDY', payload: buddy });
    
    // Show spawn effect
    this.showSpawnEffect();
    
    // Reload scene
    this.time.delayedCall(500, () => {
      this.scene.restart();
    });
  }

  private showSpawnEffect(): void {
    const x = this.scale.width / 2;
    const y = this.scale.height / 2;
    
    // Particle burst
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const particle = this.add.graphics();
      particle.fillStyle(0xFFD700, 1);
      particle.fillCircle(0, 0, 6);
      particle.x = x;
      particle.y = y;
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 150,
        y: y + Math.sin(angle) * 150,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
    
    // Central flash
    const flash = this.add.graphics();
    flash.fillStyle(0xFFD700, 0.8);
    flash.fillCircle(x, y, 20);
    flash.setAlpha(1);
    
    this.tweens.add({
      targets: flash,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 600,
      onComplete: () => flash.destroy(),
    });
  }

  private createBackButton(): void {
    const backBtn = this.add.container(35, 35);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(-18, -18, 36, 36, 8);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-18, -18, 36, 36, 8);
    backBtn.add(bg);
    
    const icon = this.add.text(0, 0, '←', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.add(icon);
    
    const hit = this.add.rectangle(0, 0, 46, 46).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    backBtn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.scene.stop();
    });
  }

  private getRarityColor(rarity: RarityType): number {
    const colors: Record<RarityType, number> = {
      common: 0x87CEEB,
      rare: 0x9370DB,
      epic: 0xFF69B4,
      legendary: 0xFFD700,
    };
    return colors[rarity] || colors.common;
  }

  private getRarityIcon(rarity: RarityType): string {
    const icons: Record<RarityType, string> = {
      common: '⬜',
      rare: '💜',
      epic: '💖',
      legendary: '💛',
    };
    return icons[rarity] || icons.common;
  }

  private getBuddyEmoji(type: string): string {
    const emojis: Record<string, string> = {
      slime: '🟢',
      fairy: '🧚',
      angel: '👼',
      demon: '😈',
      shadow: '👻',
      crystal: '💎',
      nature: '🌿',
      fire: '🔥',
      golden: '⭐',
    };
    return emojis[type] || '😊';
  }
}