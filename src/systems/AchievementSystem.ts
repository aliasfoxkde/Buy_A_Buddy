/**
 * Achievement System - Unlocks and badges
 */

import { gameSystems } from '../systems/GameSystems';
import { audioManager } from '../audio/AudioManager';

export type AchievementId = 
  | 'first_blood'
  | 'slime_slayer'
  | 'goblin_hunter'
  | 'wolf_pack'
  | 'skeleton_king'
  | 'boss_slayer'
  | 'level_5'
  | 'level_10'
  | 'gold_hoarder'
  | 'quest_complete'
  | 'shopper'
  | 'explorer';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export class AchievementSystem {
  private achievements: Map<AchievementId, Achievement> = new Map();
  private listeners: Set<(achievement: Achievement) => void> = new Set();
  
  constructor() {
    this.initializeAchievements();
    this.loadProgress();
  }
  
  private initializeAchievements(): void {
    const definitions: Achievement[] = [
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Defeat your first enemy',
        icon: '⚔️',
        unlocked: false
      },
      {
        id: 'slime_slayer',
        name: 'Slime Slayer',
        description: 'Defeat 10 slimes',
        icon: '🟢',
        unlocked: false
      },
      {
        id: 'goblin_hunter',
        name: 'Goblin Hunter',
        description: 'Defeat 10 goblins',
        icon: '👺',
        unlocked: false
      },
      {
        id: 'wolf_pack',
        name: 'Wolf Pack',
        description: 'Defeat 10 wolves',
        icon: '🐺',
        unlocked: false
      },
      {
        id: 'skeleton_king',
        name: 'Skeleton King',
        description: 'Defeat the Skeleton King',
        icon: '💀',
        unlocked: false
      },
      {
        id: 'boss_slayer',
        name: 'Boss Slayer',
        description: 'Defeat 3 bosses',
        icon: '👑',
        unlocked: false
      },
      {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        unlocked: false
      },
      {
        id: 'level_10',
        name: 'Veteran',
        description: 'Reach level 10',
        icon: '🌟',
        unlocked: false
      },
      {
        id: 'gold_hoarder',
        name: 'Gold Hoarder',
        description: 'Accumulate 500 gold',
        icon: '💰',
        unlocked: false
      },
      {
        id: 'quest_complete',
        name: 'Quester',
        description: 'Complete 5 quests',
        icon: '📜',
        unlocked: false
      },
      {
        id: 'shopper',
        name: 'Shopper',
        description: 'Buy 10 items from shops',
        icon: '🛒',
        unlocked: false
      },
      {
        id: 'explorer',
        name: 'Explorer',
        description: 'Visit 3 different zones',
        icon: '🗺️',
        unlocked: false
      }
    ];
    
    for (const achievement of definitions) {
      this.achievements.set(achievement.id, { ...achievement });
    }
  }
  
  /**
   * Unlock an achievement
   */
  public unlock(id: AchievementId): boolean {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return false;
    
    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    this.saveProgress();
    
    // Play achievement sound
    audioManager.playAchievement();
    
    // Notify listeners
    this.listeners.forEach(callback => callback(achievement));
    
    // Emit event
    gameSystems.eventBus.emit('achievement:unlock', { achievement });
    
    return true;
  }
  
  /**
   * Check and update achievements based on game state
   */
  public checkAchievements(): void {
    const stats = gameSystems.getPlayerStats();
    if (!stats) return;
    
    // Level achievements
    if (stats.level >= 5) this.unlock('level_5');
    if (stats.level >= 10) this.unlock('level_10');
    
    // Gold achievement
    if (stats.gold >= 500) this.unlock('gold_hoarder');
  }
  
  /**
   * Handle enemy defeat for achievement tracking
   */
  public onEnemyDefeated(enemyId: string): void {
    // First blood
    this.unlock('first_blood');
    
    // Slime slayer (tracks via quest system)
    if (enemyId === 'slime') this.unlock('slime_slayer');
    if (enemyId === 'goblin') this.unlock('goblin_hunter');
    if (enemyId === 'wolf') this.unlock('wolf_pack');
    if (enemyId === 'skeleton') this.unlock('skeleton_king');
    if (enemyId.includes('boss')) this.unlock('boss_slayer');
  }
  
  /**
   * Handle quest completion
   */
  public onQuestComplete(): void {
    // Count completed quests (simplified - would need actual tracking)
    this.unlock('quest_complete');
  }
  
  /**
   * Handle shop purchase
   */
  public onShopPurchase(itemCount: number): void {
    // Track total items purchased
    const purchased = this.getStat('shop_items_purchased') || 0;
    this.setStat('shop_items_purchased', purchased + itemCount);
    
    if (purchased + itemCount >= 10) {
      this.unlock('shopper');
    }
  }
  
  /**
   * Handle zone visit
   */
  public onZoneEnter(zoneId: string): void {
    const visited = this.getStat('zones_visited') || [];
    if (!visited.includes(zoneId)) {
      visited.push(zoneId);
      this.setStat('zones_visited', visited);
      
      if (visited.length >= 3) {
        this.unlock('explorer');
      }
    }
  }
  
  /**
   * Get all achievements
   */
  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }
  
  /**
   * Get unlocked achievements
   */
  public getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.unlocked);
  }
  
  /**
   * Get locked achievements
   */
  public getLockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => !a.unlocked);
  }
  
  /**
   * Get achievement by ID
   */
  public getAchievement(id: AchievementId): Achievement | undefined {
    return this.achievements.get(id);
  }
  
  /**
   * Subscribe to achievement unlocks
   */
  public onUnlock(callback: (achievement: Achievement) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  /**
   * Reset all achievements
   */
  public reset(): void {
    for (const [id, achievement] of this.achievements) {
      achievement.unlocked = false;
      achievement.unlockedAt = undefined;
    }
    this.saveProgress();
  }
  
  private getStat(key: string): any {
    try {
      const saved = localStorage.getItem(`buyabuddy_achievement_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
  
  private setStat(key: string, value: any): void {
    localStorage.setItem(`buyabuddy_achievement_${key}`, JSON.stringify(value));
  }
  
  private saveProgress(): void {
    const data = Array.from(this.achievements.entries()).map(([id, a]) => ({
      id,
      unlocked: a.unlocked,
      unlockedAt: a.unlockedAt
    }));
    localStorage.setItem('buyabuddy_achievements', JSON.stringify(data));
  }
  
  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('buyabuddy_achievements');
      if (saved) {
        const data = JSON.parse(saved);
        for (const item of data) {
          const achievement = this.achievements.get(item.id as AchievementId);
          if (achievement) {
            achievement.unlocked = item.unlocked;
            achievement.unlockedAt = item.unlockedAt;
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }
}

// Export singleton instance
export const achievementSystem = new AchievementSystem();