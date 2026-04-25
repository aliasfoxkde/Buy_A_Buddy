/**
 * Combat System Module
 */

import { Entity, EntityStats, EventBus, calculateDamage, calculateExperienceReward, generateId, Hitbox, Vector2, rectIntersects, clamp } from '../../core';

export type DamageType = 'physical' | 'magic' | 'fire' | 'ice' | 'lightning' | 'dark' | 'light';

export interface CombatAction {
  type: 'attack' | 'skill' | 'item' | 'defend' | 'flee';
  source: CombatEntity;
  target?: CombatEntity;
  damage?: number;
  skill?: string;
  itemId?: string;
}

export interface CombatState {
  inCombat: boolean;
  turnNumber: number;
  currentTurn: CombatEntity | null;
  turnOrder: CombatEntity[];
  actions: CombatAction[];
  turnDuration: number;
}

// Internal combat buff type
export type CombatBuffType = 'poison' | 'burn' | 'freeze' | 'stun' | 'slow' | 'haste' | 'shield' | 'regen';

export interface CombatBuff {
  id: string;
  name: string;
  type: CombatBuffType;
  duration: number;
  remaining: number;
  value: number;
  tickRate: number;
  onApply?: (target: CombatEntity) => void;
  onTick?: (target: CombatEntity) => void;
  onRemove?: (target: CombatEntity) => void;
}

export class CombatEntity extends Entity {
  team: 'player' | 'enemy' | 'neutral';
  skills: string[] = [];
  buffs: CombatBuff[] = [];
  isDefending: boolean = false;
  
  constructor(config: {
    id: string;
    name: string;
    position: Vector2;
    spritesheet: string;
    spriteIndex: number;
    stats?: Partial<EntityStats>;
    team: 'player' | 'enemy' | 'neutral';
    skills?: string[];
  }, eventBus: EventBus) {
    super(config, eventBus);
    this.team = config.team;
    this.skills = config.skills || [];
  }

  addBuff(buff: Omit<CombatBuff, 'id'>): CombatBuff {
    const newBuff: CombatBuff = { ...buff, id: generateId() };
    this.buffs.push(newBuff);
    newBuff.onApply?.(this);
    return newBuff;
  }

  removeBuff(buffId: string): void {
    const index = this.buffs.findIndex(b => b.id === buffId);
    if (index !== -1) {
      const buff = this.buffs[index];
      buff.onRemove?.(this);
      this.buffs.splice(index, 1);
    }
  }

  update(deltaTime: number): void {
    // Update buffs
    for (const buff of this.buffs) {
      buff.remaining -= deltaTime;
      if (buff.remaining <= 0) {
        this.removeBuff(buff.id);
        continue;
      }
      
      // Tick effects
      if (buff.tickRate > 0) {
        const tickInterval = 1 / buff.tickRate;
        if (Math.floor(buff.remaining / tickInterval) !== Math.floor((buff.remaining + deltaTime) / tickInterval)) {
          buff.onTick?.(this);
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render entity sprite
    // This will be implemented by subclasses or the sprite manager
  }
}

export class CombatSystem {
  private eventBus: EventBus;
  state: CombatState;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.state = {
      inCombat: false,
      turnNumber: 0,
      currentTurn: null,
      turnOrder: [],
      actions: [],
      turnDuration: 2.0
    };
  }

  startCombat(player: CombatEntity, enemies: CombatEntity[]): void {
    this.state.inCombat = true;
    this.state.turnNumber = 1;
    this.state.actions = [];
    
    // Create turn order based on speed
    this.state.turnOrder = [player, ...enemies].sort(
      (a, b) => b.stats.speed - a.stats.speed
    );
    
    this.state.currentTurn = this.state.turnOrder[0];
    this.eventBus.emit('battle:start', { player, enemies });
  }

  endCombat(victory: boolean): void {
    this.state.inCombat = false;
    this.state.turnNumber = 0;
    this.state.currentTurn = null;
    this.state.turnOrder = [];
    this.state.actions = [];
    
    this.eventBus.emit('battle:end', { victory });
  }

  executeAction(action: CombatAction): void {
    this.state.actions.push(action);
    
    switch (action.type) {
      case 'attack':
        this.executeAttack(action);
        break;
      case 'skill':
        this.executeSkill(action);
        break;
      case 'defend':
        this.executeDefend(action.source);
        break;
      case 'item':
        this.executeItem(action);
        break;
      case 'flee':
        this.executeFlee(action);
        break;
    }
  }

  private executeAttack(action: CombatAction): void {
    const { source, target } = action;
    if (!target) return;
    
    const damage = calculateDamage(source.stats, target.stats);
    const actualDamage = target.takeDamage(damage, source);
    
    if (action.source.team === 'player') {
      this.eventBus.emit('entity:damage', { entity: target, damage: actualDamage, source });
    }
  }

  private executeSkill(action: CombatAction): void {
    const { source, target, skill } = action;
    if (!skill || !target) return;
    
    // Skill damage/effects handled by skill system
    this.eventBus.emit('skill:cast', { source, target, skill });
  }

  private executeDefend(entity: CombatEntity): void {
    entity.isDefending = true;
    entity.stats.defense *= 1.5;
    
    // Remove defending after one turn
    setTimeout(() => {
      entity.isDefending = false;
      entity.stats.defense /= 1.5;
    }, this.state.turnDuration * 1000);
  }

  private executeItem(action: CombatAction): void {
    const { source, target, itemId } = action;
    if (!itemId) return;
    
    this.eventBus.emit('inventory:itemUsed', { entity: source, itemId, target });
  }

  private executeFlee(action: CombatAction): void {
    const { source } = action;
    
    // Flee chance based on speed
    const fleeChance = source.stats.speed / 100;
    const success = Math.random() < fleeChance;
    
    if (success) {
      this.endCombat(false);
    } else {
      this.nextTurn();
    }
  }

  nextTurn(): void {
    const currentIndex = this.state.turnOrder.indexOf(this.state.currentTurn!);
    const nextIndex = (currentIndex + 1) % this.state.turnOrder.length;
    
    if (nextIndex === 0) {
      this.state.turnNumber++;
    }
    
    this.state.currentTurn = this.state.turnOrder[nextIndex];
    
    // Clear defending status
    this.state.currentTurn.isDefending = false;
    
    // AI turn for enemies
    if (this.state.currentTurn.team === 'enemy') {
      this.executeAITurn(this.state.currentTurn);
    }
  }

  private executeAITurn(entity: CombatEntity): void {
    // Simple AI: 70% attack, 20% skill, 10% defend
    const roll = Math.random();
    
    if (roll < 0.7) {
      // Attack random player target
      const playerTargets = this.state.turnOrder.filter(e => e.team === 'player' && e.isAlive);
      if (playerTargets.length > 0) {
        const target = playerTargets[Math.floor(Math.random() * playerTargets.length)];
        this.executeAction({ type: 'attack', source: entity, target });
      }
    } else if (roll < 0.9 && entity.skills.length > 0) {
      // Use random skill
      const skill = entity.skills[Math.floor(Math.random() * entity.skills.length)];
      const targets = this.state.turnOrder.filter(e => e.team === 'player' && e.isAlive);
      if (targets.length > 0) {
        this.executeAction({ type: 'skill', source: entity, target: targets[0], skill });
      }
    } else {
      // Defend
      this.executeAction({ type: 'defend', source: entity });
    }
    
    // End AI turn after delay
    setTimeout(() => this.nextTurn(), 500);
  }

  getAliveEnemies(): CombatEntity[] {
    return this.state.turnOrder.filter(e => e.team === 'enemy' && e.isAlive);
  }

  getAlivePlayers(): CombatEntity[] {
    return this.state.turnOrder.filter(e => e.team === 'player' && e.isAlive);
  }

  isBattleOver(): boolean {
    const aliveEnemies = this.getAliveEnemies();
    const alivePlayers = this.getAlivePlayers();
    
    if (aliveEnemies.length === 0) {
      this.endCombat(true);
      return true;
    }
    
    if (alivePlayers.length === 0) {
      this.endCombat(false);
      return true;
    }
    
    return false;
  }
}

// ==========================================
// DAMAGE NUMBERS & EFFECTS
// ==========================================

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
  isHeal: boolean;
  color: string;
  life: number;
  velocityY: number;
}

export class DamageNumberSystem {
  private numbers: DamageNumber[] = [];
  
  spawn(x: number, y: number, value: number, options: {
    isCrit?: boolean;
    isHeal?: boolean;
    color?: string;
  } = {}): void {
    const number: DamageNumber = {
      id: generateId(),
      x,
      y,
      value,
      isCrit: options.isCrit || false,
      isHeal: options.isHeal || false,
      color: options.color || (options.isHeal ? '#22c55e' : '#ef4444'),
      life: 1.0,
      velocityY: -50
    };
    
    this.numbers.push(number);
  }

  update(deltaTime: number): void {
    for (const num of this.numbers) {
      num.life -= deltaTime;
      num.y += num.velocityY * deltaTime;
      num.velocityY += 20 * deltaTime; // Gravity
    }
    
    this.numbers = this.numbers.filter(n => n.life > 0);
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const num of this.numbers) {
      const alpha = num.life;
      const scale = num.isCrit ? 1.5 : 1.0;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${Math.floor(20 * scale)}px sans-serif`;
      ctx.fillStyle = num.color;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      
      const text = (num.isHeal ? '+' : '-') + num.value;
      ctx.strokeText(text, num.x, num.y);
      ctx.fillText(text, num.x, num.y);
      
      ctx.restore();
    }
  }
}
