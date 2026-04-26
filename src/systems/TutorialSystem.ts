/**
 * Tutorial System - First-time player guidance
 */

import Phaser from 'phaser';

export type TutorialStep = 
  | 'movement'
  | 'combat'
  | 'inventory'
  | 'quests'
  | 'npc'
  | 'shop'
  | 'complete';

export interface TutorialHint {
  step: TutorialStep;
  title: string;
  text: string;
  position: 'top' | 'bottom' | 'center';
  duration: number;
}

export class TutorialSystem {
  private scene: Phaser.Scene;
  private completedSteps: Set<TutorialStep> = new Set();
  private currentHint: Phaser.GameObjects.Container | null = null;
  private stepCallbacks: Map<TutorialStep, () => void> = new Map();
  
  // Tutorial hints
  private hints: TutorialHint[] = [
    {
      step: 'movement',
      title: 'Movement',
      text: 'Use WASD or Arrow Keys to move. Touch the screen on mobile!',
      position: 'bottom',
      duration: 5000
    },
    {
      step: 'combat',
      title: 'Combat',
      text: 'Walk into red zones to trigger battles. Attack, Defend, Use Items, or Flee!',
      position: 'top',
      duration: 5000
    },
    {
      step: 'npc',
      title: 'NPCs',
      text: 'Press E near NPCs to talk. They may have quests or items for you!',
      position: 'bottom',
      duration: 5000
    },
    {
      step: 'quests',
      title: 'Quests',
      text: 'Open the menu with ESC and check your active quests. Kill enemies to complete them!',
      position: 'top',
      duration: 5000
    },
    {
      step: 'inventory',
      title: 'Items',
      text: 'Open Inventory from the menu. Use potions to heal during battle!',
      position: 'center',
      duration: 5000
    },
    {
      step: 'shop',
      title: 'Shopping',
      text: 'Visit the shop to buy weapons and armor. Earn gold by defeating enemies!',
      position: 'center',
      duration: 5000
    }
  ];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadProgress();
  }
  
  public showHint(step: TutorialStep, callback?: () => void): void {
    // Skip if already completed or currently showing
    if (this.completedSteps.has(step) || this.currentHint) {
      if (callback) callback();
      return;
    }
    
    const hint = this.hints.find(h => h.step === step);
    if (!hint) return;
    
    this.currentHint = this.createHintUI(hint);
    
    // Auto-dismiss after duration
    this.scene.time.delayedCall(hint.duration, () => {
      this.dismissHint();
      if (callback) callback();
    });
    
    // Click to dismiss
    this.scene.input.once('pointerdown', () => this.dismissHint(), this);
  }
  
  public completeStep(step: TutorialStep): void {
    this.completedSteps.add(step);
    this.saveProgress();
    this.dismissHint();
  }
  
  public isStepCompleted(step: TutorialStep): boolean {
    return this.completedSteps.has(step);
  }
  
  public reset(): void {
    this.completedSteps.clear();
    this.saveProgress();
  }
  
  private createHintUI(hint: TutorialHint): Phaser.GameObjects.Container {
    const { width, height } = this.scene.scale;
    
    const container = this.scene.add.container(width / 2, hint.position === 'bottom' ? height - 100 : 100);
    container.setDepth(500);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, 500, 120, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(3, 0x3b82f6);
    
    // Title
    const title = this.scene.add.text(0, -40, `💡 ${hint.title}`, {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#3b82f6'
    }).setOrigin(0.5);
    
    // Text
    const text = this.scene.add.text(0, 10, hint.text, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
      align: 'center',
      wordWrap: { width: 460 }
    }).setOrigin(0.5);
    
    // Dismiss hint
    const dismissText = this.scene.add.text(0, 50, 'Tap to dismiss', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(0.5);
    
    container.add([bg, title, text, dismissText]);
    
    // Slide in animation
    container.setAlpha(0);
    container.setY(container.y + 50);
    
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      y: container.y - 50,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    return container;
  }
  
  private dismissHint(): void {
    if (!this.currentHint) return;
    
    this.scene.tweens.add({
      targets: this.currentHint,
      alpha: 0,
      y: this.currentHint.y + 50,
      duration: 200,
      onComplete: () => {
        this.currentHint?.destroy();
        this.currentHint = null;
      }
    });
    
    this.scene.input.off('pointerdown', undefined, this);
  }
  
  private saveProgress(): void {
    const completed = Array.from(this.completedSteps);
    localStorage.setItem('buyabuddy_tutorial', JSON.stringify(completed));
  }
  
  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('buyabuddy_tutorial');
      if (saved) {
        const completed = JSON.parse(saved) as TutorialStep[];
        completed.forEach(step => this.completedSteps.add(step));
      }
    } catch {
      // Ignore parse errors
    }
  }
}