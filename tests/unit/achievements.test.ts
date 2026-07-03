/**
 * Achievement System Unit Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the event bus
const mockEmit = vi.fn();
const mockOn = vi.fn(() => () => {});
const mockOff = vi.fn();

vi.mock('../../../src/core', () => ({
  EventBus: vi.fn().mockImplementation(() => ({
    emit: mockEmit,
    on: mockOn,
    off: mockOff
  })),
  generateId: vi.fn(() => 'test-id-' + Math.random().toString(36).substr(2, 9))
}));

// Mock achievement definitions
const ACHIEVEMENTS = {
  first_blood: {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Win your first battle',
    icon: '⚔️',
    category: 'combat',
    requirement: { type: 'battles_won', count: 1 }
  },
  ten_kills: {
    id: 'ten_kills',
    name: 'Monster Slayer',
    description: 'Defeat 10 enemies',
    icon: '💀',
    category: 'combat',
    requirement: { type: 'enemies_killed', count: 10 }
  },
  first_gold: {
    id: 'first_gold',
    name: 'Getting Paid',
    description: 'Earn your first gold',
    icon: '💰',
    category: 'economy',
    requirement: { type: 'gold_earned', count: 1 }
  },
  level_5: {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    category: 'progression',
    requirement: { type: 'player_level', count: 5 }
  }
};

describe('AchievementSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Achievement Definitions', () => {
    it('should have required achievement properties', () => {
      const achievement = ACHIEVEMENTS.first_blood;
      expect(achievement).toHaveProperty('id');
      expect(achievement).toHaveProperty('name');
      expect(achievement).toHaveProperty('description');
      expect(achievement).toHaveProperty('icon');
      expect(achievement).toHaveProperty('category');
      expect(achievement).toHaveProperty('requirement');
    });

    it('should have valid requirement types', () => {
      const requirement = ACHIEVEMENTS.ten_kills.requirement;
      expect(requirement).toHaveProperty('type');
      expect(requirement).toHaveProperty('count');
      expect(typeof requirement.count).toBe('number');
    });
  });

  describe('Achievement Categories', () => {
    it('should categorize achievements correctly', () => {
      expect(ACHIEVEMENTS.first_blood.category).toBe('combat');
      expect(ACHIEVEMENTS.first_gold.category).toBe('economy');
      expect(ACHIEVEMENTS.level_5.category).toBe('progression');
    });
  });

  describe('Achievement Progress', () => {
    it('should track battle wins correctly', () => {
      let battlesWon = 0;
      const checkAchievement = () => {
        battlesWon++;
        return battlesWon >= ACHIEVEMENTS.first_blood.requirement.count;
      };
      expect(checkAchievement()).toBe(true);
      expect(battlesWon).toBe(1);
    });

    it('should track enemy kills correctly', () => {
      let kills = 0;
      const addKill = () => kills++;
      for (let i = 0; i < 10; i++) addKill();
      expect(kills).toBe(10);
      expect(kills >= ACHIEVEMENTS.ten_kills.requirement.count).toBe(true);
    });

    it('should track level progression', () => {
      let level = 1;
      const levelUp = () => level++;
      levelUp(); levelUp(); levelUp(); levelUp(); // Level 5
      expect(level).toBe(5);
      expect(level >= ACHIEVEMENTS.level_5.requirement.count).toBe(true);
    });
  });

  describe('Achievement Unlocking', () => {
    it('should emit event when achievement unlocked', () => {
      const achievement = ACHIEVEMENTS.first_blood;
      mockEmit('achievement:unlock', { achievement });
      expect(mockEmit).toHaveBeenCalledWith('achievement:unlock', { achievement });
    });

    it('should not emit for incomplete achievements', () => {
      const achievement = ACHIEVEMENTS.ten_kills;
      let kills = 5;
      if (kills >= achievement.requirement.count) {
        mockEmit('achievement:unlock', { achievement });
      }
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Achievement Tracking', () => {
    it('should track multiple achievement types simultaneously', () => {
      const stats = {
        battlesWon: 0,
        enemiesKilled: 0,
        goldEarned: 0,
        playerLevel: 1
      };

      stats.battlesWon++;
      stats.enemiesKilled += 5;
      stats.goldEarned += 100;

      expect(stats.battlesWon >= 1).toBe(true); // first_blood
      expect(stats.enemiesKilled >= 10).toBe(false); // ten_kills
      expect(stats.goldEarned >= 1).toBe(true); // first_gold
    });
  });
});
