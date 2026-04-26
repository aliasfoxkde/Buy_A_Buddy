/**
 * Tutorial Overlay - First-time player guidance
 */

import Phaser from 'phaser';

export interface TutorialStep {
  id: string;
  text: string;
  highlight?: { x: number; y: number; width: number; height: number };
  action?: 'wait_click' | 'wait_key' | 'wait_zone';
  onComplete?: () => void;
}

export class TutorialOverlay {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private step: number = 0;
  private steps: TutorialStep[] = [];
  private isActive: boolean = false;
  private callback?: () => void;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Start tutorial with given steps
   */
  public start(steps: TutorialStep[], callback?: () => void): void {
    this.steps = steps;
    this.callback = callback;
    this.step = 0;
    this.isActive = true;
    this.showStep();
  }
  
  /**
   * Show current tutorial step
   */
  private showStep(): void {
    if (this.step >= this.steps.length) {
      this.end();
      return;
    }
    
    const currentStep = this.steps[this.step];
    
    // Create overlay container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);
    
    const { width, height } = this.scene.scale;
    
    // Semi-transparent background
    const bg = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0x000000, 0.7
    );
    
    // Highlight area if specified
    if (currentStep.highlight) {
      const hl = currentStep.highlight;
      // Cutout effect - draw around highlight
      const cutout = this.scene.add.rectangle(
        hl.x, hl.y, hl.width, hl.height,
        0x000000, 0
      );
      cutout.setStrokeStyle(3, 0xfbbf24, 1);
      
      // Pulsing animation
      this.scene.tweens.add({
        targets: cutout,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      
      this.container.add([bg, cutout]);
    } else {
      this.container.add(bg);
    }
    
    // Tutorial panel
    const panelX = width / 2;
    const panelY = height - 150;
    
    const panel = this.scene.add.rectangle(
      panelX, panelY,
      600, 120,
      0x1a1a2e, 0.95
    );
    panel.setStrokeStyle(3, 0xa855f7);
    
    // Tutorial text
    const text = this.scene.add.text(
      panelX, panelY - 20,
      currentStep.text,
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff',
        align: 'center',
        wordWrap: { width: 550 }
      }
    ).setOrigin(0.5);
    
    // Continue button
    const btn = this.scene.add.rectangle(
      panelX + 200, panelY + 35,
      150, 40,
      0xa855f7
    );
    btn.setInteractive({ useHandCursor: true });
    
    const btnText = this.scene.add.text(
      panelX + 200, panelY + 35,
      'GOT IT!',
      {
        fontSize: '16px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff'
      }
    ).setOrigin(0.5);
    
    // Skip button
    const skipBtn = this.scene.add.text(
      panelX - 230, panelY + 35,
      'Skip Tutorial',
      {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#888'
      }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    skipBtn.on('pointerdown', () => this.end());
    
    btn.on('pointerdown', () => this.nextStep());
    
    // Arrow pointing to highlight
    if (currentStep.highlight) {
      const hl = currentStep.highlight;
      const arrow = this.scene.add.text(
        hl.x, hl.y - hl.height / 2 - 40,
        '▼',
        {
          fontSize: '32px',
          color: '#fbbf24'
        }
      ).setOrigin(0.5);
      
      this.scene.tweens.add({
        targets: arrow,
        y: arrow.y + 10,
        duration: 400,
        yoyo: true,
        repeat: -1
      });
      
      this.container.add(arrow);
    }
    
    this.container.add([panel, text, btn, btnText, skipBtn]);
    
    // Keyboard support
    this.scene.input.keyboard?.once('keydown-SPACE', () => this.nextStep());
    this.scene.input.keyboard?.once('keydown-ENTER', () => this.nextStep());
  }
  
  /**
   * Advance to next step
   */
  private nextStep(): void {
    const currentStep = this.steps[this.step];
    
    // Call completion callback if specified
    if (currentStep.onComplete) {
      currentStep.onComplete();
    }
    
    // Destroy container and show next step
    this.container.destroy();
    this.step++;
    this.showStep();
  }
  
  /**
   * End tutorial early
   */
  public end(): void {
    if (this.container) {
      this.container.destroy();
    }
    this.isActive = false;
    
    if (this.callback) {
      this.callback();
    }
    
    // Mark tutorial as completed
    localStorage.setItem('tutorial_completed', 'true');
  }
  
  /**
   * Check if tutorial is active
   */
  public isShowing(): boolean {
    return this.isActive;
  }
  
  /**
   * Check if tutorial was completed before
   */
  public static wasCompleted(): boolean {
    return localStorage.getItem('tutorial_completed') === 'true';
  }
  
  /**
   * Reset tutorial (for testing)
   */
  public static reset(): void {
    localStorage.removeItem('tutorial_completed');
  }
}

/**
 * Default tutorial steps for first-time players
 */
export function getDefaultTutorialSteps(scene: Phaser.Scene): TutorialStep[] {
  const { width, height } = scene.scale;
  
  return [
    {
      id: 'welcome',
      text: 'Welcome to Buy a Buddy! Let\'s learn the basics.',
      action: 'wait_click',
      onComplete: () => console.log('Tutorial: Welcome complete')
    },
    {
      id: 'movement',
      text: 'Use WASD or Arrow Keys to move your character around the world.',
      highlight: { x: width / 2, y: height / 2, width: 200, height: 100 },
      action: 'wait_key',
      onComplete: () => console.log('Tutorial: Movement complete')
    },
    {
      id: 'interact',
      text: 'Press E when near an NPC to talk to them. Look for the blue glow!',
      highlight: { x: 200, y: 300, width: 100, height: 100 },
      action: 'wait_key',
      onComplete: () => console.log('Tutorial: Interact complete')
    },
    {
      id: 'battle',
      text: 'Walk into red danger zones to start battles. Defeat enemies to gain XP and gold!',
      highlight: { x: width - 150, y: height / 2, width: 120, height: 120 },
      action: 'wait_click',
      onComplete: () => console.log('Tutorial: Battle complete')
    },
    {
      id: 'quests',
      text: 'Check your quest objective in the top-right corner. Talk to NPCs to get quests!',
      highlight: { x: width - 100, y: 50, width: 200, height: 80 },
      action: 'wait_click',
      onComplete: () => console.log('Tutorial: Quests complete')
    },
    {
      id: 'skills',
      text: 'In battle, use skills by clicking the skill buttons. Press ATTACK for basic attacks!',
      action: 'wait_click',
      onComplete: () => console.log('Tutorial: Skills complete')
    },
    {
      id: 'complete',
      text: 'You\'re ready to play! Have fun on your adventure! 🎮',
      action: 'wait_click',
      onComplete: () => console.log('Tutorial: Complete!')
    }
  ];
}
