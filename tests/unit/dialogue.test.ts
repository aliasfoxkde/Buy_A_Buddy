/**
 * Dialogue System Unit Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dialogue data
interface DialogueLine {
  speaker: string;
  text: string;
}

interface DialogueBranch {
  text: string;
  next?: string;
  action?: string;
}

interface DialogueNode {
  lines: DialogueLine[];
  branches?: Record<string, DialogueBranch>;
}

const DIALOGUES: Record<string, DialogueNode> = {
  village_elder: {
    lines: [
      { speaker: 'Elder', text: 'Welcome, traveler!' },
      { speaker: 'Elder', text: 'Our village has been troubled by monsters.' }
    ],
    branches: {
      quest: { text: 'I need a quest', next: 'quest_offer' },
      shop: { text: 'Where is the shop?', next: 'shop_directions' },
      goodbye: { text: 'Goodbye', action: 'end' }
    }
  },
  quest_offer: {
    lines: [
      { speaker: 'Elder', text: 'Clear the Goblin Camp!' },
      { speaker: 'Elder', text: 'Return when done.' }
    ]
  },
  shop_directions: {
    lines: [
      { speaker: 'Elder', text: 'The shop is to the east.' }
    ]
  },
  shopkeeper: {
    lines: [
      { speaker: 'Shopkeeper', text: 'Welcome to my shop!' },
      { speaker: 'Shopkeeper', text: 'Take a look at my wares.' }
    ],
    branches: {
      buy: { text: 'I want to buy', action: 'open_shop' },
      sell: { text: 'I want to sell', action: 'open_shop' },
      goodbye: { text: 'Goodbye', action: 'end' }
    }
  }
};

describe('DialogueSystem', () => {
  describe('Dialogue Definitions', () => {
    it('should have valid dialogue nodes', () => {
      Object.entries(DIALOGUES).forEach(([id, dialogue]) => {
        expect(id).toBeDefined();
        expect(dialogue.lines).toBeDefined();
        expect(Array.isArray(dialogue.lines)).toBe(true);
        expect(dialogue.lines.length).toBeGreaterThan(0);
      });
    });

    it('should have valid dialogue lines', () => {
      const dialogue = DIALOGUES.village_elder;
      dialogue.lines.forEach(line => {
        expect(line).toHaveProperty('speaker');
        expect(line).toHaveProperty('text');
        expect(typeof line.speaker).toBe('string');
        expect(typeof line.text).toBe('string');
      });
    });
  });

  describe('Dialogue Branches', () => {
    it('should support branching dialogues', () => {
      const dialogue = DIALOGUES.village_elder;
      expect(dialogue.branches).toBeDefined();
      expect(Object.keys(dialogue.branches!).length).toBeGreaterThan(0);
    });

    it('should have branch targets', () => {
      const dialogue = DIALOGUES.village_elder;
      const questBranch = dialogue.branches!.quest;
      expect(questBranch.next).toBe('quest_offer');
    });

    it('should support action branches', () => {
      const dialogue = DIALOGUES.shopkeeper;
      const buyBranch = dialogue.branches!.buy;
      expect(buyBranch.action).toBe('open_shop');
    });
  });

  describe('Dialogue Flow', () => {
    it('should start from beginning', () => {
      const dialogue = DIALOGUES.village_elder;
      expect(dialogue.lines[0].speaker).toBe('Elder');
    });

    it('should follow branch to next dialogue', () => {
      const currentNode = DIALOGUES.village_elder;
      const branch = currentNode.branches!.quest;
      const nextNode = branch.next ? DIALOGUES[branch.next] : null;

      expect(nextNode).not.toBeNull();
      expect(nextNode!.lines[0].text).toContain('Clear');
    });

    it('should end dialogue with end action', () => {
      const dialogue = DIALOGUES.shopkeeper;
      const goodbyeBranch = dialogue.branches!.goodbye;
      expect(goodbyeBranch.action).toBe('end');
    });
  });

  describe('NPC Dialogues', () => {
    it('should have unique dialogue for each NPC', () => {
      expect(DIALOGUES.village_elder.lines[0].speaker).toBe('Elder');
      expect(DIALOGUES.shopkeeper.lines[0].speaker).toBe('Shopkeeper');
    });

    it('should support multiple NPCs', () => {
      const npcs = new Set(
        Object.values(DIALOGUES).flatMap(d => d.lines.map(l => l.speaker))
      );
      expect(npcs.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Dialogue Actions', () => {
    it('should trigger shop action', () => {
      const dialogue = DIALOGUES.shopkeeper;
      const action = dialogue.branches!.buy.action;
      expect(action).toBe('open_shop');
    });

    it('should handle end action', () => {
      const dialogue = DIALOGUES.shopkeeper;
      const goodbyeBranch = dialogue.branches!.goodbye;
      expect(goodbyeBranch.action).toBe('end');
    });
  });

  describe('Dialogue Text', () => {
    it('should have non-empty text', () => {
      Object.values(DIALOGUES).forEach(dialogue => {
        dialogue.lines.forEach(line => {
          expect(line.text.trim().length).toBeGreaterThan(0);
        });
      });
    });

    it('should format dialogue for display', () => {
      const line = DIALOGUES.village_elder.lines[0];
      const formatted = `${line.speaker}: ${line.text}`;
      expect(formatted).toBe('Elder: Welcome, traveler!');
    });
  });
});
