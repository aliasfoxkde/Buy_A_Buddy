/**
 * Character Select Scene
 */

import Phaser from 'phaser';
import { gameSystems, SpriteConfig } from '../systems/GameSystems';

export class CharacterSelectScene extends Phaser.Scene {
  private characterSprites: Phaser.GameObjects.Sprite[] = [];
  private buddySprites: Phaser.GameObjects.Sprite[] = [];
  private selectedCharacter: number = 0;
  private selectedBuddy: number = 0;
  private characterName: string = 'Hero';
  private characterLabel!: Phaser.GameObjects.Text;
  private characterFrames: Phaser.GameObjects.Rectangle[] = [];
  private buddyFrames: Phaser.GameObjects.Rectangle[] = [];
  
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Title
    this.add.text(width / 2, 50, 'CREATE YOUR HERO', {
      fontSize: '42px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Character selection
    this.add.text(width / 2, 120, 'Choose Your Character', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ec4899'
    }).setOrigin(0.5);
    
    this.createCharacterSelection(width / 2, 280);
    
    // Buddy selection
    this.add.text(width / 2, 420, 'Choose Your Buddy', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
    
    this.createBuddySelection(width / 2, 530);
    
    // Name input
    this.createNameInput(width / 2, 680);
    
    // Start button
    const startBtn = this.add.rectangle(width / 2, height - 80, 200, 60, 0x22c55e);
    startBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height - 80, 'START ADVENTURE', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    startBtn.on('pointerdown', () => this.startGame());
    
    // Back button
    const backBtn = this.add.rectangle(100, height - 80, 150, 50, 0x3d2b5e);
    backBtn.setStrokeStyle(2, 0xa855f7);
    backBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(100, height - 80, '< BACK', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    backBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
    
    // Navigation
    this.input.keyboard?.on('keydown-LEFT', () => this.selectPrevCharacter());
    this.input.keyboard?.on('keydown-RIGHT', () => this.selectNextCharacter());
    this.input.keyboard?.on('keydown-UP', () => this.selectPrevBuddy());
    this.input.keyboard?.on('keydown-DOWN', () => this.selectNextBuddy());
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MainMenuScene'));
  }
  
  private createCharacterSelection(centerX: number, centerY: number): void {
    this.characterFrames = [];
    
    // Show 6 characters in a row
    for (let i = 0; i < 6; i++) {
      const x = centerX - 375 + i * 150;
      
      const sprite = this.add.sprite(x, centerY, 'characters');
      sprite.setFrame(i);
      sprite.setScale(0.8);
      sprite.setInteractive({ useHandCursor: true });
      
      // Frame indicator
      const frame = this.add.rectangle(x, centerY + 80, 130, 40, 0x2d1b4e);
      frame.setStrokeStyle(2, i === this.selectedCharacter ? 0x22c55e : 0x555);
      
      // Number
      this.add.text(x, centerY + 80, `${i + 1}`, {
        fontSize: '20px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff'
      }).setOrigin(0.5);
      
      sprite.on('pointerdown', () => {
        this.selectedCharacter = i;
        this.updateSelection();
      });
      
      this.characterSprites.push(sprite);
      this.characterFrames.push(frame);
    }
    
    // Preview label
    this.characterLabel = this.add.text(centerX, centerY - 80, 'Character 1', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
  }
  
  private createBuddySelection(centerX: number, centerY: number): void {
    this.buddyFrames = [];
    
    // Show 6 buddies
    for (let i = 0; i < 6; i++) {
      const x = centerX - 375 + i * 150;
      
      const sprite = this.add.sprite(x, centerY, 'buddies');
      sprite.setFrame(i);
      sprite.setScale(0.6);
      sprite.setInteractive({ useHandCursor: true });
      
      const frame = this.add.rectangle(x, centerY + 50, 130, 30, 0x2d1b4e);
      frame.setStrokeStyle(2, i === this.selectedBuddy ? 0x22c55e : 0x555);
      
      this.add.text(x, centerY + 50, `${i + 1}`, {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff'
      }).setOrigin(0.5);
      
      sprite.on('pointerdown', () => {
        this.selectedBuddy = i;
        this.updateSelection();
      });
      
      this.buddySprites.push(sprite);
      this.buddyFrames.push(frame);
    }
  }
  
  private createNameInput(x: number, y: number): void {
    // Name display
    this.add.text(x, y - 30, 'Character Name:', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(0.5);
    
    // Name box
    const nameBox = this.add.rectangle(x, y + 20, 300, 50, 0x2d1b4e);
    nameBox.setStrokeStyle(2, 0xa855f7);
    
    this.characterLabel = this.add.text(x, y + 20, this.characterName, {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Edit button
    const editBtn = this.add.rectangle(x + 180, y + 20, 40, 40, 0x7c3aed);
    editBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(x + 180, y + 20, 'E', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    editBtn.on('pointerdown', () => this.promptName());
  }
  
  private promptName(): void {
    const newName = prompt('Enter character name:', this.characterName);
    if (newName && newName.trim()) {
      this.characterName = newName.trim().substring(0, 16);
      this.characterLabel.setText(this.characterName);
    }
  }
  
  private selectPrevCharacter(): void {
    this.selectedCharacter = (this.selectedCharacter - 1 + 6) % 6;
    this.updateSelection();
  }
  
  private selectNextCharacter(): void {
    this.selectedCharacter = (this.selectedCharacter + 1) % 6;
    this.updateSelection();
  }
  
  private selectPrevBuddy(): void {
    this.selectedBuddy = (this.selectedBuddy - 1 + 6) % 6;
    this.updateSelection();
  }
  
  private selectNextBuddy(): void {
    this.selectedBuddy = (this.selectedBuddy + 1) % 6;
    this.updateSelection();
  }
  
  private updateSelection(): void {
    // Update character selection visuals
    for (let i = 0; i < 6; i++) {
      this.characterFrames[i].setStrokeStyle(2, i === this.selectedCharacter ? 0x22c55e : 0x555);
    }
    
    // Update buddy selection visuals
    for (let i = 0; i < 6; i++) {
      this.buddyFrames[i].setStrokeStyle(2, i === this.selectedBuddy ? 0x22c55e : 0x555);
    }
    
    this.characterLabel.setText('Character ' + (this.selectedCharacter + 1));
  }
  
  private startGame(): void {
    // Create player with selections
    gameSystems.createPlayer({
      name: this.characterName,
      characterIndex: this.selectedCharacter,
      buddyIndex: this.selectedBuddy,
      position: { x: 400, y: 400 }
    });
    
    // Give starting items
    gameSystems.inventory.addItem('weapon_wooden_sword', 1);
    gameSystems.inventory.addItem('potion_health_small', 3);
    
    // Learn starting skills
    gameSystems.skills.learnSkill('player', 'skill_power_strike');
    gameSystems.skills.learnSkill('player', 'skill_heal');
    
    // Start first quest
    gameSystems.quests.startQuest('quest_tutorial_1');
    
    // Move to world
    gameSystems.world.moveToZone('village_start');
    
    // Start world scene
    this.scene.start('WorldScene');
  }
}
