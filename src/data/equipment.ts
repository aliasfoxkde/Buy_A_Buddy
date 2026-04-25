/**
 * Equipment Database - Weapons, Armor, Accessories
 */

export interface EquipmentDefinition {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  slot: 'weapon' | 'head' | 'chest' | 'legs' | 'feet' | 'hands' | 'accessory1' | 'accessory2';
  
  // Stats
  attack?: number;
  defense?: number;
  health?: number;
  mana?: number;
  speed?: number;
  critChance?: number;
  critMultiplier?: number;
  
  // Element
  element?: 'physical' | 'fire' | 'ice' | 'lightning' | 'dark' | 'light';
  
  // Rarity
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  // Price
  buyPrice: number;
  sellPrice: number;
  
  // Requirements
  level?: number;
  
  // Description
  description: string;
}

export const WEAPONS: Record<string, EquipmentDefinition> = {
  // ============ WOODEN TIER ============
  weapon_wooden_sword: {
    id: 'weapon_wooden_sword',
    name: 'Wooden Sword',
    type: 'weapon',
    slot: 'weapon',
    attack: 5,
    critChance: 0.05,
    critMultiplier: 1.5,
    rarity: 'common',
    buyPrice: 50,
    sellPrice: 25,
    description: 'A basic training sword. Better than nothing.'
  },
  
  weapon_wooden_staff: {
    id: 'weapon_wooden_staff',
    name: 'Wooden Staff',
    type: 'weapon',
    slot: 'weapon',
    attack: 3,
    mana: 20,
    critChance: 0.08,
    critMultiplier: 1.3,
    rarity: 'common',
    buyPrice: 60,
    sellPrice: 30,
    description: 'A simple staff for apprentice mages.'
  },
  
  weapon_wooden_bow: {
    id: 'weapon_wooden_bow',
    name: 'Wooden Bow',
    type: 'weapon',
    slot: 'weapon',
    attack: 6,
    speed: 3,
    critChance: 0.1,
    critMultiplier: 1.4,
    rarity: 'common',
    buyPrice: 55,
    sellPrice: 27,
    description: 'A basic hunting bow.'
  },
  
  // ============ IRON TIER ============
  weapon_iron_sword: {
    id: 'weapon_iron_sword',
    name: 'Iron Sword',
    type: 'weapon',
    slot: 'weapon',
    attack: 12,
    critChance: 0.08,
    critMultiplier: 1.75,
    rarity: 'uncommon',
    buyPrice: 150,
    sellPrice: 75,
    level: 5,
    description: 'A sturdy iron blade.'
  },
  
  weapon_iron_axe: {
    id: 'weapon_iron_axe',
    name: 'Iron Battleaxe',
    type: 'weapon',
    slot: 'weapon',
    attack: 15,
    critChance: 0.05,
    critMultiplier: 2.0,
    rarity: 'uncommon',
    buyPrice: 180,
    sellPrice: 90,
    level: 7,
    description: 'Heavy but powerful.'
  },
  
  weapon_iron_staff: {
    id: 'weapon_iron_staff',
    name: 'Iron Staff',
    type: 'weapon',
    slot: 'weapon',
    attack: 6,
    mana: 50,
    critChance: 0.1,
    critMultiplier: 1.5,
    rarity: 'uncommon',
    buyPrice: 160,
    sellPrice: 80,
    level: 5,
    description: 'Enhances magical abilities.'
  },
  
  weapon_iron_dagger: {
    id: 'weapon_iron_dagger',
    name: 'Iron Dagger',
    type: 'weapon',
    slot: 'weapon',
    attack: 8,
    speed: 5,
    critChance: 0.15,
    critMultiplier: 1.6,
    rarity: 'uncommon',
    buyPrice: 120,
    sellPrice: 60,
    level: 4,
    description: 'Fast and deadly.'
  },
  
  // ============ STEEL TIER ============
  weapon_steel_sword: {
    id: 'weapon_steel_sword',
    name: 'Steel Sword',
    type: 'weapon',
    slot: 'weapon',
    attack: 20,
    critChance: 0.1,
    critMultiplier: 1.8,
    rarity: 'rare',
    buyPrice: 400,
    sellPrice: 200,
    level: 10,
    description: 'A well-crafted steel blade.'
  },
  
  weapon_steel_greatsword: {
    id: 'weapon_steel_greatsword',
    name: 'Steel Greatsword',
    type: 'weapon',
    slot: 'weapon',
    attack: 28,
    speed: -2,
    critChance: 0.08,
    critMultiplier: 2.25,
    rarity: 'rare',
    buyPrice: 500,
    sellPrice: 250,
    level: 12,
    description: 'Massive blade for devastating strikes.'
  },
  
  weapon_steel_wand: {
    id: 'weapon_steel_wand',
    name: 'Arcane Wand',
    type: 'weapon',
    slot: 'weapon',
    attack: 10,
    mana: 80,
    critChance: 0.12,
    critMultiplier: 1.7,
    rarity: 'rare',
    buyPrice: 450,
    sellPrice: 225,
    level: 10,
    element: 'lightning',
    description: 'Channels arcane energy.'
  },
  
  // ============ MAGIC TIER ============
  weapon_fire_blade: {
    id: 'weapon_fire_blade',
    name: 'Flame Blade',
    type: 'weapon',
    slot: 'weapon',
    attack: 25,
    element: 'fire',
    critChance: 0.1,
    critMultiplier: 2.0,
    rarity: 'epic',
    buyPrice: 800,
    sellPrice: 400,
    level: 15,
    description: 'Burns with eternal flame.'
  },
  
  weapon_ice_staff: {
    id: 'weapon_ice_staff',
    name: 'Frost Staff',
    type: 'weapon',
    slot: 'weapon',
    attack: 15,
    mana: 120,
    element: 'ice',
    critChance: 0.15,
    critMultiplier: 1.8,
    rarity: 'epic',
    buyPrice: 850,
    sellPrice: 425,
    level: 15,
    description: 'Channels bitter cold.'
  },
  
  // ============ LEGENDARY TIER ============
  weapon_dragon_slayer: {
    id: 'weapon_dragon_slayer',
    name: 'Dragon Slayer',
    type: 'weapon',
    slot: 'weapon',
    attack: 45,
    critChance: 0.15,
    critMultiplier: 2.5,
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 1000,
    level: 20,
    description: 'Forged to slay dragons.'
  },
  
  weapon_phoenix_blade: {
    id: 'weapon_phoenix_blade',
    name: 'Phoenix Blade',
    type: 'weapon',
    slot: 'weapon',
    attack: 35,
    health: 50,
    element: 'fire',
    critChance: 0.2,
    critMultiplier: 2.25,
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 1500,
    level: 18,
    description: 'Blessed by the phoenix. Grants rebirth.'
  }
};

export const ARMOR: Record<string, EquipmentDefinition> = {
  // ============ LEATHER TIER ============
  armor_leather: {
    id: 'armor_leather',
    name: 'Leather Armor',
    type: 'armor',
    slot: 'chest',
    defense: 5,
    speed: 1,
    rarity: 'common',
    buyPrice: 80,
    sellPrice: 40,
    description: 'Basic protection from leather.'
  },
  
  helmet_leather: {
    id: 'helmet_leather',
    name: 'Leather Cap',
    type: 'armor',
    slot: 'head',
    defense: 2,
    rarity: 'common',
    buyPrice: 40,
    sellPrice: 20,
    description: 'Simple head protection.'
  },
  
  // ============ CHAIN TIER ============
  armor_chain: {
    id: 'armor_chain',
    name: 'Chain Mail',
    type: 'armor',
    slot: 'chest',
    defense: 12,
    rarity: 'uncommon',
    buyPrice: 200,
    sellPrice: 100,
    level: 5,
    description: 'Interlocked rings of steel.'
  },
  
  helmet_chain: {
    id: 'helmet_chain',
    name: 'Chain Coif',
    type: 'armor',
    slot: 'head',
    defense: 5,
    rarity: 'uncommon',
    buyPrice: 100,
    sellPrice: 50,
    level: 5,
    description: 'Protects the head and neck.'
  },
  
  boots_iron: {
    id: 'boots_iron',
    name: 'Iron Boots',
    type: 'armor',
    slot: 'feet',
    defense: 4,
    rarity: 'uncommon',
    buyPrice: 120,
    sellPrice: 60,
    level: 6,
    description: 'Heavy but protective.'
  },
  
  // ============ PLATE TIER ============
  armor_plate: {
    id: 'armor_plate',
    name: 'Plate Armor',
    type: 'armor',
    slot: 'chest',
    defense: 25,
    speed: -2,
    rarity: 'rare',
    buyPrice: 500,
    sellPrice: 250,
    level: 12,
    description: 'Full plate steel armor.'
  },
  
  helmet_plate: {
    id: 'helmet_plate',
    name: 'Plate Helm',
    type: 'armor',
    slot: 'head',
    defense: 10,
    rarity: 'rare',
    buyPrice: 250,
    sellPrice: 125,
    level: 12,
    description: 'Heavy helm of steel.'
  },
  
  shield_iron: {
    id: 'shield_iron',
    name: 'Iron Shield',
    type: 'armor',
    slot: 'hands',
    defense: 15,
    health: 20,
    rarity: 'rare',
    buyPrice: 300,
    sellPrice: 150,
    level: 10,
    description: 'Sturdy defensive shield.'
  },
  
  // ============ MAGIC ARMOR ============
  armor_mage_robes: {
    id: 'armor_mage_robes',
    name: 'Arcane Robes',
    type: 'armor',
    slot: 'chest',
    defense: 5,
    mana: 60,
    rarity: 'rare',
    buyPrice: 350,
    sellPrice: 175,
    level: 10,
    description: 'Enhances magical power.'
  },
  
  // ============ EPIC/LEGENDARY ============
  armor_dragon_scale: {
    id: 'armor_dragon_scale',
    name: 'Dragon Scale Armor',
    type: 'armor',
    slot: 'chest',
    defense: 40,
    health: 100,
    element: 'fire',
    rarity: 'epic',
    buyPrice: 0,
    sellPrice: 800,
    level: 18,
    description: 'Forged from dragon scales.'
  }
};

export const ACCESSORIES: Record<string, EquipmentDefinition> = {
  ring_gold: {
    id: 'ring_gold',
    name: 'Gold Ring',
    type: 'accessory',
    slot: 'accessory1',
    critChance: 0.02,
    rarity: 'common',
    buyPrice: 100,
    sellPrice: 50,
    description: 'A simple gold ring.'
  },
  
  amulet_health: {
    id: 'amulet_health',
    name: 'Health Amulet',
    type: 'accessory',
    slot: 'accessory2',
    health: 30,
    rarity: 'uncommon',
    buyPrice: 150,
    sellPrice: 75,
    description: 'Increases maximum health.'
  },
  
  ring_mana: {
    id: 'ring_mana',
    name: 'Mana Ring',
    type: 'accessory',
    slot: 'accessory1',
    mana: 25,
    rarity: 'uncommon',
    buyPrice: 150,
    sellPrice: 75,
    description: 'Increases maximum mana.'
  },
  
  ring_speed: {
    id: 'ring_speed',
    name: 'Swift Ring',
    type: 'accessory',
    slot: 'accessory1',
    speed: 3,
    rarity: 'uncommon',
    buyPrice: 180,
    sellPrice: 90,
    description: 'Increases movement speed.'
  },
  
  amulet_fire_resist: {
    id: 'amulet_fire_resist',
    name: 'Fire Ward',
    type: 'accessory',
    slot: 'accessory2',
    defense: 5,
    element: 'fire',
    rarity: 'rare',
    buyPrice: 300,
    sellPrice: 150,
    level: 8,
    description: 'Protects against fire.'
  },
  
  ring_crit: {
    id: 'ring_crit',
    name: 'Assassin Ring',
    type: 'accessory',
    slot: 'accessory1',
    critChance: 0.08,
    critMultiplier: 0.25,
    rarity: 'rare',
    buyPrice: 400,
    sellPrice: 200,
    level: 10,
    description: 'Increases critical damage.'
  },
  
  amulet_dragon: {
    id: 'amulet_dragon',
    name: 'Dragon Heart',
    type: 'accessory',
    slot: 'accessory2',
    health: 100,
    attack: 10,
    defense: 10,
    rarity: 'legendary',
    buyPrice: 0,
    sellPrice: 2000,
    level: 20,
    description: 'Heart of a fallen dragon.'
  }
};

/**
 * Get all equipment
 */
export function getAllEquipment(): EquipmentDefinition[] {
  return [
    ...Object.values(WEAPONS),
    ...Object.values(ARMOR),
    ...Object.values(ACCESSORIES)
  ];
}

/**
 * Get equipment by ID
 */
export function getEquipment(id: string): EquipmentDefinition | null {
  return WEAPONS[id] || ARMOR[id] || ACCESSORIES[id] || null;
}

/**
 * Get equipment by slot and type
 */
export function getEquipmentBySlot(slot: string): EquipmentDefinition[] {
  const all = getAllEquipment();
  return all.filter(e => e.slot === slot);
}

/**
 * Get equipment by rarity
 */
export function getEquipmentByRarity(rarity: string): EquipmentDefinition[] {
  const all = getAllEquipment();
  return all.filter(e => e.rarity === rarity);
}
