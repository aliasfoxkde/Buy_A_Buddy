/**
 * Skills System Module
 */

import { EventBus, EntityStats, generateId } from '../../core';

export type SkillType = 'active' | 'passive' | 'toggle';
export type SkillTarget = 'self' | 'single_enemy' | 'single_ally' | 'all_enemies' | 'all_allies' | 'area';
export type SkillElement = 'physical' | 'fire' | 'ice' | 'lightning' | 'earth' | 'dark' | 'light' | 'neutral';

export interface SkillCost {
  mana?: number;
  health?: number;
  stamina?: number;
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'shield' | 'teleport' | 'summon';
  value: number;
  element?: SkillElement;
  duration?: number;
  tickRate?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  target: SkillTarget;
  element: SkillElement;
  costs: SkillCost;
  effects: SkillEffect[];
  cooldown: number;
  range: number;
  areaOfEffect?: number;
  animation?: string;
  icon: string;
  requiredLevel: number;
  requiredSkill?: string; // Prerequisite skill
  learnedBy?: string[]; // Item IDs that grant this skill
}

export interface ActiveSkill {
  skillId: string;
  currentCooldown: number;
  isActive: boolean;
}

export class SkillSystem {
  private eventBus: EventBus;
  private skills: Map<string, Skill> = new Map();
  private learnedSkills: Map<string, Set<string>> = new Map(); // entityId -> skillIds
  private activeSkills: Map<string, ActiveSkill[]> = new Map(); // entityId -> active skill states
  private listeners: Set<(entityId: string, skillId: string) => void> = new Set();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeDefaultSkills();
  }

  registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getSkillsByType(type: SkillType): Skill[] {
    return this.getAllSkills().filter(s => s.type === type);
  }

  getSkillsByElement(element: SkillElement): Skill[] {
    return this.getAllSkills().filter(s => s.element === element);
  }

  learnSkill(entityId: string, skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    if (!this.learnedSkills.has(entityId)) {
      this.learnedSkills.set(entityId, new Set());
    }

    const learned = this.learnedSkills.get(entityId)!;
    if (learned.has(skillId)) return false;

    learned.add(skillId);
    
    if (!this.activeSkills.has(entityId)) {
      this.activeSkills.set(entityId, []);
    }

    this.eventBus.emit('skill:learn', { entityId, skillId, skill });
    this.listeners.forEach(cb => cb(entityId, skillId));
    return true;
  }

  forgetSkill(entityId: string, skillId: string): boolean {
    const learned = this.learnedSkills.get(entityId);
    if (!learned?.has(skillId)) return false;

    learned.delete(skillId);
    return true;
  }

  hasSkill(entityId: string, skillId: string): boolean {
    return this.learnedSkills.get(entityId)?.has(skillId) || false;
  }

  getLearnedSkills(entityId: string): Skill[] {
    const learned = this.learnedSkills.get(entityId);
    if (!learned) return [];
    return Array.from(learned).map(id => this.skills.get(id)!).filter(Boolean);
  }

  canUseSkill(entityId: string, skillId: string, stats: EntityStats): { canUse: boolean; reason?: string } {
    const skill = this.skills.get(skillId);
    if (!skill) return { canUse: false, reason: 'Skill not found' };

    if (!this.hasSkill(entityId, skillId)) {
      return { canUse: false, reason: 'Skill not learned' };
    }

    if (skill.requiredLevel > stats.level) {
      return { canUse: false, reason: `Requires level ${skill.requiredLevel}` };
    }

    if (skill.costs.mana && stats.currentMana < skill.costs.mana) {
      return { canUse: false, reason: 'Not enough mana' };
    }

    if (skill.costs.health && stats.currentHealth < skill.costs.health) {
      return { canUse: false, reason: 'Not enough health' };
    }

    // Check cooldown
    const activeSkill = this.getActiveSkillState(entityId, skillId);
    if (activeSkill && activeSkill.currentCooldown > 0) {
      return { canUse: false, reason: `Cooldown: ${activeSkill.currentCooldown.toFixed(1)}s` };
    }

    return { canUse: true };
  }

  useSkill(entityId: string, skillId: string, targetId?: string, targetPosition?: { x: number; y: number }): boolean {
    const skill = this.skills.get(skillId);
    if (!skill) return false;

    // Start cooldown
    this.startCooldown(entityId, skillId, skill.cooldown);

    this.eventBus.emit('skill:cast', {
      entityId,
      skillId,
      skill,
      targetId,
      targetPosition
    });

    return true;
  }

  private getActiveSkillState(entityId: string, skillId: string): ActiveSkill | undefined {
    const activeList = this.activeSkills.get(entityId);
    return activeList?.find(s => s.skillId === skillId);
  }

  private startCooldown(entityId: string, skillId: string, duration: number): void {
    if (!this.activeSkills.has(entityId)) {
      this.activeSkills.set(entityId, []);
    }

    let state = this.getActiveSkillState(entityId, skillId);
    if (!state) {
      state = { skillId, currentCooldown: 0, isActive: false };
      this.activeSkills.get(entityId)!.push(state);
    }

    state.currentCooldown = duration;
    state.isActive = true;
  }

  update(deltaTime: number): void {
    // Reduce cooldowns
    for (const [entityId, activeList] of this.activeSkills) {
      for (const skill of activeList) {
        if (skill.currentCooldown > 0) {
          skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime);
          if (skill.currentCooldown === 0) {
            skill.isActive = false;
          }
        }
      }
    }
  }

  getCooldown(entityId: string, skillId: string): number {
    return this.getActiveSkillState(entityId, skillId)?.currentCooldown || 0;
  }

  onSkillLearn(callback: (entityId: string, skillId: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private initializeDefaultSkills(): void {
    // Warrior Skills
    this.registerSkill({
      id: 'skill_power_strike',
      name: 'Power Strike',
      description: 'A powerful attack that deals increased damage.',
      type: 'active',
      target: 'single_enemy',
      element: 'physical',
      costs: { mana: 10 },
      effects: [{ type: 'damage', value: 30, element: 'physical' }],
      cooldown: 3,
      range: 1.5,
      icon: 'skill_power_strike',
      requiredLevel: 1
    });

    this.registerSkill({
      id: 'skill_shield_bash',
      name: 'Shield Bash',
      description: 'Bash enemies with your shield, dealing damage and stunning them briefly.',
      type: 'active',
      target: 'single_enemy',
      element: 'physical',
      costs: { mana: 15 },
      effects: [
        { type: 'damage', value: 15, element: 'physical' },
        { type: 'debuff', value: 2, duration: 2 }
      ],
      cooldown: 5,
      range: 1,
      icon: 'skill_shield_bash',
      requiredLevel: 3
    });

    this.registerSkill({
      id: 'skill_battle_cry',
      name: 'Battle Cry',
      description: 'A war cry that boosts ally attack power.',
      type: 'active',
      target: 'all_allies',
      element: 'physical',
      costs: { mana: 20 },
      effects: [{ type: 'buff', value: 20, duration: 30, tickRate: 1 }],
      cooldown: 15,
      range: 0,
      areaOfEffect: 5,
      icon: 'skill_battle_cry',
      requiredLevel: 5
    });

    // Mage Skills
    this.registerSkill({
      id: 'skill_fireball',
      name: 'Fireball',
      description: 'Hurl a ball of fire at your enemies.',
      type: 'active',
      target: 'single_enemy',
      element: 'fire',
      costs: { mana: 15 },
      effects: [{ type: 'damage', value: 40, element: 'fire' }],
      cooldown: 4,
      range: 8,
      animation: 'fireball',
      icon: 'skill_fireball',
      requiredLevel: 1
    });

    this.registerSkill({
      id: 'skill_frost_nova',
      name: 'Frost Nova',
      description: 'Release a burst of cold energy, damaging and slowing all nearby enemies.',
      type: 'active',
      target: 'area',
      element: 'ice',
      costs: { mana: 30 },
      effects: [
        { type: 'damage', value: 25, element: 'ice' },
        { type: 'debuff', value: 50, duration: 5, element: 'ice' }
      ],
      cooldown: 12,
      range: 0,
      areaOfEffect: 3,
      animation: 'frost_nova',
      icon: 'skill_frost_nova',
      requiredLevel: 3
    });

    this.registerSkill({
      id: 'skill_lightning_bolt',
      name: 'Lightning Bolt',
      description: 'Strike an enemy with a bolt of lightning.',
      type: 'active',
      target: 'single_enemy',
      element: 'lightning',
      costs: { mana: 25 },
      effects: [{ type: 'damage', value: 60, element: 'lightning' }],
      cooldown: 6,
      range: 10,
      animation: 'lightning',
      icon: 'skill_lightning',
      requiredLevel: 5
    });

    this.registerSkill({
      id: 'skill_heal',
      name: 'Heal',
      description: 'Restore health to yourself or an ally.',
      type: 'active',
      target: 'single_ally',
      element: 'light',
      costs: { mana: 20 },
      effects: [{ type: 'heal', value: 50 }],
      cooldown: 8,
      range: 6,
      animation: 'heal',
      icon: 'skill_heal',
      requiredLevel: 1
    });

    this.registerSkill({
      id: 'skill_divine_shield',
      name: 'Divine Shield',
      description: 'Create a protective barrier that absorbs damage.',
      type: 'active',
      target: 'self',
      element: 'light',
      costs: { mana: 40 },
      effects: [{ type: 'shield', value: 100, duration: 10 }],
      cooldown: 30,
      range: 0,
      icon: 'skill_divine_shield',
      requiredLevel: 8
    });

    // Rogue Skills
    this.registerSkill({
      id: 'skill_backstab',
      name: 'Backstab',
      description: 'Attack from behind for critical damage.',
      type: 'active',
      target: 'single_enemy',
      element: 'physical',
      costs: { mana: 10, stamina: 10 },
      effects: [{ type: 'damage', value: 50, element: 'physical' }],
      cooldown: 4,
      range: 1,
      icon: 'skill_backstab',
      requiredLevel: 1
    });

    this.registerSkill({
      id: 'skill_shadow_step',
      name: 'Shadow Step',
      description: 'Teleport behind the target enemy.',
      type: 'active',
      target: 'single_enemy',
      element: 'dark',
      costs: { mana: 15 },
      effects: [{ type: 'teleport', value: 0 }],
      cooldown: 8,
      range: 10,
      icon: 'skill_shadow_step',
      requiredLevel: 3
    });

    this.registerSkill({
      id: 'skill_smoke_bomb',
      name: 'Smoke Bomb',
      description: 'Create a cloud of smoke, allowing you to flee or reposition.',
      type: 'active',
      target: 'self',
      element: 'neutral',
      costs: { mana: 10 },
      effects: [{ type: 'buff', value: 100, duration: 5 }],
      cooldown: 20,
      range: 0,
      icon: 'skill_smoke_bomb',
      requiredLevel: 5
    });

    // Passive Skills
    this.registerSkill({
      id: 'skill_iron_skin',
      name: 'Iron Skin',
      description: 'Permanently increase your defense.',
      type: 'passive',
      target: 'self',
      element: 'neutral',
      costs: {},
      effects: [{ type: 'buff', value: 5 }],
      cooldown: 0,
      range: 0,
      icon: 'skill_iron_skin',
      requiredLevel: 1
    });

    this.registerSkill({
      id: 'skill_quick_feet',
      name: 'Quick Feet',
      description: 'Permanently increase your speed.',
      type: 'passive',
      target: 'self',
      element: 'neutral',
      costs: {},
      effects: [{ type: 'buff', value: 3 }],
      cooldown: 0,
      range: 0,
      icon: 'skill_quick_feet',
      requiredLevel: 1
    });

    this.registerSkill({
      id: 'skill_lucky',
      name: 'Lucky',
      description: 'Permanently increase your luck.',
      type: 'passive',
      target: 'self',
      element: 'neutral',
      costs: {},
      effects: [{ type: 'buff', value: 5 }],
      cooldown: 0,
      range: 0,
      icon: 'skill_lucky',
      requiredLevel: 5
    });
  }
}
