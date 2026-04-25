/**
 * Settings Scene - Game settings and options
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';
import { audioManager } from '../audio/AudioManager';

export class SettingsScene extends Phaser.Scene {
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.4;
  private sfxVolume: number = 0.7;
  private volumeBars: { fill: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text; onChange: (v: number) => void }[] = [];
  
  constructor() {
    super({ key: 'SettingsScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    
    // Panel
    const panel = this.add.rectangle(width / 2, height / 2, 500, 600, 0x1a1a2e);
    panel.setStrokeStyle(3, 0xa855f7);
    
    // Title
    this.add.text(width / 2, 50, 'SETTINGS', {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Load saved settings
    this.loadSettings();
    
    // Settings options
    this.createVolumeSlider(width / 2, 130, 'Master Volume', this.masterVolume, (v) => {
      this.masterVolume = v;
      audioManager.setMasterVolume(v);
    });
    
    this.createVolumeSlider(width / 2, 220, 'Music Volume', this.musicVolume, (v) => {
      this.musicVolume = v;
      audioManager.setMusicVolume(v);
      // Test music volume
      audioManager.playSound('click');
    });
    
    this.createVolumeSlider(width / 2, 310, 'SFX Volume', this.sfxVolume, (v) => {
      this.sfxVolume = v;
      audioManager.setSFXVolume(v);
      // Test sfx volume
      audioManager.playSound('click');
    });
    
    // Test buttons
    this.createTestButtons(width / 2, 400);
    
    // Toggles
    this.createToggleButton(width / 2, 470, 'Mute All', () => {
      const muted = audioManager.toggleMute();
      audioManager.playSound(muted ? 'error' : 'success');
    });
    
    // Fullscreen button
    this.createToggleButton(width / 2, 540, 'Toggle Fullscreen', () => {
      this.toggleFullscreen();
    });
    
    // Close button
    const closeBtn = this.add.rectangle(width / 2, height / 2 + 250, 150, 50, 0x22c55e);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height / 2 + 250, 'CLOSE', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => {
      audioManager.playClick();
      this.close();
    });
    
    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }
  
  private loadSettings(): void {
    const settings = gameSystems.storage.loadSettings() as any;
    if (settings) {
      this.masterVolume = settings.masterVolume ?? 1.0;
      this.musicVolume = settings.musicVolume ?? 0.4;
      this.sfxVolume = settings.sfxVolume ?? 0.7;
    }
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
    
    this.volumeBars.push({ fill: fillBar, text: percentText, onChange });
    
    // Slider hit area
    const slider = this.add.rectangle(x, y, 300, 40).setInteractive({ useHandCursor: true });
    slider.setAlpha(0.001);
    
    const index = this.volumeBars.length - 1;
    
    slider.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.updateSlider(pointer, x, index);
    });
    
    slider.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.updateSlider(pointer, x, index);
      }
    });
  }
  
  private updateSlider(
    pointer: Phaser.Input.Pointer,
    centerX: number,
    index: number
  ): void {
    const sliderX = centerX - 150;
    const sliderWidth = 300;
    
    let value = (pointer.x - sliderX) / sliderWidth;
    value = Math.max(0, Math.min(1, value));
    
    const bar = this.volumeBars[index];
    bar.fill.setDisplaySize(sliderWidth * value, 20);
    bar.fill.setX(sliderX + (sliderWidth * value / 2));
    
    bar.text.setText(Math.round(value * 100) + '%');
    bar.onChange(value);
  }
  
  private createTestButtons(x: number, y: number): void {
    this.add.text(x - 80, y - 15, 'Test Sounds:', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    });
    
    const sounds: { label: string; sound: string }[] = [
      { label: 'Click', sound: 'click' },
      { label: 'Attack', sound: 'attack' },
      { label: 'Coin', sound: 'coin' },
      { label: 'Heal', sound: 'heal' }
    ];
    
    sounds.forEach((s, i) => {
      const btn = this.add.rectangle(x - 100 + i * 70, y + 25, 60, 35, 0x3d2b5e);
      btn.setStrokeStyle(1, 0xa855f7);
      btn.setInteractive({ useHandCursor: true });
      
      this.add.text(x - 100 + i * 70, y + 25, s.label, {
        fontSize: '11px',
        fontFamily: 'Arial, sans-serif',
        color: '#fff'
      }).setOrigin(0.5);
      
      btn.on('pointerdown', () => {
        (audioManager as any).playSound(s.sound);
      });
    });
  }
  
  private createToggleButton(x: number, y: number, label: string, action: () => void): void {
    const btn = this.add.rectangle(x, y, 250, 50, 0x2d1b4e);
    btn.setStrokeStyle(2, 0x555);
    btn.setInteractive({ useHandCursor: true });
    
    this.add.text(x, y, label, {
      fontSize: '18px',
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
