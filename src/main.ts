// ==========================================
// MAIN ENTRY POINT - Buy a Buddy
// ==========================================

import './style.css';
import { initUI, forceRender } from './ui/uiManager';

// Initialize game UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initUI('game');
  
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed, game still works without PWA features
      });
    });
  }
});

// Prevent context menu on mobile (for better gaming experience)
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Handle visibility change for background income
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    forceRender();
  }
});