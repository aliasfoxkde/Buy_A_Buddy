// ==========================================
// UI MANAGER - Handles game rendering and interactions
// ==========================================

import { GameState, Buddy, Plot } from '../game/types';
import * as Game from '../game/gameEngine';
import { formatCurrency, calculateIncomePerSecond } from '../systems/economy';
import { getSpawnCost, getBuddyUpgradeCost, getPlotUpgradeCost } from '../systems/spawner';
import * as Components from './components';

// Main game container reference
let gameContainer: HTMLElement | null = null;
let currentModal: string | null = null;

// Initialize UI
export function initUI(containerId: string): void {
  gameContainer = document.getElementById(containerId);
  if (!gameContainer) {
    console.error('Game container not found:', containerId);
    return;
  }
  
  // Initialize game engine
  const state = Game.initGame();
  
  // Subscribe to state changes
  Game.addStateListener(render);
  
  // Initial render
  render(state);
  
  // Set up event delegation
  gameContainer.addEventListener('click', handleClick);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

// Main render function
function render(state: GameState): void {
  if (!gameContainer) return;
  
  gameContainer.innerHTML = `
    <div class="game-wrapper">
      ${renderTopBar(state)}
      ${renderMainArea(state)}
      ${renderBottomNav()}
    </div>
    ${currentModal ? renderModalOverlay() : ''}
  `;
}

// Top bar with currency and income
function renderTopBar(state: GameState): string {
  const income = calculateIncomePerSecond(state);
  
  return `
    <div class="top-bar">
      <div class="title-section">
        <h1 class="game-title">Buy a Buddy</h1>
        <span class="version">v1.0</span>
      </div>
      <div class="currency-section">
        <div class="currency-display">
          <span class="coin-icon">🪙</span>
          <span class="currency-amount">${formatCurrency(state.currency)}</span>
        </div>
        <div class="income-badge">
          📈 ${formatCurrency(income)}/s
        </div>
      </div>
    </div>
  `;
}

// Main game area
function renderMainArea(state: GameState): string {
  return `
    <div class="main-area">
      ${renderPlotsGrid(state)}
      ${renderSpawnerSection(state)}
    </div>
  `;
}

// Plots grid (3x2 layout)
function renderPlotsGrid(state: GameState): string {
  return `
    <div class="plots-section">
      <h2 class="section-title">🗺️ Your Plots</h2>
      <div class="plots-grid">
        ${state.plots.map(plot => {
          const assignedBuddy = plot.assignedBuddyId 
            ? state.buddies.find(b => b.id === plot.assignedBuddyId)
            : undefined;
          return renderPlotCard(plot, assignedBuddy);
        }).join('')}
      </div>
    </div>
  `;
}

// Single plot card
function renderPlotCard(plot: Plot, buddy: Buddy | undefined): string {
  const upgradeCost = getPlotUpgradeCost(plot);
  const income = buddy ? (buddy.baseIncome * buddy.level * plot.multiplier).toFixed(1) : '0';
  
  return `
    <div class="plot-card ${buddy ? 'occupied' : 'empty'}" data-plot-id="${plot.id}">
      <div class="plot-header">
        <span class="plot-number">Plot ${plot.id.split('-')[1]}</span>
        <span class="plot-level">Lv ${plot.level}</span>
      </div>
      <div class="plot-content">
        ${buddy ? `
          <div class="buddy-display ${buddy.rarity}">
            <span class="buddy-emoji">${buddy.emoji}</span>
            <span class="buddy-name">${buddy.name}</span>
            <span class="buddy-level">Lv ${buddy.level}</span>
          </div>
        ` : `
          <div class="empty-plot-content">
            <span class="empty-icon">🏝️</span>
            <span class="empty-text">Empty Plot</span>
          </div>
        `}
      </div>
      <div class="plot-stats">
        <span class="income-stat">💰 ${income}/s</span>
        <span class="multiplier-stat">×${plot.multiplier.toFixed(1)}</span>
      </div>
      <div class="plot-actions">
        ${buddy ? `
          <button class="btn btn-unassign" data-action="unassign" data-buddy-id="${buddy.id}">
            ↩️ Unassign
          </button>
        ` : `
          <button class="btn btn-assign" data-action="open-inventory">
            📍 Assign Buddy
          </button>
        `}
        <button class="btn btn-upgrade ${buddy ? '' : 'disabled'}" 
                data-action="upgrade-plot" 
                data-plot-id="${plot.id}"
                ${!buddy ? 'disabled' : ''}>
          ⬆️ ${formatCurrency(upgradeCost)}
        </button>
      </div>
    </div>
  `;
}

// Spawner section
function renderSpawnerSection(state: GameState): string {
  const cost = getSpawnCost(state.buddies.length);
  const canAfford = state.currency >= cost;
  const unassignedCount = state.buddies.filter(b => !b.assignedPlotId).length;
  
  return `
    <div class="spawner-section">
      <h2 class="section-title">🎁 Buddy Spawner</h2>
      <div class="spawner-card">
        <div class="spawner-header">
          <span class="spawner-icon">🎁</span>
          <span class="spawner-title">Roll for a Buddy!</span>
        </div>
        <div class="spawner-rates">
          <span class="rate common">💎 60%</span>
          <span class="rate rare">💠 25%</span>
          <span class="rate epic">💜 12%</span>
          <span class="rate legendary">🌟 3%</span>
        </div>
        <button class="btn btn-spawn ${canAfford ? '' : 'disabled'}" 
                data-action="buy-buddy"
                ${!canAfford ? 'disabled' : ''}>
          <span class="spawn-text">🎲 Roll Buddy</span>
          <span class="spawn-cost">🪙 ${formatCurrency(cost)}</span>
        </button>
        ${unassignedCount > 0 ? `
          <div class="unassigned-badge">
            🎒 ${unassignedCount} unassigned
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Bottom navigation
function renderBottomNav(): string {
  return `
    <div class="bottom-nav">
      <button class="nav-btn" data-action="open-inventory">
        🎒 Inventory
      </button>
      <button class="nav-btn" data-action="open-shop">
        🛒 Upgrades
      </button>
      <button class="nav-btn" data-action="open-stats">
        📊 Stats
      </button>
      <button class="nav-btn" data-action="open-help">
        ❓ Help
      </button>
    </div>
  `;
}

// Modal overlay
function renderModalOverlay(): string {
  return `<div class="modal-overlay" data-action="close-modal"></div>`;
}

// Inventory modal
function renderInventoryModal(state: GameState): string {
  const unassigned = state.buddies.filter(b => !b.assignedPlotId);
  const assigned = state.buddies.filter(b => b.assignedPlotId);
  
  return `
    <div class="modal inventory-modal">
      <div class="modal-header">
        <h2>🎒 Inventory</h2>
        <button class="modal-close" data-action="close-modal">✕</button>
      </div>
      <div class="modal-body">
        ${unassigned.length === 0 && assigned.length === 0 ? `
          <div class="empty-state">
            <span class="empty-icon">📭</span>
            <p>No buddies yet! Buy some from the spawner.</p>
          </div>
        ` : `
          ${unassigned.length > 0 ? `
            <div class="buddy-section">
              <h3>Unassigned (${unassigned.length})</h3>
              <div class="buddies-grid">
                ${unassigned.map(b => renderBuddyCard(b, state)).join('')}
              </div>
            </div>
          ` : ''}
          ${assigned.length > 0 ? `
            <div class="buddy-section">
              <h3>Working (${assigned.length})</h3>
              <div class="buddies-grid">
                ${assigned.map(b => renderBuddyCard(b, state, true)).join('')}
              </div>
            </div>
          ` : ''}
        `}
      </div>
    </div>
  `;
}

// Buddy card for inventory
function renderBuddyCard(buddy: Buddy, state: GameState, showUnassign: boolean = false): string {
  const upgradeCost = getBuddyUpgradeCost(buddy);
  const plot = buddy.assignedPlotId ? state.plots.find(p => p.id === buddy.assignedPlotId) : undefined;
  const income = plot ? (buddy.baseIncome * buddy.level * plot.multiplier).toFixed(1) : '0';
  
  return `
    <div class="buddy-card ${buddy.rarity}" data-buddy-id="${buddy.id}">
      <div class="buddy-header">
        <span class="buddy-emoji">${buddy.emoji}</span>
        <span class="buddy-name">${buddy.name}</span>
      </div>
      <div class="buddy-stats">
        <span class="buddy-level">Lv ${buddy.level}</span>
        <span class="buddy-income">💰 ${income}/s</span>
      </div>
      ${plot ? `<div class="buddy-plot">📍 Plot ${plot.id.split('-')[1]}</div>` : ''}
      <div class="buddy-actions">
        ${!buddy.assignedPlotId ? `
          <button class="btn btn-small" data-action="assign-buddy-select" data-buddy-id="${buddy.id}">
            📍 Assign
          </button>
        ` : ''}
        ${showUnassign ? `
          <button class="btn btn-small" data-action="unassign" data-buddy-id="${buddy.id}">
            ↩️
          </button>
        ` : ''}
        <button class="btn btn-small btn-upgrade" data-action="upgrade-buddy" data-buddy-id="${buddy.id}">
          ⬆️ ${formatCurrency(upgradeCost)}
        </button>
      </div>
    </div>
  `;
}

// Shop modal
function renderShopModal(state: GameState): string {
  return `
    <div class="modal shop-modal">
      <div class="modal-header">
        <h2>🛒 Upgrades</h2>
        <button class="modal-close" data-action="close-modal">✕</button>
      </div>
      <div class="modal-body">
        <div class="upgrades-list">
          ${state.upgrades.map(u => renderUpgradeItem(u)).join('')}
        </div>
      </div>
    </div>
  `;
}

// Upgrade item for shop
function renderUpgradeItem(upgrade: any): string {
  const cost = upgrade.cost * upgrade.currentLevel;
  const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
  const effectText = upgrade.effect.type === 'plot_multiplier' 
    ? `+${(upgrade.effect.value * 100).toFixed(0)}% plot power`
    : `+${(upgrade.effect.value * 100).toFixed(0)}% rare spawn`;
  
  return `
    <div class="upgrade-item ${isMaxed ? 'maxed' : ''}">
      <div class="upgrade-icon">${upgrade.id === 'plot-boost' ? '⚡' : '🍀'}</div>
      <div class="upgrade-info">
        <span class="upgrade-name">${upgrade.name}</span>
        <span class="upgrade-effect">${effectText}</span>
        <span class="upgrade-level">Level ${upgrade.currentLevel}/${upgrade.maxLevel}</span>
      </div>
      <button class="btn ${isMaxed ? 'disabled' : ''}" 
              data-action="purchase-upgrade" 
              data-upgrade-id="${upgrade.id}"
              ${isMaxed ? 'disabled' : ''}>
        ${isMaxed ? '✓ MAX' : `🪙 ${formatCurrency(cost)}`}
      </button>
    </div>
  `;
}

// Help modal
export const renderHelpModal = (): string => {
  return `
    <div class="modal help-modal">
      <div class="modal-header">
        <h2>❓ How to Play</h2>
        <button class="modal-close" data-action="close-modal">✕</button>
      </div>
      <div class="modal-body help-content">
        <div class="help-section">
          <h3>🎯 Goal</h3>
          <p>Buy buddies, assign them to plots, and earn passive income!</p>
        </div>
        <div class="help-section">
          <h3>🪙 Getting Started</h3>
          <ol>
            <li>Buy a buddy from the spawner</li>
            <li>Assign the buddy to an empty plot</li>
            <li>Collect coins as they work!</li>
          </ol>
        </div>
        <div class="help-section">
          <h3>📈 Progression</h3>
          <ul>
            <li><strong>Rarity tiers:</strong> Common → Rare → Epic → Legendary</li>
            <li><strong>Income:</strong> Higher rarity = more income</li>
            <li><strong>Upgrades:</strong> Boost plot multipliers and spawn luck</li>
          </ul>
        </div>
        <div class="help-section">
          <h3>💡 Tips</h3>
          <ul>
            <li>Offline progress is calculated when you return (50% efficiency)</li>
            <li>Upgrade plots to boost buddy income</li>
            <li>Save often - your progress is stored locally</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

// Event handlers
function handleClick(e: Event): void {
  const target = e.target as HTMLElement;
  const action = target.dataset.action;
  
  if (!action) {
    // Check parent for action
    const parent = target.closest('[data-action]');
    if (parent) {
      handleAction(parent as HTMLElement);
    }
    return;
  }
  
  handleAction(target);
}

function handleAction(target: HTMLElement): void {
  const action = target.dataset.action;
  
  switch (action) {
    case 'buy-buddy':
      Game.buyBuddy();
      break;
      
    case 'assign':
      openModal('inventory');
      break;
      
    case 'unassign':
      const buddyId = target.dataset.buddyId;
      if (buddyId) Game.unassignBuddy(buddyId);
      break;
      
    case 'upgrade-plot':
      const plotId = target.dataset.plotId;
      if (plotId) Game.upgradePlot(plotId);
      break;
      
    case 'upgrade-buddy':
      const upgradeBuddyId = target.dataset.buddyId;
      if (upgradeBuddyId) Game.upgradeBuddy(upgradeBuddyId);
      break;
      
    case 'purchase-upgrade':
      const upgradeId = target.dataset.upgradeId;
      if (upgradeId) Game.purchaseUpgrade(upgradeId);
      break;
      
    case 'open-inventory':
      openModal('inventory');
      break;
      
    case 'open-shop':
      openModal('shop');
      break;
      
    case 'open-stats':
      openModal('stats');
      break;
      
    case 'open-help':
      openModal('help');
      break;
      
    case 'close-modal':
      closeModal();
      break;
      
    case 'assign-buddy-select':
      // Show plot selection
      const selectBuddyId = target.dataset.buddyId;
      if (selectBuddyId) {
        showPlotSelector(selectBuddyId);
      }
      break;
  }
}

// Plot selector for assignment
function showPlotSelector(buddyId: string): void {
  const state = Game.getState();
  const emptyPlots = state.plots.filter(p => !p.assignedBuddyId);
  
  if (emptyPlots.length === 0) {
    alert('No empty plots available!');
    return;
  }
  
  const plotOptions = emptyPlots.map((p, i) => `Plot ${i + 1} (×${p.multiplier})`).join('\n');
  const choice = prompt(`Select a plot:\n${plotOptions}\n\nEnter plot number:`);
  
  if (choice) {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < emptyPlots.length) {
      Game.assignBuddy(buddyId, emptyPlots[index].id);
    }
  }
  
  closeModal();
}

function openModal(type: string): void {
  currentModal = type;
  render(Game.getState());
}

function closeModal(): void {
  currentModal = null;
  render(Game.getState());
}

// Keyboard shortcuts
function handleKeyboard(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    closeModal();
  }
}

// Update modal content without full re-render
export function updateModal(state: GameState): void {
  const modalBody = document.querySelector('.modal .modal-body');
  if (modalBody && currentModal) {
    switch (currentModal) {
      case 'inventory':
        modalBody.innerHTML = renderInventoryModal(state).replace(/<div class="modal-header">.*?<\/div>/s, '').replace(/<div class="modal">/, '').replace(/<\/div>$/, '');
        break;
      case 'shop':
        modalBody.innerHTML = renderShopModal(state).replace(/<div class="modal-header">.*?<\/div>/s, '').replace(/<div class="modal">/, '').replace(/<\/div>$/, '');
        break;
      case 'stats':
        modalBody.innerHTML = Components.renderStats(state);
        break;
    }
  }
}

// Force re-render
export function forceRender(): void {
  render(Game.getState());
}