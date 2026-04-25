/**
 * Events System Module
 * Event queue, history, and performance tracking
 */

import { EventBus, GameEvent, GameEventType } from '../../core';

export interface EventQueueItem {
  event: GameEvent;
  priority: number;
  scheduledTime: number;
  executed: boolean;
}

export interface EventFilter {
  types?: GameEventType[];
  sources?: string[];
  timeRange?: { start: number; end: number };
}

export interface EventStats {
  totalEvents: number;
  eventsByType: Map<GameEventType, number>;
  averagePerSecond: number;
  peakPerSecond: number;
  slowestHandler: { type: GameEventType; duration: number } | null;
}

export class EventQueue {
  private queue: EventQueueItem[] = [];
  private processing: boolean = false;

  add(event: GameEvent, priority: number = 0, delay: number = 0): void {
    this.queue.push({
      event,
      priority,
      scheduledTime: Date.now() + delay,
      executed: false
    });
    
    // Sort by priority (higher first)
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  process(eventBus: EventBus): void {
    if (this.processing) return;
    this.processing = true;

    const now = Date.now();
    const toProcess = this.queue.filter(
      item => !item.executed && item.scheduledTime <= now
    );

    for (const item of toProcess) {
      item.executed = true;
      eventBus.emit(item.event.type, item.event.payload);
    }

    // Remove executed items
    this.queue = this.queue.filter(item => !item.executed);
    this.processing = false;
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }
}

export class EventHistory {
  private history: GameEvent[] = [];
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  add(event: GameEvent): void {
    this.history.push(event);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
  }

  get(filter?: EventFilter): GameEvent[] {
    let events = [...this.history];

    if (filter?.types?.length) {
      events = events.filter(e => filter.types!.includes(e.type));
    }

    if (filter?.timeRange) {
      events = events.filter(
        e => e.timestamp >= filter.timeRange!.start && 
             e.timestamp <= filter.timeRange!.end
      );
    }

    return events;
  }

  clear(): void {
    this.history = [];
  }

  size(): number {
    return this.history.length;
  }
}

export class EventStatsTracker {
  private eventsByType: Map<GameEventType, number> = new Map();
  private eventTimes: number[] = [];
  private handlerTimes: Map<string, number[]> = new Map();
  private totalEvents: number = 0;
  private startTime: number = Date.now();

  record(event: GameEvent, handlerDuration: number = 0): void {
    this.totalEvents++;
    
    const count = this.eventsByType.get(event.type) || 0;
    this.eventsByType.set(event.type, count + 1);

    if (handlerDuration > 0) {
      const key = event.type;
      const times = this.handlerTimes.get(key) || [];
      times.push(handlerDuration);
      if (times.length > 100) times.shift(); // Keep last 100
      this.handlerTimes.set(key, times);
    }

    // Track events per second
    this.eventTimes.push(Date.now());
  }

  getStats(): EventStats {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const avgPerSecond = elapsed > 0 ? this.totalEvents / elapsed : 0;

    // Calculate peak per second
    const oneSecondAgo = Date.now() - 1000;
    const recentEvents = this.eventTimes.filter(t => t >= oneSecondAgo);
    const peakPerSecond = Math.max(recentEvents.length, avgPerSecond);

    // Find slowest handler
    let slowest: { type: GameEventType; duration: number } | null = null;
    for (const [type, times] of this.handlerTimes) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      if (!slowest || avg > slowest.duration) {
        slowest = { type: type as GameEventType, duration: avg };
      }
    }

    return {
      totalEvents: this.totalEvents,
      eventsByType: this.eventsByType,
      averagePerSecond: avgPerSecond,
      peakPerSecond: peakPerSecond,
      slowestHandler: slowest
    };
  }

  reset(): void {
    this.eventsByType.clear();
    this.eventTimes = [];
    this.handlerTimes.clear();
    this.totalEvents = 0;
    this.startTime = Date.now();
  }
}

export class EventSystem {
  private eventBus: EventBus;
  private history: EventHistory;
  private queue: EventQueue;
  private stats: EventStatsTracker;
  private listeners: Map<string, number> = new Map(); // eventType -> call count

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.history = new EventHistory();
    this.queue = new EventQueue();
    this.stats = new EventStatsTracker();

    // Hook into event bus
    this.setupEventLogging();
  }

  private setupEventLogging(): void {
    // We can't directly hook, but we can wrap emit
    const originalEmit = this.eventBus.emit.bind(this.eventBus);
    
    this.eventBus.emit = (type: GameEventType, payload?: unknown) => {
      const event: GameEvent = {
        type,
        payload: payload || {},
        timestamp: Date.now()
      };
      
      this.history.add(event);
      this.stats.record(event);
      
      const count = this.listeners.get(type) || 0;
      this.listeners.set(type, count + 1);
      
      originalEmit(type, payload);
    };
  }

  // Schedule event for future
  schedule(type: GameEventType, payload: unknown, delayMs: number, priority: number = 0): void {
    const event: GameEvent = {
      type,
      payload,
      timestamp: Date.now()
    };
    this.queue.add(event, priority, delayMs);
  }

  // Process scheduled events
  processQueue(): void {
    this.queue.process(this.eventBus);
  }

  // Get event history
  getHistory(filter?: EventFilter): GameEvent[] {
    return this.history.get(filter);
  }

  // Get statistics
  getStats(): EventStats {
    return this.stats.getStats();
  }

  // Get listener call counts
  getListenerCounts(): Map<string, number> {
    return this.listeners;
  }

  // Find events by payload content
  findEvents(predicate: (event: GameEvent) => boolean): GameEvent[] {
    return this.history.get().filter(predicate);
  }

  // Get recent events
  getRecentEvents(count: number = 10): GameEvent[] {
    return this.history.get().slice(-count);
  }

  // Get events by type
  getEventsByType(type: GameEventType): GameEvent[] {
    return this.history.get({ types: [type] });
  }

  // Clear history
  clearHistory(): void {
    this.history.clear();
  }

  // Reset statistics
  resetStats(): void {
    this.stats.reset();
  }
}
