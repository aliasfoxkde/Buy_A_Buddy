/**
 * Quest System Module
 */

import { EventBus, QuestData, QuestObjective, generateId } from '../../core';

export type QuestType = 'kill' | 'collect' | 'talk' | 'explore' | 'escort' | 'deliver';
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';

export interface QuestReward {
  experience: number;
  gold: number;
  items?: { itemId: string; quantity: number }[];
  skill?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  level: number;
  objectives: QuestObjectiveDef[];
  rewards: QuestReward;
  prerequisites?: string[];
  timeLimit?: number; // seconds
  repeatable: boolean;
}

export interface QuestObjectiveDef {
  type: string;
  target: string;
  description: string;
  required: number;
  optional?: boolean;
}

export class QuestSystem {
  private eventBus: EventBus;
  private quests: Map<string, Quest> = new Map();
  private activeQuests: Map<string, QuestData> = new Map();
  private questLog: QuestData[] = [];
  private listeners: Set<(questId: string) => void> = new Set();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeDefaultQuests();
  }

  registerQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
  }

  getQuest(id: string): Quest | undefined {
    return this.quests.get(id);
  }

  getAvailableQuests(completedQuests: string[] = []): Quest[] {
    return Array.from(this.quests.values()).filter(q => {
      if (this.activeQuests.has(q.id)) return false;
      if (completedQuests.includes(q.id) && !q.repeatable) return false;
      if (q.prerequisites) {
        return q.prerequisites.every(p => completedQuests.includes(p));
      }
      return true;
    });
  }

  startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) return false;
    if (this.activeQuests.has(questId)) return false;

    const questData: QuestData = {
      questId,
      status: 'active',
      objectives: quest.objectives.map(obj => ({
        type: obj.type,
        target: obj.target,
        current: 0,
        required: obj.required
      })),
      startTime: Date.now()
    };

    this.activeQuests.set(questId, questData);
    this.questLog.push(questData);
    this.eventBus.emit('quest:start', { questId, quest });
    
    this.listeners.forEach(cb => cb(questId));
    return true;
  }

  updateObjective(questId: string, objectiveType: string, target: string, progress: number = 1): void {
    const questData = this.activeQuests.get(questId);
    if (!questData || questData.status !== 'active') return;

    const objective = questData.objectives.find(
      o => o.type === objectiveType && o.target === target
    );

    if (objective) {
      objective.current = Math.min(objective.current + progress, objective.required);
      this.checkQuestCompletion(questId);
    }
  }

  private checkQuestCompletion(questId: string): void {
    const questData = this.activeQuests.get(questId);
    const quest = this.quests.get(questId);
    if (!questData || !quest) return;

    const allComplete = questData.objectives.every(obj => obj.current >= obj.required);
    
    if (allComplete) {
      this.completeQuest(questId);
    }
  }

  completeQuest(questId: string): void {
    const questData = this.activeQuests.get(questId);
    const quest = this.quests.get(questId);
    if (!questData || !quest) return;

    questData.status = 'completed';
    questData.completeTime = Date.now();
    
    this.activeQuests.delete(questId);
    this.eventBus.emit('quest:complete', { questId, quest, rewards: quest.rewards });
  }

  failQuest(questId: string): void {
    const questData = this.activeQuests.get(questId);
    const quest = this.quests.get(questId);
    if (!questData || !quest) return;

    questData.status = 'failed';
    
    this.activeQuests.delete(questId);
    this.eventBus.emit('quest:fail', { questId, quest });
  }

  abandonQuest(questId: string): void {
    this.activeQuests.delete(questId);
    this.questLog = this.questLog.filter(q => q.questId !== questId);
  }

  getActiveQuests(): QuestData[] {
    return Array.from(this.activeQuests.values());
  }

  getQuestProgress(questId: string): number {
    const questData = this.activeQuests.get(questId);
    if (!questData) return 0;

    const total = questData.objectives.reduce((sum, obj) => sum + obj.required, 0);
    const current = questData.objectives.reduce((sum, obj) => sum + Math.min(obj.current, obj.required), 0);
    
    return total > 0 ? current / total : 0;
  }

  onQuestStart(callback: (questId: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private initializeDefaultQuests(): void {
    // Tutorial quest
    this.registerQuest({
      id: 'quest_tutorial_1',
      name: 'Welcome to the World',
      description: 'Meet your first mentor and learn the basics.',
      type: 'talk',
      level: 1,
      objectives: [
        { type: 'talk', target: 'mentor', description: 'Talk to the Mentor', required: 1 }
      ],
      rewards: {
        experience: 50,
        gold: 20,
        items: [{ itemId: 'weapon_wooden_sword', quantity: 1 }]
      },
      repeatable: false
    });

    // Combat tutorial
    this.registerQuest({
      id: 'quest_tutorial_2',
      name: 'First Battle',
      description: 'Defeat 3 slimes to prove your worth.',
      type: 'kill',
      level: 1,
      objectives: [
        { type: 'kill', target: 'slime', description: 'Defeat Slimes', required: 3 }
      ],
      rewards: {
        experience: 100,
        gold: 50,
        items: [{ itemId: 'potion_health_small', quantity: 3 }]
      },
      prerequisites: ['quest_tutorial_1'],
      repeatable: false
    });

    // Collection quest
    this.registerQuest({
      id: 'quest_herbs',
      name: 'Gather Herbs',
      description: 'Collect healing herbs from the forest.',
      type: 'collect',
      level: 2,
      objectives: [
        { type: 'collect', target: 'herb_green', description: 'Collect Healing Herbs', required: 5 }
      ],
      rewards: {
        experience: 150,
        gold: 75
      },
      prerequisites: ['quest_tutorial_2'],
      repeatable: true
    });

    // Exploration quest
    this.registerQuest({
      id: 'quest_explore',
      name: 'Discover the Village',
      description: 'Explore the village and find all points of interest.',
      type: 'explore',
      level: 1,
      objectives: [
        { type: 'explore', target: 'shop', description: 'Find the Shop', required: 1 },
        { type: 'explore', target: 'inn', description: 'Find the Inn', required: 1 },
        { type: 'explore', target: 'dungeon_entrance', description: 'Find Dungeon Entrance', required: 1 }
      ],
      rewards: {
        experience: 200,
        gold: 100
      },
      prerequisites: ['quest_tutorial_1'],
      repeatable: false
    });

    // Delivery quest
    this.registerQuest({
      id: 'quest_delivery',
      name: 'Package Delivery',
      description: 'Deliver a package to the blacksmith.',
      type: 'deliver',
      level: 2,
      objectives: [
        { type: 'collect', target: 'package', description: 'Pick up Package', required: 1 },
        { type: 'talk', target: 'blacksmith', description: 'Deliver to Blacksmith', required: 1 }
      ],
      rewards: {
        experience: 175,
        gold: 100
      },
      prerequisites: ['quest_tutorial_2'],
      repeatable: true
    });
  }
}
