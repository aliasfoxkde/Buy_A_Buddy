// ==========================================
// API TYPES - Type definitions for API
// ==========================================

import { GameState, Buddy, Plot, Upgrade } from '../game/types';

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Game state for API
export interface GameStateDto {
  currency: number;
  buddies: BuddyDto[];
  plots: PlotDto[];
  upgrades: UpgradeDto[];
  stats: StatsDto;
  lastUpdate: number;
  totalPlayTime: number;
  buddiesBought: number;
  moneyEarned: number;
}

export interface BuddyDto {
  id: string;
  name: string;
  emoji: string;
  rarity: string;
  baseIncome: number;
  level: number;
  assignedPlotId: string | null;
}

export interface PlotDto {
  id: string;
  level: number;
  multiplier: number;
  assignedBuddyId: string | null;
}

export interface UpgradeDto {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  currentLevel: number;
}

export interface StatsDto {
  totalEarned: number;
  sessionEarned: number;
  highScore: number;
}

// Request types
export interface BuyBuddyRequest {
  // Optional: force specific rarity (for testing/admin)
  forceRarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AssignBuddyRequest {
  buddyId: string;
  plotId: string;
}

export interface UpgradeRequest {
  targetType: 'buddy' | 'plot' | 'upgrade';
  targetId: string;
}

// Leaderboard entry
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  totalEarned: number;
  buddiesOwned: number;
  playTime: number;
  rank: number;
}

// Health check response
export interface HealthResponse {
  status: 'ok' | 'degraded';
  version: string;
  uptime: number;
  timestamp: number;
}

// API Error codes
export enum ApiErrorCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  BUDDY_NOT_FOUND = 'BUDDY_NOT_FOUND',
  PLOT_NOT_FOUND = 'PLOT_NOT_FOUND',
  UPGRADE_NOT_FOUND = 'UPGRADE_NOT_FOUND',
  PLOT_OCCUPIED = 'PLOT_OCCUPIED',
  BUDDY_ASSIGNED = 'BUDDY_ASSIGNED',
  UPGRADE_MAXED = 'UPGRADE_MAXED',
  SERVER_ERROR = 'SERVER_ERROR',
}

// Map game state to DTO
export function toGameStateDto(state: GameState): GameStateDto {
  return {
    currency: state.currency,
    buddies: state.buddies.map(toBuddyDto),
    plots: state.plots.map(toPlotDto),
    upgrades: state.upgrades.map(toUpgradeDto),
    stats: { ...state.stats },
    lastUpdate: state.lastUpdate,
    totalPlayTime: state.totalPlayTime,
    buddiesBought: state.buddiesBought,
    moneyEarned: state.moneyEarned,
  };
}

export function toBuddyDto(buddy: Buddy): BuddyDto {
  return {
    id: buddy.id,
    name: buddy.name,
    emoji: buddy.emoji,
    rarity: buddy.rarity,
    baseIncome: buddy.baseIncome,
    level: buddy.level,
    assignedPlotId: buddy.assignedPlotId,
  };
}

export function toPlotDto(plot: Plot): PlotDto {
  return {
    id: plot.id,
    level: plot.level,
    multiplier: plot.multiplier,
    assignedBuddyId: plot.assignedBuddyId,
  };
}

export function toUpgradeDto(upgrade: Upgrade): UpgradeDto {
  return {
    id: upgrade.id,
    name: upgrade.name,
    description: upgrade.description,
    cost: upgrade.cost,
    maxLevel: upgrade.maxLevel,
    currentLevel: upgrade.currentLevel,
  };
}