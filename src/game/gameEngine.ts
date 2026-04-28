/**
 * Buy a Buddy - Game Engine Entry Point
 */

import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { WorldScene } from '../scenes/WorldScene';
import { CharacterSelectScene } from '../scenes/CharacterSelectScene';
import { BattleScene } from '../scenes/BattleScene';
import { InventoryScene } from '../scenes/InventoryScene';
import { QuestScene } from '../scenes/QuestScene';
import { ShopScene } from '../scenes/ShopScene';
import { MenuScene } from '../scenes/MenuScene';
import { SettingsScene } from '../scenes/SettingsScene';
import { SaveLoadScene } from '../scenes/SaveLoadScene';
import { AchievementScene } from '../scenes/AchievementScene';
import { StatsScene } from '../scenes/StatsScene';

export interface GameConfig {
  type: number;
  width: number;
  height: number;
  parent: string | HTMLElement;
  backgroundColor: string;
  physics: Phaser.Types.Core.PhysicsConfig;
  scale: Phaser.Types.Core.ScaleConfig;
  scene: typeof Phaser.Scene[];
  pixelArt: boolean;
  render: Phaser.Types.Core.RenderConfig;
}

/**
 * Create game configuration
 */
export function createGameConfig(): GameConfig {
  return {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
      resizeInterval: 0
    },
    scene: [
      BootScene,
      MainMenuScene,
      CharacterSelectScene,
      WorldScene,
      BattleScene,
      InventoryScene,
      QuestScene,
      ShopScene,
      MenuScene,
      SettingsScene,
      SaveLoadScene,
      AchievementScene,
      StatsScene
    ],
    pixelArt: false,
    render: {
      pixelArt: false,
      antialias: true,
      roundPixels: false
    }
  };
}

/**
 * Start the game
 */
export function startGame(): Phaser.Game {
  const config = createGameConfig();
  const game = new Phaser.Game(config);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    game.scale.refresh();
  });
  
  return game;
}
