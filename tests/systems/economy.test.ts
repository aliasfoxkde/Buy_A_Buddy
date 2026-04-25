// ==========================================
// ECONOMY TESTS - Income and economy mechanics
// ==========================================

import { describe, it, expect } from 'vitest';
import {
  calculateIncomePerSecond,
  calculateOfflineEarnings,
  getPlotMultiplierBonus,
  getSpawnLuckBonus,
  formatCurrency,
  getBuddyIncome,
} from '../../src/systems/economy';
import { createMockBuddy, createMockPlot, createMockGameState } from '../setup';

describe('Economy System', () => {
  describe('calculateIncomePerSecond', () => {
    it('should return 0 with no buddies', () => {
      const state = createMockGameState({ buddies: [] });
      expect(calculateIncomePerSecond(state)).toBe(0);
    });

    it('should return 0 with unassigned buddies', () => {
      const buddy = createMockBuddy({ assignedPlotId: null });
      const state = createMockGameState({ buddies: [buddy] });
      expect(calculateIncomePerSecond(state)).toBe(0);
    });

    it('should calculate income for assigned buddy', () => {
      const buddy = createMockBuddy({ 
        baseIncome: 1, 
        level: 1, 
        assignedPlotId: 'plot-1' 
      });
      const plot = createMockPlot({ id: 'plot-1', multiplier: 1 });
      const state = createMockGameState({ 
        buddies: [buddy], 
        plots: [plot] 
      });
      
      // income = baseIncome * level * multiplier = 1 * 1 * 1 = 1
      expect(calculateIncomePerSecond(state)).toBe(1);
    });

    it('should multiply by plot level', () => {
      const buddy = createMockBuddy({ 
        baseIncome: 1, 
        level: 1, 
        assignedPlotId: 'plot-1' 
      });
      const plot = createMockPlot({ id: 'plot-1', multiplier: 2 });
      const state = createMockGameState({ 
        buddies: [buddy], 
        plots: [plot] 
      });
      
      expect(calculateIncomePerSecond(state)).toBe(2);
    });

    it('should multiply by buddy level', () => {
      const buddy = createMockBuddy({ 
        baseIncome: 1, 
        level: 5, 
        assignedPlotId: 'plot-1' 
      });
      const plot = createMockPlot({ id: 'plot-1', multiplier: 1 });
      const state = createMockGameState({ 
        buddies: [buddy], 
        plots: [plot] 
      });
      
      expect(calculateIncomePerSecond(state)).toBe(5);
    });

    it('should sum income from multiple buddies', () => {
      const buddy1 = createMockBuddy({ 
        id: 'buddy-1',
        baseIncome: 2, 
        level: 1, 
        assignedPlotId: 'plot-1' 
      });
      const buddy2 = createMockBuddy({ 
        id: 'buddy-2',
        baseIncome: 3, 
        level: 2, 
        assignedPlotId: 'plot-2' 
      });
      const state = createMockGameState({ 
        buddies: [buddy1, buddy2]
      });
      
      // buddy1: 2*1*1 = 2
      // buddy2: 3*2*1 = 6
      // total = 8
      expect(calculateIncomePerSecond(state)).toBe(8);
    });

    it('should use base income multiplier from rarity', () => {
      const buddy = createMockBuddy({ 
        baseIncome: 8, // legendary = 8x multiplier
        level: 1, 
        assignedPlotId: 'plot-1' 
      });
      const plot = createMockPlot({ id: 'plot-1', multiplier: 1 });
      const state = createMockGameState({ 
        buddies: [buddy], 
        plots: [plot] 
      });
      
      expect(calculateIncomePerSecond(state)).toBe(8);
    });
  });

  describe('calculateOfflineEarnings', () => {
    it('should return 0 for no time away', () => {
      const state = createMockGameState();
      expect(calculateOfflineEarnings(state, 0)).toBe(0);
    });

    it('should return 0 for unassigned buddies', () => {
      const buddy = createMockBuddy({ assignedPlotId: null });
      const state = createMockGameState({ buddies: [buddy] });
      
      expect(calculateOfflineEarnings(state, 60000)).toBe(0);
    });

    it('should calculate earnings with 50% offline efficiency', () => {
      const buddy = createMockBuddy({ 
        baseIncome: 2, 
        level: 1, 
        assignedPlotId: 'plot-1' 
      });
      const state = createMockGameState({ buddies: [buddy] });
      
      // 60 seconds * 2 income * 0.5 efficiency = 60
      const earnings = calculateOfflineEarnings(state, 60000);
      expect(earnings).toBe(60);
    });

    it('should cap at 24 hours', () => {
      const buddy = createMockBuddy({ 
        baseIncome: 1, 
        level: 1, 
        assignedPlotId: 'plot-1' 
      });
      const state = createMockGameState({ buddies: [buddy] });
      
      // 30 hours away should cap at 24 hours
      const thirtyHours = 30 * 60 * 60 * 1000;
      const earnings = calculateOfflineEarnings(state, thirtyHours);
      
      const maxEarnings = 24 * 60 * 60 * 1 * 0.5;
      expect(earnings).toBeLessThanOrEqual(maxEarnings + 1); // +1 for rounding
    });
  });

  describe('getPlotMultiplierBonus', () => {
    it('should return 1 with no plot boost upgrade', () => {
      const state = createMockGameState({
        upgrades: state => state.upgrades.map(u => 
          u.id === 'plot-boost' ? { ...u, currentLevel: 0 } : u
        )
      } as any);
      
      // Need to set upgrade correctly
      const stateWithNoBoost = createMockGameState();
      stateWithNoBoost.upgrades = stateWithNoBoost.upgrades.map(u => 
        u.id === 'plot-boost' ? { ...u, currentLevel: 0 } : u
      );
      
      expect(getPlotMultiplierBonus(stateWithNoBoost)).toBe(1);
    });

    it('should increase with plot boost level', () => {
      const state = createMockGameState();
      state.upgrades = state.upgrades.map(u => 
        u.id === 'plot-boost' ? { ...u, currentLevel: 3 } : u
      );
      
      // 1 + (3-1) * 0.5 = 2
      expect(getPlotMultiplierBonus(state)).toBe(2);
    });
  });

  describe('getSpawnLuckBonus', () => {
    it('should return 0 with no spawn luck upgrade', () => {
      const state = createMockGameState();
      state.upgrades = state.upgrades.map(u => 
        u.id === 'spawn-luck' ? { ...u, currentLevel: 0 } : u
      );
      
      expect(getSpawnLuckBonus(state)).toBe(0);
    });

    it('should increase with spawn luck level', () => {
      const state = createMockGameState();
      state.upgrades = state.upgrades.map(u => 
        u.id === 'spawn-luck' ? { ...u, currentLevel: 5 } : u
      );
      
      // 5 * 0.05 = 0.25
      expect(getSpawnLuckBonus(state)).toBe(0.25);
    });
  });

  describe('formatCurrency', () => {
    it('should format small numbers without suffix', () => {
      expect(formatCurrency(100)).toBe('100');
      expect(formatCurrency(999)).toBe('999');
      expect(formatCurrency(0)).toBe('0');
    });

    it('should format thousands with K suffix', () => {
      expect(formatCurrency(1000)).toBe('1.0K');
      expect(formatCurrency(1500)).toBe('1.5K');
      expect(formatCurrency(10000)).toBe('10.0K');
    });

    it('should format millions with M suffix', () => {
      expect(formatCurrency(1000000)).toBe('1.00M');
      expect(formatCurrency(2500000)).toBe('2.50M');
    });

    it('should format billions with B suffix', () => {
      expect(formatCurrency(1000000000)).toBe('1.00B');
      expect(formatCurrency(1500000000)).toBe('1.50B');
    });

    it('should floor decimal values', () => {
      expect(formatCurrency(99.9)).toBe('99');
      expect(formatCurrency(100.5)).toBe('100');
    });
  });

  describe('getBuddyIncome', () => {
    it('should return 0 if no plot', () => {
      const buddy = createMockBuddy();
      expect(getBuddyIncome(buddy, undefined)).toBe(0);
    });

    it('should calculate income correctly', () => {
      const buddy = createMockBuddy({ baseIncome: 3, level: 2 });
      const plot = createMockPlot({ multiplier: 1.5 });
      
      // 3 * 2 * 1.5 = 9
      expect(getBuddyIncome(buddy, plot)).toBe(9);
    });
  });
});