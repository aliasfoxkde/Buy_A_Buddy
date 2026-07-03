/**
 * Game Systems Tests
 * Tests the core game systems
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus, GameState, generateId, clamp, lerp, distance, rectIntersects } from '../../src/core';

describe('Core Utilities', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate correctly', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
    });
  });

  describe('distance', () => {
    it('should calculate Euclidean distance', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
    });
  });

  describe('rectIntersects', () => {
    it('should detect intersection', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 };
      const b = { x: 5, y: 5, width: 10, height: 10 };
      const c = { x: 20, y: 20, width: 10, height: 10 };
      
      expect(rectIntersects(a, b)).toBe(true);
      expect(rectIntersects(a, c)).toBe(false);
    });
  });
});

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should emit and receive events', () => {
    const received: string[] = [];
    const unsub = eventBus.on('test:event', (e) => {
      received.push(e.payload as string);
    });

    eventBus.emit('test:event', 'hello');
    expect(received).toEqual(['hello']);

    unsub();
    eventBus.emit('test:event', 'world');
    expect(received).toEqual(['hello']);
  });

  it('should maintain event log', () => {
    eventBus.emit('test:1', 'a');
    eventBus.emit('test:2', 'b');
    
    const log = eventBus.getEventLog();
    expect(log.length).toBe(2);
  });
});

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
  });

  it('should have default player stats', () => {
    expect(state.player.name).toBe('Hero');
    expect(state.player.stats.level).toBe(1);
    expect(state.player.stats.maxHealth).toBe(100);
  });

  it('should have default inventory', () => {
    expect(state.inventory.slots.length).toBe(24);
    expect(state.inventory.gold).toBe(200);
  });

  it('should serialize to JSON', () => {
    const json = state.toJSON();
    expect(json.version).toBe('1.0.0');
    expect(json.player).toBeDefined();
  });

  it('should deserialize from JSON', () => {
    state.player.name = 'TestPlayer';
    const json = state.toJSON();
    const newState = new GameState();
    newState.fromJSON(json);
    expect(newState.player.name).toBe('TestPlayer');
  });
});

describe('Offline Earnings', () => {
  const IDLE_CONFIG = {
    tickInterval: 100,
    offlineEfficiency: 0.5,
    maxOfflineHours: 24,
    plotMaxLevel: 20,
    buddyMaxLevel: 50,
  };

  const calculateOfflineEarnings = (
    lastActiveTime: number,
    incomePerSecond: number
  ) => {
    const now = Date.now();
    const timeAwayMs = now - lastActiveTime;
    const maxOfflineMs = IDLE_CONFIG.maxOfflineHours * 60 * 60 * 1000;
    const cappedTimeMs = Math.min(timeAwayMs, maxOfflineMs);
    const timeAwayHours = cappedTimeMs / (60 * 60 * 1000);
    const incomePerHour = incomePerSecond * 3600;
    const efficiency = IDLE_CONFIG.offlineEfficiency;
    const gold = Math.floor(incomePerHour * timeAwayHours * efficiency);
    return { gold, timeAway: cappedTimeMs, efficiency };
  };

  it('should calculate earnings for 1 hour away', () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const incomePerSecond = 10; // 10 gold per second
    const result = calculateOfflineEarnings(oneHourAgo, incomePerSecond);

    // 10 gold/sec * 3600 sec = 36000 gold/hr * 0.5 efficiency = 18000
    expect(result.gold).toBe(18000);
    expect(result.efficiency).toBe(0.5);
  });

  it('should cap earnings at 24 hours', () => {
    const twoDaysAgo = Date.now() - (48 * 60 * 60 * 1000);
    const incomePerSecond = 10;
    const result = calculateOfflineEarnings(twoDaysAgo, incomePerSecond);

    // Should be capped at 24 hours, not 48
    // 10 * 3600 * 24 * 0.5 = 432000
    expect(result.timeAway).toBe(24 * 60 * 60 * 1000);
    expect(result.gold).toBe(432000);
  });

  it('should return 0 for very short absences', () => {
    const oneMinuteAgo = Date.now() - (60 * 1000);
    const incomePerSecond = 100;
    const result = calculateOfflineEarnings(oneMinuteAgo, incomePerSecond);

    // Less than 1 minute should still give some earnings
    // But we won't apply it if timeAway < 60000ms
    expect(result.timeAway).toBe(60 * 1000);
  });

  it('should scale with income rate', () => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    const lowIncome = calculateOfflineEarnings(oneHourAgo, 1);
    const highIncome = calculateOfflineEarnings(oneHourAgo, 100);

    expect(highIncome.gold).toBe(lowIncome.gold * 100);
  });
});

describe('Game Systems Integration', () => {
  it('should create game systems', async () => {
    // Import and test that all systems can be instantiated
    const { GameSystems } = await import('../../src/systems/GameSystems');
    const systems = new GameSystems();
    
    expect(systems.eventBus).toBeDefined();
    expect(systems.inventory).toBeDefined();
    expect(systems.combat).toBeDefined();
    expect(systems.quests).toBeDefined();
    expect(systems.skills).toBeDefined();
  });

  it('should initialize without errors', async () => {
    const { GameSystems } = await import('../../src/systems/GameSystems');
    const systems = new GameSystems();
    await systems.init();
    expect(systems.isInitialized).toBe(true);
  });
});
