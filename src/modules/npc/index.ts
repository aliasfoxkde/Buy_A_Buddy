/**
 * NPC System Module
 * NPC behaviors, schedules, shops, and quest giver logic
 */

import { EventBus, Vector2, generateId } from '../../core';

export type NPCBehavior = 'idle' | 'patrol' | 'follow' | 'wander' | 'shopkeeper' | 'quest_giver' | 'guard';
export type NPCScheduleActivity = 'sleep' | 'wake' | 'work' | 'eat' | 'socialize' | 'worship' | 'patrol' | 'idle';

export interface NPCSchedule {
  hour: number;
  activity: NPCScheduleActivity;
  location?: string;
}

export interface NPCShop {
  shopId: string;
  name: string;
  buyMultiplier: number;  // What NPC pays for items (0.5 = half value)
  sellMultiplier: number; // What player pays (1.5 = 150% value)
  categories: ('weapon' | 'armor' | 'consumable' | 'material' | 'accessory')[];
  inventory: { itemId: string; quantity: number; restockTime?: number }[];
  reputationRequired?: number;
}

export interface NPCQuest {
  questId: string;
  prerequisiteQuests?: string[];
  requiredLevel?: number;
  requiredItems?: { itemId: string; quantity: number }[];
  giveQuest?: () => boolean;
}

export interface NPCConfig {
  id: string;
  name: string;
  title?: string;
  portrait: string;
  sprite: string;
  spriteIndex: number;
  position: Vector2;
  behavior: NPCBehavior;
  
  // Dialogue
  defaultDialogue?: string;
  dialogues?: string[];
  
  // Schedule
  schedules?: NPCSchedule[];
  homePosition?: Vector2;
  
  // Shop
  shop?: NPCShop;
  
  // Quests
  quests?: NPCQuest[];
  
  // Combat (for hostile NPCs)
  isHostile?: boolean;
  stats?: {
    health?: number;
    attack?: number;
    defense?: number;
    level?: number;
  };
  
  // Flags
  flags?: Record<string, boolean | number | string>;
}

export class NPCScheduleManager {
  private schedules: Map<string, NPCSchedule[]> = new Map();

  registerSchedule(npcId: string, schedules: NPCSchedule[]): void {
    this.schedules.set(npcId, schedules.sort((a, b) => a.hour - b.hour));
  }

  getCurrentActivity(npcId: string): NPCSchedule | null {
    const schedules = this.schedules.get(npcId);
    if (!schedules || schedules.length === 0) return null;

    const currentHour = new Date().getHours();
    
    // Find the most recent schedule that matches
    let current: NPCSchedule | null = null;
    for (const schedule of schedules) {
      if (schedule.hour <= currentHour) {
        current = schedule;
      } else {
        break;
      }
    }

    return current || schedules[schedules.length - 1];
  }

  getActivityAtHour(npcId: string, hour: number): NPCSchedule | null {
    const schedules = this.schedules.get(npcId);
    if (!schedules) return null;

    for (const schedule of schedules) {
      if (schedule.hour === hour) {
        return schedule;
      }
    }

    return null;
  }
}

export class NPCShopManager {
  private shops: Map<string, NPCShop> = new Map();
  private shopInventories: Map<string, Map<string, number>> = new Map(); // shopId -> (itemId -> quantity)

  constructor() {
    this.initializeDefaultShops();
  }

  registerShop(shop: NPCShop): void {
    this.shops.set(shop.shopId, shop);
    
    // Initialize inventory
    const inventory = new Map<string, number>();
    for (const item of shop.inventory) {
      inventory.set(item.itemId, item.quantity);
    }
    this.shopInventories.set(shop.shopId, inventory);
  }

  getShop(shopId: string): NPCShop | undefined {
    return this.shops.get(shopId);
  }

  getInventory(shopId: string): Map<string, number> {
    return this.shopInventories.get(shopId) || new Map();
  }

  buyItem(shopId: string, itemId: string, quantity: number): boolean {
    const inventory = this.shopInventories.get(shopId);
    if (!inventory) return false;

    const available = inventory.get(itemId) || 0;
    if (available < quantity) return false;

    inventory.set(itemId, available - quantity);
    return true;
  }

  sellItem(shopId: string, itemId: string, quantity: number): void {
    const inventory = this.shopInventories.get(shopId);
    if (!inventory) return;

    const current = inventory.get(itemId) || 0;
    inventory.set(itemId, current + quantity);
  }

  restockShop(shopId: string): void {
    const shop = this.shops.get(shopId);
    if (!shop) return;

    const inventory = this.shopInventories.get(shopId);
    if (!inventory) return;

    for (const item of shop.inventory) {
      if (item.restockTime) {
        // Would need timer tracking per item
        const current = inventory.get(item.itemId) || 0;
        inventory.set(item.itemId, Math.max(current, item.quantity));
      }
    }
  }

  calculateSellPrice(shopId: string, basePrice: number): number {
    const shop = this.shops.get(shopId);
    if (!shop) return basePrice;
    return Math.floor(basePrice * shop.sellMultiplier);
  }

  calculateBuyPrice(shopId: string, basePrice: number): number {
    const shop = this.shops.get(shopId);
    if (!shop) return Math.floor(basePrice * 0.5);
    return Math.floor(basePrice * shop.buyMultiplier);
  }

  private initializeDefaultShops(): void {
    this.registerShop({
      shopId: 'general_store',
      name: 'General Store',
      buyMultiplier: 0.5,
      sellMultiplier: 1.2,
      categories: ['weapon', 'armor', 'consumable', 'accessory'],
      inventory: [
        { itemId: 'weapon_wooden_sword', quantity: 5 },
        { itemId: 'armor_leather', quantity: 3 },
        { itemId: 'potion_health_small', quantity: 20 },
        { itemId: 'potion_mana', quantity: 15 },
        { itemId: 'key_dungeon', quantity: 2, restockTime: 300 }
      ]
    });

    this.registerShop({
      shopId: 'weapon_shop',
      name: 'Weapons & Armory',
      buyMultiplier: 0.4,
      sellMultiplier: 1.5,
      categories: ['weapon', 'armor'],
      inventory: [
        { itemId: 'weapon_iron_sword', quantity: 3 },
        { itemId: 'weapon_steel_sword', quantity: 1 },
        { itemId: 'armor_iron', quantity: 2 },
        { itemId: 'armor_mithril', quantity: 1 }
      ],
      reputationRequired: 10
    });

    this.registerShop({
      shopId: 'potion_shop',
      name: "Potion Maker's Hut",
      buyMultiplier: 0.6,
      sellMultiplier: 1.3,
      categories: ['consumable', 'material'],
      inventory: [
        { itemId: 'potion_health_small', quantity: 30 },
        { itemId: 'potion_health_large', quantity: 10 },
        { itemId: 'potion_mana', quantity: 25 },
        { itemId: 'elixir_power', quantity: 5 }
      ]
    });
  }
}

export class NPCQuestManager {
  private npcQuests: Map<string, NPCQuest[]> = new Map();
  private completedQuests: Set<string> = new Set();

  registerQuest(npcId: string, quest: NPCQuest): void {
    if (!this.npcQuests.has(npcId)) {
      this.npcQuests.set(npcId, []);
    }
    this.npcQuests.get(npcId)!.push(quest);
  }

  getQuestsForNPC(npcId: string): NPCQuest[] {
    return this.npcQuests.get(npcId) || [];
  }

  getAvailableQuests(npcId: string, playerLevel: number, completedQuests: string[]): NPCQuest[] {
    const quests = this.getQuestsForNPC(npcId);
    
    return quests.filter(quest => {
      // Already completed and not repeatable
      if (this.completedQuests.has(quest.questId)) return false;
      
      // Level requirement
      if (quest.requiredLevel && playerLevel < quest.requiredLevel) return false;
      
      // Prerequisites
      if (quest.prerequisiteQuests) {
        const prereqsMet = quest.prerequisiteQuests.every(p => completedQuests.includes(p));
        if (!prereqsMet) return false;
      }
      
      return true;
    });
  }

  markQuestComplete(questId: string): void {
    this.completedQuests.add(questId);
  }

  isQuestComplete(questId: string): boolean {
    return this.completedQuests.has(questId);
  }

  reset(): void {
    this.completedQuests.clear();
  }
}

export class NPCSystem {
  private eventBus: EventBus;
  private npcs: Map<string, NPCConfig> = new Map();
  private scheduleManager: NPCScheduleManager;
  private shopManager: NPCShopManager;
  private questManager: NPCQuestManager;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.scheduleManager = new NPCScheduleManager();
    this.shopManager = new NPCShopManager();
    this.questManager = new NPCQuestManager();
    
    this.initializeDefaultNPCs();
  }

  registerNPC(npc: NPCConfig): void {
    this.npcs.set(npc.id, npc);
    
    // Register schedules
    if (npc.schedules) {
      this.scheduleManager.registerSchedule(npc.id, npc.schedules);
    }
    
    // Register shop
    if (npc.shop) {
      this.shopManager.registerShop(npc.shop);
    }
    
    // Register quests
    if (npc.quests) {
      for (const quest of npc.quests) {
        this.questManager.registerQuest(npc.id, quest);
      }
    }
  }

  getNPC(id: string): NPCConfig | undefined {
    return this.npcs.get(id);
  }

  getAllNPCs(): NPCConfig[] {
    return Array.from(this.npcs.values());
  }

  getNPCsInArea(position: Vector2, radius: number): NPCConfig[] {
    return this.getAllNPCs().filter(npc => {
      const dx = npc.position.x - position.x;
      const dy = npc.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
  }

  getShopManager(): NPCShopManager {
    return this.shopManager;
  }

  getQuestManager(): NPCQuestManager {
    return this.questManager;
  }

  getCurrentActivity(npcId: string): NPCSchedule | null {
    return this.scheduleManager.getCurrentActivity(npcId);
  }

  interact(npcId: string, playerId: string): void {
    const npc = this.npcs.get(npcId);
    if (!npc) return;

    // Emit interaction event
    this.eventBus.emit('npc:interact', { npcId, playerId, npc });

    // If has dialogue, start it
    if (npc.defaultDialogue) {
      this.eventBus.emit('dialogue:start', { npcId, dialogueId: npc.defaultDialogue });
    }

    // If has shop, open it
    if (npc.shop) {
      this.eventBus.emit('shop:open', { npcId, shopId: npc.shop.shopId });
    }
  }

  private initializeDefaultNPCs(): void {
    // Mentor - Quest giver
    this.registerNPC({
      id: 'mentor',
      name: 'Elder Sage',
      title: 'Village Elder',
      portrait: 'mentor',
      sprite: 'npc',
      spriteIndex: 0,
      position: { x: 400, y: 300 },
      behavior: 'quest_giver',
      defaultDialogue: 'mentor',
      quests: [
        { questId: 'quest_tutorial_1' },
        { questId: 'quest_tutorial_2', prerequisiteQuests: ['quest_tutorial_1'] }
      ],
      schedules: [
        { hour: 6, activity: 'wake' },
        { hour: 7, activity: 'idle', location: 'village_center' },
        { hour: 12, activity: 'eat' },
        { hour: 13, activity: 'work' },
        { hour: 18, activity: 'idle' },
        { hour: 20, activity: 'sleep' }
      ],
      homePosition: { x: 380, y: 280 }
    });

    // Shopkeeper
    this.registerNPC({
      id: 'shopkeeper',
      name: 'Marcus',
      title: 'General Store Owner',
      portrait: 'merchant',
      sprite: 'npc',
      spriteIndex: 4,
      position: { x: 600, y: 200 },
      behavior: 'shopkeeper',
      defaultDialogue: 'shopkeeper',
      shop: this.shopManager.getShop('general_store')!,
      schedules: [
        { hour: 7, activity: 'wake' },
        { hour: 8, activity: 'work' },
        { hour: 12, activity: 'eat' },
        { hour: 13, activity: 'work' },
        { hour: 18, activity: 'idle' },
        { hour: 20, activity: 'sleep' }
      ],
      homePosition: { x: 580, y: 180 }
    });

    // Blacksmith
    this.registerNPC({
      id: 'blacksmith',
      name: 'Thorgrim',
      title: 'Master Blacksmith',
      portrait: 'blacksmith',
      sprite: 'npc',
      spriteIndex: 6,
      position: { x: 200, y: 400 },
      behavior: 'shopkeeper',
      shop: this.shopManager.getShop('weapon_shop')!,
      schedules: [
        { hour: 6, activity: 'wake' },
        { hour: 7, activity: 'work' },
        { hour: 12, activity: 'eat' },
        { hour: 13, activity: 'work' },
        { hour: 19, activity: 'idle' },
        { hour: 21, activity: 'sleep' }
      ],
      homePosition: { x: 180, y: 380 }
    });

    // Guard
    this.registerNPC({
      id: 'guard_village',
      name: 'Guard',
      title: 'Village Guard',
      portrait: 'guard',
      sprite: 'npc',
      spriteIndex: 2,
      position: { x: 500, y: 500 },
      behavior: 'guard',
      schedules: [
        { hour: 0, activity: 'patrol' },
        { hour: 6, activity: 'patrol' },
        { hour: 12, activity: 'idle' },
        { hour: 18, activity: 'patrol' }
      ]
    });

    // Innkeeper
    this.registerNPC({
      id: 'innkeeper',
      name: 'Elara',
      title: 'Inn Keeper',
      portrait: 'innkeeper',
      sprite: 'npc',
      spriteIndex: 3,
      position: { x: 100, y: 350 },
      behavior: 'shopkeeper',
      defaultDialogue: 'innkeeper',
      schedules: [
        { hour: 0, activity: 'sleep' },
        { hour: 7, activity: 'wake' },
        { hour: 8, activity: 'work' },
        { hour: 22, activity: 'sleep' }
      ],
      homePosition: { x: 80, y: 330 }
    });
  }
}
