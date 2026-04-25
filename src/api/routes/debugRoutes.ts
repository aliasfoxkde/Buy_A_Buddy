// ==========================================
// DEBUG ROUTES - Development endpoints
// ==========================================

import { Router, Request, Response } from 'express';
import { successResponse } from '../types';
import { GameStateService } from '../../services/GameStateService';

const router = Router();

// Get debug report
router.get('/report', (req: Request, res: Response) => {
  const stateService = GameStateService.getInstance();
  const state = stateService.getState();
  
  const report = {
    timestamp: Date.now(),
    player: {
      name: state.player.name,
      level: state.player.level,
      coins: Math.floor(state.player.coins),
    },
    game: {
      buddiesCount: state.buddies.length,
      workingCount: state.buddies.filter(b => b.isWorking).length,
      plotsOccupied: state.plots.filter(p => p.buddyId).length,
      totalPlots: state.plots.length,
    },
    performance: {
      fps: 60, // Would be populated by actual game
      frameTime: 16.67,
      entities: state.buddies.length,
    },
    memory: {
      used: 0,
      total: 0,
    },
    statistics: state.statistics,
  };
  
  res.json(successResponse(report));
});

// Get performance metrics
router.get('/metrics', (req: Request, res: Response) => {
  const metrics = {
    timestamp: Date.now(),
    fps: 60,
    frameTime: 16.67,
    minFrameTime: 14.5,
    maxFrameTime: 20.3,
    entities: GameStateService.getInstance().getState().buddies.length,
    drawCalls: 0,
  };
  
  res.json(successResponse(metrics));
});

// Trigger debug action (only in development)
router.post('/action', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({
      success: false,
      error: 'Debug actions disabled in production',
    });
    return;
  }
  
  const { action, value } = req.body;
  const stateService = GameStateService.getInstance();
  const state = stateService.getState();
  
  switch (action) {
    case 'addCoins':
      state.player.coins += value || 1000;
      break;
    case 'setLevel':
      state.player.level = value || 1;
      break;
    case 'spawnBuddy':
      stateService.processAction({ type: 'SPAWN_BUDDY', forcedRarity: value });
      break;
    case 'resetGame':
      // Reset would go here
      break;
    default:
      res.status(400).json({
        success: false,
        error: 'Unknown debug action',
      });
      return;
  }
  
  stateService.setState(state);
  
  res.json(successResponse({ action, value, applied: true }));
});

// Get validation report
router.get('/validate', (req: Request, res: Response) => {
  const stateService = GameStateService.getInstance();
  const state = stateService.getState();
  
  const issues: { severity: string; message: string; field?: string }[] = [];
  
  // Check for issues
  if (state.player.coins < 0) {
    issues.push({ severity: 'critical', message: 'Negative coins', field: 'player.coins' });
  }
  
  if (state.player.level < 1) {
    issues.push({ severity: 'critical', message: 'Invalid level', field: 'player.level' });
  }
  
  // Check plots
  for (const plot of state.plots) {
    if (plot.multiplier <= 0) {
      issues.push({ severity: 'warning', message: 'Invalid multiplier', field: `plot.${plot.id}` });
    }
    if (plot.buddyId) {
      const buddy = state.buddies.find(b => b.id === plot.buddyId);
      if (!buddy) {
        issues.push({ severity: 'critical', message: 'Orphaned buddy reference', field: `plot.${plot.id}` });
      }
    }
  }
  
  res.json(successResponse({
    valid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    summary: {
      critical: issues.filter(i => i.severity === 'critical').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
    },
  }));
});

export default router;