/**
 * Crafting Scene - Craft items from recipes
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

export class CraftingScene extends Phaser.Scene {
  private recipeCards: Phaser.GameObjects.Container[] = [];
  private selectedRecipe: number = -1;
  
  constructor() {
    super({ key: 'CraftingScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 0.95);
    
    // Title
    this.add.text(width / 2, 40, 'CRAFTING', {
      fontSize: '36px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#a855f7'
    }).setOrigin(0.5);
    
    // Materials display
    this.createMaterialsPanel(100, 100);
    
    // Recipe list
    this.createRecipeList(width / 2, 150);
    
    // Close button
    const closeBtn = this.add.rectangle(width - 50, 50, 80, 50, 0xef4444);
    closeBtn.setInteractive({ useHandCursor: true });
    
    this.add.text(width - 50, 50, 'X', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => this.close());
    
    this.input.keyboard?.on('keydown-ESC', () => this.close());
  }
  
  private createMaterialsPanel(x: number, y: number): void {
    // Title
    this.add.text(x, y, 'MATERIALS', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e'
    }).setOrigin(0, 0.5);
    
    // Get inventory items
    const inventory = gameSystems.inventory.getInventory();
    const materials: { name: string; count: number }[] = [];
    
    // Count materials from inventory
    for (const slot of inventory.slots) {
      if (slot?.itemId) {
        const existing = materials.find(m => m.name === slot.itemId);
        if (existing) {
          existing.count += slot.quantity || 1;
        } else {
          materials.push({ name: slot.itemId, count: slot.quantity || 1 });
        }
      }
    }
    
    // Display first 6 materials
    materials.slice(0, 6).forEach((mat, i) => {
      const icon = this.getItemEmoji(mat.name);
      const color = mat.count > 0 ? '#22c55e' : '#666';
      
      this.add.text(x, y + 35 + i * 30, `${icon} ${mat.name}: ${mat.count}`, {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: color
      });
    });
  }
  
  private createRecipeList(x: number, y: number): void {
    // Title
    this.add.text(x, y - 20, 'RECIPES', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ec4899'
    }).setOrigin(0.5);
    
    // Get all recipes
    const recipes = gameSystems.crafting.getAllRecipes();
    
    for (let i = 0; i < Math.min(recipes.length, 6); i++) {
      const recipe = recipes[i];
      const ry = y + 30 + i * 70;
      
      const card = this.createRecipeCard(x - 200, ry, recipe, i);
      this.recipeCards.push(card);
    }
  }
  
  private createRecipeCard(x: number, y: number, recipe: any, index: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Card background
    const bg = this.add.rectangle(100, 30, 400, 60, 0x2d1b4e);
    bg.setStrokeStyle(2, index === this.selectedRecipe ? 0x22c55e : 0x555);
    
    // Recipe name
    const name = this.add.text(20, 10, recipe.output?.name || 'Unknown', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    });
    
    // Output quantity
    const qty = this.add.text(360, 10, `x${recipe.output?.quantity || 1}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(1, 0);
    
    // Ingredients preview
    let ingredientText = '';
    if (recipe.inputs) {
      for (const ing of recipe.inputs) {
        const icon = this.getItemEmoji(ing.itemId);
        ingredientText += `${icon}${ing.quantity} `;
      }
    }
    
    const ingredients = this.add.text(20, 38, ingredientText || 'No ingredients', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    });
    
    container.add([bg, name, qty, ingredients]);
    container.setSize(400, 60);
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerdown', () => {
      this.selectedRecipe = index;
      this.updateRecipeCards();
    });
    
    container.on('pointerover', () => {
      if (index !== this.selectedRecipe) {
        bg.setStrokeStyle(2, 0x888);
      }
    });
    
    container.on('pointerout', () => {
      if (index !== this.selectedRecipe) {
        bg.setStrokeStyle(2, 0x555);
      }
    });
    
    return container;
  }
  
  private updateRecipeCards(): void {
    const recipes = gameSystems.crafting.getAllRecipes();
    
    this.recipeCards.forEach((card, i) => {
      const bg = card.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(2, i === this.selectedRecipe ? 0x22c55e : 0x555);
    });
  }
  
  private getItemEmoji(itemId: string): string {
    if (itemId.includes('herb')) return '🌿';
    if (itemId.includes('iron') || itemId.includes('ore')) return '⬜';
    if (itemId.includes('wood')) return '🪵';
    if (itemId.includes('gem')) return '💎';
    if (itemId.includes('cloth')) return '🧵';
    if (itemId.includes('potion')) return '🧪';
    if (itemId.includes('sword')) return '⚔️';
    if (itemId.includes('shield')) return '🛡️';
    if (itemId.includes('armor')) return '🦺';
    if (itemId.includes('gold')) return '🪙';
    return '📦';
  }
  
  private close(): void {
    this.scene.stop();
    this.scene.resume('WorldScene');
  }
}
