/**
 * Skills Module Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus, EntityStats } from '../../src/core';
import { SkillSystem, Skill } from '../../src/modules/skills';

describe('SkillSystem', () => {
  let eventBus: EventBus;
  let skills: SkillSystem;
  let testStats: EntityStats;

  beforeEach(() => {
    eventBus = new EventBus();
    skills = new SkillSystem(eventBus);
    testStats = {
      maxHealth: 100,
      currentHealth: 100,
      maxMana: 50,
      currentMana: 50,
      attack: 15,
      defense: 5,
      speed: 10,
      luck: 5,
      level: 5,
      experience: 0,
      experienceToNextLevel: 100
    };
  });

  it('should have default skills registered', () => {
    const allSkills = skills.getAllSkills();
    expect(allSkills.length).toBeGreaterThan(0);
  });

  it('should retrieve skills by type', () => {
    const active = skills.getSkillsByType('active');
    const passive = skills.getSkillsByType('passive');
    
    expect(active.length).toBeGreaterThan(0);
    expect(passive.length).toBeGreaterThan(0);
    
    active.forEach(s => expect(s.type).toBe('active'));
    passive.forEach(s => expect(s.type).toBe('passive'));
  });

  it('should retrieve skills by element', () => {
    const fire = skills.getSkillsByElement('fire');
    const ice = skills.getSkillsByElement('ice');
    
    expect(fire.length).toBeGreaterThan(0);
    expect(ice.length).toBeGreaterThan(0);
  });

  it('should learn skills', () => {
    const learned = skills.learnSkill('player1', 'skill_power_strike');
    expect(learned).toBe(true);
    expect(skills.hasSkill('player1', 'skill_power_strike')).toBe(true);
  });

  it('should not learn same skill twice', () => {
    skills.learnSkill('player1', 'skill_power_strike');
    const learnedAgain = skills.learnSkill('player1', 'skill_power_strike');
    expect(learnedAgain).toBe(false);
  });

  it('should not learn non-existent skills', () => {
    const learned = skills.learnSkill('player1', 'skill_fake_skill');
    expect(learned).toBe(false);
  });

  it('should get learned skills', () => {
    skills.learnSkill('player1', 'skill_power_strike');
    skills.learnSkill('player1', 'skill_fireball');
    
    const playerSkills = skills.getLearnedSkills('player1');
    expect(playerSkills.length).toBe(2);
  });

  it('should check if skill can be used with insufficient mana', () => {
    skills.learnSkill('player1', 'skill_fireball');
    
    // Not enough mana
    testStats.currentMana = 5;
    const canNotUse = skills.canUseSkill('player1', 'skill_fireball', testStats);
    expect(canNotUse.canUse).toBe(false);
  });

  it('should check if skill can be used with enough mana', () => {
    skills.learnSkill('player1', 'skill_power_strike');
    
    // Enough mana
    testStats.currentMana = 50;
    const canUse = skills.canUseSkill('player1', 'skill_power_strike', testStats);
    expect(canUse.canUse).toBe(true);
  });

  it('should use skills and start cooldown', () => {
    skills.learnSkill('player1', 'skill_power_strike');
    const used = skills.useSkill('player1', 'skill_power_strike');
    
    expect(used).toBe(true);
    const cooldown = skills.getCooldown('player1', 'skill_power_strike');
    expect(cooldown).toBeGreaterThan(0);
  });

  it('should reduce cooldowns over time', () => {
    skills.learnSkill('player1', 'skill_power_strike');
    skills.useSkill('player1', 'skill_power_strike');
    
    const initialCooldown = skills.getCooldown('player1', 'skill_power_strike');
    
    skills.update(1); // 1 second passed
    
    const newCooldown = skills.getCooldown('player1', 'skill_power_strike');
    expect(newCooldown).toBeLessThan(initialCooldown);
  });

  it('should emit skill cast events', () => {
    const events: any[] = [];
    eventBus.on('skill:cast', (e) => events.push(e));
    
    skills.learnSkill('player1', 'skill_power_strike');
    skills.useSkill('player1', 'skill_power_strike');
    
    expect(events.length).toBe(1);
    expect(events[0].payload.skillId).toBe('skill_power_strike');
  });

  it('should update cooldowns correctly', () => {
    skills.learnSkill('player1', 'skill_power_strike');
    skills.useSkill('player1', 'skill_power_strike');
    
    // Cooldown should be 3 seconds
    let cooldown = skills.getCooldown('player1', 'skill_power_strike');
    expect(cooldown).toBeCloseTo(3, 0);
    
    // After 2 seconds
    skills.update(2);
    cooldown = skills.getCooldown('player1', 'skill_power_strike');
    expect(cooldown).toBeCloseTo(1, 0);
    
    // After full time
    skills.update(2);
    cooldown = skills.getCooldown('player1', 'skill_power_strike');
    expect(cooldown).toBe(0);
  });

  it('should check skill requirements before use', () => {
    // First verify canUseSkill returns false for unlearned skill
    const canUse = skills.canUseSkill('player1', 'skill_power_strike', testStats);
    expect(canUse.canUse).toBe(false);
    expect(canUse.reason).toBe('Skill not learned');
    
    // After learning, should be able to use
    skills.learnSkill('player1', 'skill_power_strike');
    const canUseAfter = skills.canUseSkill('player1', 'skill_power_strike', testStats);
    expect(canUseAfter.canUse).toBe(true);
  });

  it('should emit skill learn events', () => {
    const events: any[] = [];
    eventBus.on('skill:learn', (e) => events.push(e));
    
    skills.learnSkill('player1', 'skill_heal');
    
    expect(events.length).toBe(1);
  });
});

describe('Skill Properties', () => {
  let eventBus: EventBus;
  let skills: SkillSystem;

  beforeEach(() => {
    eventBus = new EventBus();
    skills = new SkillSystem(eventBus);
  });

  it('should have proper costs', () => {
    const allSkills = skills.getAllSkills();
    allSkills.forEach(skill => {
      if (skill.type === 'active') {
        expect(skill.costs).toBeDefined();
      }
    });
  });

  it('should have proper cooldowns', () => {
    const allSkills = skills.getAllSkills();
    allSkills.forEach(skill => {
      if (skill.type === 'active') {
        expect(skill.cooldown).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it('should have required levels', () => {
    const allSkills = skills.getAllSkills();
    allSkills.forEach(skill => {
      expect(skill.requiredLevel).toBeGreaterThan(0);
    });
  });

  it('should have icons', () => {
    const allSkills = skills.getAllSkills();
    allSkills.forEach(skill => {
      expect(skill.icon).toBeDefined();
      expect(skill.icon.length).toBeGreaterThan(0);
    });
  });

  it('should have proper skill types', () => {
    const allSkills = skills.getAllSkills();
    const validTypes = ['active', 'passive', 'toggle'];
    
    allSkills.forEach(skill => {
      expect(validTypes).toContain(skill.type);
    });
  });

  it('should have proper elements', () => {
    const allSkills = skills.getAllSkills();
    const validElements = ['physical', 'fire', 'ice', 'lightning', 'earth', 'dark', 'light', 'neutral'];
    
    allSkills.forEach(skill => {
      expect(validElements).toContain(skill.element);
    });
  });
});
