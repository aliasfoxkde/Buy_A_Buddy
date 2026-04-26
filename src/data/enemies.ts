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
