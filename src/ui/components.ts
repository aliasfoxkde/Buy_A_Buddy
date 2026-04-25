// ==========================================
// UI COMPONENTS - Game UI Elements
// ==========================================

import { GameState, Buddy, Plot, RARITY_CONFIG } from '../game/types';
import { formatCurrency, calculateIncomePerSecond } from '../systems/economy';
import { getSpawnCost, getBuddyUpgradeCost, getPlotUpgradeCost } from '../systems/spawner';


// HUD Component
export function renderHUD(state: GameState): string {
  const income = calculateIncomePerSecond(state);
  
  return `
    <div class="hud">
      <div class="currency-display">
        <span class="coin-icon">🪙</span>
        <span class="currency-amount">${formatCurrency(state.currency)}</span>
      </div>
      <div class="income-display">
        <span class="income-icon">📈</span>
        <span>${formatCurrency(income)}/sec</span>
      </div>
    </div>
  `;
}

// Plot component
export function renderPlot(plot: Plot, assignedBuddy: Buddy | undefined): string {
  const upgradeCost = getPlotUpgradeCost(plot);
  const canUpgrade = assignedBuddy !== undefined;
  
  return `
    <div class="plot ${assignedBuddy ? 'occupied' : 'empty'}" data-plot-id="${plot.id}">
      <div class="plot-level">Lv ${plot.level}</div>
      <div class="plot-buddy">
        ${assignedBuddy ? `
          <div class="buddy ${assignedBuddy.rarity}" data-buddy-id="${assignedBuddy.id}">
            <span class="buddy-emoji">${assignedBuddy.emoji}</span>
            <div class="buddy-info">
              <span class="buddy-name">${assignedBuddy.name}</span>
              <span class="buddy-level">Lv ${assignedBuddy.level}</span>
            </div>
          </div>
        ` : `
          <div class="empty-plot">
            <span class="plus-icon">+</span>
            <span class="hint">Assign buddy</span>
          </div>
        `}
      </div>
      <div class="plot-multiplier">×${plot.multiplier.toFixed(1)}</div>
      <button class="upgrade-btn ${canUpgrade ? '' : 'disabled'}" 
              data-action="upgrade-plot" 
              data-plot-id="${plot.id}"
              ${!canUpgrade ? 'disabled' : ''}>
        <span class="btn-icon">⬆️</span>
        <span class="btn-cost">${formatCurrency(upgradeCost)}</span>
      </button>
    </div>
  `;
}

// Buddy inventory item
export function renderBuddyItem(buddy: Buddy, canAssign: boolean = true): string {
  const upgradeCost = getBuddyUpgradeCost(buddy);
  
  return `
    <div class="buddy-item ${buddy.rarity}" data-buddy-id="${buddy.id}">
      <div class="buddy-info">
        <span class="buddy-emoji">${buddy.emoji}</span>
        <div class="buddy-details">
          <span class="buddy-name">${buddy.name}</span>
          <span class="buddy-level">Lv ${buddy.level}</span>
        </div>
      </div>
      <div class="buddy-actions">
        ${canAssign && !buddy.assignedPlotId ? `
          <button class="assign-btn" data-action="assign-buddy" data-buddy-id="${buddy.id}">
            📍 Assign
          </button>
        ` : ''}
        ${buddy.assignedPlotId ? `
          <button class="unassign-btn" data-action="unassign-buddy" data-buddy-id="${buddy.id}">
            ↩️
          </button>
        ` : ''}
        <button class="upgrade-btn" data-action="upgrade-buddy" data-buddy-id="${buddy.id}">
          ⬆️ ${formatCurrency(upgradeCost)}
        </button>
      </div>
    </div>
  `;
}

// Upgrade card
export function renderUpgradeCard(upgrade: any): string {
  const cost = upgrade.cost * upgrade.currentLevel;
  const isMaxed = upgrade.currentLevel >= upgrade.maxLevel;
  
  return `
    <div class="upgrade-card" data-upgrade-id="${upgrade.id}">
      <div class="upgrade-icon">${upgrade.id === 'plot-boost' ? '⚡' : '🍀'}</div>
      <div class="upgrade-info">
        <span class="upgrade-name">${upgrade.name}</span>
        <span class="upgrade-desc">${upgrade.description}</span>
        <span class="upgrade-level">Level ${upgrade.currentLevel}/${upgrade.maxLevel}</span>
      </div>
      <button class="buy-btn ${isMaxed ? 'maxed' : ''}" 
              data-action="purchase-upgrade" 
              data-upgrade-id="${upgrade.id}"
              ${isMaxed ? 'disabled' : ''}>
        ${isMaxed ? 'MAX' : `🪙 ${formatCurrency(cost)}`}
      </button>
    </div>
  `;
}

// Spawner button
export function renderSpawner(state: GameState): string {
  const cost = getSpawnCost(state.buddies.length);
  const canAfford = state.currency >= cost;
  
  return `
    <div class="spawner-section">
      <button class="spawn-btn ${canAfford ? '' : 'disabled'}" 
              data-action="buy-buddy"
              ${!canAfford ? 'disabled' : ''}>
        <span class="spawn-icon">🎁</span>
        <span class="spawn-text">Buy Buddy</span>
        <span class="spawn-cost">🪙 ${formatCurrency(cost)}</span>
      </button>
      <div class="spawn-info">
        <div class="rarity-chances">
          ${RARITY_CONFIG.map(r => `
            <span class="rarity-badge ${r.name}">
              ${r.emoji} ${r.chance}%
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Modal container
export function renderModal(title: string, content: string): string {
  return `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close" data-action="close-modal">✕</button>
        </div>
        <div class="modal-content">
          ${content}
        </div>
      </div>
    </div>
  `;
}

// Stats panel
export function renderStats(state: GameState): string {
  return `
    <div class="stats-panel">
      <h3>📊 Statistics</h3>
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-label">Total Earned</span>
          <span class="stat-value">🪙 ${formatCurrency(state.moneyEarned)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Buddies Bought</span>
          <span class="stat-value">${state.buddiesBought}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Session Earned</span>
          <span class="stat-value">🪙 ${formatCurrency(state.stats.sessionEarned)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Active Income</span>
          <span class="stat-value">${formatCurrency(calculateIncomePerSecond(state))}/s</span>
        </div>
      </div>
    </div>
  `;
}

// Shop modal content
export function renderShopModal(state: GameState): string {
  return `
    <div class="shop-modal">
      <h3>🛒 Upgrades</h3>
      <div class="upgrades-list">
        ${state.upgrades.map(u => renderUpgradeCard(u)).join('')}
      </div>
    </div>
  `;
}

// Inventory modal content
export function renderInventoryModal(state: GameState): string {
  const unassigned = state.buddies.filter(b => !b.assignedPlotId);
  
  return `
    <div class="inventory-modal">
      <h3>🎒 Inventory (${unassigned.length} available)</h3>
      ${unassigned.length === 0 ? `
        <div class="empty-inventory">
          <p>No unassigned buddies! Buy more from the shop.</p>
        </div>
      ` : `
        <div class="buddies-list">
          ${unassigned.map(b => renderBuddyItem(b, true)).join('')}
        </div>
      `}
    </div>
  `;
}