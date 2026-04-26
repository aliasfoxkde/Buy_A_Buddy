/**
 * Quest Scene
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';
import { QUESTS, type Quest } from '../data/quests';

export class QuestScene extends Phaser.Scene {
  private questContainers: Phaser.GameObjects.Container[] = [];
  
  constructor() {
    super({ key: 'QuestScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
    
    // Title
    this.add.text(width / 2, 40, 'QUESTS', {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Tabs
    this.createTabs(100, 90);
    
    // Quest list
    this.displayQuests();
    
    // Close button
    const closeBtn = this.add.rectangle(width - 50, height - 50, 80, 50, 0xef4444);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width - 50, height - 50, 'CLOSE', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.close());
    
    this.input.keyboard?.on('keydown-Q', () => this.close());
    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }
  
  private createTabs(x: number, y: number): void {
    const tabs = ['ACTIVE', 'COMPLETED', 'AVAILABLE'];
    const tabWidth = 150;
    
    for (let i = 0; i < tabs.length; i++) {
      const tab = this.add.rectangle(
        x + i * (tabWidth + 10),
        y,
        tabWidth,
        40,
        i === 0 ? 0xa855f7 : 0x2d1b4e
      );
      tab.setStrokeStyle(2, 0xa855f7);
      tab.setInteractive({ useHandCursor: true });
      
      this.add.text(
        x + i * (tabWidth + 10),
        y,
        tabs[i],
        {
          fontSize: '16px',
          fontFamily: 'Arial Black, sans-serif',
          color: '#fff'
        }
      ).setOrigin(0.5);
      
      tab.on('pointerdown', () => this.switchTab(i));
    }
  }
  
  private switchTab(tabIndex: number): void {
    this.displayQuests(tabIndex);
  }
  
  private displayQuests(tabIndex: number = 0): void {
    // Clear existing
    for (const container of this.questContainers) {
      container.destroy();
    }
    this.questContainers = [];
    
    const { width, height } = this.scale;
    let y = 160;
    
    const activeQuests = gameSystems.quests.getActiveQuests();
    
    if (activeQuests.length === 0) {
      this.add.text(width / 2, height / 2, 'No quests in this category', {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#888'
      }).setOrigin(0.5);
      return;
    }
    
    for (const quest of activeQuests) {
      const questDef = gameSystems.quests.getQuest(quest.questId);
      if (!questDef) continue;
      
      const container = this.add.container(width / 2 - 250, y);
      
      // Quest panel
      const bg = this.add.rectangle(250, 40, 500, 80, 0x2d1b4e);
      bg.setStrokeStyle(2, quest.status === 'active' ? 0x22c55e : 0x555);
      
      // Quest name
      const nameText = this.add.text(20, 15, questDef.name, {
        fontSize: '18px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff'
      });
      
      // Description
      const descText = this.add.text(20, 40, questDef.description.substring(0, 50) + '...', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#aaa'
      });
      
      // Objectives
      let objText = '';
      for (const obj of quest.objectives) {
        objText += `${obj.current}/${obj.required} `;
      }
      
      const progressText = this.add.text(20, 60, `Progress: ${objText}`, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#22c55e'
      });
      
      container.add([bg, nameText, descText, progressText]);
      this.questContainers.push(container);
      
      y += 100;
    }
  }
  
  private close(): void {
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
