/**
 * World Scene - Main Gameplay
 */

import Phaser from 'phaser';
import { gameSystems, SpriteConfig } from '../systems/GameSystems';
import { DialogueUI } from '../ui/DialogueUI';
import { audioManager } from '../audio/AudioManager';
import { getCharacterFrame, getBuddyFrame, getNPCFrame, getTileFrame } from '../utils/spriteUtils';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private buddies: Phaser.GameObjects.Sprite[] = [];
  private npcs: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private worldItems: Phaser.GameObjects.Zone[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  
  private speed: number = 150;
  private playerVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  
  // UI elements
  private healthBar!: Phaser.GameObjects.Rectangle;
  private manaBar!: Phaser.GameObjects.Rectangle;
  private expBar!: Phaser.GameObjects.Rectangle;
  private goldText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  
  // Camera
  private cameraSpeed: number = 1;
  
  // Audio
  private musicStarted: boolean = false;
  
  // Dialogue
  private dialogueUI!: DialogueUI;
  
  // Interaction
  private nearestNPC: string | null = null;
  private interactionPrompt!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'WorldScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background color
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Create world
    this.createWorld();
    
    // Create player
    this.createPlayer();
    
    // Create UI
    this.createUI();
    
    // Initialize Dialogue UI
    this.dialogueUI = new DialogueUI(this);
    
    // Setup input
    this.setupInput();
    
    // Setup collisions
    this.setupCollisions();
    
    // Setup camera
    this.setupCamera();
    
    // Create debug info
    this.createDebugInfo();
    
    // Start exploration music
    this.startExplorationMusic();
  }
  
  private startExplorationMusic(): void {
    if (!this.musicStarted) {
      audioManager.playExplorationMusic();
      this.musicStarted = true;
    }
  }
  
  update(time: number, delta: number): void {
    // Update game systems
    gameSystems.update(delta / 1000);
    
    // Update player movement
    this.updatePlayerMovement();
    
    // Update buddy following
    this.updateBuddies();
    
    // Update UI
    this.updateUI();
    
    // Check interactions
    this.checkInteractions();
  }
  
  private createWorld(): void {
    // Create ground tiles
    const tileSize = 128;
    const worldWidth = 20 * tileSize;
    const worldHeight = 15 * tileSize;
    
    // Generate random terrain
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 20; x++) {
        const tile = this.add.sprite(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          'tiles_ground'
        );
        
        // Use valid tile frame (0-23 for 6x4 grid)
        const frame = Phaser.Math.Between(0, 23);
        tile.setFrame(frame);
        tile.setTint(Phaser.Math.RND.pick([0xffffff, 0xf0f0f0, 0xe0e0e0]));
      }
    }
    
    // Add some decorations
    this.addDecorations();
    
    // Add NPCs
    this.createNPCs();
    
    // Add collectible items
    this.createWorldItems();
  }
  
  private addDecorations(): void {
    // Trees
    const treePositions = [
      { x: 150, y: 150 }, { x: 300, y: 200 }, { x: 800, y: 300 },
      { x: 1200, y: 150 }, { x: 1500, y: 400 }, { x: 2000, y: 200 },
      { x: 400, y: 600 }, { x: 1000, y: 700 }, { x: 1800, y: 600 }
    ];
    
    for (const pos of treePositions) {
      const tree = this.add.sprite(pos.x, pos.y, 'nature');
      tree.setFrame(0); // First tree sprite
      tree.setScale(1.5);
      
      // Add shadow
      this.add.ellipse(pos.x, pos.y + 40, 80, 30, 0x000000, 0.2);
    }
    
    // Rocks
    const rockPositions = [
      { x: 500, y: 400 }, { x: 900, y: 500 }, { x: 1400, y: 300 },
      { x: 600, y: 800 }, { x: 1100, y: 900 }
    ];
    
    for (const pos of rockPositions) {
      const rock = this.add.sprite(pos.x, pos.y, 'environment');
      rock.setFrame(18); // Stone
      rock.setScale(0.8);
    }
  }
  
  private createNPCs(): void {
    const npcData = gameSystems.world.getNPCs();
    
    for (const npc of npcData) {
      const sprite = this.add.sprite(npc.position.x, npc.position.y, 'npc');
      sprite.setFrame(getNPCFrame(npc.spriteIndex));
      sprite.setScale(1);
      
      // Add name above
      const nameText = this.add.text(npc.position.x, npc.position.y - 70, npc.name, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(0.5);
      
      // Interaction indicator
      const indicator = this.add.text(npc.position.x, npc.position.y - 50, 'E', {
        fontSize: '12px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#ffff00'
      }).setOrigin(0.5).setVisible(false);
      
      // Animate idle
      this.tweens.add({
        targets: sprite,
        y: sprite.y + 3,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Store reference
      this.npcs.set(npc.id, sprite);
      
      // Add interaction zone
      const zone = this.add.zone(npc.position.x, npc.position.y, 60, 60);
      (zone as any).npcId = npc.id;
      this.physics.add.existing(zone);
    }
  }
  
  private createWorldItems(): void {
    const items = [
      { x: 250, y: 300 },
      { x: 450, y: 450 },
      { x: 700, y: 250 },
      { x: 950, y: 550 },
      { x: 1100, y: 350 }
    ];
    
    for (const pos of items) {
      const item = this.add.sprite(pos.x, pos.y, 'items');
      item.setFrame(0); // Coin
      item.setScale(0.5);
      
      // Floating animation
      this.tweens.add({
        targets: item,
        y: item.y - 10,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Sparkle effect
      this.tweens.add({
        targets: item,
        alpha: 0.7,
        duration: 400,
        yoyo: true,
        repeat: -1
      });
      
      // Pickup zone
      const zone = this.add.zone(pos.x, pos.y, 40, 40);
      this.physics.add.existing(zone);
    }
  }
  
  private createPlayer(): void {
    const playerData = gameSystems.player;
    
    if (!playerData) {
      // Create default player if none exists
      gameSystems.createPlayer({
        name: 'Hero',
        characterIndex: 0,
        buddyIndex: 0,
        position: { x: 400, y: 400 }
      });
    }
    
    const pos = gameSystems.player!.position;
    const spriteIndex = gameSystems.player!.spriteIndex;
    
    // Create player sprite with correct frame
    this.player = this.add.sprite(pos.x, pos.y, 'characters');
    this.player.setFrame(getCharacterFrame(spriteIndex));
    this.player.setScale(0.8);
    
    // Add shadow
    this.add.ellipse(pos.x, pos.y + 60, 60, 20, 0x000000, 0.3);
    
    // Create buddy following player
    this.createBuddies();
    
    // Physics
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(80, 100);
    (this.player.body as Phaser.Physics.Arcade.Body).setOffset(-40, -50);
  }
  
  private createBuddies(): void {
    const buddyCount = 1; // Start with 1 buddy
    const buddySpriteIndex = 0; // Default to first buddy sprite
    
    for (let i = 0; i < buddyCount; i++) {
      const buddy = this.add.sprite(
        this.player.x - 50 - (i * 30),
        this.player.y + 20,
        'buddies'
      );
      buddy.setFrame(getBuddyFrame(buddySpriteIndex + i));
      buddy.setScale(0.6);
      
      // Animation
      this.tweens.add({
        targets: buddy,
        y: buddy.y + 5,
        duration: 600 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.buddies.push(buddy);
    }
  }
  
  private createUI(): void {
    const { width, height } = this.scale;
    
    // HUD container
    const hudContainer = this.add.container(0, 0);
    
    // Health bar background
    const healthBg = this.add.rectangle(20, 20, 204, 24, 0x000000, 0.5);
    healthBg.setStrokeStyle(2, 0xa855f7);
    
    // Health bar
    this.healthBar = this.add.rectangle(22, 22, 200, 20, 0x22c55e);
    
    // Health text
    const healthText = this.add.text(22, 22, 'HP: 100/100', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0, 0.5);
    
    // Mana bar background
    const manaBg = this.add.rectangle(20, 50, 204, 20, 0x000000, 0.5);
    manaBg.setStrokeStyle(2, 0x3b82f6);
    
    // Mana bar
    this.manaBar = this.add.rectangle(22, 52, 200, 16, 0x3b82f6);
    
    // Mana text
    const manaText = this.add.text(22, 52, 'MP: 50/50', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0, 0.5);
    
    // Exp bar background
    const expBg = this.add.rectangle(20, 76, 204, 12, 0x000000, 0.5);
    expBg.setStrokeStyle(1, 0xf59e0b);
    
    // Exp bar
    this.expBar = this.add.rectangle(22, 78, 200, 8, 0xf59e0b);
    
    // Level indicator
    this.levelText = this.add.text(240, 28, 'LVL 1', {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0, 0.5);
    
    // Gold display
    this.goldText = this.add.text(240, 52, '💰 100', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0, 0.5);
    
    // Add to container
    hudContainer.add([healthBg, this.healthBar, healthText, manaBg, this.manaBar, manaText, expBg, this.expBar, this.levelText, this.goldText]);
    
    // Bottom buttons
    this.createBottomButtons();
  }
  
  private createBottomButtons(): void {
    const { width, height } = this.scale;
    const buttonY = height - 60;
    
    // Skill bar
    const skillBar = this.add.container(0, 0);
    
    for (let i = 0; i < 6; i++) {
      const btn = this.add.rectangle(
        width / 2 - 150 + i * 60,
        buttonY,
        50,
        50,
        0x2d1b4e
      );
      btn.setStrokeStyle(2, 0xa855f7);
      btn.setInteractive({ useHandCursor: true });
      
      // Key hint
      const key = this.add.text(
        width / 2 - 150 + i * 60,
        buttonY + 18,
        (i + 1).toString(),
        {
          fontSize: '16px',
          fontFamily: 'Arial Black, sans-serif',
          color: '#888'
        }
      ).setOrigin(0.5);
      
      // Hover effect
      btn.on('pointerover', () => {
        btn.setFillStyle(0x3d2b5e);
      });
      btn.on('pointerout', () => {
        btn.setFillStyle(0x2d1b4e);
      });
      
      skillBar.add([btn, key]);
    }
    
    // Menu button
    const menuBtn = this.add.rectangle(width - 40, buttonY, 60, 50, 0x2d1b4e);
    menuBtn.setStrokeStyle(2, 0xec4899);
    menuBtn.setInteractive({ useHandCursor: true });
    
    const menuIcon = this.add.text(width - 40, buttonY, '☰', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ec4899'
    }).setOrigin(0.5);
    
    menuBtn.on('pointerdown', () => {
      this.scene.pause();
      this.scene.launch('MenuScene');
    });
    
    skillBar.add([menuBtn, menuIcon]);
  }
  
  private setupInput(): void {
    // Keyboard
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    }) as any;
    
    // Number keys for skills
    for (let i = 1; i <= 6; i++) {
      this.input.keyboard?.on(`keydown-${i}`, () => this.useSkill(i - 1));
    }
    
    // Interaction key
    this.input.keyboard?.on('keydown-E', () => this.interact());
    
    // Inventory key
    this.input.keyboard?.on('keydown-I', () => this.openInventory());
    
    // Quest key
    this.input.keyboard?.on('keydown-Q', () => this.openQuests());
  }
  
  private setupCollisions(): void {
    // Player collision with world bounds
    const worldWidth = 20 * 128;
    const worldHeight = 15 * 128;
    
    // Invisible walls
    const walls = this.physics.add.staticGroup();
    
    // Add collision between player and NPCs
    for (const [id, npc] of this.npcs) {
      this.physics.add.overlap(this.player, npc, () => {
        this.showInteractionHint(id);
      });
    }
  }
  
  private setupCamera(): void {
    const worldWidth = 20 * 128;
    const worldHeight = 15 * 128;
    
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }
  
  private updatePlayerMovement(): void {
    this.playerVelocity.set(0, 0);
    
    // WASD / Arrow keys
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.playerVelocity.x = -this.speed;
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.playerVelocity.x = this.speed;
      this.player.setFlipX(false);
    }
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.playerVelocity.y = -this.speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.playerVelocity.y = this.speed;
    }
    
    // Normalize diagonal movement
    if (this.playerVelocity.x !== 0 && this.playerVelocity.y !== 0) {
      this.playerVelocity.normalize().scale(this.speed);
    }
    
    // Apply velocity
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(
      this.playerVelocity.x,
      this.playerVelocity.y
    );
    
    // Animate based on movement
    if (this.playerVelocity.x !== 0 || this.playerVelocity.y !== 0) {
      // Walking animation could go here
    }
  }
  
  private updateBuddies(): void {
    // Make buddies follow player
    for (let i = 0; i < this.buddies.length; i++) {
      const buddy = this.buddies[i];
      const targetX = this.player.x - 50 - (i * 30);
      const targetY = this.player.y + 20;
      
      // Smooth follow
      buddy.x = Phaser.Math.Linear(buddy.x, targetX, 0.1);
      buddy.y = Phaser.Math.Linear(buddy.y, targetY, 0.1);
    }
  }
  
  private updateUI(): void {
    const stats = gameSystems.getPlayerStats();
    if (!stats) return;
    
    // Health bar
    const healthPercent = stats.health / stats.maxHealth;
    this.healthBar.setScale(healthPercent, 1);
    this.healthBar.setPosition(22, 22);
    
    // Mana bar
    const manaPercent = stats.mana / stats.maxMana;
    this.manaBar.setScale(manaPercent, 1);
    this.manaBar.setPosition(22, 52);
    
    // Exp bar
    const expPercent = stats.experience / stats.experienceToNextLevel;
    this.expBar.setScale(expPercent, 1);
    this.expBar.setPosition(22, 78);
    
    // Text updates
    this.levelText.setText(`LVL ${stats.level}`);
    this.goldText.setText(`💰 ${stats.gold}`);
  }
  
  private showInteractionHint(npcId: string): void {
    // Show E prompt near NPC
    const npc = this.npcs.get(npcId);
    if (npc) {
      // Could add visual indicator
    }
  }
  
  private checkInteractions(): void {
    // Check for nearby NPCs
    for (const [npcId, npc] of this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      
      if (dist < 80) {
        // Show interaction prompt
      }
    }
  }
  
  private interact(): void {
    // Find nearest NPC
    let nearestNpc: string | null = null;
    let nearestDist = 100;
    
    for (const [npcId, npc] of this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestNpc = npcId;
      }
    }
    
    if (nearestNpc) {
      // Start dialogue with NPC
      this.dialogueUI.startDialogue(nearestNpc);
    }
  }
  
  private useSkill(slotIndex: number): void {
    // Use skill from slot
    console.log(`Using skill in slot ${slotIndex}`);
  }
  
  private openInventory(): void {
    this.scene.pause();
    this.scene.launch('InventoryScene');
  }
  
  private openQuests(): void {
    this.scene.pause();
    this.scene.launch('QuestScene');
  }
  
  private createDebugInfo(): void {
    // FPS counter (built into Phaser)
    // Could add coordinates display
  }
}
