/**
 * Death Screen - Game over UI with respawn options
 */

import Phaser from 'phaser';

export class DeathScreen {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private onRespawn?: () => void;
  private onQuit?: () => void;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  public show(options: {
    onRespawn?: () => void;
    onQuit?: () => void;
  } = {}): void {
    this.onRespawn = options.onRespawn;
    this.onQuit = options.onQuit;
    
    const { width, height } = this.scene.scale;
    
    // Create container
    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(1000);
    
    // Dark overlay
    const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setInteractive();
    this.container.add(overlay);
    
    // Death banner
    const banner = this.scene.add.rectangle(0, 0, 400, 350, 0x1a0a0a);
    banner.setStrokeStyle(4, 0xef4444);
    this.container.add(banner);
    
    // Skull icon
    const skullText = this.scene.add.text(0, -130, '💀', {
      fontSize: '64px'
    }).setOrigin(0.5);
    this.container.add(skullText);
    
    // "DEFEATED" text
    const defeatText = this.scene.add.text(0, -60, 'DEFEATED', {
      fontSize: '40px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ef4444',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    this.container.add(defeatText);
    
    // Subtitle
    const subText = this.scene.add.text(0, -10, 'Your journey ends here...', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(0.5);
    this.container.add(subText);
    
    // Respawn button
    const respawnBtn = this.scene.add.rectangle(0, 80, 280, 60, 0x22c55e);
    respawnBtn.setStrokeStyle(2, 0xfff);
    respawnBtn.setInteractive({ useHandCursor: true });
    this.container.add(respawnBtn);
    
    const respawnText = this.scene.add.text(0, 80, 'RESPAWN', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    this.container.add(respawnText);
    
    respawnBtn.on('pointerdown', () => this.respawn());
    respawnBtn.on('pointerover', () => respawnBtn.setFillStyle(0x16a34a));
    respawnBtn.on('pointerout', () => respawnBtn.setFillStyle(0x22c55e));
    
    // Quit button
    const quitBtn = this.scene.add.rectangle(0, 160, 280, 50, 0x555555);
    quitBtn.setStrokeStyle(1, 0x888);
    quitBtn.setInteractive({ useHandCursor: true });
    this.container.add(quitBtn);
    
    const quitText = this.scene.add.text(0, 160, 'QUIT TO MENU', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    this.container.add(quitText);
    
    quitBtn.on('pointerdown', () => this.quit());
    quitBtn.on('pointerover', () => quitBtn.setFillStyle(0x666666));
    quitBtn.on('pointerout', () => quitBtn.setFillStyle(0x555555));
    
    // Fade in animation
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
    
    // Keyboard controls
    this.scene.input.keyboard?.on('keydown-R', () => this.respawn());
    this.scene.input.keyboard?.on('keydown-Q', () => this.quit());
  }
  
  public hide(): void {
    if (this.container && this.container.active) {
      this.container.destroy();
    }
  }
  
  private respawn(): void {
    // Fade out and trigger respawn
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.container.destroy();
        if (this.onRespawn) {
          this.onRespawn();
        }
      }
    });
  }
  
  private quit(): void {
    // Fade out and trigger quit
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.container.destroy();
        if (this.onQuit) {
          this.onQuit();
        }
      }
    });
  }
  
  public destroy(): void {
    if (this.container) {
      this.container.destroy();
    }
  }
}