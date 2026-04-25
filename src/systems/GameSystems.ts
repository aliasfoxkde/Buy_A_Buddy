// ==========================================
// GAME SYSTEMS - Core business logic
// ==========================================

import {
  RARITY,
  TOUCH,
  PERFORMANCE,
  clamp,
  lerp,
  randomInRange,
  randomIntInRange,
  generateId,
  rollRarity,
  formatNumber,
  getSpawnCost,
  getBuddyUpgradeCost,
  getPlotUpgradeCost,
  getBuddyXPForLevel,
  getPlayerXPForLevel,
  type RarityType,
} from '../config/constants';

import {
  type GameState,
  type Player,
  type Buddy,
  type WorkPlot,
  type Quest,
  type QuestProgress,
  type Item,
  type BattleState,
  type Enemy,
  createInitialGameState,
  createBuddy,
  createWorkPlot,
} from '../game/types';

// ==========================================
// IDLE SYSTEM - Passive income generation
// ==========================================

export class IdleSystem {
  private gameState: GameState;
  private lastTick: number = 0;
  private tickInterval: number;
  private totalGenerated: number = 0;

  constructor(gameState: GameState, tickInterval: number = 100) {
    this.gameState = gameState;
    this.tickInterval = tickInterval;
  }

  /**
   * Calculate total income per second from all working buddies
   */
  calculateIncomePerSecond(): number {
    let total = 0;
    
    for (const plot of this.gameState.plots) {
      if (plot.buddyId) {
        const buddy = this.gameState.buddies.find(b => b.id === plot.buddyId);
        if (buddy) {
          total += buddy.baseIncome * buddy.level * plot.multiplier;
        }
      }
    }
    
    return total;
  }

  /**
   * Process a single tick of income generation
   */
  processTick(currentTime: number): number {
    const timeDelta = currentTime - this.lastTick;
    
    if (timeDelta < this.tickInterval) {
      return 0;
    }
    
    const incomePerSecond = this.calculateIncomePerSecond();
    const income = incomePerSecond * (timeDelta / 1000);
    
    this.gameState.player.coins += income;
    this.totalGenerated += income;
    this.lastTick = currentTime;
    
    return income;
  }

  /**
   * Calculate offline earnings (50% efficiency, max 24 hours)
   */
  calculateOfflineEarnings(timeAwayMs: number): number {
    const maxOfflineMs = 24 * 60 * 60 * 1000; // 24 hours in ms
    const cappedTime = Math.min(timeAwayMs, maxOfflineMs);
    const incomePerSecond = this.calculateIncomePerSecond();
    
    if (incomePerSecond === 0 || cappedTime <= 0) {
      return 0;
    }
    
    return incomePerSecond * (cappedTime / 1000) * 0.5; // 50% offline efficiency
  }

  /**
   * Get working buddy count
   */
  getWorkingBuddyCount(): number {
    return this.gameState.plots.filter(p => p.buddyId !== null).length;
  }

  /**
   * Get plot utilization percentage
   */
  getPlotUtilization(): number {
    const occupied = this.gameState.plots.filter(p => p.buddyId !== null).length;
    return (occupied / this.gameState.plots.length) * 100;
  }

  /**
   * Get total statistics
   */
  getStatistics(): IdleStatistics {
    return {
      incomePerSecond: this.calculateIncomePerSecond(),
      totalGenerated: this.totalGenerated,
      workingBuddies: this.getWorkingBuddyCount(),
      plotUtilization: this.getPlotUtilization(),
      averageBuddyLevel: this.getAverageBuddyLevel(),
    };
  }

  private getAverageBuddyLevel(): number {
    if (this.gameState.buddies.length === 0) return 0;
    const sum = this.gameState.buddies.reduce((acc, b) => acc + b.level, 0);
    return sum / this.gameState.buddies.length;
  }
}

export interface IdleStatistics {
  incomePerSecond: number;
  totalGenerated: number;
  workingBuddies: number;
  plotUtilization: number;
  averageBuddyLevel: number;
}

// ==========================================
// SPAWNER SYSTEM - Buddy gacha
// ==========================================

export class SpawnerSystem {
  private gameState: GameState;
  
  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Spawn a new buddy using gacha system
   */
  spawnBuddy(forcedRarity?: RarityType): SpawnResult {
    const ownedCount = this.gameState.buddies.length;
    const cost = getSpawnCost(ownedCount);
    
    // Validate cost
    if (this.gameState.player.coins < cost) {
      return {
        success: false,
        error: 'INSUFFICIENT_FUNDS',
        message: `Need ${formatNumber(cost)} coins, have ${formatNumber(this.gameState.player.coins)}`,
        cost,
      };
    }
    
    // Determine rarity
    const rarity = forcedRarity ?? rollRarity();
    
    // Get random name for rarity
    const names = forcedRarity 
      ? this.gameState.buddies.filter(b => b.rarity === forcedRarity).length > 0
        ? [...Array(10)].map((_, i) => `${forcedRarity}-${i}`)
        : ['TestBuddy']
      : ['Random'];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const buddy = createBuddy(name, rarity);
    
    // Deduct cost
    this.gameState.player.coins -= cost;
    
    // Add buddy
    this.gameState.buddies.push(buddy);
    this.gameState.statistics.buddiesSpawned++;
    
    return {
      success: true,
      buddy,
      cost,
      rarity,
    };
  }

  /**
   * Get spawn cost for next buddy
   */
  getNextSpawnCost(): number {
    return getSpawnCost(this.gameState.buddies.length);
  }

  /**
   * Get rarity probabilities with bonuses
   */
  getRarityProbabilities(spawnLuckBonus: number = 0): RarityProbabilities {
    const base = {
      common: RARITY.common.chance,
      rare: RARITY.rare.chance,
      epic: RARITY.epic.chance,
      legendary: RARITY.legendary.chance + spawnLuckBonus * 10,
    };
    
    // Normalize to 100%
    const total = base.common + base.rare + base.epic + base.legendary;
    
    return {
      common: (base.common / total) * 100,
      rare: (base.rare / total) * 100,
      epic: (base.epic / total) * 100,
      legendary: (base.legendary / total) * 100,
    };
  }
}

export interface SpawnResult {
  success: boolean;
  buddy?: Buddy;
  cost?: number;
  rarity?: RarityType;
  error?: string;
  message?: string;
}

export interface RarityProbabilities {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

// ==========================================
// BATTLE SYSTEM - Turn-based combat
// ==========================================

export class BattleSystem {
  private gameState: GameState;
  
  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Initialize a new battle
   */
  startBattle(enemyTypes: string[], wave: number = 1): BattleState {
    const playerTeam = this.gameState.buddies
      .filter(b => !b.isWorking)
      .slice(0, 3)
      .map(b => b.id);
    
    const enemies = this.generateEnemies(enemyTypes, wave);
    
    return {
      wave,
      playerTeam,
      enemyTeam: enemies,
      turn: 1,
      currentTurn: 'player',
      isPlayerTurn: true,
      battleLog: [],
      isOver: false,
      winner: null,
    };
  }

  /**
   * Process a battle action
   */
  processAction(
    state: BattleState,
    action: BattleAction
  ): BattleState {
    if (state.isOver) return state;
    
    const newLog = [...state.battleLog];
    let updatedState = { ...state };
    
    switch (action.type) {
      case 'attack':
        const damage = this.calculateDamage(action.sourceId, action.targetId, state);
        this.applyDamage(state, action.targetId!, damage);
        newLog.push({
          turn: state.turn,
          actor: action.sourceId,
          action: 'attacks',
          target: action.targetId,
          damage,
        });
        break;
        
      case 'defend':
        // Defend is handled in damage calculation
        newLog.push({
          turn: state.turn,
          actor: action.sourceId,
          action: 'defends',
        });
        break;
        
      case 'special':
        // Special ability damage
        newLog.push({
          turn: state.turn,
          actor: action.sourceId,
          action: 'uses special ability',
          target: action.targetId,
        });
        break;
    }
    
    // Check win/lose conditions
    const playerDefeated = updatedState.playerTeam.every(
      id => this.getBuddyById(state, id)?.stats.hp <= 0
    );
    const enemiesDefeated = updatedState.enemyTeam.every(e => e.hp <= 0);
    
    if (playerDefeated) {
      updatedState.isOver = true;
      updatedState.winner = 'enemy';
      this.gameState.statistics.battlesLost++;
    } else if (enemiesDefeated) {
      updatedState.isOver = true;
      updatedState.winner = 'player';
      this.gameState.statistics.battlesWon++;
    }
    
    return {
      ...updatedState,
      turn: updatedState.turn + 1,
      battleLog: newLog,
    };
  }

  /**
   * Calculate damage between combatants
   */
  calculateDamage(attackerId: string, defenderId: string, state: BattleState): number {
    const attacker = this.getBuddyById(state, attackerId) ?? 
      state.enemyTeam.find(e => e.id === attackerId);
    const defender = this.getBuddyById(state, defenderId) ?? 
      state.enemyTeam.find(e => e.id === defenderId);
    
    if (!attacker || !defender) return 0;
    
    const isCrit = Math.random() < 0.15;
    const baseDamage = (attacker as any).attack ?? 10;
    const defense = (defender as any).defense ?? 5;
    
    let damage = Math.max(1, baseDamage - defense * 0.5);
    
    if (isCrit) {
      damage *= 1.5;
    }
    
    return Math.floor(damage);
  }

  private generateEnemies(types: string[], wave: number): Enemy[] {
    return types.map((type, i) => ({
      id: `enemy-${wave}-${i}`,
      name: this.getEnemyName(type),
      level: wave,
      hp: 30 + wave * 10,
      maxHp: 30 + wave * 10,
      attack: 8 + wave * 2,
      defense: 5 + wave,
      speed: 8 + wave,
      xpReward: 20 * wave,
      coinReward: 10 * wave,
      drops: [],
    }));
  }

  private getEnemyName(type: string): string {
    const names: Record<string, string[]> = {
      slime: ['Blue Slime', 'Green Slime', 'Red Slime'],
      goblin: ['Goblin Scout', 'Goblin Warrior', 'Goblin Shaman'],
      skeleton: ['Skeleton Archer', 'Skeleton Knight', 'Skeleton Mage'],
      elemental: ['Fire Elemental', 'Water Elemental', 'Lightning Elemental'],
    };
    
    return names[type]?.[Math.floor(Math.random() * 3)] ?? 'Unknown Enemy';
  }

  private getBuddyById(state: BattleState, id: string): Buddy | undefined {
    return this.gameState.buddies.find(b => b.id === id);
  }

  private applyDamage(state: BattleState, targetId: string, damage: number): void {
    const enemyIndex = state.enemyTeam.findIndex(e => e.id === targetId);
    if (enemyIndex >= 0) {
      state.enemyTeam[enemyIndex].hp -= damage;
    }
  }
}

// ==========================================
// QUEST SYSTEM - Task management
// ==========================================

export class QuestSystem {
  private gameState: GameState;
  private availableQuests: Quest[] = [];
  
  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.initializeQuests();
  }

  /**
   * Initialize available quests
   */
  private initializeQuests(): void {
    this.availableQuests = [
      {
        id: 'tutorial-1',
        name: 'First Steps',
        description: 'Spawn your first buddy',
        type: 'kill',
        difficulty: 'easy',
        region: 'starfall-plains',
        objectives: [{
          type: 'collect',
          target: 'buddy',
          current: 0,
          required: 1,
          description: 'Spawn a buddy from the gacha',
        }],
        rewards: { xp: 100, coins: 50 },
        isRepeatable: false,
        levelRequired: 1,
      },
      {
        id: 'slime-hunt',
        name: 'Slime Hunt',
        description: 'Defeat 5 slimes',
        type: 'kill',
        difficulty: 'easy',
        region: 'starfall-plains',
        objectives: [{
          type: 'kill',
          target: 'slime',
          current: 0,
          required: 5,
          description: 'Defeat 5 slimes',
        }],
        rewards: { xp: 200, coins: 100 },
        isRepeatable: true,
        cooldownMs: 3600000,
        levelRequired: 1,
      },
    ];
  }

  /**
   * Get all available quests
   */
  getAvailableQuests(): Quest[] {
    return this.availableQuests.filter(q => 
      q.levelRequired <= this.gameState.player.level
    );
  }

  /**
   * Start a quest
   */
  startQuest(questId: string): QuestProgress | null {
    const quest = this.availableQuests.find(q => q.id === questId);
    if (!quest) return null;
    
    const progress: QuestProgress = {
      questId,
      startedAt: Date.now(),
      completedObjectives: 0,
      isComplete: false,
      claimed: false,
    };
    
    this.gameState.quests.push(progress);
    return progress;
  }

  /**
   * Update quest progress
   */
  updateQuestProgress(questId: string, objectiveType: string, amount: number = 1): boolean {
    const quest = this.availableQuests.find(q => q.id === questId);
    const progress = this.gameState.quests.find(p => p.questId === questId);
    
    if (!quest || !progress) return false;
    
    const objective = quest.objectives.find(o => o.type === objectiveType);
    if (!objective) return false;
    
    objective.current = Math.min(objective.current + amount, objective.required);
    
    // Check completion
    progress.completedObjectives = quest.objectives.filter(
      o => o.current >= o.required
    ).length;
    
    progress.isComplete = progress.completedObjectives === quest.objectives.length;
    
    return true;
  }

  /**
   * Claim quest rewards
   */
  claimRewards(questId: string): boolean {
    const quest = this.availableQuests.find(q => q.id === questId);
    const progress = this.gameState.quests.find(p => p.questId === questId);
    
    if (!quest || !progress || !progress.isComplete || progress.claimed) {
      return false;
    }
    
    // Apply rewards
    this.gameState.player.xp += quest.rewards.xp;
    this.gameState.player.coins += quest.rewards.coins;
    this.gameState.statistics.questsCompleted++;
    
    // Handle item rewards
    if (quest.rewards.items) {
      for (const itemReward of quest.rewards.items) {
        this.addItem(itemReward.itemId, itemReward.quantity);
      }
    }
    
    progress.claimed = true;
    
    // Check for level up
    this.checkPlayerLevelUp();
    
    return true;
  }

  private checkPlayerLevelUp(): void {
    const xpNeeded = getPlayerXPForLevel(this.gameState.player.level);
    
    while (this.gameState.player.xp >= xpNeeded) {
      this.gameState.player.xp -= xpNeeded;
      this.gameState.player.level++;
    }
  }

  private addItem(itemId: string, quantity: number): void {
    const existing = this.gameState.inventory.find(i => i.id === itemId);
    
    if (existing && existing.stackable) {
      existing.quantity = Math.min(existing.quantity + quantity, existing.maxStack);
    } else {
      this.gameState.inventory.push({
        id: itemId,
        name: itemId,
        description: 'Item',
        type: 'material',
        rarity: 'common',
        stackable: true,
        quantity,
        maxStack: 99,
        value: 10,
      });
    }
  }
}

// ==========================================
// BREEDING SYSTEM - Buddy combination
// ==========================================

export class BreedingSystem {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Attempt to breed two buddies
   */
  breed(parent1Id: string, parent2Id: string): BreedingResult {
    const parent1 = this.gameState.buddies.find(b => b.id === parent1Id);
    const parent2 = this.gameState.buddies.find(b => b.id === parent2Id);
    
    // Validate parents exist and aren't working
    if (!parent1 || !parent2) {
      return { success: false, materials: [], failureReason: 'Parent not found' };
    }
    
    if (parent1.isWorking || parent2.isWorking) {
      return { success: false, materials: [], failureReason: 'Parents must not be working' };
    }
    
    if (parent1.rarity !== parent2.rarity) {
      return { success: false, materials: [], failureReason: 'Parents must be same rarity' };
    }
    
    // Check cost
    const cost = 500;
    if (this.gameState.player.coins < cost) {
      return { success: false, materials: [], failureReason: 'Not enough coins' };
    }
    
    // Deduct cost
    this.gameState.player.coins -= cost;
    
    // Determine offspring rarity
    const offspringRarity = this.calculateOffspringRarity(parent1.rarity);
    
    // Generate offspring
    const offspring = this.createOffspring(parent1, parent2, offspringRarity);
    this.gameState.buddies.push(offspring);
    this.gameState.statistics.buddiesBred++;
    
    return {
      success: true,
      offspring,
      materials: [{ itemId: 'breeding-token', quantity: 1 }],
    };
  }

  private calculateOffspringRarity(parentRarity: RarityType): RarityType {
    const roll = Math.random();
    
    // Breeding success rates by rarity
    const rates: Record<RarityType, { same: number; upgrade: number }> = {
      common: { same: 0.8, upgrade: 0.2 },
      rare: { same: 0.6, upgrade: 0.3 },
      epic: { same: 0.5, upgrade: 0.3 },
      legendary: { same: 0.8, upgrade: 0.0 },
    };
    
    const config = rates[parentRarity];
    
    if (roll < config.upgrade) {
      // Upgrade rarity
      const upgrades: Record<RarityType, RarityType> = {
        common: 'rare',
        rare: 'epic',
        epic: 'legendary',
        legendary: 'legendary',
      };
      return upgrades[parentRarity];
    }
    
    return parentRarity;
  }

  private createOffspring(p1: Buddy, p2: Buddy, rarity: RarityType): Buddy {
    const names = ['Junior', 'Mini', 'Baby', 'Lil'];
    const baseName = p1.name.split('')[0] || 'B';
    const name = names[Math.floor(Math.random() * names.length)] + baseName;
    
    return createBuddy(name, rarity);
  }
}

// ==========================================
// VALIDATION SYSTEM
// ==========================================

export class ValidationSystem {
  /**
   * Validate game state integrity
   */
  validateGameState(state: GameState): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check player has valid values
    if (state.player.coins < 0) {
      errors.push('Player coins cannot be negative');
    }
    
    if (state.player.level < 1) {
      errors.push('Player level must be at least 1');
    }
    
    // Check buddies have valid values
    for (const buddy of state.buddies) {
      if (buddy.level < 1) {
        errors.push(`Buddy ${buddy.id} has invalid level`);
      }
      
      if (buddy.baseIncome < 0) {
        errors.push(`Buddy ${buddy.id} has negative income`);
      }
      
      // Check stats
      if (buddy.stats.hp <= 0) {
        warnings.push(`Buddy ${buddy.id} has no HP`);
      }
    }
    
    // Check plots are valid
    for (const plot of state.plots) {
      if (plot.multiplier <= 0) {
        errors.push(`Plot ${plot.id} has invalid multiplier`);
      }
      
      // Check buddy is actually in buddies array
      if (plot.buddyId) {
        const buddy = state.buddies.find(b => b.id === plot.buddyId);
        if (!buddy) {
          errors.push(`Plot ${plot.id} references non-existent buddy ${plot.buddyId}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate movement input
   */
  validateMovementInput(dx: number, dy: number, speed: number): MovementValidation {
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    return {
      valid: magnitude <= 1,
      normalizedX: magnitude > 0 ? dx / magnitude : 0,
      normalizedY: magnitude > 0 ? dy / magnitude : 0,
      magnitude,
    };
  }

  /**
   * Validate touch joystick input
   */
  validateJoystickInput(x: number, y: number, centerX: number, centerY: number): JoystickValidation {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return {
      valid: distance <= TOUCH.joystickRadius,
      dx,
      dy,
      distance,
      normalizedX: distance > 0 ? dx / distance : 0,
      normalizedY: distance > 0 ? dy / distance : 0,
    };
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MovementValidation {
  valid: boolean;
  normalizedX: number;
  normalizedY: number;
  magnitude: number;
}

export interface JoystickValidation {
  valid: boolean;
  dx: number;
  dy: number;
  distance: number;
  normalizedX: number;
  normalizedY: number;
}

export interface BattleAction {
  type: 'attack' | 'defend' | 'special' | 'item' | 'flee';
  sourceId: string;
  targetId?: string;
  damage?: number;
  healing?: number;
  abilityId?: string;
}

export interface BreedingResult {
  success: boolean;
  offspring?: Buddy;
  materials: { itemId: string; quantity: number }[];
  failureReason?: string;
}

// ==========================================
// SAVE SYSTEM - Persistence
// ==========================================

export class SaveSystem {
  private saveKey: string;
  private autoSaveInterval: number;
  private onSaveCallback?: (state: GameState) => void;
  private autoSaveTimer: number | null = null;

  constructor(saveKey: string = 'buy-a-buddy-save', autoSaveInterval: number = 5000) {
    this.saveKey = saveKey;
    this.autoSaveInterval = autoSaveInterval;
  }

  /**
   * Save game state to localStorage
   */
  save(state: GameState): boolean {
    try {
      const saveData = {
        version: 1,
        timestamp: Date.now(),
        state,
      };
      
      localStorage.setItem(this.saveKey, JSON.stringify(saveData));
      this.onSaveCallback?.(state);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   */
  load(): GameState | null {
    try {
      const saved = localStorage.getItem(this.saveKey);
      if (!saved) return null;
      
      const data = JSON.parse(saved);
      
      // Version migration could happen here
      if (data.version !== 1) {
        console.warn('Save version mismatch, migrating...');
        return this.migrateSave(data);
      }
      
      return data.state;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Delete saved game
   */
  delete(): void {
    localStorage.removeItem(this.saveKey);
  }

  /**
   * Export save as base64 string
   */
  export(state: GameState): string {
    const data = {
      version: 1,
      timestamp: Date.now(),
      state,
    };
    return btoa(JSON.stringify(data));
  }

  /**
   * Import save from base64 string
   */
  import(base64: string): GameState | null {
    try {
      const data = JSON.parse(atob(base64));
      return data.state;
    } catch (error) {
      console.error('Failed to import save:', error);
      return null;
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(getState: () => GameState): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = window.setInterval(() => {
      this.save(getState());
    }, this.autoSaveInterval);
    
    // Save on visibility change and beforeunload
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.save(getState());
      }
    });
    
    window.addEventListener('beforeunload', () => {
      this.save(getState());
    });
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Set callback for save events
   */
  onSave(callback: (state: GameState) => void): void {
    this.onSaveCallback = callback;
  }

  private migrateSave(data: any): GameState | null {
    // Handle version migrations
    // For now, just return the state if it's valid
    if (data.state && typeof data.state === 'object') {
      return data.state;
    }
    return null;
  }
}

// ==========================================
// DEBUG SYSTEM - Development tools
// ==========================================

export class DebugSystem {
  private gameState: GameState;
  private isEnabled: boolean;
  private logLevel: LogLevel;
  private metrics: DebugMetrics;

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.isEnabled = import.meta.env.DEV === 'development';
    this.logLevel = LogLevel.INFO;
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      memory: 0,
      entities: 0,
      drawCalls: 0,
    };
  }

  log(level: LogLevel, message: string, data?: any): void {
    if (!this.isEnabled || level < this.logLevel) return;
    
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    
    console.log(`[${timestamp}] [${levelName}] ${message}`, data ?? '');
  }

  updateMetrics(fps: number, frameTime: number, entities: number): void {
    this.metrics.fps = fps;
    this.metrics.frameTime = frameTime;
    this.metrics.entities = entities;
  }

  getMetrics(): DebugMetrics {
    return { ...this.metrics };
  }

  /**
   * Debug: Add coins
   */
  debugAddCoins(amount: number): void {
    this.log(LogLevel.INFO, `Adding ${amount} coins`);
    this.gameState.player.coins += amount;
  }

  /**
   * Debug: Spawn buddy
   */
  debugSpawnBuddy(rarity?: RarityType): Buddy {
    const spawner = new SpawnerSystem(this.gameState);
    const result = spawner.spawnBuddy(rarity);
    
    if (result.success && result.buddy) {
      this.log(LogLevel.INFO, `Spawned ${result.buddy.rarity} buddy: ${result.buddy.name}`);
      return result.buddy;
    }
    
    throw new Error('Failed to spawn buddy');
  }

  /**
   * Debug: Set player level
   */
  debugSetLevel(level: number): void {
    this.log(LogLevel.INFO, `Setting level to ${level}`);
    this.gameState.player.level = level;
  }

  /**
   * Generate debug report
   */
  generateReport(): DebugReport {
    return {
      timestamp: Date.now(),
      player: {
        name: this.gameState.player.name,
        level: this.gameState.player.level,
        coins: this.gameState.player.coins,
      },
      buddies: this.gameState.buddies.length,
      working: this.gameState.buddies.filter(b => b.isWorking).length,
      plots: this.gameState.plots.length,
      occupied: this.gameState.plots.filter(p => p.buddyId).length,
      quests: this.gameState.quests.length,
      inventory: this.gameState.inventory.length,
      statistics: this.gameState.statistics,
      metrics: this.metrics,
    };
  }
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface DebugMetrics {
  fps: number;
  frameTime: number;
  memory: number;
  entities: number;
  drawCalls: number;
}

export interface DebugReport {
  timestamp: number;
  player: { name: string; level: number; coins: number };
  buddies: number;
  working: number;
  plots: number;
  occupied: number;
  quests: number;
  inventory: number;
  statistics: any;
  metrics: DebugMetrics;
}