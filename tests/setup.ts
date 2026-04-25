// ==========================================
// TEST SETUP - Common test utilities
// ==========================================

import { vi } from 'vitest';

// Mock localStorage
export const mockLocalStorage = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.data.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => mockLocalStorage.data.set(key, value)),
  removeItem: vi.fn((key: string) => mockLocalStorage.data.delete(key)),
  clear: vi.fn(() => mockLocalStorage.data.clear()),
};

// Setup localStorage mock before each test
export function setupLocalStorageMock() {
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
  mockLocalStorage.data.clear();
}

// Mock window object
export function setupWindowMock() {
  const listeners = new Map<string, Set<EventListener>>();
  
  global.window = {
    ...global.window,
    addEventListener: vi.fn((event: string, callback: EventListener) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(callback);
    }),
    removeEventListener: vi.fn((event: string, callback: EventListener) => {
      listeners.get(event)?.delete(callback);
    }),
    setInterval: vi.fn((callback: (...args: any[]) => void) => 1),
    clearInterval: vi.fn(),
  } as any;
}

// Clean up after each test
export function cleanup() {
  mockLocalStorage.data.clear();
  vi.clearAllMocks();
}

// Test data factories
export function createMockBuddy(overrides: Partial<{
  id: string;
  name: string;
  emoji: string;
  rarity: string;
  baseIncome: number;
  level: number;
  assignedPlotId: string | null;
}> = {}) {
  return {
    id: 'test-buddy-1',
    name: 'TestBuddy',
    emoji: '💎',
    rarity: 'common',
    baseIncome: 1,
    level: 1,
    assignedPlotId: null,
    ...overrides,
  };
}

export function createMockPlot(overrides: Partial<{
  id: string;
  level: number;
  multiplier: number;
  assignedBuddyId: string | null;
}> = {}) {
  return {
    id: 'plot-1',
    level: 1,
    multiplier: 1,
    assignedBuddyId: null,
    ...overrides,
  };
}

export function createMockGameState(overrides: Partial<any> = {}) {
  return {
    currency: 100,
    buddies: [],
    plots: [
      createMockPlot({ id: 'plot-1' }),
      createMockPlot({ id: 'plot-2' }),
      createMockPlot({ id: 'plot-3' }),
    ],
    upgrades: [
      {
        id: 'plot-boost',
        name: 'Plot Power',
        description: 'Increase plot multipliers',
        cost: 50,
        maxLevel: 20,
        currentLevel: 1,
        effect: { type: 'plot_multiplier', value: 0.5 },
      },
      {
        id: 'spawn-luck',
        name: 'Lucky Spawn',
        description: 'Better buddy spawn chances',
        cost: 100,
        maxLevel: 10,
        currentLevel: 0,
        effect: { type: 'spawn_chance', value: 0.05 },
      },
    ],
    stats: {
      totalEarned: 0,
      sessionEarned: 0,
      highScore: 0,
    },
    lastUpdate: Date.now(),
    totalPlayTime: 0,
    buddiesBought: 0,
    moneyEarned: 0,
    ...overrides,
  };
}