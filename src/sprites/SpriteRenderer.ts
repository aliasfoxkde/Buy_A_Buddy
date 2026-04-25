// ==========================================
// SPRITE RENDERER - Fixed implementation with proper sprite names
// 12 unique anime characters extracted from reference art
// ==========================================

export type BuddyType = 
  | 'twilight_petal' | 'rose_angel' | 'shadow_mistress'
  | 'crimson_flame' | 'violet_dream' | 'dark_princess'
  | 'golden_hero' | 'petal_fairy' | 'night_weaver'
  | 'emerald_sprite' | 'storm_mage' | 'frost_enchantress';

export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

export interface CharacterConfig {
  id: string;
  name: string;
  type: BuddyType;
  rarity: RarityType;
  description: string;
  stats: { hp: number; atk: number; def: number; spd: number };
}

// 12 Characters - exact match to extracted PNG files
const CHARACTER_ROSTER: CharacterConfig[] = [
  // === Sheet 1, Row 1 ===
  { 
    id: 'twilight_petal', 
    name: 'Twilight Petal', 
    type: 'twilight_petal', 
    rarity: 'rare',
    description: 'A pink-haired angel with twin-tails, purple dress, wings, and white thigh-highs.',
    stats: { hp: 85, atk: 18, def: 12, spd: 16 }
  },
  { 
    id: 'rose_angel', 
    name: 'Rose Angel', 
    type: 'rose_angel', 
    rarity: 'common',
    description: 'A gentle character in white/pink with blonde twin-tails and cross accessory.',
    stats: { hp: 78, atk: 14, def: 10, spd: 15 }
  },
  { 
    id: 'shadow_mistress', 
    name: 'Shadow Mistress', 
    type: 'shadow_mistress', 
    rarity: 'epic',
    description: 'A mysterious figure in dark purple with long flowing hair.',
    stats: { hp: 80, atk: 22, def: 11, spd: 14 }
  },
  
  // === Sheet 1, Row 2 ===
  { 
    id: 'crimson_flame', 
    name: 'Crimson Flame', 
    type: 'crimson_flame', 
    rarity: 'epic',
    description: 'A fierce character in a dramatic red dress with black hair.',
    stats: { hp: 82, atk: 24, def: 9, spd: 14 }
  },
  { 
    id: 'violet_dream', 
    name: 'Violet Dream', 
    type: 'violet_dream', 
    rarity: 'rare',
    description: 'A dreamy character in purple with matching hair and ethereal aura.',
    stats: { hp: 76, atk: 16, def: 13, spd: 15 }
  },
  { 
    id: 'dark_princess', 
    name: 'Dark Princess', 
    type: 'dark_princess', 
    rarity: 'legendary',
    description: 'An elegant royal in dark purple with crown and white stockings.',
    stats: { hp: 95, atk: 20, def: 16, spd: 12 }
  },
  
  // === Sheet 2, Row 1 ===
  { 
    id: 'golden_hero', 
    name: 'Golden Hero', 
    type: 'golden_hero', 
    rarity: 'legendary',
    description: 'A majestic hero radiating golden light with elegant gold dress and crown!',
    stats: { hp: 100, atk: 22, def: 18, spd: 15 }
  },
  { 
    id: 'petal_fairy', 
    name: 'Petal Fairy', 
    type: 'petal_fairy', 
    rarity: 'common',
    description: 'A soft fairy in pink with a gentle appearance and flowing dress.',
    stats: { hp: 72, atk: 12, def: 11, spd: 17 }
  },
  { 
    id: 'night_weaver', 
    name: 'Night Weaver', 
    type: 'night_weaver', 
    rarity: 'rare',
    description: 'A mysterious shadow entity in dark purple/black with enigmatic presence.',
    stats: { hp: 74, atk: 18, def: 12, spd: 16 }
  },
  
  // === Sheet 2, Row 2 ===
  { 
    id: 'emerald_sprite', 
    name: 'Emerald Sprite', 
    type: 'emerald_sprite', 
    rarity: 'common',
    description: 'A nature spirit in green with ribbon accessories and hair pulled up.',
    stats: { hp: 80, atk: 10, def: 14, spd: 13 }
  },
  { 
    id: 'storm_mage', 
    name: 'Storm Mage', 
    type: 'storm_mage', 
    rarity: 'epic',
    description: 'An electrifying mage in purple/pink with hair up and magical aura.',
    stats: { hp: 78, atk: 20, def: 10, spd: 18 }
  },
  { 
    id: 'frost_enchantress', 
    name: 'Frost Enchantress', 
    type: 'frost_enchantress', 
    rarity: 'rare',
    description: 'An icy enchantress in light purple with pigtails and frozen beauty.',
    stats: { hp: 76, atk: 16, def: 14, spd: 14 }
  },
];

// Rarity styles
const RARITY_STYLES: Record<RarityType, { border: number; badge: number; label: string }> = {
  common: { border: 0x87CEEB, badge: 0x87CEEB, label: 'C' },
  rare: { border: 0x9370DB, badge: 0x9370DB, label: 'R' },
  epic: { border: 0xFF69B4, badge: 0xFF69B4, label: 'E' },
  legendary: { border: 0xFFD700, badge: 0xFFD700, label: 'L' },
};

// Get character config by type
export function getCharacterConfig(type: BuddyType): CharacterConfig | undefined {
  return CHARACTER_ROSTER.find(c => c.type === type);
}

// Get all character types
export function getAllCharacterTypes(): BuddyType[] {
  return CHARACTER_ROSTER.map(c => c.type);
}

// Get sprite path (uses the exact PNG filename)
export function getSpritePath(type: BuddyType): string {
  return `/images/buddies/${type}.png`;
}

// Get rarity style
export function getRarityStyle(rarity: RarityType) {
  return RARITY_STYLES[rarity];
}

// Get character name
export function getCharacterName(type: BuddyType): string {
  const config = getCharacterConfig(type);
  return config?.name || type;
}

// Get all characters
export function getAllCharacters(): CharacterConfig[] {
  return [...CHARACTER_ROSTER];
}

// Preload all sprites for a scene
export function preloadSprites(scene: Phaser.Scene): void {
  CHARACTER_ROSTER.forEach(char => {
    const path = getSpritePath(char.type);
    scene.load.image(`char_${char.type}`, path);
  });
}

// Create sprite for a character
export function createSprite(
  scene: Phaser.Scene,
  type: BuddyType,
  x: number = 0,
  y: number = 0,
  scale: number = 0.5
): Phaser.GameObjects.Sprite | null {
  const key = `char_${type}`;
  
  if (scene.textures.exists(key)) {
    return scene.add.sprite(x, y, key).setScale(scale);
  }
  
  // Try to load
  const path = getSpritePath(type);
  if (scene.textures.exists(key)) {
    return scene.add.sprite(x, y, key).setScale(scale);
  }
  
  console.warn(`Sprite not found: ${key}`);
  return null;
}

// Create animated sprite with idle bounce
export function createAnimatedSprite(
  scene: Phaser.Scene,
  type: BuddyType,
  x: number = 0,
  y: number = 0,
  scale: number = 0.5
): Phaser.GameObjects.Sprite | null {
  const sprite = createSprite(scene, type, x, y, scale);
  
  if (sprite) {
    scene.tweens.add({
      targets: sprite,
      y: y - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  
  return sprite;
}

// Get character by ID
export function getCharacterById(id: string): CharacterConfig | undefined {
  return CHARACTER_ROSTER.find(c => c.id === id);
}

// Get characters by rarity
export function getCharactersByRarity(rarity: RarityType): CharacterConfig[] {
  return CHARACTER_ROSTER.filter(c => c.rarity === rarity);
}

// Get random character
export function getRandomCharacter(): CharacterConfig {
  return CHARACTER_ROSTER[Math.floor(Math.random() * CHARACTER_ROSTER.length)];
}

// Total character count
export function getCharacterCount(): number {
  return CHARACTER_ROSTER.length;
}

// Generate random name
const NAME_PREFIXES = ['Twilight', 'Crimson', 'Shadow', 'Golden', 'Frost', 'Storm', 'Emerald', 'Violet', 'Dark', 'Star'];
const NAME_SUFFIXES = ['Petal', 'Flame', 'Mist', 'Hero', 'Fairy', 'Weaver', 'Sprite', 'Dream', 'Angel', 'Mage'];

export function generateName(): string {
  const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
  const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

// Validate all sprites exist
export function validateSprites(): { missing: string[]; found: string[] } {
  const result = { missing: [] as string[], found: [] as string[] };
  
  CHARACTER_ROSTER.forEach(char => {
    const path = `public/images/buddies/${char.type}.png`;
    const fs = require('fs');
    if (fs.existsSync(path)) {
      result.found.push(char.type);
    } else {
      result.missing.push(char.type);
    }
  });
  
  return result;
}