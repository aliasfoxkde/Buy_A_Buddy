// ==========================================
// SPRITE RENDERER - RPG Character Style
// Based on reference art - anime-style RPG characters
// ==========================================

export type BuddyType = 'slime' | 'fairy' | 'angel' | 'demon' | 'shadow' | 'crystal' | 'nature' | 'fire' | 'golden';
export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

// Character configurations matching the UI reference
interface CharacterConfig {
  name: string;
  type: BuddyType;
  bodyColor: string;
  accentColor: string;
  hairColor?: string;
  outfitColor: string;
  hasWings: boolean;
  hasHorns: boolean;
  hasTail: boolean;
  expression: 'happy' | 'cool' | 'cute';
}

const CHARACTER_CONFIGS: Record<BuddyType, CharacterConfig> = {
  slime: {
    name: 'Bubbleslime',
    type: 'slime',
    bodyColor: '#87CEEB',
    accentColor: '#B0E0E6',
    outfitColor: '#5F9EA0',
    hasWings: false,
    hasHorns: false,
    hasTail: false,
    expression: 'happy',
  },
  fairy: {
    name: 'Petalfairy',
    type: 'fairy',
    bodyColor: '#FFE4E1',
    accentColor: '#FFB6C1',
    hairColor: '#FF69B4',
    outfitColor: '#FF69B4',
    hasWings: true,
    hasHorns: false,
    hasTail: false,
    expression: 'happy',
  },
  angel: {
    name: 'Cloudangel',
    type: 'angel',
    bodyColor: '#FFFFFF',
    accentColor: '#E0E7FF',
    hairColor: '#87CEEB',
    outfitColor: '#E0E7FF',
    hasWings: true,
    hasHorns: false,
    hasTail: false,
    expression: 'happy',
  },
  demon: {
    name: 'Nightdemon',
    type: 'demon',
    bodyColor: '#E6E6FA',
    accentColor: '#9370DB',
    hairColor: '#4B0082',
    outfitColor: '#9370DB',
    hasWings: true,
    hasHorns: true,
    hasTail: true,
    expression: 'cool',
  },
  shadow: {
    name: 'Darkpuff',
    type: 'shadow',
    bodyColor: '#4B0082',
    accentColor: '#8B008B',
    hairColor: '#2E0854',
    outfitColor: '#4B0082',
    hasWings: false,
    hasHorns: false,
    hasTail: false,
    expression: 'cool',
  },
  crystal: {
    name: 'Shimmerpuff',
    type: 'crystal',
    bodyColor: '#E0FFFF',
    accentColor: '#00CED1',
    hairColor: '#40E0D0',
    outfitColor: '#20B2AA',
    hasWings: false,
    hasHorns: false,
    hasTail: false,
    expression: 'happy',
  },
  nature: {
    name: 'Leafsprout',
    type: 'nature',
    bodyColor: '#98FB98',
    accentColor: '#90EE90',
    hairColor: '#228B22',
    outfitColor: '#228B22',
    hasWings: false,
    hasHorns: false,
    hasTail: false,
    expression: 'happy',
  },
  fire: {
    name: 'Blazefire',
    type: 'fire',
    bodyColor: '#FFDAB9',
    accentColor: '#FFA07A',
    hairColor: '#FF4500',
    outfitColor: '#FF4500',
    hasWings: true,
    hasHorns: true,
    hasTail: true,
    expression: 'cool',
  },
  golden: {
    name: 'Goldpuff',
    type: 'golden',
    bodyColor: '#FFD700',
    accentColor: '#FFF8DC',
    hairColor: '#FFD700',
    outfitColor: '#FFD700',
    hasWings: true,
    hasHorns: true,
    hasTail: true,
    expression: 'happy',
  },
};

// Rarity styles
const RARITY_STYLES: Record<RarityType, { border: string; glow: string; badge: string }> = {
  common: { border: '#87CEEB', glow: 'rgba(135, 206, 235, 0.3)', badge: '#87CEEB' },
  rare: { border: '#9370DB', glow: 'rgba(147, 112, 219, 0.4)', badge: '#9370DB' },
  epic: { border: '#FF69B4', glow: 'rgba(255, 105, 180, 0.5)', badge: '#FF69B4' },
  legendary: { border: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)', badge: '#FFD700' },
};

// Generate sprite matching the anime RPG style
export function createCharacterSprite(
  type: BuddyType,
  rarity: RarityType,
  size: number = 128
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const config = CHARACTER_CONFIGS[type];
  const rarityStyle = RARITY_STYLES[rarity];
  
  const centerX = size / 2;
  const centerY = size / 2;
  
  ctx.save();
  
  // 1. Background glow (for rare+)
  if (rarity !== 'common') {
    const gradient = ctx.createRadialGradient(centerX, centerY, size * 0.3, centerX, centerY, size * 0.5);
    gradient.addColorStop(0, rarityStyle.glow);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  
  // 2. Wings (if character has wings)
  if (config.hasWings) {
    drawWings(ctx, centerX, centerY, size, config.bodyColor);
  }
  
  // 3. Body/Torso
  drawBody(ctx, centerX, centerY, size, config);
  
  // 4. Head and face
  drawHead(ctx, centerX, centerY, size, config);
  
  // 5. Hair
  if (config.hairColor) {
    drawHair(ctx, centerX, centerY, size, config.hairColor);
  }
  
  // 6. Outfit details
  drawOutfit(ctx, centerX, centerY, size, config.outfitColor);
  
  // 7. Accessories (horns, tail)
  if (config.hasHorns) drawHorns(ctx, centerX, centerY, size);
  if (config.hasTail) drawTail(ctx, centerX, centerY, size, config.accentColor);
  
  // 8. Expression (eyes, mouth)
  drawExpression(ctx, centerX, centerY, size, config.expression);
  
  // 9. Rarity indicator
  drawRarityBadge(ctx, centerX, centerY, size, rarityStyle.badge);
  
  ctx.restore();
  
  return canvas;
}

// Draw anime-style wings
function drawWings(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  
  // Left wing
  ctx.beginPath();
  ctx.ellipse(cx - size * 0.45, cy - size * 0.1, size * 0.15, size * 0.25, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - size * 0.5, cy + size * 0.05, size * 0.1, size * 0.18, -0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Right wing
  ctx.beginPath();
  ctx.ellipse(cx + size * 0.45, cy - size * 0.1, size * 0.15, size * 0.25, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + size * 0.5, cy + size * 0.05, size * 0.1, size * 0.18, 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 1;
}

// Draw anime body (torso)
function drawBody(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, config: CharacterConfig): void {
  const gradient = ctx.createLinearGradient(cx - size * 0.2, cy, cx + size * 0.2, cy + size * 0.3);
  gradient.addColorStop(0, config.bodyColor);
  gradient.addColorStop(1, config.accentColor);
  
  ctx.fillStyle = gradient;
  
  // Body shape (rounded torso)
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.25, cy + size * 0.1);
  ctx.quadraticCurveTo(cx - size * 0.3, cy + size * 0.25, cx - size * 0.2, cy + size * 0.4);
  ctx.lineTo(cx + size * 0.2, cy + size * 0.4);
  ctx.quadraticCurveTo(cx + size * 0.3, cy + size * 0.25, cx + size * 0.25, cy + size * 0.1);
  ctx.quadraticCurveTo(cx, cy, cx - size * 0.25, cy + size * 0.1);
  ctx.fill();
}

// Draw anime head
function drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, config: CharacterConfig): void {
  // Head circle
  ctx.fillStyle = config.bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - size * 0.15, size * 0.22, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Face highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - size * 0.08, cy - size * 0.22, size * 0.06, size * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

// Draw anime hair
function drawHair(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  ctx.fillStyle = color;
  
  // Main hair
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.25, cy - size * 0.15);
  ctx.quadraticCurveTo(cx - size * 0.3, cy - size * 0.45, cx - size * 0.15, cy - size * 0.4);
  ctx.lineTo(cx, cy - size * 0.45);
  ctx.lineTo(cx + size * 0.15, cy - size * 0.4);
  ctx.quadraticCurveTo(cx + size * 0.3, cy - size * 0.45, cx + size * 0.25, cy - size * 0.15);
  ctx.quadraticCurveTo(cx, cy - size * 0.25, cx - size * 0.25, cy - size * 0.15);
  ctx.fill();
  
  // Side hair strands
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.25, cy - size * 0.15);
  ctx.quadraticCurveTo(cx - size * 0.35, cy, cx - size * 0.28, cy + size * 0.1);
  ctx.lineTo(cx - size * 0.2, cy - size * 0.05);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.25, cy - size * 0.15);
  ctx.quadraticCurveTo(cx + size * 0.35, cy, cx + size * 0.28, cy + size * 0.1);
  ctx.lineTo(cx + size * 0.2, cy - size * 0.05);
  ctx.fill();
}

// Draw outfit/clothing
function drawOutfit(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  ctx.fillStyle = color;
  
  // Collar/cape
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.2, cy + size * 0.1);
  ctx.quadraticCurveTo(cx - size * 0.25, cy + size * 0.2, cx - size * 0.15, cy + size * 0.3);
  ctx.lineTo(cx, cy + size * 0.25);
  ctx.lineTo(cx + size * 0.15, cy + size * 0.3);
  ctx.quadraticCurveTo(cx + size * 0.25, cy + size * 0.2, cx + size * 0.2, cy + size * 0.1);
  ctx.quadraticCurveTo(cx, cy + size * 0.15, cx - size * 0.2, cy + size * 0.1);
  ctx.fill();
  
  // Decorative pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.1, cy + size * 0.18);
  ctx.lineTo(cx, cy + size * 0.22);
  ctx.lineTo(cx + size * 0.1, cy + size * 0.18);
  ctx.stroke();
}

// Draw anime horns
function drawHorns(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  const hornColor = '#4B0082';
  ctx.fillStyle = hornColor;
  
  // Left horn
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.18, cy - size * 0.35);
  ctx.lineTo(cx - size * 0.28, cy - size * 0.55);
  ctx.lineTo(cx - size * 0.12, cy - size * 0.42);
  ctx.closePath();
  ctx.fill();
  
  // Right horn
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.18, cy - size * 0.35);
  ctx.lineTo(cx + size * 0.28, cy - size * 0.55);
  ctx.lineTo(cx + size * 0.12, cy - size * 0.42);
  ctx.closePath();
  ctx.fill();
}

// Draw tail
function drawTail(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  ctx.fillStyle = color;
  
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.22, cy + size * 0.3);
  ctx.quadraticCurveTo(cx + size * 0.45, cy + size * 0.4, cx + size * 0.4, cy + size * 0.2);
  ctx.quadraticCurveTo(cx + size * 0.35, cy + size * 0.35, cx + size * 0.22, cy + size * 0.32);
  ctx.fill();
}

// Draw anime expression
function drawExpression(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, expression: string): void {
  const eyeY = cy - size * 0.12;
  const eyeSpacing = size * 0.1;
  const eyeSize = size * 0.05;
  
  // Eyes (anime style - large, expressive)
  ctx.fillStyle = '#FFFFFF';
  
  // Left eye
  ctx.beginPath();
  ctx.ellipse(cx - eyeSpacing, eyeY, eyeSize * 1.5, eyeSize * 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Right eye
  ctx.beginPath();
  ctx.ellipse(cx + eyeSpacing, eyeY, eyeSize * 1.5, eyeSize * 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(cx - eyeSpacing + 1, eyeY + 2, eyeSize * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeSpacing + 1, eyeY + 2, eyeSize * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx - eyeSpacing - 2, eyeY - 3, eyeSize * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + eyeSpacing - 2, eyeY - 3, eyeSize * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Blush
  ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
  ctx.beginPath();
  ctx.ellipse(cx - size * 0.15, cy + size * 0.02, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + size * 0.15, cy + size * 0.02, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth based on expression
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  
  if (expression === 'happy') {
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.08, size * 0.06, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (expression === 'cool') {
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.08, cy + size * 0.08);
    ctx.lineTo(cx + size * 0.08, cy + size * 0.06);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.06, size * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
  }
}

// Draw rarity badge
function drawRarityBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  ctx.fillStyle = color;
  
  // Badge circle
  ctx.beginPath();
  ctx.arc(cx + size * 0.28, cy - size * 0.3, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  
  // Badge border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Badge text placeholder (initials)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `${size * 0.05}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

// Create Phaser texture
export function createPhaserTexture(
  scene: Phaser.Scene,
  key: string,
  type: BuddyType,
  rarity: RarityType,
  size: number = 128
): void {
  const canvas = createCharacterSprite(type, rarity, size);
  const texture = scene.textures.createCanvas(key, size, size);
  if (texture) {
    texture.context.drawImage(canvas, 0, 0);
    texture.refresh();
  }
}

// Generate all character textures
export function generateAllCharacters(scene: Phaser.Scene): void {
  const types: BuddyType[] = ['slime', 'fairy', 'angel', 'demon', 'shadow', 'crystal', 'nature', 'fire', 'golden'];
  const rarities: RarityType[] = ['common', 'rare', 'epic', 'legendary'];
  
  types.forEach(type => {
    rarities.forEach(rarity => {
      createPhaserTexture(scene, `char_${type}_${rarity}`, type, rarity);
    });
  });
}

// Get character name
export function getCharacterName(type: BuddyType): string {
  return CHARACTER_CONFIGS[type]?.name || type;
}

// Get all types
export function getAllTypes(): BuddyType[] {
  return Object.keys(CHARACTER_CONFIGS) as BuddyType[];
}

// Generate random name
const NAME_PREFIXES = ['Bubbles', 'Sparkle', 'Glimmer', 'Shimmer', 'Twinkle', 'Glow', 'Moon', 'Star', 'Nova', 'Luna', 'Riley', 'Sage', 'Finn', 'Aria', 'Zephyr'];
const NAME_SUFFIXES = ['kin', 'po', 'puff', 'star', 'beam', 'dew', 'mist', 'spark', 'glow', 'wing'];

export function generateName(): string {
  const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
  const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
  return `${prefix}${suffix}`;
}