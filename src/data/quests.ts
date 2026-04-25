/**
 * Quest Database - Extended Quests
 */

export interface QuestStep {
  description: string;
  objective: {
    type: 'kill' | 'collect' | 'talk' | 'reach' | 'escort' | 'defend';
    target: string;
    count: number;
  };
  rewards?: {
    gold?: number;
    exp?: number;
    items?: { id: string; quantity: number }[];
  };
}

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'event';
  zone?: string;
  
  // Requirements
  level?: number;
  prerequisites?: string[];
  
  // Steps
  steps: QuestStep[];
  
  // Rewards
  rewards: {
    gold: number;
    exp: number;
    items?: { id: string; quantity: number }[];
  };
  
  // Settings
  repeatable?: boolean;
  timeLimit?: number; // seconds
}

export const QUESTS: Record<string, QuestDefinition> = {
  // ============ MAIN STORY QUESTS ============
  quest_main_1: {
    id: 'quest_main_1',
    name: 'The Beginning',
    description: 'Your adventure starts here. Speak with the village mentor.',
    type: 'main',
    steps: [
      {
        description: 'Visit the Village Mentor',
        objective: { type: 'talk', target: 'npc_mentor', count: 1 }
      },
      {
        description: 'Learn about the village',
        objective: { type: 'talk', target: 'npc_mentor', count: 1 }
      }
    ],
    rewards: { gold: 50, exp: 100 }
  },
  
  quest_main_2: {
    id: 'quest_main_2',
    name: 'First Steps',
    description: 'Visit the shops to gather supplies for your journey.',
    type: 'main',
    level: 1,
    prerequisites: ['quest_main_1'],
    steps: [
      {
        description: 'Visit the General Store',
        objective: { type: 'talk', target: 'npc_shopkeeper', count: 1 }
      },
      {
        description: 'Buy a health potion',
        objective: { type: 'collect', target: 'potion_health_small', count: 1 },
        rewards: { gold: 25 }
      },
      {
        description: 'Visit the Weapon Shop',
        objective: { type: 'talk', target: 'npc_blacksmith', count: 1 }
      }
    ],
    rewards: { gold: 75, exp: 150 }
  },
  
  quest_main_3: {
    id: 'quest_main_3',
    name: 'Into the Forest',
    description: 'The mentor suggests you explore the forest to gain experience.',
    type: 'main',
    level: 2,
    prerequisites: ['quest_main_2'],
    steps: [
      {
        description: 'Travel to the Forest Zone',
        objective: { type: 'reach', target: 'zone_forest', count: 1 }
      },
      {
        description: 'Defeat 5 Green Slimes',
        objective: { type: 'kill', target: 'slime_green', count: 5 }
      },
      {
        description: 'Return to the Mentor',
        objective: { type: 'talk', target: 'npc_mentor', count: 1 }
      }
    ],
    rewards: { 
      gold: 150, 
      exp: 300,
      items: [{ id: 'weapon_wooden_sword', quantity: 1 }]
    }
  },
  
  quest_main_4: {
    id: 'quest_main_4',
    name: 'Goblin Threat',
    description: 'The village is being threatened by goblins. Help defend it!',
    type: 'main',
    level: 3,
    prerequisites: ['quest_main_3'],
    steps: [
      {
        description: 'Speak with the Guard',
        objective: { type: 'talk', target: 'npc_guard', count: 1 }
      },
      {
        description: 'Defeat 3 Goblins',
        objective: { type: 'kill', target: 'goblin', count: 3 }
      },
      {
        description: 'Return to the Guard',
        objective: { type: 'talk', target: 'npc_guard', count: 1 }
      }
    ],
    rewards: { gold: 250, exp: 400 }
  },
  
  quest_main_5: {
    id: 'quest_main_5',
    name: 'The Dark Forest',
    description: 'Venture deeper into the forest where darker threats lurk.',
    type: 'main',
    level: 5,
    prerequisites: ['quest_main_4'],
    steps: [
      {
        description: 'Enter the Dark Forest',
        objective: { type: 'reach', target: 'zone_forest_dark', count: 1 }
      },
      {
        description: 'Defeat the Goblin Shaman',
        objective: { type: 'kill', target: 'goblin_shaman', count: 1 }
      },
      {
        description: 'Collect Shaman Trophy',
        objective: { type: 'collect', target: 'material_shaman_trophy', count: 1 }
      },
      {
        description: 'Return to Village',
        objective: { type: 'talk', target: 'npc_mentor', count: 1 }
      }
    ],
    rewards: { 
      gold: 500, 
      exp: 600,
      items: [{ id: 'armor_leather', quantity: 1 }]
    }
  },
  
  // ============ SIDE QUESTS ============
  quest_side_1: {
    id: 'quest_side_1',
    name: 'Slime Hunt',
    description: 'The alchemist needs slime materials for potions.',
    type: 'side',
    level: 1,
    steps: [
      {
        description: 'Collect 10 Green Slime Gel',
        objective: { type: 'collect', target: 'material_gel', count: 10 }
      }
    ],
    rewards: { gold: 80, exp: 120 }
  },
  
  quest_side_2: {
    id: 'quest_side_2',
    name: 'Wolf Problem',
    description: 'Wolves have been attacking the livestock.',
    type: 'side',
    level: 3,
    steps: [
      {
        description: 'Hunt 5 Wild Wolves',
        objective: { type: 'kill', target: 'wolf', count: 5 }
      },
      {
        description: 'Collect Wolf Pelts',
        objective: { type: 'collect', target: 'material_wolf_pelt', count: 5 }
      }
    ],
    rewards: { 
      gold: 150, 
      exp: 200,
      items: [{ id: 'potion_health_medium', quantity: 2 }]
    }
  },
  
  quest_side_3: {
    id: 'quest_side_3',
    name: 'Rare Ingredients',
    description: 'The potion shop needs rare materials for powerful potions.',
    type: 'side',
    level: 4,
    steps: [
      {
        description: 'Collect Ice Essence from Blue Slimes',
        objective: { type: 'collect', target: 'material_ice_essence', count: 3 }
      },
      {
        description: 'Collect Spider Silk',
        objective: { type: 'collect', target: 'material_spider_silk', count: 5 }
      }
    ],
    rewards: { 
      gold: 200, 
      exp: 250,
      items: [{ id: 'potion_mana_medium', quantity: 2 }]
    }
  },
  
  quest_side_4: {
    id: 'quest_side_4',
    name: 'Bones of the Ancients',
    description: 'The mage needs bone materials for research.',
    type: 'side',
    level: 6,
    steps: [
      {
        description: 'Defeat Skeleton Warriors in the Cave',
        objective: { type: 'kill', target: 'skeleton', count: 5 }
      },
      {
        description: 'Collect Ancient Bones',
        objective: { type: 'collect', target: 'material_bone', count: 8 }
      }
    ],
    rewards: { 
      gold: 300, 
      exp: 400,
      items: [{ id: 'scroll_fireball', quantity: 1 }]
    }
  },
  
  quest_side_5: {
    id: 'quest_side_5',
    name: 'Dungeon Delve',
    description: 'Explore the cave dungeon and defeat its guardian.',
    type: 'side',
    level: 8,
    steps: [
      {
        description: 'Enter the Cave Dungeon',
        objective: { type: 'reach', target: 'zone_dungeon', count: 1 }
      },
      {
        description: 'Defeat the Skeleton Mage',
        objective: { type: 'kill', target: 'skeleton_mage', count: 1 }
      },
      {
        description: 'Collect Dark Essence',
        objective: { type: 'collect', target: 'material_dark_essence', count: 3 }
      }
    ],
    rewards: { 
      gold: 500, 
      exp: 600,
      items: [{ id: 'weapon_iron_staff', quantity: 1 }]
    }
  },
  
  // ============ DAILY QUESTS ============
  quest_daily_hunt: {
    id: 'quest_daily_hunt',
    name: 'Daily Hunt',
    description: 'Hunt monsters for the village defense.',
    type: 'daily',
    steps: [
      {
        description: 'Defeat any 10 monsters',
        objective: { type: 'kill', target: 'any', count: 10 }
      }
    ],
    rewards: { gold: 100, exp: 150 },
    repeatable: true,
    timeLimit: 86400 // 24 hours
  },
  
  quest_daily_gather: {
    id: 'quest_daily_gather',
    name: 'Daily Gathering',
    description: 'Collect materials for the village craftspeople.',
    type: 'daily',
    steps: [
      {
        description: 'Collect 5 materials of any type',
        objective: { type: 'collect', target: 'any_material', count: 5 }
      }
    ],
    rewards: { gold: 75, exp: 100 },
    repeatable: true,
    timeLimit: 86400
  },
  
  // ============ BOSS QUESTS ============
  quest_boss_slime_king: {
    id: 'quest_boss_slime_king',
    name: 'The Slime King',
    description: 'A massive slime has emerged from the depths. Defeat it!',
    type: 'main',
    level: 10,
    prerequisites: ['quest_main_5'],
    steps: [
      {
        description: 'Find the Slime King in the Forest Depths',
        objective: { type: 'reach', target: 'zone_boss_lair', count: 1 }
      },
      {
        description: 'Defeat the Slime King',
        objective: { type: 'kill', target: 'slime_king', count: 1 }
      }
    ],
    rewards: { 
      gold: 1000, 
      exp: 1500,
      items: [
        { id: 'weapon_steel_sword', quantity: 1 },
        { id: 'potion_health_large', quantity: 3 }
      ]
    }
  },
  
  quest_boss_goblin_chief: {
    id: 'quest_boss_goblin_chief',
    name: 'Goblin War',
    description: 'The goblins have a new leader. End the war!',
    type: 'main',
    level: 12,
    prerequisites: ['quest_boss_slime_king'],
    steps: [
      {
        description: 'Storm the Goblin Camp',
        objective: { type: 'reach', target: 'zone_goblin_camp', count: 1 }
      },
      {
        description: 'Defeat the Goblin Chief',
        objective: { type: 'kill', target: 'goblin_chief', count: 1 }
      }
    ],
    rewards: { 
      gold: 2000, 
      exp: 2500,
      items: [
        { id: 'weapon_steel_greatsword', quantity: 1 },
        { id: 'armor_chain', quantity: 1 }
      ]
    }
  }
};

/**
 * Get all quests
 */
export function getAllQuests(): QuestDefinition[] {
  return Object.values(QUESTS);
}

/**
 * Get quest by ID
 */
export function getQuest(id: string): QuestDefinition | null {
  return QUESTS[id] || null;
}

/**
 * Get quests by type
 */
export function getQuestsByType(type: string): QuestDefinition[] {
  return Object.values(QUESTS).filter(q => q.type === type);
}

/**
 * Get quests for a zone
 */
export function getQuestsForZone(zoneId: string): QuestDefinition[] {
  return Object.values(QUESTS).filter(q => q.zone === zoneId);
}

/**
 * Check quest prerequisites
 */
export function meetsPrerequisites(
  quest: QuestDefinition,
  completedQuests: string[]
): boolean {
  if (!quest.prerequisites) return true;
  return quest.prerequisites.every(p => completedQuests.includes(p));
}
