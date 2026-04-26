/**
 * Screen Transitions - Fade effects between scenes
 */

import Phaser from 'phaser';

export class ScreenTransition {
  private scene: Phaser.Scene;
  private duration: number;
  
  constructor(scene: Phaser.Scene, duration: number = 300) {
    this.scene = scene;
    this.duration = duration;
  }
  
  /**
   * Fade out and transition to another scene
   */
  public fadeTo(sceneKey: string, data?: any): void {
    const camera = this.scene.cameras.main;
    
    camera.fadeOut(this.duration, 0, 0, 0);
    
    this.scene.time.delayedCall(this.duration + 50, () => {
      this.scene.scene.start(sceneKey, data);
    });
  }
  
  /**
   * Fade out and launch (overlay) another scene
   */
  public fadeLaunch(sceneKey: string, data?: any): void {
    const camera = this.scene.cameras.main;
    
    camera.fadeOut(this.duration, 0, 0, 0);
    
    this.scene.time.delayedCall(this.duration + 50, () => {
      this.scene.scene.pause();
      this.scene.scene.launch(sceneKey, data);
    });
  }
  
  /**
   * Fade in from black
   */
  public fadeIn(): void {
    const camera = this.scene.cameras.main;
    camera.fadeIn(this.duration, 0, 0, 0);
  }
  
  /**
   * Flash effect (for damage, etc.)
   */
  public flash(color: number = 0xffffff, duration: number = 100): void {
    this.scene.cameras.main.flash(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff, true);
  }
  
  /**
   * Shake effect
   */
  public shake(intensity: number = 0.01, duration: number = 100): void {
    this.scene.cameras.main.shake(duration, intensity);
  }
  
  /**
   * Fade to black and back (for emphasis)
   */
  public pulse(duration: number = 200): Promise<void> {
    return new Promise((resolve) => {
      const camera = this.scene.cameras.main;
      camera.fadeOut(duration, 0, 0, 0);
      
      this.scene.time.delayedCall(duration + 100, () => {
        camera.fadeIn(duration, 0, 0, 0);
        this.scene.time.delayedCall(duration, resolve);
      });
    });
  }
}