// ==========================================
// GAME SCENE - Main gameplay with responsive UI
// ==========================================

import Phaser from 'phaser';
import { 
  GAME_WIDTH, GAME_HEIGHT, COLORS, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT,
  getSpawnCost, formatNumber, type RarityType 
} from '../config/constants';
import { GameStateService } from '../services/GameStateService';
import { DeviceDetector, isMobile, isTablet, isTV, getScaleFactor, getMinTouchTarget } from '../utils/deviceDetector';
import { audioManager } from '../audio/AudioManager';
import { PerformanceMonitor } from '../debug/DebugTools';

export class GameScene extends Phaser.Scene {
  private stateService!: GameStateService;
  private performanceMonitor!: PerformanceMonitor;
  
  // Player
  private player!: Phaser.GameObjects.Container;
  private playerSpeed = 120;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  
  // UI Elements
  private coinText!: Phaser.GameObjects.Text;
  private incomeText!: Phaser.GameObjects.Text;
  private spawnButton!: Phaser.GameObjects.Container;
  private spawnButtonText!: Phaser.GameObjects.Text;
  private spawnButtonCost!: Phaser.GameObjects.Text;
  
  // Game state
  private gameState: any;
  private worldWidth = MAP_WIDTH * TILE_SIZE;
  private worldHeight = MAP_HEIGHT * TILE_SIZE;
  
  // Map
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private plots: { x: number; y: number; buddyId: string | null }[] = [];
  
  // Responsive
  private deviceInfo = DeviceDetector.getInstance();
  private isTouch = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Check if touch device
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
    this.createUI();
    this.createSpawnButton();
    
    // Setup input based on device
    if (this.isTouch) {
      this.setupTouchControls();
    } else {
      this.setupKeyboardControls();
    }
    
    // Setup mobile joystick
    this.setupMobileJoystick();
    
    // Camera bounds
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Subscribe to state changes
    this.stateService.subscribe((state) => {
      this.gameState = state;
      this.updateUI();
    });
    
    console.log(`🎮 GameScene created (${this.deviceInfo.getDeviceType()}, ${this.isTouch ? 'touch' : 'keyboard/mouse'})`);
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

  private createStarfield(): void {
    const graphics = this.add.graphics();
    
    for (let i = 0; i < 120; i++) {
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
    const scaleFactor = getScaleFactor();
    
    // Draw floor tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        
        // Floor
        this.mapGraphics.fillStyle(0x1a0a2e, 1);
        this.mapGraphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        
        // Grid
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
    const scaleFactor = getScaleFactor();
    const spacing = 100 * scaleFactor;
    const startX = 100;
    const startY = 150;
    
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      
      this.plots.push({ x, y, buddyId: null });
      this.createPlotGraphic(x, y, i + 1, scaleFactor);
    }
  }

  private createPlotGraphic(x: number, y: number, number: number, scaleFactor: number): void {
    const size = 80 * scaleFactor;
    const radius = 12;
    
    // Plot base
    const plot = this.add.graphics();
    plot.fillStyle(0x3d2b5e, 1);
    plot.fillRoundedRect(x - size/2, y - size/2, size, size, radius);
    plot.lineStyle(2, 0xa855f7, 0.5);
    plot.strokeRoundedRect(x - size/2, y - size/2, size, size, radius);
    
    // Plot number
    this.add.text(x, y - size/4, `P${number}`, {
      fontSize: `${Math.round(12 * scaleFactor)}px`,
      color: COLORS.textSecondary,
    }).setOrigin(0.5);
    
    // Empty indicator
    this.add.text(x, y + 5, '+', {
      fontSize: `${Math.round(24 * scaleFactor)}px`,
      color: '#4d3b6e',
    }).setOrigin(0.5).setName(`plot-${number}`);
  }

  private createPlayer(): void {
    const scaleFactor = getScaleFactor();
    
    this.player = this.add.container(200, 300);
    
    // Player glow
    const glow = this.add.graphics();
    glow.fillStyle(0x06b6d4, 0.4);
    glow.fillCircle(0, 0, 20 * scaleFactor);
    this.player.add(glow);
    
    // Player body
    const body = this.add.graphics();
    body.fillStyle(0x06b6d4, 1);
    body.fillCircle(0, -5, 14 * scaleFactor);
    body.fillStyle(0x67e8f9, 0.6);
    body.fillCircle(-4 * scaleFactor, -9 * scaleFactor, 6 * scaleFactor);
    body.fillStyle(0xffffff, 1);
    body.fillCircle(-5 * scaleFactor, -5, 4 * scaleFactor);
    body.fillCircle(5 * scaleFactor, -5, 4 * scaleFactor);
    body.fillStyle(0x1a1a2e, 1);
    body.fillCircle(-4 * scaleFactor, -4, 2 * scaleFactor);
    body.fillCircle(6 * scaleFactor, -4, 2 * scaleFactor);
    this.player.add(body);
    
    // Player shadow
    this.mapGraphics.fillStyle(0x000000, 0.3);
    this.mapGraphics.fillEllipse(200, 310, 20, 8);
    
    this.player.setSize(28 * scaleFactor, 28 * scaleFactor);
  }

  private createUI(): void {
    const scaleFactor = getScaleFactor();
    const isMobileDevice = isMobile();
    const isTVDevice = isTV();
    
    // Top bar height based on device
    const topBarHeight = isTVDevice ? 60 : isMobileDevice ? 44 : 50;
    
    // Top bar background
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0d0d1a, 0.95);
    topBar.fillRect(0, 0, GAME_WIDTH, topBarHeight);
    
    // Coin display
    const coinSize = Math.round(20 * scaleFactor);
    this.coinText = this.add.text(20, topBarHeight / 2, `${formatNumber(this.gameState.player.coins)}`, {
      fontSize: `${coinSize}px`,
      fontFamily: 'Arial Black, Arial',
      color: COLORS.gold,
    }).setOrigin(0, 0.5);
    
    // Income display
    this.incomeText = this.add.text(100 * scaleFactor, topBarHeight / 2, '📈 0/s', {
      fontSize: `${Math.round(14 * scaleFactor)}px`,
      color: COLORS.accent,
    }).setOrigin(0, 0.5);
    
    // Menu button (desktop only - for mobile, use swipe)
    if (!isMobileDevice && !isTVDevice) {
      const menuBtn = this.add.text(GAME_WIDTH - 20, topBarHeight / 2, '☰', {
        fontSize: '24px',
      }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
      
      menuBtn.on('pointerdown', () => {
        audioManager.playClick();
        this.scene.pause();
        this.scene.launch('MenuScene');
      });
    }
    
    this.updateUI();
  }

  private createSpawnButton(): void {
    const cost = getSpawnCost(this.gameState.buddies.length);
    const scaleFactor = getScaleFactor();
    const isMobileDevice = isMobile();
    
    // Button positioning
    const buttonY = isMobileDevice ? GAME_HEIGHT - 70 : GAME_HEIGHT - 80;
    const buttonWidth = isMobileDevice ? 140 : 150;
    const buttonHeight = isMobileDevice ? 54 : 60;
    
    this.spawnButton = this.add.container(GAME_WIDTH / 2, buttonY);
    
    // Glow
    const glow = this.add.graphics();
    glow.fillStyle(0xec4899, 0.4);
    glow.fillRoundedRect(-buttonWidth/2 - 5, -buttonHeight/2 - 5, buttonWidth + 10, buttonHeight + 10, 20);
    this.spawnButton.add(glow);
    
    // Button
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 16);
    this.spawnButton.add(bg);
    
    // Icon
    this.spawnButton.add(this.add.text(-buttonWidth/4, -5, '🎲', {
      fontSize: `${Math.round(28 * scaleFactor)}px`
    }));
    
    // Cost text
    this.spawnButtonCost = this.add.text(15, 0, `BUY ${formatNumber(cost)}`, {
      fontSize: `${Math.round(14 * scaleFactor)}px`,
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.spawnButton.add(this.spawnButtonCost);
    
    // Hit area (larger for touch)
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
  }

  private setupKeyboardControls(): void {
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

  private setupTouchControls(): void {
    // Touch controls are handled by setupMobileJoystick
    // This is for additional touch interactions if needed
  }

  private setupMobileJoystick(): void {
    if (!this.isTouch && !isMobile()) return;
    
    const joystickX = 80;
    const joystickY = GAME_HEIGHT - 100;
    const baseRadius = 50;
    const knobRadius = 25;
    
    // Joystick base
    const joystickBase = this.add.graphics();
    joystickBase.fillStyle(0xffffff, 0.15);
    joystickBase.fillCircle(joystickX, joystickY, baseRadius);
    joystickBase.lineStyle(2, 0xa855f7, 0.5);
    joystickBase.strokeCircle(joystickX, joystickY, baseRadius);
    
    // Joystick knob
    const joystickKnob = this.add.graphics();
    joystickKnob.fillStyle(0xa855f7, 0.8);
    joystickKnob.fillCircle(joystickX, joystickY, knobRadius);
    
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only activate in left half of screen
      if (pointer.x < 200 && pointer.y > GAME_HEIGHT - 200) {
        isDragging = true;
        startX = joystickX;
        startY = joystickY;
      }
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging && pointer.isDown) {
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), baseRadius);
        const angle = Math.atan2(dy, dx);
        
        // Move knob
        joystickKnob.clear();
        joystickKnob.fillStyle(0xa855f7, 0.8);
        joystickKnob.fillCircle(
          joystickX + Math.cos(angle) * dist,
          joystickY + Math.sin(angle) * dist,
          knobRadius
        );
        
        // Move player based on joystick position
        const normalizedDist = dist / baseRadius;
        const moveX = Math.cos(angle) * normalizedDist;
        const moveY = Math.sin(angle) * normalizedDist;
        
        this.player.x += moveX * this.playerSpeed * 0.016;
        this.player.y += moveY * this.playerSpeed * 0.016;
      }
    });
    
    this.input.on('pointerup', () => {
      isDragging = false;
      // Reset knob position
      joystickKnob.clear();
      joystickKnob.fillStyle(0xa855f7, 0.8);
      joystickKnob.fillCircle(joystickX, joystickY, knobRadius);
    });
  }

  private handleKeyboardMovement(): void {
    let dx = 0;
    let dy = 0;
    
    if (this.cursors?.left.isDown || this.wasd?.A.isDown) dx -= 1;
    if (this.cursors?.right.isDown || this.wasd?.D.isDown) dx += 1;
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) dy -= 1;
    if (this.cursors?.down.isDown || this.wasd?.S.isDown) dy += 1;
    
    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }
    
    // Apply movement
    this.player.x += dx * this.playerSpeed * 0.016;
    this.player.y += dy * this.playerSpeed * 0.016;
    
    // Bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, TILE_SIZE + 20, this.worldWidth - TILE_SIZE - 20);
    this.player.y = Phaser.Math.Clamp(this.player.y, TILE_SIZE + 20, this.worldHeight - TILE_SIZE - 20);
    
    // Bounce animation when moving
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
    // Touch movement is handled by joystick in setupMobileJoystick
    // This method is called from update() but the actual movement
    // is handled in the pointer events
  }

  private spawnBuddy(): void {
    const result = this.stateService.processAction({ type: 'SPAWN_BUDDY' });
    this.gameState = this.stateService.getState();
    
    if (result.success && result.result) {
      audioManager.playSpawn();
      this.showSpawnEffect(result.result.rarity);
      this.showFloatingText(
        GAME_WIDTH / 2, 
        GAME_HEIGHT - 150,
        `✨ ${result.result.name}!`,
        this.getRarityColor(result.result.rarity)
      );
    } else {
      audioManager.playHit();
      this.showFloatingText(GAME_WIDTH / 2, GAME_HEIGHT - 150, '❌ Not enough!', COLORS.danger);
    }
    
    this.updateUI();
  }

  private showSpawnEffect(rarity: RarityType): void {
    const color = this.getRarityColor(rarity);
    const colorHex = parseInt(color.replace('#', ''), 16);
    
    const particles = this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      tint: colorHex,
      emitting: true,
      quantity: 20,
    });
    
    this.time.delayedCall(200, () => particles.stop());
    this.time.delayedCall(1000, () => particles.destroy());
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const scaleFactor = getScaleFactor();
    
    const floating = this.add.text(x, y, text, {
      fontSize: `${Math.round(18 * scaleFactor)}px`,
      fontFamily: 'Arial Black',
      color,
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: floating,
      y: y - 50,
      alpha: 0,
      duration: 1000,
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
    const scaleFactor = getScaleFactor();
    
    // Update coin display
    this.coinText.setText(formatNumber(Math.floor(this.gameState.player.coins)));
    
    // Calculate income
    let income = 0;
    for (const plot of this.gameState.plots) {
      if (plot.buddyId) {
        const buddy = this.gameState.buddies.find((b: any) => b.id === plot.buddyId);
        if (buddy) {
          income += buddy.baseIncome * buddy.level * plot.multiplier;
        }
      }
    }
    this.incomeText.setText(`📈 ${formatNumber(income)}/s`);
    
    // Update spawn button cost
    const cost = getSpawnCost(this.gameState.buddies.length);
    const canAfford = this.gameState.player.coins >= cost;
    
    // Update button color
    const bg = this.spawnButton.getAt(1) as Phaser.GameObjects.Graphics;
    bg.clear().fillStyle(canAfford ? 0xec4899 : 0x666666, 1).fillRoundedRect(-75, -30, 150, 60, 16);
    
    // Update cost text
    this.spawnButtonCost.setText(`BUY ${formatNumber(cost)}`);
  }
}