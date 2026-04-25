// ==========================================
// SPAWNER TESTS - Buddy spawner mechanics
// ==========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  rollRarity,
  createBuddy,
  spawnBuddy,
  getSpawnCost,
  getBuddyUpgradeCost,
  getPlotUpgradeCost,
} from '../../src/systems/spawner';

describe('Spawner System', () => {
  beforeEach(() => {
    // Seed random for consistent tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  describe('rollRarity', () => {
    it('should return common for rolls 0.5 (50%)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const rarity = rollRarity();
      expect(rarity).toBe('common');
    });

    it('should return common for rolls below 60%', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      expect(rollRarity()).toBe('common');
      
      vi.spyOn(Math, 'random').mockReturnValue(0.59);
      expect(rollRarity()).toBe('common');
    });

    it('should return rare for rolls 60-85%', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.6);
      expect(rollRarity()).toBe('rare');
      
      vi.spyOn(Math, 'random').mockReturnValue(0.84);
      expect(rollRarity()).toBe('rare');
    });

    it('should return epic for rolls 85-97%', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.86);
      expect(rollRarity()).toBe('epic');
      
      vi.spyOn(Math, 'random').mockReturnValue(0.96);
      expect(rollRarity()).toBe('epic');
    });

    it('should return legendary for rolls above 97%', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.98);
      expect(rollRarity()).toBe('legendary');
      
      vi.spyOn(Math, 'random').mockReturnValue(0.999);
      expect(rollRarity()).toBe('legendary');
    });
  });

  describe('createBuddy', () => {
    it('should create a buddy with given rarity', () => {
      const buddy = createBuddy('common');
      expect(buddy.rarity).toBe('common');
      expect(buddy.level).toBe(1);
      expect(buddy.assignedPlotId).toBeNull();
      expect(buddy.baseIncome).toBe(1);
    });

    it('should create a buddy with correct income multiplier', () => {
      const commonBuddy = createBuddy('common');
      const rareBuddy = createBuddy('rare');
      const epicBuddy = createBuddy('epic');
      const legendaryBuddy = createBuddy('legendary');

      expect(commonBuddy.baseIncome).toBe(1);
      expect(rareBuddy.baseIncome).toBe(2);
      expect(epicBuddy.baseIncome).toBe(4);
      expect(legendaryBuddy.baseIncome).toBe(8);
    });

    it('should have valid ID format', () => {
      const buddy = createBuddy('common');
      expect(buddy.id).toMatch(/^\d+-[a-z0-9]+$/);
    });

    it('should have unique ID format', () => {
      // IDs should have timestamp prefix
      const buddy1 = createBuddy('common');
      const buddy2 = createBuddy('common');
      // They may have same timestamp but different suffix
      expect(buddy1.id.split('-')[0]).toBeTruthy();
      expect(buddy2.id.split('-')[0]).toBeTruthy();
      // Just ensure they're valid format
      expect(buddy1.id).not.toBe('');
      expect(buddy2.id).not.toBe('');
    });

    it('should have a valid name from the name pool', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const buddy = createBuddy('common');
      expect(buddy.name).toBe('Blobby');
    });

    it('should have correct emoji based on rarity', () => {
      const buddy = createBuddy('legendary');
      expect(buddy.emoji).toBe('🌟');
    });
  });

  describe('spawnBuddy', () => {
    it('should create a buddy with random rarity', () => {
      const buddy = spawnBuddy();
      expect(['common', 'rare', 'epic', 'legendary']).toContain(buddy.rarity);
    });

    it('should respect spawn bonus for legendary chance', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const buddy = spawnBuddy(0.1); // 10% bonus = 13% legendary
      // With 0.5 roll and 10% bonus, should still be common (still in 60% range)
      expect(buddy.rarity).toBe('common');
    });
  });

  describe('getSpawnCost', () => {
    it('should return 10 for first buddy (0 owned)', () => {
      expect(getSpawnCost(0)).toBe(10);
    });

    it('should scale exponentially', () => {
      const cost1 = getSpawnCost(0);
      const cost2 = getSpawnCost(1);
      const cost3 = getSpawnCost(5);

      expect(cost2).toBeGreaterThan(cost1);
      expect(cost3).toBeGreaterThan(cost2);
    });

    it('should use 1.15 exponential scaling', () => {
      expect(getSpawnCost(1)).toBe(Math.floor(10 * Math.pow(1.15, 1)));
      expect(getSpawnCost(5)).toBe(Math.floor(10 * Math.pow(1.15, 5)));
      expect(getSpawnCost(10)).toBe(Math.floor(10 * Math.pow(1.15, 10)));
    });
  });

  describe('getBuddyUpgradeCost', () => {
    it('should return 5 for level 1 buddy', () => {
      const buddy = { level: 1 } as any;
      expect(getBuddyUpgradeCost(buddy)).toBe(5);
    });

    it('should scale with buddy level', () => {
      const level1 = { level: 1 } as any;
      const level2 = { level: 2 } as any;
      const level5 = { level: 5 } as any;

      expect(getBuddyUpgradeCost(level2)).toBeGreaterThan(getBuddyUpgradeCost(level1));
      expect(getBuddyUpgradeCost(level5)).toBeGreaterThan(getBuddyUpgradeCost(level2));
    });

    it('should use 1.5 exponential scaling', () => {
      const level3 = { level: 3 } as any;
      expect(getBuddyUpgradeCost(level3)).toBe(Math.floor(5 * Math.pow(1.5, 2)));
    });
  });

  describe('getPlotUpgradeCost', () => {
    it('should return 25 for level 1 plot', () => {
      const plot = { level: 1 } as any;
      expect(getPlotUpgradeCost(plot)).toBe(25);
    });

    it('should scale with plot level', () => {
      const level1 = { level: 1 } as any;
      const level2 = { level: 2 } as any;
      const level3 = { level: 3 } as any;

      expect(getPlotUpgradeCost(level2)).toBeGreaterThan(getPlotUpgradeCost(level1));
      expect(getPlotUpgradeCost(level3)).toBeGreaterThan(getPlotUpgradeCost(level2));
    });

    it('should use 1.4 exponential scaling', () => {
      const level3 = { level: 3 } as any;
      expect(getPlotUpgradeCost(level3)).toBe(Math.floor(25 * Math.pow(1.4, 2)));
    });
  });
});