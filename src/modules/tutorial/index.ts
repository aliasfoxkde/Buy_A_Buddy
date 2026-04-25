/**
 * Tutorial System Module
 * Step-by-step guided tutorial with hints and tooltips
 */

import { EventBus, Vector2, generateId } from '../../core';

export type TutorialStepType = 
  | 'text'           // Simple text display
  | 'highlight'      // Highlight a UI element
  | 'action'         // Require player action
  | 'choice'         // Present choices
  | 'dialogue';      // Show NPC dialogue

export interface TutorialStep {
  id: string;
  type: TutorialStepType;
  title?: string;
  content: string;
  
  // For highlight steps
  highlightElement?: string;
  highlightPosition?: Vector2;
  highlightSize?: { width: number; height: number };
  
  // For action steps
  requiredAction?: string;
  actionDescription?: string;
  skipAvailable?: boolean;
  
  // For choice steps
  choices?: { id: string; text: string; nextStepId?: string }[];
  
  // Navigation
  nextStepId?: string;
  previousStepId?: string;
  skipToStepId?: string;
  
  // Conditions
  condition?: () => boolean;
  conditionFailedMessage?: string;
  
  // Timing
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  
  // Callbacks
  onEnter?: () => void;
  onExit?: () => void;
}

export interface TutorialConfig {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  startStepId: string;
  skippable: boolean;
  prerequisites?: string[];
  levelRequired?: number;
}

export interface TutorialProgress {
  tutorialId: string;
  currentStepId: string;
  completedSteps: Set<string>;
  startedAt: number;
  completedAt?: number;
  skipped: boolean;
}

export interface TooltipConfig {
  id: string;
  title?: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  anchorElement?: string;
  showArrow: boolean;
  dismissable: boolean;
  maxWidth: number;
}

export class TooltipManager {
  private tooltips: Map<string, TooltipConfig> = new Map();
  private activeTooltip: string | null = null;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  register(config: TooltipConfig): void {
    this.tooltips.set(config.id, config);
  }

  show(tooltipId: string): boolean {
    const tooltip = this.tooltips.get(tooltipId);
    if (!tooltip) return false;

    this.activeTooltip = tooltipId;
    this.eventBus.emit('tooltip:show', tooltip);
    return true;
  }

  hide(): void {
    if (this.activeTooltip) {
      this.eventBus.emit('tooltip:hide', { id: this.activeTooltip });
      this.activeTooltip = null;
    }
  }

  getActive(): TooltipConfig | null {
    return this.activeTooltip ? this.tooltips.get(this.activeTooltip) || null : null;
  }

  getAll(): TooltipConfig[] {
    return Array.from(this.tooltips.values());
  }
}

export class TutorialSystem {
  private eventBus: EventBus;
  private tutorials: Map<string, TutorialConfig> = new Map();
  private currentTutorial: TutorialConfig | null = null;
  private progress: Map<string, TutorialProgress> = new Map();
  private stepQueue: string[] = [];
  private isActive: boolean = false;
  private tooltipManager: TooltipManager;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.tooltipManager = new TooltipManager(eventBus);
    
    this.initializeDefaultTutorials();
  }

  getTooltipManager(): TooltipManager {
    return this.tooltipManager;
  }

  registerTutorial(config: TutorialConfig): void {
    this.tutorials.set(config.id, config);
  }

  getTutorial(id: string): TutorialConfig | undefined {
    return this.tutorials.get(id);
  }

  getAllTutorials(): TutorialConfig[] {
    return Array.from(this.tutorials.values());
  }

  canStartTutorial(id: string): { canStart: boolean; reason?: string } {
    const tutorial = this.tutorials.get(id);
    if (!tutorial) {
      return { canStart: false, reason: 'Tutorial not found' };
    }

    // Check if already completed
    const progress = this.progress.get(id);
    if (progress?.completedAt) {
      return { canStart: false, reason: 'Tutorial already completed' };
    }

    // Check level requirement
    if (tutorial.levelRequired) {
      // Would check player level from game state
    }

    // Check prerequisites
    if (tutorial.prerequisites) {
      for (const prereq of tutorial.prerequisites) {
        const prereqProgress = this.progress.get(prereq);
        if (!prereqProgress?.completedAt) {
          return { canStart: false, reason: `Requires tutorial: ${prereq}` };
        }
      }
    }

    return { canStart: true };
  }

  startTutorial(id: string): boolean {
    const { canStart, reason } = this.canStartTutorial(id);
    if (!canStart) {
      this.eventBus.emit('tutorial:cannot_start', { id, reason });
      return false;
    }

    const tutorial = this.tutorials.get(id);
    if (!tutorial) return false;

    // Initialize progress
    this.progress.set(id, {
      tutorialId: id,
      currentStepId: tutorial.startStepId,
      completedSteps: new Set(),
      startedAt: Date.now(),
      skipped: false
    });

    this.currentTutorial = tutorial;
    this.isActive = true;

    this.eventBus.emit('tutorial:start', { id });
    
    this.goToStep(tutorial.startStepId);
    return true;
  }

  skipTutorial(): void {
    if (!this.currentTutorial) return;

    const progress = this.progress.get(this.currentTutorial.id);
    if (progress) {
      progress.skipped = true;
    }

    this.eventBus.emit('tutorial:skip', { id: this.currentTutorial.id });
    this.endTutorial();
  }

  endTutorial(): void {
    if (!this.currentTutorial) return;

    const progress = this.progress.get(this.currentTutorial.id);
    if (progress && !progress.skipped) {
      progress.completedAt = Date.now();
    }

    this.eventBus.emit('tutorial:end', { id: this.currentTutorial.id });

    this.currentTutorial = null;
    this.isActive = false;
    this.stepQueue = [];
  }

  goToStep(stepId: string): void {
    if (!this.currentTutorial) return;

    const step = this.currentTutorial.steps.find(s => s.id === stepId);
    if (!step) return;

    const progress = this.progress.get(this.currentTutorial.id);
    if (progress) {
      progress.currentStepId = stepId;
    }

    // Execute onEnter callback
    step.onEnter?.();

    this.eventBus.emit('tutorial:step', {
      tutorialId: this.currentTutorial.id,
      stepId,
      step
    });

    // Handle auto-advance
    if (step.autoAdvance && step.autoAdvanceDelay) {
      setTimeout(() => {
        if (this.currentTutorial && this.isActive) {
          this.advance();
        }
      }, step.autoAdvanceDelay * 1000);
    }
  }

  advance(): void {
    if (!this.currentTutorial) return;

    const progress = this.progress.get(this.currentTutorial.id);
    if (!progress) return;

    // Mark current step as completed
    progress.completedSteps.add(progress.currentStepId);

    // Get current step
    const currentStep = this.currentTutorial.steps.find(
      s => s.id === progress.currentStepId
    );

    if (currentStep?.onExit) {
      currentStep.onExit();
    }

    // Go to next step
    if (currentStep?.nextStepId) {
      this.goToStep(currentStep.nextStepId);
    } else {
      // No more steps - end tutorial
      this.endTutorial();
    }
  }

  goBack(): void {
    if (!this.currentTutorial) return;

    const progress = this.progress.get(this.currentTutorial.id);
    if (!progress) return;

    const currentStep = this.currentTutorial.steps.find(
      s => s.id === progress.currentStepId
    );

    if (currentStep?.previousStepId) {
      this.goToStep(currentStep.previousStepId);
    }
  }

  skipToStep(stepId: string): void {
    if (!this.currentTutorial) return;
    this.goToStep(stepId);
  }

  completeAction(action: string): void {
    if (!this.currentTutorial) return;

    const progress = this.progress.get(this.currentTutorial.id);
    if (!progress) return;

    const currentStep = this.currentTutorial.steps.find(
      s => s.id === progress.currentStepId
    );

    if (currentStep?.type === 'action' && currentStep.requiredAction === action) {
      this.advance();
    }
  }

  selectChoice(choiceId: string): void {
    if (!this.currentTutorial) return;

    const progress = this.progress.get(this.currentTutorial.id);
    if (!progress) return;

    const currentStep = this.currentTutorial.steps.find(
      s => s.id === progress.currentStepId
    );

    if (currentStep?.type === 'choice' && currentStep.choices) {
      const choice = currentStep.choices.find(c => c.id === choiceId);
      if (choice?.nextStepId) {
        this.goToStep(choice.nextStepId);
      } else {
        this.advance();
      }
    }
  }

  isInTutorial(): boolean {
    return this.isActive;
  }

  getCurrentTutorial(): TutorialConfig | null {
    return this.currentTutorial;
  }

  getProgress(tutorialId: string): TutorialProgress | undefined {
    return this.progress.get(tutorialId);
  }

  getAllProgress(): TutorialProgress[] {
    return Array.from(this.progress.values());
  }

  resetTutorial(tutorialId: string): void {
    this.progress.delete(tutorialId);
    
    if (this.currentTutorial?.id === tutorialId) {
      this.endTutorial();
    }
  }

  resetAll(): void {
    this.progress.clear();
    this.endTutorial();
  }

  private initializeDefaultTutorials(): void {
    // Main Tutorial
    this.registerTutorial({
      id: 'tutorial_main',
      name: 'Welcome',
      description: 'Learn the basics of the game',
      skippable: true,
      startStepId: 'welcome',
      steps: [
        {
          id: 'welcome',
          type: 'text',
          title: 'Welcome, Adventurer!',
          content: 'Welcome to Buy a Buddy! This tutorial will teach you the basics of gameplay.',
          nextStepId: 'movement',
          autoAdvance: true,
          autoAdvanceDelay: 3
        },
        {
          id: 'movement',
          type: 'highlight',
          title: 'Movement',
          content: 'Use WASD or arrow keys to move your character around the world.',
          highlightElement: 'player',
          nextStepId: 'interaction',
          skipAvailable: true
        },
        {
          id: 'interaction',
          type: 'action',
          title: 'Interact',
          content: 'Press E or click to interact with NPCs, objects, and more.',
          requiredAction: 'interact',
          actionDescription: 'Try interacting with something!',
          skipAvailable: true
        },
        {
          id: 'combat_intro',
          type: 'text',
          title: 'Combat',
          content: 'When you encounter enemies, combat is turn-based. Use your skills wisely!',
          nextStepId: 'skills',
          autoAdvance: true,
          autoAdvanceDelay: 4
        },
        {
          id: 'skills',
          type: 'highlight',
          title: 'Skills',
          content: 'Your skill bar shows available abilities. Press 1-6 to use skills.',
          highlightElement: 'skill_bar',
          nextStepId: 'inventory_tip',
          skipAvailable: true
        },
        {
          id: 'inventory_tip',
          type: 'highlight',
          title: 'Inventory',
          content: 'Press I to open your inventory. Collect items and equip gear to grow stronger.',
          highlightElement: 'inventory_button',
          nextStepId: 'quests_tip',
          skipAvailable: true
        },
        {
          id: 'quests_tip',
          type: 'highlight',
          title: 'Quests',
          content: 'Accept quests from NPCs to earn rewards and progress through the story.',
          highlightElement: 'quest_button',
          nextStepId: 'completion',
          skipAvailable: true
        },
        {
          id: 'completion',
          type: 'text',
          title: 'You\'re Ready!',
          content: 'That covers the basics! Explore the world, complete quests, and become the best adventurer. Good luck!',
          autoAdvance: true,
          autoAdvanceDelay: 5
        }
      ]
    });

    // Combat Tutorial
    this.registerTutorial({
      id: 'tutorial_combat',
      name: 'Combat Basics',
      description: 'Learn combat mechanics',
      skippable: true,
      prerequisites: ['tutorial_main'],
      startStepId: 'combat_start',
      steps: [
        {
          id: 'combat_start',
          type: 'text',
          title: 'Combat System',
          content: 'Let\'s learn about the turn-based combat system.',
          nextStepId: 'turn_order',
          autoAdvance: true,
          autoAdvanceDelay: 3
        },
        {
          id: 'turn_order',
          type: 'highlight',
          title: 'Turn Order',
          content: 'Turns are determined by speed. Higher speed means acting first!',
          highlightElement: 'turn_indicator',
          nextStepId: 'attack_action',
          skipAvailable: true
        },
        {
          id: 'attack_action',
          type: 'action',
          title: 'Attack',
          content: 'Click on an enemy or press A to attack!',
          requiredAction: 'attack',
          actionDescription: 'Attack an enemy',
          skipAvailable: true
        },
        {
          id: 'skill_action',
          type: 'action',
          title: 'Use Skills',
          content: 'Skills use mana but deal more damage. Try using a skill!',
          requiredAction: 'use_skill',
          actionDescription: 'Use a skill',
          skipAvailable: true
        },
        {
          id: 'defend_action',
          type: 'action',
          title: 'Defend',
          content: 'Press D to defend. You\'ll take less damage and recover some defense.',
          requiredAction: 'defend',
          actionDescription: 'Use defend',
          skipAvailable: true
        },
        {
          id: 'combat_end',
          type: 'text',
          title: 'Combat Mastery',
          content: 'You\'ve learned the basics of combat! Practice makes perfect.',
          autoAdvance: true,
          autoAdvanceDelay: 4
        }
      ]
    });

    // Initialize tooltips
    this.tooltipManager.register({
      id: 'tooltip_item',
      title: 'Item',
      content: 'Click to pick up, right-click for options',
      position: 'right',
      showArrow: true,
      dismissable: true,
      maxWidth: 200
    });

    this.tooltipManager.register({
      id: 'tooltip_skill',
      title: 'Skill',
      content: 'Hotkey: 1-6',
      position: 'top',
      showArrow: true,
      dismissable: false,
      maxWidth: 150
    });

    this.tooltipManager.register({
      id: 'tooltip_npc',
      title: 'NPC',
      content: 'Press E to interact',
      position: 'bottom',
      showArrow: true,
      dismissable: true,
      maxWidth: 150
    });
  }
}
