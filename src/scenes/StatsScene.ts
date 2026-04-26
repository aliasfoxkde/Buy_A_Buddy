/**
 * Stats Scene - Player Statistics and Progress
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

export class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatsScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
    
    // Title
    this.add.text(width / 2, 50, '📊 CHARACTER STATS', {
      fontSize: '32px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Get player stats
    const stats = gameSystems.getPlayerStats();
    if (!stats) return;
    
    const centerX = width / 2;
    
    // Left column - Basic stats
    this.add.text(centerX - 180, 110, 'BASIC STATS', {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e'
    }).setOrigin(0, 0);
    
    const basicStats = [
      { label: 'Level', value: stats.level.toString() },
      { label: 'Experience', value: `${stats.experience}/${this.getExpForNextLevel(stats.level)}` },
      { label: 'Health', value: `${stats.health}/${stats.maxHealth}` },
      { label: 'Mana', value: `${stats.mana}/${stats.maxMana}` },
      { label: 'Gold', value: stats.gold.toString() }
    ];
    
    let yOffset = 140;
    for (const stat of basicStats) {
      this.add.text(centerX - 180, yOffset, `${stat.label}:`, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#888'
      }).setOrigin(0, 0);
      this.add.text(centerX - 50, yOffset, stat.value, {
        fontSize: '14px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff'
      }).setOrigin(0, 0);
      yOffset += 25;
    }
    
    // Right column - Combat stats
    this.add.text(centerX + 50, 110, 'COMBAT STATS', {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ef4444'
    }).setOrigin(0, 0);
    
    const combatStats = [
      { label: 'Attack', value: stats.attack.toString() },
      { label: 'Defense', value: stats.defense.toString() },
      { label: 'Speed', value: stats.speed.toString() },
      { label: 'Luck', value: stats.luck.toString() },
      { label: 'Crit %', value: `${Math.round(stats.critChance * 100)}%` }
    ];
    
    yOffset = 140;
    for (const stat of combatStats) {
      this.add.text(centerX + 50, yOffset, `${stat.label}:`, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#888'
      }).setOrigin(0, 0);
      this.add.text(centerX + 180, yOffset, stat.value, {
        fontSize: '14px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff'
      }).setOrigin(0, 0);
      yOffset += 25;
    }
    
    // Progress section
    this.add.text(centerX, 300, '🏆 LIFETIME PROGRESS', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
    
    // Progress data
    const progress = this.getProgressData();
    
    const progressStats = [
      { label: 'Highest Level', value: progress.highestLevel.toString(), color: '#a855f7' },
      { label: 'Enemies Defeated', value: progress.enemiesDefeated.toString(), color: '#ef4444' },
      { label: 'Quests Completed', value: progress.questsCompleted.toString(), color: '#22c55e' },
      { label: 'Gold Earned', value: this.formatNumber(progress.totalGoldEarned), color: '#fbbf24' },
      { label: 'Damage Dealt', value: this.formatNumber(progress.totalDamageDealt), color: '#f97316' },
      { label: 'Healing Done', value: this.formatNumber(progress.totalHealingDone), color: '#ec4899' }
    ];
    
    yOffset = 340;
    for (const stat of progressStats) {
      this.add.text(centerX - 150, yOffset, `${stat.label}:`, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: '#888'
      }).setOrigin(0, 0);
      this.add.text(centerX + 150, yOffset, stat.value, {
        fontSize: '13px',
        fontFamily: 'Arial Black, sans-serif',
        color: stat.color
      }).setOrigin(1, 0);
      yOffset += 28;
    }
    
    // Exp bar visualization
    const expProgress = stats.experience / this.getExpForNextLevel(stats.level);
    const barBg = this.add.rectangle(centerX, yOffset + 20, 300, 16, 0x444);
    barBg.setStrokeStyle(1, 0x666);
    const expBar = this.add.rectangle(centerX - 150, yOffset + 20, expProgress * 300, 14, 0xf59e0b);
    expBar.setOrigin(0, 0.5);
    this.add.text(centerX, yOffset + 20, `Next Level: ${Math.round(expProgress * 100)}%`, {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Close button
    const closeBtn = this.add.rectangle(width / 2, height - 50, 120, 50, 0xef4444);
    closeBtn.setStrokeStyle(2, 0xef4444);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height - 50, 'CLOSE', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.close());
    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }
  
  private getExpForNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }
  
  private getProgressData(): any {
    try {
      const saved = localStorage.getItem('buyabuddy_progress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Use defaults
    }
    return {
      enemiesDefeated: 0,
      questsCompleted: 0,
      highestLevel: 1,
      totalGoldEarned: 0,
      totalDamageDealt: 0,
      totalHealingDone: 0
    };
  }
  
  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
  
  private close(): void {
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
