/**
 * Achievement Scene - View all achievements
 */

import Phaser from 'phaser';
import { achievementSystem, type Achievement } from '../systems/AchievementSystem';

export class AchievementScene extends Phaser.Scene {
  private achievementCards: Phaser.GameObjects.Container[] = [];
  
  constructor() {
    super({ key: 'AchievementScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
    
    // Title
    const title = this.add.text(width / 2, 50, '🏆 ACHIEVEMENTS', {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
    
    // Stats summary
    const unlocked = achievementSystem.getUnlockedAchievements().length;
    const total = achievementSystem.getAllAchievements().length;
    
    const statsText = this.add.text(width / 2, 95, `${unlocked}/${total} Unlocked`, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    }).setOrigin(0.5);
    
    // Create achievement list
    this.createAchievementList(100, 150, width);
    
    // Close button
    const closeBtn = this.add.rectangle(width - 60, height - 50, 100, 50, 0xef4444);
    closeBtn.setInteractive({ useHandCursor: true });
    
    const closeText = this.add.text(width - 60, height - 50, 'CLOSE', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.close());
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xdc2626));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0xef4444));
    
    // Keyboard
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-Q', () => this.close());
    
    // Subscribe to new unlocks
    achievementSystem.onUnlock((achievement) => {
      this.showUnlockNotification(achievement);
    });
  }
  
  private createAchievementList(startX: number, startY: number, width: number): void {
    const achievements = achievementSystem.getAllAchievements();
    const cardWidth = 350;
    const cardHeight = 80;
    const columns = 2;
    const spacingX = 30;
    const spacingY = 20;
    
    achievements.forEach((achievement, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      const x = startX + col * (cardWidth + spacingX);
      const y = startY + row * (cardHeight + spacingY);
      
      const card = this.createAchievementCard(x, y, cardWidth, cardHeight, achievement);
      this.achievementCards.push(card);
    });
  }
  
  private createAchievementCard(x: number, y: number, width: number, height: number, achievement: Achievement): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Card background
    const bgColor = achievement.unlocked ? 0x1a2e1a : 0x2d1b4e;
    const borderColor = achievement.unlocked ? 0x22c55e : 0x555;
    
    const bg = this.add.rectangle(width / 2, height / 2, width, height, bgColor);
    bg.setStrokeStyle(2, borderColor);
    container.add(bg);
    
    // Icon
    const icon = this.add.text(30, height / 2, achievement.icon, {
      fontSize: '36px'
    }).setOrigin(0.5);
    container.add(icon);
    
    // Locked overlay
    if (!achievement.unlocked) {
      const lockOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);
      container.add(lockOverlay);
      
      const lockIcon = this.add.text(30, height / 2, '🔒', {
        fontSize: '24px'
      }).setOrigin(0.5);
      container.add(lockIcon);
    }
    
    // Achievement name
    const nameColor = achievement.unlocked ? '#22c55e' : '#888';
    const name = this.add.text(70, height / 2 - 15, achievement.name, {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: nameColor
    }).setOrigin(0, 0.5);
    container.add(name);
    
    // Description
    const desc = this.add.text(70, height / 2 + 12, achievement.description, {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    }).setOrigin(0, 0.5);
    container.add(desc);
    
    // Unlocked timestamp
    if (achievement.unlocked && achievement.unlockedAt) {
      const date = new Date(achievement.unlockedAt);
      const dateStr = date.toLocaleDateString();
      const dateText = this.add.text(width - 20, height / 2, dateStr, {
        fontSize: '10px',
        fontFamily: 'Arial, sans-serif',
        color: '#666'
      }).setOrigin(1, 0.5);
      container.add(dateText);
    }
    
    // Glow effect for unlocked
    if (achievement.unlocked) {
      this.tweens.add({
        targets: bg,
        alpha: 0.9,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    return container;
  }
  
  private showUnlockNotification(achievement: Achievement): void {
    const { width, height } = this.scale;
    
    const notification = this.add.container(width / 2, 150);
    notification.setDepth(200);
    
    // Background
    const bg = this.add.rectangle(0, 0, 400, 80, 0x1a1a2e);
    bg.setStrokeStyle(3, 0xfbbf24);
    notification.add(bg);
    
    // Text
    const text = this.add.text(0, 0, `🏆 Achievement: ${achievement.name}`, {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24'
    }).setOrigin(0.5);
    notification.add(text);
    
    // Slide in animation
    notification.setAlpha(0);
    notification.setY(-100);
    
    this.tweens.add({
      targets: notification,
      alpha: 1,
      y: 150,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // Auto-dismiss after 3 seconds
    this.tweens.add({
      targets: notification,
      alpha: 0,
      y: -100,
      duration: 300,
      delay: 3000,
      ease: 'Back.easeIn',
      onComplete: () => notification.destroy()
    });
  }
  
  private close(): void {
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}