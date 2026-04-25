// ==========================================
// GAME ENGINE - Core game logic
// ==========================================

import { GameState, createInitialState } from './types';
import { calculateIncomePerSecond, calculateOfflineEarnings, getSpawnLuckBonus } from '../systems/economy';
import { spawnBuddy, getSpawnCost, getBuddyUpgradeCost, getPlotUpgradeCost } from '../systems/spawner';
import { loadGame, SaveManager } from '../systems/saveSystem';

// Game state singleton
let gameState: GameState;
let saveManager: SaveManager | null = null;
let gameLoopInterval: number | null = null;

// Event listeners for UI updates
type Listener = (state: GameState) => void;
const listeners: Set<Listener> = new Set();

export function addStateListener(listener: Listener): void {
  listeners.add(listener);
}

export function removeStateListener(listener: Listener): void {
  listeners.delete(listener);
}

function notifyListeners(): void {
  for (const listener of listeners) {
    listener(gameState);
  }
}

// Initialize game
export function initGame(): GameState {
  const saved = loadGame();
  
  if (saved) {
    // Calculate offline progress
    const now = Date.now();
    const timeAway = now - saved.lastUpdate;
    
    if (timeAway > 5000) { // More than 5 seconds away
      const offlineEarnings = calculateOfflineEarnings(saved, timeAway);
      saved.currency += offlineEarnings;
      saved.stats.totalEarned += offlineEarnings;
    }
    
    saved.lastUpdate = now;
    gameState = saved;
  } else {
    gameState = createInitialState();
  }
  
  // Start save manager
  saveManager = new SaveManager(() => gameState, 5000);
  saveManager.start();
  
  // Start game loop
  startGameLoop();
  
  return gameState;
}

// Start income generation loop
function startGameLoop(): void {
  if (gameLoopInterval) return;
  
  gameLoopInterval = window.setInterval(() => {
    const income = calculateIncomePerSecond(gameState) / 10; // 100ms tick
    if (income > 0) {
      gameState.currency += income;
      gameState.stats.sessionEarned += income;
      gameState.stats.totalEarned += income;
      gameState.moneyEarned += income;
      notifyListeners();
    }
  }, 100);
}

// Stop game loop
function stopGameLoop(): void {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
}

// Get current state
export function getState(): GameState {
  return gameState;
}

// Buy a new buddy from spawner
export function buyBuddy(): boolean {
  const ownedCount = gameState.buddies.length;
  const cost = getSpawnCost(ownedCount);
  
  if (gameState.currency < cost) return false;
  
  const luckBonus = getSpawnLuckBonus(gameState);
  const newBuddy = spawnBuddy(luckBonus);
  
  gameState.currency -= cost;
  gameState.buddies.push(newBuddy);
  gameState.buddiesBought++;
  
  notifyListeners();
  return true;
}

// Assign buddy to plot
export function assignBuddy(buddyId: string, plotId: string): boolean {
  const buddy = gameState.buddies.find(b => b.id === buddyId);
  const plot = gameState.plots.find(p => p.id === plotId);
  
  if (!buddy || !plot) return false;
  
  // Unassign from previous plot if any
  if (buddy.assignedPlotId) {
    const prevPlot = gameState.plots.find(p => p.id === buddy.assignedPlotId);
    if (prevPlot) prevPlot.assignedBuddyId = null;
  }
  
  // Unassign current plot occupant if any
  if (plot.assignedBuddyId) {
    const prevBuddy = gameState.buddies.find(b => b.id === plot.assignedBuddyId);
    if (prevBuddy) prevBuddy.assignedPlotId = null;
  }
  
  // Assign
  buddy.assignedPlotId = plotId;
  plot.assignedBuddyId = buddyId;
  
  notifyListeners();
  return true;
}

// Unassign buddy from plot
export function unassignBuddy(buddyId: string): boolean {
  const buddy = gameState.buddies.find(b => b.id === buddyId);
  if (!buddy || !buddy.assignedPlotId) return false;
  
  const plot = gameState.plots.find(p => p.id === buddy.assignedPlotId);
  if (plot) plot.assignedBuddyId = null;
  
  buddy.assignedPlotId = null;
  
  notifyListeners();
  return true;
}

// Upgrade buddy level
export function upgradeBuddy(buddyId: string): boolean {
  const buddy = gameState.buddies.find(b => b.id === buddyId);
  if (!buddy) return false;
  
  const cost = getBuddyUpgradeCost(buddy);
  if (gameState.currency < cost) return false;
  
  gameState.currency -= cost;
  buddy.level++;
  
  notifyListeners();
  return true;
}

// Upgrade plot
export function upgradePlot(plotId: string): boolean {
  const plot = gameState.plots.find(p => p.id === plotId);
  if (!plot) return false;
  
  const cost = getPlotUpgradeCost(plot);
  if (gameState.currency < cost) return false;
  
  gameState.currency -= cost;
  plot.level++;
  plot.multiplier = 1 + (plot.level - 1) * 0.5;
  
  notifyListeners();
  return true;
}

// Purchase global upgrade
export function purchaseUpgrade(upgradeId: string): boolean {
  const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
  if (!upgrade) return false;
  
  if (upgrade.currentLevel >= upgrade.maxLevel) return false;
  
  const cost = upgrade.cost * upgrade.currentLevel;
  if (gameState.currency < cost) return false;
  
  gameState.currency -= cost;
  upgrade.currentLevel++;
  
  notifyListeners();
  return true;
}

// Reset game
export function resetGame(): void {
  if (saveManager) saveManager.saveNow();
  stopGameLoop();
  gameState = createInitialState();
  startGameLoop();
  notifyListeners();
}

// Clean up
export function cleanup(): void {
  if (saveManager) {
    saveManager.stop();
    saveManager.saveNow();
  }
  stopGameLoop();
  listeners.clear();
}