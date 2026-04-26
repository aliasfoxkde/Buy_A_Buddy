/**
 * Main Menu Scene
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';
import { audioManager } from '../audio/AudioManager';

export class MainMenuScene extends Phaser.Scene {
  private buttons: Phaser.GameObjects.Container[] = [];
  private selectedIndex: number = 0;
  private title!: Phaser.GameObjects.Text;
  private audioInitialized: boolean = false;
  
  constructor() {
    super({ key: 'MainMenuScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Add gradient background effect
    this.createBackground();
    
    // Title
    this.title = this.add.text(width / 2, height / 4, 'BUY A BUDDY', {
      fontSize: '64px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, height / 4 + 60, 'An RPG Adventure', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ec4899'
    }).setOrigin(0.5);
    
    // Menu buttons
    this.createButtons();
    
    // Version
    this.add.text(width / 2, height - 30, 'v4.0.0', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#555'
    }).setOrigin(0.5);
    
    // Setup keyboard navigation
    this.setupInput();
    
    // Play menu music
    this.initAudio();
    
    // Highlight first button
    this.updateButtonSelection();
  }
  
  private createBackground(): void {
    const { width, height } = this.scale;
    const graphics = this.add.graphics();
    
    // Create gradient-like effect with rectangles
    for (let i = 0; i < 20; i++) {
      const alpha = 0.02 * i;
      const y = (height / 20) * i;
      const h = height / 20 + 1;
      graphics.fillStyle(0xa855f7, alpha);
      graphics.fillRect(0, y, width, h);
    }
    
    // Decorative circles
    graphics.fillStyle(0x7c3aed, 0.1);
    graphics.fillCircle(100, 100, 150);
    graphics.fillCircle(width - 100, height - 100, 200);
    
    // Particles effect
    this.createParticles();
  }
  
  private createParticles(): void {
    const { width, height } = this.scale;
    
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 6);
      
      const particle = this.add.circle(x, y, size, 0xa855f7, 0.3);
      
      // Animate
      this.tweens.add({
        targets: particle,
        y: y - 100,
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        yoyo: false,
        delay: Phaser.Math.Between(0, 3000)
      });
    }
  }
  
  private createButtons(): void {
    const { width, height } = this.scale;
    const menuItems = [
      { text: 'NEW GAME', action: () => this.startNewGame() },
      { text: 'CONTINUE', action: () => this.continueGame() },
      { text: 'SETTINGS', action: () => this.openSettings() },
      { text: 'CREDITS', action: () => this.showCredits() },
      { text: 'QUIT', action: () => this.quitGame() }
    ];
    
    const startY = height / 2 - 20;
    const spacing = 60;
    
    menuItems.forEach((item, index) => {
      const container = this.createMenuButton(
        width / 2,
        startY + index * spacing,
        item.text,
        item.action
      );
      
      this.buttons.push(container);
    });
  }
  
  private createMenuButton(
    x: number,
    y: number,
    text: string,
    action: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Background rectangle
    const bg = this.add.rectangle(0, 0, 250, 50, 0x2d1b4e);
    bg.setStrokeStyle(2, 0xa855f7);
    bg.setInteractive({ useHandCursor: true });
    
    // Button text
    const label = this.add.text(0, 0, text, {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setSize(250, 50);
    container.setInteractive();
    
    let isPressed = false;
    
    // Hover effects
    container.on('pointerover', () => {
      if (isPressed) return;
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
      bg.setFillStyle(0x3d2b5e);
    });
    
    container.on('pointerout', () => {
      if (isPressed) return;
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
      bg.setFillStyle(0x2d1b4e);
    });
    
    container.on('pointerdown', () => {
      if (isPressed) return;
      isPressed = true;
      
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => {
          isPressed = false;
          this.playClickSound();
          action();
        }
      });
    });
    
    this.buttons.push(container);
    return container;
  }
  
  private updateButtonSelection(): void {
    this.buttons.forEach((btn, index) => {
      const bg = btn.getAt(0) as Phaser.GameObjects.Rectangle;
      if (index === this.selectedIndex) {
        bg.setStrokeStyle(3, 0x22c55e);
      } else {
        bg.setStrokeStyle(2, 0xa855f7);
      }
    });
  }
  
  private setupInput(): void {
    // Keyboard navigation
    this.input.keyboard?.on('keydown-UP', () => {
      this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
      this.updateButtonSelection();
      this.playHoverSound();
    });
    
    this.input.keyboard?.on('keydown-DOWN', () => {
      this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
      this.updateButtonSelection();
      this.playHoverSound();
    });
    
    this.input.keyboard?.on('keydown-ENTER', () => {
      const btn = this.buttons[this.selectedIndex];
      if (btn) {
        const bg = btn.getAt(0) as Phaser.GameObjects.Rectangle;
        bg.emit('pointerdown');
      }
    });
  }
  
  private initAudio(): void {
    if (this.audioInitialized) return;
    
    // Play menu music
    audioManager.playMenuMusic();
    this.audioInitialized = true;
  }
  
  private playClickSound(): void {
    audioManager.playClick();
  }
  
  private playHoverSound(): void {
    audioManager.playHover();
  }
  
  private startNewGame(): void {
    gameSystems.startNewGame();
    this.scene.start('CharacterSelectScene');
  }
  
  private continueGame(): void {
    // Check for save data
    const slots = gameSystems.storage.getSaveSlots();
    if (slots.length > 0) {
      gameSystems.loadGame(slots[0].id);
      this.scene.start('WorldScene');
    } else {
      // No save found - start new game
      this.startNewGame();
    }
  }
  
  private openSettings(): void {
    this.scene.start('SettingsScene');
  }
  
  private showCredits(): void {
    const { width, height } = this.scale;
    
    // Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();
    
    // Credits text
    const credits = this.add.text(width / 2, height / 2, [
      'BUY A BUDDY',
      '',
      'A Game by You',
      '',
      'Created with Phaser 3',
      '',
      'MIT License',
      '',
      '2024'
    ].join('\n'), {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);
    
    // Close button
    const closeBtn = this.add.text(width / 2, height - 100, '[ Press ESC or Click to Close ]', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(0.5);
    
    // Fade in
    overlay.setAlpha(0);
    credits.setAlpha(0);
    closeBtn.setAlpha(0);
    
    this.tweens.add({
      targets: [overlay, credits, closeBtn],
      alpha: 1,
      duration: 300
    });
    
    // Close on click or ESC
    const close = () => {
      this.tweens.add({
        targets: [overlay, credits, closeBtn],
        alpha: 0,
        duration: 200,
        onComplete: () => {
          overlay.destroy();
          credits.destroy();
          closeBtn.destroy();
        }
      });
    };
    
    overlay.on('pointerdown', close);
    this.input.keyboard?.once('keydown-ESC', close);
  }
  
  private quitGame(): void {
    // Show confirmation
    const { width, height } = this.scale;
    
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    
    const text = this.add.text(width / 2, height / 2 - 30, 'Are you sure you want to quit?', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    const yesBtn = this.add.text(width / 2 - 100, height / 2 + 40, 'YES', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5).setInteractive();
    
    const noBtn = this.add.text(width / 2 + 100, height / 2 + 40, 'NO', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ef4444'
    }).setOrigin(0.5).setInteractive();
    
    yesBtn.on('pointerdown', () => {
      // Quit game
      window.close();
    });
    
    noBtn.on('pointerdown', () => {
      overlay.destroy();
      text.destroy();
      yesBtn.destroy();
      noBtn.destroy();
    });
  }
}
