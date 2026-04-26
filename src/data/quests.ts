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
  }
};

export const QUEST_LIST = Object.values(QUESTS);

export function getQuest(id: string): Quest | undefined {
  return QUESTS[id];
}

export function getActiveQuests(): Quest[] {
  return QUEST_LIST.filter(q => !q.isRepeatable).slice(0, 3);
}
