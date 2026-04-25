/**
 * Battle Engine - Enhanced combat system
 */

import { calculateDamage, calculateElementalEffectiveness, calculateCritical, type Element, type Rarity } from './combat-mechanics';
import { getEnemy, ENEMIES, type EnemyDefinition } from '../../data/enemies';

export interface CombatEntity {
  id: string;
  name: string;
  
  // Stats
  maxHealth: number;
  currentHealth: number;
  maxMana: number;
  currentMana: number;
  
  attack: number;
  defense: number;
  speed: number;
  
  // Combat bonuses
  critChance: number;
  critMultiplier: number;
  
  // Element
  element: Element;
  
  // Equipment stats
  bonusAttack: number;
  bonusDefense: number;
  bonusHealth: number;
  bonusMana: number;
  
  // Status
  isDefending: boolean;
  isStunned: boolean;
  isPoisoned: boolean;
  poisonDamage: number;
  
  // Visual
  sprite?: string;
  x: number;
  y: number;
}

export interface CombatAction {
  type: 'attack' | 'skill' | 'defend' | 'item' | 'flee';
  actor: string;
  target?: string;
  skill?: string;
  item?: string;
}

export interface CombatResult {
  success: boolean;
  damage?: number;
  healing?: number;
  effects?: string[];
  isCritical?: boolean;
  message: string;
  isVictory?: boolean;
  isDefeat?: boolean;
}

export interface CombatState {
  inCombat: boolean;
  turn: 'player' | 'enemy';
  turnNumber: number;
  entities: Map<string, CombatEntity>;
  log: string[];
}

/**
 * Create a combat entity from enemy definition
 */
export function createEnemyEntity(enemy: EnemyDefinition, level: number = 1): CombatEntity {
  const levelScale = 1 + (level - 1) * 0.15;
  
  return {
    id: enemy.id + '_' + Date.now(),
    name: enemy.name,
    
    maxHealth: Math.floor((enemy.maxHealth || enemy.maxHp) * levelScale),
    currentHealth: Math.floor((enemy.maxHealth || enemy.maxHp) * levelScale),
    maxMana: 0,
    currentMana: 0,
    
    attack: Math.floor((enemy.attack || enemy.damage) * levelScale),
    defense: Math.floor(enemy.defense * levelScale),
    speed: enemy.speed || 5,
    
    critChance: enemy.critChance || 0.1,
    critMultiplier: enemy.critMultiplier || 1.5,
    
    element: (enemy.element as Element) || 'neutral',
    
    bonusAttack: 0,
    bonusDefense: 0,
    bonusHealth: 0,
    bonusMana: 0,
    
    isDefending: false,
    isStunned: false,
    isPoisoned: false,
    poisonDamage: 0,
    
    x: 0,
    y: 0
  };
}

/**
 * Create a combat entity from player stats
 */
export function createPlayerEntity(stats: {
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
}): CombatEntity {
  return {
    id: 'player',
    name: stats.name,
    
    maxHealth: stats.maxHealth,
    currentHealth: stats.health,
    maxMana: stats.maxMana,
    currentMana: stats.mana,
    
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    
    critChance: 0.1,
    critMultiplier: 1.75,
    
    element: 'physical',
    
    bonusAttack: 0,
    bonusDefense: 0,
    bonusHealth: 0,
    bonusMana: 0,
    
    isDefending: false,
    isStunned: false,
    isPoisoned: false,
    poisonDamage: 0,
    
    x: 100,
    y: 300
  };
}

/**
 * Calculate total attack stat
 */
export function getTotalAttack(entity: CombatEntity): number {
  return entity.attack + entity.bonusAttack;
}

/**
 * Calculate total defense stat
 */
export function getTotalDefense(entity: CombatEntity): number {
  let defense = entity.defense + entity.bonusDefense;
  
  // Defense bonus when defending
  if (entity.isDefending) {
    defense *= 1.5;
  }
  
  return Math.floor(defense);
}

/**
 * Execute an attack action
 */
export function executeAttack(
  attacker: CombatEntity,
  defender: CombatEntity
): CombatResult {
  // Check if attacker is stunned
  if (attacker.isStunned) {
    return {
      success: false,
      message: `${attacker.name} is stunned and cannot act!`
    };
  }
  
  // Calculate damage
  const result = calculateDamage(
    getTotalAttack(attacker),
    getTotalDefense(defender),
    {
      baseDamage: 0, // Will be calculated from attack stat
      criticalChance: attacker.critChance,
      criticalMultiplier: attacker.critMultiplier,
      elementalDamage: attacker.element
    },
    attacker.element,
    defender.element
  );
  
  // Apply damage
  const actualDamage = Math.max(1, result.damage - defender.bonusDefense);
  defender.currentHealth = Math.max(0, defender.currentHealth - actualDamage);
  
  // Build effects list
  const effects: string[] = [];
  if (result.isCritical) effects.push('Critical Hit!');
  if (result.effectiveness > 1.5) effects.push('Super Effective!');
  if (result.effectiveness < 0.75) effects.push('Not Very Effective...');
  
  return {
    success: true,
    damage: actualDamage,
    isCritical: result.isCritical,
    effects,
    message: `${attacker.name} attacks ${defender.name} for ${actualDamage} damage!`
  };
}

/**
 * Execute a defend action
 */
export function executeDefend(entity: CombatEntity): CombatResult {
  entity.isDefending = true;
  
  return {
    success: true,
    message: `${entity.name} takes a defensive stance!`
  };
}

/**
 * Execute a heal action
 */
export function executeHeal(
  entity: CombatEntity,
  amount: number
): CombatResult {
  const actualHeal = Math.min(amount, entity.maxHealth - entity.currentHealth);
  entity.currentHealth += actualHeal;
  
  return {
    success: true,
    healing: actualHeal,
    message: `${entity.name} heals for ${actualHeal} HP!`
  };
}

/**
 * Execute a skill action
 */
export function executeSkill(
  actor: CombatEntity,
  target: CombatEntity,
  skill: {
    name: string;
    damage: number;
    manaCost: number;
    element?: Element;
    effect?: string;
  }
): CombatResult {
  // Check mana
  if (actor.currentMana < skill.manaCost) {
    return {
      success: false,
      message: `Not enough mana! Need ${skill.manaCost}, have ${actor.currentMana}`
    };
  }
  
  // Spend mana
  actor.currentMana -= skill.manaCost;
  
  // Calculate damage
  let damage = skill.damage;
  if (skill.element) {
    const effectiveness = calculateElementalEffectiveness(skill.element, target.element);
    damage = Math.floor(damage * effectiveness);
  }
  
  // Apply damage
  target.currentHealth = Math.max(0, target.currentHealth - damage);
  
  return {
    success: true,
    damage,
    effects: skill.effect ? [skill.effect] : [],
    message: `${actor.name} uses ${skill.name} on ${target.name} for ${damage} damage!`
  };
}

/**
 * Apply poison damage
 */
export function applyPoison(entity: CombatEntity, damagePerTick: number): void {
  entity.isPoisoned = true;
  entity.poisonDamage = damagePerTick;
}

/**
 * Process end of turn effects
 */
export function processEndOfTurn(entity: CombatEntity): string[] {
  const effects: string[] = [];
  
  // Process poison
  if (entity.isPoisoned) {
    entity.currentHealth = Math.max(0, entity.currentHealth - entity.poisonDamage);
    effects.push(`${entity.name} takes ${entity.poisonDamage} poison damage!`);
  }
  
  // Remove defending status
  entity.isDefending = false;
  
  return effects;
}

/**
 * Check if entity is defeated
 */
export function isDefeated(entity: CombatEntity): boolean {
  return entity.currentHealth <= 0;
}

/**
 * Calculate turn order based on speed
 */
export function calculateTurnOrder(
  entities: CombatEntity[]
): CombatEntity[] {
  return [...entities].sort((a, b) => b.speed - a.speed);
}

/**
 * Determine winner of combat
 */
export function determineCombatOutcome(
  player: CombatEntity,
  enemies: CombatEntity[]
): 'victory' | 'defeat' | 'ongoing' {
  if (isDefeated(player)) {
    return 'defeat';
  }
  
  if (enemies.every(e => isDefeated(e))) {
    return 'victory';
  }
  
  return 'ongoing';
}

/**
 * Calculate gold and XP rewards
 */
export function calculateRewards(
  enemies: CombatEntity[],
  playerLevel: number
): { gold: number; exp: number } {
  let totalGold = 0;
  let totalExp = 0;
  
  for (const enemy of enemies) {
    if (isDefeated(enemy)) {
      // Get base rewards from enemy definition
      const enemyDef = getEnemy(enemy.id.replace(/_\\d+$/, ''));
      if (enemyDef) {
        const goldRange = enemyDef.gold || { min: 10, max: 20 };
        totalGold += Math.floor(
          goldRange.min + Math.random() * (goldRange.max - goldRange.min)
        );
        totalExp += enemyDef.experience || enemyDef.xpReward;
      }
    }
  }
  
  // Level scaling bonus
  const levelBonus = 1 + (playerLevel - 1) * 0.1;
  totalExp = Math.floor(totalExp * levelBonus);
  
  return { gold: totalGold, exp: totalExp };
}
