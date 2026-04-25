// ==========================================
// GAME TYPES - Core type definitions
// ==========================================

import { RARITY, type RarityType } from '../config/constants';

// ==========================================
// PLAYER
// ==========================================

export interface Player {
  id: string;
  name: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  createdAt: number;
  lastPlayed: number;
}

// ==========================================
// BUDDY
// ==========================================

export interface BuddyStats {
  attack: number;
  defense: number;
  speed: number;
  hp: number;
}

export interface Buddy {
  id: string;
  name: string;
  rarity: RarityType;
  level: number;
  xp: number;
  baseIncome: number;
  stats: BuddyStats;
  equipment: BuddyEquipment;
  traits: string[];
  positionX: number;
  positionY: number;
  isWorking: boolean;
  workPlotId: string | null;
  createdAt: number;
}

export interface BuddyEquipment {
  hat: string | null;
  accessory: string | null;
  badge: string | null;
}

// ==========================================
// WORK PLOT (Idle Mini-game)
// ==========================================

export interface WorkPlot {
  id: string;
  x: number;
  y: number;
  level: number;
  multiplier: number;
  buddyId: string | null;
  upgradesPurchased: number;
}

// ==========================================
// BATTLE
// ==========================================

export interface BattleAction {
  type: 'attack' | 'defend' | 'special' | 'item' | 'flee';
  sourceId: string;
  targetId?: string;
  damage?: number;
  healing?: number;
  abilityId?: string;
}

export interface BattleState {
  wave: number;
  playerTeam: string[]; // buddy IDs
  enemyTeam: Enemy[];
  turn: number;
  currentTurn: 'player' | 'enemy';
  isPlayerTurn: boolean;
  battleLog: BattleLogEntry[];
  isOver: boolean;
  winner: 'player' | 'enemy' | null;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  xpReward: number;
  coinReward: number;
  drops: ItemDrop[];
}

export interface BattleLogEntry {
  turn: number;
  actor: string;
  action: string;
  target?: string;
  damage?: number;
  healing?: number;
}

export interface ItemDrop {
  itemId: string;
  chance: number;
}

// ==========================================
// QUEST
// ==========================================

export type QuestType = 'kill' | 'collect' | 'escort' | 'explore' | 'challenge';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export interface QuestObjective {
  type: QuestType;
  target: string;
  current: number;
  required: number;
  description: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  region: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  timeLimit?: number; // ms
  isRepeatable: boolean;
  cooldownMs?: number;
  levelRequired: number;
}

export interface QuestProgress {
  questId: string;
  startedAt: number;
  completedObjectives: number;
  isComplete: boolean;
  claimed: boolean;
}

export interface QuestReward {
  xp: number;
  coins: number;
  items?: { itemId: string; quantity: number }[];
  buddyId?: string;
}

// ==========================================
// BREEDING
// ==========================================

export interface BreedingPair {
  parent1Id: string;
  parent2Id: string;
  offspringRarity: RarityType;
  offspringTraits: string[];
}

export interface BreedingResult {
  success: boolean;
  offspring?: Buddy;
  materials: { itemId: string; quantity: number }[];
  failureReason?: string;
}

// ==========================================
// INVENTORY
// ==========================================

export type ItemType = 'consumable' | 'equipment' | 'material' | 'quest' | 'currency';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: RarityType;
  stackable: boolean;
  quantity: number;
  maxStack: number;
  effects?: ItemEffect[];
  value: number;
}

export interface ItemEffect {
  type: 'heal' | 'buff' | 'debuff' | 'xp_boost' | 'energy';
  value: number;
  duration?: number;
}

// ==========================================
// REGION / WORLD
// ==========================================

export interface Region {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockRequirement: string;
  enemies: string[];
  availableQuests: string[];
  music: string;
  theme: RegionTheme;
}

export interface RegionTheme {
  backgroundColor: string;
  groundColor: string;
  accentColor: string;
  npcColor: number;
}

// ==========================================
// GAME STATE
// ==========================================

export interface GameState {
  version: number;
  lastSaved: number;
  player: Player;
  buddies: Buddy[];
  plots: WorkPlot[];
  inventory: Item[];
  quests: QuestProgress[];
  unlockedRegions: string[];
  achievements: string[];
  statistics: GameStatistics;
  settings: GameSettings;
}

export interface GameStatistics {
  totalPlayTime: number;
  battlesWon: number;
  battlesLost: number;
  buddiesSpawned: number;
  buddiesBred: number;
  questsCompleted: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  distanceTraveled: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  reducedMotion: boolean;
  autoSaveInterval: number;
}

// ==========================================
// API TYPES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  timestamp: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==========================================
// FACTORY FUNCTIONS
// ==========================================

export function createPlayer(name: string): Player {
  return {
    id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    level: 1,
    xp: 0,
    coins: 100,
    gems: 0,
    createdAt: Date.now(),
    lastPlayed: Date.now(),
  };
}

export function createBuddy(name: string, rarity: RarityType): Buddy {
  const rarityConfig = RARITY[rarity];
  
  return {
    id: `buddy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    rarity,
    level: 1,
    xp: 0,
    baseIncome: rarityConfig.income,
    stats: {
      attack: 5 + (rarity === 'legendary' ? 10 : rarity === 'epic' ? 6 : rarity === 'rare' ? 3 : 0),
      defense: 3 + (rarity === 'legendary' ? 8 : rarity === 'epic' ? 5 : rarity === 'rare' ? 2 : 0),
      speed: 10 + (rarity === 'legendary' ? 5 : rarity === 'epic' ? 3 : rarity === 'rare' ? 1 : 0),
      hp: 50 + (rarity === 'legendary' ? 30 : rarity === 'epic' ? 20 : rarity === 'rare' ? 10 : 0),
    },
    equipment: {
      hat: null,
      accessory: null,
      badge: null,
    },
    traits: [],
    positionX: 0,
    positionY: 0,
    isWorking: false,
    workPlotId: null,
    createdAt: Date.now(),
  };
}

export function createWorkPlot(id: string, x: number, y: number): WorkPlot {
  return {
    id,
    x,
    y,
    level: 1,
    multiplier: 1.0,
    buddyId: null,
    upgradesPurchased: 0,
  };
}

export function createInitialGameState(playerName: string): GameState {
  return {
    version: 1,
    lastSaved: Date.now(),
    player: createPlayer(playerName),
    buddies: [],
    plots: [
      createWorkPlot('plot-1', 80, 200),
      createWorkPlot('plot-2', 200, 200),
      createWorkPlot('plot-3', 320, 200),
      createWorkPlot('plot-4', 80, 350),
      createWorkPlot('plot-5', 200, 350),
      createWorkPlot('plot-6', 320, 350),
      createWorkPlot('plot-7', 80, 500),
      createWorkPlot('plot-8', 200, 500),
      createWorkPlot('plot-9', 320, 500),
    ],
    inventory: [],
    quests: [],
    unlockedRegions: ['starfall-plains'],
    achievements: [],
    statistics: {
      totalPlayTime: 0,
      battlesWon: 0,
      battlesLost: 0,
      buddiesSpawned: 0,
      buddiesBred: 0,
      questsCompleted: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      distanceTraveled: 0,
    },
    settings: {
      musicVolume: 0.7,
      sfxVolume: 0.8,
      vibrationEnabled: true,
      notificationsEnabled: true,
      reducedMotion: false,
      autoSaveInterval: 5000,
    },
  };
}