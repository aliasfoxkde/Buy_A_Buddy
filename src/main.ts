/**
 * Buy a Buddy - Main Entry Point
 */

import './style.css';
import Phaser from 'phaser';
import { startGame } from './game/gameEngine';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, starting game...');
  
  // Use the existing #game div or create container
  const gameDiv = document.getElementById('game');
  let container = document.getElementById('game-container');
  
  if (!container && gameDiv) {
    container = document.createElement('div');
    container.id = 'game-container';
    container.style.width = '100%';
    container.style.height = '100%';
    gameDiv.appendChild(container);
  } else if (!container) {
    container = document.createElement('div');
    container.id = 'game-container';
    document.body.appendChild(container);
  }
  
  // Set container styles
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.overflow = 'hidden';
  container.style.backgroundColor = '#1a1a2e';
  
  // Start the game
  console.log('Starting game with container:', container.id);
  
  // Check container exists and has size
  const rect = container.getBoundingClientRect();
  console.log('Container rect:', JSON.stringify(rect));
  
  if (rect.width === 0 || rect.height === 0) {
    console.error('Container has zero size! Forcing dimensions');
    container.style.width = window.innerWidth + 'px';
    container.style.height = window.innerHeight + 'px';
  }
  
  let game: Phaser.Game | undefined;
  try {
    game = startGame();
    console.log('Game started:', !!game);
    console.log('Game canvas:', game?.canvas);
  } catch (e) {
    console.error('Game start failed:', e);
  }
  
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful:', registration.scope);
        },
        (err) => {
          console.log('ServiceWorker registration failed:', err);
        }
      );
    });
  }
  
  // Handle visibility changes (pause/resume)
  document.addEventListener('visibilitychange', () => {
    if (!game) return;
    if (document.hidden) {
      game.scene.pause('WorldScene');
    } else {
      game.scene.resume('WorldScene');
    }
  });
  
  // Prevent context menu on right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  // Handle errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
  console.log('Buy a Buddy v2.0.0 initialized');
});

export {};
