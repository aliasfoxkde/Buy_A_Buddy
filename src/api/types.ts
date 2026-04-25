// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  timestamp: number;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ErrorResponse extends ApiResponse<null> {
  errorCode: ErrorCode;
  details?: any;
}

export enum ErrorCode {
  // Validation
  INVALID_REQUEST = 'INVALID_REQUEST',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Business logic
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  MAX_REACHED = 'MAX_REACHED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  INVALID_STATE = 'INVALID_STATE',
  
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Server
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export function successResponse<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
    requestId,
  };
}

export function errorResponse(
  error: string,
  errorCode: ErrorCode,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error,
    errorCode,
    timestamp: Date.now(),
    requestId,
  };
}

// ==========================================
// GAME STATE DTOs
// ==========================================

export interface PlayerDTO {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpRequired: number;
  coins: number;
  gems: number;
}

export interface BuddyDTO {
  id: string;
  name: string;
  rarity: string;
  level: number;
  xp: number;
  xpRequired: number;
  baseIncome: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    hp: number;
    maxHp: number;
  };
  isWorking: boolean;
  workPlotId: string | null;
}

export interface PlotDTO {
  id: string;
  level: number;
  multiplier: number;
  buddyId: string | null;
  buddy: BuddyDTO | null;
}

export interface GameStateDTO {
  version: number;
  player: PlayerDTO;
  buddies: BuddyDTO[];
  plots: PlotDTO[];
  inventory: ItemDTO[];
  quests: QuestProgressDTO[];
  statistics: StatisticsDTO;
  settings: SettingsDTO;
}

export interface ItemDTO {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  quantity: number;
  maxStack: number;
  value: number;
}

export interface QuestProgressDTO {
  questId: string;
  name: string;
  description: string;
  type: string;
  isComplete: boolean;
  claimed: boolean;
  progress: number;
}

export interface StatisticsDTO {
  totalPlayTime: number;
  battlesWon: number;
  battlesLost: number;
  buddiesSpawned: number;
  buddiesBred: number;
  questsCompleted: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
}

export interface SettingsDTO {
  musicVolume: number;
  sfxVolume: number;
  vibrationEnabled: boolean;
  reducedMotion: boolean;
  autoSaveInterval: number;
}

// ==========================================
// ACTION REQUEST/RESPONSE
// ==========================================

export type GameAction = 
  | SpawnBuddyAction
  | AssignBuddyAction
  | UnassignBuddyAction
  | UpgradeBuddyAction
  | UpgradePlotAction
  | PurchaseItemAction
  | StartQuestAction
  | ClaimQuestRewardAction
  | BreedBuddiesAction
  | StartBattleAction
  | BattleActionAction;

export interface SpawnBuddyAction {
  type: 'SPAWN_BUDDY';
  forcedRarity?: string;
}

export interface AssignBuddyAction {
  type: 'ASSIGN_BUDDY';
  buddyId: string;
  plotId: string;
}

export interface UnassignBuddyAction {
  type: 'UNASSIGN_BUDDY';
  buddyId: string;
}

export interface UpgradeBuddyAction {
  type: 'UPGRADE_BUDDY';
  buddyId: string;
}

export interface UpgradePlotAction {
  type: 'UPGRADE_PLOT';
  plotId: string;
}

export interface PurchaseItemAction {
  type: 'PURCHASE_ITEM';
  itemId: string;
  quantity: number;
}

export interface StartQuestAction {
  type: 'START_QUEST';
  questId: string;
}

export interface ClaimQuestRewardAction {
  type: 'CLAIM_QUEST_REWARD';
  questId: string;
}

export interface BreedBuddiesAction {
  type: 'BREED_BUDDIES';
  parent1Id: string;
  parent2Id: string;
}

export interface StartBattleAction {
  type: 'START_BATTLE';
  region: string;
  wave: number;
}

export interface BattleActionAction {
  type: 'BATTLE_ACTION';
  actionType: 'attack' | 'defend' | 'special' | 'flee';
  targetId?: string;
}

export interface ActionResult {
  action: GameAction;
  success: boolean;
  result?: any;
  error?: string;
  errorCode?: ErrorCode;
  newState?: GameStateDTO;
  rewards?: {
    coins?: number;
    xp?: number;
    items?: ItemDTO[];
  };
}

// ==========================================
// DEBUG TYPES
// ==========================================

export interface DebugReportDTO {
  timestamp: number;
  player: PlayerDTO;
  game: {
    buddiesCount: number;
    workingCount: number;
    plotsOccupied: number;
    totalPlots: number;
  };
  performance: {
    fps: number;
    frameTime: number;
    entities: number;
  };
  memory: {
    used: number;
    total: number;
  };
  statistics: StatisticsDTO;
}

export interface PerformanceMetricsDTO {
  fps: number;
  frameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  entities: number;
  drawCalls: number;
}

// ==========================================
// VALIDATION
// ==========================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export function validateId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9-_]+$/.test(id);
}

export function validateRarity(rarity: string): boolean {
  return ['common', 'rare', 'epic', 'legendary'].includes(rarity);
}

export function validatePositiveNumber(value: number, field: string): ValidationError | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return { field, message: 'Must be a number', code: 'INVALID_TYPE' };
  }
  if (value < 0) {
    return { field, message: 'Must be positive', code: 'NEGATIVE_VALUE' };
  }
  return null;
}