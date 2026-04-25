// ==========================================
// GAME SYSTEMS TESTS
// ==========================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  IdleSystem,
  SpawnerSystem,
  BattleSystem,
  QuestSystem,
  BreedingSystem,
  ValidationSystem,
  SaveSystem,
  DebugSystem,
  LogLevel,
} from '../../src/systems/GameSystems';
import {
  createInitialGameState,
  type GameState,
  type Buddy,
  createBuddy,
} from '../../src/game/types';
import {
  getSpawnCost,
  getBuddyUpgradeCost,
  getPlotUpgradeCost,
} from '../../src/config/constants';

describe('IdleSystem', () => {
  let gameState: GameState;
  let idleSystem: IdleSystem;

  beforeEach(() => {
    gameState = createInitialGameState('TestPlayer');
    idleSystem = new IdleSystem(gameState);
  });

  describe('calculateIncomePerSecond', () => {
    it('should return 0 with no buddies', () => {
      expect(idleSystem.calculateIncomePerSecond()).toBe(0);
    });

    it('should calculate income for working buddy', () => {
      const buddy = createBuddy('TestBuddy', 'common');
      buddy.isWorking = true;
      gameState.buddies.push(buddy);
      gameState.plots[0].buddyId = buddy.id;

      // Income = baseIncome(1) * level(1) * multiplier(1) = 1
      expect(idleSystem.calculateIncomePerSecond()).toBe(1);
    });

    it('should multiply by plot level', () => {
      const buddy = createBuddy('TestBuddy', 'common');
      buddy.isWorking = true;
      gameState.buddies.push(buddy);
      gameState.plots[0].buddyId = buddy.id;
      gameState.plots[0].multiplier = 2;

      expect(idleSystem.calculateIncomePerSecond()).toBe(2);
    });

    it('should multiply by buddy level', () => {
      const buddy = createBuddy('TestBuddy', 'common');
      buddy.level = 5;
      buddy.isWorking = true;
      gameState.buddies.push(buddy);
      gameState.plots[0].buddyId = buddy.id;

      // Income = baseIncome(1) * level(5) * multiplier(1) = 5
      expect(idleSystem.calculateIncomePerSecond()).toBe(5);
    });

    it('should sum income from multiple buddies', () => {
      const buddy1 = createBuddy('Buddy1', 'common');
      const buddy2 = createBuddy('Buddy2', 'rare');
      buddy1.isWorking = true;
      buddy2.isWorking = true;
      gameState.buddies.push(buddy1, buddy2);
      gameState.plots[0].buddyId = buddy1.id;
      gameState.plots[1].buddyId = buddy2.id;

      // Income = 1*1*1 + 2*1*1 = 3
      expect(idleSystem.calculateIncomePerSecond()).toBe(3);
    });
  });

  describe('calculateOfflineEarnings', () => {
    it('should return 0 for no time away', () => {
      expect(idleSystem.calculateOfflineEarnings(0)).toBe(0);
    });

    it('should calculate offline earnings with 50% efficiency', () => {
      const buddy = createBuddy('TestBuddy', 'rare');
      buddy.isWorking = true;
      gameState.buddies.push(buddy);
      gameState.plots[0].buddyId = buddy.id;

      // 1 hour, income = 2/s, efficiency = 50%
      const earnings = idleSystem.calculateOfflineEarnings(3600000);
      expect(earnings).toBe(3600); // 2 * 3600 * 0.5
    });

    it('should cap at 24 hours', () => {
      const buddy = createBuddy('TestBuddy', 'common');
      buddy.isWorking = true;
      gameState.buddies.push(buddy);
      gameState.plots[0].buddyId = buddy.id;

      // 48 hours should cap at 24 hours
      const earnings = idleSystem.calculateOfflineEarnings(48 * 3600000);
      const maxEarnings = 1 * 24 * 3600 * 0.5;
      expect(earnings).toBeCloseTo(maxEarnings, 0);
    });
  });

  describe('getPlotUtilization', () => {
    it('should return 0 with no buddies', () => {
      expect(idleSystem.getPlotUtilization()).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      const buddy = createBuddy('TestBuddy', 'common');
      buddy.isWorking = true;
      gameState.buddies.push(buddy);
      gameState.plots[0].buddyId = buddy.id;

      // 1 of 9 plots = 11.11%
      expect(idleSystem.getPlotUtilization()).toBeCloseTo(11.11, 1);
    });
  });
});

describe('SpawnerSystem', () => {
  let gameState: GameState;
  let spawnerSystem: SpawnerSystem;

  beforeEach(() => {
    gameState = createInitialGameState('TestPlayer');
    spawnerSystem = new SpawnerSystem(gameState);
  });

  describe('spawnBuddy', () => {
    it('should spawn buddy with enough coins', () => {
      gameState.player.coins = 1000;
      const result = spawnerSystem.spawnBuddy();
      
      expect(result.success).toBe(true);
      expect(result.buddy).toBeDefined();
      expect(result.buddy!.rarity).toBeDefined();
    });

    it('should deduct cost from player', () => {
      gameState.player.coins = 1000;
      const cost = getSpawnCost(0);
      
      spawnerSystem.spawnBuddy();
      
      expect(gameState.player.coins).toBe(1000 - cost);
    });

    it('should fail with insufficient funds', () => {
      gameState.player.coins = 5;
      const result = spawnerSystem.spawnBuddy();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_FUNDS');
    });

    it('should respect forced rarity', () => {
      gameState.player.coins = 1000;
      const result = spawnerSystem.spawnBuddy('legendary');
      
      expect(result.success).toBe(true);
      expect(result.rarity).toBe('legendary');
    });

    it('should track statistics', () => {
      gameState.player.coins = 1000;
      spawnerSystem.spawnBuddy();
      
      expect(gameState.statistics.buddiesSpawned).toBe(1);
    });
  });

  describe('getRarityProbabilities', () => {
    it('should return valid probabilities', () => {
      const probs = spawnerSystem.getRarityProbabilities();
      
      expect(probs.common).toBeGreaterThan(0);
      expect(probs.rare).toBeGreaterThan(0);
      expect(probs.epic).toBeGreaterThan(0);
      expect(probs.legendary).toBeGreaterThan(0);
      
      // Should sum to 100
      const total = probs.common + probs.rare + probs.epic + probs.legendary;
      expect(total).toBeCloseTo(100, 1);
    });
  });
});

describe('ValidationSystem', () => {
  let validationSystem: ValidationSystem;

  beforeEach(() => {
    validationSystem = new ValidationSystem();
  });

  describe('validateGameState', () => {
    it('should pass for valid state', () => {
      const state = createInitialGameState('Test');
      const result = validationSystem.validateGameState(state);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect negative coins', () => {
      const state = createInitialGameState('Test');
      state.player.coins = -100;
      
      const result = validationSystem.validateGameState(state);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Player coins cannot be negative');
    });

    it('should detect invalid player level', () => {
      const state = createInitialGameState('Test');
      state.player.level = 0;
      
      const result = validationSystem.validateGameState(state);
      
      expect(result.valid).toBe(false);
    });

    it('should detect orphaned plot references', () => {
      const state = createInitialGameState('Test');
      state.plots[0].buddyId = 'non-existent-buddy';
      
      const result = validationSystem.validateGameState(state);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('non-existent'))).toBe(true);
    });
  });

  describe('validateMovementInput', () => {
    it('should normalize diagonal movement', () => {
      const result = validationSystem.validateMovementInput(1, 1, 120);
      
      expect(result.normalizedX).toBeCloseTo(0.707, 2);
      expect(result.normalizedY).toBeCloseTo(0.707, 2);
      expect(result.magnitude).toBeCloseTo(1.414, 2);
    });

    it('should handle single direction', () => {
      const result = validationSystem.validateMovementInput(0, 1, 120);
      
      expect(result.normalizedX).toBe(0);
      expect(result.normalizedY).toBe(1);
      expect(result.magnitude).toBe(1);
    });

    it('should handle no movement', () => {
      const result = validationSystem.validateMovementInput(0, 0, 120);
      
      expect(result.magnitude).toBe(0);
    });
  });
});

describe('SaveSystem', () => {
  let saveSystem: SaveSystem;
  let gameState: GameState;

  beforeEach(() => {
    saveSystem = new SaveSystem('test-save');
    gameState = createInitialGameState('TestPlayer');
  });

  afterEach(() => {
    saveSystem.delete();
  });

  describe('save and load', () => {
    it('should save and load game state', () => {
      gameState.player.coins = 500;
      
      const success = saveSystem.save(gameState);
      expect(success).toBe(true);
      
      const loaded = saveSystem.load();
      expect(loaded).not.toBeNull();
      expect(loaded!.player.coins).toBe(500);
    });

    it('should return null when no save exists', () => {
      const loaded = saveSystem.load();
      expect(loaded).toBeNull();
    });
  });

  describe('export and import', () => {
    it('should export and import save correctly', () => {
      gameState.player.coins = 999;
      
      const exported = saveSystem.export(gameState);
      expect(typeof exported).toBe('string');
      
      const imported = saveSystem.import(exported);
      expect(imported).not.toBeNull();
      expect(imported!.player.coins).toBe(999);
    });

    it('should return null for invalid base64', () => {
      const result = saveSystem.import('not-valid-base64!!!');
      expect(result).toBeNull();
    });
  });
});

describe('DebugSystem', () => {
  let debugSystem: DebugSystem;
  let gameState: GameState;

  beforeEach(() => {
    gameState = createInitialGameState('TestPlayer');
    debugSystem = new DebugSystem(gameState);
  });

  describe('log', () => {
    it('should not throw', () => {
      expect(() => debugSystem.log(LogLevel.INFO, 'Test message')).not.toThrow();
    });
  });

  describe('debugAddCoins', () => {
    it('should add coins to player', () => {
      const initial = gameState.player.coins;
      debugSystem.debugAddCoins(100);
      
      expect(gameState.player.coins).toBe(initial + 100);
    });
  });

  describe('generateReport', () => {
    it('should generate valid report', () => {
      const report = debugSystem.generateReport();
      
      expect(report.timestamp).toBeDefined();
      expect(report.player.name).toBe('TestPlayer');
      expect(report.buddies).toBe(0);
      expect(report.plots).toBe(9);
    });
  });
});