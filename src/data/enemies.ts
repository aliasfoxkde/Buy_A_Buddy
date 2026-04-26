/**
 * Enemy definitions with stats
 */

export interface EnemyType {
  id: string;
  name: string;
  spriteIndex: number;
  maxHp: number;
  maxHealth?: number; // Alias for maxHp (battle-engine compatibility)
  damage: number;
  defense: number;
  xpReward: number;
  goldReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Additional fields for battle-engine.ts compatibility
  attack?: number;
  speed?: number;
  critChance?: number;
  critMultiplier?: number;
  element?: string;
  level?: number;
  gold?: { min: number; max: number };
  experience?: number;
  range?: boolean; // For ranged enemies
}

export const ENEMIES: Record<string, EnemyType> = {
  slime: {
    id: 'slime',
    name: 'Green Slime',
    spriteIndex: 0,
    maxHp: 40,
    damage: 8,
    defense: 2,
    xpReward: 25,
    goldReward: 15,
    difficulty: 'easy',
    attack: 8,
    speed: 5,
    gold: { min: 10, max: 20 },
    experience: 25
  },
  goblin: {
    id: 'goblin',
    name: 'Forest Goblin',
    spriteIndex: 6,
    maxHp: 60,
    damage: 12,
    defense: 4,
    xpReward: 40,
    goldReward: 25,
    difficulty: 'medium',
    attack: 12,
    speed: 7,
    gold: { min: 20, max: 30 },
    experience: 40
  },
  wolf: {
    id: 'wolf',
    name: 'Wild Wolf',
    spriteIndex: 12,
    maxHp: 50,
    damage: 15,
    defense: 3,
    xpReward: 35,
    goldReward: 20,
    difficulty: 'medium',
    attack: 15,
    speed: 10,
    gold: { min: 15, max: 25 },
    experience: 35
  },
  skeleton: {
    id: 'skeleton',
    name: 'Bone Walker',
    spriteIndex: 18,
    maxHp: 80,
    damage: 18,
    defense: 6,
    xpReward: 60,
    goldReward: 40,
    difficulty: 'hard',
    attack: 18,
    speed: 4,
    gold: { min: 30, max: 50 },
    experience: 60
  },
  // Boss enemies
  slime_boss: {
    id: 'slime_boss',
    name: 'Mega Slime King',
    spriteIndex: 0,
    maxHp: 200,
    damage: 25,
    defense: 10,
    xpReward: 200,
    goldReward: 150,
    difficulty: 'hard',
    attack: 25,
    speed: 3,
    critChance: 0.15,
    critMultiplier: 1.5,
    element: 'water',
    level: 5,
    gold: { min: 100, max: 200 },
    experience: 200
  },
  goblin_boss: {
    id: 'goblin_boss',
    name: 'Goblin Warlord',
    spriteIndex: 6,
    maxHp: 300,
    damage: 30,
    defense: 15,
    xpReward: 300,
    goldReward: 200,
    difficulty: 'hard',
    attack: 30,
    speed: 4,
    critChance: 0.2,
    critMultiplier: 2.0,
    element: 'earth',
    level: 8,
    gold: { min: 150, max: 250 },
    experience: 300
  },
  // Flying enemies
  bat: {
    id: 'bat',
    name: 'Cave Bat',
    spriteIndex: 4,
    maxHp: 30,
    damage: 12,
    defense: 2,
    xpReward: 20,
    goldReward: 12,
    difficulty: 'easy',
    attack: 12,
    speed: 10,
    element: 'air',
    level: 1,
    gold: { min: 8, max: 16 },
    experience: 20
  },
  hawk: {
    id: 'hawk',
    name: 'Hunting Hawk',
    spriteIndex: 5,
    maxHp: 45,
    damage: 16,
    defense: 4,
    xpReward: 45,
    goldReward: 25,
    difficulty: 'medium',
    attack: 16,
    speed: 12,
    element: 'air',
    level: 3,
    gold: { min: 15, max: 35 },
    experience: 45
  },
  // Ranged enemies
  goblin_archer: {
    id: 'goblin_archer',
    name: 'Goblin Archer',
    spriteIndex: 7,
    maxHp: 50,
    damage: 20,
    defense: 5,
    xpReward: 55,
    goldReward: 35,
    difficulty: 'medium',
    attack: 20,
    speed: 6,
    range: true,
    element: 'earth',
    level: 4,
    gold: { min: 20, max: 50 },
    experience: 55
  },
  // Elite enemies
  goblin_elite: {
    id: 'goblin_elite',
    name: 'Goblin Elite',
    spriteIndex: 6,
    maxHp: 120,
    damage: 22,
    defense: 10,
    xpReward: 100,
    goldReward: 75,
    difficulty: 'hard',
    attack: 22,
    speed: 5,
    critChance: 0.15,
    element: 'earth',
    level: 5,
    gold: { min: 50, max: 100 },
    experience: 100
  },
  skeleton_elite: {
    id: 'skeleton_elite',
    name: 'Skeleton Knight',
    spriteIndex: 3,
    maxHp: 150,
    damage: 25,
    defense: 15,
    xpReward: 120,
    goldReward: 80,
    difficulty: 'hard',
    attack: 25,
    speed: 3,
    element: 'undead',
    level: 6,
    gold: { min: 60, max: 100 },
    experience: 120
  },
  // More enemy variety
  orc: {
    id: 'orc',
    name: 'Orc Warrior',
    spriteIndex: 8,
    maxHp: 100,
    damage: 22,
    defense: 8,
    xpReward: 80,
    goldReward: 55,
    difficulty: 'hard',
    attack: 22,
    speed: 3,
    element: 'earth',
    level: 5,
    gold: { min: 40, max: 70 },
    experience: 80
  },
  snake: {
    id: 'snake',
    name: 'Cave Snake',
    spriteIndex: 9,
    maxHp: 35,
    damage: 14,
    defense: 3,
    xpReward: 22,
    goldReward: 15,
    difficulty: 'easy',
    attack: 14,
    speed: 7,
    element: 'earth',
    level: 2,
    gold: { min: 10, max: 20 },
    experience: 22
  },
  spider: {
    id: 'spider',
    name: 'Giant Spider',
    spriteIndex: 10,
    maxHp: 55,
    damage: 18,
    defense: 6,
    xpReward: 50,
    goldReward: 30,
    difficulty: 'medium',
    attack: 18,
    speed: 8,
    element: 'nature',
    level: 3,
    gold: { min: 20, max: 40 },
    experience: 50
  },
  troll: {
    id: 'troll',
    name: 'Forest Troll',
    spriteIndex: 11,
    maxHp: 180,
    damage: 28,
    defense: 12,
    xpReward: 150,
    goldReward: 100,
    difficulty: 'hard',
    attack: 28,
    speed: 2,
    element: 'nature',
    level: 7,
    gold: { min: 80, max: 120 },
    experience: 150
  },
  // Mini-boss: Wolf Alpha
  wolf_alpha: {
    id: 'wolf_alpha',
    name: 'Wolf Alpha',
    spriteIndex: 2,
    maxHp: 250,
    damage: 28,
    defense: 12,
    xpReward: 180,
    goldReward: 120,
    difficulty: 'hard',
    attack: 28,
    speed: 6,
    element: 'nature',
    level: 6,
    critChance: 0.2,
    critMultiplier: 1.5,
    gold: { min: 100, max: 140 },
    experience: 180
  },
  // Fire element enemy
  fire_elemental: {
    id: 'fire_elemental',
    name: 'Fire Elemental',
    spriteIndex: 13,
    maxHp: 90,
    damage: 24,
    defense: 5,
    xpReward: 90,
    goldReward: 60,
    difficulty: 'hard',
    attack: 24,
    speed: 5,
    element: 'fire',
    level: 5,
    critChance: 0.1,
    gold: { min: 50, max: 70 },
    experience: 90
  },
  // Ice element enemy
  ice_golem: {
    id: 'ice_golem',
    name: 'Ice Golem',
    spriteIndex: 14,
    maxHp: 140,
    damage: 20,
    defense: 18,
    xpReward: 110,
    goldReward: 75,
    difficulty: 'hard',
    attack: 20,
    speed: 2,
    element: 'ice',
    level: 6,
    gold: { min: 60, max: 90 },
    experience: 110
  },
  // Dark element mini-boss
  shadow_lord: {
    id: 'shadow_lord',
    name: 'Shadow Lord',
    spriteIndex: 15,
    maxHp: 350,
    damage: 35,
    defense: 12,
    xpReward: 350,
    goldReward: 250,
    difficulty: 'hard',
    attack: 35,
    speed: 5,
    element: 'dark',
    level: 10,
    critChance: 0.25,
    critMultiplier: 2.0,
    gold: { min: 200, max: 300 },
    experience: 350
  }
};

// Alias for battle-engine.ts compatibility
export type EnemyDefinition = EnemyType;

export function getEnemy(id: string): EnemyType | undefined {
  return ENEMIES[id];
}

export const ENEMY_LIST = Object.values(ENEMIES);

export function getRandomEnemy(playerLevel: number = 1): EnemyType {
  // Filter enemies by difficulty based on player level
  let pool = ENEMY_LIST;
  
  if (playerLevel < 3) {
    pool = ENEMY_LIST.filter(e => e.difficulty === 'easy');
  } else if (playerLevel < 5) {
    pool = ENEMY_LIST.filter(e => e.difficulty !== 'hard');
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

export function scaleEnemyStats(enemy: EnemyType, playerLevel: number): EnemyType {
  const scaleFactor = 1 + (playerLevel - 1) * 0.15;
  return {
    ...enemy,
    maxHp: Math.floor(enemy.maxHp * scaleFactor),
    damage: Math.floor(enemy.damage * scaleFactor),
    xpReward: Math.floor(enemy.xpReward * scaleFactor),
    goldReward: Math.floor(enemy.goldReward * scaleFactor)
  };
}
