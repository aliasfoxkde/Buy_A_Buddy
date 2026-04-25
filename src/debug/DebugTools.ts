/**
 * Debug Overlay - Runtime debugging UI
 */

export interface DebugMetrics {
  fps: number;
  memory: number;
  entities: number;
  events: number;
}

export type LogLevel = 'info' | 'warn' | 'error';

export interface DebugReport {
  timestamp: number;
  metrics: DebugMetrics;
  logs: LogEntry[];
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
}

export class DebugOverlay {
  private container: HTMLElement;
  private isVisible: boolean = false;
  private metricsCallback?: () => DebugMetrics;
  private updateInterval?: number;
  private intervalId?: number;
  private logs: LogEntry[] = [];
  private maxLogs: number = 50;
  
  constructor(metricsCallback?: () => DebugMetrics, updateInterval: number = 500) {
    this.metricsCallback = metricsCallback;
    this.updateInterval = updateInterval;
    
    this.container = document.createElement('div');
    this.container.id = 'debug-overlay';
    this.container.style.cssText = this.getStyles();
    
    document.body.appendChild(this.container);
    
    this.setupKeyboardShortcut();
  }
  
  private getStyles(): string {
    return `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      display: none;
      min-width: 200px;
    `;
  }
  
  private setupKeyboardShortcut(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F3') {
        this.toggle();
      }
    });
  }
  
  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
    
    if (this.isVisible && this.metricsCallback && this.updateInterval) {
      this.startUpdating();
    } else {
      this.stopUpdating();
    }
  }
  
  private startUpdating(): void {
    this.intervalId = window.setInterval(() => {
      this.update();
    }, this.updateInterval);
  }
  
  private stopUpdating(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  public update(): void {
    if (!this.isVisible || !this.metricsCallback) return;
    
    const metrics = this.metricsCallback();
    
    this.container.innerHTML = `
      <div>FPS: ${metrics.fps}</div>
      <div>Memory: ${Math.round(metrics.memory / 1024 / 1024)}MB</div>
      <div>Entities: ${metrics.entities}</div>
      <div>Events: ${metrics.events}</div>
      ${this.logs.slice(-5).map(l => `<div>[${l.level}] ${l.message}</div>`).join('')}
    `;
  }
  
  public log(level: LogLevel, message: string): void {
    this.logs.push({
      level,
      message,
      timestamp: Date.now()
    });
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    this.update();
  }
  
  public info(message: string): void {
    this.log('info', message);
  }
  
  public warn(message: string): void {
    this.log('warn', message);
  }
  
  public error(message: string): void {
    this.log('error', message);
  }
  
  public destroy(): void {
    this.stopUpdating();
    this.container.remove();
  }
}

// Create global debug instance
export const debug = new DebugOverlay();
