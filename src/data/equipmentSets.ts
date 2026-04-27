/**
 * Equipment Sets - Set bonuses for collecting complete sets
 */

export interface EquipmentSet {
  id: string;
  name: string;
  pieces: string[]; // Equipment IDs that belong to this set
  bonus: {
    pieces: number; // Number of pieces needed for bonus
    stats: {
      attack?: number;
      defense?: number;
      health?: number;
      mana?: number;
      speed?: number;
      critChance?: number;
      critMultiplier?: number;
    };
    name: string; // Bonus name
    description: string;
  }[];
}

export const EQUIPMENT_SETS: Record<string, EquipmentSet> = {
  steel_warrior: {
    id: 'steel_warrior',
    name: 'Steel Warrior',
    pieces: ['weapon_steel_sword', 'armor_steel_chest', 'armor_steel_helmet'],
    bonus: [
      {
        pieces: 2,
        stats: { attack: 10, critChance: 0.05 },
        name: 'Steel Strike',
        description: '+10 Attack, +5% Crit Chance'
      },
      {
        pieces: 3,
        stats: { attack: 25, critChance: 0.1, critMultiplier: 0.2 },
        name: 'Steel Fury',
        description: '+25 Attack, +10% Crit, +20% Crit Damage'
      }
    ]
  },

  iron_knight: {
    id: 'iron_knight',
    name: 'Iron Knight',
    pieces: ['weapon_iron_sword', 'armor_iron_chest', 'armor_iron_shield'],
    bonus: [
      {
        pieces: 2,
        stats: { defense: 15 },
        name: 'Iron Guard',
        description: '+15 Defense'
      },
      {
        pieces: 3,
        stats: { defense: 30, health: 50 },
        name: 'Fortress',
        description: '+30 Defense, +50 HP'
      }
    ]
  },

  arcane_mage: {
    id: 'arcane_mage',
    name: 'Arcane Mage',
    pieces: ['weapon_arcane_staff', 'armor_arcane_robes', 'accessory_arcane_amulet'],
    bonus: [
      {
        pieces: 2,
        stats: { mana: 50, critChance: 0.08 },
        name: 'Arcane Focus',
        description: '+50 Mana, +8% Crit'
      },
      {
        pieces: 3,
        stats: { mana: 100, critChance: 0.15, critMultiplier: 0.3 },
        name: 'Archmage',
        description: '+100 Mana, +15% Crit, +30% Crit Damage'
      }
    ]
  },

  forest_ranger: {
    id: 'forest_ranger',
    name: 'Forest Ranger',
    pieces: ['weapon_longbow', 'armor_leather_chest', 'accessory_ranger_ring'],
    bonus: [
      {
        pieces: 2,
        stats: { speed: 10, critChance: 0.08 },
        name: 'Swift Hunter',
        description: '+10 Speed, +8% Crit'
      },
      {
        pieces: 3,
        stats: { speed: 20, critChance: 0.15, attack: 15 },
        name: 'Master Tracker',
        description: '+20 Speed, +15% Crit, +15 Attack'
      }
    ]
  },

  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    pieces: ['weapon_dragon_spear', 'armor_dragon_scale', 'armor_dragon_helm', 'accessory_dragon_necklace'],
    bonus: [
      {
        pieces: 2,
        stats: { attack: 20, critChance: 0.1 },
        name: 'Dragon Hunter',
        description: '+20 Attack, +10% Crit'
      },
      {
        pieces: 3,
        stats: { attack: 40, critChance: 0.15, critMultiplier: 0.25 },
        name: 'Wyrmslayer',
        description: '+40 Attack, +15% Crit, +25% Crit Damage'
      },
      {
        pieces: 4,
        stats: { attack: 60, critChance: 0.2, critMultiplier: 0.5, health: 100 },
        name: 'Dragon Master',
        description: '+60 Attack, +20% Crit, +50% Crit Damage, +100 HP'
      }
    ]
  },

  nature_walker: {
    id: 'nature_walker',
    name: 'Nature Walker',
    pieces: ['weapon_nature_staff', 'armor_nature_vest', 'accessory_nature_ring'],
    bonus: [
      {
        pieces: 2,
        stats: { health: 40, defense: 10 },
        name: 'Natures Blessing',
        description: '+40 HP, +10 Defense'
      },
      {
        pieces: 3,
        stats: { health: 80, defense: 20, mana: 30 },
        name: 'Forest Spirit',
        description: '+80 HP, +20 Defense, +30 Mana'
      }
    ]
  },

  shadow_assassin: {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    pieces: ['weapon_shadow_dagger', 'armor_shadow_cloak', 'accessory_shadow_ring'],
    bonus: [
      {
        pieces: 2,
        stats: { speed: 15, critChance: 0.12 },
        name: 'Silent Strike',
        description: '+15 Speed, +12% Crit'
      },
      {
        pieces: 3,
        stats: { speed: 30, critChance: 0.2, critMultiplier: 0.4 },
        name: 'Deaths Hand',
        description: '+30 Speed, +20% Crit, +40% Crit Damage'
      }
    ]
  },
  
  // Holy warrior set
  holy_warrior: {
    id: 'holy_warrior',
    name: 'Holy Warrior',
    pieces: ['armor_holy_plate', 'accessory_holy_crown', 'accessory_ice_crystal'],
    bonus: [
      {
        pieces: 2,
        stats: { defense: 15, health: 50 },
        name: 'Divine Shield',
        description: '+15 Defense, +50 Health'
      },
      {
        pieces: 3,
        stats: { defense: 30, health: 100, attack: 15 },
        name: 'Holy Retribution',
        description: '+30 Defense, +100 Health, +15 Attack'
      }
    ]
  }
};

export const SET_LIST = Object.values(EQUIPMENT_SETS);

/**
 * Get set by ID
 */
export function getSet(id: string): EquipmentSet | undefined {
  return EQUIPMENT_SETS[id];
}

/**
 * Get set for an equipment piece
 */
export function getSetForPiece(equipmentId: string): EquipmentSet | undefined {
  for (const set of SET_LIST) {
    if (set.pieces.includes(equipmentId)) {
      return set;
    }
  }
  return undefined;
}

/**
 * Calculate active set bonuses based on equipped items
 */
export function calculateSetBonuses(equippedItems: string[]): { setId: string; bonus: EquipmentSet['bonus'][0] }[] {
  const activeBonuses: { setId: string; bonus: EquipmentSet['bonus'][0] }[] = [];
  
  for (const set of SET_LIST) {
    const equippedPieces = set.pieces.filter(p => equippedItems.includes(p));
    const pieceCount = equippedPieces.length;
    
    // Find the highest bonus that's active
    for (const bonus of set.bonus) {
      if (pieceCount >= bonus.pieces) {
        activeBonuses.push({ setId: set.id, bonus });
      }
    }
  }
  
  return activeBonuses;
}
