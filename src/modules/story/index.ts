/**
 * Story System - Narrative progression and world state
 */

import { gameSystems } from '../../systems/GameSystems';
import { EventBus } from '../../core';

export interface Act {
  id: string;
  name: string;
  quests: string[];
  narrative: string;
  completed: boolean;
  currentQuestIndex: number;
}

export interface WorldEvent {
  id: string;
  trigger: 'quest_complete' | 'quest_started' | 'enemy_killed' | 'zone_enter';
  targetId: string;
  effect: string;
  narrative: string;
  shown: boolean;
}

export class StorySystem {
  private eventBus: EventBus;
  private acts: Map<string, Act> = new Map();
  private worldEvents: Map<string, WorldEvent> = new Map();
  private currentAct: string = 'act1';
  private showNotification: ((text: string) => void) | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeActs();
    this.initializeWorldEvents();
    this.setupEventListeners();
  }

  private initializeActs(): void {
    const actDefinitions = [
      {
        id: 'act1',
        name: 'The Beginning',
        quests: ['quest_tutorial_1', 'quest_tutorial_2', 'quest_goblin_trouble'],
        narrative: 'You arrive at the peaceful village of Elderwood. The elder welcomes you and asks for help with goblin troubles.'
      },
      {
        id: 'act2',
        name: 'Rising Threats',
        quests: ['quest_wolf_pack', 'quest_spider_nest', 'quest_orc_warrior'],
        narrative: 'The goblin threat is eliminated, but larger dangers lurk. Wolves, spiders, and orcs threaten the region.'
      },
      {
        id: 'act3',
        name: 'Elemental Chaos',
        quests: ['quest_elemental_fire', 'quest_elemental_ice', 'quest_thunder_bird'],
        narrative: 'Elemental beings have appeared, disturbing the natural balance. Fire, ice, and thunder elementals run wild.'
      },
      {
        id: 'act4',
        name: 'Shadow Rising',
        quests: ['quest_holy_challenge', 'quest_skeleton_king', 'quest_boss_hunter'],
        narrative: 'Dark forces gather as shadows spread across the land. The skeleton king rises and a boss threatens Elderwood.'
      },
      {
        id: 'act5',
        name: "Dragon's Awakening",
        quests: ['quest_dragon_slayer'],
        narrative: 'The ancient dragon awakens from its slumber! Only the strongest heroes can defeat this ultimate threat.'
      }
    ];

    for (const act of actDefinitions) {
      this.acts.set(act.id, {
        ...act,
        completed: false,
        currentQuestIndex: 0
      });
    }
  }

  private initializeWorldEvents(): void {
    const eventDefinitions = [
      {
        id: 'village_peaceful',
        trigger: 'quest_complete' as const,
        targetId: 'quest_goblin_trouble',
        effect: 'village_atmosphere_peaceful',
        narrative: '🎉 The village of Elderwood celebrates! The goblin threat has been eliminated.'
      },
      {
        id: 'elemental_warnings',
        trigger: 'quest_started' as const,
        targetId: 'quest_elemental_fire',
        effect: 'elemental_spawn_rate_increase',
        narrative: '⚠️ Multiple elemental beings have been spotted across the region!'
      },
      {
        id: 'dark_shadows',
        trigger: 'quest_complete' as const,
        targetId: 'quest_skeleton_king',
        effect: 'shadow_lord_appears',
        narrative: '🌑 Dark energy spreads across the land. Something sinister stirs...'
      },
      {
        id: 'dragon_stirs',
        trigger: 'quest_started' as const,
        targetId: 'quest_dragon_slayer',
        effect: 'final_boss_zone_open',
        narrative: '🐉 A rumbling shakes the mountains. The ancient dragon awakens!'
      },
      {
        id: 'dragon_defeated',
        trigger: 'quest_complete' as const,
        targetId: 'quest_dragon_slayer',
        effect: 'world_peace_restored',
        narrative: '🏆 VICTORY! The ancient dragon has been defeated. Peace returns to the land!'
      }
    ];

    for (const event of eventDefinitions) {
      this.worldEvents.set(event.id, {
        ...event,
        shown: false
      });
    }
  }

  private setupEventListeners(): void {
    this.eventBus.on('quest:complete', (event: any) => {
      this.onQuestComplete(event.payload?.questId);
    });

    this.eventBus.on('quest:start', (event: any) => {
      this.onQuestStarted(event.payload?.questId);
    });

    this.eventBus.on('battle:end', (event: any) => {
      this.onBattleEnd(event.payload);
    });
  }

  private onQuestComplete(questId?: string): void {
    if (!questId) return;

    // Check for world events
    for (const [eventId, worldEvent] of this.worldEvents) {
      if (worldEvent.trigger === 'quest_complete' && worldEvent.targetId === questId) {
        this.triggerWorldEvent(eventId);
      }
    }

    // Advance act progress
    this.advanceActProgress(questId);
  }

  private onQuestStarted(questId?: string): void {
    if (!questId) return;

    // Check for world events
    for (const [eventId, worldEvent] of this.worldEvents) {
      if (worldEvent.trigger === 'quest_started' && worldEvent.targetId === questId) {
        this.triggerWorldEvent(eventId);
      }
    }
  }

  private onBattleEnd(payload: any): void {
    if (payload.victory && payload.enemyId) {
      // Check for enemy kill events
      for (const [eventId, worldEvent] of this.worldEvents) {
        if (worldEvent.trigger === 'enemy_killed' && worldEvent.targetId === payload.enemyId) {
          this.triggerWorldEvent(eventId);
        }
      }
    }
  }

  private triggerWorldEvent(eventId: string): void {
    const event = this.worldEvents.get(eventId);
    if (!event || event.shown) return;

    event.shown = true;
    
    // Show narrative notification
    if (this.showNotification) {
      this.showNotification(event.narrative);
    }

    // Emit event for other systems
    this.eventBus.emit('story:event', { eventId, effect: event.effect });
  }

  private advanceActProgress(questId: string): void {
    for (const [actId, act] of this.acts) {
      const questIndex = act.quests.indexOf(questId);
      if (questIndex !== -1) {
        act.currentQuestIndex = questIndex;
        
        // Check if act is complete
        if (questIndex >= act.quests.length - 1) {
          act.completed = true;
          this.advanceToNextAct();
        }
        break;
      }
    }
  }

  private advanceToNextAct(): void {
    const actOrder = ['act1', 'act2', 'act3', 'act4', 'act5'];
    const currentIndex = actOrder.indexOf(this.currentAct);
    
    if (currentIndex < actOrder.length - 1) {
      const nextActId = actOrder[currentIndex + 1];
      this.currentAct = nextActId;
      
      const nextAct = this.acts.get(nextActId);
      if (nextAct && this.showNotification) {
        this.showNotification(`📖 ACT ${currentIndex + 2}: ${nextAct.name}\n${nextAct.narrative}`);
      }
    }
  }

  public setNotificationCallback(callback: (text: string) => void): void {
    this.showNotification = callback;
  }

  public getCurrentAct(): Act | undefined {
    return this.acts.get(this.currentAct);
  }

  public getActProgress(): { actId: string; name: string; progress: number }[] {
    return Array.from(this.acts.values()).map(act => ({
      actId: act.id,
      name: act.name,
      progress: act.completed ? 100 : Math.round((act.currentQuestIndex / act.quests.length) * 100)
    }));
  }

  public isActComplete(actId: string): boolean {
    return this.acts.get(actId)?.completed ?? false;
  }

  public getMainQuest(): string | null {
    const currentAct = this.acts.get(this.currentAct);
    if (!currentAct || currentAct.completed) return null;
    
    return currentAct.quests[currentAct.currentQuestIndex] || null;
  }
}

// Export singleton instance
let storyInstance: StorySystem | null = null;

export function getStorySystem(eventBus: EventBus): StorySystem {
  if (!storyInstance) {
    storyInstance = new StorySystem(eventBus);
  }
  return storyInstance;
}
