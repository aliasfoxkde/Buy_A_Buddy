/**
 * Tutorial System - In-game tutorial and hints
 */

import Phaser from 'phaser';

export interface TutorialStep {
  id: string;
  message: string;
  highlight?: { x: number; y: number; width: number; height: number };
  action?: 'wait_click' | 'wait_key' | 'wait_scene' | 'auto';
  key?: string;
  scene?: string;
  onComplete?: () => void;
}

export interface TutorialDefinition {
  id: string;
  name: string;
  steps: TutorialStep[];
}

export const TUTORIALS: Record<string, TutorialDefinition> = {
  main: {
    id: 'main',
    name: 'Getting Started',
    steps: [
      {
        id: 'welcome',
        message: 'Welcome to Buy a Buddy! Use WASD or arrow keys to move.',
        action: 'wait_key',
        key: 'W'
      },
      {
        id: 'move_around',
        message: 'Explore the village and talk to NPCs. Press E to interact.',
        action: 'auto'
      },
      {
        id: 'open_inventory',
        message: 'Press I to open your inventory.',
        action: 'wait_key',
        key: 'I'
      },
      {
        id: 'inventory_opened',
        message: 'Great! Here you can manage your items and equipment.',
        action: 'wait_click'
      },
      {
        id: 'close_inventory',
        message: 'Press I again or ESC to close.',
        action: 'wait_key',
        key: 'Escape'
      },
      {
        id: 'quests',
        message: 'Press Q to view your quests. Complete quests to earn rewards!',
        action: 'wait_key',
        key: 'Q'
      },
      {
        id: 'quest_viewed',
        message: 'Follow the objectives to progress in your adventure.',
        action: 'wait_click'
      },
      {
        id: 'battle_ready',
        message: 'You are ready! Fight enemies to gain experience and gold.',
        action: 'auto'
      },
      {
        id: 'complete',
        message: 'Good luck, adventurer!',
        action: 'auto'
      }
    ]
  },
  
  combat: {
    id: 'combat',
    name: 'Combat Basics',
    steps: [
      {
        id: 'battle_start',
        message: 'A wild slime appeared! In battle, choose your actions wisely.',
        action: 'auto'
      },
      {
        id: 'attack',
        message: 'Press 1 or click ATTACK to deal damage.',
        action: 'wait_key',
        key: '1'
      },
      {
        id: 'defend',
        message: 'Press 2 or click DEFEND to reduce incoming damage.',
        action: 'wait_key',
        key: '2'
      },
      {
        id: 'items',
        message: 'Press 3 to use items from your inventory.',
        action: 'wait_key',
        key: '3'
      },
      {
        id: 'flee',
        message: 'Press 4 to attempt to flee from battle.',
        action: 'wait_key',
        key: '4'
      },
      {
        id: 'victory',
        message: 'Victory! Defeat enemies to level up and get stronger.',
        action: 'auto'
      }
    ]
  }
};

export class TutorialManager {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private currentTutorial?: TutorialDefinition;
  private currentStepIndex: number = 0;
  private stepText!: Phaser.GameObjects.Text;
  private arrow?: Phaser.GameObjects.Graphics;
  private highlightBox?: Phaser.GameObjects.Rectangle;
  private skipButton!: Phaser.GameObjects.Text;
  private isActive: boolean = false;
  private onComplete?: () => void;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }
  
  private create(): void {
    const { width, height } = this.scene.scale;
    
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(9999);
    this.container.setVisible(false);
    
    const overlay = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.5
    );
    overlay.setInteractive();
    
    const boxY = height - 180;
    const tutorialBox = this.scene.add.rectangle(
      width / 2,
      boxY,
      width - 100,
      120,
      0x1a1a2e,
      0.95
    );
    tutorialBox.setStrokeStyle(3, 0xa855f7);
    
    this.stepText = this.scene.add.text(
      width / 2,
      boxY - 30,
      '',
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 200 }
      }
    ).setOrigin(0.5);
    
    const continueText = this.scene.add.text(
      width / 2,
      boxY + 40,
      'Click to continue...',
      {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#888888'
      }
    ).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    this.skipButton = this.scene.add.text(
      width - 60,
      60,
      'Skip Tutorial',
      {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#888888'
      }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    this.skipButton.on('pointerdown', () => this.skip());
    this.skipButton.on('pointerover', () => this.skipButton.setColor('#ffffff'));
    this.skipButton.on('pointerout', () => this.skipButton.setColor('#888888'));
    
    this.highlightBox = this.scene.add.rectangle(0, 0, 100, 50, 0x22c55e, 0);
    this.highlightBox.setStrokeStyle(3, 0x22c55e);
    this.highlightBox.setVisible(false);
    
    this.arrow = this.scene.add.graphics();
    
    this.container.add([
      overlay,
      tutorialBox,
      this.stepText,
      continueText,
      this.skipButton,
      this.highlightBox
    ]);
    
    tutorialBox.on('pointerdown', () => this.nextStep());
    overlay.on('pointerdown', () => this.nextStep());
  }
  
  start(tutorialId: string, onComplete?: () => void): void {
    const tutorial = TUTORIALS[tutorialId];
    if (!tutorial) {
      console.warn('Tutorial not found:', tutorialId);
      return;
    }
    
    this.currentTutorial = tutorial;
    this.currentStepIndex = 0;
    this.onComplete = onComplete;
    this.isActive = true;
    this.container.setVisible(true);
    
    this.showStep(0);
  }
  
  private showStep(index: number): void {
    if (!this.currentTutorial) return;
    
    const step = this.currentTutorial.steps[index];
    if (!step) {
      this.complete();
      return;
    }
    
    this.stepText.setText(step.message);
    
    if (step.highlight) {
      this.highlightBox?.setPosition(
        step.highlight.x,
        step.highlight.y
      );
      this.highlightBox?.setSize(step.highlight.width, step.highlight.height);
      this.highlightBox?.setVisible(true);
      this.drawArrow(step.highlight);
    } else {
      this.highlightBox?.setVisible(false);
      this.arrow?.clear();
    }
    
    switch (step.action) {
      case 'wait_key':
        this.waitForKey(step.key || 'Space');
        break;
      case 'auto':
      default:
        this.scene.time.delayedCall(3000, () => this.nextStep());
        break;
    }
  }
  
  private waitForKey(key: string): void {
    const keyHandler = (pressedKey: string) => {
      if (pressedKey.toLowerCase() === key.toLowerCase()) {
        this.scene.input.keyboard?.off('keydown', keyHandler);
        this.nextStep();
      }
    };
    
    this.scene.input.keyboard?.on('keydown', keyHandler);
  }
  
  nextStep(): void {
    if (!this.currentTutorial) return;
    
    this.currentStepIndex++;
    
    if (this.currentStepIndex >= this.currentTutorial.steps.length) {
      this.complete();
    } else {
      this.showStep(this.currentStepIndex);
    }
  }
  
  private drawArrow(highlight: TutorialStep['highlight']): void {
    if (!this.arrow || !highlight) return;
    
    this.arrow.clear();
    
    const boxY = this.scene.scale.height - 180;
    const arrowY = Math.min(highlight.y - 50, boxY - 180);
    
    this.arrow.fillStyle(0x22c55e, 1);
    this.arrow.beginPath();
    this.arrow.moveTo(highlight.x, arrowY + 30);
    this.arrow.lineTo(highlight.x - 10, arrowY);
    this.arrow.lineTo(highlight.x + 10, arrowY);
    this.arrow.closePath();
    this.arrow.fillPath();
    
    this.scene.tweens.add({
      targets: this.arrow,
      y: -10,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }
  
  skip(): void {
    this.complete();
  }
  
  private complete(): void {
    this.isActive = false;
    this.container.setVisible(false);
    this.highlightBox?.setVisible(false);
    this.arrow?.clear();
    this.currentTutorial = undefined;
    this.currentStepIndex = 0;
    
    this.scene.events.emit('tutorial:complete');
    this.onComplete?.();
  }
  
  isTutorialActive(): boolean {
    return this.isActive;
  }
  
  getCurrentStep(): number {
    return this.currentStepIndex;
  }
  
  destroy(): void {
    this.container.destroy();
    this.arrow?.destroy();
    this.highlightBox?.destroy();
  }
}
