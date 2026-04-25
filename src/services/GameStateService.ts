// ==========================================
// GAME STATE SERVICE - Central state management
// ==========================================

import { 
  type GameState, 
  type Buddy, 
  type WorkPlot,
  createInitialGameState 
} from '../game/types';
import { getSpawnCost, getBuddyUpgradeCost, getPlotUpgradeCost, rollRarity } from '../config/constants';

export class GameStateService {
  private static instance: GameStateService;
  private state: GameState;
  private listeners: Set<(state: GameState) => void> = new Set();

  private constructor() {
    this.state = createInitialGameState('Player');
  }

  static getInstance(): GameStateService {
    if (!GameStateService.instance) {
      GameStateService.instance = new GameStateService();
    }
    return GameStateService.instance;
  }

  getState(): GameState {
    return this.state;
  }

  setState(state: GameState): void {
    this.state = state;
    this.notify();
  }

  // Subscribe to state changes
  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Process game actions
  processAction(action: any): ActionResult {
    switch (action.type) {
      case 'ADD_BUDDY':
        return this.addBuddy(action.payload);
      case 'SPAWN_BUDDY':
        return this.spawnBuddy(action.forcedRarity);
      case 'ASSIGN_BUDDY':
        return this.assignBuddy(action.buddyId, action.plotId);
      case 'UNASSIGN_BUDDY':
        return this.unassignBuddy(action.buddyId);
      case 'UPGRADE_BUDDY':
        return this.upgradeBuddy(action.buddyId);
      case 'UPGRADE_PLOT':
        return this.upgradePlot(action.plotId);
      case 'BREED_BUDDIES':
        return this.breedBuddies(action.parent1Id, action.parent2Id);
      default:
        return { action, success: false, error: 'Unknown action type', errorCode: 'INVALID_REQUEST' as any };
    }
  }

  private spawnBuddy(forcedRarity?: string): ActionResult {
    const cost = getSpawnCost(this.state.buddies.length);
    if (this.state.player.coins < cost) {
      return { 
        action: { type: 'SPAWN_BUDDY' }, 
        success: false, 
        error: 'Insufficient funds',
        errorCode: 'INSUFFICIENT_FUNDS' as any 
      };
    }

    const rarity = forcedRarity ? forcedRarity as any : rollRarity();
    const names = this.getNamesForRarity(rarity);
    const name = names[Math.floor(Math.random() * names.length)];

    const buddy: Buddy = {
      id: `buddy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      rarity,
      level: 1,
      xp: 0,
      baseIncome: rarity === 'legendary' ? 8 : rarity === 'epic' ? 4 : rarity === 'rare' ? 2 : 1,
      stats: { attack: 10, defense: 5, speed: 10, hp: 50 },
      equipment: { hat: null, accessory: null, badge: null },
      traits: [],
      positionX: 0,
      positionY: 0,
      isWorking: false,
      workPlotId: null,
      createdAt: Date.now(),
    };

    this.state.player.coins -= cost;
    this.state.buddies.push(buddy);
    this.state.statistics.buddiesSpawned++;
    this.notify();

    return { action: { type: 'SPAWN_BUDDY' }, success: true, result: buddy };
  }

  private addBuddy(buddyData: any): ActionResult {
    // Add a pre-defined buddy (from character select or tutorial)
    const buddy: Buddy = {
      id: buddyData.id || `buddy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: buddyData.name,
      rarity: buddyData.rarity || 'common',
      level: buddyData.level || 1,
      xp: buddyData.xp || 0,
      baseIncome: buddyData.baseIncome || 1,
      stats: buddyData.stats || { attack: 10, defense: 5, speed: 10, hp: 50 },
      equipment: { hat: null, accessory: null, badge: null },
      traits: buddyData.traits || [],
      positionX: 0,
      positionY: 0,
      isWorking: false,
      workPlotId: null,
      createdAt: Date.now(),
    };

    this.state.buddies.push(buddy);
    this.notify();

    return { action: { type: 'ADD_BUDDY' }, success: true, result: buddy };
  }

  private assignBuddy(buddyId: string, plotId: string): ActionResult {
    const buddy = this.state.buddies.find(b => b.id === buddyId);
    const plot = this.state.plots.find(p => p.id === plotId);

    if (!buddy) return { action: { type: 'ASSIGN_BUDDY' }, success: false, error: 'Buddy not found' };
    if (!plot) return { action: { type: 'ASSIGN_BUDDY' }, success: false, error: 'Plot not found' };
    if (plot.buddyId) return { action: { type: 'ASSIGN_BUDDY' }, success: false, error: 'Plot occupied' };

    // Unassign from previous plot
    if (buddy.workPlotId) {
      const prevPlot = this.state.plots.find(p => p.id === buddy.workPlotId);
      if (prevPlot) prevPlot.buddyId = null;
    }

    buddy.isWorking = true;
    buddy.workPlotId = plotId;
    plot.buddyId = buddyId;
    this.notify();

    return { action: { type: 'ASSIGN_BUDDY' }, success: true, result: { buddy, plot } };
  }

  private unassignBuddy(buddyId: string): ActionResult {
    const buddy = this.state.buddies.find(b => b.id === buddyId);
    if (!buddy) return { action: { type: 'UNASSIGN_BUDDY' }, success: false, error: 'Buddy not found' };

    if (buddy.workPlotId) {
      const plot = this.state.plots.find(p => p.id === buddy.workPlotId);
      if (plot) plot.buddyId = null;
    }

    buddy.isWorking = false;
    buddy.workPlotId = null;
    this.notify();

    return { action: { type: 'UNASSIGN_BUDDY' }, success: true, result: buddy };
  }

  private upgradeBuddy(buddyId: string): ActionResult {
    const buddy = this.state.buddies.find(b => b.id === buddyId);
    if (!buddy) return { action: { type: 'UPGRADE_BUDDY' }, success: false, error: 'Buddy not found' };

    const cost = getBuddyUpgradeCost(buddy.level);
    if (this.state.player.coins < cost) {
      return { action: { type: 'UPGRADE_BUDDY' }, success: false, error: 'Insufficient funds', errorCode: 'INSUFFICIENT_FUNDS' as any };
    }

    this.state.player.coins -= cost;
    buddy.level++;
    buddy.stats.attack += 2;
    buddy.stats.defense += 1;
    buddy.stats.hp += 10;
    this.notify();

    return { action: { type: 'UPGRADE_BUDDY' }, success: true, result: { buddy, cost } };
  }

  private upgradePlot(plotId: string): ActionResult {
    const plot = this.state.plots.find(p => p.id === plotId);
    if (!plot) return { action: { type: 'UPGRADE_PLOT' }, success: false, error: 'Plot not found' };

    const cost = getPlotUpgradeCost(plot.level);
    if (this.state.player.coins < cost) {
      return { action: { type: 'UPGRADE_PLOT' }, success: false, error: 'Insufficient funds', errorCode: 'INSUFFICIENT_FUNDS' as any };
    }

    this.state.player.coins -= cost;
    plot.level++;
    plot.multiplier = 1 + (plot.level - 1) * 0.5;
    this.notify();

    return { action: { type: 'UPGRADE_PLOT' }, success: true, result: { plot, cost } };
  }

  private breedBuddies(parent1Id: string, parent2Id: string): ActionResult {
    const parent1 = this.state.buddies.find(b => b.id === parent1Id);
    const parent2 = this.state.buddies.find(b => b.id === parent2Id);

    if (!parent1 || !parent2) return { action: { type: 'BREED_BUDDIES' }, success: false, error: 'Parent not found' };
    if (parent1.rarity !== parent2.rarity) return { action: { type: 'BREED_BUDDIES' }, success: false, error: 'Parents must be same rarity' };
    if (parent1.isWorking || parent2.isWorking) return { action: { type: 'BREED_BUDDIES' }, success: false, error: 'Parents must not be working' };

    const cost = 500;
    if (this.state.player.coins < cost) {
      return { action: { type: 'BREED_BUDDIES' }, success: false, error: 'Insufficient funds', errorCode: 'INSUFFICIENT_FUNDS' as any };
    }

    // Determine offspring rarity
    const roll = Math.random();
    let offspringRarity = parent1.rarity as any;
    if (roll < 0.2 && parent1.rarity === 'common') offspringRarity = 'rare';
    else if (roll < 0.3 && parent1.rarity === 'rare') offspringRarity = 'epic';
    else if (roll < 0.2 && parent1.rarity === 'epic') offspringRarity = 'legendary';

    const names = this.getNamesForRarity(offspringRarity);
    const name = 'Mini ' + names[Math.floor(Math.random() * names.length)];

    const offspring: Buddy = {
      id: `buddy-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      rarity: offspringRarity,
      level: 1,
      xp: 0,
      baseIncome: offspringRarity === 'legendary' ? 8 : offspringRarity === 'epic' ? 4 : offspringRarity === 'rare' ? 2 : 1,
      stats: { attack: 10, defense: 5, speed: 10, hp: 50 },
      equipment: { hat: null, accessory: null, badge: null },
      traits: [],
      positionX: 0,
      positionY: 0,
      isWorking: false,
      workPlotId: null,
      createdAt: Date.now(),
    };

    this.state.player.coins -= cost;
    this.state.buddies.push(offspring);
    this.state.statistics.buddiesBred++;
    this.notify();

    return { action: { type: 'BREED_BUDDIES' }, success: true, result: offspring };
  }

  private getNamesForRarity(rarity: string): string[] {
    const names: Record<string, string[]> = {
      common: ['Pip', 'Dot', 'Zap', 'Gloop', 'Nib', 'Tink', 'Mop', 'Flo'],
      rare: ['Sparkle', 'Frosty', 'Twirl', 'Glim', 'Shimmer', 'Breeze', 'Nova'],
      epic: ['Cosmic', 'Pixel', 'Prism', 'Neon', 'Vortex', 'Pulse', 'Flux'],
      legendary: ['Omni', 'Transcend', 'Infinity', 'Apex', 'Prime', 'Ultra'],
    };
    return names[rarity] || names.common;
  }

  // Calculate income per second
  getIncomePerSecond(): number {
    let total = 0;
    for (const plot of this.state.plots) {
      if (plot.buddyId) {
        const buddy = this.state.buddies.find(b => b.id === plot.buddyId);
        if (buddy) {
          total += buddy.baseIncome * buddy.level * plot.multiplier;
        }
      }
    }
    return total;
  }
}

export interface ActionResult {
  action: any;
  success: boolean;
  result?: any;
  error?: string;
  errorCode?: string;
}