/**
 * Dialogue System Module
 */

import { EventBus, generateId } from '../../core';

export type DialogueType = 'text' | 'choice' | 'condition' | 'action' | 'end';

export interface DialogueLine {
  speaker?: string;
  portrait?: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';
}

export interface DialogueChoice {
  text: string;
  nextNode: string;
  condition?: () => boolean;
  effect?: () => void;
  requiresQuest?: string;
  givesQuest?: string;
}

export interface DialogueNode {
  id: string;
  type: DialogueType;
  content?: DialogueLine | DialogueLine[];
  choices?: DialogueChoice[];
  nextNode?: string;
  condition?: () => boolean;
  effect?: () => void;
  action?: {
    type: 'give_item' | 'take_item' | 'start_quest' | 'complete_quest' | 'change_flag' | 'play_sound' | 'heal_player' | 'open_shop' | 'buff_player';
    target: string;
    quantity?: number;
    value?: number;
  };
}

export interface NPCDialogue {
  npcId: string;
  defaultNode: string;
  nodes: Map<string, DialogueNode>;
}

export class DialogueSystem {
  private eventBus: EventBus;
  private dialogues: Map<string, NPCDialogue> = new Map();
  private currentDialogue: NPCDialogue | null = null;
  private currentNode: DialogueNode | null = null;
  private dialogueHistory: DialogueLine[] = [];
  private isActive: boolean = false;
  private listeners: Set<(node: DialogueNode) => void> = new Set();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeDefaultDialogues();
  }

  registerDialogue(npcId: string, dialogue: NPCDialogue): void {
    this.dialogues.set(npcId, dialogue);
  }

  startDialogue(npcId: string): boolean {
    const dialogue = this.dialogues.get(npcId);
    if (!dialogue) return false;

    this.currentDialogue = dialogue;
    this.dialogueHistory = [];
    this.isActive = true;
    this.goToNode(dialogue.defaultNode);
    return true;
  }

  goToNode(nodeId: string): void {
    if (!this.currentDialogue) return;

    const node = this.currentDialogue.nodes.get(nodeId);
    if (!node) return;

    // Check condition
    if (node.condition && !node.condition()) {
      // Find fallback or end
      if (node.nextNode) {
        this.goToNode(node.nextNode);
        return;
      }
      this.endDialogue();
      return;
    }

    // Execute effect
    node.effect?.();

    // Execute action
    if (node.action) {
      this.executeAction(node.action);
    }

    this.currentNode = node;
    
    // Add to history
    if (node.type === 'text' && node.content) {
      const content = Array.isArray(node.content) ? node.content : [node.content];
      this.dialogueHistory.push(...content);
    }

    this.eventBus.emit('dialogue:node', { node, dialogue: this.currentDialogue });
    this.listeners.forEach(cb => cb(node));
  }

  selectChoice(choiceIndex: number): void {
    if (!this.currentNode?.choices) return;
    const choice = this.currentNode.choices[choiceIndex];
    if (!choice) return;

    // Check condition
    if (choice.condition && !choice.condition()) return;

    // Check quest requirement
    if (choice.requiresQuest) {
      // Would check quest system
    }

    // Execute effect
    choice.effect?.();

    // Give quest if specified
    if (choice.givesQuest) {
      this.eventBus.emit('quest:start', { questId: choice.givesQuest });
    }

    this.goToNode(choice.nextNode);
  }

  advance(): void {
    if (!this.currentNode) return;

    if (this.currentNode.type === 'choice') {
      return; // Must select a choice
    }

    if (this.currentNode.nextNode) {
      this.goToNode(this.currentNode.nextNode);
    } else {
      this.endDialogue();
    }
  }

  endDialogue(): void {
    this.isActive = false;
    this.currentDialogue = null;
    this.currentNode = null;
    this.eventBus.emit('dialogue:end', {});
  }

  private executeAction(action: DialogueNode['action']): void {
    if (!action) return;

    switch (action.type) {
      case 'give_item':
        this.eventBus.emit('inventory:add', { itemId: action.target, quantity: action.quantity || 1 });
        break;
      case 'take_item':
        this.eventBus.emit('inventory:remove', { itemId: action.target, quantity: action.quantity || 1 });
        break;
      case 'start_quest':
        this.eventBus.emit('quest:start', { questId: action.target });
        break;
      case 'complete_quest':
        this.eventBus.emit('quest:complete', { questId: action.target });
        break;
      case 'change_flag':
        this.eventBus.emit('flag:change', { flag: action.target, value: true });
        break;
      case 'play_sound':
        this.eventBus.emit('audio:play', { sound: action.target });
        break;
      case 'heal_player':
        this.eventBus.emit('player:heal', { amount: action.value || 50 });
        break;
      case 'open_shop':
        this.eventBus.emit('npc:open_shop', { shopId: action.target });
        break;
      case 'buff_player':
        this.eventBus.emit('player:buff', { buffType: action.target, duration: action.value || 30 });
        break;
    }
  }

  getCurrentNode(): DialogueNode | null {
    return this.currentNode;
  }

  getHistory(): DialogueLine[] {
    return [...this.dialogueHistory];
  }

  isInDialogue(): boolean {
    return this.isActive;
  }

  onNodeChange(callback: (node: DialogueNode) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private initializeDefaultDialogues(): void {
    // Mentor NPC dialogue
    const mentorDialogue: NPCDialogue = {
      npcId: 'mentor',
      defaultNode: 'greeting',
      nodes: new Map([
        ['greeting', {
          id: 'greeting',
          type: 'text',
          content: {
            speaker: 'Mentor',
            portrait: 'mentor',
            text: 'Welcome, young adventurer! I have been expecting you. The world needs heroes like you now more than ever.',
            emotion: 'happy'
          },
          nextNode: 'offer_quest'
        }],
        ['offer_quest', {
          id: 'offer_quest',
          type: 'choice',
          content: {
            speaker: 'Mentor',
            portrait: 'mentor',
            text: 'I have a simple task for you. Will you help me?',
            emotion: 'neutral'
          },
          choices: [
            { text: 'I am ready to help!', nextNode: 'accept_quest' },
            { text: 'What will I get for this?', nextNode: 'rewards_info' },
            { text: 'Not right now.', nextNode: 'later' }
          ]
        }],
        ['accept_quest', {
          id: 'accept_quest',
          type: 'text',
          content: {
            speaker: 'Mentor',
            portrait: 'mentor',
            text: 'Excellent! Please, take this wooden sword to defend yourself. Your first task is to defeat 3 slimes in the nearby field.',
            emotion: 'happy'
          },
          action: {
            type: 'give_item',
            target: 'weapon_wooden_sword'
          },
          nextNode: 'end'
        }],
        ['rewards_info', {
          id: 'rewards_info',
          type: 'text',
          content: {
            speaker: 'Mentor',
            portrait: 'mentor',
            text: 'You will receive gold, experience, and perhaps some useful items. Most importantly, you will gain valuable experience for your adventures ahead.',
            emotion: 'neutral'
          },
          nextNode: 'offer_quest'
        }],
        ['later', {
          id: 'later',
          type: 'text',
          content: {
            speaker: 'Mentor',
            portrait: 'mentor',
            text: 'Of course. Return when you are ready. I will be here training other new adventurers.',
            emotion: 'neutral'
          },
          nextNode: 'end'
        }],
        ['end', {
          id: 'end',
          type: 'end'
        }]
      ])
    };

    // Shopkeeper dialogue
    const shopkeeperDialogue: NPCDialogue = {
      npcId: 'shopkeeper',
      defaultNode: 'greeting',
      nodes: new Map([
        ['greeting', {
          id: 'greeting',
          type: 'choice',
          content: {
            speaker: 'Shopkeeper',
            portrait: 'merchant',
            text: 'Welcome to my shop! Take a look at my wares.',
            emotion: 'happy'
          },
          choices: [
            { text: 'Show me your weapons.', nextNode: 'weapons' },
            { text: 'Show me your potions.', nextNode: 'potions' },
            { text: 'Just browsing.', nextNode: 'end' }
          ]
        }],
        ['weapons', {
          id: 'weapons',
          type: 'text',
          content: {
            speaker: 'Shopkeeper',
            portrait: 'merchant',
            text: 'Fine weapons for fine adventurers! Our finest steel swords are on sale today.',
            emotion: 'happy'
          },
          action: {
            type: 'change_flag',
            target: 'shop_weapons_viewed'
          },
          nextNode: 'end'
        }],
        ['potions', {
          id: 'potions',
          type: 'text',
          content: {
            speaker: 'Shopkeeper',
            portrait: 'merchant',
            text: 'Health potions, mana potions, and even some rare elixirs! What would you like?',
            emotion: 'happy'
          },
          nextNode: 'end'
        }]
      ])
    };

    this.registerDialogue('mentor', mentorDialogue);
    this.registerDialogue('shopkeeper', shopkeeperDialogue);
  }
}
