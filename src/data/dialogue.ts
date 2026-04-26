/**
 * NPC Dialogue System
 */

export interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited';
}

export interface DialogueBranch {
  text: string;
  next: string | null;
  action?: string;
}

export interface Dialogue {
  id: string;
  npcId: string;
  lines: DialogueLine[];
  branches?: Record<string, DialogueBranch>;
  questUnlock?: string;
}

export const DIALOGUES: Record<string, Dialogue> = {
  // Village Elder dialogue
  elder_greeting: {
    id: 'elder_greeting',
    npcId: 'elder',
    lines: [
      { speaker: 'Elder', text: 'Welcome, young adventurer!', emotion: 'happy' },
      { speaker: 'Elder', text: 'The village has been troubled by monsters lately.', emotion: 'sad' },
      { speaker: 'Elder', text: 'Perhaps you could help us deal with the goblin threat?', emotion: 'neutral' }
    ],
    branches: {
      yes: { text: 'I will help!', next: 'elder_accept' },
      no: { text: 'Not now, sorry.', next: 'elder_decline' }
    },
    questUnlock: 'quest_goblin_trouble'
  },
  elder_accept: {
    id: 'elder_accept',
    npcId: 'elder',
    lines: [
      { speaker: 'Elder', text: 'Thank you, brave hero!', emotion: 'happy' },
      { speaker: 'Elder', text: 'The goblins have been spotted in the eastern woods.', emotion: 'neutral' }
    ]
  },
  elder_decline: {
    id: 'elder_decline',
    npcId: 'elder',
    lines: [
      { speaker: 'Elder', text: 'I understand. Take your time.', emotion: 'neutral' },
      { speaker: 'Elder', text: 'We will be here when you are ready.', emotion: 'happy' }
    ]
  },
  elder_quest_complete: {
    id: 'elder_quest_complete',
    npcId: 'elder',
    lines: [
      { speaker: 'Elder', text: 'You have done it! The goblins are gone!', emotion: 'excited' },
      { speaker: 'Elder', text: 'The village is forever grateful.', emotion: 'happy' }
    ]
  },

  // Shopkeeper dialogue
  shopkeeper_greeting: {
    id: 'shopkeeper_greeting',
    npcId: 'shopkeeper',
    lines: [
      { speaker: 'Shopkeeper', text: 'Welcome to my shop!', emotion: 'happy' },
      { speaker: 'Shopkeeper', text: 'Take a look at my wares. Best prices in town!', emotion: 'neutral' }
    ]
  },
  shopkeeper_thanks: {
    id: 'shopkeeper_thanks',
    npcId: 'shopkeeper',
    lines: [
      { speaker: 'Shopkeeper', text: 'Thanks for your business!', emotion: 'happy' },
      { speaker: 'Shopkeeper', text: 'Come back anytime!', emotion: 'neutral' }
    ]
  },

  // Healer dialogue
  healer_greeting: {
    id: 'healer_greeting',
    npcId: 'healer',
    lines: [
      { speaker: 'Healer', text: 'Blessings upon you, traveler.', emotion: 'neutral' },
      { speaker: 'Healer', text: 'Do you need healing? I can restore your health.', emotion: 'happy' }
    ]
  },
  healer_blessing: {
    id: 'healer_blessing',
    npcId: 'healer',
    lines: [
      { speaker: 'Healer', text: 'May the light guide your path.', emotion: 'neutral' },
      { speaker: 'Healer', text: 'Go forth and defeat the darkness!', emotion: 'excited' }
    ]
  },

  // Generic NPC
  villager_greeting: {
    id: 'villager_greeting',
    npcId: 'villager',
    lines: [
      { speaker: 'Villager', text: 'Hello there!', emotion: 'neutral' },
      { speaker: 'Villager', text: 'Stay safe out there. Monsters roam the lands.', emotion: 'sad' }
    ]
  }
};

export const DIALOGUE_LIST = Object.values(DIALOGUES);

export function getDialogue(id: string): Dialogue | undefined {
  return DIALOGUES[id];
}

export function getNPCDialogue(npcId: string): Dialogue[] {
  return DIALOGUE_LIST.filter(d => d.npcId === npcId);
}
