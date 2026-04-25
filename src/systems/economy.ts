// ==========================================
// ECONOMY SYSTEM
// ==========================================

import { GameState, Buddy, Plot } from '../game/types';

// Calculate income per second from all assigned buddies
export function calculateIncomePerSecond(state: GameState): number {
  let totalIncome = 0;
  
  for (const buddy of state.buddies) {
    if (buddy.assignedPlotId) {
      const plot = state.plots.find(p => p.id === buddy.assignedPlotId);
      if (plot) {
        totalIncome += buddy.baseIncome * buddy.level * plot.multiplier;
      }
    }
  }
  
  return totalIncome;
}

// Calculate offline earnings
export function calculateOfflineEarnings(state: GameState, timeAwayMs: number): number {
  const incomePerSecond = calculateIncomePerSecond(state);
  const secondsAway = Math.min(timeAwayMs / 1000, 86400); // Cap at 24 hours
  return incomePerSecond * secondsAway * 0.5; // 50% efficiency for offline
}

// Calculate plot multiplier upgrade bonus
export function getPlotMultiplierBonus(state: GameState): number {
  const plotUpgrade = state.upgrades.find(u => u.id === 'plot-boost');
  if (plotUpgrade) {
    return 1 + (plotUpgrade.currentLevel - 1) * plotUpgrade.effect.value;
  }
  return 1;
}

// Calculate spawn luck bonus
export function getSpawnLuckBonus(state: GameState): number {
  const spawnUpgrade = state.upgrades.find(u => u.id === 'spawn-luck');
  if (spawnUpgrade) {
    return spawnUpgrade.currentLevel * spawnUpgrade.effect.value;
  }
  return 0;
}

// Format currency for display
export function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(2) + 'B';
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'K';
  }
  return Math.floor(amount).toString();
}

// Calculate buddy income contribution
export function getBuddyIncome(buddy: Buddy, plot: Plot | undefined): number {
  if (!plot) return 0;
  return buddy.baseIncome * buddy.level * plot.multiplier;
}