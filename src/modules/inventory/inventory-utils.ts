/**
 * Inventory Utilities - Sorting, Filtering, Comparison
 */

import type { InventorySlot } from '../../core';

export type SortType = 'none' | 'name' | 'type' | 'rarity' | 'quantity';
export type FilterType = 'all' | 'weapon' | 'armor' | 'consumable' | 'material' | 'quest';

export interface ItemInfo {
  id: string;
  name: string;
  type: string;
  rarity: string;
  quantity: number;
  stackable: boolean;
  equippable: boolean;
}

/**
 * Extract item info from slot
 */
export function getItemInfo(slot: InventorySlot | null): ItemInfo | null {
  if (!slot || !slot.itemId) return null;
  
  const id = slot.itemId;
  
  return {
    id,
    name: formatItemName(id),
    type: getItemType(id),
    rarity: getItemRarity(id),
    quantity: slot.quantity || 1,
    stackable: isStackable(id),
    equippable: isEquippable(id)
  };
}

/**
 * Format item ID to readable name
 */
export function formatItemName(itemId: string): string {
  return itemId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Potion/g, 'Potion')
    .replace(/Weapon/g, 'Weapon')
    .replace(/Armor/g, 'Armor');
}

/**
 * Get item type from ID
 */
export function getItemType(itemId: string): string {
  const lower = itemId.toLowerCase();
  
  if (lower.includes('sword') || lower.includes('staff') || lower.includes('wand') || lower.includes('bow')) {
    return 'weapon';
  }
  if (lower.includes('armor') || lower.includes('helmet') || lower.includes('shield') || lower.includes('boots')) {
    return 'armor';
  }
  if (lower.includes('potion') || lower.includes('herb') || lower.includes('scroll')) {
    return 'consumable';
  }
  if (lower.includes('ore') || lower.includes('wood') || lower.includes('gem') || lower.includes('cloth')) {
    return 'material';
  }
  if (lower.includes('key') || lower.includes('quest')) {
    return 'quest';
  }
  
  return 'misc';
}

/**
 * Get item rarity
 */
export function getItemRarity(itemId: string): string {
  const lower = itemId.toLowerCase();
  
  if (lower.includes('legendary') || lower.includes('mythic')) return 'legendary';
  if (lower.includes('epic')) return 'epic';
  if (lower.includes('rare')) return 'rare';
  if (lower.includes('uncommon')) return 'uncommon';
  
  return 'common';
}

/**
 * Check if item is stackable
 */
export function isStackable(itemId: string): boolean {
  const type = getItemType(itemId);
  return ['consumable', 'material', 'quest'].includes(type);
}

/**
 * Check if item is equippable
 */
export function isEquippable(itemId: string): boolean {
  const type = getItemType(itemId);
  return ['weapon', 'armor'].includes(type);
}

/**
 * Get rarity color
 */
export function getRarityColorHex(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#888888',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };
  
  return colors[rarity] || colors.common;
}

/**
 * Sort inventory slots
 */
export function sortInventory(
  slots: (InventorySlot | null)[],
  sortType: SortType,
  ascending: boolean = true
): (InventorySlot | null)[] {
  const sorted = [...slots];
  
  sorted.sort((a, b) => {
    const infoA = getItemInfo(a);
    const infoB = getItemInfo(b);
    
    // Empty slots go to the end
    if (!infoA && !infoB) return 0;
    if (!infoA) return 1;
    if (!infoB) return -1;
    
    let comparison = 0;
    
    switch (sortType) {
      case 'name':
        comparison = infoA.name.localeCompare(infoB.name);
        break;
      case 'type':
        comparison = infoA.type.localeCompare(infoB.type);
        if (comparison === 0) {
          comparison = infoA.name.localeCompare(infoB.name);
        }
        break;
      case 'rarity':
        const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        const rarityA = rarityOrder.indexOf(infoA.rarity);
        const rarityB = rarityOrder.indexOf(infoB.rarity);
        comparison = rarityA - rarityB;
        break;
      case 'quantity':
        comparison = (infoB.quantity || 1) - (infoA.quantity || 1);
        break;
      default:
        return 0;
    }
    
    return ascending ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Filter inventory slots
 */
export function filterInventory(
  slots: (InventorySlot | null)[],
  filterType: FilterType
): (InventorySlot | null)[] {
  if (filterType === 'all') return slots;
  
  return slots.filter(slot => {
    const info = getItemInfo(slot);
    if (!info) return false;
    
    return info.type === filterType;
  });
}

/**
 * Find item in inventory
 */
export function findItem(
  slots: (InventorySlot | null)[],
  itemId: string
): { slot: InventorySlot; index: number } | null {
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot?.itemId === itemId) {
      return { slot, index: i };
    }
  }
  return null;
}

/**
 * Find first empty slot
 */
export function findEmptySlot(
  slots: (InventorySlot | null)[]
): number {
  for (let i = 0; i < slots.length; i++) {
    if (!slots[i] || !slots[i]?.itemId) {
      return i;
    }
  }
  return -1;
}

/**
 * Count total items
 */
export function countItems(slots: (InventorySlot | null)[]): number {
  return slots.reduce((total, slot) => {
    if (slot?.itemId) {
      return total + (slot.quantity || 1);
    }
    return total;
  }, 0);
}

/**
 * Count items by type
 */
export function countByType(
  slots: (InventorySlot | null)[],
  type: string
): number {
  return slots.reduce((total, slot) => {
    const info = getItemInfo(slot);
    if (info && info.type === type) {
      return total + info.quantity;
    }
    return total;
  }, 0);
}

/**
 * Get inventory value (sell price)
 */
export function getInventoryValue(slots: (InventorySlot | null)[]): number {
  return slots.reduce((total, slot) => {
    const info = getItemInfo(slot);
    if (!info) return total;
    
    // Base prices by type
    const basePrices: Record<string, number> = {
      weapon: 50,
      armor: 40,
      consumable: 10,
      material: 5,
      quest: 0,
      misc: 5
    };
    
    // Rarity multiplier
    const rarityMultiplier: Record<string, number> = {
      common: 1,
      uncommon: 2,
      rare: 5,
      epic: 10,
      legendary: 25
    };
    
    const basePrice = basePrices[info.type] || 5;
    const rarityMult = rarityMultiplier[info.rarity] || 1;
    
    return total + (basePrice * rarityMult * info.quantity);
  }, 0);
}

/**
 * Compare two equipment items
 */
export interface EquipmentComparison {
  statName: string;
  currentValue: number;
  newValue: number;
  difference: number;
  improvement: boolean;
}

export function compareEquipment(
  currentId: string | null,
  newId: string,
  slotType: 'weapon' | 'armor'
): EquipmentComparison[] {
  const comparisons: EquipmentComparison[] = [];
  
  const baseStats = {
    weapon: { attack: 10, critChance: 0.05 },
    armor: { defense: 5, health: 0 }
  };
  
  const getStats = (id: string | null) => {
    if (!id) return { attack: 0, critChance: 0, defense: 0, health: 0 };
    
    // Get rarity from item name
    const rarity = getItemRarity(id);
    const rarityMult = { common: 1, uncommon: 1.2, rare: 1.5, epic: 2, legendary: 3 }[rarity] || 1;
    
    if (slotType === 'weapon') {
      return {
        attack: baseStats.weapon.attack * rarityMult,
        critChance: baseStats.weapon.critChance * rarityMult,
        defense: 0,
        health: 0
      };
    } else {
      return {
        attack: 0,
        critChance: 0,
        defense: baseStats.armor.defense * rarityMult,
        health: baseStats.armor.health * rarityMult
      };
    }
  };
  
  const current = getStats(currentId);
  const next = getStats(newId);
  
  if (slotType === 'weapon') {
    comparisons.push({
      statName: 'Attack',
      currentValue: Math.floor(current.attack),
      newValue: Math.floor(next.attack),
      difference: Math.floor(next.attack - current.attack),
      improvement: next.attack > current.attack
    });
    comparisons.push({
      statName: 'Crit Chance',
      currentValue: Math.floor(current.critChance * 100),
      newValue: Math.floor(next.critChance * 100),
      difference: Math.floor((next.critChance - current.critChance) * 100),
      improvement: next.critChance > current.critChance
    });
  } else {
    comparisons.push({
      statName: 'Defense',
      currentValue: Math.floor(current.defense),
      newValue: Math.floor(next.defense),
      difference: Math.floor(next.defense - current.defense),
      improvement: next.defense > current.defense
    });
  }
  
  return comparisons;
}
