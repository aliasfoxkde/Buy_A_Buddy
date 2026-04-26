/**
 * Combat Skills System
 */

export type SkillType = 'attack' | 'defense' | 'heal' | 'buff' | 'special';

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  damage?: number;
  healAmount?: number;
  defenseBonus?: number;
  manaCost: number;
  cooldown: number; // in turns
  icon: string;
  targetSelf?: boolean;
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
  }
};

// Character class skill assignments
export const CLASS_SKILLS: Record<string, string[]> = {
  warrior: ['power_strike', 'guard', 'iron_will', 'slash'],
  mage: ['quick_attack', 'heal', 'greater_heal', 'fireball'],
  ranger: ['quick_attack', 'slash', 'strength_buff', 'critical_hit'],
  default: ['power_strike', 'guard', 'heal', 'slash']
};

export function getSkill(id: string): Skill | undefined {
  return SKILLS[id];
}

export function getClassSkills(charClass: string): Skill[] {
  const skillIds = CLASS_SKILLS[charClass] || CLASS_SKILLS.default;
  return skillIds.map(id => SKILLS[id]).filter(Boolean);
}