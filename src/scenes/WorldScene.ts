/**
 * World Scene - Main Gameplay
 */

import Phaser from 'phaser';
import { gameSystems, SpriteConfig } from '../systems/GameSystems';
import { DialogueUI } from '../ui/DialogueUI';
import { audioManager } from '../audio/AudioManager';
import { getCharacterFrame, getBuddyFrame, getNPCFrame, getTileFrame } from '../utils/spriteUtils';
import { VisualEffects } from '../utils/VisualEffects';
import { MobileControls } from '../ui/MobileControls';
import { QUESTS, type Quest } from '../data/quests';
import { TutorialSystem } from '../systems/TutorialSystem';
import { TutorialOverlay, getDefaultTutorialSteps } from '../ui/TutorialOverlay';
import { ScreenTransition } from '../ui/ScreenTransitions';
import { achievementSystem } from '../systems/AchievementSystem';
import { Minimap } from '../ui/Minimap';
import { getDialogue } from '../data/dialogue';

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private buddies: Phaser.GameObjects.Sprite[] = [];
  private buddySkillCooldown: number = 0;
  private buddyIndicator!: Phaser.GameObjects.Text;
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
  private buddyNameText!: Phaser.GameObjects.Text;
  
  // Effects & Mobile
  private vfx!: VisualEffects;
  private mobileControls!: MobileControls;
  private tutorial!: TutorialSystem;
  private transition!: ScreenTransition;
  private minimap!: Minimap;
  
  // Combat trigger
  private encounterCooldown: boolean = false;
  private encounterZones: Phaser.GameObjects.Zone[] = [];
  private visitedZones: Set<string> = new Set();
  private safeZoneIndicator!: Phaser.GameObjects.Container;
  private villageX: number = 80;
  private villageY: number = 400;
  
  // Quest tracking
  private currentQuests: Quest[] = [];
  private enemiesKilled: Map<string, number> = new Map();
  
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
    
    // Initialize visual effects
    this.vfx = new VisualEffects(this);
    this.transition = new ScreenTransition(this);
    
    // Initialize tutorial overlay for new players
    this.initTutorial();
    
    // Initialize mobile controls (if touch device)
    this.mobileControls = new MobileControls(this);
    
    // Initialize tutorial system
    this.tutorial = new TutorialSystem(this);
    
    // Initialize minimap (top-right corner)
    this.minimap = new Minimap(this, 20 * 128, 15 * 128);
    this.minimap.create(width - 100, 80);
    
    // Create debug info
    this.createDebugInfo();
    
    // Start exploration music
    this.startExplorationMusic();
    
    // Initialize quests
    this.initQuests();
    
    // Listen for battle end events
    this.setupBattleEndListener();
    
    // Show tutorial hints for new players
    this.showTutorialHints();
  }

  wake(sleepData?: any): void {
    // Called when scene resumes after being paused (e.g., after battle)
    console.log('WorldScene waking up');
    
    // Resume exploration music
    this.startExplorationMusic();
    
    // Reset encounter cooldown
    this.encounterCooldown = false;
  }

  private setupBattleEndListener(): void {
    // Listen for battle end events
    gameSystems.eventBus.on('battle:end', (event: { type: string; payload: any; timestamp: number }) => {
      const { victory, enemyId, goldEarned } = event.payload || {};
      console.log('Battle ended:', event.payload);
      
      if (victory && enemyId) {
        // Track enemy kill for quest progress
        this.trackEnemyKill(enemyId);
        
        // Update kill tracking for stats
        gameSystems.trackKill(enemyId);
        
        // Show victory notification
        if (goldEarned) {
          this.showNotification(`Victory! +${goldEarned} Gold`);
        }
      }
    });
    
    // Listen for player heal events (from dialogue)
    gameSystems.eventBus.on('player:heal', (event: { type: string; payload: any }) => {
      const amount = event.payload?.amount || 50;
      if (gameSystems.player) {
        gameSystems.player.heal(amount);
        this.showNotification(`Healed for ${amount} HP!`);
      }
    });
    
    // Listen for shop open events (from dialogue)
    gameSystems.eventBus.on('npc:open_shop', (event: { type: string; payload: any }) => {
      const shopId = event.payload?.shopId || 'general_store';
      this.scene.pause();
      this.scene.launch('ShopScene', { shopType: shopId });
    });
    
    // Listen for player buff events (from dialogue)
    gameSystems.eventBus.on('player:buff', (event: { type: string; payload: any }) => {
      const buffType = event.payload?.buffType || 'strength';
      const duration = event.payload?.duration || 30;
      this.showNotification(`Buffed with ${buffType} for ${duration}s!`);
      // Buffs would be applied through the buff system
    });
  }

  private initTutorial(): void {
    // Only show tutorial for new players
    if (TutorialOverlay.wasCompleted()) return;
    
    const tutorial = new TutorialOverlay(this);
    const steps = getDefaultTutorialSteps(this);
    
    tutorial.start(steps, () => {
      console.log('Tutorial completed!');
    });
  }
  
  private showTutorialHints(): void {
    // Only show for new players
    if (this.tutorial.isStepCompleted('movement')) return;
    
    // Delayed hint after 3 seconds
    this.time.delayedCall(3000, () => {
      this.tutorial.showHint('movement', () => {
        this.tutorial.completeStep('movement');
      });
    });
  }
  
  private trackEnemyKill(enemyId: string): void {
    // Track kills in local map
    const current = this.enemiesKilled.get(enemyId) || 0;
    this.enemiesKilled.set(enemyId, current + 1);
    this.enemiesKilled.set('any', (this.enemiesKilled.get('any') || 0) + 1);
    
    // Update QuestSystem with progress for all kill quests
    gameSystems.quests.updateObjective('quest_tutorial_1', 'kill', enemyId, current + 1);
    gameSystems.quests.updateObjective('quest_tutorial_2', 'kill', enemyId, current + 1);
    gameSystems.quests.updateObjective('quest_goblin_trouble', 'kill', enemyId, current + 1);
    gameSystems.quests.updateObjective('quest_wolf_pack', 'kill', enemyId, current + 1);
    gameSystems.quests.updateObjective('quest_skeleton_king', 'kill', enemyId, current + 1);
    
    // Update HUD quest display
    this.updateQuestHUD();
  }
  
  private updateQuestHUD(): void {
    const activeQuests = gameSystems.quests.getActiveQuests();
    if (activeQuests.length > 0) {
      const quest = activeQuests[0];
      const obj = quest.objectives[0];
      if (this.questText && obj) {
        this.questText.setText(`${quest.questId}\n${obj.current}/${obj.required} ${obj.target}`);
      }
    } else if (this.questText) {
      this.questText.setText('Quests Complete!');
    }
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
    
    // Update buddy auto-heal skill
    this.updateBuddySkill(delta / 1000);
    
    // Update minimap
    if (this.minimap && this.player) {
      this.minimap.updatePosition(this.player.x, this.player.y);
    }
    
    // Update UI
    this.updateUI();
    
    // Check interactions
    this.checkInteractions();
    
    // Update quest UI
    this.updateQuestDisplay();
  }
  
  private initQuests(): void {
    // Start tutorial quest using QuestSystem
    gameSystems.quests.startQuest('quest_tutorial_1');
    
    // Show quest notification
    this.showNotification(`New Quest: ${QUESTS['quest_tutorial_1']?.name || 'Tutorial'}`);
  }
  
  private completeQuest(quest: Quest): void {
    // Play quest complete sound
    audioManager.playQuestComplete();
    
    // Show completion
    this.showNotification(`Quest Complete: ${quest.name}!`);
    
    // Track for progress stats
    gameSystems.trackQuestComplete(quest.id);
    
    // Track for achievements
    achievementSystem.onQuestComplete();
    
    // Apply rewards
    if (quest.reward.gold) {
      gameSystems.inventory.addGold(quest.reward.gold);
    }
    
    if (quest.reward.experience) {
      // XP handled in battle scene
    }
    
    if (quest.reward.items) {
      for (const item of quest.reward.items) {
        gameSystems.inventory.addItem(item, 1);
      }
    }
    
    // Remove from active quests
    this.currentQuests = this.currentQuests.filter(q => q.id !== quest.id);
    
    // Visual effect
    if (this.vfx) {
      this.vfx.showLevelUpBurst(this.player.x, this.player.y - 50);
    }
  }
  
  private showNotification(text: string): void {
    // Create notification popup
    const notification = this.add.text(
      this.cameras.main.scrollX + this.scale.width / 2,
      120,
      text,
      {
        fontSize: '24px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fbbf24',
        stroke: '#000',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setDepth(1000);
    
    this.tweens.add({
      targets: notification,
      alpha: 0,
      y: 80,
      duration: 3000,
      delay: 1000,
      onComplete: () => notification.destroy()
    });
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
      
      // Add collision body for tree
      const treeBody = this.add.rectangle(pos.x, pos.y + 20, 60, 80);
      treeBody.setFillStyle(0x000000, 0);
      this.physics.add.existing(treeBody, true);
      this.physics.add.collider(this.player, treeBody);
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
      
      // Add collision body for rock
      const rockBody = this.add.rectangle(pos.x, pos.y, 50, 50);
      rockBody.setFillStyle(0x000000, 0);
      this.physics.add.existing(rockBody, true);
      this.physics.add.collider(this.player, rockBody);
    }
    
    // Add world boundary walls
    this.addWorldBounds();
  }
  
  private addWorldBounds(): void {
    const worldWidth = 20 * 128;  // 2560
    const worldHeight = 15 * 128; // 1920
    
    // Left wall
    const leftWall = this.add.rectangle(-30, worldHeight / 2, 60, worldHeight);
    this.physics.add.existing(leftWall, true);
    this.physics.add.collider(this.player, leftWall);
    
    // Right wall
    const rightWall = this.add.rectangle(worldWidth + 30, worldHeight / 2, 60, worldHeight);
    this.physics.add.existing(rightWall, true);
    this.physics.add.collider(this.player, rightWall);
    
    // Top wall
    const topWall = this.add.rectangle(worldWidth / 2, -30, worldWidth, 60);
    this.physics.add.existing(topWall, true);
    this.physics.add.collider(this.player, topWall);
    
    // Bottom wall
    const bottomWall = this.add.rectangle(worldWidth / 2, worldHeight + 30, worldWidth, 60);
    this.physics.add.existing(bottomWall, true);
    this.physics.add.collider(this.player, bottomWall);
  }
  
  private createNPCs(): void {
    const npcData = gameSystems.world.getNPCs();
    
    for (const npc of npcData) {
      const sprite = this.add.sprite(npc.position.x, npc.position.y, 'npc');
      sprite.setFrame(getNPCFrame(npc.spriteIndex));
      sprite.setScale(1);
      
      // Add shadow
      this.add.ellipse(npc.position.x, npc.position.y + 50, 60, 20, 0x000000, 0.2);
      
      // NPC highlight circle (visible indicator that NPC is interactive)
      const highlight = this.add.circle(npc.position.x, npc.position.y, 45, 0x3b82f6, 0.15);
      highlight.setStrokeStyle(3, 0x3b82f6, 0.5);
      this.tweens.add({
        targets: highlight,
        alpha: 0.5,
        scale: 1.1,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
      
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
    // Add visible collectible items with emoji display
    const items = [
      { x: 250, y: 300, type: 'coin', emoji: '🪙' },
      { x: 450, y: 450, type: 'potion', emoji: '🧪' },
      { x: 700, y: 250, type: 'coin', emoji: '🪙' },
      { x: 950, y: 550, type: 'gem', emoji: '💎' },
      { x: 1100, y: 350, type: 'coin', emoji: '🪙' }
    ];
    
    for (const pos of items) {
      // Emoji visual instead of sprite
      const itemText = this.add.text(pos.x, pos.y, pos.emoji, {
        fontSize: '32px'
      }).setOrigin(0.5);
      
      // Glow effect
      itemText.setShadow(0, 0, '#fbbf24', 8, true, true);
      
      // Floating animation
      this.tweens.add({
        targets: itemText,
        y: pos.y - 15,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Pickup zone
      const zone = this.add.zone(pos.x, pos.y, 50, 50);
      (zone as any).itemType = pos.type;
      (zone as any).emoji = pos.emoji;
      (zone as any).collectText = itemText;
      this.physics.add.existing(zone);
    }
    
    // Add enemy encounter zones
    this.createEncounterZones();
  }
  
  private createEncounterZones(): void {
    // Create encounter zones throughout the world with varied enemy types
    const encounterTypes = [
      { x: 600, y: 400, enemy: 'goblin', icon: '👺' },
      { x: 1000, y: 200, enemy: 'wolf', icon: '🐺' },
      { x: 1400, y: 500, enemy: 'skeleton', icon: '💀' },
      { x: 1600, y: 300, enemy: 'slime', icon: '🟢' },
      { x: 1900, y: 450, enemy: 'orc', icon: '👹' }
    ];
    
    for (const pos of encounterTypes) {
      // Pulsing danger circle with enemy icon
      const indicator = this.add.circle(pos.x, pos.y, 45, 0xff0000, 0.2);
      indicator.setStrokeStyle(3, 0xff4444);
      
      // Inner icon
      const icon = this.add.text(pos.x, pos.y, pos.icon, {
        fontSize: '28px'
      }).setOrigin(0.5);
      
      // Pulse animation
      this.tweens.add({
        targets: indicator,
        alpha: 0.5,
        scale: 1.4,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      
      // Icon bob animation
      this.tweens.add({
        targets: icon,
        y: pos.y - 8,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      // Enemy type label with background
      const labelBg = this.add.rectangle(pos.x, pos.y - 65, 100, 25, 0x1a1a2e, 0.9);
      labelBg.setStrokeStyle(1, 0xef4444);
      const label = this.add.text(pos.x, pos.y - 65, `${pos.icon} ${pos.enemy.toUpperCase()}`, {
        fontSize: '11px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#ef4444'
      }).setOrigin(0.5);
      
      // Add zone
      const zone = this.add.zone(pos.x, pos.y, 80, 80);
      (zone as any).isEncounter = true;
      (zone as any).enemyType = pos.enemy;
      this.physics.add.existing(zone);
      this.encounterZones.push(zone);
    }
    
    // Zone transition points
    this.createZoneTransitions();
  }
  
  private createZoneTransitions(): void {
    const worldWidth = 20 * 128;
    
    // Village entrance marker (left side)
    const villageX = this.villageX;
    const villageY = this.villageY;
    const villagePortal = this.add.circle(villageX, villageY, 40, 0x22c55e, 0.2);
    villagePortal.setStrokeStyle(3, 0x22c55e);
    this.tweens.add({
      targets: villagePortal,
      alpha: 0.6,
      scale: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
    this.add.text(villageX, villageY - 60, '🏠 VILLAGE', {
      fontSize: '14px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
    
    // Boss portal at the right edge of the map
    const bossX = worldWidth - 100;
    const bossY = 400;
    
    // Visual indicator - red portal (boss themed)
    const portal = this.add.circle(bossX, bossY, 60, 0xef4444, 0.2);
    portal.setStrokeStyle(4, 0xef4444);
    this.tweens.add({
      targets: portal,
      alpha: 0.6,
      scale: 1.4,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // "BOSS" text
    this.add.text(bossX, bossY - 90, '⚔️ BOSS ZONE ⚔️', {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ef4444',
      backgroundColor: '#1a1a2e',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    
    // Boss encounter zone
    const bossZone = this.add.zone(bossX, bossY, 100, 100);
    (bossZone as any).isBossEncounter = true;
    (bossZone as any).bossId = 'slime_boss';
    this.physics.add.existing(bossZone);
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
    this.player.setScale(1.0);
    
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
    // Use buddies spritesheet for companion
    const buddySpriteIndex = 0;
    
    // Create buddy with sprite from spritesheet
    for (let i = 0; i < 1; i++) {
      const buddy = this.add.sprite(
        this.player.x - 50 - (i * 30),
        this.player.y + 20,
        'buddies'
      );
      buddy.setFrame(getBuddyFrame(buddySpriteIndex + i));
      buddy.setScale(0.7);
      
      // Add shadow
      this.add.ellipse(
        this.player.x - 50 - (i * 30),
        this.player.y + 35,
        40, 15, 0x000000, 0.3
      );
      
      // Bounce animation
      this.tweens.add({
        targets: buddy,
        y: buddy.y + 5,
        duration: 500 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      this.buddies.push(buddy);
      
      // Buddy skill indicator (small icon above buddy)
      const skillIcon = this.add.text(buddy.x, buddy.y - 30, '💚', {
        fontSize: '14px'
      }).setOrigin(0.5);
      
      // Store reference for animation
      (buddy as any).skillIcon = skillIcon;
    }
    
    // Show buddy name in HUD
    this.buddyNameText = this.add.text(0, 0, 'Buddy', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
  }
  
  private updateBuddySkill(delta: number): void {
    if (this.buddySkillCooldown > 0) {
      this.buddySkillCooldown -= delta;
      return;
    }
    
    // Buddy auto-heals nearby player when low HP
    const stats = gameSystems.getPlayerStats();
    if (stats && stats.health < stats.maxHealth * 0.5) {
      const healAmount = Math.floor(stats.maxHealth * 0.1);
      gameSystems.player?.heal(healAmount);
      this.showBuddyHealNotification(healAmount);
      this.buddySkillCooldown = 10; // 10 second cooldown
    }
  }
  
  private showBuddyHealNotification(amount: number): void {
    if (this.buddies.length === 0) return;
    
    const buddy = this.buddies[0];
    const notification = this.add.container(buddy.x, buddy.y - 50);
    notification.setDepth(100);
    
    const text = this.add.text(0, 0, `💚 Buddy healed +${amount} HP`, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#22c55e',
      backgroundColor: '#1a1a2e',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);
    notification.add(text);
    
    this.tweens.add({
      targets: notification,
      y: notification.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => notification.destroy()
    });
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
    this.goldText = this.add.text(240, 52, '💰 200', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0, 0.5);
    
    // Quest display (top right)
    this.createQuestDisplay();
    
    // Controls help (bottom-left)
    this.createControlsHelp();
    
    // Add to container
    hudContainer.add([healthBg, this.healthBar, healthText, manaBg, this.manaBar, manaText, expBg, this.expBar, this.levelText, this.goldText]);
    
    // Bottom buttons
    this.createBottomButtons();
  }
  
  private questText!: Phaser.GameObjects.Text;
  private questProgressText!: Phaser.GameObjects.Text;
  private isMobile: boolean = false;
  
  private createQuestDisplay(): void {
    const { width } = this.scale;
    
    // Quest panel background
    const questBg = this.add.rectangle(width - 180, 40, 220, 90, 0x000000, 0.6);
    questBg.setStrokeStyle(2, 0x22c55e);
    
    // Quest header
    this.add.text(width - 180, 10, '📜 OBJECTIVE', {
      fontSize: '12px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
    
    // Quest objective text
    this.questText = this.add.text(width - 180, 40, 'No Active Quests', {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa',
      align: 'center',
      wordWrap: { width: 200 }
    }).setOrigin(0.5);
    
    // Progress indicator
    this.questProgressText = this.add.text(width - 180, 70, '', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
    
    // Update with active quest
    this.updateQuestDisplay();
  }
  
  private createControlsHelp(): void {
    const { height } = this.scale;
    
    // Controls panel (bottom-left)
    const controlsBg = this.add.rectangle(100, height - 30, 180, 40, 0x000000, 0.6);
    controlsBg.setStrokeStyle(1, 0x555555);
    
    // Controls text
    const controlsText = this.add.text(20, height - 30, 
      'WASD/Arrows: Move | E: Interact | M: Map | I: Inventory',
      {
        fontSize: '9px',
        fontFamily: 'Arial, sans-serif',
        color: '#888888'
      }
    ).setOrigin(0, 0.5);
    
    // Mobile hint
    if (this.isMobile) {
      controlsText.setText('Joystick: Move | Tap: Interact | Bottom: Skills');
    }
  }
  
  private updateQuestDisplay(): void {
    const activeQuests = gameSystems.quests.getActiveQuests();
    
    if (activeQuests.length > 0) {
      const quest = activeQuests[0];
      const questDef = gameSystems.quests.getQuest(quest.questId);
      if (questDef) {
        this.questText.setText(questDef.name);
        // Show progress
        const progress = quest.objectives[0]?.current || 0;
        const required = quest.objectives[0]?.required || 1;
        this.questProgressText.setText(`${progress}/${required}`);
      }
    } else {
      this.questText.setText('No Active Quests');
      this.questProgressText.setText('Talk to NPCs for quests');
    }
  }
  
  private createBottomButtons(): void {
    const { width, height } = this.scale;
    const buttonY = height - 60;
    
    // Skill bar
    const skillBar = this.add.container(0, 0);
    
    // Skill icons and names for the hotbar
    const skillIcons = ['⚔️', '🛡️', '💚', '🔥', '⚡', '💥'];
    const skillNames = ['Attack', 'Defend', 'Heal', 'Fire', 'Lightning', 'Explosion'];
    const skillDescs = [
      'Basic melee attack',
      'Raise defense temporarily',
      'Restore health',
      'Fire damage attack',
      'Lightning damage',
      'Area explosion damage'
    ];
    
    for (let i = 0; i < 6; i++) {
      const icon = skillIcons[i] || '❓';
      const name = skillNames[i];
      const desc = skillDescs[i];
      
      const btn = this.add.rectangle(
        width / 2 - 150 + i * 60,
        buttonY,
        50,
        50,
        0x2d1b4e
      );
      btn.setStrokeStyle(2, 0xa855f7);
      btn.setInteractive({ useHandCursor: true });
      
      // Skill icon
      const skillIcon = this.add.text(
        width / 2 - 150 + i * 60,
        buttonY - 5,
        icon,
        { fontSize: '24px' }
      ).setOrigin(0.5);
      
      // Key hint
      const key = this.add.text(
        width / 2 - 150 + i * 60,
        buttonY + 18,
        (i + 1).toString(),
        {
          fontSize: '14px',
          fontFamily: 'Arial Black, sans-serif',
          color: '#888'
        }
      ).setOrigin(0.5);
      
      // Skill name for tooltip
      const skillName = this.add.text(
        width / 2 - 150 + i * 60,
        buttonY - 70,
        name,
        {
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          color: '#fff',
          backgroundColor: '#1a1a2e'
        }
      ).setOrigin(0.5);
      skillName.setVisible(false);
      skillName.setDepth(1000);
      
      // Hover effect with tooltip
      btn.on('pointerover', () => {
        btn.setFillStyle(0x3d2b5e);
        skillName.setVisible(true);
      });
      btn.on('pointerout', () => {
        btn.setFillStyle(0x2d1b4e);
        skillName.setVisible(false);
      });
      btn.on('pointerdown', () => {
        this.triggerWorldSkill(i);
      });
      
      skillBar.add([btn, skillIcon, key, skillName]);
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
  
  private triggerWorldSkill(slot: number): void {
    const skillNames = ['Attack', 'Defend', 'Heal', 'Fire', 'Lightning', 'Explosion'];
    this.showNotification(`${skillNames[slot] || 'Skill'} → Enter battle to use!`);
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
    
    // ESC to open menu
    this.input.keyboard?.on('keydown-M', () => this.minimap.toggle());
    
    this.input.keyboard?.on('keydown-ESC', () => this.openMenu());
    
    // Menu button click
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Bottom-left corner click opens menu
      if (pointer.x < 80 && pointer.y > this.scale.height - 80) {
        this.openMenu();
      }
    });
  }
  
  private openMenu(): void {
    this.scene.pause();
    this.scene.launch('MenuScene');
  }
  
  private openInventory(): void {
    // Complete inventory tutorial step
    this.tutorial.completeStep('inventory');
    
    this.scene.pause();
    this.scene.launch('InventoryScene');
  }
  
  private openQuests(): void {
    // Complete quest tutorial step
    this.tutorial.completeStep('quests');
    
    this.scene.pause();
    this.scene.launch('QuestScene');
  }
  
  private openShop(): void {
    // Complete shop tutorial step
    this.tutorial.completeStep('shop');
    
    this.scene.pause();
    this.scene.launch('ShopScene');
  }
  
  private openSettings(): void {
    this.scene.pause();
    this.scene.launch('SettingsScene');
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
    
    // Add collision for encounter zones
    for (const zone of this.encounterZones) {
      this.physics.add.overlap(this.player, zone, () => {
        this.triggerEncounter();
      });
    }
    
    // Add collision for item pickups
    for (const itemZone of this.worldItems) {
      this.physics.add.overlap(this.player, itemZone, () => {
        this.collectItem(itemZone);
      });
    }
    
    // Add collision for zone transitions
    const transitionZones = this.physics.add.group();
    this.children.list.forEach(child => {
      if ((child as any).isTransition) {
        transitionZones.add(child);
      }
    });
    
    this.physics.add.overlap(this.player, transitionZones, (player, zone) => {
      this.triggerZoneTransition((zone as any).targetZone);
    });
    
    // Add collision for boss encounter zones
    const bossZones = this.physics.add.group();
    this.children.list.forEach(child => {
      if ((child as any).isBossEncounter) {
        bossZones.add(child);
      }
    });
    
    this.physics.add.overlap(this.player, bossZones, (player, zone) => {
      this.triggerBossEncounter((zone as any).bossId);
    });
    
    // Village safe zone - heal player
    const villageZone = this.add.zone(this.villageX, this.villageY, 80, 80);
    (villageZone as any).isSafeZone = true;
    this.physics.add.existing(villageZone);
    this.physics.add.overlap(this.player, villageZone, () => {
      this.handleSafeZone();
    });
    
    // Add achievements button to HUD (press A)
    this.createAchievementButton();
  }
  
  private createAchievementButton(): void {
    const { width } = this.scale;
    
    // Achievement hint button (top-left, small)
    const btnBg = this.add.rectangle(50, 40, 30, 30, 0xfbbf24, 0.8);
    btnBg.setStrokeStyle(2, 0xfbbf24);
    
    const btnIcon = this.add.text(50, 40, '🏆', {
      fontSize: '18px'
    }).setOrigin(0.5);
    
    const btn = this.add.container(0, 0, [btnBg, btnIcon]);
    btn.setSize(30, 30);
    btn.setInteractive({ useHandCursor: true });
    
    btn.on('pointerdown', () => {
      this.scene.pause();
      this.scene.launch('AchievementScene');
    });
    
    btn.on('pointerover', () => {
      btnBg.setFillStyle(0xffd700);
    });
    
    btn.on('pointerout', () => {
      btnBg.setFillStyle(0xfbbf24);
    });
  }
  
  private triggerZoneTransition(targetZone: string): void {
    if (this.encounterCooldown) return;
    this.encounterCooldown = true;
    
    // Track zone for explorer achievement
    if (!this.visitedZones.has(targetZone)) {
      this.visitedZones.add(targetZone);
      achievementSystem.onZoneEnter(targetZone);
    }
    
    // Show transition message
    this.showNotification(`Entering ${targetZone}...`);
    
    // Screen fade to black
    this.cameras.main.fade(800, 0, 0, 0);
    
    this.time.delayedCall(1000, () => {
      // For now, just show a notification - zone system would load new map
      this.showNotification(`Welcome to ${targetZone}!`);
      
      // Reset cooldown
      this.time.delayedCall(3000, () => {
        this.encounterCooldown = false;
      });
    });
  }
  
  private triggerBossEncounter(bossId: string): void {
    if (this.encounterCooldown) return;
    
    this.encounterCooldown = true;
    
    // Complete combat tutorial when entering boss fight
    this.tutorial.completeStep('combat');
    
    // Show warning
    this.showNotification(`BOSS BATTLE: ${bossId.toUpperCase()}!`);
    
    // Pause movement
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    
    // Screen effect - red flash
    this.cameras.main.flash(500, 255, 0, 0, true);
    
    this.time.delayedCall(800, () => {
      this.scene.pause();
      this.scene.launch('BattleScene', { 
        enemyId: bossId, 
        isBoss: true,
        sourceScene: 'WorldScene'
      });
    });
  }
  
  private handleSafeZone(): void {
    const stats = gameSystems.getPlayerStats();
    if (!stats) return;
    
    // Check if player needs healing
    if (stats.health < stats.maxHealth) {
      const healAmount = Math.min(stats.maxHealth - stats.health, 20);
      if (healAmount > 0) {
        gameSystems.player?.heal(healAmount);
        
        // Show heal indicator
        this.showHealIndicator(healAmount);
      }
    }
    
    // Show "Safe Zone" indicator
    if (!this.safeZoneIndicator) {
      this.safeZoneIndicator = this.add.container(this.player.x, this.player.y - 80);
      const bg = this.add.rectangle(0, 0, 120, 30, 0x22c55e, 0.9);
      bg.setStrokeStyle(2, 0x22c55e);
      const text = this.add.text(0, 0, '🛡️ SAFE ZONE 🛡️', {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff'
      }).setOrigin(0.5);
      this.safeZoneIndicator.add([bg, text]);
    } else {
      this.safeZoneIndicator.setPosition(this.player.x, this.player.y - 80);
      this.safeZoneIndicator.setVisible(true);
    }
  }
  
  private showHealIndicator(amount: number): void {
    const notification = this.add.container(this.player.x, this.player.y - 50);
    notification.setDepth(100);
    
    const text = this.add.text(0, 0, `💚 +${amount} HP`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
    
    notification.add(text);
    
    this.tweens.add({
      targets: notification,
      y: notification.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => notification.destroy()
    });
  }
  
  private collectItem(zone: Phaser.GameObjects.Zone): void {
    const itemType = (zone as any).itemType;
    const emoji = (zone as any).emoji;
    const collectText = (zone as any).collectText;
    
    if (!itemType) return;
    
    // Add item to inventory
    const itemId = this.getItemIdForType(itemType);
    if (itemId) {
      gameSystems.inventory.addItem(itemId, 1);
      audioManager.playPickup();
      
      // Show pickup notification
      this.showItemPickupNotification(emoji, itemType);
      
      // Remove item from world
      collectText?.destroy();
      zone.destroy();
      
      // Remove from worldItems array
      const idx = this.worldItems.indexOf(zone);
      if (idx > -1) {
        this.worldItems.splice(idx, 1);
      }
    }
  }
  
  private getItemIdForType(type: string): string | null {
    const mapping: Record<string, string> = {
      gold: 'gold_coin',
      potion: 'health_potion',
      gem: 'rare_gem',
      herb: 'healing_herb',
      key: 'dungeon_key'
    };
    return mapping[type] || null;
  }
  
  private showItemPickupNotification(emoji: string, type: string): void {
    const notification = this.add.container(this.player.x, this.player.y - 60);
    notification.setDepth(100);
    
    const bg = this.add.rectangle(0, 0, 100, 30, 0x000000, 0.8);
    bg.setStrokeStyle(1, 0x22c55e);
    
    const text = this.add.text(0, 0, `${emoji} ${type.toUpperCase()}`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
    
    notification.add([bg, text]);
    
    // Float up and fade
    this.tweens.add({
      targets: notification,
      y: notification.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => notification.destroy()
    });
  }
  
  private triggerEncounter(): void {
    if (this.encounterCooldown) return;
    
    this.encounterCooldown = true;
    
    // Pause movement
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    
    // Screen fade
    this.cameras.main.fade(500, 0, 0, 0);
    
    this.time.delayedCall(500, () => {
      // Start battle scene
      this.scene.pause();
      this.scene.launch('BattleScene', { sourceScene: 'WorldScene' });
      
      // Reset cooldown after returning from battle
      this.time.delayedCall(3000, () => {
        this.encounterCooldown = false;
      });
    });
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
    
    // Mobile controls (virtual joystick)
    if (this.mobileControls && this.mobileControls.isTouchDevice()) {
      const joystick = this.mobileControls.getOutput();
      if (joystick.isActive) {
        this.playerVelocity.x = joystick.x * this.speed;
        this.playerVelocity.y = joystick.y * this.speed;
        if (joystick.x < -0.2) this.player.setFlipX(true);
        if (joystick.x > 0.2) this.player.setFlipX(false);
      }
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
    
    // Quest progress update
    this.updateQuestDisplay();
  }
  
  private showInteractionHint(npcId: string): void {
    // Show E prompt near NPC
    const npc = this.npcs.get(npcId);
    if (npc) {
      // Could add visual indicator
    }
  }
  
  private checkInteractions(): void {
    // Check for nearby NPCs and show interaction prompt
    let nearestNPC: string | null = null;
    let nearestDist = 100;
    
    for (const [npcId, npc] of this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );
      
      if (dist < 100 && dist < nearestDist) {
        nearestDist = dist;
        nearestNPC = npcId;
      }
    }
    
    // Update interaction prompt
    if (nearestNPC) {
      const npc = this.npcs.get(nearestNPC);
      if (npc && !this.interactionPrompt) {
        this.interactionPrompt = this.add.text(npc.x, npc.y - 60, 'Press E to talk', {
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          color: '#fbbf24',
          backgroundColor: '#1a1a2e',
          padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
        
        // Pulse animation
        this.tweens.add({
          targets: this.interactionPrompt,
          alpha: 0.6,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }
      
      if (this.interactionPrompt && npc) {
        this.interactionPrompt.setPosition(npc.x, npc.y - 60);
        this.interactionPrompt.setVisible(true);
      }
    } else if (this.interactionPrompt) {
      this.interactionPrompt.setVisible(false);
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
      // Complete NPC tutorial step
      this.tutorial.completeStep('npc');
      
      // Start dialogue with NPC
      this.dialogueUI.startDialogue(nearestNpc);
    }
  }
  
  private useSkill(slotIndex: number): void {
    // Use skill from slot
    console.log(`Using skill in slot ${slotIndex}`);
  }
  
  private createDebugInfo(): void {
    // FPS counter (built into Phaser)
    // Could add coordinates display
  }
  
  shutdown(): void {
    // Clean up event listeners
    this.input.keyboard?.off('keydown');
    
    // Destroy UI elements if they exist
    if (this.mobileControls) this.mobileControls.destroy();
    if (this.minimap) this.minimap.destroy();
    if (this.dialogueUI) this.dialogueUI.destroy();
    if (this.healthBar) this.healthBar.destroy();
    if (this.manaBar) this.manaBar.destroy();
    if (this.expBar) this.expBar.destroy();
    if (this.goldText) this.goldText.destroy();
    if (this.levelText) this.levelText.destroy();
    if (this.interactionPrompt) this.interactionPrompt.destroy();
    if (this.buddyNameText) this.buddyNameText.destroy();
    
    // Clear Map collections
    this.npcs.clear();
    this.worldItems.forEach(item => item.destroy());
    this.worldItems = [];
    this.encounterZones.forEach(zone => zone.destroy());
    this.encounterZones = [];
    this.enemiesKilled.clear();
    
    console.log('WorldScene shutdown complete');
  }
}
