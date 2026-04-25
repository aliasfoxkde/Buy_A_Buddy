// ==========================================
// CHARACTER SELECT SCENE - Using extracted reference art sprites
// 12 unique anime characters with proper sprite loading
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';
import { 
  getAllCharacters, 
  getRarityStyle, 
  getCharacterConfig,
  getSpritePath 
} from '../sprites/SpriteRenderer';
import type { BuddyType, CharacterConfig, RarityType } from '../sprites/SpriteRenderer';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedCharacter: CharacterConfig | null = null;
  private characterCards: Phaser.GameObjects.Container[] = [];
  private previewSprite: Phaser.GameObjects.Sprite | null = null;
  private isLoaded = false;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  preload(): void {
    // Preload all 12 character sprites
    const characters = getAllCharacters();
    characters.forEach((char: CharacterConfig) => {
      const path = getSpritePath(char.type as BuddyType);
      this.load.image(`char_${char.type}`, path);
    });
    
    // Loading progress
    this.load.on('progress', (progress: number) => {
      this.updateLoadingBar(progress);
    });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Wait for textures to load
    this.load.once('complete', () => {
      this.isLoaded = true;
      this.buildUI();
    });
    
    if (!this.load.isLoading()) {
      this.load.start();
    }
    
    // Show loading screen while waiting
    this.showLoadingScreen();
  }

  private showLoadingScreen(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    
    // Loading bar
    const barBg = this.add.graphics();
    barBg.fillStyle(0x2d1b4e, 1);
    barBg.fillRoundedRect(w/2 - 100, h/2, 200, 20, 10);
    
    const barFill = this.add.graphics();
    
    // Animated loading dots
    const loadingText = this.add.text(w/2, h/2 - 40, 'Loading Buddies...', {
      fontSize: '18px',
      color: '#a855f7',
    }).setOrigin(0.5);
    
    let dotCount = 0;
    this.time.addEvent({
      delay: 400,
      callback: () => {
        dotCount = (dotCount + 1) % 4;
        loadingText.setText('Loading Buddies' + '.'.repeat(dotCount));
      },
      loop: true,
    });
  }

  private updateLoadingBar(progress: number): void {
    // Progress is handled by Phaser's load events
  }

  private buildUI(): void {
    // Clear any loading elements
    this.children.list.forEach((child: any) => {
      if (child.type !== 'Graphics' || !child.isLoading) {
        child.destroy();
      }
    });
    
    this.createHeader();
    this.createCharacterGrid();
    this.createInfoPanel();
    this.createConfirmButton();
    this.createBackButton();
    
    console.log(`🎭 Character Select - ${getAllCharacters().length} buddies loaded!`);
  }

  private createHeader(): void {
    const w = this.scale.width;
    
    // Header bar
    const header = this.add.graphics();
    header.fillStyle(0x1a0a2e, 0.95);
    header.fillRect(0, 0, w, 80);
    header.lineStyle(3, 0xa855f7, 0.7);
    header.lineBetween(0, 80, w, 80);
    
    // Title
    this.add.text(w/2, 28, '✦ Choose Your Buddy ✦', {
      fontSize: '26px',
      fontFamily: 'Georgia, serif',
      color: '#a855f7',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(w/2, 58, 'Tap a character to learn more', {
      fontSize: '13px',
      color: '#888888',
    }).setOrigin(0.5);
  }

  private createCharacterGrid(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const startY = 90;
    const cols = 3;
    const cardW = (w - 60) / cols;
    const cardH = 120;
    const spacing = 6;
    
    const characters = getAllCharacters();
    
    characters.forEach((char: CharacterConfig, i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (cardW + spacing);
      const y = startY + row * (cardH + spacing);
      this.createCard(char, x, y, cardW, cardH);
    });
  }

  private createCard(char: CharacterConfig, x: number, y: number, w: number, h: number): void {
    const card = this.add.container(x, y);
    const rarityStyle = getRarityStyle(char.rarity as RarityType);
    
    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.95);
    bg.fillRoundedRect(0, 0, w, h, 12);
    bg.lineStyle(3, rarityStyle.border, 0.85);
    bg.strokeRoundedRect(0, 0, w, h, 12);
    card.add(bg);
    
    // Character sprite
    const spriteKey = `char_${char.type}`;
    if (this.textures.exists(spriteKey)) {
      const sprite = this.add.sprite(45, h/2 - 3, spriteKey).setScale(0.4);
      card.add(sprite);
    } else {
      // Placeholder
      const placeholder = this.add.graphics();
      placeholder.fillStyle(rarityStyle.border, 1);
      placeholder.fillCircle(45, h/2 - 3, 35);
      card.add(placeholder);
      
      this.add.text(45, h/2 - 3, char.type[0].toUpperCase(), {
        fontSize: '20px',
        color: '#fff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }
    
    // Rarity badge
    const badge = this.add.graphics();
    badge.fillStyle(rarityStyle.badge, 1);
    badge.fillCircle(w - 16, 14, 13);
    card.add(badge);
    
    this.add.text(w - 16, 14, rarityStyle.label, {
      fontSize: '11px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Character name
    this.add.text(85, 10, char.name, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0);
    
    // Rarity text
    this.add.text(85, 30, char.rarity.toUpperCase(), {
      fontSize: '10px',
      color: `#${rarityStyle.badge.toString(16).slice(2)}`,
    });
    
    // Stats preview
    this.add.text(85, 50, `HP:${char.stats.hp}`, { fontSize: '11px', color: '#22c55e' });
    this.add.text(130, 50, `ATK:${char.stats.atk}`, { fontSize: '11px', color: '#ef4444' });
    this.add.text(85, 66, `DEF:${char.stats.def}`, { fontSize: '11px', color: '#3b82f6' });
    this.add.text(130, 66, `SPD:${char.stats.spd}`, { fontSize: '11px', color: '#f59e0b' });
    
    // Hit area
    const hit = this.add.rectangle(w/2, h/2, w + 10, h + 10)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    card.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.selectCharacter(char, card);
    });
    
    hit.on('pointerover', () => {
      this.tweens.add({ targets: card, scaleX: 1.07, scaleY: 1.07, duration: 100, ease: 'Power2' });
    });
    
    hit.on('pointerout', () => {
      this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100, ease: 'Power2' });
    });
    
    this.characterCards.push(card);
  }

  private selectCharacter(char: CharacterConfig, card: Phaser.GameObjects.Container): void {
    this.selectedCharacter = char;
    
    // Animate selected card
    this.characterCards.forEach(c => {
      const isSelected = c === card;
      this.tweens.add({
        targets: c,
        scaleX: isSelected ? 1.12 : 1,
        scaleY: isSelected ? 1.12 : 1,
        duration: 200,
        ease: 'Power2',
      });
    });
    
    this.updateInfoPanel(char);
    this.updatePreviewSprite(char.type as BuddyType);
  }

  private updatePreviewSprite(type: BuddyType): void {
    if (this.previewSprite) {
      this.previewSprite.destroy();
    }
    
    const spriteKey = `char_${type}`;
    if (this.textures.exists(spriteKey)) {
      const panelY = this.scale.height - 160;
      this.previewSprite = this.add.sprite(70, panelY + 65, spriteKey).setScale(0.55);
      
      // Fade in animation
      this.previewSprite.setAlpha(0);
      this.tweens.add({
        targets: this.previewSprite,
        alpha: 1,
        duration: 300,
        ease: 'Power2',
      });
    }
  }

  private createInfoPanel(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const panelY = h - 160;
    
    const panel = this.add.graphics();
    panel.fillStyle(0x1a0a2e, 0.95);
    panel.fillRoundedRect(15, panelY, w - 30, 140, 14);
    panel.lineStyle(2, 0xa855f7, 0.6);
    panel.strokeRoundedRect(15, panelY, w - 30, 140, 14);
    
    // Placeholder
    this.add.text(w/2, panelY + 60, '✦ Tap a buddy to learn more ✦', {
      fontSize: '15px',
      color: '#555555',
      fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private updateInfoPanel(char: CharacterConfig): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const panelY = h - 160;
    const rarityStyle = getRarityStyle(char.rarity as RarityType);
    
    // Clear existing info (simple approach - destroy all text)
    this.children.list.forEach((child: any) => {
      if (child.type === 'Text' && child.isInfoPanel) {
        child.destroy();
      }
    });
    
    // Name
    const nameText = this.add.text(145, panelY + 15, char.name, {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    (nameText as any).isInfoPanel = true;
    
    // Rarity badge
    const badgeBg = this.add.graphics();
    badgeBg.fillStyle(rarityStyle.badge, 1);
    badgeBg.fillRoundedRect(295, 17, 60, 22, 5);
    (badgeBg as any).isInfoPanel = true;
    
    const rarityText = this.add.text(325, 28, char.rarity.toUpperCase(), {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    (rarityText as any).isInfoPanel = true;
    
    // Description
    const descText = this.add.text(145, panelY + 50, char.description, {
      fontSize: '13px',
      color: '#909090',
    });
    (descText as any).isInfoPanel = true;
    
    // Stats bars
    const statsY = panelY + 85;
    
    // HP bar
    const hpBar = this.add.graphics();
    hpBar.fillStyle(0x1a1a2e, 1);
    hpBar.fillRoundedRect(145, statsY, 100, 12, 3);
    hpBar.fillStyle(0x22c55e, 1);
    hpBar.fillRoundedRect(145, statsY, (char.stats.hp / 150) * 100, 12, 3);
    (hpBar as any).isInfoPanel = true;
    
    const hpText = this.add.text(150, statsY + 2, `HP ${char.stats.hp}`, {
      fontSize: '9px',
      color: '#ffffff',
    });
    (hpText as any).isInfoPanel = true;
    
    // ATK bar
    const atkBar = this.add.graphics();
    atkBar.fillStyle(0x1a1a2e, 1);
    atkBar.fillRoundedRect(145, statsY + 16, 100, 12, 3);
    atkBar.fillStyle(0xef4444, 1);
    atkBar.fillRoundedRect(145, statsY + 16, (char.stats.atk / 30) * 100, 12, 3);
    (atkBar as any).isInfoPanel = true;
    
    const atkText = this.add.text(150, statsY + 18, `ATK ${char.stats.atk}`, {
      fontSize: '9px',
      color: '#ffffff',
    });
    (atkText as any).isInfoPanel = true;
    
    // DEF/SPD
    const defText = this.add.text(260, statsY + 5, `DEF ${char.stats.def}`, {
      fontSize: '12px',
      color: '#3b82f6',
      fontStyle: 'bold',
    });
    (defText as any).isInfoPanel = true;
    
    const spdText = this.add.text(260, statsY + 22, `SPD ${char.stats.spd}`, {
      fontSize: '12px',
      color: '#f59e0b',
      fontStyle: 'bold',
    });
    (spdText as any).isInfoPanel = true;
  }

  private createConfirmButton(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const btn = this.add.container(w/2, h - 38);
    
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillRoundedRect(-100, -32, 200, 64, 18);
    btn.add(bg);
    
    this.add.text(0, 0, '⚔️ START ADVENTURE', {
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    const hit = this.add.rectangle(0, 0, 220, 70).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      if (this.selectedCharacter) {
        audioManager.playClick?.();
        this.startAdventure();
      } else {
        this.tweens.add({
          targets: btn,
          x: w/2 + 20,
          duration: 50,
          yoyo: true,
          repeat: 5,
          ease: 'Power2',
        });
      }
    });
    
    hit.on('pointerover', () => this.tweens.add({ targets: btn, scaleX: 1.08, scaleY: 1.08, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
    
    // Pulse animation
    this.tweens.add({
      targets: btn,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1200,
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
        heroType: this.selectedCharacter!.type,
        heroRarity: this.selectedCharacter!.rarity,
      });
    });
  }

  private createBackButton(): void {
    const btn = this.add.container(38, 40);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.95);
    bg.fillRoundedRect(-22, -22, 44, 44, 12);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-22, -22, 44, 44, 12);
    btn.add(bg);
    
    this.add.text(0, 0, '←', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
    
    const hit = this.add.rectangle(0, 0, 60, 60).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.cameras.main.fadeOut(300, 13, 13, 26);
      this.time.delayedCall(300, () => this.scene.start('MainMenuScene'));
    });
    
    hit.on('pointerover', () => this.tweens.add({ targets: btn, scaleX: 1.12, scaleY: 1.12, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
  }
}