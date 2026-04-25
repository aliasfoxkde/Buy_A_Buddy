// ==========================================
// BUY A BUDDY - Complete RPG Game Engine
// ==========================================

import { Game, Scale, Types } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { WorldScene } from './scenes/WorldScene';
import { BattleScene } from './scenes/BattleScene';
import { BuddyScene } from './scenes/BuddyScene';
import { QuestScene } from './scenes/QuestScene';
import { SettingsScene } from './scenes/SettingsScene';

// ==========================================
// GAME CONFIGURATION
// ==========================================

export const BASE_WIDTH = 400;
export const BASE_HEIGHT = 700;

const GAME_CONFIG: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#0d0d1a',
  scale: {
    mode: Scale.FIT,
    width: '100%',
    height: '100%',
    autoCenter: Scale.CENTER_BOTH,
    zoom: 1,
  },
  parent: 'game',
  dom: {
    createContainer: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
  },
};

// Create game instance
const GAME = new Game(GAME_CONFIG);

// ==========================================
// SCENE REGISTRATION
// ==========================================

GAME.scene.add('BootScene', BootScene);
GAME.scene.add('MainMenuScene', MainMenuScene);
GAME.scene.add('CharacterSelectScene', CharacterSelectScene);
GAME.scene.add('WorldScene', WorldScene);
GAME.scene.add('BattleScene', BattleScene);
GAME.scene.add('BuddyScene', BuddyScene);
GAME.scene.add('QuestScene', QuestScene);
GAME.scene.add('SettingsScene', SettingsScene);

// Start with boot scene
GAME.scene.start('BootScene');

// ==========================================
// FULLSCREEN CONTROL
// ==========================================

let isFullscreen = false;

export function toggleFullscreen(): void {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen = true;
      GAME.scale.scaleMode = Scale.RESIZE;
      GAME.scale.refresh();
    }).catch(() => {});
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen = false;
      GAME.scale.scaleMode = Scale.FIT;
      GAME.scale.refresh();
    });
  }
}

export function isFullscreenActive(): boolean {
  return isFullscreen;
}

export function getGame(): Game {
  return GAME;
}

// ==========================================
// GLOBAL KEYBOARD SHORTCUTS
// ==========================================

// Type assertion for scene manager
const sceneManager = GAME.scene as any;

document.addEventListener('keydown', (e) => {
  switch (e.key.toUpperCase()) {
    case 'F':
      toggleFullscreen();
      break;
    case 'ESC':
      if (isFullscreen) {
        toggleFullscreen();
      } else {
        sceneManager.stop('SettingsScene');
      }
      break;
    case 'I':
      if (!GAME.scene.isActive('SettingsScene')) {
        sceneManager.launch('BuddyScene');
      }
      break;
    case 'M':
      if (!GAME.scene.isActive('SettingsScene')) {
        sceneManager.launch('QuestScene');
      }
      break;
  }
});

// ==========================================
// VISIBILITY HANDLING
// ==========================================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    GAME.scene.pause('WorldScene');
    GAME.scene.pause('BattleScene');
  } else {
    GAME.scene.resume('WorldScene');
    GAME.scene.resume('BattleScene');
  }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

// ==========================================
// DEBUG EXPORTS
// ==========================================

(window as any).GAME = GAME;
(window as any).toggleFullscreen = toggleFullscreen;
(window as any).isFullscreen = isFullscreenActive;

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    ██████╗ ███████╗███╗   ██╗ ██████╗  ██████╗ ██████╗ ██╗    ║
║    ██╔══██╗██╔════╝████╗  ██║██╔════╝ ██╔═══██╗██╔══██╗██║    ║
║    ██████╔╝███████╗██╔██╗ ██║██║  ███╗██║   ██║██████╔╝██║    ║
║    ██╔═══╝ ╚════██║██║╚██╗██║██║   ██║██║   ██║██╔══██╗██║    ║
║    ██║     ███████║██║ ╚████║╚██████╔╝╚██████╔╝██║  ██║██║    ║
║    ╚═╝     ╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝    ║
║                                                               ║
║    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗███████╗
║    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║██╔════╝
║    ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║███████╗
║    ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║╚════██║
║    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║███████║
║    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝╚══════╝
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║   ~ The Shadow King has scattered the Golden Buddies! ~       ║
║   ~ Your journey to find them begins... ~                   ║
╠═══════════════════════════════════════════════════════════════╣
║   📋 CONTROLS                                                  ║
╠═══════════════════════════════════════════════════════════════╣
║   F         - Toggle Fullscreen (⛶)                          ║
║   ESC       - Pause / Exit Fullscreen                         ║
║   I         - Open Buddies (🐾)                               ║
║   M         - Open Quests (📜)                               ║
║   WASD      - Move                                             ║
║   E         - Interact                                        ║
╠═══════════════════════════════════════════════════════════════╣
║   🎮 Good luck, Buddy Trainer!                                ║
╚═══════════════════════════════════════════════════════════════╝
`);