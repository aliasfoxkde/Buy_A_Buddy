/**
 * Combat Skills System
 */

export type SkillType = 'attack' | 'defense' | 'heal' | 'buff' | 'special' | 'debuff';

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  damage?: number;
  healAmount?: number;
  healOverTime?: number;
  defenseBonus?: number;
  manaCost: number;
  cooldown: number; // in turns
  icon: string;
  targetSelf?: boolean;
  effect?: string; // For effects like burn, freeze, stun, poison
  duration?: number; // For duration-based effects
}

export const SKILLS: Record<string, Skill> = {
  // Basic Attack Skills
  power_strike: {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'A powerful attack dealing extra damage.',
    type: 'attack',
    damage: 1.5, // Multiplier
    manaCost: 0,
    cooldown: 0,
    icon: '⚔️'
  },
  
  quick_attack: {
    id: 'quick_attack',
    name: 'Quick Attack',
    description: 'A fast attack that strikes first.',
    type: 'attack',
    damage: 0.8, // Less damage but always goes first
    manaCost: 0,
    cooldown: 1,
    icon: '💨'
  },
  
  // Defense Skills
  guard: {
    id: 'guard',
    name: 'Guard',
    description: 'Brace for impact. Reduces damage taken.',
    type: 'defense',
    defenseBonus: 0.5, // 50% more defense
    manaCost: 5,
    cooldown: 2,
    icon: '🛡️'
  },
  
  iron_will: {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Greatly increases defense for one turn.',
    type: 'defense',
    defenseBonus: 1.0, // 100% more defense
    manaCost: 10,
    cooldown: 3,
    icon: '🛡️'
  },
  
  // Heal Skills
  heal: {
    id: 'heal',
    name: 'Heal',
    description: 'Restore a small amount of health.',
    type: 'heal',
    healAmount: 30,
    manaCost: 15,
    cooldown: 3,
    icon: '💚',
    targetSelf: true
  },
  
  greater_heal: {
    id: 'greater_heal',
    name: 'Greater Heal',
    description: 'Restore a medium amount of health.',
    type: 'heal',
    healAmount: 60,
    manaCost: 25,
    cooldown: 4,
    icon: '💖',
    targetSelf: true
  },
  
  // Buff Skills
  strength_buff: {
    id: 'strength_buff',
    name: 'Strength',
    description: 'Increases attack power.',
    type: 'buff',
    damage: 0.25, // 25% more damage
    manaCost: 10,
    cooldown: 3,
    icon: '💪'
  },
  
  // Special Skills
  critical_hit: {
    id: 'critical_hit',
    name: 'Critical Hit',
    description: 'Chance to deal double damage.',
    type: 'special',
    damage: 2.0, // 200% damage if crit
    manaCost: 20,
    cooldown: 4,
    icon: '🎯'
  },
  
  slash: {
    id: 'slash',
    name: 'Slash',
    description: 'A slashing attack that deals moderate damage.',
    type: 'attack',
    damage: 1.2,
    manaCost: 0,
    cooldown: 0,
    icon: '🗡️'
  },
  
  // Elemental Attack Skills
  flame_strike: {
    id: 'flame_strike',
    name: 'Flame Strike',
    description: 'Deals fire damage and may burn.',
    type: 'attack',
    damage: 1.5,
    manaCost: 15,
    cooldown: 3,
    icon: '🔥',
    effect: 'burn'
  },
  
  frost_nova: {
    id: 'frost_nova',
    name: 'Frost Nova',
    description: 'Deals ice damage and may freeze.',
    type: 'attack',
    damage: 1.3,
    manaCost: 20,
    cooldown: 4,
    icon: '❄️',
    effect: 'freeze'
  },
  
  thunder_strike: {
    id: 'thunder_strike',
    name: 'Thunder Strike',
    description: 'Lightning attack with chance to stun.',
    type: 'attack',
    damage: 1.6,
    manaCost: 18,
    cooldown: 3,
    icon: '⚡',
    effect: 'stun'
  },
  
  // Debuff Skills
  poison_blade: {
    id: 'poison_blade',
    name: 'Poison Blade',
    description: 'Attack that poisons the enemy.',
    type: 'attack',
    damage: 0.8,
    manaCost: 12,
    cooldown: 2,
    icon: '🧪',
    effect: 'poison'
  },
  
  weaken: {
    id: 'weaken',
    name: 'Weaken',
    description: 'Reduces enemy attack power.',
    type: 'debuff',
    manaCost: 10,
    cooldown: 3,
    icon: '💀'
  },
  
  // Buff Skills
  regeneration: {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Heals over time.',
    type: 'heal',
    healAmount: 10,
    healOverTime: 5,
    duration: 15,
    manaCost: 20,
    cooldown: 5,
    icon: '💚'
  }
};

// Character class skill assignments
export const CLASS_SKILLS: Record<string, string[]> = {
  warrior: ['power_strike', 'flame_strike', 'guard', 'iron_will', 'slash'],
  mage: ['quick_attack', 'heal', 'greater_heal', 'frost_nova', 'thunder_strike'],
  ranger: ['quick_attack', 'slash', 'poison_blade', 'critical_hit', 'weaken'],
  default: ['power_strike', 'flame_strike', 'guard', 'heal', 'regeneration']
};

export function getSkill(id: string): Skill | undefined {
  return SKILLS[id];
}

export function getClassSkills(charClass: string): Skill[] {
  const skillIds = CLASS_SKILLS[charClass] || CLASS_SKILLS.default;
  return skillIds.map(id => SKILLS[id]).filter(Boolean);
}