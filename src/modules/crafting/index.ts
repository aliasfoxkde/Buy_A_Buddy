/**
 * Crafting System Module
 */

import { EventBus, generateId } from '../../core';

export interface CraftingIngredient {
  itemId: string;
  quantity: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: 'weapon' | 'armor' | 'consumable' | 'accessory' | 'material';
  ingredients: CraftingIngredient[];
  result: {
    itemId: string;
    quantity: number;
  };
  craftTime: number; // seconds
  requiredLevel?: number;
  requiredStation?: 'anvil' | 'cauldron' | 'workbench' | 'enchant';
  resultDescription?: string;
}

export interface CraftingQueueItem {
  recipeId: string;
  quantity: number;
  progress: number;
  startTime: number;
}

export class CraftingSystem {
  private eventBus: EventBus;
  private recipes: Map<string, CraftingRecipe> = new Map();
  private queue: CraftingQueueItem[] = [];
  private listeners: Set<(recipeId: string, success: boolean) => void> = new Set();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeDefaultRecipes();
  }

  registerRecipe(recipe: CraftingRecipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  getRecipe(id: string): CraftingRecipe | undefined {
    return this.recipes.get(id);
  }

  getAllRecipes(): CraftingRecipe[] {
    return Array.from(this.recipes.values());
  }

  getRecipesByCategory(category: CraftingRecipe['category']): CraftingRecipe[] {
    return this.getAllRecipes().filter(r => r.category === category);
  }

  canCraft(recipeId: string, inventory: Map<string, number>, playerLevel: number = 1): { canCraft: boolean; missingItems: string[] } {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return { canCraft: false, missingItems: [] };

    if (recipe.requiredLevel && playerLevel < recipe.requiredLevel) {
      return { canCraft: false, missingItems: ['Required level not met'] };
    }

    const missingItems: string[] = [];
    for (const ingredient of recipe.ingredients) {
      const have = inventory.get(ingredient.itemId) || 0;
      if (have < ingredient.quantity) {
        missingItems.push(ingredient.itemId);
      }
    }

    return { canCraft: missingItems.length === 0, missingItems };
  }

  startCrafting(recipeId: string, quantity: number = 1): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return false;

    // Queue the crafting
    for (let i = 0; i < quantity; i++) {
      this.queue.push({
        recipeId,
        quantity: 1,
        progress: 0,
        startTime: Date.now()
      });
    }

    return true;
  }

  update(deltaTime: number): void {
    for (const item of this.queue) {
      const recipe = this.recipes.get(item.recipeId);
      if (!recipe) continue;

      item.progress += deltaTime;

      if (item.progress >= recipe.craftTime) {
        this.completeCrafting(item);
      }
    }

    // Remove completed items
    this.queue = this.queue.filter(item => item.progress < (this.recipes.get(item.recipeId)?.craftTime || 0));
  }

  private completeCrafting(item: CraftingQueueItem): void {
    const recipe = this.recipes.get(item.recipeId);
    if (!recipe) return;

    // Emit event for inventory system to add items
    this.eventBus.emit('crafting:complete', {
      recipeId: item.recipeId,
      result: recipe.result,
      quantity: item.quantity
    });

    this.listeners.forEach(cb => cb(item.recipeId, true));
  }

  cancelCrafting(index: number): boolean {
    if (index < 0 || index >= this.queue.length) return false;
    
    const item = this.queue[index];
    const recipe = this.recipes.get(item.recipeId);
    if (!recipe) return false;

    // Return half the ingredients
    for (const ingredient of recipe.ingredients) {
      this.eventBus.emit('inventory:add', {
        itemId: ingredient.itemId,
        quantity: Math.ceil(ingredient.quantity / 2)
      });
    }

    this.queue.splice(index, 1);
    return true;
  }

  getQueue(): CraftingQueueItem[] {
    return [...this.queue];
  }

  getQueueProgress(): { current: number; total: number; recipeId?: string } {
    if (this.queue.length === 0) return { current: 0, total: 0 };
    
    const current = this.queue[0];
    const recipe = this.recipes.get(current.recipeId);
    
    return {
      current: current.progress,
      total: recipe?.craftTime || 1,
      recipeId: current.recipeId
    };
  }

  onCraftingComplete(callback: (recipeId: string, success: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private initializeDefaultRecipes(): void {
    // Weapon Recipes
    this.registerRecipe({
      id: 'recipe_iron_sword',
      name: 'Iron Sword',
      description: 'Forge a sturdy iron sword.',
      category: 'weapon',
      ingredients: [
        { itemId: 'material_iron_ore', quantity: 5 },
        { itemId: 'material_wood', quantity: 2 }
      ],
      result: { itemId: 'weapon_iron_sword', quantity: 1 },
      craftTime: 5,
      requiredLevel: 1,
      requiredStation: 'anvil'
    });

    this.registerRecipe({
      id: 'recipe_steel_sword',
      name: 'Steel Sword',
      description: 'Forge a refined steel sword.',
      category: 'weapon',
      ingredients: [
        { itemId: 'material_iron_ore', quantity: 10 },
        { itemId: 'material_wood', quantity: 3 },
        { itemId: 'material_crystal', quantity: 2 }
      ],
      result: { itemId: 'weapon_steel_sword', quantity: 1 },
      craftTime: 15,
      requiredLevel: 5,
      requiredStation: 'anvil'
    });

    // Armor Recipes
    this.registerRecipe({
      id: 'recipe_iron_armor',
      name: 'Iron Armor',
      description: 'Forge iron plate armor.',
      category: 'armor',
      ingredients: [
        { itemId: 'material_iron_ore', quantity: 8 },
        { itemId: 'material_leather', quantity: 3 }
      ],
      result: { itemId: 'armor_iron', quantity: 1 },
      craftTime: 10,
      requiredLevel: 3,
      requiredStation: 'anvil'
    });

    // Consumable Recipes
    this.registerRecipe({
      id: 'recipe_health_potion',
      name: 'Health Potion',
      description: 'Brew a healing potion.',
      category: 'consumable',
      ingredients: [
        { itemId: 'material_herb_green', quantity: 2 },
        { itemId: 'material_water', quantity: 1 }
      ],
      result: { itemId: 'potion_health_small', quantity: 3 },
      craftTime: 3,
      requiredLevel: 1,
      requiredStation: 'cauldron'
    });

    this.registerRecipe({
      id: 'recipe_mana_potion',
      name: 'Mana Potion',
      description: 'Brew a mana restoring potion.',
      category: 'consumable',
      ingredients: [
        { itemId: 'material_crystal', quantity: 1 },
        { itemId: 'material_water', quantity: 1 }
      ],
      result: { itemId: 'potion_mana', quantity: 2 },
      craftTime: 4,
      requiredLevel: 2,
      requiredStation: 'cauldron'
    });

    this.registerRecipe({
      id: 'recipe_power_elixir',
      name: 'Power Elixir',
      description: 'Brew a powerful attack-enhancing elixir.',
      category: 'consumable',
      ingredients: [
        { itemId: 'material_crystal', quantity: 3 },
        { itemId: 'material_herb_red', quantity: 2 },
        { itemId: 'material_fire essence', quantity: 1 }
      ],
      result: { itemId: 'elixir_power', quantity: 1 },
      craftTime: 10,
      requiredLevel: 5,
      requiredStation: 'cauldron'
    });

    // Accessory Recipes
    this.registerRecipe({
      id: 'recipe_ring_luck',
      name: 'Ring of Fortune',
      description: 'Craft a luck-enhancing ring.',
      category: 'accessory',
      ingredients: [
        { itemId: 'material_gold_ore', quantity: 5 },
        { itemId: 'material_crystal', quantity: 3 }
      ],
      result: { itemId: 'accessory_ring_luck', quantity: 1 },
      craftTime: 20,
      requiredLevel: 5,
      requiredStation: 'enchant'
    });

    // Material Recipes
    this.registerRecipe({
      id: 'recipe_iron_ingot',
      name: 'Iron Ingot',
      description: 'Smelt iron ore into ingots.',
      category: 'material',
      ingredients: [
        { itemId: 'material_iron_ore', quantity: 2 }
      ],
      result: { itemId: 'material_iron_ingot', quantity: 1 },
      craftTime: 2,
      requiredLevel: 1,
      requiredStation: 'anvil'
    });

    this.registerRecipe({
      id: 'recipe_gold_ingot',
      name: 'Gold Ingot',
      description: 'Smelt gold ore into ingots.',
      category: 'material',
      ingredients: [
        { itemId: 'material_gold_ore', quantity: 2 }
      ],
      result: { itemId: 'material_gold_ingot', quantity: 1 },
      craftTime: 3,
      requiredLevel: 2,
      requiredStation: 'anvil'
    });
  }
}
