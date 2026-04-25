// ==========================================
// MAIN MENU SCENE - Start screen with full RPG feel
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';

export class MainMenuScene extends Phaser.Scene {
  private selectedButton = 0;
  private buttons: Phaser.GameObjects.Container[] = [];
  private isTouch = false;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    // Check for touch
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Initialize audio on first interaction
    this.setupAudioInit();
    
    // Background
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Create visual elements
    this.createBackground();
    this.createTitle();
    this.createBuddyShowcase();
    this.createButtons();
    this.createFullscreenButton();
    this.createVersion();
    
    // Animate title
    this.animateTitle();
    
    // Play menu music
    audioManager.playMenuMusic?.();
    
    // Setup keyboard navigation
    this.setupKeyboardNav();
    
    // Setup gamepad support (for TV)
    this.setupGamepad();
  }

  private setupAudioInit(): void {
    const initAudio = () => {
      audioManager.init?.();
      this.input.off('pointerdown', initAudio);
    };
    this.input.on('pointerdown', initAudio);
    this.input.keyboard?.on('keydown', initAudio);
  }

  private createBackground(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Gradient background
    const bg = this.add.graphics();
    
    // Dark purple gradient
    for (let y = 0; y < height; y += 4) {
      const alpha = 0.3 + (y / height) * 0.3;
      bg.fillStyle(0xa855f7, alpha);
      bg.fillRect(0, y, width, 4);
    }
    
    // Stars
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height * 0.6);
      const size = Phaser.Math.FloatBetween(1, 3);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${size * 10}px`,
        color: '#ffffff',
      }).setAlpha(Phaser.Math.FloatBetween(0.2, 0.8));
      
      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }
    
    // Floating particles
    this.createParticles();
  }

  private createParticles(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      
      const particle = this.add.graphics();
      particle.fillStyle(0xec4899, 0.3);
      particle.fillCircle(0, 0, Phaser.Math.Between(3, 8));
      particle.x = x;
      particle.y = y;
      
      // Float animation
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(20, 50),
        x: x + Phaser.Math.Between(-20, 20),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  private createTitle(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Title shadow
    this.add.text(width / 2 + 4, height * 0.15 + 4, 'BUY A BUDDY', {
      fontSize: '48px',
      fontFamily: 'Georgia, serif',
      color: '#000000',
    }).setOrigin(0.5).setName('titleShadow');
    
    // Main title
    this.add.text(width / 2, height * 0.15, 'BUY A BUDDY', {
      fontSize: '48px',
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5).setName('title');
    
    // Subtitle
    this.add.text(width / 2, height * 0.22, '~ Your Adventure Begins ~', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: COLORS.secondary,
      fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private createBuddyShowcase(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Show animated buddy sprites
    const buddyPositions = [
      { x: width * 0.2, y: height * 0.35 },
      { x: width * 0.5, y: height * 0.3 },
      { x: width * 0.8, y: height * 0.35 },
    ];
    
    // Use text-based buddy representations (cute faces)
    const buddyFaces = ['😊', '🥰', '✨'];
    
    buddyPositions.forEach((pos, i) => {
      // Glow background
      const glow = this.add.graphics();
      glow.fillStyle(0xa855f7, 0.2);
      glow.fillCircle(pos.x, pos.y, 50);
      
      // Buddy emoji (placeholder for sprite)
      const buddy = this.add.text(pos.x, pos.y, buddyFaces[i], {
        fontSize: '64px',
      }).setOrigin(0.5);
      
      // Bounce animation
      this.tweens.add({
        targets: buddy,
        y: pos.y - 10,
        duration: 1000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      
      // Glow pulse
      this.tweens.add({
        targets: glow,
        alpha: 0.4,
        duration: 1500,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private createButtons(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    this.buttons = [];
    
    const buttonConfigs = [
      { text: '🎮  NEW GAME', y: height * 0.52, color: 0xec4899, action: () => this.startNewGame() },
      { text: '📖  CONTINUE', y: height * 0.62, color: 0x6B21A8, action: () => this.continueGame() },
      { text: '🎨  BUDDIES', y: height * 0.72, color: 0xa855f7, action: () => this.openBuddies() },
      { text: '⚙️  SETTINGS', y: height * 0.82, color: 0x4d3b6e, action: () => this.openSettings() },
    ];
    
    buttonConfigs.forEach((config, index) => {
      const btn = this.createMenuButton(width / 2, config.y, config.text, config.color, config.action, index);
      this.buttons.push(btn);
    });
    
    // Select first button
    this.updateButtonSelection();
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    color: number,
    onClick: () => void,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const btnWidth = 280;
    const btnHeight = 60;
    const radius = 16;
    
    // Glow
    const glow = this.add.graphics();
    glow.fillStyle(0xa855f7, 0.3);
    glow.fillRoundedRect(-btnWidth/2 - 6, -btnHeight/2 - 6, btnWidth + 12, btnHeight + 12, radius + 4);
    container.add(glow);
    (container as any).glowGraphics = glow;
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, radius);
    bg.lineStyle(3, 0xa855f7, 0.9);
    bg.strokeRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, radius);
    container.add(bg);
    (container as any).bgGraphics = bg;
    
    // Text
    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(label);
    
    // Hit area (large for touch)
    const hitArea = this.add.rectangle(0, 0, btnWidth + 40, btnHeight + 40)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    container.add(hitArea);
    
    // Store action
    (container as any).action = onClick;
    (container as any).index = index;
    (container as any).btnWidth = btnWidth;
    (container as any).btnHeight = btnHeight;
    
    // Events
    hitArea.on('pointerover', () => {
      audioManager.playClick?.();
      this.selectedButton = index;
      this.updateButtonSelection();
    });
    
    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => onClick()
      });
    });
    
    return container;
  }

  private updateButtonSelection(): void {
    this.buttons.forEach((btn, index) => {
      const glow = (btn as any).glowGraphics;
      const isSelected = index === this.selectedButton;
      
      if (glow) {
        const w = (btn as any).btnWidth || 280;
        const h = (btn as any).btnHeight || 60;
        const radius = 16;
        
        glow.clear();
        glow.fillStyle(isSelected ? 0xec4899 : 0xa855f7, 0.5);
        glow.fillRoundedRect(-w/2 - 6, -h/2 - 6, w + 12, h + 12, radius + 4);
      }
      
      // Scale selected button
      this.tweens.add({
        targets: btn,
        scaleX: isSelected ? 1.05 : 1,
        scaleY: isSelected ? 1.05 : 1,
        duration: 150,
        ease: 'Power2'
      });
    });
  }

  private createFullscreenButton(): void {
    const width = this.scale.width;
    
    // Fullscreen button (top right corner, large touch target)
    const btnSize = 56;
    const x = width - 35;
    const y = 35;
    
    const fsBtn = this.add.container(x, y);
    
    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.8);
    bg.fillCircle(0, 0, btnSize / 2);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeCircle(0, 0, btnSize / 2);
    fsBtn.add(bg);
    
    // Icon
    const icon = this.add.text(0, 0, '⛶', {
      fontSize: '24px',
    }).setOrigin(0.5);
    fsBtn.add(icon);
    
    // Hit area
    const hitArea = this.add.rectangle(0, 0, btnSize + 20, btnSize + 20)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    fsBtn.add(hitArea);
    
    hitArea.on('pointerdown', () => {
      audioManager.playClick?.();
      (window as any).toggleFullscreen();
    });
    
    hitArea.on('pointerover', () => {
      this.tweens.add({ targets: fsBtn, scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });
    
    hitArea.on('pointerout', () => {
      this.tweens.add({ targets: fsBtn, scaleX: 1, scaleY: 1, duration: 100 });
    });
  }

  private createVersion(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    this.add.text(width / 2, height - 20, 'v2.0.0 | Press F for fullscreen', {
      fontSize: '12px',
      color: '#666666',
    }).setOrigin(0.5);
  }

  private animateTitle(): void {
    const title = this.children.getByName('title') as Phaser.GameObjects.Text;
    const titleShadow = this.children.getByName('titleShadow') as Phaser.GameObjects.Text;
    
    if (title) {
      const height = this.scale.height;
      
      this.tweens.add({
        targets: title,
        y: height * 0.13,
        duration: 2500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      
      if (titleShadow) {
        this.tweens.add({
          targets: titleShadow,
          y: height * 0.134,
          duration: 2500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  private setupKeyboardNav(): void {
    if (!this.input.keyboard) return;
    
    // Up/Down arrows for menu navigation
    this.input.keyboard.on('keydown-UP', () => {
      audioManager.playClick?.();
      this.selectedButton = Math.max(0, this.selectedButton - 1);
      this.updateButtonSelection();
    });
    
    this.input.keyboard.on('keydown-DOWN', () => {
      audioManager.playClick?.();
      this.selectedButton = Math.min(this.buttons.length - 1, this.selectedButton + 1);
      this.updateButtonSelection();
    });
    
    // Enter/Space to select
    this.input.keyboard.on('keydown-ENTER', () => {
      const btn = this.buttons[this.selectedButton];
      if (btn) (btn as any).action?.();
    });
    
    this.input.keyboard.on('keydown-SPACE', () => {
      const btn = this.buttons[this.selectedButton];
      if (btn) (btn as any).action?.();
    });
    
    // Escape for fullscreen exit
    this.input.keyboard.on('keydown-ESC', () => {
      if (document.fullscreenElement) {
        (window as any).toggleFullscreen();
      }
    });
  }

  private setupGamepad(): void {
    // Gamepad navigation for TV
    this.input.gamepad?.on('down', (pad: any, button: any) => {
      if (button.index === 0) { // A button
        const btn = this.buttons[this.selectedButton];
        if (btn) (btn as any).action?.();
      }
      if (button.index === 12) { // D-pad up
        this.selectedButton = Math.max(0, this.selectedButton - 1);
        this.updateButtonSelection();
      }
      if (button.index === 13) { // D-pad down
        this.selectedButton = Math.min(this.buttons.length - 1, this.selectedButton + 1);
        this.updateButtonSelection();
      }
    });
  }

  private startNewGame(): void {
    audioManager.playClick?.();
    this.cameras.main.fadeOut(500, 13, 13, 26);
    this.time.delayedCall(500, () => {
      this.scene.start('CharacterSelectScene');
    });
  }

  private continueGame(): void {
    audioManager.playClick?.();
    this.cameras.main.flash(200, 100, 100, 100);
    // Would load saved game here
  }

  private openBuddies(): void {
    audioManager.playClick?.();
    this.cameras.main.flash(200, 100, 100, 100);
    // Would open buddy collection here
  }

  private openSettings(): void {
    audioManager.playClick?.();
    audioManager.toggleMute?.();
    this.cameras.main.flash(100, 50, 50, 50);
  }
}