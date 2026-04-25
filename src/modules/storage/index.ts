/**
 * Storage System Module - Save/Load, LocalStorage, Cloud
 */

import { EventBus, SaveData, GameState, generateId } from '../../core';

export type StorageBackend = 'local' | 'cloud' | 'indexeddb';
export type StorageKey = 'save' | 'settings' | 'achievements' | 'statistics';

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  playTime: number;
  level: number;
  zone: string;
  preview?: string;
}

export interface CloudSave {
  id: string;
  userId: string;
  data: SaveData;
  createdAt: number;
  updatedAt: number;
  version: string;
}

export class StorageSystem {
  private eventBus: EventBus;
  private backend: StorageBackend = 'local';
  private saveSlots: SaveSlot[] = [];
  private autoSaveEnabled: boolean = true;
  private autoSaveInterval: number = 60000; // 1 minute
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.loadSaveSlots();
  }

  setBackend(backend: StorageBackend): void {
    this.backend = backend;
  }

  // ==================== SAVE SLOTS ====================

  getSaveSlots(): SaveSlot[] {
    return [...this.saveSlots];
  }

  private loadSaveSlots(): void {
    const slotsJson = localStorage.getItem('buyabuddy_slots');
    if (slotsJson) {
      try {
        this.saveSlots = JSON.parse(slotsJson);
      } catch {
        this.saveSlots = [];
      }
    }
  }

  private saveSaveSlots(): void {
    localStorage.setItem('buyabuddy_slots', JSON.stringify(this.saveSlots));
  }

  createSaveSlot(state: GameState, name: string, slotIndex: number = -1): string {
    const id = generateId();
    const slot: SaveSlot = {
      id,
      name,
      timestamp: Date.now(),
      playTime: state.playTime,
      level: state.player.stats.level,
      zone: 'village_start' // Would come from world system
    };

    if (slotIndex >= 0 && slotIndex < this.saveSlots.length) {
      // Overwrite existing slot
      const oldId = this.saveSlots[slotIndex].id;
      localStorage.removeItem(`buyabuddy_save_${oldId}`);
      this.saveSlots[slotIndex] = slot;
    } else {
      this.saveSlots.push(slot);
    }

    // Save the actual data
    const saveData = state.toJSON();
    saveData.version = '1.0.0';
    localStorage.setItem(`buyabuddy_save_${id}`, JSON.stringify(saveData));

    this.saveSaveSlots();
    return id;
  }

  deleteSaveSlot(slotId: string): boolean {
    const index = this.saveSlots.findIndex(s => s.id === slotId);
    if (index === -1) return false;

    localStorage.removeItem(`buyabuddy_save_${slotId}`);
    this.saveSlots.splice(index, 1);
    this.saveSaveSlots();
    return true;
  }

  // ==================== SAVE/LOAD ====================

  save(slotId?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.eventBus.emit('storage:save_start', {});
      
      // Get current game state from event
      const saveHandler = (event: any) => {
        const state = event.payload?.state;
        if (!state) return;
        
        const id = slotId || this.saveSlots[0]?.id || 'quicksave';
        
        const saveData = state.toJSON();
        saveData.version = '1.0.0';
        
        localStorage.setItem(`buyabuddy_save_${id}`, JSON.stringify(saveData));
        
        // Update slot
        const slotIndex = this.saveSlots.findIndex(s => s.id === id);
        const slot: SaveSlot = {
          id,
          name: slotIndex >= 0 ? this.saveSlots[slotIndex].name : 'Quicksave',
          timestamp: Date.now(),
          playTime: state.playTime,
          level: state.player.stats.level,
          zone: 'village_start'
        };
        
        if (slotIndex >= 0) {
          this.saveSlots[slotIndex] = slot;
        } else {
          this.saveSlots.unshift(slot);
        }
        
        this.saveSaveSlots();
        this.eventBus.emit('storage:save_complete', { slotId: id });
        this.eventBus.off('game:save', saveHandler);
        resolve(true);
      };
      
      this.eventBus.on('game:save', saveHandler);
      this.eventBus.emit('game:save_request', {});
      
      setTimeout(() => {
        this.eventBus.off('game:save', saveHandler);
        resolve(false);
      }, 5000);
    });
  }

  load(slotId: string): Promise<GameState | null> {
    return new Promise((resolve) => {
      this.eventBus.emit('storage:load_start', { slotId });
      
      const saveJson = localStorage.getItem(`buyabuddy_save_${slotId}`);
      if (!saveJson) {
        this.eventBus.emit('storage:load_error', { slotId, error: 'Save not found' });
        resolve(null);
        return;
      }

      try {
        const saveData = JSON.parse(saveJson) as SaveData;
        
        // Version migration
        if (saveData.version !== '1.0.0') {
          // Handle migrations here
        }
        
        const state = new GameState();
        state.fromJSON(saveData);
        
        this.eventBus.emit('storage:load_complete', { slotId });
        resolve(state);
      } catch (error) {
        this.eventBus.emit('storage:load_error', { slotId, error: String(error) });
        resolve(null);
      }
    });
  }

  hasSave(slotId: string): boolean {
    return localStorage.getItem(`buyabuddy_save_${slotId}`) !== null;
  }

  // ==================== SETTINGS ====================

  saveSettings(settings: Record<string, unknown>): void {
    localStorage.setItem('buyabuddy_settings', JSON.stringify(settings));
  }

  loadSettings<T = Record<string, unknown>>(): T | null {
    const json = localStorage.getItem('buyabuddy_settings');
    if (!json) return null;
    
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  // ==================== STATISTICS ====================

  private getStats(): Record<string, number> {
    const json = localStorage.getItem('buyabuddy_stats');
    if (!json) return {};
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  }

  private saveStats(stats: Record<string, number>): void {
    localStorage.setItem('buyabuddy_stats', JSON.stringify(stats));
  }

  incrementStat(name: string, amount: number = 1): void {
    const stats = this.getStats();
    stats[name] = (stats[name] || 0) + amount;
    this.saveStats(stats);
    this.eventBus.emit('stats:update', { name, value: stats[name] });
  }

  getStat(name: string): number {
    return this.getStats()[name] || 0;
  }

  // ==================== AUTO SAVE ====================

  enableAutoSave(interval?: number): void {
    if (interval) {
      this.autoSaveInterval = interval;
    }
    
    this.autoSaveEnabled = true;
    
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(() => {
      if (this.autoSaveEnabled) {
        this.save();
      }
    }, this.autoSaveInterval);
  }

  disableAutoSave(): void {
    this.autoSaveEnabled = false;
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // ==================== EXPORT/IMPORT ====================

  exportSave(slotId: string): string | null {
    const saveJson = localStorage.getItem(`buyabuddy_save_${slotId}`);
    if (!saveJson) return null;
    
    // Base64 encode for easier transfer
    return btoa(saveJson);
  }

  importSave(encoded: string, slotName?: string): string | null {
    try {
      const saveJson = atob(encoded);
      const saveData = JSON.parse(saveJson) as SaveData;
      
      // Validate basic structure
      if (!saveData.version || !saveData.player || !saveData.inventory) {
        throw new Error('Invalid save data');
      }
      
      const id = generateId();
      localStorage.setItem(`buyabuddy_save_${id}`, saveJson);
      
      const slot: SaveSlot = {
        id,
        name: slotName || `Imported Save`,
        timestamp: Date.now(),
        playTime: saveData.player.playTime,
        level: saveData.player.stats.level,
        zone: 'village_start'
      };
      
      this.saveSlots.push(slot);
      this.saveSaveSlots();
      
      return id;
    } catch {
      return null;
    }
  }

  // ==================== CLEANUP ====================

  clearAllData(): void {
    localStorage.removeItem('buyabuddy_slots');
    localStorage.removeItem('buyabuddy_settings');
    localStorage.removeItem('buyabuddy_stats');
    
    // Clear all saves
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('buyabuddy_save_')) {
        localStorage.removeItem(key);
      }
    }
    
    this.saveSlots = [];
    this.eventBus.emit('storage:cleared', {});
  }

  getStorageUsed(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('buyabuddy')) {
        total += (localStorage.getItem(key) || '').length;
      }
    }
    return total;
  }
}
