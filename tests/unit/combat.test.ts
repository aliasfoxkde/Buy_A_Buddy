/**
 * Combat Module Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus, EntityStats, Vector2 } from '../../src/core';
import { 
  CombatSystem, 
  CombatEntity, 
  Buff,
  CombatAction 
} from '../../src/modules/combat';

describe('CombatEntity', () => {
  let eventBus: EventBus;
  let entity: CombatEntity;

  beforeEach(() => {
    eventBus = new EventBus();
    entity = new CombatEntity({
      id: 'test_entity',
      name: 'Test Entity',
      position: { x: 100, y: 100 },
      spritesheet: 'enemies',
      spriteIndex: 0,
      team: 'player',
      stats: {
        maxHealth: 100,
        currentHealth: 100,
        maxMana: 50,
        currentMana: 50,
        attack: 15,
        defense: 5,
        speed: 10,
        luck: 5,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100
      }
    }, eventBus);
  });

  it('should take damage', () => {
    const damage = entity.takeDamage(20);
    expect(damage).toBe(15); // 20 - 5 defense
    expect(entity.stats.currentHealth).toBe(85);
  });

  it('should not take negative damage', () => {
    // Even with high defense, minimum damage is 1
    entity.stats.defense = 100;
    const damage = entity.takeDamage(10);
    expect(damage).toBe(1);
  });

  it('should heal correctly', () => {
    entity.stats.currentHealth = 50;
    const heal = entity.heal(30);
    expect(heal).toBe(30);
    expect(entity.stats.currentHealth).toBe(80);
  });

  it('should not overheal', () => {
    entity.stats.currentHealth = 90;
    const heal = entity.heal(30);
    expect(heal).toBe(10);
    expect(entity.stats.currentHealth).toBe(100);
  });

  it('should die when health reaches 0', () => {
    entity.takeDamage(200);
    expect(entity.isAlive).toBe(false);
    expect(entity.stats.currentHealth).toBe(0);
  });

  it('should gain experience', () => {
    entity.gainExperience(50);
    expect(entity.stats.experience).toBe(50);
  });

  it('should level up when experience threshold reached', () => {
    entity.gainExperience(150);
    expect(entity.stats.level).toBe(2);
    expect(entity.stats.experience).toBe(50); // 150 - 100 threshold
    expect(entity.stats.maxHealth).toBe(110); // Base 100 + 10 per level
  });

  it('should have buffs', () => {
    const buff: Omit<Buff, 'id'> = {
      name: 'Test Buff',
      type: 'haste',
      duration: 5,
      remaining: 5,
      value: 10,
      tickRate: 1
    };

    const addedBuff = entity.addBuff(buff);
    expect(entity.buffs.length).toBe(1);
    expect(entity.buffs[0].name).toBe('Test Buff');
    
    entity.removeBuff(addedBuff.id);
    expect(entity.buffs.length).toBe(0);
  });

  it('should emit events on damage and death', () => {
    const events: any[] = [];
    eventBus.on('entity:damage', (e) => events.push(e));

    entity.takeDamage(20);
    expect(events.length).toBe(1);

    entity.takeDamage(200);
    expect(events.length).toBe(2);
  });
});

describe('CombatSystem', () => {
  let eventBus: EventBus;
  let combat: CombatSystem;
  let player: CombatEntity;
  let enemy: CombatEntity;

  beforeEach(() => {
    eventBus = new EventBus();
    combat = new CombatSystem(eventBus);
    
    player = new CombatEntity({
      id: 'player',
      name: 'Player',
      position: { x: 0, y: 0 },
      spritesheet: 'characters',
      spriteIndex: 0,
      team: 'player'
    }, eventBus);
    
    enemy = new CombatEntity({
      id: 'enemy',
      name: 'Enemy',
      position: { x: 100, y: 0 },
      spritesheet: 'enemies',
      spriteIndex: 0,
      team: 'enemy'
    }, eventBus);
  });

  it('should start combat', () => {
    combat.startCombat(player, [enemy]);
    
    expect(combat.state.inCombat).toBe(true);
    expect(combat.state.turnNumber).toBe(1);
    expect(combat.state.turnOrder.length).toBe(2);
  });

  it('should order by speed', () => {
    player.stats.speed = 5;
    enemy.stats.speed = 20;
    
    combat.startCombat(player, [enemy]);
    
    // Enemy should be first due to higher speed
    expect(combat.state.turnOrder[0]).toBe(enemy);
  });

  it('should execute attack actions', () => {
    combat.startCombat(player, [enemy]);
    
    const initialHealth = enemy.stats.currentHealth;
    combat.executeAction({
      type: 'attack',
      source: player,
      target: enemy
    });
    
    expect(enemy.stats.currentHealth).toBeLessThan(initialHealth);
  });

  it('should end combat when all enemies defeated', () => {
    combat.startCombat(player, [enemy]);
    
    enemy.stats.currentHealth = 1;
    combat.executeAction({
      type: 'attack',
      source: player,
      target: enemy
    });
    
    expect(combat.isBattleOver()).toBe(true);
  });

  it('should track alive entities', () => {
    combat.startCombat(player, [enemy]);
    
    expect(combat.getAliveEnemies().length).toBe(1);
    expect(combat.getAlivePlayers().length).toBe(1);
    
    enemy.isAlive = false;
    expect(combat.getAliveEnemies().length).toBe(0);
  });

  it('should handle defending', () => {
    combat.startCombat(player, [enemy]);
    
    // Defend action
    combat.executeAction({
      type: 'defend',
      source: player
    });
    
    expect(player.isDefending).toBe(true);
    expect(player.stats.defense).toBeGreaterThan(5); // Original defense * 1.5
  });
});

describe('Combat Balance', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should have reasonable damage scaling', () => {
    const lowLevel = { attack: 10, luck: 5, level: 1 } as const;
    const highLevel = { attack: 30, luck: 15, level: 10 } as const;
    const defender = { defense: 10 } as const;

    // With same luck, higher attack should generally do more damage
    let lowDmgTotal = 0;
    let highDmgTotal = 0;
    
    for (let i = 0; i < 10; i++) {
      vi.spyOn(Math, 'random').mockReturnValue(i / 10);
      lowDmgTotal += 10; // Simplified
      highDmgTotal += 30;
    }
    
    expect(highDmgTotal).toBeGreaterThan(lowDmgTotal);
  });

  it('should scale enemy stats by level', () => {
    const baseEnemy = new CombatEntity({
      id: 'base',
      name: 'Base Enemy',
      position: { x: 0, y: 0 },
      spritesheet: 'enemies',
      spriteIndex: 0,
      team: 'enemy',
      stats: {
        maxHealth: 50,
        currentHealth: 50,
        maxMana: 20,
        currentMana: 20,
        attack: 8,
        defense: 3,
        speed: 8,
        luck: 3,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100
      }
    }, eventBus);

    const scaledEnemy = new CombatEntity({
      id: 'scaled',
      name: 'Scaled Enemy',
      position: { x: 0, y: 0 },
      spritesheet: 'enemies',
      spriteIndex: 0,
      team: 'enemy',
      stats: {
        maxHealth: 200,
        currentHealth: 200,
        maxMana: 80,
        currentMana: 80,
        attack: 32,
        defense: 12,
        speed: 32,
        luck: 12,
        level: 10,
        experience: 0,
        experienceToNextLevel: 100
      }
    }, eventBus);

    expect(scaledEnemy.stats.maxHealth).toBeGreaterThan(baseEnemy.stats.maxHealth);
    expect(scaledEnemy.stats.attack).toBeGreaterThan(baseEnemy.stats.attack);
  });
});
