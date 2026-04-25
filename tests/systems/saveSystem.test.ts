// ==========================================
// SAVE SYSTEM TESTS - LocalStorage persistence
// ==========================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveManager, saveGame, loadGame, deleteSave, exportSave, importSave } from '../../src/systems/saveSystem';
import { createMockGameState } from '../setup';

describe('Save System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveGame', () => {
    it('should save game state to localStorage', () => {
      const state = createMockGameState({ currency: 500 });
      const result = saveGame(state);
      
      expect(result).toBe(true);
      // Verify data was saved
      const saved = localStorage.getItem('buy-a-buddy-save');
      expect(saved).toBeTruthy();
    });

    it('should include version and timestamp', () => {
      const state = createMockGameState();
      saveGame(state);
      
      const savedData = localStorage.getItem('buy-a-buddy-save');
      const parsed = JSON.parse(savedData!);
      
      expect(parsed.version).toBe(1);
      expect(parsed.savedAt).toBeDefined();
      expect(parsed.state).toBeDefined();
    });
  });

  describe('loadGame', () => {
    it('should return null when no save exists', () => {
      const state = loadGame();
      expect(state).toBeNull();
    });

    it('should load saved game state', () => {
      const originalState = createMockGameState({ currency: 750 });
      saveGame(originalState);
      
      const loadedState = loadGame();
      
      expect(loadedState).not.toBeNull();
      expect(loadedState!.currency).toBe(750);
    });

    it('should return null for corrupted save', () => {
      localStorage.setItem('buy-a-buddy-save', 'not valid json');
      
      const state = loadGame();
      expect(state).toBeNull();
    });
  });

  describe('deleteSave', () => {
    it('should remove save from localStorage', () => {
      const state = createMockGameState();
      saveGame(state);
      
      deleteSave();
      
      // Save should be gone
      expect(loadGame()).toBeNull();
    });
  });

  describe('exportSave', () => {
    it('should return base64 encoded save', () => {
      const state = createMockGameState({ currency: 1000 });
      const exported = exportSave(state);
      
      expect(typeof exported).toBe('string');
      // Base64 should be decodable
      const decoded = JSON.parse(atob(exported));
      expect(decoded.state.currency).toBe(1000);
    });
  });

  describe('importSave', () => {
    it('should decode base64 save and return state', () => {
      const originalState = createMockGameState({ currency: 2000 });
      const exported = exportSave(originalState);
      
      const imported = importSave(exported);
      
      expect(imported).not.toBeNull();
      expect(imported!.currency).toBe(2000);
    });

    it('should return null for invalid base64', () => {
      const result = importSave('not-valid-base64!!!');
      expect(result).toBeNull();
    });
  });

  describe('SaveManager', () => {
    it('should call save at intervals', async () => {
      vi.useFakeTimers();
      
      const state = createMockGameState();
      const manager = new SaveManager(() => state, 1000);
      
      manager.start();
      
      vi.advanceTimersByTime(3000);
      
      // Verify save was called (manager uses saveGame internally)
      const saved = localStorage.getItem('buy-a-buddy-save');
      expect(saved).toBeTruthy();
      
      manager.stop();
      vi.useRealTimers();
    });

    it('should save immediately on saveNow', () => {
      const state = createMockGameState({ currency: 999 });
      const manager = new SaveManager(() => state);
      
      manager.saveNow();
      
      const saved = localStorage.getItem('buy-a-buddy-save');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!).state.currency).toBe(999);
    });
  });
});