// ==========================================
// SPRITE RENDERER - Using SOURCE spritesheets directly
// sheet1.png (2302f2f7) and sheet2.png (6f01f97c)
// 1536x1024 = 6 cols x 2 rows = 12 chars per sheet
// Cell size: 256x512
// ==========================================

import Phaser from 'phaser';

export type BuddyType = 
  | 'char_1_1' | 'char_1_2' | 'char_1_3' | 'char_1_4' | 'char_1_5' | 'char_1_6'
  | 'char_2_1' | 'char_2_2' | 'char_2_3' | 'char_2_4' | 'char_2_5' | 'char_2_6'
  | 'buddy_1_1' | 'buddy_1_2' | 'buddy_1_3' | 'buddy_1_4' | 'buddy_1_5' | 'buddy_1_6'
  | 'buddy_2_1' | 'buddy_2_2' | 'buddy_2_3' | 'buddy_2_4' | 'buddy_2_5' | 'buddy_2_6';

export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

export interface CharacterConfig {
  id: string;
  type: BuddyType;
  name: string;
  rarity: RarityType;
  stats: { hp: number; atk: number; def: number; spd: number };
}

// 24 characters from sheets
const CHARACTER_ROSTER: CharacterConfig[] = [
  // Sheet1 (2302f2f7) - char_*
  { id: 'char_1_1', type: 'char_1_1', name: 'Character 1', rarity: 'common', stats: { hp: 70, atk: 12, def: 10, spd: 16 } },
  { id: 'char_1_2', type: 'char_1_2', name: 'Character 2', rarity: 'common', stats: { hp: 72, atk: 14, def: 11, spd: 15 } },
  { id: 'char_1_3', type: 'char_1_3', name: 'Character 3', rarity: 'common', stats: { hp: 68, atk: 15, def: 9, spd: 17 } },
  { id: 'char_1_4', type: 'char_1_4', name: 'Character 4', rarity: 'common', stats: { hp: 74, atk: 13, def: 12, spd: 14 } },
  { id: 'char_1_5', type: 'char_1_5', name: 'Character 5', rarity: 'rare', stats: { hp: 76, atk: 16, def: 12, spd: 14 } },
  { id: 'char_1_6', type: 'char_1_6', name: 'Character 6', rarity: 'rare', stats: { hp: 75, atk: 15, def: 11, spd: 15 } },
  { id: 'char_2_1', type: 'char_2_1', name: 'Character 7', rarity: 'rare', stats: { hp: 76, atk: 15, def: 12, spd: 15 } },
  { id: 'char_2_2', type: 'char_2_2', name: 'Character 8', rarity: 'rare', stats: { hp: 74, atk: 16, def: 11, spd: 16 } },
  { id: 'char_2_3', type: 'char_2_3', name: 'Character 9', rarity: 'epic', stats: { hp: 80, atk: 18, def: 12, spd: 14 } },
  { id: 'char_2_4', type: 'char_2_4', name: 'Character 10', rarity: 'epic', stats: { hp: 82, atk: 19, def: 13, spd: 12 } },
  { id: 'char_2_5', type: 'char_2_5', name: 'Character 11', rarity: 'epic', stats: { hp: 84, atk: 20, def: 14, spd: 12 } },
  { id: 'char_2_6', type: 'char_2_6', name: 'Character 12', rarity: 'legendary', stats: { hp: 90, atk: 21, def: 16, spd: 11 } },
  // Sheet2 (6f01f97c) - buddy_*
  { id: 'buddy_1_1', type: 'buddy_1_1', name: 'Buddy 1', rarity: 'common', stats: { hp: 69, atk: 14, def: 10, spd: 17 } },
  { id: 'buddy_1_2', type: 'buddy_1_2', name: 'Buddy 2', rarity: 'common', stats: { hp: 72, atk: 12, def: 13, spd: 14 } },
  { id: 'buddy_1_3', type: 'buddy_1_3', name: 'Buddy 3', rarity: 'common', stats: { hp: 71, atk: 15, def: 10, spd: 16 } },
  { id: 'buddy_1_4', type: 'buddy_1_4', name: 'Buddy 4', rarity: 'rare', stats: { hp: 77, atk: 16, def: 12, spd: 14 } },
  { id: 'buddy_1_5', type: 'buddy_1_5', name: 'Buddy 5', rarity: 'rare', stats: { hp: 76, atk: 17, def: 11, spd: 15 } },
  { id: 'buddy_1_6', type: 'buddy_1_6', name: 'Buddy 6', rarity: 'epic', stats: { hp: 81, atk: 18, def: 13, spd: 13 } },
  { id: 'buddy_2_1', type: 'buddy_2_1', name: 'Buddy 7', rarity: 'rare', stats: { hp: 75, atk: 15, def: 12, spd: 15 } },
  { id: 'buddy_2_2', type: 'buddy_2_2', name: 'Buddy 8', rarity: 'rare', stats: { hp: 77, atk: 16, def: 11, spd: 16 } },
  { id: 'buddy_2_3', type: 'buddy_2_3', name: 'Buddy 9', rarity: 'epic', stats: { hp: 82, atk: 18, def: 14, spd: 12 } },
  { id: 'buddy_2_4', type: 'buddy_2_4', name: 'Buddy 10', rarity: 'epic', stats: { hp: 80, atk: 19, def: 13, spd: 13 } },
  { id: 'buddy_2_5', type: 'buddy_2_5', name: 'Buddy 11', rarity: 'legendary', stats: { hp: 88, atk: 20, def: 15, spd: 12 } },
  { id: 'buddy_2_6', type: 'buddy_2_6', name: 'Buddy 12', rarity: 'legendary', stats: { hp: 92, atk: 22, def: 17, spd: 10 } },
];

const RARITY_STYLES: Record<RarityType, { border: number; badge: number; label: string }> = {
  common: { border: 0x87CEEB, badge: 0x87CEEB, label: 'C' },
  rare: { border: 0x9370DB, badge: 0x9370DB, label: 'R' },
  epic: { border: 0xFF69B4, badge: 0xFF69B4, label: 'E' },
  legendary: { border: 0xFFD700, badge: 0xFFD700, label: 'L' },
};

// Grid config: 6 cols x 2 rows, cell 256x512
const CELL_W = 256;
const CELL_H = 512;

export function preloadSheets(scene: Phaser.Scene): void {
  // Load the source sheets directly
  scene.load.image('sheet1', '/images/sheet1.png');
  scene.load.image('sheet2', '/images/sheet2.png');
}

export function getCharacterConfig(type: BuddyType): CharacterConfig | undefined {
  return CHARACTER_ROSTER.find(c => c.type === type);
}

export function getAllCharacters(): CharacterConfig[] {
  return [...CHARACTER_ROSTER];
}

export function getRarityStyle(rarity: RarityType) {
  return RARITY_STYLES[rarity];
}

export function getCharacterName(type: BuddyType): string {
  const config = getCharacterConfig(type);
  return config ? config.name : type;
}

// Parse type: char_1_3 -> row=1, col=3
function getSheetAndPosition(type: BuddyType): { sheet: string; row: number; col: number } {
  const isBuddy = type.startsWith('buddy');
  const parts = type.replace('buddy_', '').replace('char_', '').split('_');
  const row = parseInt(parts[0]);
  const col = parseInt(parts[1]);
  const sheet = isBuddy ? 'sheet2' : 'sheet1';
  return { sheet, row, col };
}

export function createSpriteFromSheet(
  scene: Phaser.Scene,
  type: BuddyType,
  x: number,
  y: number,
  scale: number = 0.5
): Phaser.GameObjects.Sprite | null {
  const { sheet, row, col } = getSheetAndPosition(type);
  
  if (!scene.textures.exists(sheet)) {
    console.warn(`Sheet not loaded: ${sheet}`);
    return null;
  }
  
  // Calculate crop region
  const frameX = (col - 1) * CELL_W;
  const frameY = (row - 1) * CELL_H;
  
  // Create sprite
  const sprite = scene.add.sprite(x, y, sheet);
  sprite.setCrop(frameX, frameY, CELL_W, CELL_H);
  sprite.setScale(scale);
  sprite.setOrigin(0.5, 0.5);
  
  return sprite;
}

export function createAnimatedSprite(
  scene: Phaser.Scene,
  type: BuddyType,
  x: number,
  y: number,
  scale: number = 0.5
): Phaser.GameObjects.Sprite | null {
  const sprite = createSpriteFromSheet(scene, type, x, y, scale);
  
  if (sprite) {
    scene.tweens.add({
      targets: sprite,
      y: y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  
  return sprite;
}

// Legacy compatibility
export function createSprite(
  scene: Phaser.Scene,
  type: BuddyType,
  x: number,
  y: number,
  scale: number = 0.5
): Phaser.GameObjects.Sprite | null {
  return createSpriteFromSheet(scene, type, x, y, scale);
}

export function getCharacterCount(): number {
  return CHARACTER_ROSTER.length;
}

// Alias for preload
export function preloadSprites(scene: Phaser.Scene): void {
  preloadSheets(scene);
}