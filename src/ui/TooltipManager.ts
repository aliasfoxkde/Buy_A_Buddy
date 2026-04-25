/**
 * Tooltip System - Item and UI tooltips
 */

import Phaser from 'phaser';
import { formatItemName, getItemType, getItemRarity, getRarityColorHex, isEquippable, isStackable } from '../modules/inventory/inventory-utils';

export interface TooltipConfig {
  maxWidth: number;
  padding: number;
  backgroundColor: number;
  borderColor: number;
  fontSize: number;
}

const DEFAULT_CONFIG: TooltipConfig = {
  maxWidth: 280,
  padding: 12,
  backgroundColor: 0x1a1a2e,
  borderColor: 0xa855f7,
  fontSize: 14
};

export class TooltipManager {
  private scene: Phaser.Scene;
  private tooltip!: Phaser.GameObjects.Container;
  private config: TooltipConfig;
  private visible: boolean = false;
  
  constructor(scene: Phaser.Scene, config: Partial<TooltipConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.create();
  }
  
  private create(): void {
    this.tooltip = this.scene.add.container(0, 0);
    this.tooltip.setDepth(10000);
    this.tooltip.setVisible(false);
  }
  
  /**
   * Show item tooltip
   */
  showItemTooltip(
    itemId: string,
    x: number,
    y: number,
    options: {
      quantity?: number;
      slot?: number;
    } = {}
  ): void {
    // Clear previous content
    this.tooltip.removeAll(true);
    
    const { maxWidth, padding, backgroundColor, borderColor } = this.config;
    
    // Build tooltip content
    const lines: string[] = [];
    const colors: number[] = [];
    
    // Name
    lines.push(formatItemName(itemId));
    colors.push(this.hexToNumber(getRarityColorHex(getItemRarity(itemId))));
    
    // Type
    const itemType = getItemType(itemId);
    lines.push(`Type: ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`);
    colors.push(0x888888);
    
    // Stackable
    if (isStackable(itemId)) {
      lines.push(`Stack: ${options.quantity || 1}`);
      colors.push(0x666666);
    }
    
    // Stats (placeholder based on type)
    if (isEquippable(itemId)) {
      if (itemType === 'weapon') {
        lines.push('Attack: +10');
        colors.push(0x22c55e);
        lines.push('Crit Chance: +5%');
        colors.push(0x22c55e);
      } else if (itemType === 'armor') {
        lines.push('Defense: +5');
        colors.push(0x3b82f6);
        lines.push('Health: +20');
        colors.push(0xef4444);
      }
    }
    
    // Description (placeholder)
    lines.push('');
    lines.push('A useful item for your adventure.');
    colors.push(0x666666);
    
    // Calculate dimensions
    const lineHeight = this.config.fontSize + 4;
    const height = lines.length * lineHeight + padding * 2;
    
    // Background
    const bg = this.scene.add.rectangle(
      x + maxWidth / 2,
      y + height / 2,
      maxWidth,
      height,
      backgroundColor,
      0.95
    );
    bg.setStrokeStyle(2, borderColor);
    
    // Shadow
    const shadow = this.scene.add.rectangle(
      x + maxWidth / 2 + 4,
      y + height / 2 + 4,
      maxWidth,
      height,
      0x000000,
      0.3
    );
    
    // Text lines
    let textY = y + padding;
    for (let i = 0; i < lines.length; i++) {
      const text = this.scene.add.text(
        x + padding,
        textY,
        lines[i],
        {
          fontSize: `${this.config.fontSize}px`,
          fontFamily: 'Arial, sans-serif',
          color: '#ffffff',
          wordWrap: { width: maxWidth - padding * 2 }
        }
      );
      text.setFill('#' + colors[i].toString(16).padStart(6, '0'));
      
      if (i === 0) {
        text.setFontFamily('Arial Black, sans-serif');
        text.setFontSize('16px');
      }
      
      this.tooltip.add(text);
      textY += lineHeight;
    }
    
    // Add to container in correct order
    this.tooltip.addAt(shadow, 0);
    this.tooltip.addAt(bg, 1);
    
    // Reposition if off-screen
    const bounds = this.scene.cameras.main.worldView;
    if (x + maxWidth > bounds.right) {
      this.tooltip.setPosition(x - maxWidth - 20, y);
    } else {
      this.tooltip.setPosition(x + 10, y);
    }
    
    this.visible = true;
    this.tooltip.setVisible(true);
  }
  
  /**
   * Show skill tooltip
   */
  showSkillTooltip(
    skillName: string,
    skillData: {
      description: string;
      manaCost: number;
      cooldown: number;
      type: string;
    },
    x: number,
    y: number
  ): void {
    this.tooltip.removeAll(true);
    
    const { maxWidth, padding, backgroundColor, borderColor } = this.config;
    const lines = [
      skillName,
      `Type: ${skillData.type}`,
      `Mana: ${skillData.manaCost}`,
      `Cooldown: ${skillData.cooldown}s`,
      '',
      skillData.description
    ];
    
    const lineHeight = this.config.fontSize + 4;
    const height = lines.length * lineHeight + padding * 2;
    
    const bg = this.scene.add.rectangle(
      x + maxWidth / 2,
      y + height / 2,
      maxWidth,
      height,
      backgroundColor,
      0.95
    );
    bg.setStrokeStyle(2, borderColor);
    
    let textY = y + padding;
    for (let i = 0; i < lines.length; i++) {
      const text = this.scene.add.text(x + padding, textY, lines[i], {
        fontSize: `${this.config.fontSize}px`,
        fontFamily: 'Arial, sans-serif',
        color: i === 0 ? '#fff' : '#aaa',
        wordWrap: { width: maxWidth - padding * 2 }
      });
      
      if (i === 0) {
        text.setFontFamily('Arial Black, sans-serif');
        text.setFontSize('16px');
      }
      
      this.tooltip.add(text);
      textY += lineHeight;
    }
    
    this.visible = true;
    this.tooltip.setVisible(true);
  }
  
  /**
   * Show info tooltip (simple text)
   */
  showInfoTooltip(text: string, x: number, y: number): void {
    this.tooltip.removeAll(true);
    
    const { maxWidth, padding, backgroundColor, borderColor } = this.config;
    
    const displayText = this.scene.add.text(x + padding, y + padding, text, {
      fontSize: `${this.config.fontSize}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#fff',
      wordWrap: { width: maxWidth - padding * 2 }
    });
    
    const bounds = displayText.getBounds();
    const height = bounds.height + padding * 2;
    const width = Math.min(bounds.width + padding * 2, maxWidth);
    
    const bg = this.scene.add.rectangle(
      x + width / 2,
      y + height / 2,
      width,
      height,
      backgroundColor,
      0.95
    );
    bg.setStrokeStyle(2, borderColor);
    
    this.tooltip.add(bg);
    this.tooltip.add(displayText);
    
    this.visible = true;
    this.tooltip.setVisible(true);
  }
  
  /**
   * Hide tooltip
   */
  hide(): void {
    this.visible = false;
    this.tooltip.setVisible(false);
    this.tooltip.removeAll(true);
  }
  
  /**
   * Check if tooltip is visible
   */
  isVisible(): boolean {
    return this.visible;
  }
  
  /**
   * Update position (follow mouse/pointer)
   */
  updatePosition(x: number, y: number): void {
    if (!this.visible) return;
    
    const { maxWidth } = this.config;
    const bounds = this.scene.cameras.main.worldView;
    
    let newX = x + 15;
    if (newX + maxWidth > bounds.right) {
      newX = x - maxWidth - 15;
    }
    
    this.tooltip.setPosition(newX, y);
  }
  
  private hexToNumber(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }
  
  destroy(): void {
    this.tooltip.destroy();
  }
}
