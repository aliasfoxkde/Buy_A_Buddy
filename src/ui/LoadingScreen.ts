/**
 * Loading Screen - Visual transition between scenes
 */

import Phaser from 'phaser';

export class LoadingScreen {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private progressBar!: Phaser.GameObjects.Rectangle;
  private progressText!: Phaser.GameObjects.Text;
  private loadingText!: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Show loading screen with progress
   */
  public show(message: string = 'Loading...'): void {
    const { width, height } = this.scene.scale;
    
    // Create container
    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(1000);
    
    // Dark overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    overlay.setInteractive();
    this.container.add(overlay);
    
    // Loading text
    this.loadingText = this.scene.add.text(0, -80, message, {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    this.container.add(this.loadingText);
    
    // Progress bar background
    const barWidth = 300;
    const barHeight = 20;
    const barBg = this.scene.add.rectangle(0, 0, barWidth, barHeight, 0x2d1b4e);
    barBg.setStrokeStyle(2, 0xa855f7);
    this.container.add(barBg);
    
    // Progress bar fill
    this.progressBar = this.scene.add.rectangle(-barWidth / 2 + 5, 0, barWidth - 10, barHeight - 4, 0x22c55e);
    this.container.add(this.progressBar);
    
    // Progress text
    this.progressText = this.scene.add.text(0, 40, '0%', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(0.5);
    this.container.add(this.progressText);
    
    // Fade in
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200
    });
  }
  
  /**
   * Update progress
   */
  public setProgress(percent: number): void {
    if (!this.progressBar) return;
    
    const barWidth = 290;
    this.progressBar.setScale(percent / 100, 1);
    this.progressText.setText(`${Math.floor(percent)}%`);
  }
  
  /**
   * Hide loading screen with fade out
   */
  public hide(callback?: () => void): void {
    if (!this.container) {
      if (callback) callback();
      return;
    }
    
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.container.destroy();
        if (callback) callback();
      }
    });
  }
  
  /**
   * Quick flash transition
   */
  public flash(color: number = 0xffffff, duration: number = 100): void {
    const { width, height } = this.scene.scale;
    
    const flash = this.scene.add.rectangle(width / 2, height / 2, width, height, color, 0.5);
    flash.setDepth(999);
    
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      onComplete: () => flash.destroy()
    });
  }
}

/**
 * Scene transition helper
 */
export class SceneTransition {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Fade transition to another scene
   */
  public fadeTo(sceneKey: string, data?: any, duration: number = 300): void {
    const camera = this.scene.cameras.main;
    camera.fadeOut(duration, 0, 0, 0);
    
    this.scene.time.delayedCall(duration + 50, () => {
      this.scene.scene.start(sceneKey, data);
    });
  }
  
  /**
   * Fade transition and return
   */
  public fadeReturn(duration: number = 300): void {
    const camera = this.scene.cameras.main;
    camera.fadeOut(duration, 0, 0, 0);
    
    this.scene.time.delayedCall(duration + 50, () => {
      this.scene.scene.resume();
      this.scene.scene.stop();
    });
  }
  
  /**
   * Quick fade in
   */
  public fadeIn(duration: number = 300): void {
    this.scene.cameras.main.fadeIn(duration, 0, 0, 0);
  }
}