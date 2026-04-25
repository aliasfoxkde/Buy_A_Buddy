/**
 * Minimap and Quest Tracker UI
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

export interface QuestTrackerConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class QuestTracker {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private config: QuestTrackerConfig;
  
  constructor(scene: Phaser.Scene, config: QuestTrackerConfig) {
    this.scene = scene;
    this.config = config;
    this.create();
  }
  
  private create(): void {
    const { x, y, width, height } = this.config;
    
    this.container = this.scene.add.container(0, 0);
    
    // Background
    const bg = this.scene.add.rectangle(x, y, width, height, 0x1a1a2e, 0.9);
    bg.setStrokeStyle(2, 0xa855f7);
    
    // Title
    const title = this.scene.add.text(x, y - height / 2 + 15, 'QUEST', {
      fontSize: '12px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    this.container.add([bg, title]);
  }
  
  /**
   * Update quest display
   */
  update(): void {
    // Clear previous content
    const children = this.container.list;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child !== children[0] && child !== children[1]) {
        child.destroy();
      }
    }
    
    // Get active quests
    const activeQuests = gameSystems.quests.getActiveQuests();
    const quest = activeQuests[0]; // Show first quest
    
    if (!quest) {
      const noQuest = this.scene.add.text(
        this.config.x,
        this.config.y + 20,
        'No active quest',
        {
          fontSize: '11px',
          fontFamily: 'Arial, sans-serif',
          color: '#888'
        }
      ).setOrigin(0.5);
      this.container.add(noQuest);
      return;
    }
    
    const questDef = gameSystems.quests.getQuest(quest.questId);
    if (!questDef) return;
    
    // Quest name
    const questName = this.scene.add.text(
      this.config.x,
      this.config.y + 5,
      questDef.name,
      {
        fontSize: '13px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fff',
        wordWrap: { width: this.config.width - 20 }
      }
    ).setOrigin(0.5, 0);
    
    // Objectives
    let objY = this.config.y + 30;
    for (const obj of quest.objectives.slice(0, 3)) {
      const progress = obj.current >= obj.required ? '✓' : `○`;
      const objectiveText = this.scene.add.text(
        this.config.x - this.config.width / 2 + 10,
        objY,
        `${progress} ${obj.target}: ${obj.current}/${obj.required}`,
        {
          fontSize: '10px',
          fontFamily: 'Arial, sans-serif',
          color: obj.current >= obj.required ? '#22c55e' : '#aaa'
        }
      );
      this.container.add(objectiveText);
      objY += 15;
    }
  }
  
  /**
   * Show/hide tracker
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
  
  /**
   * Set position
   */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }
  
  destroy(): void {
    this.container.destroy();
  }
}

/**
 * Minimap component
 */
export interface MinimapConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Minimap {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private config: MinimapConfig;
  private playerMarker!: Phaser.GameObjects.Star;
  
  constructor(scene: Phaser.Scene, config: MinimapConfig) {
    this.scene = scene;
    this.config = config;
    this.create();
  }
  
  private create(): void {
    const { x, y, width, height } = this.config;
    
    this.container = this.scene.add.container(0, 0);
    
    // Background
    const bg = this.scene.add.rectangle(x, y, width, height, 0x0a0a15, 0.85);
    bg.setStrokeStyle(2, 0x555);
    
    // Title
    const title = this.scene.add.text(x, y - height / 2 + 10, 'MAP', {
      fontSize: '10px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#888'
    }).setOrigin(0.5);
    
    // Zone indicator
    const zone = this.scene.add.text(x, y - height / 2 + 22, 'Village', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#666'
    }).setOrigin(0.5);
    
    // Player marker
    this.playerMarker = this.scene.add.star(x, y, 5, 5, 8, 0x22c55e);
    this.playerMarker.setScale(1.5);
    
    // NPC markers (placeholder)
    const npcMarker = this.scene.add.circle(x + 50, y - 30, 4, 0xa855f7);
    const npcMarker2 = this.scene.add.circle(x - 40, y + 40, 4, 0xec4899);
    
    // Enemy markers (placeholder)
    const enemyMarker = this.scene.add.circle(x + 30, y + 20, 3, 0xef4444);
    
    // Treasure/chest markers (placeholder)
    const treasureMarker = this.scene.add.rectangle(x - 30, y - 40, 6, 6, 0xfbbf24);
    
    this.container.add([bg, title, zone, this.playerMarker, npcMarker, npcMarker2, enemyMarker, treasureMarker]);
    this.container.setDepth(1000);
  }
  
  /**
   * Update player position on minimap
   */
  updatePlayerPosition(worldX: number, worldY: number): void {
    // Convert world position to minimap position
    // This would need the world bounds
    const mapX = this.config.x + (worldX - 400) * 0.05;
    const mapY = this.config.y + (worldY - 300) * 0.05;
    
    // Clamp to minimap bounds
    const halfWidth = this.config.width / 2 - 10;
    const halfHeight = this.config.height / 2 - 10;
    
    const clampedX = Phaser.Math.Clamp(mapX, this.config.x - halfWidth, this.config.x + halfWidth);
    const clampedY = Phaser.Math.Clamp(mapY, this.config.y - halfHeight, this.config.y + halfHeight);
    
    this.playerMarker.setPosition(clampedX, clampedY);
  }
  
  /**
   * Update zone name
   */
  updateZone(zoneName: string): void {
    // Find zone text and update
    const children = this.container.list;
    if (children[2]) {
      (children[2] as Phaser.GameObjects.Text).setText(zoneName);
    }
  }
  
  /**
   * Add marker for position
   */
  addMarker(x: number, y: number, type: 'npc' | 'enemy' | 'treasure' | 'waypoint', label?: string): void {
    const mapX = this.config.x + (x - 400) * 0.05;
    const mapY = this.config.y + (y - 300) * 0.05;
    
    const colors = {
      npc: 0xa855f7,
      enemy: 0xef4444,
      treasure: 0xfbbf24,
      waypoint: 0x22c55e
    };
    
    const marker = type === 'treasure' 
      ? this.scene.add.rectangle(mapX, mapY, 5, 5, colors[type])
      : this.scene.add.circle(mapX, mapY, 3, colors[type]);
    
    marker.setDepth(this.config.y + 100);
    this.container.add(marker);
  }
  
  /**
   * Clear all markers except player
   */
  clearMarkers(): void {
    const children = this.container.list;
    for (let i = children.length - 1; i >= 4; i--) {
      children[i].destroy();
    }
  }
  
  /**
   * Set position
   */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
    this.config.x = x;
    this.config.y = y;
  }
  
  /**
   * Show/hide
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
  
  destroy(): void {
    this.container.destroy();
  }
}

/**
 * HUD Manager - combines all HUD elements
 */
export class HUDManager {
  private scene: Phaser.Scene;
  private questTracker?: QuestTracker;
  private minimap?: Minimap;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Create all HUD elements
   */
  create(): void {
    const { width, height } = this.scene.scale;
    
    // Quest tracker (top-left)
    this.questTracker = new QuestTracker(this.scene, {
      x: 150,
      y: 100,
      width: 200,
      height: 100
    });
    
    // Minimap (top-right)
    this.minimap = new Minimap(this.scene, {
      x: width - 80,
      y: 80,
      width: 120,
      height: 120
    });
  }
  
  /**
   * Update HUD elements
   */
  update(playerX: number, playerY: number): void {
    this.questTracker?.update();
    this.minimap?.updatePlayerPosition(playerX, playerY);
  }
  
  /**
   * Show/hide all HUD
   */
  setVisible(visible: boolean): void {
    this.questTracker?.setVisible(visible);
    this.minimap?.setVisible(visible);
  }
  
  /**
   * Toggle HUD visibility
   */
  toggle(): void {
    const current = this.questTracker ? !this.questTracker['container'].visible : true;
    this.setVisible(current);
  }
  
  destroy(): void {
    this.questTracker?.destroy();
    this.minimap?.destroy();
  }
}
