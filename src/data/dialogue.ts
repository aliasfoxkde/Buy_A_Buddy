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
  action?: string;
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
    ],
    branches: {
      heal: { text: 'Please heal me.', next: 'healer_heal' },
      lore: { text: 'Tell me about this place.', next: 'healer_lore' }
    }
  },
  healer_heal: {
    id: 'healer_heal',
    npcId: 'healer',
    lines: [
      { speaker: 'Healer', text: 'Let me restore your vitality...', emotion: 'neutral' },
      { speaker: 'Healer', text: 'There. Feel better?', emotion: 'happy' }
    ],
    action: 'heal_player'
  },
  healer_lore: {
    id: 'healer_lore',
    npcId: 'healer',
    lines: [
      { speaker: 'Healer', text: 'This village has stood for centuries.', emotion: 'neutral' },
      { speaker: 'Healer', text: 'We were founded by the First Adventurers.', emotion: 'happy' }
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

  // Merchant dialogue
  merchant_greeting: {
    id: 'merchant_greeting',
    npcId: 'merchant',
    lines: [
      { speaker: 'Merchant', text: 'Welcome to my shop!', emotion: 'happy' },
      { speaker: 'Merchant', text: 'Take a look at my finest wares.', emotion: 'neutral' }
    ],
    branches: {
      browse: { text: 'Show me your goods.', next: 'merchant_wares' },
      chat: { text: 'How is business?', next: 'merchant_chat' }
    }
  },
  merchant_wares: {
    id: 'merchant_wares',
    npcId: 'merchant',
    lines: [
      { speaker: 'Merchant', text: 'Here are my finest weapons and armor!', emotion: 'excited' }
    ],
    action: 'open_shop'
  },
  merchant_chat: {
    id: 'merchant_chat',
    npcId: 'merchant',
    lines: [
      { speaker: 'Merchant', text: 'Business is good, thanks to adventurers like you!', emotion: 'happy' },
      { speaker: 'Merchant', text: 'I have heard there is treasure in the old ruins.', emotion: 'neutral' }
    ]
  },

  // Hunter dialogue
  hunter_greeting: {
    id: 'hunter_greeting',
    npcId: 'hunter',
    lines: [
      { speaker: 'Hunter', text: 'Ho there, fellow ranger!', emotion: 'happy' },
      { speaker: 'Hunter', text: 'The forest is full of prey today.', emotion: 'neutral' }
    ],
    branches: {
      hunt: { text: 'I want to hunt.', next: 'hunter_hunt' },
      tips: { text: 'Any hunting tips?', next: 'hunter_tips' }
    }
  },
  hunter_hunt: {
    id: 'hunter_hunt',
    npcId: 'hunter',
    lines: [
      { speaker: 'Hunter', text: 'Head east to find the wolf dens!', emotion: 'happy' },
      { speaker: 'Hunter', text: 'Watch out for the alpha... he is cunning.', emotion: 'angry' }
    ]
  },
  hunter_tips: {
    id: 'hunter_tips',
    npcId: 'hunter',
    lines: [
      { speaker: 'Hunter', text: 'The key to hunting is patience.', emotion: 'neutral' },
      { speaker: 'Hunter', text: 'Wait for the right moment, then strike!', emotion: 'happy' }
    ]
  },

  // Sage dialogue
  sage_greeting: {
    id: 'sage_greeting',
    npcId: 'sage',
    lines: [
      { speaker: 'Sage', text: 'Ah, a seeker of knowledge I see.', emotion: 'neutral' },
      { speaker: 'Sage', text: 'What wisdom do you seek?', emotion: 'happy' }
    ],
    branches: {
      magic: { text: 'Teach me about magic.', next: 'sage_magic' },
      world: { text: 'Tell me about the world.', next: 'sage_world' },
      power: { text: 'How do I grow stronger?', next: 'sage_power' }
    }
  },
  sage_magic: {
    id: 'sage_magic',
    npcId: 'sage',
    lines: [
      { speaker: 'Sage', text: 'Magic flows through all things.', emotion: 'neutral' },
      { speaker: 'Sage', text: 'Fire, ice, lightning... all are expressions of power.', emotion: 'happy' }
    ]
  },
  sage_world: {
    id: 'sage_world',
    npcId: 'sage',
    lines: [
      { speaker: 'Sage', text: 'Many realms exist beyond our own.', emotion: 'neutral' },
      { speaker: 'Sage', text: 'Dragons once ruled the skies.', emotion: 'happy' }
    ]
  },
  sage_power: {
    id: 'sage_power',
    npcId: 'sage',
    lines: [
      { speaker: 'Sage', text: 'True strength comes from equipment and skill.', emotion: 'neutral' },
      { speaker: 'Sage', text: 'Seek the equipment sets for powerful bonuses.', emotion: 'happy' }
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
