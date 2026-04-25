/**
 * Enemy Database - Monster definitions
 */

export interface EnemyDefinition {
  id: string;
  name: string;
  type: string;
  element: 'physical' | 'fire' | 'ice' | 'lightning' | 'dark' | 'light';
  
  // Stats
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  
  // Combat
  critChance: number;
  critMultiplier: number;
  aiType: 'aggressive' | 'defensive' | 'cowardly' | 'patrol';
  
  // Rewards
  experience: number;
  gold: { min: number; max: number };
  drops: { itemId: string; chance: number }[];
  
  // Behavior
  aggroRange: number;
  patrolRange: number;
  abilities: string[];
  
  // Visual
  sprite: string;
  tint?: number;
}

export const ENEMIES: Record<string, EnemyDefinition> = {
  // ============ FOREST ZONE ============
  slime_green: {
    id: 'slime_green',
    name: 'Green Slime',
    type: 'slime',
    element: 'physical',
    maxHealth: 30,
    attack: 5,
    defense: 2,
    speed: 4,
    critChance: 0.05,
    critMultiplier: 1.5,
    aiType: 'aggressive',
    experience: 15,
    gold: { min: 5, max: 10 },
    drops: [
      { itemId: 'material_gel', chance: 0.3 },
      { itemId: 'potion_health_small', chance: 0.1 }
    ],
    aggroRange: 100,
    patrolRange: 50,
    abilities: [],
    sprite: 'enemies'
  },
  
  slime_blue: {
    id: 'slime_blue',
    name: 'Blue Slime',
    type: 'slime',
    element: 'ice',
    maxHealth: 40,
    attack: 7,
    defense: 3,
    speed: 5,
    critChance: 0.05,
    critMultiplier: 1.5,
    aiType: 'aggressive',
    experience: 20,
    gold: { min: 8, max: 15 },
    drops: [
      { itemId: 'material_ice_essence', chance: 0.2 },
      { itemId: 'potion_mana_small', chance: 0.15 }
    ],
    aggroRange: 100,
    patrolRange: 50,
    abilities: ['ice_shard'],
    sprite: 'enemies'
  },
  
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    type: 'humanoid',
    element: 'physical',
    maxHealth: 50,
    attack: 10,
    defense: 5,
    speed: 8,
    critChance: 0.08,
    critMultiplier: 1.75,
    aiType: 'aggressive',
    experience: 30,
    gold: { min: 10, max: 25 },
    drops: [
      { itemId: 'weapon_wooden_dagger', chance: 0.1 },
      { itemId: 'material_goblin_ear', chance: 0.4 }
    ],
    aggroRange: 150,
    patrolRange: 80,
    abilities: ['quick_strike'],
    sprite: 'enemies'
  },
  
  goblin_shaman: {
    id: 'goblin_shaman',
    name: 'Goblin Shaman',
    type: 'humanoid',
    element: 'dark',
    maxHealth: 35,
    attack: 12,
    defense: 3,
    speed: 6,
    critChance: 0.1,
    critMultiplier: 2.0,
    aiType: 'defensive',
    experience: 45,
    gold: { min: 20, max: 35 },
    drops: [
      { itemId: 'scroll_dark_bolt', chance: 0.25 },
      { itemId: 'material_shaman_staff', chance: 0.15 }
    ],
    aggroRange: 120,
    patrolRange: 40,
    abilities: ['dark_bolt', 'heal'],
    sprite: 'enemies'
  },
  
  wolf: {
    id: 'wolf',
    name: 'Wild Wolf',
    type: 'beast',
    element: 'physical',
    maxHealth: 45,
    attack: 12,
    defense: 4,
    speed: 12,
    critChance: 0.12,
    critMultiplier: 1.8,
    aiType: 'aggressive',
    experience: 35,
    gold: { min: 12, max: 20 },
    drops: [
      { itemId: 'material_wolf_pelt', chance: 0.5 },
      { itemId: 'material_wolf_fang', chance: 0.3 }
    ],
    aggroRange: 180,
    patrolRange: 100,
    abilities: ['pack_hunt'],
    sprite: 'enemies'
  },
  
  // ============ CAVE ZONE ============
  bat: {
    id: 'bat',
    name: 'Giant Bat',
    type: 'beast',
    element: 'physical',
    maxHealth: 25,
    attack: 8,
    defense: 1,
    speed: 14,
    critChance: 0.15,
    critMultiplier: 2.0,
    aiType: 'aggressive',
    experience: 20,
    gold: { min: 5, max: 12 },
    drops: [
      { itemId: 'material_bat_wing', chance: 0.4 }
    ],
    aggroRange: 120,
    patrolRange: 60,
    abilities: ['sonic_scream'],
    sprite: 'enemies'
  },
  
  spider: {
    id: 'spider',
    name: 'Cave Spider',
    type: 'beast',
    element: 'physical',
    maxHealth: 55,
    attack: 14,
    defense: 6,
    speed: 7,
    critChance: 0.1,
    critMultiplier: 1.5,
    aiType: 'aggressive',
    experience: 40,
    gold: { min: 15, max: 25 },
    drops: [
      { itemId: 'material_spider_silk', chance: 0.5 },
      { itemId: 'potion_poison_small', chance: 0.2 }
    ],
    aggroRange: 100,
    patrolRange: 50,
    abilities: ['poison_bite', 'web_trap'],
    sprite: 'enemies'
  },
  
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton Warrior',
    type: 'undead',
    element: 'physical',
    maxHealth: 60,
    attack: 15,
    defense: 8,
    speed: 6,
    critChance: 0.08,
    critMultiplier: 1.75,
    aiType: 'aggressive',
    experience: 50,
    gold: { min: 20, max: 35 },
    drops: [
      { itemId: 'material_bone', chance: 0.6 },
      { itemId: 'weapon_bone_sword', chance: 0.05 }
    ],
    aggroRange: 130,
    patrolRange: 70,
    abilities: ['bone_throw'],
    sprite: 'enemies'
  },
  
  skeleton_mage: {
    id: 'skeleton_mage',
    name: 'Skeleton Mage',
    type: 'undead',
    element: 'dark',
    maxHealth: 40,
    attack: 18,
    defense: 4,
    speed: 5,
    critChance: 0.12,
    critMultiplier: 2.0,
    aiType: 'cowardly',
    experience: 60,
    gold: { min: 25, max: 40 },
    drops: [
      { itemId: 'material_dark_essence', chance: 0.3 },
      { itemId: 'scroll_fireball', chance: 0.15 }
    ],
    aggroRange: 200,
    patrolRange: 80,
    abilities: ['dark_bolt', 'teleport'],
    sprite: 'enemies'
  },
  
  // ============ BOSSES ============
  slime_king: {
    id: 'slime_king',
    name: 'Slime King',
    type: 'slime',
    element: 'physical',
    maxHealth: 500,
    attack: 25,
    defense: 15,
    speed: 3,
    critChance: 0.1,
    critMultiplier: 2.0,
    aiType: 'defensive',
    experience: 300,
    gold: { min: 200, max: 400 },
    drops: [
      { itemId: 'weapon_slime_crown', chance: 1.0 },
      { itemId: 'potion_health_large', chance: 0.5 },
      { itemId: 'material_gel_king', chance: 0.8 }
    ],
    aggroRange: 250,
    patrolRange: 150,
    abilities: ['slime_spawn', 'mega_slap', 'recover'],
    sprite: 'bosses'
  },
  
  goblin_chief: {
    id: 'goblin_chief',
    name: 'Goblin Chief',
    type: 'humanoid',
    element: 'physical',
    maxHealth: 400,
    attack: 30,
    defense: 20,
    speed: 8,
    critChance: 0.15,
    critMultiplier: 2.25,
    aiType: 'aggressive',
    experience: 350,
    gold: { min: 250, max: 500 },
    drops: [
      { itemId: 'weapon_goblin_axe', chance: 1.0 },
      { itemId: 'armor_goblin_hide', chance: 0.5 },
      { itemId: 'material_chief_trophy', chance: 0.8 }
    ],
    aggroRange: 200,
    patrolRange: 100,
    abilities: ['war_cry', 'axe_throw', 'summon_goblins'],
    sprite: 'bosses'
  },
  
  dragon_whelp: {
    id: 'dragon_whelp',
    name: 'Fire Dragon Whelp',
    type: 'dragon',
    element: 'fire',
    maxHealth: 600,
    attack: 35,
    defense: 25,
    speed: 10,
    critChance: 0.12,
    critMultiplier: 2.5,
    aiType: 'aggressive',
    experience: 500,
    gold: { min: 400, max: 800 },
    drops: [
      { itemId: 'weapon_dragon_claw', chance: 1.0 },
      { itemId: 'material_dragon_scale', chance: 0.8 },
      { itemId: 'material_fire_essence', chance: 0.6 }
    ],
    aggroRange: 300,
    patrolRange: 200,
    abilities: ['fire_breath', 'flame_wave', 'dragon_roar'],
    sprite: 'bosses'
  }
};

/**
 * Get enemies for a zone
 */
export function getEnemiesForZone(zoneId: string): EnemyDefinition[] {
  const zoneEnemies: Record<string, string[]> = {
    'forest': ['slime_green', 'slime_blue', 'goblin', 'wolf'],
    'forest_dark': ['goblin', 'goblin_shaman', 'wolf', 'bat'],
    'cave': ['bat', 'spider', 'skeleton', 'skeleton_mage'],
    'dungeon': ['skeleton', 'skeleton_mage', 'spider'],
    'volcano': ['slime_blue', 'goblin_shaman'],
    'boss_lair': ['slime_king', 'goblin_chief', 'dragon_whelp']
  };
  
  const enemyIds = zoneEnemies[zoneId] || zoneEnemies['forest'];
  return enemyIds.map(id => ENEMIES[id]).filter(Boolean);
}

/**
 * Get enemy by ID
 */
export function getEnemy(id: string): EnemyDefinition | null {
  return ENEMIES[id] || null;
}

/**
 * Scale enemy stats by level
 */
export function scaleEnemyStats(enemy: EnemyDefinition, playerLevel: number): EnemyDefinition {
  const levelDiff = Math.max(1, playerLevel - 1);
  const scaleFactor = 1 + (levelDiff * 0.1);
  
  return {
    ...enemy,
    maxHealth: Math.floor(enemy.maxHealth * scaleFactor),
    attack: Math.floor(enemy.attack * scaleFactor),
    defense: Math.floor(enemy.defense * scaleFactor),
    experience: Math.floor(enemy.experience * scaleFactor),
    gold: {
      min: Math.floor(enemy.gold.min * scaleFactor),
      max: Math.floor(enemy.gold.max * scaleFactor)
    }
  };
}
