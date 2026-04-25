// ==========================================
// MAIN ENTRY POINT
// ==========================================

import { Game } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: '#0d0d1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// Create game instance
const game = new Game(config);

// Register scenes
game.scene.add('BootScene', BootScene);
game.scene.add('MenuScene', MenuScene);
game.scene.add('GameScene', GameScene);

// Start with boot scene
game.scene.start('BootScene');

// Export for debugging
(window as any).game = game;

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎮 Buy a Buddy                                        ║
║   An immersive 2D RPG with mini-games                   ║
║                                                          ║
║   Controls:                                              ║
║   • WASD or Arrow Keys to move                          ║
║   • Click/Tap to interact                               ║
║   • Ctrl+Shift+D for debug overlay                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);