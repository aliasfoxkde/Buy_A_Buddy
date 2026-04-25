// ==========================================
// BUDDY SPAWNER SYSTEM
// ==========================================

import { Buddy, Rarity, RARITY_CONFIG, BUDDY_NAMES } from '../game/types';

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Weighted random rarity selection
export function rollRarity(spawnBonus: number = 0): Rarity {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  // Adjust chances with spawn bonus
  const adjustedConfig = RARITY_CONFIG.map(r => ({
    ...r,
    chance: r.chance + (r.name === 'legendary' ? spawnBonus * 10 : 
                       r.name === 'epic' ? spawnBonus * 5 : 0)
  }));
  
  for (const config of adjustedConfig) {
    cumulative += config.chance;
    if (roll < cumulative) {
      return config.name;
    }
  }
  return 'common';
}

// Create a new buddy with given rarity
export function createBuddy(rarity: Rarity): Buddy {
  const names = BUDDY_NAMES[rarity];
  const name = names[Math.floor(Math.random() * names.length)];
  const config = RARITY_CONFIG.find(r => r.name === rarity)!;
  
  return {
    id: generateId(),
    name,
    emoji: config.emoji,
    rarity,
    baseIncome: 1 * config.baseIncomeMultiplier,
    level: 1,
    assignedPlotId: null,
  };
}

// Spawn a random buddy
export function spawnBuddy(spawnBonus: number = 0): Buddy {
  const rarity = rollRarity(spawnBonus);
  return createBuddy(rarity);
}

// Calculate spawn cost (exponential scaling)
export function getSpawnCost(ownedCount: number): number {
  return Math.floor(10 * Math.pow(1.15, ownedCount));
}

// Calculate buddy upgrade cost
export function getBuddyUpgradeCost(buddy: Buddy): number {
  return Math.floor(5 * Math.pow(1.5, buddy.level - 1));
}

// Calculate plot upgrade cost
export function getPlotUpgradeCost(plot: any): number {
  return Math.floor(25 * Math.pow(1.4, plot.level - 1));
}