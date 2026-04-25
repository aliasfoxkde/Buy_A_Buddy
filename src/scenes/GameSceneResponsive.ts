// ==========================================
// GAME SCENE - Fully Responsive gameplay
// ==========================================

import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT, toggleFullscreen, zoomIn, zoomOut } from '../main';
import { 
  COLORS, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT,
  getSpawnCost, formatNumber, type RarityType 
} from '../config/constants';
import { GameStateService } from '../services/GameStateService';
import { DeviceDetector, isMobile, isTablet, isTV, getScaleFactor } from '../utils/deviceDetector';
import { audioManager } from '../audio/AudioManager';
import { PerformanceMonitor } from '../debug/DebugTools';

interface PlotData {
  x: number;
  y: number;
  buddyId: string | null;
}

export class GameSceneResponsive extends Phaser.Scene {
  private stateService!: GameStateService;
  private performanceMonitor!: PerformanceMonitor;
  
  // Player
  private player!: Phaser.GameObjects.Container;
  private playerSpeed = 150;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  
  // UI Elements
  private coinText!: Phaser.GameObjects.Text;
  private incomeText!: Phaser.GameObjects.Text;
  private spawnButton!: Phaser.GameObjects.Container;
  
  // Game state
  private gameState: any;
  private worldWidth = MAP_WIDTH * TILE_SIZE;
  private worldHeight = MAP_HEIGHT * TILE_SIZE;
  
  // Map
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private plots: PlotData[] = [];
  
  // Device & Responsive
  private deviceInfo = DeviceDetector.getInstance();
  private isTouch = false;
  private screenWidth = 0;
  private screenHeight = 0;
  private scaleFactor = 1;
  
  // Joystick
  private joystickBase!: Phaser.GameObjects.Graphics;
  private joystickKnob!: Phaser.GameObjects.Graphics;
  private joystickActive = false;

  constructor() {
    super({ key: 'GameSceneResponsive' });
  }

  create(): void {
    // Get screen dimensions
    this.screenWidth = this.scale.width;
    this.screenHeight = this.scale.height;
    this.scaleFactor = getScaleFactor();
    this.isTouch = this.deviceInfo.isTouchDevice();
    
    // Initialize services
    this.stateService = GameStateService.getInstance();
    this.gameState = this.stateService.getState();
    
    // Initialize performance monitor
    this.performanceMonitor = new PerformanceMonitor();
    
    // Background
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Create game elements
    this.createStarfield();
    this.createMap();
    this.createPlots();
    this.createPlayer();
    this.createSpawnButton();
    this.createUI();
    this.createMenuButton();
    
    // Setup input based on device
    this.setupInput();
    
    // Setup touch controls if mobile
    if (this.isTouch || isMobile()) {
      this.createVirtualJoystick();
    }
    
    // Camera bounds and follow
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Subscribe to state changes
    this.stateService.subscribe((state) => {
      this.gameState = state;
      this.updateUI();
    });
    
    // Handle resize
    this.scale.on('resize', this.handleResize, this);
    
    // Update UI after all elements are created
    this.updateUI();
    
    console.log(`🎮 GameSceneResponsive (${this.deviceInfo.getDeviceType()}, ${this.isTouch ? 'touch' : 'keyboard'})`);
  }

  update(): void {
    this.performanceMonitor.startFrame();
    
    // Handle movement based on device
    if (this.isTouch) {
      this.handleTouchMovement();
    } else {
      this.handleKeyboardMovement();
    }
    
    this.performanceMonitor.endFrame();
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    this.screenWidth = gameSize.width;
    this.screenHeight = gameSize.height;
    
    // Recreate UI elements
    this.children.removeAll();
    
    this.createStarfield();
    this.createMap();
    this.createPlots();
    this.createPlayer();
    this.createUI();
    this.createSpawnButton();
    this.createMenuButton();
    
    if (this.isTouch || isMobile()) {
      this.createVirtualJoystick();
    }
    
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
  }

  private createStarfield(): void {
    const graphics = this.add.graphics();
    
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, this.worldWidth);
      const y = Phaser.Math.Between(0, this.worldHeight);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      
      graphics.fillStyle(0xFFFFFF, alpha);
      graphics.fillCircle(x, y, size);
    }
  }

  private createMap(): void {
    this.mapGraphics = this.add.graphics();
    
    // Draw floor tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        
        this.mapGraphics.fillStyle(0x1a0a2e, 1);
        this.mapGraphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        
        this.mapGraphics.lineStyle(1, 0x2d1b4e, 0.3);
        this.mapGraphics.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
      }
    }
    
    // Draw border walls
    this.mapGraphics.fillStyle(0x3d2b5e, 1);
    this.mapGraphics.fillRect(0, 0, this.worldWidth, TILE_SIZE);
    this.mapGraphics.fillRect(0, this.worldHeight - TILE_SIZE, this.worldWidth, TILE_SIZE);
    this.mapGraphics.fillRect(0, 0, TILE_SIZE, this.worldHeight);
    this.mapGraphics.fillRect(this.worldWidth - TILE_SIZE, 0, TILE_SIZE, this.worldHeight);
  }

  private createPlots(): void {
    const scale = this.scaleFactor;
    const spacing = 100 * scale;
    const startX = 100;
    const startY = 150;
    
    this.plots = [];
    
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      
      this.plots.push({ x, y, buddyId: null });
      this.createPlotGraphic(x, y, i + 1);
    }
  }

  private createPlotGraphic(x: number, y: number, number: number): void {
    const scale = this.scaleFactor;
    const size = 80 * scale;
    const radius = 12;
    
    const plot = this.add.graphics();
    plot.fillStyle(0x3d2b5e, 1);
    plot.fillRoundedRect(x - size/2, y - size/2, size, size, radius);
    plot.lineStyle(2, 0xa855f7, 0.5);
    plot.strokeRoundedRect(x - size/2, y - size/2, size, size, radius);
    
    this.add.text(x, y - size/4, `P${number}`, {
      fontSize: `${Math.round(12 * scale)}px`,
      color: COLORS.textSecondary,
    }).setOrigin(0.5);
    
    this.add.text(x, y + 5, '+', {
      fontSize: `${Math.round(24 * scale)}px`,
      color: '#4d3b6e',
    }).setOrigin(0.5).setName(`plot-${number}`);
  }

  private createPlayer(): void {
    const scale = this.scaleFactor;
    
    this.player = this.add.container(200, 300);
    
    const glow = this.add.graphics();
    glow.fillStyle(0x06b6d4, 0.4);
    glow.fillCircle(0, 0, 20 * scale);
    this.player.add(glow);
    
    const body = this.add.graphics();
    body.fillStyle(0x06b6d4, 1);
    body.fillCircle(0, -5, 14 * scale);
    body.fillStyle(0x67e8f9, 0.6);
    body.fillCircle(-4 * scale, -9 * scale, 6 * scale);
    body.fillStyle(0xffffff, 1);
    body.fillCircle(-5 * scale, -5, 4 * scale);
    body.fillCircle(5 * scale, -5, 4 * scale);
    body.fillStyle(0x1a1a2e, 1);
    body.fillCircle(-4 * scale, -4, 2 * scale);
    body.fillCircle(6 * scale, -4, 2 * scale);
    this.player.add(body);
    
    this.mapGraphics.fillStyle(0x000000, 0.3);
    this.mapGraphics.fillEllipse(200, 310, 20, 8);
    
    this.player.setSize(28 * scale, 28 * scale);
  }

  private createUI(): void {
    const isMobileDevice = isMobile();
    const isTVDevice = isTV();
    const scale = this.scaleFactor;
    
    const topBarHeight = isTVDevice ? 60 * scale : isMobileDevice ? 44 : 50;
    
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0d0d1a, 0.95);
    topBar.fillRect(0, 0, this.screenWidth, topBarHeight);
    
    const coinSize = Math.round(20 * scale);
    this.coinText = this.add.text(20, topBarHeight / 2, formatNumber(Math.floor(this.gameState.player.coins)), {
      fontSize: `${coinSize}px`,
      fontFamily: 'Arial Black, Arial',
      color: COLORS.gold,
    }).setOrigin(0, 0.5);
    
    this.incomeText = this.add.text(100 * scale, topBarHeight / 2, '📈 0/s', {
      fontSize: `${Math.round(14 * scale)}px`,
      color: COLORS.accent,
    }).setOrigin(0, 0.5);
    
    this.updateUI();
  }

  private createSpawnButton(): void {
    const cost = getSpawnCost(this.gameState.buddies.length);
    const scale = this.scaleFactor;
    const isMobileDevice = isMobile();
    
    const buttonY = isMobileDevice ? this.screenHeight - 70 : this.screenHeight - 80;
    const buttonWidth = isMobileDevice ? 140 : 160;
    const buttonHeight = isMobileDevice ? 54 : 60;
    
    this.spawnButton = this.add.container(this.screenWidth / 2, buttonY);
    
    const glow = this.add.graphics();
    glow.fillStyle(0xec4899, 0.4);
    glow.fillRoundedRect(-buttonWidth/2 - 5, -buttonHeight/2 - 5, buttonWidth + 10, buttonHeight + 10, 20);
    this.spawnButton.add(glow);
    
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 16);
    this.spawnButton.add(bg);
    
    this.spawnButton.add(this.add.text(-buttonWidth/4, -5, '🎲', {
      fontSize: `${Math.round(28 * scale)}px`
    }));
    
    const costText = this.add.text(15, 0, `BUY ${formatNumber(cost)}`, {
      fontSize: `${Math.round(14 * scale)}px`,
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.spawnButton.add(costText);
    
    const hitArea = this.add.rectangle(0, 0, buttonWidth + 20, buttonHeight + 20)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);
    this.spawnButton.add(hitArea);
    
    hitArea.on('pointerdown', () => this.spawnBuddy());
    hitArea.on('pointerover', () => {
      audioManager.playClick();
      this.tweens.add({ targets: this.spawnButton, scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });
    hitArea.on('pointerout', () => {
      this.tweens.add({ targets: this.spawnButton, scaleX: 1, scaleY: 1, duration: 100 });
    });
    
    // Store bg reference for updateUI
    (this.spawnButton as any).bgGraphics = bg;
    (this.spawnButton as any).costText = costText;
    (this.spawnButton as any).buttonWidth = buttonWidth;
    (this.spawnButton as any).buttonHeight = buttonHeight;
  }

  private createMenuButton(): void {
    if (isMobile() || isTV()) return;
    
    const scale = this.scaleFactor;
    const btnSize = Math.round(44 * scale);
    
    const menuBtn = this.add.text(this.screenWidth - 20, 25, '☰', {
      fontSize: `${btnSize}px`,
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    
    menuBtn.on('pointerdown', () => {
      audioManager.playClick();
      this.scene.pause();
      this.scene.launch('MenuSceneResponsive');
    });
  }

  private createVirtualJoystick(): void {
    if (!this.isTouch && !isMobile()) return;
    
    const joystickX = 100;
    const joystickY = this.screenHeight - 120;
    const baseRadius = 60;
    const knobRadius = 30;
    
    this.joystickBase = this.add.graphics();
    this.joystickBase.fillStyle(0xffffff, 0.15);
    this.joystickBase.fillCircle(joystickX, joystickY, baseRadius);
    this.joystickBase.lineStyle(2, 0xa855f7, 0.5);
    this.joystickBase.strokeCircle(joystickX, joystickY, baseRadius);
    
    this.joystickKnob = this.add.graphics();
    this.joystickKnob.fillStyle(0xa855f7, 0.8);
    this.joystickKnob.fillCircle(joystickX, joystickY, knobRadius);
  }

  private setupInput(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
  }

  private handleKeyboardMovement(): void {
    let dx = 0;
    let dy = 0;
    
    if (this.cursors?.left.isDown || this.wasd?.A.isDown) dx -= 1;
    if (this.cursors?.right.isDown || this.wasd?.D.isDown) dx += 1;
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) dy -= 1;
    if (this.cursors?.down.isDown || this.wasd?.S.isDown) dy += 1;
    
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }
    
    this.player.x += dx * this.playerSpeed * 0.016;
    this.player.y += dy * this.playerSpeed * 0.016;
    
    this.clampPlayerPosition();
    
    if (dx !== 0 || dy !== 0) {
      this.tweens.add({
        targets: this.player,
        scaleX: 1.05,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
      });
    }
  }

  private handleTouchMovement(): void {
    // Joystick movement is handled in pointer events
    // This method is called from update() for any additional logic
  }

  private clampPlayerPosition(): void {
    const minX = TILE_SIZE + 20;
    const maxX = this.worldWidth - TILE_SIZE - 20;
    const minY = TILE_SIZE + 20;
    const maxY = this.worldHeight - TILE_SIZE - 20;
    
    this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
    this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);
  }

  private spawnBuddy(): void {
    const result = this.stateService.processAction({ type: 'SPAWN_BUDDY' });
    this.gameState = this.stateService.getState();
    
    if (result.success && result.result) {
      audioManager.playSpawn();
      this.showSpawnEffect(result.result.rarity);
      this.showFloatingText(
        this.screenWidth / 2, 
        this.screenHeight / 2,
        `✨ ${result.result.name}!`,
        this.getRarityColor(result.result.rarity)
      );
    } else {
      audioManager.playHit();
      this.showFloatingText(this.screenWidth / 2, this.screenHeight / 2, '❌ Not enough!', COLORS.danger);
    }
    
    this.updateUI();
  }

  private showSpawnEffect(rarity: RarityType): void {
    const color = this.getRarityColor(rarity);
    const colorHex = parseInt(color.replace('#', ''), 16);
    
    const particles = this.add.particles(this.screenWidth / 2, this.screenHeight / 2, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      tint: colorHex,
      emitting: true,
      quantity: 30,
    });
    
    this.time.delayedCall(200, () => particles.stop());
    this.time.delayedCall(1000, () => particles.destroy());
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const scale = this.scaleFactor;
    
    const floating = this.add.text(x, y, text, {
      fontSize: `${Math.round(20 * scale)}px`,
      fontFamily: 'Arial Black',
      color,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: floating,
      y: y - 80,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => floating.destroy(),
    });
  }

  private getRarityColor(rarity: RarityType): string {
    const colors: Record<RarityType, string> = {
      common: '#87CEEB',
      rare: '#9370DB',
      epic: '#FF69B4',
      legendary: '#FFD700',
    };
    return colors[rarity];
  }

  private updateUI(): void {
    this.coinText?.setText(formatNumber(Math.floor(this.gameState.player.coins)));
    
    let income = 0;
    for (const plot of this.gameState.plots) {
      if (plot.buddyId) {
        const buddy = this.gameState.buddies.find((b: any) => b.id === plot.buddyId);
        if (buddy) {
          income += buddy.baseIncome * buddy.level * plot.multiplier;
        }
      }
    }
    this.incomeText?.setText(`📈 ${formatNumber(income)}/s`);
    
    const cost = getSpawnCost(this.gameState.buddies.length);
    const canAfford = this.gameState.player.coins >= cost;
    
    // Update spawn button if it exists
    if (this.spawnButton) {
      const spawnData = this.spawnButton as any;
      const bg = spawnData.bgGraphics;
      const costText = spawnData.costText;
      
      if (bg && bg.clear) {
        const w = spawnData.buttonWidth || 160;
        const h = spawnData.buttonHeight || 60;
        bg.clear().fillStyle(canAfford ? 0xec4899 : 0x666666, 1).fillRoundedRect(-w/2, -h/2, w, h, 16);
      }
      
      if (costText && costText.setText) {
        costText.setText(`BUY ${formatNumber(cost)}`);
      }
    }
  }
}

// Export alias
export { GameSceneResponsive as GameScene };