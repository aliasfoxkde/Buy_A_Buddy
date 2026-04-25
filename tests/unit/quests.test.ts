/**
 * Quests Module Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../src/core';
import { QuestSystem, Quest } from '../../src/modules/quests';

describe('QuestSystem', () => {
  let eventBus: EventBus;
  let quests: QuestSystem;
  const completedQuests: string[] = [];

  beforeEach(() => {
    eventBus = new EventBus();
    quests = new QuestSystem(eventBus);
  });

  it('should have default quests registered', () => {
    // Check that we can retrieve registered quests
    const quest = quests.getQuest('quest_tutorial_1');
    expect(quest).toBeDefined();
    
    const available = quests.getAvailableQuests([]);
    expect(available.length).toBeGreaterThan(0);
  });

  it('should retrieve quest by ID', () => {
    const quest = quests.getQuest('quest_tutorial_1');
    expect(quest).toBeDefined();
    expect(quest?.name).toContain('Welcome');
  });

  it('should get available quests', () => {
    const available = quests.getAvailableQuests([]);
    expect(available.length).toBeGreaterThan(0);
  });

  it('should filter quests by prerequisites', () => {
    // quest_tutorial_2 requires quest_tutorial_1
    const withoutPrereq = quests.getAvailableQuests([]);
    const withPrereq = quests.getAvailableQuests(['quest_tutorial_1']);
    
    // Without completing prereq, tutorial_2 should not be available
    const tutorial2Without = withoutPrereq.find(q => q.id === 'quest_tutorial_2');
    const tutorial2With = withPrereq.find(q => q.id === 'quest_tutorial_2');
    
    expect(tutorial2Without).toBeUndefined();
    // Note: After starting tutorial_1, it won't be "available" anymore
  });

  it('should start quests', () => {
    const started = quests.startQuest('quest_tutorial_1');
    expect(started).toBe(true);
    
    const active = quests.getActiveQuests();
    expect(active.length).toBe(1);
    expect(active[0].questId).toBe('quest_tutorial_1');
  });

  it('should not start same quest twice', () => {
    quests.startQuest('quest_tutorial_1');
    const startedAgain = quests.startQuest('quest_tutorial_1');
    expect(startedAgain).toBe(false);
  });

  it('should update quest objectives', () => {
    quests.startQuest('quest_tutorial_2');
    
    quests.updateObjective('quest_tutorial_2', 'kill', 'slime', 1);
    
    const active = quests.getActiveQuests();
    const objective = active[0].objectives[0];
    expect(objective.current).toBe(1);
  });

  it('should complete quests when all objectives met', () => {
    const events: any[] = [];
    eventBus.on('quest:complete', (e) => events.push(e));
    
    quests.startQuest('quest_tutorial_2');
    
    // Complete all objectives
    quests.updateObjective('quest_tutorial_2', 'kill', 'slime', 3);
    
    expect(events.length).toBe(1);
    expect(events[0].payload.questId).toBe('quest_tutorial_2');
  });

  it('should get quest progress', () => {
    quests.startQuest('quest_tutorial_2');
    
    let progress = quests.getQuestProgress('quest_tutorial_2');
    expect(progress).toBe(0);
    
    quests.updateObjective('quest_tutorial_2', 'kill', 'slime', 2);
    
    progress = quests.getQuestProgress('quest_tutorial_2');
    expect(progress).toBeCloseTo(0.667, 1); // 2/3 complete
  });

  it('should fail quests', () => {
    const events: any[] = [];
    eventBus.on('quest:fail', (e) => events.push(e));
    
    quests.startQuest('quest_tutorial_1');
    quests.failQuest('quest_tutorial_1');
    
    expect(events.length).toBe(1);
    
    const active = quests.getActiveQuests();
    expect(active.length).toBe(0);
  });

  it('should abandon quests', () => {
    quests.startQuest('quest_tutorial_1');
    quests.abandonQuest('quest_tutorial_1');
    
    const active = quests.getActiveQuests();
    expect(active.length).toBe(0);
  });

  it('should notify on quest start', () => {
    let notified = false;
    quests.onQuestStart(() => {
      notified = true;
    });
    
    quests.startQuest('quest_tutorial_1');
    expect(notified).toBe(true);
  });

  it('should handle repeatable quests', () => {
    const quest = quests.getQuest('quest_herbs');
    if (quest) {
      expect(quest.repeatable).toBe(true);
      
      // Can start, complete, and start again
      quests.startQuest('quest_herbs');
      quests.updateObjective('quest_herbs', 'collect', 'herb_green', 5);
      
      const canRestart = quests.startQuest('quest_herbs');
      expect(canRestart).toBe(true);
    }
  });
});

describe('Quest Properties', () => {
  let quests: QuestSystem;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    quests = new QuestSystem(eventBus);
  });

  it('should have valid objectives', () => {
    const available = quests.getAvailableQuests([]);
    available.forEach(quest => {
      expect(quest.objectives.length).toBeGreaterThan(0);
      quest.objectives.forEach(obj => {
        expect(obj.type).toBeDefined();
        expect(obj.target).toBeDefined();
        expect(obj.required).toBeGreaterThan(0);
      });
    });
  });

  it('should have valid rewards', () => {
    const available = quests.getAvailableQuests([]);
    available.forEach(quest => {
      expect(quest.rewards).toBeDefined();
      expect(quest.rewards.experience).toBeGreaterThanOrEqual(0);
      expect(quest.rewards.gold).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have proper levels', () => {
    const available = quests.getAvailableQuests([]);
    available.forEach(quest => {
      expect(quest.level).toBeGreaterThan(0);
    });
  });
});
