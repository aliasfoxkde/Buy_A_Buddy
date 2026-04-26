/**
 * Quest definitions and quest system
 */

export interface QuestObjective {
  type: 'kill' | 'collect' | 'talk' | 'visit';
  targetId: string;
  targetName: string;
  count: number;
  current: number;
}

export interface QuestReward {
  gold?: number;
  experience?: number;
  items?: string[];
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  reward: QuestReward;
  isRepeatable?: boolean;
}

export const QUESTS: Record<string, Quest> = {
  quest_tutorial_1: {
    id: 'quest_tutorial_1',
    name: 'First Steps',
    description: 'Defeat your first enemy to prove your worth.',
    objectives: [
      { type: 'kill', targetId: 'slime', targetName: 'Slimes', count: 1, current: 0 }
    ],
    reward: {
      gold: 50,
      experience: 100,
      items: ['potion_health_medium']
    }
  },
  quest_tutorial_2: {
    id: 'quest_tutorial_2',
    name: 'Monster Slayer',
    description: 'Defeat 3 enemies to become a seasoned adventurer.',
    objectives: [
      { type: 'kill', targetId: 'any', targetName: 'Enemies', count: 3, current: 0 }
    ],
    reward: {
      gold: 100,
      experience: 200
    }
  },
  quest_tutorial_3: {
    id: 'quest_tutorial_3',
    name: 'Wealthy Hero',
    description: 'Collect 500 gold to fund your adventure.',
    objectives: [],
    reward: {
      gold: 200,
      experience: 150
    },
    isRepeatable: true
  },
  quest_goblin_trouble: {
    id: 'quest_goblin_trouble',
    name: 'Goblin Trouble',
    description: 'The forest goblins are causing trouble. Defeat 5 of them.',
    objectives: [
      { type: 'kill', targetId: 'goblin', targetName: 'Goblins', count: 5, current: 0 }
    ],
    reward: {
      gold: 200,
      experience: 300,
      items: ['weapon_iron_sword']
    }
  },
  quest_wolf_pack: {
    id: 'quest_wolf_pack',
    name: 'Pack Hunter',
    description: 'The wolf pack threatens travelers. Eliminate 3 wolves.',
    objectives: [
      { type: 'kill', targetId: 'wolf', targetName: 'Wolves', count: 3, current: 0 }
    ],
    reward: {
      gold: 150,
      experience: 250
    }
  },
  quest_skeleton_king: {
    id: 'quest_skeleton_king',
    name: 'Undead Menace',
    description: 'Bone Walkers have been spotted. Defeat the skeletal threat.',
    objectives: [
      { type: 'kill', targetId: 'skeleton', targetName: 'Bone Walkers', count: 3, current: 0 }
    ],
    reward: {
      gold: 400,
      experience: 500,
      items: ['armor_chainmail']
    }
  },
  quest_spider_nest: {
    id: 'quest_spider_nest',
    name: 'Clear the Caves',
    description: 'Giant spiders have infested the old mines. Clear them out!',
    objectives: [
      { type: 'kill', targetId: 'spider', targetName: 'Giant Spiders', count: 4, current: 0 }
    ],
    reward: {
      gold: 250,
      experience: 350,
      items: ['potion_health_large']
    }
  },
  quest_orc_warrior: {
    id: 'quest_orc_warrior',
    name: 'Orc Invasion',
    description: 'Orc warriors are raiding from the mountains. Stop their attacks!',
    objectives: [
      { type: 'kill', targetId: 'orc', targetName: 'Orc Warriors', count: 3, current: 0 }
    ],
    reward: {
      gold: 350,
      experience: 450,
      items: ['weapon_steel_sword']
    }
  },
  quest_bat_cave: {
    id: 'quest_bat_cave',
    name: 'Cave Dwellers',
    description: 'The bat caves are overflowing. Clear out the flying pests!',
    objectives: [
      { type: 'kill', targetId: 'bat', targetName: 'Cave Bats', count: 5, current: 0 }
    ],
    reward: {
      gold: 150,
      experience: 200
    },
    isRepeatable: true
  },
  quest_snake_pit: {
    id: 'quest_snake_pit',
    name: 'Snake Handler',
    description: 'Venomous snakes have been spotted near the village. Eliminate them!',
    objectives: [
      { type: 'kill', targetId: 'snake', targetName: 'Cave Snakes', count: 4, current: 0 }
    ],
    reward: {
      gold: 200,
      experience: 250,
      items: ['antidote']
    }
  },
  quest_hawk_hunter: {
    id: 'quest_hawk_hunter',
    name: 'Sky Hunters',
    description: 'Hunting hawks are attacking from above. Put an end to their reign!',
    objectives: [
      { type: 'kill', targetId: 'hawk', targetName: 'Hunting Hawks', count: 3, current: 0 }
    ],
    reward: {
      gold: 300,
      experience: 400
    }
  },
  quest_collect_gold: {
    id: 'quest_collect_gold',
    name: 'Gold Collector',
    description: 'Gather gold from your adventures. Every bit counts!',
    objectives: [],
    reward: {
      gold: 500,
      experience: 300
    },
    isRepeatable: true
  },
  quest_troll_slayer: {
    id: 'quest_troll_slayer',
    name: 'Troll Trouble',
    description: 'Forest trolls are blocking the mountain pass. Defeat the tough creatures!',
    objectives: [
      { type: 'kill', targetId: 'troll', targetName: 'Forest Trolls', count: 2, current: 0 }
    ],
    reward: {
      gold: 450,
      experience: 550,
      items: ['armor_mithril']
    }
  }
};

export const QUEST_LIST = Object.values(QUESTS);

export function getQuest(id: string): Quest | undefined {
  return QUESTS[id];
}

export function getActiveQuests(): Quest[] {
  return QUEST_LIST.filter(q => !q.isRepeatable).slice(0, 3);
}
