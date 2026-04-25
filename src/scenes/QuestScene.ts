// ==========================================
// QUEST SCENE - Quest log and progression
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';

interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily';
  chapter: number;
  rewards: { coins: number; xp: number };
  status: 'locked' | 'active' | 'complete';
  objectives: { text: string; progress: number; target: number }[];
}

export class QuestScene extends Phaser.Scene {
  private quests: Quest[] = [];
  private selectedQuest: Quest | null = null;

  constructor() {
    super({ key: 'QuestScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    
    // Initialize quests
    this.initQuests();
    
    // Create UI
    this.createHeader();
    this.createQuestList();
    this.createDetailPanel();
    this.createBackButton();
    
    console.log('📜 Quest log opened');
  }

  private initQuests(): void {
    this.quests = [
      // Main Quests - Chapter 1
      {
        id: 'main_1_1',
        name: 'Your First Buddy',
        description: 'Find and befriend a wild buddy in Meadow Valley',
        type: 'main',
        chapter: 1,
        rewards: { coins: 100, xp: 50 },
        status: 'active',
        objectives: [
          { text: 'Find a wild buddy', progress: 0, target: 1 },
          { text: 'Catch the buddy', progress: 0, target: 1 },
        ],
      },
      {
        id: 'main_1_2',
        name: 'The Garden Guardian',
        description: 'Defeat the Moss Golem to prove your strength',
        type: 'main',
        chapter: 1,
        rewards: { coins: 300, xp: 150 },
        status: 'locked',
        objectives: [
          { text: 'Defeat Moss Golem', progress: 0, target: 1 },
        ],
      },
      {
        id: 'main_1_3',
        name: 'The First Golden',
        description: 'Solve the symbol puzzle to free a Golden Buddy',
        type: 'main',
        chapter: 1,
        rewards: { coins: 500, xp: 250 },
        status: 'locked',
        objectives: [
          { text: 'Complete symbol puzzle', progress: 0, target: 1 },
          { text: 'Free the Golden Buddy', progress: 0, target: 1 },
        ],
      },
      
      // Side Quests
      {
        id: 'side_1',
        name: 'Flower Collector',
        description: 'Collect 10 Magic Petals for the herbalist',
        type: 'side',
        chapter: 1,
        rewards: { coins: 150, xp: 75 },
        status: 'active',
        objectives: [
          { text: 'Collect Magic Petals', progress: 3, target: 10 },
        ],
      },
      {
        id: 'side_2',
        name: 'Helping Hand',
        description: 'Help Elder Maya with her garden',
        type: 'side',
        chapter: 1,
        rewards: { coins: 100, xp: 50 },
        status: 'active',
        objectives: [
          { text: 'Water the flowers', progress: 0, target: 5 },
          { text: 'Collect seeds', progress: 0, target: 3 },
        ],
      },
      
      // Daily Quests
      {
        id: 'daily_1',
        name: 'Daily Battle',
        description: 'Win 3 battles today',
        type: 'daily',
        chapter: 0,
        rewards: { coins: 50, xp: 25 },
        status: 'active',
        objectives: [
          { text: 'Win battles', progress: 1, target: 3 },
        ],
      },
      {
        id: 'daily_2',
        name: 'Collector',
        description: 'Catch 2 new buddies today',
        type: 'daily',
        chapter: 0,
        rewards: { coins: 75, xp: 40 },
        status: 'active',
        objectives: [
          { text: 'Catch buddies', progress: 0, target: 2 },
        ],
      },
    ];
  }

  private createHeader(): void {
    const width = this.scale.width;
    
    // Header background
    const header = this.add.graphics();
    header.fillStyle(0x1a0a2e, 0.95);
    header.fillRect(0, 0, width, 70);
    header.lineStyle(2, 0xa855f7, 0.5);
    header.lineBetween(0, 70, width, 70);
    
    // Title
    this.add.text(width / 2, 35, '📜 Quests', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Quest count
    const active = this.quests.filter(q => q.status === 'active').length;
    this.add.text(20, 35, `${active} Active`, {
      fontSize: '14px',
      color: COLORS.textSecondary,
    }).setOrigin(0, 0.5);
    
    // Tabs (filter buttons)
    this.createTabs();
  }

  private createTabs(): void {
    const width = this.scale.width;
    const tabs = [
      { label: 'All', filter: null },
      { label: 'Main', filter: 'main' },
      { label: 'Side', filter: 'side' },
      { label: 'Daily', filter: 'daily' },
    ];
    
    tabs.forEach((tab, i) => {
      const x = 20 + i * 80;
      const y = 85;
      
      const tabBtn = this.add.container(x, y);
      
      const bg = this.add.graphics();
      bg.fillStyle(0x2d1b4e, 1);
      bg.fillRoundedRect(0, 0, 70, 30, 8);
      bg.lineStyle(2, 0xa855f7, 0.4);
      bg.strokeRoundedRect(0, 0, 70, 30, 8);
      tabBtn.add(bg);
      
      const label = this.add.text(35, 15, tab.label, {
        fontSize: '14px',
        color: '#ffffff',
      }).setOrigin(0.5);
      tabBtn.add(label);
      
      const hit = this.add.rectangle(35, 15, 80, 40).setInteractive({ useHandCursor: true }).setAlpha(0.001);
      tabBtn.add(hit);
      
      hit.on('pointerdown', () => {
        audioManager.playClick?.();
        this.filterQuests(tab.filter);
      });
    });
  }

  private filterQuests(filter: string | null): void {
    // Re-render quest list with filter
    this.scene.restart();
  }

  private createQuestList(): void {
    const startY = 140;
    const cardHeight = 90;
    const cardSpacing = 10;
    
    this.quests.forEach((quest, index) => {
      const y = startY + index * (cardHeight + cardSpacing);
      this.createQuestCard(quest, y, index);
    });
  }

  private createQuestCard(quest: Quest, y: number, index: number): void {
    const width = this.scale.width;
    
    // Quest type colors
    const typeColors = {
      main: 0xec4899,
      side: 0x22c55e,
      daily: 0xfbbf24,
    };
    
    const card = this.add.container(0, y);
    
    // Card background
    const bg = this.add.graphics();
    const isLocked = quest.status === 'locked';
    const alpha = isLocked ? 0.5 : 1;
    
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(20, 0, width - 40, 70 - 10, 12);
    bg.lineStyle(2, typeColors[quest.type], quest.status === 'active' ? 0.8 : 0.4);
    bg.strokeRoundedRect(20, 0, width - 40, 70 - 10, 12);
    card.add(bg);
    
    // Status icon
    let statusIcon = '📋';
    if (quest.status === 'complete') statusIcon = '✅';
    else if (quest.status === 'locked') statusIcon = '🔒';
    else if (quest.type === 'main') statusIcon = '⭐';
    
    const icon = this.add.text(50, 70 / 2 - 5, statusIcon, {
      fontSize: '28px',
    }).setOrigin(0.5);
    card.add(icon);
    
    // Quest name
    this.add.text(100, 15, quest.name, {
      fontSize: '18px',
      color: isLocked ? '#666666' : '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0, 0);
    
    // Chapter badge
    if (quest.chapter > 0) {
      const chapterBadge = this.add.graphics();
      chapterBadge.fillStyle(typeColors[quest.type], 0.8);
      chapterBadge.fillRoundedRect(100, 40, 70, 20, 6);
      card.add(chapterBadge);
      
      this.add.text(135, 50, `Ch.${quest.chapter}`, {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }
    
    // Progress bar
    const progress = this.getOverallProgress(quest);
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x1a0a2e, 1);
    progressBg.fillRoundedRect(180, 45, 100, 10, 4);
    card.add(progressBg);
    
    if (progress > 0) {
      const progressFill = this.add.graphics();
      progressFill.fillStyle(typeColors[quest.type], 1);
      progressFill.fillRoundedRect(180, 45, Math.min(100, progress * 100), 10, 4);
      card.add(progressFill);
    }
    
    // Rewards preview
    this.add.text(width - 50, 25, `💰${quest.rewards.coins}`, {
      fontSize: '14px',
      color: COLORS.gold,
    }).setOrigin(1, 0);
    
    this.add.text(width - 50, 45, `⭐${quest.rewards.xp}`, {
      fontSize: '14px',
      color: COLORS.primary,
    }).setOrigin(1, 0);
    
    // Arrow
    const arrow = this.add.text(width - 35, 70 / 2 - 5, '›', {
      fontSize: '24px',
      color: '#666666',
    }).setOrigin(0.5);
    card.add(arrow);
    
    // Hit area
    if (!isLocked) {
      const hit = this.add.rectangle(width / 2, 70 / 2 - 5, width - 40, 70 - 10)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001);
      card.add(hit);
      
      hit.on('pointerdown', () => {
        audioManager.playClick?.();
        this.selectQuest(quest);
      });
    }
  }

  private getOverallProgress(quest: Quest): number {
    if (quest.objectives.length === 0) return 0;
    const total = quest.objectives.reduce((sum, obj) => sum + obj.progress / obj.target, 0);
    return total / quest.objectives.length;
  }

  private createDetailPanel(): void {
    // Detail panel shown when quest is selected
    // In full implementation, this would show full objectives and accept quest
  }

  private selectQuest(quest: Quest): void {
    this.selectedQuest = quest;
    
    // Could expand card or show modal
    // For now, just log
    console.log('Selected quest:', quest.name);
  }

  private createBackButton(): void {
    const backBtn = this.add.container(35, 35);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(-18, -18, 36, 36, 8);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-18, -18, 36, 36, 8);
    backBtn.add(bg);
    
    const icon = this.add.text(0, 0, '←', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.add(icon);
    
    const hit = this.add.rectangle(0, 0, 46, 46).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    backBtn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.scene.stop();
    });
  }
}