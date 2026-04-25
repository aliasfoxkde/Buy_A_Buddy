// ==========================================
// GAME ROUTES - Core game API
// ==========================================

import { Router, Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  ErrorCode,
  type GameStateDTO,
  type ActionResult,
  type ValidationResult,
  validateId,
  validateRarity,
  validatePositiveNumber,
} from '../types';
import { GameStateService } from '../../services/GameStateService';

const router = Router();

// Get current game state
router.get('/state', (req: Request, res: Response) => {
  const stateService = GameStateService.getInstance();
  const state = stateService.getState();
  
  // Transform to DTO
  const stateDTO: GameStateDTO = {
    version: state.version,
    player: {
      id: state.player.id,
      name: state.player.name,
      level: state.player.level,
      xp: state.player.xp,
      xpRequired: Math.floor(500 * Math.pow(1.3, state.player.level - 1)),
      coins: Math.floor(state.player.coins),
      gems: state.player.gems,
    },
    buddies: state.buddies.map(b => ({
      id: b.id,
      name: b.name,
      rarity: b.rarity,
      level: b.level,
      xp: b.xp,
      xpRequired: Math.floor(100 * Math.pow(1.5, b.level - 1)),
      baseIncome: b.baseIncome,
      stats: {
        attack: b.stats.attack,
        defense: b.stats.defense,
        speed: b.stats.speed,
        hp: b.stats.hp,
        maxHp: b.stats.hp + (b.level - 1) * 10,
      },
      isWorking: b.isWorking,
      workPlotId: b.workPlotId,
    })),
    plots: state.plots.map(p => ({
      id: p.id,
      level: p.level,
      multiplier: p.multiplier,
      buddyId: p.buddyId,
      buddy: p.buddyId ? state.buddies.find(b => b.id === p.buddyId) ? {
        id: state.buddies.find(b => b.id === p.buddyId)!.id,
        name: state.buddies.find(b => b.id === p.buddyId)!.name,
        rarity: state.buddies.find(b => b.id === p.buddyId)!.rarity,
        level: state.buddies.find(b => b.id === p.buddyId)!.level,
        xp: 0,
        xpRequired: 0,
        baseIncome: state.buddies.find(b => b.id === p.buddyId)!.baseIncome,
        stats: {
          attack: state.buddies.find(b => b.id === p.buddyId)!.stats.attack,
          defense: state.buddies.find(b => b.id === p.buddyId)!.stats.defense,
          speed: state.buddies.find(b => b.id === p.buddyId)!.stats.speed,
          hp: state.buddies.find(b => b.id === p.buddyId)!.stats.hp,
          maxHp: state.buddies.find(b => b.id === p.buddyId)!.stats.hp + (state.buddies.find(b => b.id === p.buddyId)!.level - 1) * 10,
        },
        isWorking: true,
        workPlotId: p.id,
      } : null : null,
    })),
    inventory: state.inventory.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      type: i.type,
      rarity: i.rarity,
      quantity: i.quantity,
      maxStack: i.maxStack,
      value: i.value,
    })),
    quests: state.quests.map(q => ({
      questId: q.questId,
      name: q.questId,
      description: '',
      type: 'kill',
      isComplete: q.isComplete,
      claimed: q.claimed,
      progress: q.completedObjectives,
    })),
    statistics: {
      totalPlayTime: state.statistics.totalPlayTime,
      battlesWon: state.statistics.battlesWon,
      battlesLost: state.statistics.battlesLost,
      buddiesSpawned: state.statistics.buddiesSpawned,
      buddiesBred: state.statistics.buddiesBred,
      questsCompleted: state.statistics.questsCompleted,
      totalCoinsEarned: state.statistics.totalCoinsEarned,
      totalCoinsSpent: state.statistics.totalCoinsSpent,
    },
    settings: state.settings,
  };
  
  res.json(successResponse(stateDTO, req.headers['x-request-id'] as string));
});

// Perform game action
router.post('/action', (req: Request, res: Response) => {
  const stateService = GameStateService.getInstance();
  const action = req.body;
  
  // Validate action
  const validation = validateAction(action);
  if (!validation.valid) {
    res.status(400).json(
      errorResponse(validation.errors[0].message, ErrorCode.VALIDATION_FAILED)
    );
    return;
  }
  
  // Process action
  const result = stateService.processAction(action);
  
  res.json({
    ...successResponse(result, req.headers['x-request-id'] as string),
    newState: result.success ? stateService.getState() : undefined,
  });
});

// Get spawner info
router.get('/spawner', (req: Request, res: Response) => {
  const stateService = GameStateService.getInstance();
  const state = stateService.getState();
  
  const ownedCount = state.buddies.length;
  const cost = Math.floor(10 * Math.pow(1.15, ownedCount));
  const nextCost = Math.floor(10 * Math.pow(1.15, ownedCount + 1));
  
  res.json(successResponse({
    ownedCount,
    cost,
    nextCost,
    probabilities: {
      common: 60,
      rare: 25,
      epic: 12,
      legendary: 3,
    },
  }));
});

// Get plots info
router.get('/plots', (req: Request, res: Response) => {
  const stateService = GameStateService.getInstance();
  const state = stateService.getState();
  
  res.json(successResponse(state.plots.map(p => ({
    id: p.id,
    level: p.level,
    multiplier: p.multiplier,
    buddyId: p.buddyId,
    upgradeCost: Math.floor(25 * Math.pow(1.4, p.level - 1)),
  }))));
});

// Get buddies info
router.get('/buddies', (req: Request, res: Response) => {
  const stateService = GameStateService.getInstance();
  const state = stateService.getState();
  
  const workingOnly = req.query.working === 'true';
  const unassignedOnly = req.query.unassigned === 'true';
  
  let buddies = state.buddies;
  
  if (workingOnly) {
    buddies = buddies.filter(b => b.isWorking);
  } else if (unassignedOnly) {
    buddies = buddies.filter(b => !b.isWorking);
  }
  
  res.json(successResponse(buddies));
});

// Validation helper
function validateAction(action: any): ValidationResult {
  const errors: any[] = [];
  
  if (!action || !action.type) {
    errors.push({ field: 'type', message: 'Action type is required', code: 'MISSING_FIELD' });
    return { valid: false, errors };
  }
  
  switch (action.type) {
    case 'SPAWN_BUDDY':
      if (action.forcedRarity && !validateRarity(action.forcedRarity)) {
        errors.push({ field: 'forcedRarity', message: 'Invalid rarity', code: 'INVALID_VALUE' });
      }
      break;
      
    case 'ASSIGN_BUDDY':
      if (!action.buddyId || !validateId(action.buddyId)) {
        errors.push({ field: 'buddyId', message: 'Invalid buddy ID', code: 'INVALID_ID' });
      }
      if (!action.plotId || !validateId(action.plotId)) {
        errors.push({ field: 'plotId', message: 'Invalid plot ID', code: 'INVALID_ID' });
      }
      break;
      
    case 'UNASSIGN_BUDDY':
      if (!action.buddyId || !validateId(action.buddyId)) {
        errors.push({ field: 'buddyId', message: 'Invalid buddy ID', code: 'INVALID_ID' });
      }
      break;
      
    case 'UPGRADE_BUDDY':
      if (!action.buddyId || !validateId(action.buddyId)) {
        errors.push({ field: 'buddyId', message: 'Invalid buddy ID', code: 'INVALID_ID' });
      }
      break;
      
    case 'UPGRADE_PLOT':
      if (!action.plotId || !validateId(action.plotId)) {
        errors.push({ field: 'plotId', message: 'Invalid plot ID', code: 'INVALID_ID' });
      }
      break;
      
    case 'BREED_BUDDIES':
      if (!action.parent1Id || !validateId(action.parent1Id)) {
        errors.push({ field: 'parent1Id', message: 'Invalid parent ID', code: 'INVALID_ID' });
      }
      if (!action.parent2Id || !validateId(action.parent2Id)) {
        errors.push({ field: 'parent2Id', message: 'Invalid parent ID', code: 'INVALID_ID' });
      }
      break;
  }
  
  return { valid: errors.length === 0, errors };
}

export default router;