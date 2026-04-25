// ==========================================
// BUY A BUDDY - CORE GAME TYPES
// ==========================================

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Buddy {
  id: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  baseIncome: number;
  level: number;
  assignedPlotId: string | null;
}

export interface Plot {
  id: string;
  level: number;
  multiplier: number;
  assignedBuddyId: string | null;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
  effect: UpgradeEffect;
}

export interface UpgradeEffect {
  type: 'plot_multiplier' | 'buddy_income' | 'spawn_chance';
  value: number;
}

export interface GameState {
  currency: number;
  buddies: Buddy[];
  plots: Plot[];
  upgrades: Upgrade[];
  stats: GameStats;
  lastUpdate: number;
  totalPlayTime: number;
  buddiesBought: number;
  moneyEarned: number;
}

export interface GameStats {
  totalEarned: number;
  sessionEarned: number;
  highScore: number;
}

export interface RarityConfig {
  name: Rarity;
  color: string;
  emoji: string;
  chance: number;
  baseIncomeMultiplier: number;
}

export const RARITY_CONFIG: RarityConfig[] = [
  { name: 'common', color: '#A0A0A0', emoji: '💎', chance: 60, baseIncomeMultiplier: 1 },
  { name: 'rare', color: '#3B82F6', emoji: '💠', chance: 25, baseIncomeMultiplier: 2 },
  { name: 'epic', color: '#A855F7', emoji: '💜', chance: 12, baseIncomeMultiplier: 4 },
  { name: 'legendary', color: '#F59E0B', emoji: '🌟', chance: 3, baseIncomeMultiplier: 8 },
];

// Buddy name templates by rarity
export const BUDDY_NAMES: Record<Rarity, string[]> = {
  common: ['Blobby', 'Pip', 'Dot', 'Zap', 'Gloop', 'Nib', 'Tink', 'Mop'],
  rare: ['Sparkle', 'Frosty', 'Twirl', 'Glim', 'Shimmer', 'Breeze', 'Nova', 'Glint'],
  epic: ['Cosmic', 'Pixel', 'Prism', 'Neon', 'Vortex', 'Pulse', 'Flux', 'Echo'],
  legendary: ['Omni', 'Transcend', 'Infinity', 'Apex', 'Prime', 'Ultra', 'Mega', 'Hyper'],
};

// Starting state factory
export function createInitialState(): GameState {
  return {
    currency: 100, // Starting coins
    buddies: [],
    plots: [
      { id: 'plot-1', level: 1, multiplier: 1, assignedBuddyId: null },
      { id: 'plot-2', level: 1, multiplier: 1, assignedBuddyId: null },
      { id: 'plot-3', level: 1, multiplier: 1, assignedBuddyId: null },
    ],
    upgrades: [
      {
        id: 'plot-boost',
        name: 'Plot Power',
        description: 'Increase plot multipliers',
        cost: 50,
        maxLevel: 20,
        currentLevel: 1,
        effect: { type: 'plot_multiplier', value: 0.5 },
      },
      {
        id: 'spawn-luck',
        name: 'Lucky Spawn',
        description: 'Better buddy spawn chances',
        cost: 100,
        maxLevel: 10,
        currentLevel: 0,
        effect: { type: 'spawn_chance', value: 0.05 },
      },
    ],
    stats: {
      totalEarned: 0,
      sessionEarned: 0,
      highScore: 0,
    },
    lastUpdate: Date.now(),
    totalPlayTime: 0,
    buddiesBought: 0,
    moneyEarned: 0,
  };
}