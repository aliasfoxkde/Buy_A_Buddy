/**
 * Particle Effects - Visual feedback for game events
 */

import Phaser from 'phaser';

export type ParticleType = 
  | 'victory'
  | 'damage'
  | 'heal'
  | 'gold'
  | 'xp'
  | 'levelup'
  | 'sparkle'
  | 'smoke';

export class ParticleSystem {
  private scene: Phaser.Scene;
  private particles: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeParticleAssets();
  }
  
  private initializeParticleAssets(): void {
    // Create particle textures if they don't exist
    const scene = this.scene as Phaser.Scene;
    if (scene.textures.exists('particle_yellow')) return;
    
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle_yellow', 8, 8);
    graphics.clear();
    graphics.fillStyle(0xff4444, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle_red', 8, 8);
    graphics.clear();
    graphics.fillStyle(0x22c55e, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle_green', 8, 8);
    graphics.clear();
    graphics.fillStyle(0x3b82f6, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle_blue', 8, 8);
    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle_white', 8, 8);
    graphics.clear();
    graphics.fillStyle(0xa855f7, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle_purple', 8, 8);
    graphics.clear();
    graphics.fillStyle(0x666666, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle_gray', 8, 8);
    graphics.destroy();
  }
  
  /**
   * Emit particles at a position
   */
  public emit(type: ParticleType, x: number, y: number, count: number = 10): void {
    const textureMap: Record<ParticleType, string> = {
      victory: 'particle_yellow',
      damage: 'particle_red',
      heal: 'particle_green',
      gold: 'particle_yellow',
      xp: 'particle_blue',
      levelup: 'particle_purple',
      sparkle: 'particle_white',
      smoke: 'particle_gray'
    };
    
    const texture = textureMap[type] || 'particle_white';
    
    const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: count,
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Rectangle(-20, -20, 40, 40),
        quantity: count
      }
    };
    
    const emitter = this.scene.add.particles(x, y, texture, config);
    
    // Auto-destroy after particles are done
    this.scene.time.delayedCall(1000, () => {
      emitter.destroy();
    });
  }
  
  /**
   * Victory burst effect
   */
  public victoryBurst(x: number, y: number): void {
    // Multiple bursts for dramatic effect
    this.emit('victory', x, y, 20);
    this.scene.time.delayedCall(100, () => {
      this.emit('gold', x + 20, y - 20, 10);
    });
    this.scene.time.delayedCall(200, () => {
      this.emit('xp', x - 20, y + 20, 10);
    });
  }
  
  /**
   * Level up celebration
   */
  public levelUpCelebration(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        this.emit('levelup', x + Phaser.Math.Between(-50, 50), y + Phaser.Math.Between(-50, 50), 15);
      });
    }
    this.emit('sparkle', x, y - 30, 25);
  }
  
  /**
   * Damage number effect (floating text)
   */
  public showDamageNumber(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x, y, `-${damage}`, {
      fontSize: '28px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    text.setDepth(100);
    
    // Float up and fade
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Heal number effect
   */
  public showHealNumber(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y, `+${amount}`, {
      fontSize: '28px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    text.setDepth(100);
    
    // Float up and fade
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Gold pickup effect
   */
  public showGoldPickup(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y, `+${amount} 💰`, {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffd700',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    text.setDepth(100);
    
    // Float up and fade
    this.scene.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * XP gain effect
   */
  public showXPGain(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y, `+${amount} XP`, {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#3b82f6',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    text.setDepth(100);
    
    // Float up and fade
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
}