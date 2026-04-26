/**
 * Boot Scene - Game Initialization
 */

import Phaser from 'phaser';
import { gameSystems, SpriteConfig } from '../systems/GameSystems';
import { audioManager } from '../audio/AudioManager';

export class BootScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload(): void {
    // Create loading UI
    this.createLoadingUI();
    
    // Draw initial progress bar
    this.drawProgressBar(0);
    
    // Setup loading events
    this.setupLoadingEvents();
    
    // Load all spritesheets
    this.loadAllSprites();
  }
  
  create(): void {
    // Initialize audio (must be done on user interaction)
    this.initAudio();
    
    // Load saved settings and apply to audio
    this.loadAudioSettings();
    
    // Initialize game systems
    this.initGameSystems();
    
    // Transition to menu
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }
  
  private loadAudioSettings(): void {
    // Load and apply saved settings from localStorage
    const settings = gameSystems.storage.loadSettings() as any;
    if (settings) {
      if (settings.masterVolume !== undefined) {
        audioManager.setMasterVolume(settings.masterVolume);
      }
      if (settings.musicVolume !== undefined) {
        audioManager.setMusicVolume(settings.musicVolume);
      }
      if (settings.sfxVolume !== undefined) {
        audioManager.setSFXVolume(settings.sfxVolume);
      }
      console.log('Audio settings loaded:', settings);
    }
  }
  
  private async initAudio(): Promise<void> {
    try {
      await audioManager.init();
      console.log('Audio system ready');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }
  
  private createLoadingUI(): void {
    const { width, height } = this.scale;
    
    // Background
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Title
    this.add.text(width / 2, height / 3, 'BUY A BUDDY', {
      fontSize: '48px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 + 50, 'Loading...', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(0.5);
    
    // Progress bar background
    this.progressBar = this.add.graphics();
    this.loadingBar = this.add.graphics();
    
    // Draw bar background
    this.progressBar.fillStyle(0x2d1b4e, 1);
    this.progressBar.fillRoundedRect(width / 2 - 200, height / 2, 400, 30, 8);
    this.progressBar.lineStyle(2, 0xa855f7, 1);
    this.progressBar.strokeRoundedRect(width / 2 - 200, height / 2, 400, 30, 8);
  }
  
  private drawProgressBar(percent: number): void {
    const { width, height } = this.scale;
    const barWidth = 400 * Math.min(percent, 1);
    
    // Clear previous
    this.loadingBar.clear();
    
    // Draw progress
    this.loadingBar.fillStyle(0xa855f7, 1);
    this.loadingBar.fillRoundedRect(width / 2 - 198, height / 2 + 2, barWidth - 4, 26, 6);
    
    // Update text
    this.loadingText.setText(`Loading... ${Math.floor(percent * 100)}%`);
  }
  
  private setupLoadingEvents(): void {
    // Update progress bar during loading
    this.load.on('progress', (percent: number) => {
      this.drawProgressBar(percent);
    });
    
    this.load.on('fileprogress', (file: any) => {
      this.loadingText.setText(`Loading: ${file.key}`);
    });
    
    this.load.on('complete', () => {
      this.loadingText.setText('Complete!');
      this.drawProgressBar(1);
    });
  }
  
  private loadAllSprites(): void {
    const sprites = SpriteConfig.getAllPaths();
    
    for (const sprite of sprites) {
      this.load.image(sprite.key, sprite.path);
    }
    
    // Load tile spritesheets (6 cols x 4 rows = 24 frames)
    this.load.spritesheet('tiles_ground', '/images/sprites/tiles_ground.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    
    this.load.spritesheet('tiles_walls', '/images/sprites/tiles_walls.png', {
      frameWidth: 128,
      frameHeight: 128
    });
    
    // UI spritesheets
    this.load.spritesheet('ui_buttons', '/images/sprites/ui/buttons.png', {
      frameWidth: 200,
      frameHeight: 60
    });
    
    this.load.spritesheet('ui_bars', '/images/sprites/ui/bars.png', {
      frameWidth: 300,
      frameHeight: 30
    });
    
    // Environment spritesheets (6 cols x 4 rows)
    this.load.spritesheet('nature', '/images/sprites/nature.png', {
      frameWidth: 256,
      frameHeight: 256
    });
    
    this.load.spritesheet('environment', '/images/sprites/environment.png', {
      frameWidth: 256,
      frameHeight: 256
    });
    
    this.load.spritesheet('npc', '/images/sprites/npc.png', {
      frameWidth: 256,
      frameHeight: 256
    });
    
    this.load.spritesheet('skills', '/images/sprites/skills.png', {
      frameWidth: 256,
      frameHeight: 256
    });
    
    this.load.spritesheet('effects', '/images/sprites/effects.png', {
      frameWidth: 256,
      frameHeight: 256
    });
    
    this.load.spritesheet('buildings', '/images/sprites/buildings.png', {
      frameWidth: 256,
      frameHeight: 256
    });
    
    // Enemy spritesheet (6 cols x 4 rows = 24 frames)
    this.load.spritesheet('enemies', '/images/sprites/enemies.png', {
      frameWidth: 256,
      frameHeight: 256
    });
  }
  
  private initGameSystems(): void {
    // Initialize game systems
    gameSystems.init();
  }
}
