/**
 * Minimap - Shows player position in the world
 */

import Phaser from 'phaser';

export class Minimap {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private playerIndicator!: Phaser.GameObjects.Arc;
  private worldWidth: number;
  private worldHeight: number;
  private mapWidth: number = 150;
  private mapHeight: number = 100;
  
  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }
  
  public create(x: number, y: number): void {
    this.container = this.scene.add.container(x, y);
    this.container.setDepth(50);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0x1a1a2e, 0.9);
    bg.setStrokeStyle(2, 0xa855f7);
    this.container.add(bg);
    
    // Map area (slightly smaller)
    const mapBg = this.scene.add.rectangle(0, 0, this.mapWidth - 10, this.mapHeight - 10, 0x0a0a15);
    this.container.add(mapBg);
    
    // Zone label
    const zoneLabel = this.scene.add.text(0, -this.mapHeight / 2 - 10, 'MAP', {
      fontSize: '12px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    this.container.add(zoneLabel);
    
    // Player indicator (white dot)
    this.playerIndicator = this.scene.add.circle(0, 0, 4, 0xffffff);
    this.playerIndicator.setStrokeStyle(1, 0xffffff);
    this.container.add(this.playerIndicator);
    
    // Border corners for style
    const cornerSize = 8;
    const halfW = this.mapWidth / 2;
    const halfH = this.mapHeight / 2;
    
    const corners = [
      { x: -halfW + cornerSize, y: -halfH + cornerSize },
      { x: halfW - cornerSize, y: -halfH + cornerSize },
      { x: -halfW + cornerSize, y: halfH - cornerSize },
      { x: halfW - cornerSize, y: halfH - cornerSize }
    ];
    
    corners.forEach(corner => {
      const marker = this.scene.add.rectangle(corner.x, corner.y, cornerSize, 2, 0xa855f7);
      this.container.add(marker);
    });
  }
  
  /**
   * Update player position on minimap
   */
  public updatePosition(playerX: number, playerY: number): void {
    if (!this.playerIndicator) return;
    
    // Scale player position to minimap coordinates
    const scaleX = (this.mapWidth - 20) / this.worldWidth;
    const scaleY = (this.mapHeight - 20) / this.worldHeight;
    
    const mapX = (playerX * scaleX) - (this.mapWidth / 2 - 10);
    const mapY = (playerY * scaleY) - (this.mapHeight / 2 - 10);
    
    this.playerIndicator.setPosition(mapX, mapY);
    
    // Pulse effect when player moves
    this.scene.tweens.add({
      targets: this.playerIndicator,
      scale: 1.5,
      duration: 100,
      yoyo: true
    });
  }
  
  /**
   * Show/hide minimap
   */
  public setVisible(visible: boolean): void {
    if (this.container) {
      this.container.setVisible(visible);
    }
  }
  
  /**
   * Toggle minimap visibility
   */
  public toggle(): void {
    if (this.container) {
      this.container.setVisible(!this.container.visible);
    }
  }
  
  /**
   * Destroy minimap
   */
  public destroy(): void {
    if (this.container) {
      this.container.destroy();
    }
  }
}