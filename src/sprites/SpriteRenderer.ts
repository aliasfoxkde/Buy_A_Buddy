// ==========================================
// SPRITE RENDERER - Fixed implementation
// Using properly extracted character sprites from reference sheets
// Sheet 1 (6f01f97c): buddy_1_1 through buddy_1_3 (row 1), buddy_2_1 through buddy_2_3 (row 2)
// Sheet 2 (2302f2f7): char_1_1 through char_1_3 (row 1), char_2_1 through char_2_3 (row 2)
// ==========================================

export type BuddyType = 
  | 'buddy_1_1' | 'buddy_1_2' | 'buddy_1_3'   // Sheet 1, Row 1
  | 'buddy_2_1' | 'buddy_2_2' | 'buddy_2_3'   // Sheet 1, Row 2
  | 'char_1_1' | 'char_1_2' | 'char_1_3'       // Sheet 2, Row 1
  | 'char_2_1' | 'char_2_2' | 'char_2_3';     // Sheet 2, Row 2

export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

export interface CharacterConfig {
  id: string;
  name: string;
  type: BuddyType;
  rarity: RarityType;
  description: string;
  stats: { hp: number; atk: number; def: number; spd: number };
}

// Character roster matching the actual extracted sprites
// Each sprite shows anime-style characters with unique outfits
const CHARACTER_ROSTER: CharacterConfig[] = [
  // === SHEET 1 - First row (buddy_1_1 to buddy_1_3) ===
  { 
    id: 'buddy_1_1', name: 'Twilight Petal', type: 'buddy_1_1', rarity: 'rare',
    description: 'A purple-dressed angel with pink twin-tails and delicate wings.',
    stats: { hp: 85, atk: 18, def: 12, spd: 16 }
  },
  { 
    id: 'buddy_1_2', name: 'Crystal Bloom', type: 'buddy_1_2', rarity: 'common', 
    description: 'A cheerful character with sparkling accessories.',
    stats: { hp: 75, atk: 14, def: 10, spd: 15 }
  },
  { 
    id: 'buddy_1_3', name: 'Star Whisper', type: 'buddy_1_3', rarity: 'common',
    description: 'A friendly buddy with a warm smile.',
    stats: { hp: 70, atk: 12, def: 8, spd: 18 }
  },
  
  // === SHEET 1 - Second row (buddy_2_1 to buddy_2_3) ===
  { 
    id: 'buddy_2_1', name: 'Crimson Shadow', type: 'buddy_2_1', rarity: 'epic',
    description: 'A fierce demon character in a red dress with dark accents.',
    stats: { hp: 80, atk: 24, def: 10, spd: 14 }
  },
  { 
    id: 'buddy_2_2', name: 'Moonbeam Spirit', type: 'buddy_2_2', rarity: 'rare',
    description: 'A mysterious figure with flowing drapes.',
    stats: { hp: 78, atk: 16, def: 14, spd: 12 }
  },
  { 
    id: 'buddy_2_3', name: 'Azure Dream', type: 'buddy_2_3', rarity: 'common',
    description: 'A cool character with blue undertones.',
    stats: { hp: 72, atk: 14, def: 9, spd: 17 }
  },
  
  // === SHEET 2 - First row (char_1_1 to char_1_3) ===
  { 
    id: 'char_1_1', name: 'Golden Sunrise', type: 'char_1_1', rarity: 'legendary',
    description: 'A majestic golden character radiating light!',
    stats: { hp: 100, atk: 22, def: 18, spd: 15 }
  },
  { 
    id: 'char_1_2', name: 'Rose Petal', type: 'char_1_2', rarity: 'common',
    description: 'A gentle character in soft pinks.',
    stats: { hp: 68, atk: 11, def: 12, spd: 14 }
  },
  { 
    id: 'char_1_3', name: 'Shadow Weaver', type: 'char_1_3', rarity: 'rare',
    description: 'A mysterious shadow entity.',
    stats: { hp: 74, atk: 18, def: 11, spd: 16 }
  },
  
  // === SHEET 2 - Second row (char_2_1 to char_2_3) ===
  { 
    id: 'char_2_1', name: 'Emerald Leaf', type: 'char_2_1', rarity: 'common',
    description: 'A nature spirit with green tones.',
    stats: { hp: 80, atk: 10, def: 14, spd: 12 }
  },
  { 
    id: 'char_2_2', name: 'Violet Storm', type: 'char_2_2', rarity: 'epic',
    description: 'An electrifying character with purple energy.',
    stats: { hp: 82, atk: 20, def: 10, spd: 16 }
  },
  { 
    id: 'char_2_3', name: 'Frost Fairy', type: 'char_2_3', rarity: 'rare',
    description: 'An icy enchantress with frozen beauty.',
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

// Image paths for each character sprite
const CHARACTER_IMAGES: Record<BuddyType, string> = {
  'buddy_1_1': '/images/buddies/buddy_1_1.png',
  'buddy_1_2': '/images/buddies/buddy_1_2.png',
  'buddy_1_3': '/images/buddies/buddy_1_3.png',
  'buddy_2_1': '/images/buddies/buddy_2_1.png',
  'buddy_2_2': '/images/buddies/buddy_2_2.png',
  'buddy_2_3': '/images/buddies/buddy_2_3.png',
  'char_1_1': '/images/buddies/char_1_1.png',
  'char_1_2': '/images/buddies/char_1_2.png',
  'char_1_3': '/images/buddies/char_1_3.png',
  'char_2_1': '/images/buddies/char_2_1.png',
  'char_2_2': '/images/buddies/char_2_2.png',
  'char_2_3': '/images/buddies/char_2_3.png',
};

// Get character config by type
export function getCharacterConfig(type: BuddyType): CharacterConfig | undefined {
  return CHARACTER_ROSTER.find(c => c.type === type);
}

// Get all character types
export function getAllCharacterTypes(): BuddyType[] {
  return CHARACTER_ROSTER.map(c => c.type);
}

// Get character image path
export function getCharacterImagePath(type: BuddyType): string {
  return CHARACTER_IMAGES[type] || '/images/buddies/buddy_1_1.png';
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

// Load all character sprites
export function loadCharacterSprites(scene: Phaser.Scene): void {
  CHARACTER_ROSTER.forEach(char => {
    const path = getCharacterImagePath(char.type);
    scene.load.image(`char_${char.type}`, path);
  });
  
  // Also load the character select UI
  scene.load.image('character_select', '/images/assets/character_select.png');
}

// Create sprite for a character
export function createCharacterSprite(
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
  
  // Fallback: try loading
  const path = getCharacterImagePath(type);
  if (scene.textures.exists(key)) {
    return scene.add.sprite(x, y, key).setScale(scale);
  }
  
  console.warn(`Character sprite not found: ${key}`);
  return null;
}

// Generate random buddy name
const NAME_PREFIXES = ['Twilight', 'Crystal', 'Star', 'Moon', 'Sun', 'Shadow', 'Frost', 'Ember', 'Nova', 'Luna'];
const NAME_SUFFIXES = ['Petal', 'Bloom', 'Whisper', 'Spirit', 'Dream', 'Spark', 'Glow', 'Mist', 'Beam', 'Leaf'];

export function generateName(): string {
  const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
  const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

// Get character by ID
export function getCharacterById(id: string): CharacterConfig | undefined {
  return CHARACTER_ROSTER.find(c => c.id === id);
}

// Get characters by rarity
export function getCharactersByRarity(rarity: RarityType): CharacterConfig[] {
  return CHARACTER_ROSTER.filter(c => c.rarity === rarity);
}

// Get total character count
export function getCharacterCount(): number {
  return CHARACTER_ROSTER.length;
}