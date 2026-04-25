// ==========================================
// SETTINGS SCENE - Pause menu and settings
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';
import { toggleFullscreen } from '../main';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('rgba(13, 13, 26, 0.95)');
    
    // Create pause menu
    this.createPauseMenu();
    this.createOptions();
    this.createBackButton();
    
    console.log('⚙️ Settings opened');
  }

  private createPauseMenu(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Title
    this.add.text(width / 2, 80, '⚙️ PAUSED', {
      fontSize: '32px',
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private createOptions(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    const options = [
      { icon: '🔊', label: 'Sound', action: () => this.toggleSound() },
      { icon: '🎵', label: 'Music', action: () => this.toggleMusic() },
      { icon: '⛶', label: 'Fullscreen', action: () => toggleFullscreen() },
      { icon: '🔄', label: 'Restart Game', action: () => this.restartGame() },
      { icon: '📖', label: 'Help', action: () => this.showHelp() },
    ];
    
    options.forEach((option, i) => {
      const y = 180 + i * 70;
      
      const btn = this.add.container(width / 2, y);
      
      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(0x2d1b4e, 1);
      bg.fillRoundedRect(-150, -30, 300, 60, 12);
      bg.lineStyle(2, 0xa855f7, 0.5);
      bg.strokeRoundedRect(-150, -30, 300, 60, 12);
      btn.add(bg);
      
      // Icon
      const icon = this.add.text(-100, 0, option.icon, { fontSize: '24px' }).setOrigin(0.5);
      btn.add(icon);
      
      // Label
      const label = this.add.text(0, 0, option.label, {
        fontSize: '20px',
        color: '#ffffff',
      }).setOrigin(0, 0.5);
      btn.add(label);
      
      // Arrow
      const arrow = this.add.text(110, 0, '→', { fontSize: '20px', color: '#666666' }).setOrigin(0.5);
      btn.add(arrow);
      
      // Hit area
      const hit = this.add.rectangle(0, 0, 320, 70).setInteractive({ useHandCursor: true }).setAlpha(0.001);
      btn.add(hit);
      
      hit.on('pointerdown', () => {
        audioManager.playClick?.();
        option.action();
      });
      
      hit.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x4d3b6e, 1);
        bg.fillRoundedRect(-150, -30, 300, 60, 12);
        bg.lineStyle(3, 0xa855f7, 0.8);
        bg.strokeRoundedRect(-150, -30, 300, 60, 12);
      });
      
      hit.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x2d1b4e, 1);
        bg.fillRoundedRect(-150, -30, 300, 60, 12);
        bg.lineStyle(2, 0xa855f7, 0.5);
        bg.strokeRoundedRect(-150, -30, 300, 60, 12);
      });
    });
  }

  private toggleSound(): void {
    const muted = audioManager.toggleMute?.() ?? false;
    // Could show visual feedback
    console.log('Sound toggled:', !muted ? 'ON' : 'OFF');
  }

  private toggleMusic(): void {
    // Toggle music on/off
    console.log('Music toggled');
  }

  private restartGame(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.stop('WorldScene');
      this.scene.stop('SettingsScene');
      this.scene.start('MainMenuScene');
    });
  }

  private showHelp(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Help overlay
    const helpBg = this.add.graphics();
    helpBg.fillStyle(0x1a0a2e, 0.98);
    helpBg.fillRect(0, 0, width, height);
    
    // Help content
    this.add.text(width / 2, 60, '📖 HOW TO PLAY', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    const controls = [
      '🎮 CONTROLS',
      '───────────────',
      'WASD / Arrows - Move',
      'E - Interact with NPCs',
      'I - Open Buddy menu',
      'M - Open Quests',
      'F - Toggle Fullscreen',
      'ESC - Pause / Exit',
      '',
      '💡 TIPS',
      '───────────────',
      '• Catch buddies to build your team',
      '• Complete quests for rewards',
      '• Work buddies to earn coins',
      '• Solve puzzles to progress',
      '• Battle wild buddies to train',
    ];
    
    this.add.text(40, 120, controls.join('\n'), {
      fontSize: '16px',
      color: '#e0e0e0',
      lineSpacing: 6,
    });
    
    // Close button
    const closeBtn = this.add.container(width / 2, height - 60);
    
    const bg = this.add.graphics();
    bg.fillStyle(0xec4899, 1);
    bg.fillRoundedRect(-80, -25, 160, 50, 12);
    closeBtn.add(bg);
    
    const label = this.add.text(0, 0, 'Got it!', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    closeBtn.add(label);
    
    const hit = this.add.rectangle(0, 0, 180, 60).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    closeBtn.add(hit);
    
    hit.on('pointerdown', () => {
      helpBg.destroy();
      this.scene.restart();
    });
  }

  private createBackButton(): void {
    const backBtn = this.add.container(35, 35);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(-18, -18, 36, 36, 8);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-18, -18, 36, 36, 8);
    backBtn.add(bg);
    
    const icon = this.add.text(0, 0, '▶', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.add(icon);
    
    const hit = this.add.rectangle(0, 0, 46, 46).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    backBtn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.scene.stop();
    });
  }
}