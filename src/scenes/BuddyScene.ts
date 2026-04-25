// ==========================================
// BUDDY SCENE - Buddy collection and management
// Uses actual sprites from 2302f2f7 and 6f01f97c
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';
import { 
  getAllCharacters, 
  getCharacterConfig, 
  getRarityStyle,
  createAnimatedSprite,
  getCharacterName,
  preloadSprites
} from '../sprites/SpriteRenderer';
import type { BuddyType, CharacterConfig, RarityType } from '../sprites/SpriteRenderer';

interface Buddy {
  id: string;
  type: BuddyType;
  nickname?: string;
  level: number;
  exp: number;
  expToLevel: number;
  stats: { hp: number; atk: number; def: number; spd: number };
  rarity: RarityType;
  obtained: number;
}

export class BuddyScene extends Phaser.Scene {
  private buddies: Buddy[] = [];
  private selectedBuddy: Buddy | null = null;
  private buddyCards: Phaser.GameObjects.Container[] = [];
  private previewSprite: Phaser.GameObjects.Sprite | null = null;
  private readonly CARDS_PER_PAGE = 6;

  constructor() {
    super({ key: 'BuddyScene' });
  }

  preload(): void {
    preloadSprites(this);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.loadBuddies();
    this.createBackground();
    this.createHeader();
    this.createBuddyGrid();
    this.createStatsPanel();
    this.createBackButton();
    
    console.log(`🐾 Buddy Scene - ${this.buddies.length} buddies collected`);
  }

  private loadBuddies(): void {
    // Load from localStorage or initialize starter buddy
    const saved = localStorage.getItem('buyabuddy_buddies');
    if (saved) {
      try {
        this.buddies = JSON.parse(saved);
      } catch {
        this.buddies = this.getStarterBuddies();
      }
    } else {
      this.buddies = this.getStarterBuddies();
    }
  }

  private getStarterBuddies(): Buddy[] {
    const starters: BuddyType[] = ['char_1_1', 'char_1_2', 'char_1_3'];
    return starters.map((type, i) => {
      const config = getCharacterConfig(type)!;
      return {
        id: `buddy_${Date.now()}_${i}`,
        type,
        nickname: config.name,
        level: 1,
        exp: 0,
        expToLevel: 100,
        stats: { ...config.stats },
        rarity: config.rarity,
        obtained: Date.now(),
      };
    });
  }

  private saveBuddies(): void {
    localStorage.setItem('buyabuddy_buddies', JSON.stringify(this.buddies));
  }

  private createBackground(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a0a2e, 0x1a0a2e, 1);
    bg.fillRect(0, 0, w, h);
    
    // Floating hearts
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, w - 50);
      const y = Phaser.Math.Between(100, h - 100);
      const heart = this.add.text(x, y, '💜', {
        fontSize: Phaser.Math.Between(12, 24) + 'px',
      }).setAlpha(Phaser.Math.FloatBetween(0.15, 0.4));
      
      this.tweens.add({
        targets: heart,
        y: y - 30,
        alpha: 0.05,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createHeader(): void {
    const w = this.scale.width;
    
    const header = this.add.graphics();
    header.fillStyle(0x1a0a2e, 0.95);
    header.fillRect(0, 0, w, 70);
    header.lineStyle(3, 0xa855f7, 0.7);
    header.lineBetween(0, 70, w, 70);
    
    this.add.text(w / 2, 25, '✦ MY BUDDIES ✦', {
      fontSize: '22px',
      fontFamily: 'Georgia, serif',
      color: '#a855f7',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    this.add.text(w / 2, 50, `${this.buddies.length} collected`, {
      fontSize: '12px',
      color: '#888888',
    }).setOrigin(0.5);
  }

  private createBuddyGrid(): void {
    const w = this.scale.width;
    const startY = 80;
    const cols = 3;
    const cardW = (w - 50) / cols;
    const cardH = 130;
    const spacing = 8;
    
    if (this.buddies.length === 0) {
      this.add.text(w / 2, startY + 100, 'No buddies yet!\nStart your adventure to find some.', {
        fontSize: '16px',
        color: '#666666',
        align: 'center',
      }).setOrigin(0.5);
      return;
    }
    
    this.buddies.forEach((buddy, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (cardW + spacing);
      const y = startY + row * (cardH + spacing);
      this.createBuddyCard(buddy, x, y, cardW, cardH);
    });
  }

  private createBuddyCard(buddy: Buddy, x: number, y: number, w: number, h: number): void {
    const card = this.add.container(x, y);
    const rarityStyle = getRarityStyle(buddy.rarity as RarityType);
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.95);
    bg.fillRoundedRect(0, 0, w, h, 12);
    bg.lineStyle(2, rarityStyle.border, 0.8);
    bg.strokeRoundedRect(0, 0, w, h, 12);
    card.add(bg);
    
    // Character sprite
    const sprite = createAnimatedSprite(this, buddy.type as BuddyType, 45, h / 2 - 5, 0.32);
    if (sprite) card.add(sprite);
    
    // Level badge
    const levelBadge = this.add.graphics();
    levelBadge.fillStyle(0xa855f7, 1);
    levelBadge.fillCircle(w - 18, 16, 14);
    card.add(levelBadge);
    
    this.add.text(w - 18, 16, `L${buddy.level}`, {
      fontSize: '9px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Nickname
    this.add.text(85, 12, buddy.nickname || getCharacterName(buddy.type as BuddyType), {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0);
    
    // Stats preview
    this.add.text(85, 35, `HP ${buddy.stats.hp}  ATK ${buddy.stats.atk}`, {
      fontSize: '10px',
      color: '#aaa',
    });
    
    // EXP bar
    const expBar = this.add.graphics();
    expBar.fillStyle(0x1a1a2e, 1);
    expBar.fillRoundedRect(85, 55, 100, 8, 3);
    expBar.fillStyle(0xa855f7, 1);
    expBar.fillRoundedRect(85, 55, (buddy.exp / buddy.expToLevel) * 100, 8, 3);
    card.add(expBar);
    
    // Rarity indicator
    const rareStar = this.add.text(w - 18, h - 16, '★', {
      fontSize: '14px',
      color: '#' + rarityStyle.badge.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);
    card.add(rareStar);
    
    // Hit area
    const hit = this.add.rectangle(w / 2, h / 2, w + 10, h + 10)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    card.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.selectBuddy(buddy, card);
    });
    
    hit.on('pointerover', () => {
      this.tweens.add({ targets: card, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    
    hit.on('pointerout', () => {
      this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    this.buddyCards.push(card);
  }

  private selectBuddy(buddy: Buddy, card: Phaser.GameObjects.Container): void {
    this.selectedBuddy = buddy;
    
    this.buddyCards.forEach(c => {
      const isSelected = c === card;
      this.tweens.add({
        targets: c,
        scaleX: isSelected ? 1.1 : 1,
        scaleY: isSelected ? 1.1 : 1,
        duration: 200,
      });
    });
    
    this.updateStatsPanel(buddy);
    this.updatePreview(buddy);
  }

  private updatePreview(buddy: Buddy): void {
    if (this.previewSprite) {
      this.previewSprite.destroy();
    }
    
    const sprite = createAnimatedSprite(this, buddy.type as BuddyType, 60, this.scale.height - 70, 0.5);
    if (sprite) {
      this.previewSprite = sprite;
    }
  }

  private createStatsPanel(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const panelY = h - 135;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a0a2e, 0.95);
    panel.fillRoundedRect(15, panelY, w - 30, 120, 12);
    panel.lineStyle(2, 0xa855f7, 0.6);
    panel.strokeRoundedRect(15, panelY, w - 30, 120, 12);
    
    this.add.text(w / 2, panelY + 60, '✦ Tap a buddy to view ✦', {
      fontSize: '14px',
      color: '#555',
      fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private updateStatsPanel(buddy: Buddy): void {
    const w = this.scale.width;
    const panelY = this.scale.height - 135;
    const rarityStyle = getRarityStyle(buddy.rarity as RarityType);
    
    // Clear previous stats (simple approach - just add new ones)
    // In production you'd track these objects to destroy them
    
    // Name and level
    this.add.text(130, panelY + 15, buddy.nickname || getCharacterName(buddy.type as BuddyType), {
      fontSize: '22px',
      color: '#fff',
      fontStyle: 'bold',
    });
    
    this.add.text(290, panelY + 18, `Lv.${buddy.level}`, {
      fontSize: '12px',
      color: '#a855f7',
    });
    
    // Stats display
    const statsY = panelY + 60;
    
    // HP bar
    this.add.text(130, statsY, 'HP', { fontSize: '10px', color: '#22c55e' });
    const hpBar = this.add.graphics();
    hpBar.fillStyle(0x1a1a2e, 1);
    hpBar.fillRoundedRect(155, statsY - 2, 80, 10, 3);
    hpBar.fillStyle(0x22c55e, 1);
    hpBar.fillRoundedRect(155, statsY - 2, (buddy.stats.hp / 100) * 80, 10, 3);
    
    // ATK bar
    this.add.text(130, statsY + 15, 'ATK', { fontSize: '10px', color: '#ef4444' });
    const atkBar = this.add.graphics();
    atkBar.fillStyle(0x1a1a2e, 1);
    atkBar.fillRoundedRect(155, statsY + 13, 80, 10, 3);
    atkBar.fillStyle(0xef4444, 1);
    atkBar.fillRoundedRect(155, statsY + 13, (buddy.stats.atk / 25) * 80, 10, 3);
    
    // DEF/SPD
    this.add.text(260, statsY + 3, `DEF ${buddy.stats.def}`, { fontSize: '12px', color: '#3b82f6', fontStyle: 'bold' });
    this.add.text(260, statsY + 18, `SPD ${buddy.stats.spd}`, { fontSize: '12px', color: '#f59e0b', fontStyle: 'bold' });
    
    // EXP progress
    this.add.text(130, statsY + 38, `EXP: ${buddy.exp}/${buddy.expToLevel}`, { fontSize: '10px', color: '#888' });
  }

  private createBackButton(): void {
    const btn = this.add.container(38, 35);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.95);
    bg.fillRoundedRect(-18, -18, 36, 36, 8);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-18, -18, 36, 36, 8);
    btn.add(bg);
    
    this.add.text(0, 0, '←', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    
    const hit = this.add.rectangle(0, 0, 50, 50).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.cameras.main.fadeOut(300, 13, 13, 26);
      this.time.delayedCall(300, () => this.scene.start('MenuScene'));
    });
  }
}