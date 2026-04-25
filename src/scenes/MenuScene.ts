// ==========================================
// MENU SCENE - Responsive title screen with audio
// ==========================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';
import { DeviceDetector, isMobile, isTV, getScaleFactor } from '../utils/deviceDetector';
import { audioManager } from '../audio/AudioManager';

export class MenuScene extends Phaser.Scene {
  private playButton!: Phaser.GameObjects.Container;
  private continueButton!: Phaser.GameObjects.Container;
  private settingsButton!: Phaser.GameObjects.Container;
  private deviceInfo = DeviceDetector.getInstance();
  private audioInitialized = false;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Initialize audio on first interaction
    this.setupAudioInit();
    
    // Create visual elements based on device
    this.createStarfield();
    this.createNebula();
    this.createTitle();
    this.createButtons();
    this.createDeviceHints();
    
    // Animate title
    this.animateTitle();
  }

  private setupAudioInit(): void {
    // Wait for first pointer interaction to initialize audio
    // (required due to browser autoplay policies)
    const initAudio = () => {
      if (!this.audioInitialized) {
        audioManager.init();
        this.audioInitialized = true;
      }
    };
    
    this.input.on('pointerdown', initAudio, this);
    this.input.keyboard?.on('keydown', initAudio, this);
  }

  private createStarfield(): void {
    const graphics = this.add.graphics();
    const scaleFactor = getScaleFactor();
    
    for (let i = 0; i < 80 * scaleFactor; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const size = Phaser.Math.FloatBetween(0.5, 2.5);
      const alpha = Phaser.Math.FloatBetween(0.2, 1);
      const color = i % 3 === 0 ? 0xFFD700 : 0xFFFFFF;
      
      graphics.fillStyle(color, alpha);
      graphics.fillCircle(x, y, size);
    }
  }

  private createNebula(): void {
    const graphics = this.add.graphics();
    
    // Outer glow
    graphics.fillStyle(0xa855f7, 0.08);
    graphics.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 3, 300);
    
    // Inner glow
    graphics.fillStyle(0xec4899, 0.1);
    graphics.fillCircle(GAME_WIDTH / 2 - 50, GAME_HEIGHT / 3 - 20, 150);
    
    // Additional ambient glow
    graphics.fillStyle(0x06b6d4, 0.05);
    graphics.fillCircle(GAME_WIDTH / 2 + 80, GAME_HEIGHT / 3 + 30, 100);
  }

  private createTitle(): void {
    const scaleFactor = getScaleFactor();
    const titleSize = Math.round(42 * scaleFactor);
    const subtitleSize = Math.round(18 * scaleFactor);
    
    // Title shadow
    this.add.text(GAME_WIDTH / 2 + 3, 203, 'BUY A BUDDY', {
      fontSize: `${titleSize}px`,
      fontFamily: 'Georgia, serif',
      color: '#000000',
    }).setOrigin(0.5).setName('titleShadow');
    
    // Main title
    const title = this.add.text(GAME_WIDTH / 2, 200, 'BUY A BUDDY', {
      fontSize: `${titleSize}px`,
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5).setName('title');
    
    // Subtitle
    this.add.text(GAME_WIDTH / 2, 250, 'An Epic Adventure', {
      fontSize: `${subtitleSize}px`,
      fontFamily: 'Georgia, serif',
      color: COLORS.secondary,
      fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private createButtons(): void {
    const isMobileDevice = isMobile();
    const isTVDevice = isTV();
    const scaleFactor = getScaleFactor();
    
    // Button sizing based on device
    const buttonWidth = isTVDevice ? 280 : isMobileDevice ? 180 : 160;
    const buttonHeight = isTVDevice ? 70 : isMobileDevice ? 56 : 50;
    const buttonSpacing = isTVDevice ? 90 : isMobileDevice ? 70 : 60;
    const startY = isTVDevice ? 420 : isMobileDevice ? 400 : 380;
    
    // Play button
    this.playButton = this.createButton(
      GAME_WIDTH / 2, 
      startY, 
      '▶ PLAY', 
      () => this.startGame(),
      0xec4899,
      buttonWidth,
      buttonHeight,
      scaleFactor
    );
    
    // Continue button
    this.continueButton = this.createButton(
      GAME_WIDTH / 2, 
      startY + buttonSpacing, 
      '⏩ CONTINUE', 
      () => this.continueGame(),
      0x6B21A8,
      buttonWidth,
      buttonHeight,
      scaleFactor
    );
    
    // Settings button
    this.settingsButton = this.createButton(
      GAME_WIDTH / 2, 
      startY + buttonSpacing * 2, 
      '⚙️ SETTINGS', 
      () => this.openSettings(),
      0x4d3b6e,
      buttonWidth,
      buttonHeight,
      scaleFactor
    );
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    baseColor: number,
    width: number,
    height: number,
    scaleFactor: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const radius = 16;
    const fontSize = Math.round(20 * scaleFactor);
    
    // Glow effect
    const glow = this.add.graphics();
    glow.fillStyle(0xa855f7, 0.3);
    glow.fillRoundedRect(-width/2 - 8, -height/2 - 8, width + 16, height + 16, radius + 6);
    container.add(glow);
    
    // Main button
    const bg = this.add.graphics();
    bg.fillStyle(baseColor, 1);
    bg.fillRoundedRect(-width/2, -height/2, width, height, radius);
    bg.lineStyle(3, 0xa855f7, 0.9);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, radius);
    container.add(bg);
    
    // Button text
    const label = this.add.text(0, 0, text, {
      fontSize: `${fontSize}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(label);
    
    // Create invisible hit area (larger for touch)
    const hitArea = this.add.rectangle(0, 0, width + 20, height + 20)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    container.add(hitArea);
    
    // Hover effects
    hitArea.on('pointerover', () => {
      audioManager.playClick();
      this.tweens.add({
        targets: container,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 100,
        ease: 'Power2'
      });
      glow.clear();
      glow.fillStyle(0xa855f7, 0.5);
      glow.fillRoundedRect(-width/2 - 10, -height/2 - 10, width + 20, height + 20, radius + 8);
    });
    
    hitArea.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2'
      });
      glow.clear();
      glow.fillStyle(0xa855f7, 0.3);
      glow.fillRoundedRect(-width/2 - 8, -height/2 - 8, width + 16, height + 16, radius + 6);
    });
    
    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          onClick();
        }
      });
    });
    
    // Keyboard support (Enter/Space to select)
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => {
        if (container === this.playButton) {
          this.startGame();
        }
      });
      
      this.input.keyboard.on('keydown-ENTER', () => {
        if (container === this.playButton) {
          this.startGame();
        }
      });
    }
    
    return container;
  }

  private createDeviceHints(): void {
    const deviceType = this.deviceInfo.getDeviceType();
    const inputType = this.deviceInfo.getInputType();
    const scaleFactor = getScaleFactor();
    
    let hintText = '';
    let hintY = GAME_HEIGHT - 40;
    
    switch (inputType) {
      case 'touch':
        hintText = 'Tap buttons to interact';
        break;
      case 'keyboard':
        hintText = 'Press SPACE or ENTER to start';
        break;
      case 'gamepad':
        hintText = 'Press A button to start';
        hintY = GAME_HEIGHT - 60;
        break;
      default:
        hintText = 'Click buttons to interact';
    }
    
    // Show hint for non-mobile devices
    if (!isMobile()) {
      this.add.text(GAME_WIDTH / 2, hintY, hintText, {
        fontSize: `${Math.round(14 * scaleFactor)}px`,
        color: '#666666',
      }).setOrigin(0.5).setAlpha(0.8);
    }
    
    // TV-specific: show gamepad hints
    if (deviceType === 'tv') {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 100, '🎮 Use gamepad or remote to navigate', {
        fontSize: '20px',
        color: '#888888',
      }).setOrigin(0.5);
    }
  }

  private animateTitle(): void {
    const titleShadow = this.children.getByName('titleShadow') as Phaser.GameObjects.Text;
    const title = this.children.getByName('title') as Phaser.GameObjects.Text;
    
    if (title) {
      this.tweens.add({
        targets: title,
        y: 180,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      
      if (titleShadow) {
        this.tweens.add({
          targets: titleShadow,
          y: 183,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  private startGame(): void {
    audioManager.playClick();
    this.cameras.main.flash(300, 168, 85, 247, true);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene');
    });
  }

  private continueGame(): void {
    audioManager.playClick();
    this.cameras.main.flash(200, 168, 85, 247, true);
    this.time.delayedCall(200, () => {
      this.scene.start('GameScene');
    });
  }

  private openSettings(): void {
    audioManager.playClick();
    // Toggle mute as a simple settings action
    audioManager.toggleMute();
    this.cameras.main.flash(100, 100, 100, 100, true);
  }
}