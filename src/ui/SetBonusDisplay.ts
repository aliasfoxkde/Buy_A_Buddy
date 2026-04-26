/**
 * Set Bonus Display UI
 */

import Phaser from 'phaser';
import { EQUIPMENT_SETS, calculateSetBonuses } from '../data/equipmentSets';

export class SetBonusDisplay {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isVisible: boolean = false;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  create(x: number, y: number): void {
    this.container = this.scene.add.container(x, y);
    this.container.setVisible(false);
    this.container.setDepth(1000);
  }
  
  show(equippedItems: string[]): void {
    // Clear previous content
    this.container.removeAll(true);
    
    // Calculate active set bonuses
    const activeBonuses = calculateSetBonuses(equippedItems);
    
    if (activeBonuses.length === 0) {
      // No set bonuses active
      const noBonus = this.scene.add.text(0, 0, 'No Set Bonuses Active', {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#888'
      }).setOrigin(0.5);
      this.container.add(noBonus);
    } else {
      // Show active set bonuses
      let offsetY = 0;
      
      for (const { setId, bonus } of activeBonuses) {
        const set = EQUIPMENT_SETS[setId];
        if (!set) continue;
        
        // Set name header
        const header = this.scene.add.text(0, offsetY, `${set.name} (${bonus.pieces}pc)`, {
          fontSize: '20px',
          fontFamily: 'Arial Black, sans-serif',
          color: '#fbbf24'
        }).setOrigin(0, 0);
        this.container.add(header);
        offsetY += 30;
        
        // Bonus name and description
        const bonusText = this.scene.add.text(0, offsetY, bonus.name, {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: '#22c55e'
        }).setOrigin(0, 0);
        this.container.add(bonusText);
        offsetY += 25;
        
        const descText = this.scene.add.text(0, offsetY, bonus.description, {
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          color: '#aaa'
        }).setOrigin(0, 0);
        this.container.add(descText);
        offsetY += 35;
      }
    }
    
    this.container.setVisible(true);
    this.isVisible = true;
  }
  
  hide(): void {
    this.container.setVisible(false);
    this.isVisible = false;
  }
  
  toggle(equippedItems: string[]): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show(equippedItems);
    }
  }
  
  destroy(): void {
    this.container.destroy();
  }
}
