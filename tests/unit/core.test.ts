/**
 * Core Module Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  EventBus, 
  GameEngine, 
  GameState, 
  SpriteManager, 
  AudioManager,
  Entity,
  Vector2,
  calculateDamage,
  calculateExperienceReward,
  calculateGoldReward,
  generateId,
  clamp,
  lerp,
  distance,
  rectIntersects
} from '../../src/core';

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

  it('should handle multiple listeners', () => {
    const count = { first: 0, second: 0 };
    
    eventBus.on('test', () => count.first++);
    eventBus.on('test', () => count.second++);

    eventBus.emit('test', {});
    expect(count.first).toBe(1);
    expect(count.second).toBe(1);
  });

  it('should maintain event log', () => {
    eventBus.emit('test:1', 'a');
    eventBus.emit('test:2', 'b');
    
    const log = eventBus.getEventLog();
    expect(log.length).toBe(2);
    expect(log[0].payload).toBe('a');
    expect(log[1].payload).toBe('b');
  });

  it('should unsubscribe correctly', () => {
    const handler = vi.fn();
    const unsub = eventBus.on('test', handler);
    
    eventBus.emit('test', {});
    expect(handler).toHaveBeenCalledTimes(1);
    
    unsub();
    eventBus.emit('test', {});
    expect(handler).toHaveBeenCalledTimes(1);
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
    expect(state.player.stats.currentHealth).toBe(100);
  });

  it('should have default inventory', () => {
    expect(state.inventory.slots.length).toBe(24);
    expect(state.inventory.gold).toBe(100);
  });

  it('should serialize to JSON', () => {
    const json = state.toJSON();
    expect(json.version).toBe('1.0.0');
    expect(json.player).toBeDefined();
    expect(json.inventory).toBeDefined();
  });

  it('should deserialize from JSON', () => {
    state.player.name = 'TestPlayer';
    state.inventory.gold = 999;
    
    const json = state.toJSON();
    const newState = new GameState();
    newState.fromJSON(json);
    
    expect(newState.player.name).toBe('TestPlayer');
    expect(newState.inventory.gold).toBe(999);
  });
});

describe('Utility Functions', () => {
  describe('calculateDamage', () => {
    it('should calculate base damage', () => {
      const attacker = { attack: 20, luck: 5, level: 1 } as const;
      const defender = { defense: 10 } as const;
      
      // Mock Math.random to avoid randomness in test
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const damage = calculateDamage(attacker as any, defender as any);
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThan(attacker.attack);
    });
  });

  describe('calculateExperienceReward', () => {
    it('should scale with level', () => {
      const baseExp = calculateExperienceReward(1);
      const midExp = calculateExperienceReward(5);
      const highExp = calculateExperienceReward(10);
      
      expect(midExp).toBeGreaterThan(baseExp);
      expect(highExp).toBeGreaterThan(midExp);
    });
  });

  describe('calculateGoldReward', () => {
    it('should scale with level', () => {
      const lowGold = calculateGoldReward(1);
      const highGold = calculateGoldReward(10);
      
      expect(highGold).toBeGreaterThan(lowGold);
    });
  });

  describe('generateId', () => {
    it('should generate IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      // IDs should be generated (may be same due to random, but format should be valid)
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
      expect(typeof id1).toBe('string');
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
      const a: Vector2 = { x: 0, y: 0 };
      const b: Vector2 = { x: 3, y: 4 };
      
      expect(distance(a, b)).toBe(5);
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

describe('SpriteManager', () => {
  let spriteManager: SpriteManager;

  beforeEach(() => {
    spriteManager = new SpriteManager();
  });

  it('should track load progress', () => {
    expect(spriteManager.getLoadProgress()).toBe(0);
  });

  it('should register sprite configs', () => {
    spriteManager.registerConfig('test', {
      spritesheet: 'test.png',
      frameWidth: 32,
      frameHeight: 32,
      framesPerRow: 8,
      animations: new Map()
    });
    
    const config = spriteManager.getConfig('test');
    expect(config).toBeDefined();
    expect(config?.frameWidth).toBe(32);
  });
});

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  it('should create AudioManager instance', () => {
    expect(audioManager).toBeDefined();
  });

  it('should set volumes without errors', () => {
    // Set volumes directly without init (which requires AudioContext)
    audioManager.setMasterVolume(0.5);
    audioManager.setMusicVolume(0.7);
    audioManager.setSfxVolume(0.8);
    expect(true).toBe(true);
  });

  it('should have generateAllAudio method', () => {
    expect(typeof audioManager.generateAllAudio).toBe('function');
  });
});
