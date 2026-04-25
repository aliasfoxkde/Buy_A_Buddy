/**
 * Buy a Buddy - Main Entry Point
 */

import './style.css';
import { startGame } from './game/gameEngine';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Get or create game container
  let container = document.getElementById('game-container');
  
  if (!container) {
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
  const game = startGame();
  
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
