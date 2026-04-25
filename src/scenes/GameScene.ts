// ==========================================
// GAME SCENE - Main gameplay
// ==========================================

import Phaser from 'phaser';
import { 
  GAME_WIDTH, GAME_HEIGHT, COLORS, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT,
  getSpawnCost, formatNumber, type RarityType 
} from '../config/constants';
import { GameStateService } from '../services/GameStateService';
import { DebugOverlay, PerformanceMonitor } from '../debug/DebugTools';

export class GameScene extends Phaser.Scene {
  private stateService!: GameStateService;
  private debugOverlay?: DebugOverlay;
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
  
  // Game state
  private gameState: any;
  private worldWidth = MAP_WIDTH * TILE_SIZE;
  private worldHeight = MAP_HEIGHT * TILE_SIZE;
  
  // Map
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private plots: { x: number; y: number; buddyId: string | null }[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Initialize services
    this.stateService = GameStateService.getInstance();
    this.gameState = this.stateService.getState();
    
    // Create debug overlay
    if (import.meta.env.DEV) {
      this.debugOverlay = new DebugOverlay(() => {
        const pm = this.performanceMonitor.getMetrics();
        return {
          fps: pm.fps,
          frameTime: pm.frameTime,
          memory: pm.memory,
          entities: pm.entities,
          drawCalls: pm.drawCalls,
        };
      });
      
      // Debug hotkeys
      (window as any).__debugAddCoins = (amount: number) => {
        this.gameState.player.coins += amount;
        this.updateUI();
      };
      
      (window as any).__debugSpawnBuddy = () => {
        this.stateService.processAction({ type: 'SPAWN_BUDDY' });
        this.gameState = this.stateService.getState();
        this.updateUI();
      };
      
      (window as any).__debugResetGame = () => {
        location.reload();
      };
    }
    
    // Initialize performance monitor
    this.performanceMonitor = new PerformanceMonitor();
    
    // Background
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Create starfield
    this.createStarfield();
    
    // Create map
    this.createMap();
    
    // Create plots
    this.createPlots();
    
    // Create player
    this.createPlayer();
    
    // Create UI
    this.createUI();
    
    // Create spawn button
    this.createSpawnButton();
    
    // Setup input
    this.setupInput();
    
    // Setup mobile controls
    this.setupMobileControls();
    
    // Subscribe to state changes
    this.stateService.subscribe((state) => {
      this.gameState = state;
      this.updateUI();
    });
    
    // Camera bounds
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  update(): void {
    this.performanceMonitor.startFrame();
    
    // Handle keyboard input
    this.handleMovement();
    
    // Update performance metrics
    const rawMetrics = this.performanceMonitor.getMetrics();
    const metrics = {
      fps: rawMetrics.fps,
      frameTime: rawMetrics.frameTime,
      memory: rawMetrics.memory,
      entities: rawMetrics.entities,
      drawCalls: rawMetrics.drawCalls,
    };
    this.performanceMonitor.endFrame();
    
    if (this.debugOverlay && import.meta.env.DEV) {
      this.debugOverlay.updateFromReport({
        timestamp: Date.now(),
        player: { name: this.gameState.player.name, level: this.gameState.player.level, coins: Math.floor(this.gameState.player.coins) },
        buddies: this.gameState.buddies.length,
        working: this.gameState.buddies.filter((b: any) => b.isWorking).length,
        plots: this.gameState.plots.length,
        occupied: this.gameState.plots.filter((p: any) => p.buddyId).length,
        quests: this.gameState.quests.length,
        inventory: this.gameState.inventory.length,
        statistics: this.gameState.statistics,
        metrics: metrics,
      });
    }
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
    this.mapGraphics.fillRect(0, 0, this.worldWidth, TILE_SIZE); // Top
    this.mapGraphics.fillRect(0, this.worldHeight - TILE_SIZE, this.worldWidth, TILE_SIZE); // Bottom
    this.mapGraphics.fillRect(0, 0, TILE_SIZE, this.worldHeight); // Left
    this.mapGraphics.fillRect(this.worldWidth - TILE_SIZE, 0, TILE_SIZE, this.worldHeight); // Right
  }

  private createPlots(): void {
    const startX = 100;
    const startY = 150;
    const spacing = 100;
    
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * spacing;
      const y = startY + row * spacing;
      
      this.plots.push({
        x,
        y,
        buddyId: null,
      });
      
      this.createPlotGraphic(x, y, i + 1);
    }
  }

  private createPlotGraphic(x: number, y: number, number: number): void {
    // Plot base
    const plot = this.add.graphics();
    plot.fillStyle(0x3d2b5e, 1);
    plot.fillRoundedRect(x - 40, y - 40, 80, 80, 12);
    plot.lineStyle(2, 0xa855f7, 0.5);
    plot.strokeRoundedRect(x - 40, y - 40, 80, 80, 12);
    
    // Plot number
    this.add.text(x, y - 25, `P${number}`, {
      fontSize: '12px',
      color: COLORS.textSecondary,
    }).setOrigin(0.5);
    
    // Empty indicator
    this.add.text(x, y + 5, '+', {
      fontSize: '24px',
      color: '#4d3b6e',
    }).setOrigin(0.5).setName(`plot-${number}`);
  }

  private createPlayer(): void {
    this.player = this.add.container(200, 300);
    
    // Player glow
    const glow = this.add.graphics();
    glow.fillStyle(0x06b6d4, 0.4);
    glow.fillCircle(0, 0, 20);
    this.player.add(glow);
    
    // Player body
    const body = this.add.graphics();
    body.fillStyle(0x06b6d4, 1);
    body.fillCircle(0, -5, 14);
    body.fillStyle(0x67e8f9, 0.6);
    body.fillCircle(-4, -9, 6);
    body.fillStyle(0xffffff, 1);
    body.fillCircle(-5, -5, 4);
    body.fillCircle(5, -5, 4);
    body.fillStyle(0x1a1a2e, 1);
    body.fillCircle(-4, -4, 2);
    body.fillCircle(6, -4, 2);
    this.player.add(body);
    
    // Player shadow
    this.mapGraphics.fillStyle(0x000000, 0.3);
    this.mapGraphics.fillEllipse(200, 310, 20, 8);
    
    // Size for physics
    this.player.setSize(28, 28);
    (this.player as any).body = { x: 200, y: 300 };
  }

  private createUI(): void {
    // Top bar background
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0d0d1a, 0.9);
    topBar.fillRect(0, 0, GAME_WIDTH, 50);
    
    // Coin display
    this.coinText = this.add.text(20, 15, `${formatNumber(this.gameState.player.coins)}`, {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: COLORS.gold,
    });
    
    // Income display
    this.incomeText = this.add.text(100, 18, '📈 0/s', {
      fontSize: '14px',
      color: COLORS.accent,
    });
    
    // Menu button
    const menuBtn = this.add.text(GAME_WIDTH - 20, 15, '☰', {
      fontSize: '24px',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    
    menuBtn.on('pointerdown', () => {
      this.scene.pause();
      this.scene.launch('MenuScene');
    });
    
    this.updateUI();
  }

  private createSpawnButton(): void {
    const cost = getSpawnCost(this.gameState.buddies.length);
    
    this.spawnButton = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 80);
    
    // Glow
    const glow = this.add.graphics();
    glow.fillStyle(0xec4899, 0.4);
    glow.fillRoundedRect(-80, -35, 160, 70, 20);
    this.spawnButton.add(glow);
    
    // Button
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillRoundedRect(-75, -30, 150, 60, 16);
    this.spawnButton.add(bg);
    
    // Icon
    this.add.text(0, -10, '🎲', { fontSize: '28px' }).setOrigin(0.5).setName('spawn-icon');
    this.spawnButton.add(this.add.text(0, 15, `BUY ${formatNumber(cost)}`, { fontSize: '14px', color: '#fff' }));
    
    this.spawnButton.setSize(150, 60);
    this.spawnButton.setInteractive({ useHandCursor: true });
    
    this.spawnButton.on('pointerdown', () => this.spawnBuddy());
    this.spawnButton.on('pointerover', () => {
      this.tweens.add({ targets: this.spawnButton, scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });
    this.spawnButton.on('pointerout', () => {
      this.tweens.add({ targets: this.spawnButton, scaleX: 1, scaleY: 1, duration: 100 });
    });
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

  private setupMobileControls(): void {
    // Joystick base
    const joystickBase = this.add.graphics();
    joystickBase.fillStyle(0xffffff, 0.1);
    joystickBase.fillCircle(80, GAME_HEIGHT - 100, 50);
    
    const joystickKnob = this.add.graphics();
    joystickKnob.fillStyle(0xa855f7, 0.8);
    joystickKnob.fillCircle(80, GAME_HEIGHT - 100, 25);
    
    let dragging = false;
    let startX = 0;
    let startY = 0;
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < 160 && pointer.y > GAME_HEIGHT - 200) {
        dragging = true;
        startX = pointer.x;
        startY = pointer.y;
      }
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (dragging && pointer.isDown) {
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
        const angle = Math.atan2(dy, dx);
        
        joystickKnob.clear();
        joystickKnob.fillStyle(0xa855f7, 0.8);
        joystickKnob.fillCircle(80 + Math.cos(angle) * dist, GAME_HEIGHT - 100 + Math.sin(angle) * dist, 25);
        
        // Move player
        const speed = this.playerSpeed * (dist / 40);
        this.player.x += Math.cos(angle) * speed * 0.016;
        this.player.y += Math.sin(angle) * speed * 0.016;
      }
    });
    
    this.input.on('pointerup', () => {
      dragging = false;
      joystickKnob.clear();
      joystickKnob.fillStyle(0xa855f7, 0.8);
      joystickKnob.fillCircle(80, GAME_HEIGHT - 100, 25);
    });
  }

  private handleMovement(): void {
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
      this.player.setScale(1, 0.95);
      this.tweens.add({
        targets: this.player,
        scaleX: 1.05,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
      });
    }
  }

  private spawnBuddy(): void {
    const result = this.stateService.processAction({ type: 'SPAWN_BUDDY' });
    this.gameState = this.stateService.getState();
    
    if (result.success && result.result) {
      // Show spawn effect
      this.showSpawnEffect(result.result.rarity);
      
      // Show floating text
      this.showFloatingText(
        GAME_WIDTH / 2, 
        GAME_HEIGHT - 150,
        `✨ ${result.result.name}!`,
        this.getRarityColor(result.result.rarity)
      );
    } else {
      this.showFloatingText(GAME_WIDTH / 2, GAME_HEIGHT - 150, '❌ Not enough!', COLORS.danger);
    }
    
    this.updateUI();
  }

  private showSpawnEffect(rarity: RarityType): void {
    const color = this.getRarityColor(rarity);
    const tintValue = parseInt(color.replace('#', ''), 16);
    const particles = this.add.particles(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      tint: tintValue,
      emitting: true,
      quantity: 20,
    });
    
    this.time.delayedCall(200, () => particles.stop());
    this.time.delayedCall(1000, () => particles.destroy());
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const floating = this.add.text(x, y, text, {
      fontSize: '18px',
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
  }
}