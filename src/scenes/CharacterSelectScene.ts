// ==========================================
// CHARACTER SELECT SCENE - RPG Character Selection
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';
import type { BuddyType, RarityType } from '../sprites/SpriteRenderer';

interface CharacterOption {
  id: string;
  name: string;
  type: BuddyType;
  rarity: RarityType;
  colors: { primary: string; secondary: string; accent: string };
  description: string;
  stats: { hp: number; atk: number; def: number; spd: number };
}

const CHARACTER_ROSTER: CharacterOption[] = [
  { id: 'bubbleslime', name: 'Bubbleslime', type: 'slime', rarity: 'common', colors: { primary: '#87CEEB', secondary: '#B0E0E6', accent: '#5F9EA0' }, description: 'A bouncy slime buddy.', stats: { hp: 80, atk: 12, def: 8, spd: 15 } },
  { id: 'petalfairy', name: 'Petalfairy', type: 'fairy', rarity: 'common', colors: { primary: '#FFE4E1', secondary: '#FFB6C1', accent: '#FF69B4' }, description: 'A magical fairy.', stats: { hp: 65, atk: 15, def: 6, spd: 20 } },
  { id: 'leafsprout', name: 'Leafsprout', type: 'nature', rarity: 'common', colors: { primary: '#98FB98', secondary: '#90EE90', accent: '#228B22' }, description: 'A nature spirit.', stats: { hp: 95, atk: 10, def: 12, spd: 10 } },
  { id: 'shimmerpuff', name: 'Shimmerpuff', type: 'crystal', rarity: 'rare', colors: { primary: '#E0FFFF', secondary: '#00CED1', accent: '#20B2AA' }, description: 'A crystal being.', stats: { hp: 70, atk: 18, def: 14, spd: 16 } },
  { id: 'darkpuff', name: 'Darkpuff', type: 'shadow', rarity: 'rare', colors: { primary: '#4B0082', secondary: '#8B008B', accent: '#2E0854' }, description: 'A shadow creature.', stats: { hp: 60, atk: 22, def: 8, spd: 25 } },
  { id: 'cloudangel', name: 'Cloudangel', type: 'angel', rarity: 'epic', colors: { primary: '#FFFFFF', secondary: '#E0E7FF', accent: '#87CEEB' }, description: 'A heavenly angel.', stats: { hp: 85, atk: 20, def: 15, spd: 18 } },
  { id: 'blazefire', name: 'Blazefire', type: 'fire', rarity: 'epic', colors: { primary: '#FFDAB9', secondary: '#FFA07A', accent: '#FF4500' }, description: 'A fire spirit.', stats: { hp: 90, atk: 25, def: 10, spd: 14 } },
  { id: 'nightdemon', name: 'Nightdemon', type: 'demon', rarity: 'epic', colors: { primary: '#E6E6FA', secondary: '#9370DB', accent: '#4B0082' }, description: 'A demon.', stats: { hp: 75, atk: 28, def: 12, spd: 22 } },
  { id: 'goldpuff', name: 'Goldpuff', type: 'golden', rarity: 'legendary', colors: { primary: '#FFD700', secondary: '#FFF8DC', accent: '#FFA500' }, description: 'The legendary hero!', stats: { hp: 150, atk: 30, def: 25, spd: 20 } },
];

export class CharacterSelectScene extends Phaser.Scene {
  private selectedCharacter: CharacterOption | null = null;
  private characterCards: Phaser.GameObjects.Container[] = [];

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.createHeader();
    this.createCharacterGrid();
    this.createInfoPanel();
    this.createConfirmButton();
    this.createBackButton();
    console.log('Choose your Hero!');
  }

  private createHeader(): void {
    const w = this.scale.width;
    const header = this.add.graphics();
    header.fillStyle(0x1a0a2e, 0.95);
    header.fillRect(0, 0, w, 90);
    header.lineStyle(2, 0xa855f7, 0.5);
    header.lineBetween(0, 90, w, 90);
    
    this.add.text(w / 2, 35, 'Choose Your Hero', {
      fontSize: '28px', fontFamily: 'Georgia, serif', color: COLORS.primary, fontStyle: 'bold',
    }).setOrigin(0.5);
    
    this.add.text(w / 2, 65, 'Tap a character', {
      fontSize: '14px', color: COLORS.textSecondary,
    }).setOrigin(0.5);
  }

  private createCharacterGrid(): void {
    const w = this.scale.width;
    const startY = 120;
    const cols = 3;
    const cardW = (w - 80) / cols;
    const cardH = 95;
    const spacing = 8;
    
    CHARACTER_ROSTER.forEach((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 30 + col * (cardW + spacing);
      const y = startY + row * (cardH + spacing);
      this.createCard(char, x, y, cardW, cardH);
    });
  }

  private createCard(char: CharacterOption, x: number, y: number, w: number, h: number): void {
    const card = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(0, 0, w, h, 10);
    bg.lineStyle(3, this.getRarityColor(char.rarity), 0.8);
    bg.strokeRoundedRect(0, 0, w, h, 10);
    card.add(bg);
    
    const avatarX = 45, avatarY = h / 2, avatarSize = 32;
    
    const avatarBg = this.add.graphics();
    avatarBg.fillStyle(parseInt(char.colors.primary.replace('#', ''), 16), 1);
    avatarBg.fillCircle(avatarX, avatarY, avatarSize);
    card.add(avatarBg);
    
    this.add.text(85, 15, char.name, { fontSize: '15px', color: '#fff', fontStyle: 'bold' });
    
    const badge = this.add.graphics();
    badge.fillStyle(this.getRarityColor(char.rarity), 0.8);
    badge.fillRoundedRect(85, 35, 60, 16, 4);
    card.add(badge);
    
    this.add.text(115, 43, char.type.toUpperCase(), { fontSize: '9px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    
    this.add.text(85, h - 20, `HP:${char.stats.hp} ATK:${char.stats.atk} DEF:${char.stats.def}`, { fontSize: '9px', color: '#888' });
    
    const hit = this.add.rectangle(w / 2, h / 2, w + 20, h + 20).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    card.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.selectedCharacter = char;
    });
    
    hit.on('pointerover', () => this.tweens.add({ targets: card, scaleX: 1.03, scaleY: 1.03, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100 }));
    
    this.characterCards.push(card);
  }

  private createInfoPanel(): void {
    const w = this.scale.width, h = this.scale.height;
    const panel = this.add.graphics();
    panel.fillStyle(0x1a0a2e, 0.95);
    panel.fillRoundedRect(20, h - 150, w - 40, 130, 12);
    panel.lineStyle(2, 0xa855f7, 0.6);
    panel.strokeRoundedRect(20, h - 150, w - 40, 130, 12);
    
    this.add.text(w / 2, h - 85, 'Select a character', {
      fontSize: '16px', color: '#666', fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private createConfirmButton(): void {
    const w = this.scale.width, h = this.scale.height;
    const btn = this.add.container(w / 2, h - 35);
    
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillRoundedRect(-90, -28, 180, 56, 14);
    btn.add(bg);
    
    this.add.text(0, 0, 'START ADVENTURE', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    
    const hit = this.add.rectangle(0, 0, 200, 64).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      if (this.selectedCharacter) {
        audioManager.playClick?.();
        this.cameras.main.fadeOut(500, 13, 13, 26);
        this.time.delayedCall(500, () => {
          this.scene.start('WorldScene', { heroType: this.selectedCharacter!.type });
        });
      }
    });
    
    hit.on('pointerover', () => this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
  }

  private createBackButton(): void {
    const btn = this.add.container(35, 45);
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(-18, -18, 36, 36, 8);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-18, -18, 36, 36, 8);
    btn.add(bg);
    this.add.text(0, 0, '←', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    
    const hit = this.add.rectangle(0, 0, 50, 50).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    hit.on('pointerdown', () => { audioManager.playClick?.(); this.scene.stop(); });
  }

  private getRarityColor(rarity: RarityType): number {
    const colors: Record<RarityType, number> = { common: 0x87CEEB, rare: 0x9370DB, epic: 0xFF69B4, legendary: 0xFFD700 };
    return colors[rarity] || 0x87CEEB;
  }
}