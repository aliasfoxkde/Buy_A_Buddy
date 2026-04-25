/**
 * Settings Scene - Game settings and options
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

export class SettingsScene extends Phaser.Scene {
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private volumeBars: Phaser.GameObjects.Rectangle[] = [];
  
  constructor() {
    super({ key: 'SettingsScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    
    // Panel
    const panel = this.add.rectangle(width / 2, height / 2, 500, 550, 0x1a1a2e);
    panel.setStrokeStyle(3, 0xa855f7);
    
    // Title
    this.add.text(width / 2, 60, 'SETTINGS', {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Settings options
    this.createVolumeSlider(width / 2, 150, 'Master Volume', this.masterVolume, (v) => {
      this.masterVolume = v;
      // gameSystems.audioManager.setMasterVolume(v);
    });
    
    this.createVolumeSlider(width / 2, 230, 'Music Volume', this.musicVolume, (v) => {
      this.musicVolume = v;
      // gameSystems.audioManager.setMusicVolume(v);
    });
    
    this.createVolumeSlider(width / 2, 310, 'SFX Volume', this.sfxVolume, (v) => {
      this.sfxVolume = v;
      // gameSystems.audioManager.setSfxVolume(v);
    });
    
    // Fullscreen button
    this.createToggleButton(width / 2, 400, 'Fullscreen', () => {
      this.toggleFullscreen();
    });
    
    // Show FPS toggle
    this.createToggleButton(width / 2, 470, 'Show FPS', () => {
      // Toggle FPS display
    });
    
    // Close button
    const closeBtn = this.add.rectangle(width / 2, height / 2 + 220, 150, 50, 0x22c55e);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 220, 'CLOSE', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.close());
    
    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }
  
  private createVolumeSlider(x: number, y: number, label: string, initialValue: number, onChange: (v: number) => void): void {
    // Label
    this.add.text(x - 180, y - 25, label, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0, 0.5);
    
    // Background bar
    const bgBar = this.add.rectangle(x, y, 300, 20, 0x2d1b4e);
    bgBar.setStrokeStyle(1, 0x555);
    
    // Fill bar
    const fillBar = this.add.rectangle(x - 150 + (300 * initialValue / 2), y, 300 * initialValue, 20, 0xa855f7);
    
    // Volume percentage
    const percentText = this.add.text(x + 180, y, Math.round(initialValue * 100) + '%', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(0, 0.5);
    
    this.volumeBars.push(fillBar);
    
    // Slider hit area
    const slider = this.add.rectangle(x, y, 300, 40).setInteractive({ useHandCursor: true });
    slider.setAlpha(0.001);
    
    slider.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.updateSlider(pointer, x, fillBar, percentText, onChange);
    });
    
    slider.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.updateSlider(pointer, x, fillBar, percentText, onChange);
      }
    });
  }
  
  private updateSlider(
    pointer: Phaser.Input.Pointer,
    centerX: number,
    fillBar: Phaser.GameObjects.Rectangle,
    percentText: Phaser.GameObjects.Text,
    onChange: (v: number) => void
  ): void {
    const sliderX = centerX - 150;
    const sliderWidth = 300;
    
    let value = (pointer.x - sliderX) / sliderWidth;
    value = Math.max(0, Math.min(1, value));
    
    fillBar.setDisplaySize(sliderWidth * value, 20);
    fillBar.setX(this.cameras.main.scrollX + sliderX + (sliderWidth * value / 2));
    
    percentText.setText(Math.round(value * 100) + '%');
    onChange(value);
  }
  
  private createToggleButton(x: number, y: number, label: string, action: () => void): void {
    const btn = this.add.rectangle(x, y, 250, 50, 0x2d1b4e);
    btn.setStrokeStyle(2, 0x555);
    btn.setInteractive({ useHandCursor: true });
    
    this.add.text(x, y, label, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    btn.on('pointerdown', action);
    
    btn.on('pointerover', () => btn.setFillStyle(0x3d2b5e));
    btn.on('pointerout', () => btn.setFillStyle(0x2d1b4e));
  }
  
  private toggleFullscreen(): void {
    const isFullscreen = document.fullscreenElement;
    if (isFullscreen) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }
  
  private close(): void {
    // Save settings
    gameSystems.storage.saveSettings({
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume
    });
    
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
