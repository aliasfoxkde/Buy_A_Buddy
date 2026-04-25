// ==========================================
// SPRITE RENDERER - Using actual reference art sheets
// Reference: 6f01f97c-f64d-4839-954f-8e64d58e4995.png and 2302f2f7-cafe-4266-b127-8b0b63dadd60.png
// ==========================================

export type BuddyType = 'buddy1' | 'buddy2' | 'buddy3' | 'buddy4' | 'buddy5' | 'buddy6';
export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

// Character roster with actual reference art mapping
export interface CharacterConfig {
  id: string;
  name: string;
  type: BuddyType;
  rarity: RarityType;
  sheet: number;        // 1 or 2 (which reference image)
  row: number;          // 1 or 2 (top or bottom row within sheet)
  col: number;          // Column position in the row
  description: string;
  stats: { hp: number; atk: number; def: number; spd: number };
}

// Characters extracted from reference art sheets
// Each sheet has 2 rows of characters, 3 columns each
const CHARACTER_ROSTER: CharacterConfig[] = [
  // Sheet 1 - Row 1 (top) - 3 characters
  { id: 'buddy1', name: 'Starbloom', type: 'buddy1', rarity: 'common', sheet: 1, row: 1, col: 1, description: 'A cheerful buddy with star patterns.', stats: { hp: 75, atk: 14, def: 8, spd: 15 } },
  { id: 'buddy2', name: 'Moonpuff', type: 'buddy2', rarity: 'common', sheet: 1, row: 1, col: 2, description: 'A dreamy buddy with moon-shaped spots.', stats: { hp: 70, atk: 12, def: 10, spd: 14 } },
  { id: 'buddy3', name: 'Crystalwisp', type: 'buddy3', rarity: 'rare', sheet: 1, row: 1, col: 3, description: 'A mystical buddy with crystal accents.', stats: { hp: 80, atk: 16, def: 12, spd: 13 } },
  // Sheet 1 - Row 2 (bottom) - 3 characters  
  { id: 'buddy4', name: 'Shadowleaf', type: 'buddy4', rarity: 'rare', sheet: 1, row: 2, col: 1, description: 'A nature spirit from the dark woods.', stats: { hp: 85, atk: 14, def: 14, spd: 12 } },
  { id: 'buddy5', name: 'Frostwing', type: 'buddy5', rarity: 'epic', sheet: 1, row: 2, col: 2, description: 'An icy buddy with delicate wings.', stats: { hp: 78, atk: 20, def: 10, spd: 18 } },
  { id: 'buddy6', name: 'Goldenheart', type: 'buddy6', rarity: 'legendary', sheet: 1, row: 2, col: 3, description: 'A royal buddy radiating golden light.', stats: { hp: 100, atk: 22, def: 18, spd: 16 } },
  // Sheet 2 would have more characters if needed
];

// Rarity styles
const RARITY_STYLES: Record<RarityType, { border: number; glow: number; badge: number; label: string }> = {
  common: { border: 0x87CEEB, glow: 0x87CEEB33, badge: 0x87CEEB, label: 'C' },
  rare: { border: 0x9370DB, glow: 0x9370DB44, badge: 0x9370DB, label: 'R' },
  epic: { border: 0xFF69B4, glow: 0xFF69B455, badge: 0xFF69B4, label: 'E' },
  legendary: { border: 0xFFD700, glow: 0xFFD70066, badge: 0xFFD700, label: 'L' },
};

// Get character config by type
export function getCharacterConfig(type: BuddyType): CharacterConfig | undefined {
  return CHARACTER_ROSTER.find(c => c.type === type);
}

// Get all character types
export function getAllCharacterTypes(): BuddyType[] {
  return CHARACTER_ROSTER.map(c => c.type);
}

// Get character image path (using the full character sheet)
export function getCharacterImagePath(type: BuddyType): string {
  const config = getCharacterConfig(type);
  if (!config) return '/images/sheets/sheet1.png';
  
  // Use the correct sheet based on character
  return `/images/sheets/sheet${config.sheet}.png`;
}

// Get sheet image path
export function getSheetImagePath(sheet: number): string {
  return `/images/sheets/sheet${sheet}.png`;
}

// Get all sheets
export function getAllSheets(): string[] {
  return [
    '/images/sheets/sheet1.png',
    '/images/sheets/sheet2.png',
    '/images/sheets/character_select.png',
    '/images/sheets/roster.png',
  ];
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

// Load all character sheets
export function loadCharacterSheets(scene: Phaser.Scene): void {
  // Load the main character sheets
  scene.load.image('sheet1', '/images/sheets/sheet1.png');
  scene.load.image('sheet2', '/images/sheets/sheet2.png');
  scene.load.image('character_select', '/images/sheets/character_select.png');
  scene.load.image('roster', '/images/sheets/roster.png');
}

// Create a sprite from the character sheet
// x, y = position in the sheet, w, h = size of character cell
export function createSpriteFromSheet(
  scene: Phaser.Scene,
  type: BuddyType,
  x: number,
  y: number,
  w: number = 512,
  h: number = 512
): Phaser.GameObjects.Sprite {
  const config = getCharacterConfig(type);
  const sheetKey = config ? `sheet${config.sheet}` : 'sheet1';
  
  // Create the sprite from the sheet
  const sprite = scene.add.sprite(x, y, sheetKey);
  
  // Set origin to center for easier positioning
  sprite.setOrigin(0.5, 0.5);
  
  return sprite;
}

// Generate random buddy name
const NAME_PREFIXES = ['Star', 'Moon', 'Crystal', 'Shadow', 'Frost', 'Golden', 'Sun', 'Cloud', 'Dream', 'Spark'];
const NAME_SUFFIXES = ['bloom', 'puff', 'wisp', 'leaf', 'wing', 'heart', 'dust', 'glow', 'mist', 'shade'];

export function generateName(): string {
  const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
  const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
  return `${prefix}${suffix}`;
}

// Get character by ID
export function getCharacterById(id: string): CharacterConfig | undefined {
  return CHARACTER_ROSTER.find(c => c.id === id);
}

// Get characters by rarity
export function getCharactersByRarity(rarity: RarityType): CharacterConfig[] {
  return CHARACTER_ROSTER.filter(c => c.rarity === rarity);
}

// Create a cropped sprite for a specific character from the sheet
export function createCharacterSprite(
  scene: Phaser.Scene,
  type: BuddyType,
  x: number,
  y: number,
  targetWidth: number = 256,
  targetHeight: number = 256
): Phaser.GameObjects.Sprite | null {
  const config = getCharacterConfig(type);
  if (!config) return null;
  
  // Calculate source position in the sheet
  // Sheet is 1536x1024, divided into 2 rows and 3 columns
  const colWidth = 512;  // 1536 / 3
  const rowHeight = 512; // 1024 / 2
  
  const sourceX = (config.col - 1) * colWidth;
  const sourceY = (config.row - 1) * rowHeight;
  
  // Create a texture for this specific character
  const textureKey = `char_${type}`;
  
  // Check if texture already exists
  if (scene.textures.exists(textureKey)) {
    return scene.add.sprite(x, y, textureKey);
  }
  
  // Create the cropped texture from the sheet
  const sheetKey = `sheet${config.sheet}`;
  
  // Generate the cropped texture
  const sourceTexture = scene.textures.get(sheetKey);
  if (!sourceTexture) return null;
  
  // Create canvas for cropping
  const canvas = document.createElement('canvas');
  canvas.width = colWidth;
  canvas.height = rowHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Get the source image
  const sourceImage = sourceTexture.getSourceImage() as HTMLImageElement;
  ctx.drawImage(
    sourceImage,
    sourceX, sourceY, colWidth, rowHeight,
    0, 0, colWidth, rowHeight
  );
  
  // Create texture from canvas
  const texture = scene.textures.createCanvas(textureKey, colWidth, rowHeight);
  if (!texture) return null;
  
  texture.context.drawImage(canvas, 0, 0);
  texture.refresh();
  
  // Create sprite
  const sprite = scene.add.sprite(x, y, textureKey);
  sprite.setScale(targetWidth / colWidth, targetHeight / rowHeight);
  sprite.setOrigin(0.5, 0.5);
  
  return sprite;
}

// Pre-generate all character textures
export function preloadCharacterTextures(scene: Phaser.Scene): Promise<void> {
  return new Promise((resolve) => {
    // Wait for sheets to load
    scene.load.once('complete', () => {
      // Create cropped textures for all characters
      CHARACTER_ROSTER.forEach(config => {
        const textureKey = `char_${config.type}`;
        if (scene.textures.exists(textureKey)) return;
        
        const sheetKey = `sheet${config.sheet}`;
        const sourceTexture = scene.textures.get(sheetKey);
        if (!sourceTexture) return;
        
        const colWidth = 512;
        const rowHeight = 512;
        const sourceX = (config.col - 1) * colWidth;
        const sourceY = (config.row - 1) * rowHeight;
        
        const canvas = document.createElement('canvas');
        canvas.width = colWidth;
        canvas.height = rowHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const sourceImage = sourceTexture.getSourceImage() as HTMLImageElement;
        ctx.drawImage(sourceImage, sourceX, sourceY, colWidth, rowHeight, 0, 0, colWidth, rowHeight);
        
        const texture = scene.textures.createCanvas(textureKey, colWidth, rowHeight);
        if (texture) {
          texture.context.drawImage(canvas, 0, 0);
          texture.refresh();
        }
      });
      resolve();
    });
    
    // Start loading if not already
    if (!scene.load.isLoading()) {
      loadCharacterSheets(scene);
      scene.load.start();
    }
  });
}