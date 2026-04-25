// ==========================================
// MAIN ENTRY POINT - Fullscreen responsive game
// ==========================================

import { Game, Scale } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuSceneResponsive';
import { GameScene } from './scenes/GameSceneResponsive';

// Base game dimensions (internal resolution for assets)
export const BASE_WIDTH = 400;
export const BASE_HEIGHT = 700;

// Scale mode
type ScaleModeType = 'FIT' | 'RESIZE' | 'EXACT_FIT' | 'NO_BORDER';
let currentScaleMode: ScaleModeType = 'FIT';
let isFullscreen = false;

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Scale.FIT,
    width: '100%',
    height: '100%',
    autoCenter: Scale.CENTER_BOTH,
    zoom: 1,
  },
  parent: 'game',
  backgroundColor: '#0d0d1a',
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

// Get scale manager
const scale = game.scale;

// Register scenes
game.scene.add('BootScene', BootScene);
game.scene.add('MenuScene', MenuScene);
game.scene.add('GameScene', GameScene);

// Start with boot scene
game.scene.start('BootScene');

// ==========================================
// FULLSCREEN & SCALE CONTROLS
// ==========================================

export function toggleFullscreen(): void {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen = true;
      scale.scaleMode = Scale.RESIZE;
      scale.refresh();
    }).catch(err => {
      console.log('Fullscreen not available:', err);
    });
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen = false;
      scale.scaleMode = Scale.FIT;
      scale.refresh();
    });
  }
}

export function setScaleMode(mode: ScaleModeType): void {
  currentScaleMode = mode;
  scale.scaleMode = Scale[mode];
  scale.refresh();
}

export function zoomIn(): void {
  const currentZoom = scale.zoom;
  if (currentZoom < 2) {
    scale.setZoom(Math.min(currentZoom + 0.25, 2));
  }
}

export function zoomOut(): void {
  const currentZoom = scale.zoom;
  if (currentZoom > 0.5) {
    scale.setZoom(Math.max(currentZoom - 0.25, 0.5));
  }
}

export function resetZoom(): void {
  scale.setZoom(1);
}

export function isFullscreenActive(): boolean {
  return isFullscreen;
}

export function getZoomLevel(): number {
  return scale.zoom;
}

// ==========================================
// WINDOW & RESIZE HANDLING
// ==========================================

let resizeTimeout: number;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    scale.refresh();
    window.dispatchEvent(new CustomEvent('gameResize', {
      detail: {
        width: window.innerWidth,
        height: window.innerHeight,
        zoom: scale.zoom,
      }
    }));
  }, 100);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.pause('GameScene');
    game.scene.pause('GameSceneResponsive');
  } else {
    game.scene.resume('GameScene');
    game.scene.resume('GameSceneResponsive');
  }
});

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener('keydown', (e) => {
  if (e.key === 'F' || e.key === 'f') {
    toggleFullscreen();
  }
  if (e.key === 'Escape' && isFullscreen) {
    toggleFullscreen();
  }
  if (e.key === '+' || e.key === '=') {
    zoomIn();
  }
  if (e.key === '-' || e.key === '_') {
    zoomOut();
  }
  if (e.key === '0') {
    resetZoom();
  }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

// ==========================================
// EXPORTS FOR DEBUG & GAME ACCESS
// ==========================================

(window as any).game = game;
(window as any).BASE_WIDTH = BASE_WIDTH;
(window as any).BASE_HEIGHT = BASE_HEIGHT;
(window as any).toggleFullscreen = toggleFullscreen;
(window as any).setScaleMode = setScaleMode;
(window as any).zoomIn = zoomIn;
(window as any).zoomOut = zoomOut;
(window as any).resetZoom = resetZoom;
(window as any).isFullscreen = isFullscreenActive;
(window as any).getZoom = getZoomLevel;

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎮 Buy a Buddy                                        ║
║   An immersive 2D RPG with mini-games                   ║
║                                                          ║
║   Base: ${BASE_WIDTH}x${BASE_HEIGHT} | Scales to fill screen
║                                                          ║
║   ┌─────────────────────────────────────┐               ║
║   │ KEYBOARD SHORTCUTS                   │               ║
║   ├─────────────────────────────────────┤               ║
║   │ F        - Toggle Fullscreen        │               ║
║   │ ESC      - Exit Fullscreen          │               ║
║   │ +/-      - Zoom In/Out               │               ║
║   │ 0        - Reset Zoom                │               ║
║   ├─────────────────────────────────────┤               ║
║   │ CONTROLS                            │               ║
║   │ • WASD / Arrow Keys - Move          │               ║
║   │ • Space / Enter - Confirm           │               ║
║   │ • Click/Tap - Interact              │               ║
║   ├─────────────────────────────────────┤               ║
║   │ MOBILE                              │               ║
║   │ • Left side - Virtual Joystick      │               ║
║   │ • Tap buttons to interact           │               ║
║   └─────────────────────────────────────┘               ║
║                                                          ║
║   📱 Auto-detects: Mobile | Tablet | Desktop | TV       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);