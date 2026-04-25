// ==========================================
// CHARACTER SELECT SCENE - Using actual reference art sheets
// Extracts individual characters from the sprite sheets
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';
import { getAllCharacters, getRarityStyle, preloadCharacterTextures, createCharacterSprite, getCharacterConfig } from '../sprites/SpriteRenderer';
import type { BuddyType } from '../sprites/SpriteRenderer';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedCharacter: any = null;
  private characterCards: Phaser.GameObjects.Container[] = [];
  private loadingComplete = false;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  preload(): void {
    // Load character sheets
    this.load.image('sheet1', '/images/sheets/sheet1.png');
    this.load.image('sheet2', '/images/sheets/sheet2.png');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Wait for textures to be ready
    this.load.once('complete', () => {
      this.loadingComplete = true;
      preloadCharacterTextures(this).then(() => {
        this.createUI();
      });
    });
    
    this.load.start();
    
    // Show loading state
    this.createLoadingScreen();
  }

  private createLoadingScreen(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    
    this.add.text(w / 2, h / 2, 'Loading characters...', {
      fontSize: '20px',
      color: COLORS.primary,
    }).setOrigin(0.5);
    
    // Loading animation
    const dots = this.add.text(w / 2, h / 2 + 40, '', {
      fontSize: '24px',
      color: '#fff',
    }).setOrigin(0.5);
    
    let count = 0;
    this.time.addEvent({
      delay: 300,
      callback: () => {
        count++;
        dots.setText('.'.repeat(count % 4));
      },
      loop: true,
    });
  }

  private createUI(): void {
    this.createHeader();
    this.createCharacterGrid();
    this.createInfoPanel();
    this.createConfirmButton();
    this.createBackButton();
    console.log('🎭 Choose your Buddy!');
  }

  private createHeader(): void {
    const w = this.scale.width;
    const header = this.add.graphics();
    header.fillStyle(0x1a0a2e, 0.95);
    header.fillRect(0, 0, w, 80);
    header.lineStyle(2, 0xa855f7, 0.5);
    header.lineBetween(0, 80, w, 80);
    
    this.add.text(w / 2, 30, 'Choose Your Buddy', {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: COLORS.primary, fontStyle: 'bold',
    }).setOrigin(0.5);
    
    this.add.text(w / 2, 58, 'Select a buddy to begin your adventure', {
      fontSize: '12px', color: COLORS.textSecondary,
    }).setOrigin(0.5);
    
    // Decorative stars
    this.add.text(w - 25, 40, '✨', { fontSize: '20px' }).setOrigin(0.5);
    this.add.text(25, 40, '✨', { fontSize: '20px' }).setOrigin(0.5);
  }

  private createCharacterGrid(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const startY = 90;
    const cols = 3;
    const cardW = (w - 50) / cols;
    const cardH = 115;
    const spacing = 5;
    
    const characters = getAllCharacters();
    
    characters.forEach((char: any, i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 15 + col * (cardW + spacing);
      const y = startY + row * (cardH + spacing);
      this.createCard(char, x, y, cardW, cardH);
    });
  }

  private createCard(char: any, x: number, y: number, w: number, h: number): void {
    const card = this.add.container(x, y);
    const rarityStyle = getRarityStyle(char.rarity);
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(0, 0, w, h, 10);
    bg.lineStyle(2, rarityStyle.border, 0.8);
    bg.strokeRoundedRect(0, 0, w, h, 10);
    card.add(bg);
    
    // Character sprite (extracted from sheet)
    const charSprite = createCharacterSprite(this, char.type, 45, h / 2 - 5, 80, 80);
    if (charSprite) {
      card.add(charSprite);
    } else {
      // Fallback placeholder
      const placeholder = this.add.graphics();
      placeholder.fillStyle(rarityStyle.border, 1);
      placeholder.fillCircle(45, h / 2 - 5, 35);
      card.add(placeholder);
      
      this.add.text(45, h / 2 - 5, char.type.replace('buddy', ''), {
        fontSize: '18px', color: '#fff', fontStyle: 'bold'
      }).setOrigin(0.5);
    }
    
    // Rarity badge
    const badge = this.add.graphics();
    badge.fillStyle(rarityStyle.badge, 1);
    badge.fillCircle(w - 15, 15, 12);
    card.add(badge);
    
    this.add.text(w - 15, 15, rarityStyle.label, {
      fontSize: '11px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Character name
    this.add.text(80, 10, char.name, {
      fontSize: '14px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0, 0);
    
    // Stats preview
    this.add.text(80, 32, `HP:${char.stats.hp} ATK:${char.stats.atk}`, { fontSize: '10px', color: '#aaa' });
    this.add.text(80, 48, `DEF:${char.stats.def} SPD:${char.stats.spd}`, { fontSize: '10px', color: '#aaa' });
    
    // Description preview
    this.add.text(80, 65, char.description.substring(0, 25) + '...', { fontSize: '9px', color: '#888' });
    
    // Interactive area
    const hit = this.add.rectangle(w / 2, h / 2, w + 10, h + 10)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    card.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.selectCharacter(char, card);
    });
    
    hit.on('pointerover', () => {
      this.tweens.add({ targets: card, scaleX: 1.05, scaleY: 1.05, duration: 100, ease: 'Power2' });
    });
    
    hit.on('pointerout', () => {
      this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100, ease: 'Power2' });
    });
    
    this.characterCards.push(card);
  }

  private selectCharacter(char: any, card: Phaser.GameObjects.Container): void {
    this.selectedCharacter = char;
    
    // Animate selected card
    this.characterCards.forEach(c => {
      const isSelected = c === card;
      this.tweens.add({
        targets: c,
        scaleX: isSelected ? 1.08 : 1,
        scaleY: isSelected ? 1.08 : 1,
        duration: 200,
        ease: 'Power2',
      });
    });
    
    this.updateInfoPanel(char);
  }

  private createInfoPanel(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const panelY = h - 155;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a0a2e, 0.95);
    panel.fillRoundedRect(15, panelY, w - 30, 135, 12);
    panel.lineStyle(2, 0xa855f7, 0.6);
    panel.strokeRoundedRect(15, panelY, w - 30, 135, 12);
    
    this.add.text(w / 2, panelY + 55, '✨ Tap a buddy to learn more ✨', {
      fontSize: '14px', color: '#555', fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private updateInfoPanel(char: any): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const panelY = h - 155;
    const rarityStyle = getRarityStyle(char.rarity);
    
    // Clear old info elements
    this.children.list.filter((c: any) => c.isInfoPanel).forEach((c: any) => c.destroy());
    
    // Character sprite preview
    const charSprite = createCharacterSprite(this, char.type, 70, panelY + 55, 100, 100);
    if (charSprite) {
      (charSprite as any).isInfoPanel = true;
    }
    
    // Character name
    const nameText = this.add.text(140, panelY + 15, char.name, {
      fontSize: '24px', color: '#fff', fontStyle: 'bold',
    });
    (nameText as any).isInfoPanel = true;
    
    // Rarity badge
    const rarityBg = this.add.graphics();
    rarityBg.fillStyle(rarityStyle.badge, 1);
    rarityBg.fillRoundedRect(280, 17, 55, 22, 5);
    (rarityBg as any).isInfoPanel = true;
    
    const rarityText = this.add.text(307, 28, char.rarity.toUpperCase(), {
      fontSize: '11px', color: '#fff', fontStyle: 'bold',
    });
    rarityText.setOrigin(0.5);
    (rarityText as any).isInfoPanel = true;
    
    // Description
    const descText = this.add.text(140, panelY + 50, char.description, {
      fontSize: '13px', color: '#a0a0a0',
    });
    (descText as any).isInfoPanel = true;
    
    // Stats bars
    const statsY = panelY + 80;
    
    // HP bar
    const hpBar = this.add.graphics();
    hpBar.fillStyle(0x22c55e, 1);
    hpBar.fillRoundedRect(140, statsY, (char.stats.hp / 150) * 100, 12, 3);
    (hpBar as any).isInfoPanel = true;
    
    this.add.text(145, statsY + 2, `HP ${char.stats.hp}`, { fontSize: '9px', color: '#fff' })
      ;
    (this.children.list[this.children.list.length - 1] as any).isInfoPanel = true;
    
    // ATK bar
    const atkBar = this.add.graphics();
    atkBar.fillStyle(0xef4444, 1);
    atkBar.fillRoundedRect(140, statsY + 18, (char.stats.atk / 30) * 100, 12, 3);
    (atkBar as any).isInfoPanel = true;
    
    this.add.text(145, statsY + 20, `ATK ${char.stats.atk}`, { fontSize: '9px', color: '#fff' })
      ;
    (this.children.list[this.children.list.length - 1] as any).isInfoPanel = true;
    
    // DEF/SPD on right side
    this.add.text(260, statsY + 5, `DEF ${char.stats.def}`, { fontSize: '11px', color: '#3b82f6' })
      ;
    (this.children.list[this.children.list.length - 1] as any).isInfoPanel = true;
    
    this.add.text(260, statsY + 23, `SPD ${char.stats.spd}`, { fontSize: '11px', color: '#f59e0b' })
      ;
    (this.children.list[this.children.list.length - 1] as any).isInfoPanel = true;
  }

  private createConfirmButton(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const btn = this.add.container(w / 2, h - 35);
    
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillRoundedRect(-100, -30, 200, 60, 16);
    btn.add(bg);
    
    this.add.text(0, 0, '⚔️ START', {
      fontSize: '18px', color: '#fff', fontStyle: 'bold',
    }).setOrigin(0.5);
    
    const hit = this.add.rectangle(0, 0, 220, 65).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      if (this.selectedCharacter) {
        audioManager.playClick?.();
        this.startAdventure();
      } else {
        this.tweens.add({
          targets: btn,
          x: w / 2 + 15,
          duration: 50,
          yoyo: true,
          repeat: 4,
          ease: 'Power2',
        });
      }
    });
    
    hit.on('pointerover', () => this.tweens.add({ targets: btn, scaleX: 1.08, scaleY: 1.08, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
    
    // Pulse animation
    this.tweens.add({
      targets: btn,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private startAdventure(): void {
    if (!this.selectedCharacter) return;
    
    this.cameras.main.fadeOut(500, 13, 13, 26);
    this.time.delayedCall(500, () => {
      this.scene.start('WorldScene', {
        heroType: this.selectedCharacter.type,
        heroRarity: this.selectedCharacter.rarity,
      });
    });
  }

  private createBackButton(): void {
    const btn = this.add.container(35, 40);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(-20, -20, 40, 40, 10);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-20, -20, 40, 40, 10);
    btn.add(bg);
    
    this.add.text(0, 0, '←', { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    
    const hit = this.add.rectangle(0, 0, 55, 55).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.cameras.main.fadeOut(300, 13, 13, 26);
      this.time.delayedCall(300, () => this.scene.start('MainMenuScene'));
    });
    
    hit.on('pointerover', () => this.tweens.add({ targets: btn, scaleX: 1.1, scaleY: 1.1, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
  }
}

// Polyfill for setParent
declare module 'phaser' {
  interface GameObject {
    setParent(_parent: any): this;
  }
}
(Phaser.GameObjects.Text.prototype as any).setParent = function(this: any, _parent: any) {
  return this;
};