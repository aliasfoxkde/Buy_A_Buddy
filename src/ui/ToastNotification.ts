/**
 * Toast Notification - Temporary on-screen messages
 */

import Phaser from 'phaser';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export class ToastNotification {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private duration: number;
  
  constructor(scene: Phaser.Scene, duration: number = 2000) {
    this.scene = scene;
    this.duration = duration;
  }
  
  public show(message: string, type: ToastType = 'info'): void {
    const { width, height } = this.scene.scale;
    
    // Create container
    this.container = this.scene.add.container(width / 2, height - 100);
    this.container.setDepth(999);
    
    // Colors by type
    const colors = {
      success: { bg: 0x22c55e, border: 0x16a34a },
      error: { bg: 0xef4444, border: 0xdc2626 },
      info: { bg: 0x3b82f6, border: 0x2563eb },
      warning: { bg: 0xf59e0b, border: 0xd97706 }
    };
    
    const color = colors[type];
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, 250, 60, color.bg);
    bg.setStrokeStyle(2, color.border);
    
    // Text
    const text = this.scene.add.text(0, 0, message, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    this.container.add([bg, text]);
    
    // Slide in from bottom
    this.container.setY(height + 60);
    this.container.setAlpha(0);
    
    this.scene.tweens.add({
      targets: this.container,
      y: height - 100,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Slide out after duration
    this.scene.tweens.add({
      targets: this.container,
      y: height + 60,
      alpha: 0,
      duration: 300,
      delay: this.duration,
      ease: 'Back.easeIn',
      onComplete: () => this.container.destroy()
    });
  }
  
  public showSuccess(message: string): void {
    this.show(message, 'success');
  }
  
  public showError(message: string): void {
    this.show(message, 'error');
  }
  
  public showInfo(message: string): void {
    this.show(message, 'info');
  }
  
  public showWarning(message: string): void {
    this.show(message, 'warning');
  }
}