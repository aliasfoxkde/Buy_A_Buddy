/**
 * Settings Scene - Audio, Controls, and Display Settings
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

export class SettingsScene extends Phaser.Scene {
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 1.0;
  private showFps: boolean = false;
  private screenShake: boolean = true;
  
  constructor() {
    super({ key: 'SettingsScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
    
    // Title
    this.add.text(width / 2, 50, '⚙️ SETTINGS', {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Load saved settings
    this.loadSettings();
    
    // Audio section
    this.createAudioSection(width / 2, 130);
    
    // Display section
    this.createDisplaySection(width / 2, 320);
    
    // Controls section
    this.createControlsSection(width / 2, 450);
    
    // Close button
    const closeBtn = this.add.rectangle(width / 2, height - 60, 120, 50, 0x22c55e);
    closeBtn.setStrokeStyle(2, 0x22c55e);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height - 60, 'SAVE & CLOSE', {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.saveAndClose());
    
    // Keyboard
    this.input.keyboard?.on('keydown-ESC', () => this.saveAndClose());
  }
  
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('buyabuddy_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.masterVolume = settings.masterVolume ?? 1.0;
        this.musicVolume = settings.musicVolume ?? 0.7;
        this.sfxVolume = settings.sfxVolume ?? 1.0;
        this.showFps = settings.showFps ?? false;
        this.screenShake = settings.screenShake ?? true;
      }
    } catch {
      // Use defaults
    }
  }
  
  private saveSettings(): void {
    const settings = {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      showFps: this.showFps,
      screenShake: this.screenShake
    };
    localStorage.setItem('buyabuddy_settings', JSON.stringify(settings));
  }
  
  private createAudioSection(x: number, y: number): void {
    // Header
    this.add.text(x, y, '🔊 AUDIO', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Master volume
    this.add.text(x - 150, y + 40, 'Master Volume', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0, 0.5);
    this.createSlider(x + 50, y + 40, this.masterVolume, (value: number) => {
      this.masterVolume = value;
    });
    
    // Music volume
    this.add.text(x - 150, y + 70, 'Music Volume', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0, 0.5);
    this.createSlider(x + 50, y + 70, this.musicVolume, (value: number) => {
      this.musicVolume = value;
    });
    
    // SFX volume
    this.add.text(x - 150, y + 100, 'SFX Volume', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0, 0.5);
    this.createSlider(x + 50, y + 100, this.sfxVolume, (value: number) => {
      this.sfxVolume = value;
    });
  }
  
  private createDisplaySection(x: number, y: number): void {
    // Header
    this.add.text(x, y, '🖥️ DISPLAY', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Show FPS counter
    const fpsBtn = this.add.rectangle(x, y + 45, 200, 40, this.showFps ? 0x22c55e : 0x444);
    fpsBtn.setStrokeStyle(2, this.showFps ? 0x22c55e : 0x888);
    fpsBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(x, y + 45, this.showFps ? '✓ Show FPS Counter' : 'Show FPS Counter', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    fpsBtn.on('pointerdown', () => {
      this.showFps = !this.showFps;
      fpsBtn.setFillStyle(this.showFps ? 0x22c55e : 0x444);
      fpsBtn.setStrokeStyle(2, this.showFps ? 0x22c55e : 0x888);
    });
    
    // Screen shake
    const shakeBtn = this.add.rectangle(x, y + 95, 200, 40, this.screenShake ? 0x22c55e : 0x444);
    shakeBtn.setStrokeStyle(2, this.screenShake ? 0x22c55e : 0x888);
    shakeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(x, y + 95, this.screenShake ? '✓ Screen Shake' : 'Screen Shake', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    shakeBtn.on('pointerdown', () => {
      this.screenShake = !this.screenShake;
      shakeBtn.setFillStyle(this.screenShake ? 0x22c55e : 0x444);
      shakeBtn.setStrokeStyle(2, this.screenShake ? 0x22c55e : 0x888);
    });
  }
  
  private createControlsSection(x: number, y: number): void {
    // Header
    this.add.text(x, y, '🎮 CONTROLS', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Controls info
    const controls = [
      'WASD / Arrow Keys - Move',
      'E - Interact with NPCs',
      'I - Inventory',
      'M - Map',
      'Q - Quests',
      '1-6 - Skill Bar',
      'ESC - Menu'
    ];
    
    let offsetY = 0;
    for (const control of controls) {
      this.add.text(x - 100, y + 35 + offsetY, control, {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#aaa'
      }).setOrigin(0, 0.5);
      offsetY += 22;
    }
  }
  
  private createSlider(x: number, y: number, value: number, onChange: (value: number) => void): void {
    const track = this.add.rectangle(x, y, 150, 8, 0x444);
    track.setStrokeStyle(1, 0x666);
    
    const thumb = this.add.circle(x - 75 + (value * 150), y, 12, 0xa855f7);
    thumb.setInteractive({ draggable: true, useHandCursor: true });
    
    thumb.on('drag', (_: any, dragX: number) => {
      const newX = Math.max(x - 75, Math.min(x + 75, dragX));
      thumb.setX(newX);
      const newValue = (newX - (x - 75)) / 150;
      onChange(newValue);
    });
    
    // Update track fill
    const fill = this.add.rectangle(x - 75 + (value * 75), y, value * 150, 4, 0xa855f7);
    fill.setOrigin(0, 0.5);
  }
  
  private saveAndClose(): void {
    this.saveSettings();
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
