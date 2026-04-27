// ==========================================
// GAME CONSTANTS - Configuration & Balance
// ==========================================

// ==========================================
// DISPLAY
// ==========================================

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const TILE_SIZE = 32;

// Map dimensions
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 30;
export const WORLD_WIDTH = MAP_WIDTH * TILE_SIZE;
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE;

// ==========================================
// COLORS (From reference art style)
// ==========================================

export const COLORS = {
  // Backgrounds
  background: '#0d0d1a',
  surface: '#1a0a2e',
  surfaceLight: '#2d1b4e',
  
  // Primary palette
  primary: '#a855f7',      // Purple
  secondary: '#ec4899',    // Pink
  accent: '#06b6d4',        // Cyan
  gold: '#fbbf24',         // Gold/coins
  
  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  
  // Text
  text: '#ffffff',
  textSecondary: '#a78bfa',
  textDim: '#6b7280',
  
  // Rarity (matching reference images)
  common: '#87CEEB',        // Sky blue
  rare: '#9370DB',          // Medium purple
  epic: '#FF69B4',          // Hot pink
  legendary: '#FFD700',     // Gold
  
  // UI elements
  buttonPrimary: '#6B21A8',
  buttonHover: '#a855f7',
  inputBg: '#3d2b5e',
  border: '#4d3b6e',
} as const;

// ==========================================
// RARITY SYSTEM
// ==========================================

export const RARITY = {
  common: {
    chance: 60,
    income: 1,
    color: 0x87CEEB,
    name: 'Common',
    emoji: '💎',
    statsBonus: 0,
  },
  rare: {
    chance: 25,
    income: 2,
    color: 0x9370DB,
    name: 'Rare',
    emoji: '💠',
    statsBonus: 3,
  },
  epic: {
    chance: 12,
    income: 4,
    color: 0xFF69B4,
    name: 'Epic',
    emoji: '💜',
    statsBonus: 6,
  },
  legendary: {
    chance: 3,
    income: 8,
    color: 0xFFD700,
    name: 'Legendary',
    emoji: '🌟',
    statsBonus: 10,
  },
} as const;

export type RarityType = keyof typeof RARITY;

// ==========================================
// BUDDY NAMES
// ==========================================

export const BUDDY_NAMES: Record<RarityType, string[]> = {
  common: [
    'Pip', 'Dot', 'Zap', 'Gloop', 'Nib', 'Tink', 'Mop', 'Flo', 
    'Blip', 'Squish', 'Bubbles', 'Sprout', 'Flick', 'Pop', 'Dew'
  ],
  rare: [
    'Sparkle', 'Frosty', 'Twirl', 'Glim', 'Shimmer', 'Breeze', 
    'Nova', 'Glint', 'Fluff', 'Puff', 'Zephyr', 'Misty', 'Crystal'
  ],
  epic: [
    'Cosmic', 'Pixel', 'Prism', 'Neon', 'Vortex', 'Pulse', 
    'Flux', 'Echo', 'Blaze', 'Spark', 'Radiant', 'Tempest', 'Storm'
  ],
  legendary: [
    'Omni', 'Transcend', 'Infinity', 'Apex', 'Prime', 'Ultra', 
    'Mega', 'Hyper', 'Omega', 'Alpha', 'Eternal', 'Cosmos', 'Titan'
  ],
};

// ==========================================
// COST FORMULAS
// ==========================================

export function getSpawnCost(ownedCount: number): number {
  return Math.floor(10 * Math.pow(1.15, ownedCount));
}

export function getBuddyUpgradeCost(level: number): number {
  return Math.floor(5 * Math.pow(1.5, level - 1));
}

export function getPlotUpgradeCost(level: number): number {
  return Math.floor(25 * Math.pow(1.4, level - 1));
}

export function getBreedingCost(): number {
  return 500;
}

export function getQuestCost(): number {
  return 50;
}

// ==========================================
// XP & LEVELING
// ==========================================

export function getBuddyXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getPlayerXPForLevel(level: number): number {
  // Faster early game curve
  if (level <= 5) {
    return Math.floor(75 * Math.pow(1.4, level - 1));
  }
  return Math.floor(300 * Math.pow(1.3, level - 5));
}

export function getBuddyMaxLevel(rarity: RarityType): number {
  return rarity === 'legendary' ? 100 : 50;
}

// ==========================================
// COMBAT
// ==========================================

export const BATTLE_CONFIG = {
  maxTeamSize: 3,
  baseDamage: 10,
  critChance: 0.1,
  critMultiplier: 1.5,
  defendDamageReduction: 0.5,
  energyPerTurn: 3,
  specialAbilityCost: 5,
  fleeChanceBase: 0.3,
  fleeChancePerLevel: 0.02,
  buddyAssistChance: 0.3,
  buddyAssistDamageBase: 8,
  buddyAssistDamageVariance: 5,
} as const;

// ==========================================
// INCOME & ECONOMY
// ==========================================

export const IDLE_CONFIG = {
  tickInterval: 100, // ms
  offlineEfficiency: 0.5,
  maxOfflineHours: 24,
  plotMaxLevel: 20,
  buddyMaxLevel: 50,
} as const;

// ==========================================
// REGIONS
// ==========================================

export const REGIONS = {
  'starfall-plains': {
    name: 'Starfall Plains',
    description: 'A serene grassland under a endless night sky',
    theme: {
      background: '#0d0d1a',
      ground: '#1a2a1a',
      accent: '#87CEEB',
    },
    availableQuests: ['tutorial-1', 'slime-hunt', 'coin-rush'],
    enemyTypes: ['slime', 'goblin'],
    unlockCondition: null,
  },
  'crystal-caverns': {
    name: 'Crystal Caverns',
    description: 'An underground network of glowing crystals',
    theme: {
      background: '#0a0a1a',
      ground: '#2a1a2a',
      accent: '#9370DB',
    },
    availableQuests: ['crystal-quest', 'skeleton-fight'],
    enemyTypes: ['skeleton', 'crystal-golem'],
    unlockCondition: { type: 'level', value: 5 },
  },
  'nebula-forest': {
    name: 'Nebula Forest',
    description: 'A mystical forest where stars grow on trees',
    theme: {
      background: '#0d0a1a',
      ground: '#1a2a1a',
      accent: '#FF69B4',
    },
    availableQuests: ['elemental-battle', 'rare-hunt'],
    enemyTypes: ['sprite', 'elemental'],
    unlockCondition: { type: 'level', value: 10 },
  },
  'void-sanctum': {
    name: 'Void Sanctum',
    description: 'The realm of the ancient ones',
    theme: {
      background: '#05050a',
      ground: '#1a0a2a',
      accent: '#FFD700',
    },
    availableQuests: ['boss-battle', 'final-challenge'],
    enemyTypes: ['void-beast', 'shadow-lord'],
    unlockCondition: { type: 'level', value: 20 },
  },
} as const;

// ==========================================
// UI CONSTANTS
// ==========================================

export const UI = {
  buttonHeight: 48,
  buttonRadius: 12,
  cardRadius: 16,
  padding: 16,
  spacing: 12,
  
  // Animation durations (ms)
  fadeIn: 200,
  fadeOut: 150,
  slideIn: 300,
  bounce: 400,
  
  // Font sizes
  fontXs: '12px',
  fontSm: '14px',
  fontMd: '16px',
  fontLg: '20px',
  fontXl: '24px',
  font2xl: '32px',
  font3xl: '42px',
} as const;

// ==========================================
// AUDIO
// ==========================================

export const AUDIO = {
  musicVolumeDefault: 0.7,
  sfxVolumeDefault: 0.8,
  fadeDuration: 500,
} as const;

// ==========================================
// SAVE / PERSISTENCE
// ==========================================

export const SAVE_CONFIG = {
  autoSaveInterval: 5000,
  maxSaves: 3,
  saveKey: 'buy-a-buddy-save',
  exportVersion: 1,
} as const;

// ==========================================
// MOBILE / TOUCH
// ==========================================

export const TOUCH = {
  joystickRadius: 40,
  joystickKnobRadius: 25,
  doubleTapThreshold: 300,
  longPressThreshold: 500,
  swipeThreshold: 50,
} as const;

// ==========================================
// PERFORMANCE
// ==========================================

export const PERFORMANCE = {
  maxParticles: 100,
  maxSprites: 200,
  targetFPS: 60,
  physicsIterations: 10,
  spritePoolSize: 50,
  updateThrottle: 16, // ms (60fps)
} as const;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function rollRarity(): RarityType {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, config] of Object.entries(RARITY)) {
    cumulative += config.chance;
    if (roll < cumulative) {
      return rarity as RarityType;
    }
  }
  
  return 'common';
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return Math.floor(num).toString();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}