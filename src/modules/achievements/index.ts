/**
 * Achievements System Module
 */

import { EventBus, generateId } from '../../core';

export type AchievementCategory = 'combat' | 'exploration' | 'collection' | 'social' | 'crafting' | 'mastery';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  requirement: {
    type: string;
    target: number | string;
    count?: number;
  };
  reward?: {
    experience?: number;
    gold?: number;
    itemId?: string;
  };
  secret: boolean;
  unlockedAt?: number;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  completed: boolean;
}

export class AchievementSystem {
  private eventBus: EventBus;
  private achievements: Map<string, Achievement> = new Map();
  private unlockedIds: Set<string> = new Set();
  private progress: Map<string, AchievementProgress> = new Map();
  private listeners: Set<(achievement: Achievement) => void> = new Set();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeDefaultAchievements();
    this.setupEventListeners();
  }

  register(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
  }

  get(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  getAll(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getUnlocked(): Achievement[] {
    return Array.from(this.unlockedIds).map(id => this.achievements.get(id)!).filter(Boolean);
  }

  getLocked(): Achievement[] {
    return this.getAll().filter(a => !this.unlockedIds.has(a.id));
  }

  getByCategory(category: AchievementCategory): Achievement[] {
    return this.getAll().filter(a => a.category === category);
  }

  getProgress(achievementId: string): AchievementProgress | undefined {
    return this.progress.get(achievementId);
  }

  getTotalProgress(): { unlocked: number; total: number; percentage: number } {
    const total = this.achievements.size;
    const unlocked = this.unlockedIds.size;
    return {
      unlocked,
      total,
      percentage: total > 0 ? Math.floor((unlocked / total) * 100) : 0
    };
  }

  updateProgress(type: string, target: string, amount: number = 1): void {
    // Find achievements that match this type and target
    for (const achievement of this.achievements.values()) {
      if (achievement.requirement.type === type && achievement.requirement.target === target) {
        if (this.unlockedIds.has(achievement.id)) continue;

        let prog = this.progress.get(achievement.id);
        if (!prog) {
          prog = {
            achievementId: achievement.id,
            current: 0,
            target: achievement.requirement.count || 1,
            completed: false
          };
          this.progress.set(achievement.id, prog);
        }

        prog.current = Math.min(prog.current + amount, prog.target);

        if (prog.current >= prog.target && !prog.completed) {
          prog.completed = true;
          this.unlock(achievement.id);
        }
      }
    }
  }

  unlock(id: string): boolean {
    const achievement = this.achievements.get(id);
    if (!achievement || this.unlockedIds.has(id)) return false;

    this.unlockedIds.add(id);
    achievement.unlockedAt = Date.now();

    // Emit reward events
    if (achievement.reward) {
      if (achievement.reward.experience) {
        this.eventBus.emit('player:experience', { amount: achievement.reward.experience });
      }
      if (achievement.reward.gold) {
        this.eventBus.emit('inventory:gold', { amount: achievement.reward.gold });
      }
      if (achievement.reward.itemId) {
        this.eventBus.emit('inventory:add', { itemId: achievement.reward.itemId, quantity: 1 });
      }
    }

    this.eventBus.emit('achievement:unlock', { achievement });
    this.listeners.forEach(cb => cb(achievement));
    return true;
  }

  isUnlocked(id: string): boolean {
    return this.unlockedIds.has(id);
  }

  onUnlock(callback: (achievement: Achievement) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private setupEventListeners(): void {
    // Combat achievements
    this.eventBus.on('entity:death', (event) => {
      const { entity, killer } = event.payload as { entity: { name: string }; killer?: { id: string } };
      if (killer) {
        this.updateProgress('kill', entity.name);
      }
    });

    // Level achievements
    this.eventBus.on('entity:levelUp', (event) => {
      const { entity } = event.payload as { entity: { stats: { level: number } } };
      this.updateProgress('level', entity.stats.level.toString());
    });

    // Quest achievements
    this.eventBus.on('quest:complete', () => {
      this.updateProgress('quest_complete', 'any');
    });

    // Collection achievements
    this.eventBus.on('inventory:add', (event) => {
      const { itemId } = event.payload as { itemId: string };
      this.updateProgress('collect', itemId);
    });

    // Exploration achievements
    this.eventBus.on('explore:location', (event) => {
      const { locationId } = event.payload as { locationId: string };
      this.updateProgress('explore', locationId);
    });
  }

  private initializeDefaultAchievements(): void {
    // Combat Achievements
    this.register({
      id: 'ach_first_blood',
      name: 'First Blood',
      description: 'Defeat your first enemy.',
      category: 'combat',
      icon: 'sword',
      requirement: { type: 'kill', target: 'slime', count: 1 },
      reward: { experience: 50, gold: 25 },
      secret: false
    });

    this.register({
      id: 'ach_warrior',
      name: 'Warrior',
      description: 'Defeat 100 enemies.',
      category: 'combat',
      icon: 'sword_fury',
      requirement: { type: 'kill', target: 'any', count: 100 },
      reward: { experience: 500, gold: 200 },
      secret: false
    });

    this.register({
      id: 'ach_slayer',
      name: 'Monster Slayer',
      description: 'Defeat 500 enemies.',
      category: 'combat',
      icon: 'skull',
      requirement: { type: 'kill', target: 'any', count: 500 },
      reward: { experience: 2000, gold: 1000 },
      secret: false
    });

    this.register({
      id: 'ach_boss_hunter',
      name: 'Boss Hunter',
      description: 'Defeat 10 bosses.',
      category: 'combat',
      icon: 'crown',
      requirement: { type: 'kill', target: 'boss', count: 10 },
      reward: { experience: 5000, gold: 5000, itemId: 'accessory_amulet_life' },
      secret: false
    });

    // Level Achievements
    this.register({
      id: 'ach_level_5',
      name: 'Rising Hero',
      description: 'Reach level 5.',
      category: 'mastery',
      icon: 'star',
      requirement: { type: 'level', target: '5', count: 1 },
      reward: { experience: 100 },
      secret: false
    });

    this.register({
      id: 'ach_level_10',
      name: 'Veteran Adventurer',
      description: 'Reach level 10.',
      category: 'mastery',
      icon: 'stars',
      requirement: { type: 'level', target: '10', count: 1 },
      reward: { experience: 500 },
      secret: false
    });

    this.register({
      id: 'ach_level_25',
      name: 'Legendary Hero',
      description: 'Reach level 25.',
      category: 'mastery',
      icon: 'legend',
      requirement: { type: 'level', target: '25', count: 1 },
      reward: { experience: 5000, gold: 5000 },
      secret: false
    });

    this.register({
      id: 'ach_level_50',
      name: 'Champion',
      description: 'Reach level 50.',
      category: 'mastery',
      icon: 'champion',
      requirement: { type: 'level', target: '50', count: 1 },
      reward: { experience: 25000, gold: 25000, itemId: 'weapon_excalibur' },
      secret: false
    });

    // Quest Achievements
    this.register({
      id: 'ach_quester',
      name: 'Quester',
      description: 'Complete 10 quests.',
      category: 'social',
      icon: 'scroll',
      requirement: { type: 'quest_complete', target: 'any', count: 10 },
      reward: { experience: 500 },
      secret: false
    });

    this.register({
      id: 'ach_quest_master',
      name: 'Quest Master',
      description: 'Complete 50 quests.',
      category: 'social',
      icon: 'scrolls',
      requirement: { type: 'quest_complete', target: 'any', count: 50 },
      reward: { experience: 2500, gold: 1000 },
      secret: false
    });

    // Collection Achievements
    this.register({
      id: 'ach_collector',
      name: 'Collector',
      description: 'Collect 100 different items.',
      category: 'collection',
      icon: 'chest',
      requirement: { type: 'collect', target: 'any', count: 100 },
      reward: { experience: 500, gold: 500 },
      secret: false
    });

    this.register({
      id: 'ach_treasure_hunter',
      name: 'Treasure Hunter',
      description: 'Open 50 chests.',
      category: 'collection',
      icon: 'gem',
      requirement: { type: 'collect', target: 'chest', count: 50 },
      reward: { gold: 1000 },
      secret: false
    });

    // Exploration Achievements
    this.register({
      id: 'ach_explorer',
      name: 'Explorer',
      description: 'Discover 20 locations.',
      category: 'exploration',
      icon: 'map',
      requirement: { type: 'explore', target: 'any', count: 20 },
      reward: { experience: 500, gold: 250 },
      secret: false
    });

    this.register({
      id: 'ach_world_traveler',
      name: 'World Traveler',
      description: 'Discover all locations.',
      category: 'exploration',
      icon: 'compass',
      requirement: { type: 'explore', target: 'all', count: 1 },
      reward: { experience: 5000, gold: 5000 },
      secret: true
    });

    // Crafting Achievements
    this.register({
      id: 'ach_apprentice',
      name: 'Apprentice Craftsman',
      description: 'Craft 20 items.',
      category: 'crafting',
      icon: 'hammer',
      requirement: { type: 'craft', target: 'any', count: 20 },
      reward: { experience: 200 },
      secret: false
    });

    this.register({
      id: 'ach_master_craftsman',
      name: 'Master Craftsman',
      description: 'Craft 100 items.',
      category: 'crafting',
      icon: 'anvil',
      requirement: { type: 'craft', target: 'any', count: 100 },
      reward: { experience: 1000, gold: 1000 },
      secret: false
    });

    // Secret Achievements
    this.register({
      id: 'ach_never_die',
      name: 'Immortal?',
      description: 'Complete the game without dying.',
      category: 'combat',
      icon: 'ghost',
      requirement: { type: 'no_death', target: 'campaign', count: 1 },
      reward: { experience: 10000, gold: 10000 },
      secret: true
    });

    this.register({
      id: 'ach_perfect',
      name: 'Perfectionist',
      description: 'Get 100% completion.',
      category: 'mastery',
      icon: 'crown_gem',
      requirement: { type: 'completion', target: '100', count: 1 },
      reward: { experience: 50000, gold: 50000 },
      secret: true
    });
  }
}
