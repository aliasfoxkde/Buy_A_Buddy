/**
 * Inventory System Module
 */

import { EventBus, InventoryData, InventorySlot, generateId } from '../../core';

export type ItemType = 
  | 'weapon' 
  | 'armor' 
  | 'consumable' 
  | 'material' 
  | 'quest' 
  | 'key' 
  | 'accessory';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemStats {
  attack?: number;
  defense?: number;
  health?: number;
  mana?: number;
  speed?: number;
  luck?: number;
  criticalChance?: number;
  criticalDamage?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  icon: string;
  stats?: ItemStats;
  sellPrice: number;
  buyPrice: number;
  useEffect?: (userId: string) => void;
  equipEffect?: (entityId: string) => void;
  unequipEffect?: (entityId: string) => void;
}

export interface EquipmentSlot {
  type: 'head' | 'chest' | 'weapon' | 'shield' | 'boots' | 'accessory1' | 'accessory2';
  item: Item | null;
}

export class ItemDatabase {
  private items: Map<string, Item> = new Map();

  constructor() {
    this.initializeDefaultItems();
  }

  register(item: Item): void {
    this.items.set(item.id, item);
  }

  get(id: string): Item | undefined {
    return this.items.get(id);
  }

  getAll(): Item[] {
    return Array.from(this.items.values());
  }

  getByType(type: ItemType): Item[] {
    return this.getAll().filter(i => i.type === type);
  }

  getByRarity(rarity: ItemRarity): Item[] {
    return this.getAll().filter(i => i.rarity === rarity);
  }

  private initializeDefaultItems(): void {
    // Weapons
    this.register({
      id: 'weapon_wooden_sword',
      name: 'Wooden Sword',
      description: 'A basic training sword.',
      type: 'weapon',
      rarity: 'common',
      stackable: false,
      maxStack: 1,
      icon: 'sword_wooden',
      stats: { attack: 5 },
      sellPrice: 10,
      buyPrice: 50
    });

    this.register({
      id: 'weapon_iron_sword',
      name: 'Iron Sword',
      description: 'A sturdy iron blade.',
      type: 'weapon',
      rarity: 'uncommon',
      stackable: false,
      maxStack: 1,
      icon: 'sword_iron',
      stats: { attack: 12 },
      sellPrice: 50,
      buyPrice: 250
    });

    this.register({
      id: 'weapon_steel_sword',
      name: 'Steel Sword',
      description: 'A finely crafted steel sword.',
      type: 'weapon',
      rarity: 'rare',
      stackable: false,
      maxStack: 1,
      icon: 'sword_steel',
      stats: { attack: 20, criticalChance: 5 },
      sellPrice: 150,
      buyPrice: 750
    });

    this.register({
      id: 'weapon_flame_blade',
      name: 'Flame Blade',
      description: 'A sword imbued with fire magic.',
      type: 'weapon',
      rarity: 'epic',
      stackable: false,
      maxStack: 1,
      icon: 'sword_flame',
      stats: { attack: 35, criticalDamage: 25 },
      sellPrice: 500,
      buyPrice: 2500
    });

    this.register({
      id: 'weapon_excalibur',
      name: 'Excalibur',
      description: 'The legendary sword of kings.',
      type: 'weapon',
      rarity: 'legendary',
      stackable: false,
      maxStack: 1,
      icon: 'sword_excalibur',
      stats: { attack: 50, criticalChance: 15, criticalDamage: 50, luck: 10 },
      sellPrice: 0,
      buyPrice: 0
    });

    // Armor
    this.register({
      id: 'armor_leather',
      name: 'Leather Armor',
      description: 'Basic leather protection.',
      type: 'armor',
      rarity: 'common',
      stackable: false,
      maxStack: 1,
      icon: 'armor_leather',
      stats: { defense: 5 },
      sellPrice: 20,
      buyPrice: 100
    });

    this.register({
      id: 'armor_iron',
      name: 'Iron Armor',
      description: 'Heavy iron plate armor.',
      type: 'armor',
      rarity: 'uncommon',
      stackable: false,
      maxStack: 1,
      icon: 'armor_iron',
      stats: { defense: 15, health: 20 },
      sellPrice: 100,
      buyPrice: 500
    });

    this.register({
      id: 'armor_mithril',
      name: 'Mithril Armor',
      description: 'Enchanted mithril plate.',
      type: 'armor',
      rarity: 'epic',
      stackable: false,
      maxStack: 1,
      icon: 'armor_mithril',
      stats: { defense: 35, health: 50, speed: 5 },
      sellPrice: 1000,
      buyPrice: 5000
    });

    // Consumables
    this.register({
      id: 'potion_health_small',
      name: 'Small Health Potion',
      description: 'Restores 25 health.',
      type: 'consumable',
      rarity: 'common',
      stackable: true,
      maxStack: 99,
      icon: 'potion_red',
      sellPrice: 10,
      buyPrice: 25,
      useEffect: (userId) => {
        // Heal effect handled by game
      }
    });

    this.register({
      id: 'potion_health_large',
      name: 'Large Health Potion',
      description: 'Restores 100 health.',
      type: 'consumable',
      rarity: 'uncommon',
      stackable: true,
      maxStack: 50,
      icon: 'potion_red_large',
      sellPrice: 50,
      buyPrice: 125
    });

    this.register({
      id: 'potion_mana',
      name: 'Mana Potion',
      description: 'Restores 30 mana.',
      type: 'consumable',
      rarity: 'common',
      stackable: true,
      maxStack: 99,
      icon: 'potion_blue',
      sellPrice: 15,
      buyPrice: 40
    });

    this.register({
      id: 'elixir_power',
      name: 'Power Elixir',
      description: 'Increases attack by 10 for 60 seconds.',
      type: 'consumable',
      rarity: 'rare',
      stackable: true,
      maxStack: 10,
      icon: 'elixir_orange',
      sellPrice: 100,
      buyPrice: 500
    });

    // Materials
    this.register({
      id: 'material_wood',
      name: 'Wood',
      description: 'Common crafting material.',
      type: 'material',
      rarity: 'common',
      stackable: true,
      maxStack: 999,
      icon: 'wood',
      sellPrice: 1,
      buyPrice: 5
    });

    this.register({
      id: 'material_iron_ore',
      name: 'Iron Ore',
      description: 'Raw iron for smithing.',
      type: 'material',
      rarity: 'common',
      stackable: true,
      maxStack: 999,
      icon: 'ore_iron',
      sellPrice: 5,
      buyPrice: 15
    });

    this.register({
      id: 'material_gold_ore',
      name: 'Gold Ore',
      description: 'Precious gold ore.',
      type: 'material',
      rarity: 'uncommon',
      stackable: true,
      maxStack: 999,
      icon: 'ore_gold',
      sellPrice: 25,
      buyPrice: 75
    });

    this.register({
      id: 'material_crystal',
      name: 'Magic Crystal',
      description: 'A crystal pulsing with magical energy.',
      type: 'material',
      rarity: 'rare',
      stackable: true,
      maxStack: 99,
      icon: 'crystal_blue',
      sellPrice: 50,
      buyPrice: 150
    });

    // Keys & Quest Items
    this.register({
      id: 'key_dungeon',
      name: 'Dungeon Key',
      description: 'Opens the old dungeon door.',
      type: 'key',
      rarity: 'rare',
      stackable: false,
      maxStack: 1,
      icon: 'key_brass',
      sellPrice: 0,
      buyPrice: 0
    });

    this.register({
      id: 'quest_ancient_scroll',
      name: 'Ancient Scroll',
      description: 'A mysterious scroll with cryptic text.',
      type: 'quest',
      rarity: 'epic',
      stackable: false,
      maxStack: 1,
      icon: 'scroll_ancient',
      sellPrice: 0,
      buyPrice: 0
    });

    // Accessories
    this.register({
      id: 'accessory_ring_luck',
      name: 'Ring of Fortune',
      description: 'Increases luck by 10.',
      type: 'accessory',
      rarity: 'uncommon',
      stackable: false,
      maxStack: 1,
      icon: 'ring_gold',
      stats: { luck: 10 },
      sellPrice: 200,
      buyPrice: 1000
    });

    this.register({
      id: 'accessory_amulet_life',
      name: 'Amulet of Vitality',
      description: 'Increases max health by 25.',
      type: 'accessory',
      rarity: 'rare',
      stackable: false,
      maxStack: 1,
      icon: 'amulet_heart',
      stats: { health: 25 },
      sellPrice: 300,
      buyPrice: 1500
    });
  }
}

export class InventorySystem {
  private eventBus: EventBus;
  private database: ItemDatabase;
  private inventory: InventoryData;
  private equipment: EquipmentSlot[] = [
    { type: 'head', item: null },
    { type: 'chest', item: null },
    { type: 'weapon', item: null },
    { type: 'shield', item: null },
    { type: 'boots', item: null },
    { type: 'accessory1', item: null },
    { type: 'accessory2', item: null }
  ];

  constructor(eventBus: EventBus, database: ItemDatabase, initialInventory?: InventoryData) {
    this.eventBus = eventBus;
    this.database = database;
    this.inventory = initialInventory || {
      slots: Array(24).fill(null).map(() => ({ itemId: null, quantity: 0 })),
      gold: 100,
      maxSlots: 24
    };
  }

  addItem(itemId: string, quantity: number = 1): { success: boolean; slot?: number } {
    const item = this.database.get(itemId);
    if (!item) return { success: false };

    // Try to stack with existing
    if (item.stackable) {
      for (let i = 0; i < this.inventory.slots.length; i++) {
        const slot = this.inventory.slots[i];
        if (slot.itemId === itemId && slot.quantity < item.maxStack) {
          const spaceLeft = item.maxStack - slot.quantity;
          const toAdd = Math.min(quantity, spaceLeft);
          slot.quantity += toAdd;
          quantity -= toAdd;
          if (quantity <= 0) {
            this.eventBus.emit('inventory:change', { action: 'add', itemId, quantity: toAdd });
            return { success: true, slot: i };
          }
        }
      }
    }

    // Find empty slot
    while (quantity > 0) {
      const emptySlot = this.inventory.slots.findIndex(s => s.itemId === null);
      if (emptySlot === -1) {
        return { success: false }; // Inventory full
      }

      const toAdd = item.stackable ? Math.min(quantity, item.maxStack) : 1;
      this.inventory.slots[emptySlot] = { itemId, quantity: toAdd };
      quantity -= toAdd;
      
      this.eventBus.emit('inventory:change', { action: 'add', itemId, quantity: toAdd, slot: emptySlot });
      
      if (!item.stackable) break;
    }

    return { success: true };
  }

  removeItem(slotIndex: number, quantity: number = 1): boolean {
    const slot = this.inventory.slots[slotIndex];
    if (!slot.itemId) return false;

    const item = this.database.get(slot.itemId);
    if (!item) return false;

    if (quantity >= slot.quantity) {
      slot.itemId = null;
      slot.quantity = 0;
    } else {
      slot.quantity -= quantity;
    }

    this.eventBus.emit('inventory:change', { action: 'remove', itemId: item.id, quantity });
    return true;
  }

  useItem(slotIndex: number, userId: string): boolean {
    const slot = this.inventory.slots[slotIndex];
    if (!slot.itemId) return false;

    const item = this.database.get(slot.itemId);
    if (!item || !item.useEffect) return false;

    if (item.type !== 'consumable') return false;

    item.useEffect(userId);
    this.eventBus.emit('inventory:itemUsed', { itemId: item.id, userId });

    // Consume one
    this.removeItem(slotIndex, 1);
    return true;
  }

  equipItem(slotIndex: number, playerId: string = 'player'): boolean {
    const slot = this.inventory.slots[slotIndex];
    if (!slot.itemId) return false;

    const item = this.database.get(slot.itemId);
    if (!item) return false;

    if (item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory') {
      return false;
    }

    // Find equipment slot
    const equipSlot = this.equipment.find(e => {
      if (item.type === 'weapon') return e.type === 'weapon';
      if (item.type === 'armor') {
        // Simplified - in real game would check helmet/chest/boots
        return e.type === 'chest';
      }
      if (item.type === 'accessory') {
        return e.type === 'accessory1' || e.type === 'accessory2';
      }
      return false;
    });

    if (!equipSlot) return false;

    // Unequip current
    if (equipSlot.item) {
      const unequipItem = equipSlot.item;
      unequipItem.unequipEffect?.(playerId);
      this.addItem(unequipItem.id);
    }

    // Equip new
    equipSlot.item = item;
    item.equipEffect?.(playerId);
    this.removeItem(slotIndex, 1);

    this.eventBus.emit('inventory:change', { action: 'equip', itemId: item.id });
    return true;
  }

  unequipItem(equipType: EquipmentSlot['type'], playerId: string = 'player'): boolean {
    const equipSlot = this.equipment.find(e => e.type === equipType);
    if (!equipSlot?.item) return false;

    const added = this.addItem(equipSlot.item.id);
    if (!added.success) return false;

    equipSlot.item.unequipEffect?.(playerId);
    equipSlot.item = null;

    this.eventBus.emit('inventory:change', { action: 'unequip', equipType });
    return true;
  }

  addGold(amount: number): void {
    this.inventory.gold += amount;
    this.eventBus.emit('inventory:change', { action: 'gold', amount });
  }

  removeGold(amount: number): boolean {
    if (this.inventory.gold < amount) return false;
    this.inventory.gold -= amount;
    this.eventBus.emit('inventory:change', { action: 'gold', amount: -amount });
    return true;
  }

  getGold(): number {
    return this.inventory.gold;
  }

  getInventory(): InventoryData {
    return this.inventory;
  }

  getEquipment(): EquipmentSlot[] {
    return this.equipment;
  }

  getTotalStats(): ItemStats {
    const stats: ItemStats = {};
    
    for (const slot of this.equipment) {
      if (slot.item?.stats) {
        Object.assign(stats, slot.item.stats);
      }
    }
    
    return stats;
  }

  getEmptySlotCount(): number {
    return this.inventory.slots.filter(s => s.itemId === null).length;
  }

  isFull(): boolean {
    return this.getEmptySlotCount() === 0;
  }
}
