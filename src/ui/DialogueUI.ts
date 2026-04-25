/**
 * Dialogue System - NPC conversation UI
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

interface DialogueOption {
  text: string;
  nextNode?: string;
  action?: string;
}

interface DialogueNode {
  speaker: string;
  text: string;
  options?: DialogueOption[];
}

export class DialogueUI {
  private scene: Phaser.Scene;
  private isActive: boolean = false;
  private currentNode: string = '';
  private dialogueData: Map<string, DialogueNode> = new Map();
  
  private uiContainer!: Phaser.GameObjects.Container;
  private speakerText!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private continueIndicator!: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  public startDialogue(npcId: string): void {
    if (this.isActive) return;
    
    // Load NPC dialogue
    this.loadDialogue(npcId);
    
    if (this.dialogueData.size === 0) {
      console.log('No dialogue found for NPC:', npcId);
      return;
    }
    
    this.isActive = true;
    this.currentNode = 'start';
    
    this.createUI();
    this.showNode(this.currentNode);
    
    // Pause game
    this.scene.scene.pause();
  }
  
  private loadDialogue(npcId: string): void {
    this.dialogueData.clear();
    
    // Simple dialogues for NPCs
    const dialogues: Record<string, Record<string, DialogueNode>> = {
      'npc_mentor': {
        'start': {
          speaker: 'Mentor',
          text: 'Welcome, young adventurer! Your journey has just begun. There are many challenges ahead.',
          options: [
            { text: 'What should I do first?', nextNode: 'advice' },
            { text: 'Goodbye.', action: 'end' }
          ]
        },
        'advice': {
          speaker: 'Mentor',
          text: 'Visit the village shops to gather supplies, then venture into the forest.',
          options: [
            { text: 'Thanks!', action: 'end' }
          ]
        }
      },
      'npc_shopkeeper': {
        'start': {
          speaker: 'Shopkeeper',
          text: 'Welcome to my shop! Take a look at my wares.',
          options: [
            { text: 'Open Shop', action: 'open_shop' },
            { text: 'Goodbye.', action: 'end' }
          ]
        }
      },
      'npc_blacksmith': {
        'start': {
          speaker: 'Blacksmith',
          text: 'Need a weapon? My hammers are ready!',
          options: [
            { text: 'Show weapons.', action: 'open_weapon_shop' },
            { text: 'Later.', action: 'end' }
          ]
        }
      },
      'npc_guard': {
        'start': {
          speaker: 'Guard',
          text: 'The road ahead is dangerous. Be prepared!',
          options: [
            { text: 'I will be careful.', action: 'end' }
          ]
        }
      },
      'npc_innkeeper': {
        'start': {
          speaker: 'Innkeeper',
          text: 'Rest your weary bones. A night here will restore your health.',
          options: [
            { text: 'I will rest.', action: 'rest' },
            { text: 'Not now.', action: 'end' }
          ]
        }
      }
    };
    
    const npcDialogue = dialogues[npcId];
    if (npcDialogue) {
      for (const [nodeId, node] of Object.entries(npcDialogue)) {
        this.dialogueData.set(nodeId, node);
      }
    } else {
      // Default dialogue
      this.dialogueData.set('start', {
        speaker: '???',
        text: '...',
        options: [{ text: 'Goodbye.', action: 'end' }]
      });
    }
  }
  
  private createUI(): void {
    const { width, height } = this.scene.scale;
    
    this.uiContainer = this.scene.add.container(0, 0);
    
    // Semi-transparent background
    const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);
    overlay.setInteractive();
    
    // Dialogue box
    const boxY = height - 180;
    const textBox = this.scene.add.rectangle(width / 2, boxY, width - 100, 200, 0x1a1a2e);
    textBox.setStrokeStyle(3, 0xa855f7);
    
    // Speaker name box
    const speakerBox = this.scene.add.rectangle(180, boxY - 80, 200, 40, 0xa855f7);
    
    this.speakerText = this.scene.add.text(180, boxY - 80, '', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Dialogue text
    this.dialogueText = this.scene.add.text(width / 2, boxY - 20, '', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
      wordWrap: { width: width - 200 },
      align: 'center'
    }).setOrigin(0.5);
    
    // Continue indicator
    this.continueIndicator = this.scene.add.text(width - 80, boxY + 70, '▼', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Bounce animation
    this.scene.tweens.add({
      targets: this.continueIndicator,
      y: boxY + 80,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Click to advance
    overlay.on('pointerdown', () => this.advanceDialogue());
    textBox.on('pointerdown', () => this.advanceDialogue());
    
    this.uiContainer.add([overlay, textBox, speakerBox, this.speakerText, this.dialogueText, this.continueIndicator]);
  }
  
  private showNode(nodeId: string): void {
    const node = this.dialogueData.get(nodeId);
    if (!node) return;
    
    // Update speaker
    this.speakerText.setText(node.speaker);
    
    // Typewriter effect for text
    this.typeText(node.text);
    
    // Clear options
    this.clearOptions();
    
    // Show options if available
    if (node.options && node.options.length > 0) {
      this.continueIndicator.setVisible(false);
      this.createOptions(node.options);
    } else {
      this.continueIndicator.setVisible(true);
    }
  }
  
  private typeText(text: string): void {
    this.dialogueText.setText('');
    let charIndex = 0;
    
    this.scene.time.addEvent({
      delay: 30,
      callback: () => {
        this.dialogueText.setText(text.substring(0, charIndex + 1));
        charIndex++;
      },
      repeat: text.length - 1
    });
  }
  
  private createOptions(options: DialogueOption[]): void {
    const { width } = this.scene.scale;
    const boxY = this.scene.scale.height - 180;
    
    const startX = width / 2 - (options.length - 1) * 120;
    
    options.forEach((option, i) => {
      const x = startX + i * 240;
      const y = boxY + 50;
      
      const btn = this.scene.add.container(x, y);
      
      const bg = this.scene.add.rectangle(0, 0, 200, 45, 0x2d1b4e);
      bg.setStrokeStyle(2, 0xa855f7);
      
      const text = this.scene.add.text(0, 0, option.text, {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff'
      }).setOrigin(0.5);
      
      btn.add([bg, text]);
      btn.setSize(200, 45);
      btn.setInteractive({ useHandCursor: true });
      
      btn.on('pointerover', () => bg.setFillStyle(0x3d2b5e));
      btn.on('pointerout', () => bg.setFillStyle(0x2d1b4e));
      btn.on('pointerdown', () => this.selectOption(option));
      
      this.optionButtons.push(btn);
      this.uiContainer.add(btn);
    });
  }
  
  private clearOptions(): void {
    for (const btn of this.optionButtons) {
      btn.destroy();
    }
    this.optionButtons = [];
  }
  
  private advanceDialogue(): void {
    // If options are visible, don't advance
    if (this.optionButtons.length > 0) return;
    
    // For dialogue without options, end
    this.endDialogue();
  }
  
  private selectOption(option: DialogueOption): void {
    // Execute action if exists
    if (option.action) {
      this.executeAction(option.action);
    }
    
    // Go to next node if exists
    if (option.nextNode) {
      this.currentNode = option.nextNode;
      this.showNode(this.currentNode);
    } else if (option.action === 'end') {
      this.endDialogue();
    }
  }
  
  private executeAction(action: string): void {
    switch (action) {
      case 'end':
        // Will end dialogue
        break;
      case 'open_shop':
        this.scene.scene.launch('ShopScene', { shopType: 'general_store' });
        break;
      case 'open_weapon_shop':
        this.scene.scene.launch('ShopScene', { shopType: 'weapon_shop' });
        break;
      case 'rest':
        // Heal player
        const stats = gameSystems.getPlayerStats();
        if (stats) {
          // Would update via game systems
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  }
  
  public endDialogue(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    // Destroy UI
    this.uiContainer.destroy();
    
    // Resume game
    this.scene.scene.resume();
    
    // Emit dialogue end event
    gameSystems.eventBus.emit('dialogue:end', {});
  }
  
  public update(): void {
    // Update loop if needed
  }
}
