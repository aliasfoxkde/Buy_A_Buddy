// ==========================================
// MENU SCENE - Fully Responsive with device detection
// ==========================================

import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT } from '../main';
import { COLORS } from '../config/constants';
import { DeviceDetector, isMobile, isTablet, isTV, getScaleFactor } from '../utils/deviceDetector';
import { audioManager } from '../audio/AudioManager';

interface ButtonConfig {
  width: number;
  height: number;
  fontSize: number;
  y: number;
  spacing: number;
}

export class MenuSceneResponsive extends Phaser.Scene {
  private deviceInfo = DeviceDetector.getInstance();
  private audioInitialized = false;
  private scaleFactor = 1;
  private screenWidth = 0;
  private screenHeight = 0;
  
  // UI elements positioned relative to screen
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'MenuSceneResponsive' });
  }

  create(): void {
    // Get actual screen dimensions
    this.screenWidth = this.scale.width;
    this.screenHeight = this.scale.height;
    this.scaleFactor = getScaleFactor();
    
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
    this.createFullscreenButton();
    
    // Animate title
    this.animateTitle();
    
    // Handle resize
    this.scale.on('resize', this.handleResize, this);
  }

  private setupAudioInit(): void {
    const initAudio = () => {
      if (!this.audioInitialized) {
        audioManager.init();
        this.audioInitialized = true;
      }
    };
    
    this.input.on('pointerdown', initAudio, this);
    this.input.keyboard?.on('keydown', initAudio, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.screenWidth = gameSize.width;
    this.screenHeight = gameSize.height;
    
    // Recreate UI elements at new positions
    this.children.removeAll();
    this.createStarfield();
    this.createNebula();
    this.createTitle();
    this.createButtons();
    this.createDeviceHints();
    this.createFullscreenButton();
    this.animateTitle();
  }

  private createStarfield(): void {
    const graphics = this.add.graphics();
    
    // Calculate number of stars based on screen size
    const starCount = Math.floor((this.screenWidth * this.screenHeight) / 4000);
    
    for (let i = 0; i < starCount; i++) {
      const x = Phaser.Math.Between(0, this.screenWidth);
      const y = Phaser.Math.Between(0, this.screenHeight);
      const size = Phaser.Math.FloatBetween(0.5, 3);
      const alpha = Phaser.Math.FloatBetween(0.2, 1);
      const color = i % 5 === 0 ? 0xFFD700 : i % 3 === 0 ? 0xec4899 : 0xFFFFFF;
      
      graphics.fillStyle(color, alpha);
      graphics.fillCircle(x, y, size);
    }
  }

  private createNebula(): void {
    const graphics = this.add.graphics();
    
    // Center position (relative to screen)
    const centerX = this.screenWidth / 2;
    const centerY = this.screenHeight / 4;
    
    // Large nebula
    graphics.fillStyle(0xa855f7, 0.08);
    graphics.fillCircle(centerX, centerY, Math.min(this.screenWidth, this.screenHeight) / 2);
    
    // Secondary glow
    graphics.fillStyle(0xec4899, 0.06);
    graphics.fillCircle(centerX - 50, centerY - 20, 150);
    
    // Accent glow
    graphics.fillStyle(0x06b6d4, 0.04);
    graphics.fillCircle(centerX + 80, centerY + 30, 100);
  }

  private createTitle(): void {
    const centerX = this.screenWidth / 2;
    const baseY = this.screenHeight * 0.18;
    
    const scale = this.getResponsiveScale();
    const titleSize = Math.round(42 * scale);
    const subtitleSize = Math.round(18 * scale);
    
    // Title shadow
    this.add.text(centerX + 3, baseY + 3, 'BUY A BUDDY', {
      fontSize: `${titleSize}px`,
      fontFamily: 'Georgia, serif',
      color: '#000000',
    }).setOrigin(0.5).setName('titleShadow');
    
    // Main title
    this.add.text(centerX, baseY, 'BUY A BUDDY', {
      fontSize: `${titleSize}px`,
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5).setName('title');
    
    // Subtitle
    this.add.text(centerX, baseY + 50 * scale, 'An Epic Adventure', {
      fontSize: `${subtitleSize}px`,
      fontFamily: 'Georgia, serif',
      color: COLORS.secondary,
      fontStyle: 'italic',
    }).setOrigin(0.5);
  }

  private createButtons(): void {
    const config = this.getButtonConfig();
    const centerX = this.screenWidth / 2;
    
    this.buttons = [];
    
    // Play button
    const playBtn = this.createButton(
      centerX,
      config.y,
      '▶ PLAY',
      () => this.startGame(),
      0xec4899,
      config
    );
    this.buttons.push(playBtn);
    
    // Continue button
    const continueBtn = this.createButton(
      centerX,
      config.y + config.spacing,
      '⏩ CONTINUE',
      () => this.continueGame(),
      0x6B21A8,
      config
    );
    this.buttons.push(continueBtn);
    
    // Settings button
    const settingsBtn = this.createButton(
      centerX,
      config.y + config.spacing * 2,
      '⚙️ SETTINGS',
      () => this.openSettings(),
      0x4d3b6e,
      config
    );
    this.buttons.push(settingsBtn);
    
    // Store play button reference for keyboard
    (this as any).playButtonRef = playBtn;
  }

  private getButtonConfig(): ButtonConfig {
    const isTVDevice = isTV();
    const isMobileDevice = isMobile();
    const scale = this.scaleFactor;
    
    if (isTVDevice) {
      return {
        width: 280 * scale,
        height: 70 * scale,
        fontSize: 24 * scale,
        y: this.screenHeight * 0.55,
        spacing: 90 * scale,
      };
    } else if (isMobileDevice) {
      return {
        width: 200 * scale,
        height: 56 * scale,
        fontSize: 20 * scale,
        y: this.screenHeight * 0.5,
        spacing: 70 * scale,
      };
    } else {
      return {
        width: 180 * scale,
        height: 50 * scale,
        fontSize: 18 * scale,
        y: this.screenHeight * 0.45,
        spacing: 65 * scale,
      };
    }
  }

  private getResponsiveScale(): number {
    const isTVDevice = isTV();
    const isMobileDevice = isMobile();
    const isTabletDevice = isTablet();
    
    // Base scale
    let scale = 1;
    
    // Adjust based on screen height
    if (isTVDevice) {
      scale = Math.min(this.screenWidth, this.screenHeight) / 600;
    } else if (isTabletDevice) {
      scale = Math.min(this.screenWidth, this.screenHeight) / 700;
    } else if (isMobileDevice) {
      scale = Math.min(this.screenWidth, this.screenHeight) / 500;
    } else {
      // Desktop - scale based on actual screen
      const minDim = Math.min(this.screenWidth, this.screenHeight);
      scale = minDim / 600;
    }
    
    // Clamp scale
    return Math.max(0.6, Math.min(scale, 2));
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    baseColor: number,
    config: ButtonConfig
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const { width, height, fontSize } = config;
    
    const radius = Math.round(16 * this.scaleFactor);
    
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
    
    // Invisible hit area (larger for better touch)
    const hitPadding = 20;
    const hitArea = this.add.rectangle(0, 0, width + hitPadding, height + hitPadding)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    container.add(hitArea);
    
    // Hover effects
    hitArea.on('pointerover', () => {
      audioManager.playClick();
      this.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
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
        onComplete: () => onClick()
      });
    });
    
    // Store reference
    (container as any).hitArea = hitArea;
    
    return container;
  }

  private createDeviceHints(): void {
    const inputType = this.deviceInfo.getInputType();
    const scale = this.getResponsiveScale();
    const bottomY = this.screenHeight - 30 * scale;
    
    let hintText = '';
    let hintSize = Math.round(14 * scale);
    
    switch (inputType) {
      case 'touch':
        hintText = 'Tap buttons to interact';
        break;
      case 'keyboard':
        hintText = 'Press SPACE or ENTER to start • F for fullscreen';
        break;
      case 'gamepad':
        hintText = 'Press A button to start';
        break;
      default:
        hintText = 'Click buttons to interact • F for fullscreen';
    }
    
    // Only show on non-mobile
    if (!isMobile()) {
      this.add.text(this.screenWidth / 2, bottomY, hintText, {
        fontSize: `${hintSize}px`,
        color: '#666666',
      }).setOrigin(0.5).setAlpha(0.8);
    }
    
    // TV-specific gamepad hints
    if (isTV()) {
      this.add.text(this.screenWidth / 2, bottomY - 30, '🎮 Use gamepad or remote to navigate', {
        fontSize: `${hintSize * 1.2}px`,
        color: '#888888',
      }).setOrigin(0.5);
    }
  }

  private createFullscreenButton(): void {
    // Only show on desktop/tablet
    if (isMobile() || isTV()) return;
    
    const btnSize = Math.round(44 * this.scaleFactor);
    const x = this.screenWidth - 20;
    const y = 20;
    
    const btn = this.add.text(x, y, '⛶', {
      fontSize: `${btnSize}px`,
    }).setOrigin(1, 0).setAlpha(0.7).setInteractive({ useHandCursor: true });
    
    btn.on('pointerdown', () => {
      (window as any).toggleFullscreen?.();
    });
    
    btn.on('pointerover', () => btn.setAlpha(1));
    btn.on('pointerout', () => btn.setAlpha(0.7));
  }

  private animateTitle(): void {
    const titleShadow = this.children.getByName('titleShadow') as Phaser.GameObjects.Text;
    const title = this.children.getByName('title') as Phaser.GameObjects.Text;
    
    if (title) {
      this.tweens.add({
        targets: title,
        y: this.screenHeight * 0.16,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      
      if (titleShadow) {
        this.tweens.add({
          targets: titleShadow,
          y: this.screenHeight * 0.163,
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
      this.scene.start('GameSceneResponsive');
    });
  }

  private continueGame(): void {
    audioManager.playClick();
    this.cameras.main.flash(200, 168, 85, 247, true);
    this.time.delayedCall(200, () => {
      this.scene.start('GameSceneResponsive');
    });
  }

  private openSettings(): void {
    audioManager.playClick();
    audioManager.toggleMute();
    this.cameras.main.flash(100, 100, 100, 100, true);
  }
}

// Export alias for backwards compatibility
export { MenuSceneResponsive as MenuScene };