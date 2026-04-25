// ==========================================
// SAVE SYSTEM
// ==========================================

import { GameState } from '../game/types';

const SAVE_KEY = 'buy-a-buddy-save';
const SAVE_VERSION = 1;

interface SaveData {
  version: number;
  state: GameState;
  savedAt: number;
}

// Save game state to localStorage
export function saveGame(state: GameState): boolean {
  try {
    const saveData: SaveData = {
      version: SAVE_VERSION,
      state,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.error('Failed to save game:', e);
    return false;
  }
}

// Load game state from localStorage
export function loadGame(): GameState | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return null;
    
    const data: SaveData = JSON.parse(saved);
    
    // Version migration could go here
    if (data.version !== SAVE_VERSION) {
      console.warn('Save version mismatch, starting fresh');
      return null;
    }
    
    return data.state;
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
}

// Delete save data
export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

// Export save as base64 string
export function exportSave(state: GameState): string {
  const saveData: SaveData = {
    version: SAVE_VERSION,
    state,
    savedAt: Date.now(),
  };
  return btoa(JSON.stringify(saveData));
}

// Import save from base64 string
export function importSave(base64: string): GameState | null {
  try {
    const decoded = atob(base64);
    const data: SaveData = JSON.parse(decoded);
    return data.state;
  } catch (e) {
    console.error('Failed to import save:', e);
    return null;
  }
}

// Auto-save interval manager
export class SaveManager {
  private intervalId: number | null = null;
  private getState: () => GameState;
  private intervalMs: number;

  constructor(getState: () => GameState, intervalMs: number = 5000) {
    this.getState = getState;
    this.intervalMs = intervalMs;
  }

  start(): void {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(() => {
      saveGame(this.getState());
    }, this.intervalMs);
    
    // Also save on visibility change and beforeunload
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveGame(this.getState());
    });
    
    window.addEventListener('beforeunload', () => {
      saveGame(this.getState());
    });
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  saveNow(): void {
    saveGame(this.getState());
  }
}