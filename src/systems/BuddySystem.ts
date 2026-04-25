/**
 * Buddy System - Companion following and abilities
 */

import Phaser from 'phaser';

export interface BuddyConfig {
  id: string;
  name: string;
  sprite: string;
  level: number;
  experience: number;
  
  // Stats
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  
  // Position offset from player
  offsetX: number;
  offsetY: number;
  
  // Combat
  canAttack: boolean;
  attackRange: number;
  attackCooldown: number;
  
  // Abilities
  abilities: string[];
  
  // Evolution
  evolutionLevel?: number;
  evolvesFrom?: string;
  evolvesTo?: string;
}

export const BUDDY_TEMPLATES: Record<string, BuddyConfig> = {
  buddy_1_1: {
    id: 'buddy_1_1',
    name: 'Petal Fairy',
    sprite: 'buddies',
    level: 1,
    experience: 0,
    maxHealth: 50,
    attack: 8,
    defense: 3,
    speed: 12,
    offsetX: -30,
    offsetY: 25,
    canAttack: true,
    attackRange: 100,
    attackCooldown: 2,
    abilities: ['fairy_heal', 'fairy_blessing'],
    evolvesTo: 'buddy_1_4'
  },
  
  buddy_1_2: {
    id: 'buddy_1_2',
    name: 'Twilight Petal',
    sprite: 'buddies',
    level: 1,
    experience: 0,
    maxHealth: 40,
    attack: 12,
    defense: 2,
    speed: 14,
    offsetX: -30,
    offsetY: 25,
    canAttack: true,
    attackRange: 80,
    attackCooldown: 1.5,
    abilities: ['quick_strike', 'double_hit'],
    evolvesTo: 'buddy_1_5'
  },
  
  buddy_2_1: {
    id: 'buddy_2_1',
    name: 'Hollow Ghost',
    sprite: 'buddies',
    level: 1,
    experience: 0,
    maxHealth: 35,
    attack: 15,
    defense: 1,
    speed: 10,
    offsetX: -30,
    offsetY: 25,
    canAttack: true,
    attackRange: 120,
    attackCooldown: 2.5,
    abilities: ['shadow_strike', 'phase'],
    evolvesTo: 'buddy_2_4'
  },
  
  slime_buddy: {
    id: 'slime_buddy',
    name: 'Slime Buddy',
    sprite: 'buddies',
    level: 1,
    experience: 0,
    maxHealth: 60,
    attack: 5,
    defense: 8,
    speed: 6,
    offsetX: -30,
    offsetY: 25,
    canAttack: false,
    attackRange: 0,
    attackCooldown: 0,
    abilities: ['bounce', 'slime_shield']
  }
};

/**
 * Buddy Entity - Handles buddy sprite and following
 */
export class BuddyEntity {
  private scene: Phaser.Scene;
  private sprite!: Phaser.GameObjects.Sprite;
  private config: BuddyConfig;
  private targetPosition: { x: number; y: number } = { x: 0, y: 0 };
  private isFollowing: boolean = true;
  private lastAttackTime: number = 0;
  
  // Animation state
  private animationState: 'idle' | 'walk' | 'attack' | 'hurt' = 'idle';
  
  constructor(scene: Phaser.Scene, config: BuddyConfig) {
    this.scene = scene;
    this.config = { ...config };
    this.createSprite();
  }
  
  private createSprite(): void {
    // Create sprite
    this.sprite = this.scene.add.sprite(0, 0, this.config.sprite);
    this.sprite.setScale(0.8);
    this.sprite.setDepth(50);
    
    // Set initial frame based on buddy type
    const frameMap: Record<string, number> = {
      'buddy_1_1': 0,
      'buddy_1_2': 1,
      'buddy_2_1': 6,
      'slime_buddy': 12
    };
    this.sprite.setFrame(frameMap[this.config.id] || 0);
  }
  
  /**
   * Follow player position
   */
  follow(targetX: number, targetY: number): void {
    if (!this.isFollowing) return;
    
    // Calculate target position (behind and to the side of player)
    const angle = Math.atan2(
      targetY - this.targetPosition.y,
      targetX - this.targetPosition.x
    );
    
    const followX = targetX + Math.cos(angle) * Math.abs(this.config.offsetX) + this.config.offsetX * 0.5;
    const followY = targetY + this.config.offsetY;
    
    // Smooth follow with lerp
    const lerpFactor = 0.08;
    const newX = Phaser.Math.Linear(this.sprite.x, followX, lerpFactor);
    const newY = Phaser.Math.Linear(this.sprite.y, followY, lerpFactor);
    
    this.sprite.setPosition(newX, newY);
    this.targetPosition = { x: targetX, y: targetY };
    
    // Update animation based on movement
    const moved = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      followX, followY
    ) > 5;
    
    if (moved && this.animationState !== 'walk') {
      this.setAnimation('walk');
    } else if (!moved && this.animationState === 'walk') {
      this.setAnimation('idle');
    }
  }
  
  /**
   * Set animation state
   */
  setAnimation(state: 'idle' | 'walk' | 'attack' | 'hurt'): void {
    if (this.animationState === state) return;
    this.animationState = state;
    
    // Stop any existing tweens on this sprite
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(0.8); // Reset scale
    
    switch (state) {
      case 'idle':
        // Simple pulse animation
        this.scene.tweens.add({
          targets: this.sprite,
          scaleX: 0.82,
          scaleY: 0.82,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;
        
      case 'walk':
        // Simple bounce
        this.scene.tweens.add({
          targets: this.sprite,
          y: this.sprite.y - 5,
          duration: 150,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;
        
      case 'attack':
        this.playAttackAnimation();
        break;
        
      case 'hurt':
        // Red flash
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: 0.5,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.sprite.setAlpha(1);
          }
        });
        break;
    }
  }
  
  /**
   * Play attack animation
   */
  private playAttackAnimation(): void {
    // Quick flash/scale animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.sprite.setScale(0.8);
        this.setAnimation('idle');
      }
    });
  }
  
  /**
   * Can buddy attack?
   */
  canAttack(): boolean {
    return this.config.canAttack;
  }
  
  /**
   * Attack cooldown check
   */
  canAttackNow(): boolean {
    if (!this.config.canAttack) return false;
    
    const now = this.scene.time.now;
    return (now - this.lastAttackTime) / 1000 >= this.config.attackCooldown;
  }
  
  /**
   * Perform attack
   */
  attack(targetX: number, targetY: number): void {
    if (!this.canAttackNow()) return;
    
    this.lastAttackTime = this.scene.time.now;
    
    // Move towards target briefly
    const angle = Math.atan2(targetY - this.sprite.y, targetX - this.sprite.x);
    const attackDistance = 20;
    
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x + Math.cos(angle) * attackDistance,
      y: this.sprite.y + Math.sin(angle) * attackDistance,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        // Return to following
        this.isFollowing = true;
      }
    });
    
    this.setAnimation('attack');
    this.isFollowing = false;
    
    // Emit attack event
    this.scene.events.emit('buddy:attack', {
      buddy: this.config.id,
      damage: this.config.attack,
      position: { x: targetX, y: targetY }
    });
  }
  
  /**
   * Give experience to buddy
   */
  addExperience(amount: number): void {
    this.config.experience += amount;
    
    // Check for level up
    const expNeeded = this.calculateExpForLevel(this.config.level + 1);
    if (this.config.experience >= expNeeded) {
      this.levelUp();
    }
  }
  
  /**
   * Level up buddy
   */
  private levelUp(): void {
    this.config.level++;
    this.config.experience = 0;
    
    // Stat increases
    this.config.maxHealth = Math.floor(this.config.maxHealth * 1.15);
    this.config.attack = Math.floor(this.config.attack * 1.1);
    this.config.defense = Math.floor(this.config.defense * 1.1);
    
    // Check evolution
    if (this.config.evolvesTo && this.config.level >= (this.config.evolutionLevel || 10)) {
      this.evolve();
    }
    
    // Emit level up event
    this.scene.events.emit('buddy:levelup', {
      buddy: this.config.id,
      newLevel: this.config.level
    });
  }
  
  /**
   * Evolve to next form
   */
  evolve(): void {
    if (!this.config.evolvesTo) return;
    
    const newConfig = BUDDY_TEMPLATES[this.config.evolvesTo];
    if (!newConfig) return;
    
    // Flash effect
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        // Change sprite
        this.config = { ...newConfig, level: this.config.level, experience: this.config.experience };
        this.sprite.setScale(1.0); // Slightly larger after evolution
        
        this.scene.events.emit('buddy:evolve', {
          from: this.config.evolvesFrom,
          to: this.config.id,
          newConfig: this.config
        });
      }
    });
  }
  
  /**
   * Calculate exp needed for level
   */
  private calculateExpForLevel(level: number): number {
    return Math.floor(50 * Math.pow(level, 1.5));
  }
  
  /**
   * Get buddy position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }
  
  /**
   * Get buddy config
   */
  getConfig(): BuddyConfig {
    return { ...this.config };
  }
  
  /**
   * Set position
   */
  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.targetPosition = { x, y };
  }
  
  /**
   * Show/hide buddy
   */
  setVisible(visible: boolean): void {
    this.sprite.setVisible(visible);
  }
  
  /**
   * Set depth
   */
  setDepth(depth: number): void {
    this.sprite.setDepth(depth);
  }
  
  destroy(): void {
    this.sprite.destroy();
  }
}

/**
 * Buddy Manager - Handles all buddy instances
 */
export class BuddyManager {
  private scene: Phaser.Scene;
  private buddies: Map<string, BuddyEntity> = new Map();
  private activeBuddy?: BuddyEntity;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Spawn a buddy
   */
  spawn(buddyId: string, x: number, y: number): BuddyEntity {
    const config = BUDDY_TEMPLATES[buddyId];
    if (!config) {
      console.warn('Buddy template not found:', buddyId);
      return null as unknown as BuddyEntity;
    }
    
    const buddy = new BuddyEntity(this.scene, config);
    buddy.setPosition(x, y);
    buddy.setDepth(50);
    
    this.buddies.set(buddyId, buddy);
    this.activeBuddy = buddy;
    
    return buddy;
  }
  
  /**
   * Get active buddy
   */
  getActiveBuddy(): BuddyEntity | undefined {
    return this.activeBuddy;
  }
  
  /**
   * Update all buddies
   */
  update(playerX: number, playerY: number): void {
    this.activeBuddy?.follow(playerX, playerY);
  }
  
  /**
   * Clear all buddies
   */
  destroy(): void {
    this.buddies.forEach(buddy => buddy.destroy());
    this.buddies.clear();
    this.activeBuddy = undefined;
  }
}
