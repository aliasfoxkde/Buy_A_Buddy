// ==========================================
// CHARACTER SELECT SCENE - Fixed implementation
// Uses properly extracted character sprites
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';
import { getAllCharacters, getRarityStyle, getCharacterConfig, getCharacterImagePath } from '../sprites/SpriteRenderer';
import type { BuddyType } from '../sprites/SpriteRenderer';

interface CharacterInfo {
  id: string;
  name: string;
  type: string;
  rarity: string;
  description: string;
  stats: { hp: number; atk: number; def: number; spd: number };
}

export class CharacterSelectScene extends Phaser.Scene {
  private selectedCharacter: CharacterInfo | null = null;
  private characterCards: Phaser.GameObjects.Container[] = [];
  private infoTexts: Phaser.GameObjects.Text[] = [];
  private previewSprite: Phaser.GameObjects.Sprite | null = null;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  preload(): void {
    // Pre-load all character sprites
    const characters = getAllCharacters();
    characters.forEach((char: any) => {
      const path = getCharacterImagePath(char.type as BuddyType);
      this.load.image(`char_${char.type}`, path);
    });
    
    // Load character select background
    this.load.image('char_select_bg', '/images/assets/character_select.png');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Create background with reference art
    this.createBackground();
    
    this.createHeader();
    this.createCharacterGrid();
    this.createInfoPanel();
    this.createConfirmButton();
    this.createBackButton();
    
    console.log(`🎭 Choose your Buddy! (${getAllCharacters().length} characters available)`);
  }

  private createBackground(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    
    // Add a subtle gradient overlay
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a0a2e, 0x1a0a2e, 1);
    gradient.fillRect(0, 0, w, h);
    
    // Add decorative particles
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, w - 50);
      const y = Phaser.Math.Between(100, h - 100);
      const star = this.add.text(x, y, '✦', {
        fontSize: Phaser.Math.Between(12, 24) + 'px',
        color: '#a855f7',
      }).setAlpha(Phaser.Math.FloatBetween(0.2, 0.5));
      
      this.tweens.add({
        targets: star,
        y: y - 30,
        alpha: 0.1,
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private createHeader(): void {
    const w = this.scale.width;
    
    // Header background
    const header = this.add.graphics();
    header.fillStyle(0x1a0a2e, 0.95);
    header.fillRect(0, 0, w, 85);
    header.lineStyle(3, 0xa855f7, 0.8);
    header.lineBetween(0, 85, w, 85);
    
    // Title
    const title = this.add.text(w / 2, 30, 'Choose Your Buddy', {
      fontSize: '28px',
      fontFamily: 'Georgia, serif',
      color: '#a855f7',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(w / 2, 60, 'Tap a character to learn more', {
      fontSize: '14px',
      color: '#8a8a8a',
    }).setOrigin(0.5);
    
    // Decorative elements
    this.add.text(w - 30, 42, '✨', { fontSize: '22px' }).setOrigin(0.5);
    this.add.text(30, 42, '✨', { fontSize: '22px' }).setOrigin(0.5);
  }

  private createCharacterGrid(): void {
    const w = this.scale.width;
    const startY = 95;
    const cols = 3;
    const cardW = (w - 60) / cols;
    const cardH = 125;
    const spacing = 5;
    
    const characters = getAllCharacters();
    
    characters.forEach((char: CharacterInfo, i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (cardW + spacing);
      const y = startY + row * (cardH + spacing);
      this.createCard(char, x, y, cardW, cardH);
    });
  }

  private createCard(char: CharacterInfo, x: number, y: number, w: number, h: number): void {
    const card = this.add.container(x, y);
    const rarityStyle = getRarityStyle(char.rarity as any);
    
    // Card background with rounded corners
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.95);
    bg.fillRoundedRect(0, 0, w, h, 12);
    bg.lineStyle(3, rarityStyle.border, 0.9);
    bg.strokeRoundedRect(0, 0, w, h, 12);
    card.add(bg);
    
    // Add character sprite
    const spriteKey = `char_${char.type}`;
    let sprite: Phaser.GameObjects.Sprite | null = null;
    
    if (this.textures.exists(spriteKey)) {
      sprite = this.add.sprite(48, h / 2 - 3, spriteKey).setScale(0.45);
      card.add(sprite);
    } else {
      // Placeholder circle
      const placeholder = this.add.graphics();
      placeholder.fillStyle(rarityStyle.border, 1);
      placeholder.fillCircle(48, h / 2 - 3, 38);
      card.add(placeholder);
      
      this.add.text(48, h / 2 - 3, char.name.substring(0, 1), {
        fontSize: '22px',
        color: '#fff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }
    
    // Rarity badge (top right)
    const badge = this.add.graphics();
    badge.fillStyle(rarityStyle.badge, 1);
    badge.fillCircle(w - 18, 16, 14);
    card.add(badge);
    
    this.add.text(w - 18, 16, rarityStyle.label, {
      fontSize: '12px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Character name
    this.add.text(88, 10, char.name, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0);
    
    // Rarity name
    this.add.text(88, 30, char.rarity.toUpperCase(), {
      fontSize: '10px',
      color: `#${rarityStyle.badge.toString(16).slice(2)}`,
    });
    
    // Stats preview
    this.add.text(88, 48, `HP:${char.stats.hp}`, { fontSize: '10px', color: '#22c55e' });
    this.add.text(135, 48, `ATK:${char.stats.atk}`, { fontSize: '10px', color: '#ef4444' });
    this.add.text(88, 64, `DEF:${char.stats.def}`, { fontSize: '10px', color: '#3b82f6' });
    this.add.text(135, 64, `SPD:${char.stats.spd}`, { fontSize: '10px', color: '#f59e0b' });
    
    // Interactive hit area
    const hit = this.add.rectangle(w / 2, h / 2, w + 10, h + 10)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    card.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.selectCharacter(char, card);
    });
    
    hit.on('pointerover', () => {
      this.tweens.add({ targets: card, scaleX: 1.06, scaleY: 1.06, duration: 120, ease: 'Power2' });
    });
    
    hit.on('pointerout', () => {
      this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 120, ease: 'Power2' });
    });
    
    this.characterCards.push(card);
  }

  private selectCharacter(char: CharacterInfo, card: Phaser.GameObjects.Container): void {
    this.selectedCharacter = char;
    
    // Animate selection
    this.characterCards.forEach(c => {
      const isSelected = c === card;
      this.tweens.add({
        targets: c,
        scaleX: isSelected ? 1.1 : 1,
        scaleY: isSelected ? 1.1 : 1,
        duration: 200,
        ease: 'Power2',
      });
    });
    
    // Update info panel
    this.updateInfoPanel(char);
    
    // Update preview sprite
    this.updatePreviewSprite(char.type);
  }

  private updatePreviewSprite(type: string): void {
    // Remove old preview
    if (this.previewSprite) {
      this.previewSprite.destroy();
    }
    
    const spriteKey = `char_${type}`;
    if (this.textures.exists(spriteKey)) {
      const panelY = this.scale.height - 165;
      this.previewSprite = this.add.sprite(75, panelY + 60, spriteKey).setScale(0.55);
      this.previewSprite.setAlpha(0);
      
      this.tweens.add({
        targets: this.previewSprite,
        alpha: 1,
        duration: 300,
      });
    }
  }

  private createInfoPanel(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const panelY = h - 165;
    
    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x1a0a2e, 0.95);
    panel.fillRoundedRect(15, panelY, w - 30, 145, 14);
    panel.lineStyle(2, 0xa855f7, 0.7);
    panel.strokeRoundedRect(15, panelY, w - 30, 145, 14);
    
    // Placeholder text
    this.infoTexts.push(
      this.add.text(w / 2, panelY + 60, '✨ Tap a buddy to learn more ✨', {
        fontSize: '16px',
        color: '#555555',
        fontStyle: 'italic',
      }).setOrigin(0.5)
    );
  }

  private updateInfoPanel(char: CharacterInfo): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const panelY = h - 165;
    const rarityStyle = getRarityStyle(char.rarity as any);
    
    // Clear old info texts
    this.infoTexts.forEach(t => t.destroy());
    this.infoTexts = [];
    
    // Character name
    this.infoTexts.push(
      this.add.text(145, panelY + 18, char.name, {
        fontSize: '26px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
    );
    
    // Rarity badge
    const badge = this.add.graphics();
    badge.fillStyle(rarityStyle.badge, 1);
    badge.fillRoundedRect(300, 20, 65, 24, 6);
    this.infoTexts.push(
      this.add.text(332, 32, char.rarity.toUpperCase(), {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5)
    );
    
    // Description
    this.infoTexts.push(
      this.add.text(145, panelY + 55, char.description, {
        fontSize: '14px',
        color: '#909090',
      })
    );
    
    // Stats with visual bars
    const statsY = panelY + 90;
    
    // HP bar
    const hpPct = char.stats.hp / 150;
    const hpBar = this.add.graphics();
    hpBar.fillStyle(0x1a1a2e, 1);
    hpBar.fillRoundedRect(145, statsY, 100, 14, 4);
    hpBar.fillStyle(0x22c55e, 1);
    hpBar.fillRoundedRect(145, statsY, hpPct * 100, 14, 4);
    this.infoTexts.push(
      this.add.text(150, statsY + 3, `HP ${char.stats.hp}`, {
        fontSize: '10px',
        color: '#ffffff',
      })
    );
    
    // ATK bar
    const atkPct = char.stats.atk / 30;
    const atkBar = this.add.graphics();
    atkBar.fillStyle(0x1a1a2e, 1);
    atkBar.fillRoundedRect(145, statsY + 18, 100, 14, 4);
    atkBar.fillStyle(0xef4444, 1);
    atkBar.fillRoundedRect(145, statsY + 18, atkPct * 100, 14, 4);
    this.infoTexts.push(
      this.add.text(150, statsY + 21, `ATK ${char.stats.atk}`, {
        fontSize: '10px',
        color: '#ffffff',
      })
    );
    
    // DEF/SPD text on right
    this.infoTexts.push(
      this.add.text(265, statsY + 5, `DEF ${char.stats.def}`, {
        fontSize: '12px',
        color: '#3b82f6',
        fontStyle: 'bold',
      })
    );
    this.infoTexts.push(
      this.add.text(265, statsY + 23, `SPD ${char.stats.spd}`, {
        fontSize: '12px',
        color: '#f59e0b',
        fontStyle: 'bold',
      })
    );
  }

  private createConfirmButton(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    
    const btn = this.add.container(w / 2, h - 40);
    
    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillRoundedRect(-100, -32, 200, 64, 18);
    btn.add(bg);
    
    // Button text
    this.add.text(0, 0, '⚔️ START ADVENTURE', {
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Hit area
    const hit = this.add.rectangle(0, 0, 220, 70).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      if (this.selectedCharacter) {
        audioManager.playClick?.();
        this.startAdventure();
      } else {
        // Shake feedback for no selection
        this.tweens.add({
          targets: btn,
          x: w / 2 + 18,
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
    
    // Fade transition
    this.cameras.main.fadeOut(500, 13, 13, 26);
    this.time.delayedCall(500, () => {
      this.scene.start('WorldScene', {
        heroType: this.selectedCharacter!.type,
        heroRarity: this.selectedCharacter!.rarity,
      });
    });
  }

  private createBackButton(): void {
    const btn = this.add.container(38, 42);
    
    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.95);
    bg.fillRoundedRect(-22, -22, 44, 44, 12);
    bg.lineStyle(2, 0xa855f7, 0.7);
    bg.strokeRoundedRect(-22, -22, 44, 44, 12);
    btn.add(bg);
    
    // Button text
    this.add.text(0, 0, '←', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
    
    // Hit area
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