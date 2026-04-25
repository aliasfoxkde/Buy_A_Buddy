// ==========================================
// TYPES TESTS - Game type definitions
// ==========================================

import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  RARITY_CONFIG,
  BUDDY_NAMES,
  Rarity,
} from '../../src/game/types';

describe('Game Types', () => {
  describe('createInitialState', () => {
    it('should create state with starting currency', () => {
      const state = createInitialState();
      expect(state.currency).toBe(100);
    });

    it('should create 3 empty plots', () => {
      const state = createInitialState();
      expect(state.plots).toHaveLength(3);
      expect(state.plots.every(p => p.assignedBuddyId === null)).toBe(true);
    });

    it('should create 2 upgrades', () => {
      const state = createInitialState();
      expect(state.upgrades).toHaveLength(2);
      expect(state.upgrades.find(u => u.id === 'plot-boost')).toBeDefined();
      expect(state.upgrades.find(u => u.id === 'spawn-luck')).toBeDefined();
    });

    it('should have zero buddies initially', () => {
      const state = createInitialState();
      expect(state.buddies).toHaveLength(0);
    });

    it('should initialize stats correctly', () => {
      const state = createInitialState();
      expect(state.stats.totalEarned).toBe(0);
      expect(state.stats.sessionEarned).toBe(0);
      expect(state.stats.highScore).toBe(0);
    });
  });

  describe('RARITY_CONFIG', () => {
    it('should have 4 rarity tiers', () => {
      expect(RARITY_CONFIG).toHaveLength(4);
    });

    it('should have correct rarity order', () => {
      const names = RARITY_CONFIG.map(r => r.name);
      expect(names).toEqual(['common', 'rare', 'epic', 'legendary']);
    });

    it('should have total chances equal to 100', () => {
      const total = RARITY_CONFIG.reduce((sum, r) => sum + r.chance, 0);
      expect(total).toBe(100);
    });

    it('should have increasing base income multipliers', () => {
      const multipliers = RARITY_CONFIG.map(r => r.baseIncomeMultiplier);
      for (let i = 1; i < multipliers.length; i++) {
        expect(multipliers[i]).toBeGreaterThan(multipliers[i - 1]);
      }
    });

    it('should have unique colors and emojis', () => {
      const colors = RARITY_CONFIG.map(r => r.color);
      const emojis = RARITY_CONFIG.map(r => r.emoji);
      expect(new Set(colors).size).toBe(4);
      expect(new Set(emojis).size).toBe(4);
    });
  });

  describe('BUDDY_NAMES', () => {
    it('should have names for all rarities', () => {
      const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
      rarities.forEach(rarity => {
        expect(BUDDY_NAMES[rarity]).toBeDefined();
        expect(Array.isArray(BUDDY_NAMES[rarity])).toBe(true);
        expect(BUDDY_NAMES[rarity].length).toBeGreaterThan(0);
      });
    });

    it('should have 8 names for each rarity', () => {
      const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
      rarities.forEach(rarity => {
        expect(BUDDY_NAMES[rarity]).toHaveLength(8);
      });
    });

    it('should have unique names within each rarity', () => {
      const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
      rarities.forEach(rarity => {
        const names = BUDDY_NAMES[rarity];
        expect(new Set(names).size).toBe(names.length);
      });
    });
  });
});