/**
 * Combat Mechanics - Critical Hits & Elemental System
 */

import { clamp } from '../../core';

export type Element = 'physical' | 'fire' | 'ice' | 'lightning' | 'dark' | 'light';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface DamageConfig {
  baseDamage: number;
  criticalChance: number;
  criticalMultiplier: number;
  elementalDamage?: Element;
  elementalMultiplier?: number;
}

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  element: Element;
  effectiveness: number;
  breakdown: string;
}

/**
 * Calculate critical hit
 */
export function calculateCritical(
  baseDamage: number,
  critChance: number,
  critMultiplier: number
): { damage: number; isCritical: boolean } {
  const roll = Math.random();
  const isCritical = roll < critChance;
  const damage = isCritical ? Math.floor(baseDamage * critMultiplier) : baseDamage;
  return { damage, isCritical };
}

/**
 * Calculate elemental effectiveness
 * Fire > Ice > Lightning > Fire (cycle)
 * Dark/Light vs Physical (neutral)
 */
export function calculateElementalEffectiveness(
  attackElement: Element,
  defenseElement: Element
): number {
  const effectiveness: Record<string, Record<string, number>> = {
    fire: { ice: 2.0, lightning: 0.5, dark: 1.0, light: 1.0 },
    ice: { lightning: 2.0, fire: 0.5, dark: 1.0, light: 1.0 },
    lightning: { fire: 2.0, ice: 0.5, dark: 1.0, light: 1.0 },
    dark: { light: 2.0, physical: 1.0, fire: 1.0, ice: 1.0, lightning: 1.0 },
    light: { dark: 2.0, physical: 1.0, fire: 1.0, ice: 1.0, lightning: 1.0 },
    physical: { fire: 1.0, ice: 1.0, lightning: 1.0, dark: 1.0, light: 1.0 }
  };

  return effectiveness[attackElement]?.[defenseElement] ?? 1.0;
}

/**
 * Calculate final damage with all modifiers
 */
export function calculateDamage(
  attackStat: number,
  defenseStat: number,
  config: DamageConfig,
  attackElement: Element = 'physical',
  defenseElement: Element = 'physical'
): DamageResult {
  // Base damage calculation
  let damage = Math.max(1, attackStat - defenseStat * 0.5);
  
  // Add randomness (±20%)
  const variance = 0.8 + Math.random() * 0.4;
  damage *= variance;
  
  // Critical hit
  const { damage: critDamage, isCritical } = calculateCritical(
    damage,
    config.criticalChance,
    config.criticalMultiplier
  );
  damage = critDamage;
  
  // Elemental effectiveness
  const effectiveness = calculateElementalEffectiveness(attackElement, defenseElement);
  damage *= effectiveness;
  
  // Apply elemental multiplier if specified
  if (config.elementalMultiplier) {
    damage *= config.elementalMultiplier;
  }
  
  // Build breakdown string
  let breakdown = `Base: ${Math.floor(damage)}`;
  if (isCritical) breakdown += ' (CRITICAL!)';
  if (effectiveness !== 1.0) {
    breakdown += ` (${effectiveness > 1 ? '+' : ''}${((effectiveness - 1) * 100).toFixed(0)}% ${attackElement})`;
  }
  
  return {
    damage: Math.floor(damage),
    isCritical,
    element: attackElement,
    effectiveness,
    breakdown
  };
}

/**
 * Calculate combo multiplier
 */
export function calculateComboMultiplier(comboCount: number): number {
  if (comboCount < 3) return 1.0;
  if (comboCount < 5) return 1.25;
  if (comboCount < 10) return 1.5;
  if (comboCount < 20) return 2.0;
  return 3.0;
}

/**
 * Calculate damage reduction from defense
 */
export function calculateDamageReduction(defense: number): number {
  // Diminishing returns formula
  return defense / (defense + 100);
}

/**
 * Apply damage reduction
 */
export function applyDamageReduction(damage: number, defense: number): number {
  const reduction = calculateDamageReduction(defense);
  return Math.floor(damage * (1 - reduction));
}

/**
 * Rarity color mapping
 */
export const RARITY_COLORS: Record<Rarity, number> = {
  common: 0x888888,
  uncommon: 0x22c55e,
  rare: 0x3b82f6,
  epic: 0xa855f7,
  legendary: 0xf59e0b
};

/**
 * Rarity drop rates
 */
export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1
};

/**
 * Roll for item rarity
 */
export function rollRarity(): Rarity {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulative += weight;
    if (roll < cumulative) {
      return rarity as Rarity;
    }
  }
  
  return 'common';
}

/**
 * Calculate experience needed for level
 */
export function calculateExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate stat growth per level
 */
export function calculateStatGrowth(
  baseStat: number,
  level: number,
  growthRate: number = 0.1
): number {
  return Math.floor(baseStat * (1 + growthRate * (level - 1)));
}

/**
 * Heal calculation with overheal option
 */
export function calculateHealing(
  baseHeal: number,
  maxHealth: number,
  currentHealth: number,
  allowOverheal: boolean = false
): number {
  const missing = maxHealth - currentHealth;
  const heal = Math.min(baseHeal, allowOverheal ? Infinity : missing);
  return Math.max(0, Math.floor(heal));
}

/**
 * Buff/debuff duration ticks
 */
export function calculateBuffTicks(
  duration: number,
  tickInterval: number = 1
): number {
  return Math.floor(duration / tickInterval);
}
