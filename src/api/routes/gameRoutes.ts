// ==========================================
// GAME ROUTES - Core game API endpoints
// ==========================================

import { Router, Request, Response } from 'express';
import { GameState } from '../game/types';
import { getSpawnCost, getBuddyUpgradeCost, getPlotUpgradeCost, createBuddy } from '../systems/spawner';
import { calculateIncomePerSecond } from '../systems/economy';
import { ApiResponse, GameStateDto, toGameStateDto, ApiErrorCode } from './types';

const router = Router();

// In-memory game state (could be replaced with database)
let gameState: GameState | null = null;

// Initialize game state
export function initGameState(state: GameState): void {
  gameState = state;
}

// Get current game state
router.get('/state', (_req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  return res.json({
    success: true,
    data: toGameStateDto(gameState),
    timestamp: Date.now(),
  } as ApiResponse<GameStateDto>);
});

// Get current income rate
router.get('/income', (_req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const income = calculateIncomePerSecond(gameState);
  
  return res.json({
    success: true,
    data: { incomePerSecond: income },
    timestamp: Date.now(),
  } as ApiResponse<{ incomePerSecond: number }>);
});

// Get spawner info
router.get('/spawner', (_req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const ownedCount = gameState.buddies.length;
  const cost = getSpawnCost(ownedCount);
  
  return res.json({
    success: true,
    data: {
      ownedCount,
      spawnCost: cost,
      spawnCostNext: getSpawnCost(ownedCount + 1),
    },
    timestamp: Date.now(),
  } as ApiResponse<{
    ownedCount: number;
    spawnCost: number;
    spawnCostNext: number;
  }>);
});

// Buy a buddy
router.post('/buddy/buy', (req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const ownedCount = gameState.buddies.length;
  const cost = getSpawnCost(ownedCount);
  
  if (gameState.currency < cost) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient funds',
      errorCode: ApiErrorCode.INSUFFICIENT_FUNDS,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  // Create new buddy (respects forceRarity for testing)
  const forceRarity = req.body.forceRarity as string | undefined;
  const newBuddy = forceRarity 
    ? createBuddy(forceRarity as any)
    : createBuddyForSpawner();
  
  gameState.currency -= cost;
  gameState.buddies.push(newBuddy);
  gameState.buddiesBought++;
  
  return res.status(201).json({
    success: true,
    data: newBuddy,
    timestamp: Date.now(),
  } as ApiResponse<any>);
});

// Assign buddy to plot
router.post('/buddy/assign', (req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const { buddyId, plotId } = req.body;
  
  if (!buddyId || !plotId) {
    return res.status(400).json({
      success: false,
      error: 'Missing buddyId or plotId',
      errorCode: ApiErrorCode.INVALID_REQUEST,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const buddy = gameState.buddies.find(b => b.id === buddyId);
  const plot = gameState.plots.find(p => p.id === plotId);
  
  if (!buddy) {
    return res.status(404).json({
      success: false,
      error: 'Buddy not found',
      errorCode: ApiErrorCode.BUDDY_NOT_FOUND,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  if (!plot) {
    return res.status(404).json({
      success: false,
      error: 'Plot not found',
      errorCode: ApiErrorCode.PLOT_NOT_FOUND,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  if (plot.assignedBuddyId) {
    return res.status(400).json({
      success: false,
      error: 'Plot is already occupied',
      errorCode: ApiErrorCode.PLOT_OCCUPIED,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  // Unassign from previous plot if any
  if (buddy.assignedPlotId) {
    const prevPlot = gameState.plots.find(p => p.id === buddy.assignedPlotId);
    if (prevPlot) prevPlot.assignedBuddyId = null;
  }
  
  // Assign to new plot
  buddy.assignedPlotId = plotId;
  plot.assignedBuddyId = buddyId;
  
  return res.json({
    success: true,
    data: { buddy, plot },
    timestamp: Date.now(),
  } as ApiResponse<any>);
});

// Unassign buddy
router.post('/buddy/unassign', (req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const { buddyId } = req.body;
  
  if (!buddyId) {
    return res.status(400).json({
      success: false,
      error: 'Missing buddyId',
      errorCode: ApiErrorCode.INVALID_REQUEST,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const buddy = gameState.buddies.find(b => b.id === buddyId);
  
  if (!buddy) {
    return res.status(404).json({
      success: false,
      error: 'Buddy not found',
      errorCode: ApiErrorCode.BUDDY_NOT_FOUND,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  if (!buddy.assignedPlotId) {
    return res.status(400).json({
      success: false,
      error: 'Buddy is not assigned to any plot',
      errorCode: ApiErrorCode.BUDDY_NOT_FOUND,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const plot = gameState.plots.find(p => p.id === buddy.assignedPlotId);
  if (plot) plot.assignedBuddyId = null;
  buddy.assignedPlotId = null;
  
  return res.json({
    success: true,
    data: { buddy },
    timestamp: Date.now(),
  } as ApiResponse<any>);
});

// Upgrade buddy
router.post('/buddy/upgrade', (req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const { buddyId } = req.body;
  
  if (!buddyId) {
    return res.status(400).json({
      success: false,
      error: 'Missing buddyId',
      errorCode: ApiErrorCode.INVALID_REQUEST,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const buddy = gameState.buddies.find(b => b.id === buddyId);
  
  if (!buddy) {
    return res.status(404).json({
      success: false,
      error: 'Buddy not found',
      errorCode: ApiErrorCode.BUDDY_NOT_FOUND,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const cost = getBuddyUpgradeCost(buddy);
  
  if (gameState.currency < cost) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient funds',
      errorCode: ApiErrorCode.INSUFFICIENT_FUNDS,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  gameState.currency -= cost;
  buddy.level++;
  
  return res.json({
    success: true,
    data: { buddy, cost },
    timestamp: Date.now(),
  } as ApiResponse<any>);
});

// Upgrade plot
router.post('/plot/upgrade', (req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const { plotId } = req.body;
  
  if (!plotId) {
    return res.status(400).json({
      success: false,
      error: 'Missing plotId',
      errorCode: ApiErrorCode.INVALID_REQUEST,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const plot = gameState.plots.find(p => p.id === plotId);
  
  if (!plot) {
    return res.status(404).json({
      success: false,
      error: 'Plot not found',
      errorCode: ApiErrorCode.PLOT_NOT_FOUND,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const cost = getPlotUpgradeCost(plot);
  
  if (gameState.currency < cost) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient funds',
      errorCode: ApiErrorCode.INSUFFICIENT_FUNDS,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  gameState.currency -= cost;
  plot.level++;
  plot.multiplier = 1 + (plot.level - 1) * 0.5;
  
  return res.json({
    success: true,
    data: { plot, cost },
    timestamp: Date.now(),
  } as ApiResponse<any>);
});

// Purchase global upgrade
router.post('/upgrade/purchase', (req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const { upgradeId } = req.body;
  
  if (!upgradeId) {
    return res.status(400).json({
      success: false,
      error: 'Missing upgradeId',
      errorCode: ApiErrorCode.INVALID_REQUEST,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
  
  if (!upgrade) {
    return res.status(404).json({
      success: false,
      error: 'Upgrade not found',
      errorCode: ApiErrorCode.UPGRADE_NOT_FOUND,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  if (upgrade.currentLevel >= upgrade.maxLevel) {
    return res.status(400).json({
      success: false,
      error: 'Upgrade is already maxed',
      errorCode: ApiErrorCode.UPGRADE_MAXED,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const cost = upgrade.cost * upgrade.currentLevel;
  
  if (gameState.currency < cost) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient funds',
      errorCode: ApiErrorCode.INSUFFICIENT_FUNDS,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  gameState.currency -= cost;
  upgrade.currentLevel++;
  
  return res.json({
    success: true,
    data: { upgrade, cost },
    timestamp: Date.now(),
  } as ApiResponse<any>);
});

// Add currency (admin/testing)
router.post('/admin/add-currency', (req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  const { amount } = req.body;
  
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid amount',
      errorCode: ApiErrorCode.INVALID_REQUEST,
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  gameState.currency += amount;
  
  return res.json({
    success: true,
    data: { newBalance: gameState.currency },
    timestamp: Date.now(),
  } as ApiResponse<any>);
});

// Reset game (admin)
router.post('/admin/reset', (_req: Request, res: Response) => {
  if (!gameState) {
    return res.status(503).json({
      success: false,
      error: 'Game not initialized',
      timestamp: Date.now(),
    } as ApiResponse<null>);
  }
  
  // Reset to initial state
  gameState.currency = 100;
  gameState.buddies = [];
  gameState.plots.forEach(p => {
    p.level = 1;
    p.multiplier = 1;
    p.assignedBuddyId = null;
  });
  gameState.upgrades.forEach(u => {
    u.currentLevel = u.id === 'plot-boost' ? 1 : 0;
  });
  gameState.stats = { totalEarned: 0, sessionEarned: 0, highScore: 0 };
  gameState.buddiesBought = 0;
  gameState.moneyEarned = 0;
  
  return res.json({
    success: true,
    data: toGameStateDto(gameState),
    timestamp: Date.now(),
  } as ApiResponse<GameStateDto>);
});

// Helper to create buddy for spawner (uses rarity system)
import { RARITY_CONFIG, BUDDY_NAMES, Rarity } from '../game/types';

function createBuddyForSpawner(): any {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let rarity: Rarity = 'common';
  
  for (const config of RARITY_CONFIG) {
    cumulative += config.chance;
    if (roll < cumulative) {
      rarity = config.name;
      break;
    }
  }
  
  const names = BUDDY_NAMES[rarity];
  const name = names[Math.floor(Math.random() * names.length)];
  const config = RARITY_CONFIG.find(r => r.name === rarity)!;
  
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    emoji: config.emoji,
    rarity,
    baseIncome: 1 * config.baseIncomeMultiplier,
    level: 1,
    assignedPlotId: null,
  };
}

export default router;