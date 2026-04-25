// ==========================================
// DEBUG OVERLAY - Runtime debugging UI
// ==========================================

import { LogLevel, type DebugMetrics, type DebugReport } from '../systems/GameSystems';

export class DebugOverlay {
  private container: HTMLElement;
  private isVisible: boolean = false;
  private updateInterval: number;
  private metricsCallback: () => DebugMetrics;
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor(
    metricsCallback: () => DebugMetrics,
    updateInterval: number = 500
  ) {
    this.metricsCallback = metricsCallback;
    this.updateInterval = updateInterval;
    
    this.container = document.createElement('div');
    this.container.id = 'debug-overlay';
    this.container.innerHTML = this.getStyles();
    
    document.body.appendChild(this.container);
    
    this.setupKeyboardShortcut();
  }

  private getStyles(): string {
    return `
      <style>
        #debug-overlay {
          position: fixed;
          top: 10px;
          right: 10px;
          width: 320px;
          max-height: 400px;
          background: rgba(10, 10, 26, 0.95);
          border: 2px solid #a855f7;
          border-radius: 12px;
          color: #fff;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          z-index: 99999;
          display: none;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }
        
        #debug-overlay.visible {
          display: block;
        }
        
        #debug-overlay .header {
          background: linear-gradient(135deg, #6B21A8, #a855f7);
          padding: 10px 15px;
          font-weight: bold;
          cursor: move;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        #debug-overlay .header h3 {
          margin: 0;
          font-size: 14px;
        }
        
        #debug-overlay .close-btn {
          background: #ef4444;
          border: none;
          color: white;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        
        #debug-overlay .content {
          padding: 10px;
          max-height: 350px;
          overflow-y: auto;
        }
        
        #debug-overlay .section {
          margin-bottom: 15px;
        }
        
        #debug-overlay .section-title {
          color: #a855f7;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 5px;
          border-bottom: 1px solid #2d1b4e;
          padding-bottom: 3px;
        }
        
        #debug-overlay .metric {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
        }
        
        #debug-overlay .metric-label {
          color: #a78bfa;
        }
        
        #debug-overlay .metric-value {
          color: #22c55e;
          font-weight: bold;
        }
        
        #debug-overlay .metric-value.warning {
          color: #f59e0b;
        }
        
        #debug-overlay .metric-value.error {
          color: #ef4444;
        }
        
        #debug-overlay .fps-bar {
          height: 4px;
          background: #2d1b4e;
          border-radius: 2px;
          margin-top: 5px;
          overflow: hidden;
        }
        
        #debug-overlay .fps-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #f59e0b, #ef4444);
          transition: width 0.1s;
        }
        
        #debug-overlay .log-entry {
          padding: 4px 8px;
          margin: 2px 0;
          border-radius: 4px;
          font-size: 11px;
        }
        
        #debug-overlay .log-debug { background: #1e3a5f; }
        #debug-overlay .log-info { background: #1a4a3a; }
        #debug-overlay .log-warn { background: #5a4a1a; color: #fbbf24; }
        #debug-overlay .log-error { background: #5a1a1a; color: #ef4444; }
        
        #debug-overlay .actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px;
          margin-top: 10px;
        }
        
        #debug-overlay .action-btn {
          background: #2d1b4e;
          border: 1px solid #6B21A8;
          color: #fff;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
        }
        
        #debug-overlay .action-btn:hover {
          background: #6B21A8;
          transform: scale(1.02);
        }
        
        #debug-overlay .action-btn.danger {
          border-color: #ef4444;
        }
        
        #debug-overlay .action-btn.danger:hover {
          background: #ef4444;
        }
      </style>
      <div class="header">
        <h3>🐛 Debug Tools</h3>
        <button class="close-btn" onclick="document.getElementById('debug-overlay').classList.remove('visible')">✕</button>
      </div>
      <div class="content">
        <div class="section">
          <div class="section-title">Performance</div>
          <div class="metric">
            <span class="metric-label">FPS</span>
            <span class="metric-value" id="debug-fps">60</span>
          </div>
          <div class="fps-bar">
            <div class="fps-fill" id="debug-fps-bar" style="width: 100%"></div>
          </div>
          <div class="metric">
            <span class="metric-label">Frame Time</span>
            <span class="metric-value" id="debug-frame-time">16.67ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">Entities</span>
            <span class="metric-value" id="debug-entities">0</span>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Quick Actions</div>
          <div class="actions">
            <button class="action-btn" onclick="window.__debugAddCoins(100)">+100 Coins</button>
            <button class="action-btn" onclick="window.__debugSpawnBuddy()">Spawn Buddy</button>
            <button class="action-btn" onclick="window.__debugLevelUp()">+1 Level</button>
            <button class="action-btn" onclick="window.__debugToggleGrid()">Grid</button>
            <button class="action-btn" onclick="window.__debugShowFPS()">FPS Only</button>
            <button class="action-btn danger" onclick="window.__debugResetGame()">Reset</button>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Console Log</div>
          <div id="debug-logs"></div>
        </div>
      </div>
    `;
  }

  private setupKeyboardShortcut(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D to toggle
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.classList.toggle('visible', this.isVisible);
    
    if (this.isVisible) {
      this.startUpdating();
    }
  }

  show(): void {
    this.isVisible = true;
    this.container.classList.add('visible');
    this.startUpdating();
  }

  hide(): void {
    this.isVisible = false;
    this.container.classList.remove('visible');
  }

  private startUpdating(): void {
    this.updateMetrics();
    
    // Update at interval
    setInterval(() => {
      if (this.isVisible) {
        this.updateMetrics();
      }
    }, this.updateInterval);
  }

  private updateMetrics(): void {
    const metrics = this.metricsCallback();
    
    // Update FPS
    const fpsEl = document.getElementById('debug-fps');
    const fpsBar = document.getElementById('debug-fps-bar');
    if (fpsEl) {
      fpsEl.textContent = metrics.fps.toFixed(1);
      fpsEl.className = `metric-value ${metrics.fps < 30 ? 'error' : metrics.fps < 50 ? 'warning' : ''}`;
    }
    if (fpsBar) {
      fpsBar.style.width = `${Math.min(100, (metrics.fps / 60) * 100)}%`;
    }
    
    // Update frame time
    const frameTimeEl = document.getElementById('debug-frame-time');
    if (frameTimeEl) {
      frameTimeEl.textContent = `${metrics.frameTime.toFixed(2)}ms`;
      frameTimeEl.className = `metric-value ${metrics.frameTime > 20 ? 'warning' : ''}`;
    }
    
    // Update entities
    const entitiesEl = document.getElementById('debug-entities');
    if (entitiesEl) {
      entitiesEl.textContent = metrics.entities.toString();
    }
  }

  addLog(level: LogLevel, message: string): void {
    this.logs.push({ level, message, timestamp: Date.now() });
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    this.updateLogDisplay();
  }

  private updateLogDisplay(): void {
    const logsContainer = document.getElementById('debug-logs');
    if (!logsContainer) return;
    
    const levelNames = ['debug', 'info', 'warn', 'error'];
    
    logsContainer.innerHTML = this.logs
      .slice(-10)
      .map(log => `<div class="log-entry log-${levelNames[log.level]}">${log.message}</div>`)
      .join('');
  }

  /**
   * Update display from a debug report
   */
  updateFromReport(report: DebugReport): void {
    // Can be extended to show more detailed info
  }

  destroy(): void {
    this.container.remove();
  }
}

// ==========================================
// PERFORMANCE MONITOR
// ==========================================

export class PerformanceMonitor {
  private fps: number = 60;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private frameTimes: number[] = [];
  private maxFrameTimes: number = 60;

  startFrame(): void {
    this.frameCount++;
  }

  endFrame(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    this.frameTimes.push(delta);
    if (this.frameTimes.length > this.maxFrameTimes) {
      this.frameTimes.shift();
    }
    
    // Calculate FPS
    if (this.frameCount >= 10) {
      this.fps = (this.frameCount * 1000) / delta;
      this.frameCount = 0;
    }
  }

  getMetrics(): PerformanceMetrics {
    const avgFrameTime = this.frameTimes.length > 0
      ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
      : 16.67;
    
    const maxFrameTime = this.frameTimes.length > 0
      ? Math.max(...this.frameTimes)
      : 16.67;
    
    return {
      fps: Math.round(this.fps),
      frameTime: avgFrameTime,
      minFrameTime: this.frameTimes.length > 0 ? Math.min(...this.frameTimes) : 16.67,
      maxFrameTime,
      memory: 0,
      entities: 0,
      drawCalls: 0,
    };
  }
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  minFrameTime: number;
  maxFrameTime: number;
  memory: number;
  entities: number;
  drawCalls: number;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
}

// ==========================================
// INPUT VALIDATOR - Validate user input
// ==========================================

export class InputValidator {
  /**
   * Validate keyboard input for movement
   */
  validateMovement(keys: { up?: boolean; down?: boolean; left?: boolean; right?: boolean }): ValidatedMovement {
    const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      return {
        dx: dx * 0.707,
        dy: dy * 0.707,
        magnitude: 1,
        isValid: true,
      };
    }
    
    return {
      dx,
      dy,
      magnitude: Math.abs(dx) + Math.abs(dy),
      isValid: true,
    };
  }

  /**
   * Validate touch joystick input
   */
  validateJoystick(
    touchX: number,
    touchY: number,
    centerX: number,
    centerY: number,
    maxRadius: number
  ): ValidatedJoystick {
    const dx = touchX - centerX;
    const dy = touchY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Clamp to max radius
    const clampedDistance = Math.min(distance, maxRadius);
    
    // Normalize
    const normalizedDistance = distance > 0 ? clampedDistance / distance : 0;
    const normalizedX = distance > 0 ? dx / distance : 0;
    const normalizedY = distance > 0 ? dy / distance : 0;
    
    return {
      dx: normalizedX * normalizedDistance,
      dy: normalizedY * normalizedDistance,
      distance: clampedDistance,
      normalizedDistance: clampedDistance / maxRadius,
      isValid: distance <= maxRadius * 1.5, // Allow slightly beyond for feedback
      raw: { x: dx, y: dy },
    };
  }

  /**
   * Validate click/tap on game object
   */
  validateClick(
    clickX: number,
    clickY: number,
    targetBounds: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      clickX >= targetBounds.x &&
      clickX <= targetBounds.x + targetBounds.width &&
      clickY >= targetBounds.y &&
      clickY <= targetBounds.y + targetBounds.height
    );
  }

  /**
   * Validate swipe gesture
   */
  validateSwipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    minDistance: number
  ): ValidatedSwipe | null {
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < minDistance) {
      return null;
    }
    
    // Determine swipe direction
    let direction: 'up' | 'down' | 'left' | 'right';
    
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }
    
    return {
      direction,
      distance,
      angle: Math.atan2(dy, dx) * (180 / Math.PI),
      startX,
      startY,
      endX,
      endY,
      isValid: true,
    };
  }
}

export interface ValidatedMovement {
  dx: number;
  dy: number;
  magnitude: number;
  isValid: boolean;
}

export interface ValidatedJoystick {
  dx: number;
  dy: number;
  distance: number;
  normalizedDistance: number;
  isValid: boolean;
  raw: { x: number; y: number };
}

export interface ValidatedSwipe {
  direction: 'up' | 'down' | 'left' | 'right';
  distance: number;
  angle: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isValid: boolean;
}

// ==========================================
// AUDIT SYSTEM - Code quality checks
// ==========================================

export class CodeAuditor {
  private issues: AuditIssue[] = [];

  /**
   * Audit game state for potential issues
   */
  auditGameState(state: any): AuditReport {
    this.issues = [];
    
    this.checkPlayerData(state);
    this.checkBuddies(state);
    this.checkPlots(state);
    this.checkInventory(state);
    
    return {
      timestamp: Date.now(),
      issues: this.issues,
      summary: {
        critical: this.issues.filter(i => i.severity === 'critical').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
        info: this.issues.filter(i => i.severity === 'info').length,
      },
    };
  }

  private checkPlayerData(state: any): void {
    if (!state.player) {
      this.addIssue('critical', 'Player data missing');
      return;
    }
    
    if (state.player.coins < 0) {
      this.addIssue('critical', 'Negative coins detected', { coins: state.player.coins });
    }
    
    if (state.player.level < 1) {
      this.addIssue('critical', 'Invalid player level', { level: state.player.level });
    }
    
    if (state.player.xp < 0) {
      this.addIssue('warning', 'Negative XP detected', { xp: state.player.xp });
    }
  }

  private checkBuddies(state: any): void {
    if (!state.buddies) return;
    
    for (const buddy of state.buddies) {
      if (buddy.level < 1) {
        this.addIssue('critical', 'Buddy with invalid level', { id: buddy.id, level: buddy.level });
      }
      
      if (buddy.baseIncome < 0) {
        this.addIssue('critical', 'Buddy with negative income', { id: buddy.id });
      }
      
      // Check for duplicate IDs
      const duplicates = state.buddies.filter(b => b.id === buddy.id);
      if (duplicates.length > 1) {
        this.addIssue('critical', 'Duplicate buddy ID', { id: buddy.id });
      }
    }
  }

  private checkPlots(state: any): void {
    if (!state.plots) return;
    
    for (const plot of state.plots) {
      if (plot.multiplier <= 0) {
        this.addIssue('warning', 'Invalid plot multiplier', { id: plot.id });
      }
      
      // Check for orphaned buddy references
      if (plot.buddyId) {
        const buddy = state.buddies?.find((b: any) => b.id === plot.buddyId);
        if (!buddy) {
          this.addIssue('critical', 'Plot references non-existent buddy', { 
            plotId: plot.id, 
            buddyId: plot.buddyId 
          });
        }
      }
    }
  }

  private checkInventory(state: any): void {
    if (!state.inventory) return;
    
    for (const item of state.inventory) {
      if (item.quantity < 0) {
        this.addIssue('critical', 'Negative item quantity', { id: item.id });
      }
      
      if (item.quantity > item.maxStack) {
        this.addIssue('warning', 'Item exceeds max stack', { id: item.id });
      }
    }
  }

  private addIssue(severity: 'critical' | 'warning' | 'info', message: string, data?: any): void {
    this.issues.push({ severity, message, data, timestamp: Date.now() });
  }
}

export interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  data?: any;
  timestamp: number;
}

export interface AuditReport {
  timestamp: number;
  issues: AuditIssue[];
  summary: {
    critical: number;
    warnings: number;
    info: number;
  };
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19);
}