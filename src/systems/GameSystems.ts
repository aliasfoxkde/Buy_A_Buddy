/**
 * Buy a Buddy - Game Systems Integration
 * Connects Phaser scenes to game modules
 */

import { EventBus } from '../core';
import { CombatSystem, CombatEntity, CombatBuff } from '../modules/combat';
import { InventorySystem, ItemDatabase } from '../modules/inventory';
import { QuestSystem } from '../modules/quests';
import { DialogueSystem } from '../modules/dialogue';
import { SkillSystem } from '../modules/skills';
import { CraftingSystem } from '../modules/crafting';
import { AchievementSystem } from '../modules/achievements';
import { WorldSystem } from '../modules/world';
import { StorageSystem } from '../modules/storage';
import { BuffSystem, BuffableEntityImpl } from '../modules/buffs';
import { EventSystem } from '../modules/events';
import { NPCSystem } from '../modules/npc';
import { AISystem, DEFAULT_AI_CONFIGS } from '../modules/ai';
import { TutorialSystem } from '../modules/tutorial';

/**
 * Central Game Manager
 * Integrates all game systems and provides single access point
 */
export class GameSystems {
  // Core
  eventBus: EventBus;
  
  // Game Systems
  combat: CombatSystem;
  inventory: InventorySystem;
  quests: QuestSystem;
  dialogue: DialogueSystem;
  skills: SkillSystem;
  crafting: CraftingSystem;
  achievements: AchievementSystem;
  world: WorldSystem;
  storage: StorageSystem;
  buffs: BuffSystem;
  events: EventSystem;
  npcs: NPCSystem;
  ai: AISystem;
  tutorial: TutorialSystem;
  
  // Player entities
  player: CombatEntity | null = null;
  playerEntity: BuffableEntityImpl | null = null;
  
  // State
  isInitialized: boolean = false;
  isPaused: boolean = false;
  
  constructor() {
    // Initialize event bus first
    this.eventBus = new EventBus();
    
    // Initialize all systems
    this.storage = new StorageSystem(this.eventBus);
    this.buffs = new BuffSystem(this.eventBus);
    this.events = new EventSystem(this.eventBus);
    
    const itemDatabase = new ItemDatabase();
    this.inventory = new InventorySystem(this.eventBus, itemDatabase);
    
    this.quests = new QuestSystem(this.eventBus);
    this.dialogue = new DialogueSystem(this.eventBus);
    this.skills = new SkillSystem(this.eventBus);
    this.crafting = new CraftingSystem(this.eventBus);
    this.achievements = new AchievementSystem(this.eventBus);
    this.world = new WorldSystem(this.eventBus);
    this.npcs = new NPCSystem(this.eventBus);
    this.ai = new AISystem(this.eventBus);
    this.tutorial = new TutorialSystem(this.eventBus);
    
    this.combat = new CombatSystem(this.eventBus);
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  /**
   * Initialize game systems
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    // Load settings from storage
    const settings = this.storage.loadSettings();
    if (settings) {
      // Apply settings
    }
    
    this.isInitialized = true;
    this.eventBus.emit('game:initialized', {});
  }
  
  /**
   * Create player entity
   */
  createPlayer(config: {
    name: string;
    characterIndex: number;
    buddyIndex: number;
    position: { x: number; y: number };
  }): CombatEntity {
    this.player = new CombatEntity({
      id: 'player',
      name: config.name,
      position: config.position,
      spritesheet: 'characters',
      spriteIndex: config.characterIndex,
      team: 'player',
      stats: {
        maxHealth: 100,
        currentHealth: 100,
        maxMana: 50,
        currentMana: 50,
        attack: 10,
        defense: 5,
        speed: 10,
        luck: 5,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100
      }
    }, this.eventBus);
    
    this.playerEntity = new BuffableEntityImpl('player', this.eventBus);
    
    return this.player;
  }
  
  /**
   * Update all systems
   */
  update(deltaTime: number): void {
    if (this.isPaused) return;
    
    // Update game systems
    this.skills.update(deltaTime);
    this.crafting.update(deltaTime);
    this.world.update(deltaTime);
    this.ai.update(deltaTime);
    this.events.processQueue();
    
    // Update combat
    this.player?.update(deltaTime);
    this.playerEntity?.update(deltaTime);
  }
  
  /**
   * Pause game
   */
  pause(): void {
    this.isPaused = true;
    this.eventBus.emit('game:pause', {});
  }
  
  /**
   * Resume game
   */
  resume(): void {
    this.isPaused = false;
    this.eventBus.emit('game:resume', {});
  }
  
  /**
   * Setup event listeners for system interactions
   */
  private setupEventListeners(): void {
    // Quest completion gives rewards
    this.eventBus.on('quest:complete', (event: any) => {
      const { rewards } = event.payload;
      if (rewards) {
        if (rewards.gold) this.inventory.addGold(rewards.gold);
        if (rewards.experience && this.player) {
          this.player.gainExperience(rewards.experience);
        }
        if (rewards.items) {
          for (const item of rewards.items) {
            this.inventory.addItem(item.itemId, item.quantity);
          }
        }
      }
    });
    
    // Inventory changes trigger achievements
    this.eventBus.on('inventory:change', () => {
      // Check collection achievements
    });
    
    // Enemy death gives experience
    this.eventBus.on('entity:death', (event: any) => {
      const { entity } = event.payload;
      if (entity.team === 'enemy' && this.player) {
        const expReward = Math.floor(10 + entity.stats.level * 5);
        this.player.gainExperience(expReward);
        
        const goldReward = Math.floor(5 + entity.stats.level * 2);
        this.inventory.addGold(goldReward);
      }
    });
    
    // Level up triggers events
    this.eventBus.on('entity:levelUp', (event: any) => {
      const { entity } = event.payload;
      if (entity.id === 'player') {
        this.skills.learnSkill('player', 'skill_power_strike');
      }
    });
    
    // World item collection
    this.eventBus.on('world:item_collected', (event: any) => {
      const { itemId } = event.payload;
      this.inventory.addItem(itemId, 1);
    });
    
    // Dialogue NPC interaction
    this.eventBus.on('dialogue:start', (event: any) => {
      const { npcId } = event.payload;
      // Could start quest or give item
    });
    
    // Combat victory
    this.eventBus.on('battle:end', (event: any) => {
      const { victory } = event.payload;
      if (victory) {
        this.eventBus.emit('achievement:unlock', { id: 'ach_first_blood' });
      }
    });
  }
  
  /**
   * Start new game
   */
  startNewGame(playerName: string = 'Hero'): void {
    // Create player
    this.createPlayer({
      name: playerName,
      characterIndex: 0,
      buddyIndex: 0,
      position: { x: 400, y: 300 }
    });
    
    // Give starting items
    this.inventory.addItem('weapon_wooden_sword', 1);
    this.inventory.addItem('potion_health_small', 3);
    
    // Learn starting skills
    this.skills.learnSkill('player', 'skill_power_strike');
    this.skills.learnSkill('player', 'skill_heal');
    
    // Start first quest
    this.quests.startQuest('quest_tutorial_1');
    
    // Initialize world
    this.world.moveToZone('village_start');
    
    this.eventBus.emit('game:new_game', { playerName });
  }
  
  /**
   * Save game
   */
  async saveGame(slotId?: string): Promise<boolean> {
    return await this.storage.save(slotId);
  }
  
  /**
   * Load game
   */
  async loadGame(slotId: string): Promise<boolean> {
    const state = await this.storage.load(slotId);
    if (state) {
      // Restore state to all systems
      this.eventBus.emit('game:load', { state });
      return true;
    }
    return false;
  }
  
  /**
   * Get player stats for UI
   */
  getPlayerStats(): any {
    if (!this.player) return null;
    
    return {
      name: this.player.name,
      level: this.player.stats.level,
      experience: this.player.stats.experience,
      experienceToNextLevel: this.player.stats.experienceToNextLevel,
      health: this.player.stats.currentHealth,
      maxHealth: this.player.stats.maxHealth,
      mana: this.player.stats.currentMana,
      maxMana: this.player.stats.maxMana,
      attack: this.player.stats.attack,
      defense: this.player.stats.defense,
      speed: this.player.stats.speed,
      luck: this.player.stats.luck,
      gold: this.inventory.getGold()
    };
  }
  
  /**
   * Get current zone info
   */
  getCurrentZone(): any {
    return this.world.getCurrentZone();
  }
  
  /**
   * Get nearby NPCs
   */
  getNearbyNPCs(): any[] {
    if (!this.player) return [];
    const pos = this.player.position;
    return this.world.getNPCs().filter(npc => {
      const dx = npc.position.x - pos.x;
      const dy = npc.position.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) < 100;
    });
  }
  
  /**
   * Interact with NPC
   */
  interactWithNPC(npcId: string): boolean {
    const npc = this.world.getNPC(npcId);
    if (!npc) return false;
    
    const pos = this.player?.position;
    if (!pos) return false;
    
    const dx = npc.position.x - pos.x;
    const dy = npc.position.y - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) > 50) return false;
    
    // Start dialogue if available
    if (npc.dialogueId) {
      this.dialogue.startDialogue(npcId);
      return true;
    }
    
    // Open shop if available
    if (npc.shopId) {
      this.eventBus.emit('shop:open', { npcId, shopId: npc.shopId });
      return true;
    }
    
    return false;
  }
}

// ==========================================
// SPRITE MANAGER FOR PHASER
// ==========================================

export interface SpriteFrame {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SpriteConfig {
  // Character sprites (6x2 grid, 256x512)
  static CHARACTERS = {
    key: 'characters',
    path: '/images/sprites/characters.png',
    cols: 6,
    rows: 2,
    cellWidth: 256,
    cellHeight: 512
  };
  
  // Buddy sprites (6x2 grid, 256x512)
  static BUDDIES = {
    key: 'buddies',
    path: '/images/sprites/buddies.png',
    cols: 6,
    rows: 2,
    cellWidth: 256,
    cellHeight: 512
  };
  
  // Enemy sprites (6x4 grid, 256x256)
  static ENEMIES = {
    key: 'enemies',
    path: '/images/sprites/enemies.png',
    cols: 6,
    rows: 4,
    cellWidth: 256,
    cellHeight: 256
  };
  
  // Boss sprites (6x4 grid, 256x256)
  static BOSSES = {
    key: 'bosses',
    path: '/images/sprites/bosses.png',
    cols: 6,
    rows: 4,
    cellWidth: 256,
    cellHeight: 256
  };
  
  // Item sprites (6x4 grid, 256x256)
  static ITEMS = {
    key: 'items',
    path: '/images/sprites/items.png',
    cols: 6,
    rows: 4,
    cellWidth: 256,
    cellHeight: 256
  };
  
  // Weapon sprites (6x4 grid, 256x256)
  static WEAPONS = {
    key: 'weapons',
    path: '/images/sprites/weapons.png',
    cols: 6,
    rows: 4,
    cellWidth: 256,
    cellHeight: 256
  };
  
  // Get frame position for sprite
  static getFrame(key: string, row: number, col: number): SpriteFrame {
    let config: any;
    
    switch (key) {
      case 'characters':
      case 'buddies':
        config = this.CHARACTERS;
        break;
      case 'enemies':
      case 'bosses':
      case 'items':
      case 'weapons':
        config = this.ENEMIES;
        break;
      default:
        config = this.CHARACTERS;
    }
    
    return {
      key,
      x: (col - 1) * config.cellWidth,
      y: (row - 1) * config.cellHeight,
      width: config.cellWidth,
      height: config.cellHeight
    };
  }
  
  // Get all sprite paths for loading
  static getAllPaths(): { key: string; path: string }[] {
    return [
      { key: 'characters', path: this.CHARACTERS.path },
      { key: 'buddies', path: this.BUDDIES.path },
      { key: 'enemies', path: this.ENEMIES.path },
      { key: 'bosses', path: this.BOSSES.path },
      { key: 'items', path: this.ITEMS.path },
      { key: 'weapons', path: '/images/sprites/weapons.png' },
      { key: 'armor', path: '/images/sprites/armor.png' },
      { key: 'skills', path: '/images/sprites/skills.png' },
      { key: 'effects', path: '/images/sprites/effects.png' },
      { key: 'npc', path: '/images/sprites/npc.png' },
      { key: 'nature', path: '/images/sprites/nature.png' },
      { key: 'environment', path: '/images/sprites/environment.png' },
      { key: 'ui_menu', path: '/images/sprites/ui/menu.png' },
      { key: 'ui_inventory', path: '/images/sprites/ui/inventory.png' },
    ];
  }
}

// Export singleton instance
export const gameSystems = new GameSystems();
