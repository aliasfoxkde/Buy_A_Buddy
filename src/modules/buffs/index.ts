/**
 * Buff/Debuff System Module
 */

import { EventBus, generateId } from '../../core';

export type BuffType = 
  | 'poison'      // Damage over time
  | 'burn'        // Fire damage over time
  | 'freeze'      // Cannot move
  | 'stun'        // Cannot act
  | 'slow'        // Reduced speed
  | 'haste'       // Increased speed
  | 'shield'      // Absorb damage
  | 'regen'       // Heal over time
  | 'strength'    // Increased attack
  | 'weakness'    // Decreased attack
  | 'fortify'     // Increased defense
  | 'vulnerable'   // Decreased defense
  | 'invisible'    // Cannot be targeted
  | 'silence';    // Cannot use skills

export type BuffCategory = 'buff' | 'debuff' | 'status';

export interface BuffConfig {
  id: string;
  name: string;
  description: string;
  type: BuffType;
  category: BuffCategory;
  duration: number;       // Total duration in seconds
  value: number;          // Effect value (damage/heal/percentage)
  tickRate: number;       // How often effect triggers (per second)
  stackable: boolean;
  maxStacks: number;
  icon: string;
  onApply?: (target: BuffableEntity) => void;
  onTick?: (target: BuffableEntity, tick: number) => number;
  onRemove?: (target: BuffableEntity) => void;
}

export interface ActiveBuff {
  config: BuffConfig;
  remainingDuration: number;
  currentTick: number;
  stacks: number;
  startTime: number;
}

export interface BuffableEntity {
  id: string;
  addBuff(config: BuffConfig): ActiveBuff;
  removeBuff(buffId: string): void;
  hasBuff(type: BuffType): boolean;
  getBuff(type: BuffType): ActiveBuff | undefined;
  update(deltaTime: number): void;
}

export class BuffSystem {
  private eventBus: EventBus;
  private buffConfigs: Map<string, BuffConfig> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeDefaultBuffs();
  }

  registerBuff(config: BuffConfig): void {
    this.buffConfigs.set(config.id, config);
  }

  getBuffConfig(id: string): BuffConfig | undefined {
    return this.buffConfigs.get(id);
  }

  createBuff(entity: BuffableEntity, buffId: string): ActiveBuff | null {
    const config = this.buffConfigs.get(buffId);
    if (!config) return null;
    return entity.addBuff(config);
  }

  update(entity: BuffableEntity, deltaTime: number): void {
    entity.update(deltaTime);
  }

  private initializeDefaultBuffs(): void {
    // Poison - damage over time
    this.registerBuff({
      id: 'buff_poison',
      name: 'Poison',
      description: 'Taking damage over time',
      type: 'poison',
      category: 'debuff',
      duration: 5,
      value: 5,
      tickRate: 1,
      stackable: true,
      maxStacks: 5,
      icon: 'poison',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'poison' });
      },
      onTick: (target, tick) => {
        // Damage is applied through the entity
        this.eventBus.emit('buff:tick', { entity: target.id, buff: 'poison', damage: 5 });
        return 5; // Return damage amount
      },
      onRemove: (target) => {
        this.eventBus.emit('buff:remove', { entity: target.id, buff: 'poison' });
      }
    });

    // Burn - fire damage
    this.registerBuff({
      id: 'buff_burn',
      name: 'Burning',
      description: 'On fire! Taking fire damage',
      type: 'burn',
      category: 'debuff',
      duration: 3,
      value: 8,
      tickRate: 1,
      stackable: true,
      maxStacks: 3,
      icon: 'fire',
      onTick: (target, tick) => {
        this.eventBus.emit('buff:tick', { entity: target.id, buff: 'burn', damage: 8 });
        return 8;
      }
    });

    // Freeze - cannot move
    this.registerBuff({
      id: 'buff_freeze',
      name: 'Frozen',
      description: 'Cannot move',
      type: 'freeze',
      category: 'debuff',
      duration: 2,
      value: 0,
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'ice',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'freeze' });
        // Disable movement
      },
      onRemove: (target) => {
        // Re-enable movement
      }
    });

    // Stun - cannot act
    this.registerBuff({
      id: 'buff_stun',
      name: 'Stunned',
      description: 'Cannot take actions',
      type: 'stun',
      category: 'debuff',
      duration: 1.5,
      value: 0,
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'stun',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'stun' });
      }
    });

    // Slow - reduced speed
    this.registerBuff({
      id: 'buff_slow',
      name: 'Slowed',
      description: 'Movement speed reduced',
      type: 'slow',
      category: 'debuff',
      duration: 5,
      value: 50, // 50% slower
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'slow',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'slow', value: 50 });
      },
      onRemove: (target) => {
        this.eventBus.emit('buff:remove', { entity: target.id, buff: 'slow' });
      }
    });

    // Haste - increased speed
    this.registerBuff({
      id: 'buff_haste',
      name: 'Hasted',
      description: 'Movement speed increased',
      type: 'haste',
      category: 'buff',
      duration: 10,
      value: 50, // 50% faster
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'haste',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'haste', value: 50 });
      }
    });

    // Shield - absorb damage
    this.registerBuff({
      id: 'buff_shield',
      name: 'Shield',
      description: 'Absorbing damage',
      type: 'shield',
      category: 'buff',
      duration: 10,
      value: 50, // Absorb up to 50 damage
      tickRate: 0,
      stackable: true,
      maxStacks: 5,
      icon: 'shield',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'shield', value: 50 });
      }
    });

    // Regen - heal over time
    this.registerBuff({
      id: 'buff_regen',
      name: 'Regeneration',
      description: 'Recovering health over time',
      type: 'regen',
      category: 'buff',
      duration: 10,
      value: 10,
      tickRate: 1,
      stackable: true,
      maxStacks: 3,
      icon: 'heal',
      onTick: (target, tick) => {
        this.eventBus.emit('buff:tick', { entity: target.id, buff: 'regen', heal: 10 });
        return -10; // Negative = heal
      }
    });

    // Strength - increased attack
    this.registerBuff({
      id: 'buff_strength',
      name: 'Strength',
      description: 'Attack power increased',
      type: 'strength',
      category: 'buff',
      duration: 30,
      value: 20, // +20 attack
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'attack_up',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'strength', value: 20 });
      }
    });

    // Weakness - decreased attack
    this.registerBuff({
      id: 'buff_weakness',
      name: 'Weakness',
      description: 'Attack power decreased',
      type: 'weakness',
      category: 'debuff',
      duration: 20,
      value: 20, // -20 attack
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'attack_down',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'weakness', value: 20 });
      }
    });

    // Fortify - increased defense
    this.registerBuff({
      id: 'buff_fortify',
      name: 'Fortified',
      description: 'Defense increased',
      type: 'fortify',
      category: 'buff',
      duration: 30,
      value: 15, // +15 defense
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'defense_up',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'fortify', value: 15 });
      }
    });

    // Vulnerable - decreased defense
    this.registerBuff({
      id: 'buff_vulnerable',
      name: 'Vulnerable',
      description: 'Defense decreased',
      type: 'vulnerable',
      category: 'debuff',
      duration: 20,
      value: 15, // -15 defense
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'defense_down',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'vulnerable', value: 15 });
      }
    });

    // Silence - cannot use skills
    this.registerBuff({
      id: 'buff_silence',
      name: 'Silenced',
      description: 'Cannot use skills',
      type: 'silence',
      category: 'debuff',
      duration: 5,
      value: 0,
      tickRate: 0,
      stackable: false,
      maxStacks: 1,
      icon: 'silence',
      onApply: (target) => {
        this.eventBus.emit('buff:apply', { entity: target.id, buff: 'silence' });
      }
    });
  }
}

// ==========================================
// ENTITY WITH BUFFS
// ==========================================

export class BuffableEntityImpl implements BuffableEntity {
  id: string;
  private buffs: Map<string, ActiveBuff> = new Map();
  private eventBus: EventBus;

  constructor(id: string, eventBus: EventBus) {
    this.id = id;
    this.eventBus = eventBus;
  }

  addBuff(config: BuffConfig): ActiveBuff {
    // Check if buff already exists
    const existing = this.buffs.get(config.id);
    
    if (existing) {
      if (config.stackable && existing.stacks < config.maxStacks) {
        existing.stacks++;
        existing.remainingDuration = config.duration;
        existing.currentTick = 0;
        return existing;
      } else if (!config.stackable) {
        // Refresh duration
        existing.remainingDuration = config.duration;
        return existing;
      }
    }

    // Create new buff
    const buff: ActiveBuff = {
      config,
      remainingDuration: config.duration,
      currentTick: 0,
      stacks: 1,
      startTime: Date.now()
    };

    this.buffs.set(config.id, buff);
    config.onApply?.(this);
    
    return buff;
  }

  removeBuff(buffId: string): void {
    const buff = this.buffs.get(buffId);
    if (buff) {
      buff.config.onRemove?.(this);
      this.buffs.delete(buffId);
    }
  }

  hasBuff(type: BuffType): boolean {
    for (const buff of this.buffs.values()) {
      if (buff.config.type === type) return true;
    }
    return false;
  }

  getBuff(type: BuffType): ActiveBuff | undefined {
    for (const buff of this.buffs.values()) {
      if (buff.config.type === type) return buff;
    }
    return undefined;
  }

  getAllBuffs(): ActiveBuff[] {
    return Array.from(this.buffs.values());
  }

  update(deltaTime: number): void {
    const expiredBuffs: string[] = [];

    for (const [id, buff] of this.buffs) {
      // Update duration
      buff.remainingDuration -= deltaTime;

      // Handle ticks
      if (buff.config.tickRate > 0) {
        const tickInterval = 1 / buff.config.tickRate;
        const newTick = Math.floor((buff.config.duration - buff.remainingDuration) / tickInterval);
        
        if (newTick > buff.currentTick) {
          buff.currentTick = newTick;
          buff.config.onTick?.(this, newTick);
        }
      }

      // Check expiration
      if (buff.remainingDuration <= 0) {
        expiredBuffs.push(id);
      }
    }

    // Remove expired buffs
    for (const id of expiredBuffs) {
      this.removeBuff(id);
    }
  }

  // Calculate stat modifiers from buffs
  getSpeedModifier(): number {
    let modifier = 0;
    
    if (this.hasBuff('slow')) {
      const buff = this.getBuff('slow');
      if (buff) modifier -= buff.config.value;
    }
    
    if (this.hasBuff('haste')) {
      const buff = this.getBuff('haste');
      if (buff) modifier += buff.config.value;
    }
    
    return modifier / 100; // Return as decimal (e.g., 0.5 = 50%)
  }

  getAttackModifier(): number {
    let modifier = 0;
    
    if (this.hasBuff('strength')) {
      const buff = this.getBuff('strength');
      if (buff) modifier += buff.config.value;
    }
    
    if (this.hasBuff('weakness')) {
      const buff = this.getBuff('weakness');
      if (buff) modifier -= buff.config.value;
    }
    
    return modifier;
  }

  getDefenseModifier(): number {
    let modifier = 0;
    
    if (this.hasBuff('fortify')) {
      const buff = this.getBuff('fortify');
      if (buff) modifier += buff.config.value;
    }
    
    if (this.hasBuff('vulnerable')) {
      const buff = this.getBuff('vulnerable');
      if (buff) modifier -= buff.config.value;
    }
    
    return modifier;
  }

  canAct(): boolean {
    return !this.hasBuff('stun') && !this.hasBuff('freeze');
  }

  canMove(): boolean {
    return !this.hasBuff('freeze') && !this.hasBuff('stun');
  }

  canUseSkills(): boolean {
    return !this.hasBuff('silence');
  }

  getShieldValue(): number {
    let total = 0;
    const shieldBuff = this.getBuff('shield');
    if (shieldBuff) {
      total += shieldBuff.config.value * shieldBuff.stacks;
    }
    return total;
  }
}
