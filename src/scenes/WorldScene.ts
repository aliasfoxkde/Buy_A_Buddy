// ==========================================
// WORLD SCENE - Main RPG Exploration
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';
import { GameStateService } from '../services/GameStateService';
import { toggleFullscreen } from '../main';

export class WorldScene extends Phaser.Scene {
  // Player
  private player!: Phaser.GameObjects.Container;
  private playerSpeed = 150;
  
  // Movement
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  
  // Map
  private mapWidth = 1600;
  private mapHeight = 1200;
  private tileSize = 32;
  
  // UI
  private coinText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private questText!: Phaser.GameObjects.Text;
  
  // Game State
  private stateService = GameStateService.getInstance();
  private gameState: any;
  
  // NPCs & Interactables
  private npcs: Phaser.GameObjects.Container[] = [];
  private npcIndicator!: Phaser.GameObjects.Text;
  
  // UI Buttons (bottom bar)
  private buttons: { [key: string]: Phaser.GameObjects.Container } = {};
  
  // Touch
  private joystickBase!: Phaser.GameObjects.Graphics;
  private joystickKnob!: Phaser.GameObjects.Graphics;
  private isTouch = false;
  private joystickActive = false;
  
  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.gameState = this.stateService.getState();
    
    // Background
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Create world
    this.createWorld();
    this.createPlayer();
    this.createUI();
    this.createButtons();
    this.createNPCs();
    
    // Setup controls
    this.setupKeyboardControls();
    if (this.isTouch) this.createTouchJoystick();
    
    // Camera
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Play game music
    audioManager.playGameMusic?.();
    
    // Story intro
    this.showStoryIntro();
    
    console.log('🎮 WorldScene loaded - Explore Buddyaria!');
  }

  update(): void {
    this.handleMovement();
    this.checkNPCProximity();
  }

  private createWorld(): void {
    const graphics = this.add.graphics();
    
    // Ground tiles
    for (let y = 0; y < this.mapHeight / this.tileSize; y++) {
      for (let x = 0; x < this.mapWidth / this.tileSize; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        
        // Base grass
        graphics.fillStyle(0x1a3a2a, 1);
        graphics.fillRect(px, py, this.tileSize, this.tileSize);
        
        // Subtle variation
        if ((x + y) % 3 === 0) {
          graphics.fillStyle(0x1f4a35, 0.3);
          graphics.fillRect(px + 8, py + 8, 16, 16);
        }
      }
    }
    
    // Add decorative elements
    this.addDecorations(graphics);
    
    // Add paths
    this.addPaths(graphics);
    
    // Add obstacles/trees
    this.addTrees(graphics);
    
    // Add buildings/areas
    this.addBuildings(graphics);
  }

  private addDecorations(graphics: Phaser.GameObjects.Graphics): void {
    // Flowers
    const flowerColors = [0xff69b4, 0x9370db, 0xfbbf24, 0x87ceeb];
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(50, this.mapWidth - 50);
      const y = Phaser.Math.Between(50, this.mapHeight - 50);
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      
      graphics.fillStyle(color, 0.8);
      graphics.fillCircle(x, y, 4);
      graphics.fillStyle(0x22c55e, 0.6);
      graphics.fillRect(x - 1, y, 2, 8);
    }
    
    // Floating sparkles
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, this.mapWidth);
      const y = Phaser.Math.Between(0, this.mapHeight);
      
      const sparkle = this.add.text(x, y, '✨', {
        fontSize: '16px',
      }).setAlpha(0.4);
      
      this.tweens.add({
        targets: sparkle,
        y: y - 20,
        alpha: 0.1,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }
  }

  private addPaths(graphics: Phaser.GameObjects.Graphics): void {
    // Main path (horizontal)
    graphics.fillStyle(0x3d2b5e, 1);
    graphics.fillRect(0, 580, this.mapWidth, 48);
    
    // Path detail
    graphics.fillStyle(0x4d3b6e, 0.5);
    for (let x = 0; x < this.mapWidth; x += 64) {
      graphics.fillRect(x, 590, 32, 4);
    }
    
    // Vertical path
    graphics.fillStyle(0x3d2b5e, 1);
    graphics.fillRect(780, 0, 48, this.mapHeight);
    
    // Area borders
    graphics.lineStyle(4, 0xa855f7, 0.3);
    graphics.strokeRect(0, 0, this.mapWidth, this.mapHeight);
  }

  private addTrees(graphics: Phaser.GameObjects.Graphics): void {
    const treePositions = [
      { x: 100, y: 150 }, { x: 200, y: 300 }, { x: 300, y: 100 },
      { x: 500, y: 200 }, { x: 1100, y: 150 }, { x: 1300, y: 300 },
      { x: 200, y: 800 }, { x: 400, y: 900 }, { x: 1200, y: 850 },
      { x: 100, y: 1000 }, { x: 1400, y: 1050 }, { x: 600, y: 1100 },
    ];
    
    treePositions.forEach(pos => {
      // Tree shadow
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillEllipse(pos.x, pos.y + 25, 40, 12);
      
      // Tree trunk
      graphics.fillStyle(0x8b4513, 1);
      graphics.fillRect(pos.x - 6, pos.y, 12, 30);
      
      // Tree foliage
      graphics.fillStyle(0x228b22, 1);
      graphics.fillCircle(pos.x, pos.y - 10, 25);
      graphics.fillStyle(0x2e8b2e, 1);
      graphics.fillCircle(pos.x - 10, pos.y - 5, 18);
      graphics.fillCircle(pos.x + 10, pos.y - 5, 18);
    });
  }

  private addBuildings(graphics: Phaser.GameObjects.Graphics): void {
    // Guild Hall (center)
    this.createBuilding(760, 400, 120, 100, '🏰 GUILD HALL', 'guild');
    
    // Shop (left side)
    this.createBuilding(200, 550, 80, 70, '🛒 SHOP', 'shop');
    
    // Buddy Farm (right side)
    this.createBuilding(1100, 550, 100, 80, '🏠 BUDDY FARM', 'farm');
    
    // Cave entrance (bottom right)
    this.createBuilding(1200, 1000, 150, 80, '💎 CRYSTAL CAVES', 'cave');
    
    // Tower (top)
    this.createBuilding(750, 80, 80, 100, '⭐ QUEST TOWER', 'tower');
  }

  private createBuilding(x: number, y: number, width: number, height: number, name: string, type: string): void {
    const graphics = this.add.graphics();
    
    // Building shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(x + 5, y + 5, width, height);
    
    // Building body
    graphics.fillStyle(0x4d3b6e, 1);
    graphics.fillRect(x, y, width, height);
    
    // Roof
    graphics.fillStyle(0x6B21A8, 1);
    graphics.fillTriangle(x - 10, y, x + width / 2, y - 30, x + width + 10, y);
    
    // Window
    graphics.fillStyle(0xfbbf24, 0.6);
    graphics.fillRect(x + width / 2 - 10, y + 20, 20, 20);
    
    // Name label
    const label = this.add.text(x + width / 2, y - 40, name, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#0d0d1a',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);
    
    // Make building interactive
    const zone = this.add.zone(x + width / 2, y + height / 2, width, height)
      .setInteractive({ useHandCursor: true })
      .setName(type);
    
    zone.on('pointerdown', () => this.interactWithBuilding(type));
  }

  private createPlayer(): void {
    this.player = this.add.container(800, 600);
    
    // Player shadow
    this.add.graphics().fillStyle(0x000000, 0.3).fillEllipse(0, 20, 30, 10);
    
    // Glow effect
    const glow = this.add.graphics();
    glow.fillStyle(0x06b6d4, 0.3);
    glow.fillCircle(0, 0, 25);
    this.player.add(glow);
    
    // Body (cute blob)
    const body = this.add.graphics();
    body.fillStyle(0x06b6d4, 1);
    body.fillCircle(0, -5, 18);
    body.fillStyle(0x67e8f9, 0.5);
    body.fillCircle(-5, -10, 8);
    this.player.add(body);
    
    // Face
    const face = this.add.graphics();
    // Eyes
    face.fillStyle(0xffffff, 1);
    face.fillCircle(-6, -5, 5);
    face.fillCircle(6, -5, 5);
    // Pupils
    face.fillStyle(0x1a1a2e, 1);
    face.fillCircle(-5, -4, 2.5);
    face.fillCircle(7, -4, 2.5);
    // Cheeks
    face.fillStyle(0xff69b4, 0.5);
    face.fillCircle(-10, 2, 3);
    face.fillCircle(10, 2, 3);
    // Smile
    face.lineStyle(2, 0x1a1a2e, 1);
    face.arc(0, 2, 6, 0.2 * Math.PI, 0.8 * Math.PI, false);
    this.player.add(face);
    
    // Name tag
    this.add.text(0, -40, 'You', {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#06b6d4',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setName('playerName');
    
    this.player.setSize(36, 36);
  }

  private createUI(): void {
    const width = this.scale.width;
    
    // Top bar background
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0d0d1a, 0.95);
    topBar.fillRect(0, 0, width, 60);
    topBar.lineStyle(2, 0xa855f7, 0.5);
    topBar.lineBetween(0, 60, width, 60);
    
    // Menu button (hamburger style - top left)
    this.createMenuButton(35, 30);
    
    // Stats
    const statsX = 100;
    
    // Coins
    this.add.text(statsX, 10, '💰', { fontSize: '20px' }).setOrigin(0.5);
    this.coinText = this.add.text(statsX + 25, 20, '1,234', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: COLORS.gold,
    }).setOrigin(0, 0.5);
    
    // Health
    this.add.text(statsX + 120, 10, '❤️', { fontSize: '20px' }).setOrigin(0.5);
    this.healthText = this.add.text(statsX + 145, 20, '100/100', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: COLORS.danger,
    }).setOrigin(0, 0.5);
    
    // Level
    this.add.text(statsX + 240, 10, '⭐', { fontSize: '20px' }).setOrigin(0.5);
    this.levelText = this.add.text(statsX + 265, 20, 'Lv.1', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: COLORS.primary,
    }).setOrigin(0, 0.5);
    
    // Quest indicator (top right area)
    this.questText = this.add.text(width - 20, 20, '📜 Quest: Find the first Buddy!', {
      fontSize: '14px',
      color: '#a78bfa',
    }).setOrigin(1, 0.5);
    
    // Fullscreen button (top right corner)
    this.createFullscreenButton(width - 35, 30);
    
    this.updateUI();
  }

  private createMenuButton(x: number, y: number): void {
    const btn = this.add.container(x, y);
    
    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(-20, -20, 40, 40, 8);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-20, -20, 40, 40, 8);
    btn.add(bg);
    
    // Menu icon (3 lines)
    const icon = this.add.graphics();
    icon.lineStyle(3, 0xffffff, 1);
    icon.lineBetween(-12, -8, 12, -8);
    icon.lineBetween(-12, 0, 12, 0);
    icon.lineBetween(-12, 8, 12, 8);
    btn.add(icon);
    
    // Hit area
    const hit = this.add.rectangle(0, 0, 50, 50).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.scene.pause();
      this.scene.launch('SettingsScene');
    });
    
    hit.on('pointerover', () => this.tweens.add({ targets: btn, scaleX: 1.1, scaleY: 1.1, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
  }

  private createFullscreenButton(x: number, y: number): void {
    const btn = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.8);
    bg.fillRoundedRect(-22, -22, 44, 44, 10);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-22, -22, 44, 44, 10);
    btn.add(bg);
    
    const icon = this.add.text(0, 0, '⛶', { fontSize: '22px' }).setOrigin(0.5);
    btn.add(icon);
    
    const hit = this.add.rectangle(0, 0, 54, 54).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    btn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      toggleFullscreen();
    });
    
    hit.on('pointerover', () => this.tweens.add({ targets: btn, scaleX: 1.1, scaleY: 1.1, duration: 100 }));
    hit.on('pointerout', () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
  }

  private createButtons(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    const buttonConfigs = [
      { key: 'buddy', icon: '🐾', x: width * 0.25, y: height - 50, action: () => this.scene.launch('BuddyScene') },
      { key: 'battle', icon: '⚔️', x: width * 0.5, y: height - 50, action: () => this.startBattle() },
      { key: 'farm', icon: '🏠', x: width * 0.75, y: height - 50, action: () => this.scene.start('WorldScene') },
    ];
    
    buttonConfigs.forEach(config => {
      const btn = this.add.container(config.x, config.y);
      
      const bg = this.add.graphics();
      bg.fillStyle(0x2d1b4e, 0.9);
      bg.fillRoundedRect(-40, -35, 80, 70, 12);
      bg.lineStyle(2, 0xa855f7, 0.6);
      bg.strokeRoundedRect(-40, -35, 80, 70, 12);
      btn.add(bg);
      
      const icon = this.add.text(0, -5, config.icon, { fontSize: '32px' }).setOrigin(0.5);
      btn.add(icon);
      
      const hit = this.add.rectangle(0, 0, 90, 80).setInteractive({ useHandCursor: true }).setAlpha(0.001);
      btn.add(hit);
      
      hit.on('pointerdown', () => {
        audioManager.playClick?.();
        config.action();
      });
      
      hit.on('pointerover', () => this.tweens.add({ targets: btn, scaleX: 1.1, scaleY: 1.1, duration: 100 }));
      hit.on('pointerout', () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
      
      this.buttons[config.key] = btn;
    });
  }

  private createNPCs(): void {
    // NPC 1: Elder Trainer
    this.createNPC(400, 300, 'Elder Maya', '👵', 'Welcome, young trainer!');
    
    // NPC 2: Shop Keeper
    this.createNPC(220, 580, 'Sam', '🧑‍🏫', 'Welcome to my shop!');
    
    // NPC 3: Wild Buddy (catchable)
    this.createNPC(900, 400, 'Wild Slime', '🟢', 'SQUISH!', true);
    
    // NPC 4: Guardian
    this.createNPC(1300, 700, 'Stone Guardian', '🗿', 'You shall not pass!');
  }

  private createNPC(x: number, y: number, name: string, icon: string, dialogue: string, isEnemy = false): void {
    const npc = this.add.container(x, y);
    
    // Shadow
    this.add.graphics().fillStyle(0x000000, 0.3).fillEllipse(0, 20, 30, 10);
    
    // Glow (colored by type)
    const glow = this.add.graphics();
    glow.fillStyle(isEnemy ? 0xef4444 : 0x22c55e, 0.3);
    glow.fillCircle(0, 0, 22);
    npc.add(glow);
    
    // Body
    const body = this.add.graphics();
    body.fillStyle(isEnemy ? 0x22c55e : 0x9370db, 1);
    body.fillCircle(0, -5, 16);
    npc.add(body);
    
    // Face
    const face = this.add.graphics();
    face.fillStyle(0xffffff, 1);
    face.fillCircle(-5, -5, 4);
    face.fillCircle(5, -5, 4);
    face.fillStyle(0x1a1a2e, 1);
    face.fillCircle(-4, -4, 2);
    face.fillCircle(6, -4, 2);
    npc.add(face);
    
    // Icon
    const iconText = this.add.text(0, -5, icon, { fontSize: '20px' }).setOrigin(0.5);
    npc.add(iconText);
    
    // Name
    const nameTag = this.add.text(0, -40, name, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: isEnemy ? '#ef4444' : '#6B21A8',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5);
    npc.add(nameTag);
    
    // Interaction indicator
    const indicator = this.add.text(0, -60, '💬', { fontSize: '16px' }).setOrigin(0.5).setAlpha(0);
    npc.add(indicator);
    
    // Make interactive
    const hitArea = this.add.zone(x, y, 50, 50).setInteractive({ useHandCursor: true });
    
    hitArea.on('pointerover', () => {
      indicator.setAlpha(1);
      this.tweens.add({ targets: npc, scaleX: 1.1, scaleY: 1.1, duration: 150 });
    });
    
    hitArea.on('pointerout', () => {
      indicator.setAlpha(0);
      this.tweens.add({ targets: npc, scaleX: 1, scaleY: 1, duration: 150 });
    });
    
    hitArea.on('pointerdown', () => {
      audioManager.playClick?.();
      this.showDialogue(name, dialogue, isEnemy);
    });
    
    (npc as any).indicator = indicator;
    (npc as any).isEnemy = isEnemy;
    (npc as any).name = name;
    this.npcs.push(npc);
  }

  private setupKeyboardControls(): void {
    if (!this.input.keyboard) return;
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    
    // Interact with E
    this.input.keyboard.on('keydown-E', () => this.interactNearestNPC());
    
    // Open buddy menu with I
    this.input.keyboard.on('keydown-I', () => this.scene.launch('BuddyScene'));
    
    // Open quest with M
    this.input.keyboard.on('keydown-M', () => this.scene.launch('QuestScene'));
  }

  private createTouchJoystick(): void {
    const joystickX = 100;
    const joystickY = this.scale.height - 100;
    const baseRadius = 60;
    const knobRadius = 30;
    
    this.joystickBase = this.add.graphics();
    this.joystickBase.fillStyle(0xffffff, 0.15);
    this.joystickBase.fillCircle(joystickX, joystickY, baseRadius);
    this.joystickBase.lineStyle(3, 0xa855f7, 0.5);
    this.joystickBase.strokeCircle(joystickX, joystickY, baseRadius);
    
    this.joystickKnob = this.add.graphics();
    this.joystickKnob.fillStyle(0xa855f7, 0.8);
    this.joystickKnob.fillCircle(joystickX, joystickY, knobRadius);
    
    let startX = 0;
    let startY = 0;
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < 200 && pointer.y > this.scale.height - 200) {
        this.joystickActive = true;
        startX = joystickX;
        startY = joystickY;
      }
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && pointer.isDown) {
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), baseRadius);
        const angle = Math.atan2(dy, dx);
        
        this.joystickKnob.clear();
        this.joystickKnob.fillStyle(0xa855f7, 0.8);
        this.joystickKnob.fillCircle(
          joystickX + Math.cos(angle) * dist,
          joystickY + Math.sin(angle) * dist,
          knobRadius
        );
        
        // Move player
        const normalizedDist = dist / baseRadius;
        this.player.x += Math.cos(angle) * normalizedDist * this.playerSpeed * 0.016;
        this.player.y += Math.sin(angle) * normalizedDist * this.playerSpeed * 0.016;
      }
    });
    
    this.input.on('pointerup', () => {
      this.joystickActive = false;
      this.joystickKnob.clear();
      this.joystickKnob.fillStyle(0xa855f7, 0.8);
      this.joystickKnob.fillCircle(joystickX, joystickY, knobRadius);
    });
  }

  private handleMovement(): void {
    let dx = 0;
    let dy = 0;
    
    // Keyboard
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
    
    // Bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 50, this.mapWidth - 50);
    this.player.y = Phaser.Math.Clamp(this.player.y, 80, this.mapHeight - 50);
    
    // Bounce animation
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

  private checkNPCProximity(): void {
    this.npcs.forEach(npc => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      
      const indicator = (npc as any).indicator;
      if (indicator) {
        if (distance < 80) {
          indicator.setAlpha(1);
        } else {
          indicator.setAlpha(0);
        }
      }
    });
  }

  private interactNearestNPC(): void {
    let nearest: Phaser.GameObjects.Container | null = null;
    let nearestDist = Infinity;
    
    this.npcs.forEach(npc => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      if (dist < 80 && dist < nearestDist) {
        nearest = npc;
        nearestDist = dist;
      }
    });
    
    if (nearest) {
      audioManager.playClick?.();
      const isEnemy = (nearest as any).isEnemy;
      const name = (nearest as any).name;
      const dialogue = name === 'Elder Maya' ? 
        'Welcome, young trainer! Go catch some buddies and grow strong!' :
        name === 'Wild Slime' ?
        'SQUISH! A wild Buddy appeared! Want to catch it?' :
        'Hello there, traveler!';
      
      this.showDialogue(name, dialogue, isEnemy);
    }
  }

  private showDialogue(name: string, text: string, isEnemy = false): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Dialogue box
    const dialogueBox = this.add.graphics();
    dialogueBox.fillStyle(0x1a0a2e, 0.95);
    dialogueBox.fillRoundedRect(20, height - 180, width - 40, 160, 16);
    dialogueBox.lineStyle(3, 0xa855f7, 0.8);
    dialogueBox.strokeRoundedRect(20, height - 180, width - 40, 160, 16);
    
    // Name tag
    const nameTag = this.add.text(40, height - 170, name, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: isEnemy ? '#ef4444' : '#6B21A8',
      padding: { x: 12, y: 4 },
    });
    
    // Dialogue text
    const dialogueText = this.add.text(40, height - 130, text, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#e0e0e0',
      wordWrap: { width: width - 80 },
    });
    
    // Continue indicator
    const continueIndicator = this.add.text(width - 50, height - 30, '▶', {
      fontSize: '20px',
      color: '#a855f7',
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: continueIndicator,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    
    // Click to close
    const closeDialogue = () => {
      dialogueBox.destroy();
      nameTag.destroy();
      dialogueText.destroy();
      continueIndicator.destroy();
      this.input.off('pointerdown', closeDialogue);
      
      // If enemy, start battle
      if (isEnemy && name === 'Wild Slime') {
        this.startBattle();
      }
    };
    
    this.time.delayedCall(500, () => {
      this.input.on('pointerdown', closeDialogue);
    });
  }

  private showStoryIntro(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Story text
    const storyText = this.add.text(width / 2, height / 2, '', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    
    const story = [
      '~ Welcome to Buddyaria ~',
      '',
      'The Shadow King has scattered the Golden Buddies!',
      'Your quest: Collect buddies, grow strong,',
      'and restore peace to the land.',
      '',
      'Press E near NPCs to interact',
      'Press I for your buddy collection',
    ];
    
    // Type out effect
    let lineIndex = 0;
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (lineIndex < story.length) {
          const currentText = storyText.text.split('\n').slice(0, lineIndex + 1).join('\n');
          storyText.setText(currentText + '\n' + story[lineIndex]);
          lineIndex++;
        }
      },
    });
    
    // Fade out after 6 seconds
    this.time.delayedCall(6000, () => {
      this.tweens.add({
        targets: storyText,
        alpha: 0,
        duration: 1000,
        onComplete: () => storyText.destroy(),
      });
    });
  }

  private interactWithBuilding(type: string): void {
    audioManager.playClick?.();
    
    switch (type) {
      case 'shop':
        this.showDialogue('Sam', 'Welcome! I have lots of items for sale!');
        break;
      case 'guild':
        this.scene.pause();
        this.scene.launch('QuestScene');
        break;
      case 'farm':
        this.showDialogue('Farmer Tom', 'Working hard on the buddy farm!');
        break;
      case 'cave':
        this.showDialogue('Crystal Guardian', 'Only those with rare buddies may enter!');
        break;
      case 'tower':
        this.scene.pause();
        this.scene.launch('QuestScene');
        break;
    }
  }

  private startBattle(): void {
    audioManager.playClick?.();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('BattleScene');
    });
  }

  private updateUI(): void {
    this.coinText?.setText(Math.floor(this.gameState.player.coins).toLocaleString());
    this.healthText?.setText(`${Math.floor(this.gameState.player.health)}/${this.gameState.player.maxHealth}`);
    this.levelText?.setText(`Lv.${this.gameState.player.level}`);
  }
}