/**
 * AI System Module
 * Enemy AI behaviors including patrol, chase, attack, and flee
 */

import { EventBus, Vector2, generateId, distance } from '../../core';

export type AIState = 'idle' | 'patrol' | 'chase' | 'attack' | 'flee' | 'wander' | 'guard';

export interface AIGoal {
  type: 'patrol' | 'chase' | 'flee' | 'guard' | 'explore';
  targetPosition?: Vector2;
  targetId?: string;
  priority: number;
}

export interface AIBehavior {
  state: AIState;
  previousState: AIState;
  targetPosition?: Vector2;
  targetEntityId?: string;
  stateTime: number;
  lastAction?: string;
}

export interface PatrolPoint {
  position: Vector2;
  waitTime: number;
}

export interface AIConfig {
  entityId: string;
  
  // State machine config
  initialState: AIState;
  aggroRange: number;        // How close player needs to be to aggro
  deaggroRange: number;      // How far player needs to go to deaggro
  chaseRange: number;         // How far AI will chase
  
  // Behavior flags
  canChase: boolean;
  canFlee: boolean;
  canPatrol: boolean;
  canWander: boolean;
  
  // Combat
  healthFleeThreshold: number; // HP % at which AI will try to flee
  
  // Patrol
  patrolPoints?: PatrolPoint[];
  patrolWaitTime: number;
  
  // Timing
  decisionInterval: number;   // How often AI makes decisions
  attackRange: number;
  attackCooldown: number;
}

export interface AIAction {
  type: 'move' | 'attack' | 'cast' | 'flee' | 'wait';
  target?: Vector2 | string;
  skillId?: string;
  duration?: number;
}

type AICallback = (action: AIAction) => void;

export class AIBrain {
  private config: AIConfig;
  private behavior: AIBehavior;
  private eventBus: EventBus;
  private callback: AICallback | null = null;
  private lastDecision: number = 0;
  private lastAttack: number = 0;
  private patrolIndex: number = 0;
  private wanderTarget?: Vector2;

  constructor(config: AIConfig, eventBus: EventBus) {
    this.config = config;
    this.eventBus = eventBus;
    this.behavior = {
      state: config.initialState,
      previousState: 'idle',
      stateTime: 0
    };
  }

  setCallback(cb: AICallback): void {
    this.callback = cb;
  }

  update(deltaTime: number, selfPosition: Vector2, playerPosition?: Vector2, playerHealth?: number): void {
    this.behavior.stateTime += deltaTime;

    // Make decisions at intervals
    if (this.behavior.stateTime - this.lastDecision >= this.config.decisionInterval) {
      this.lastDecision = this.behavior.stateTime;
      this.makeDecision(selfPosition, playerPosition, playerHealth);
    }
  }

  private makeDecision(selfPosition: Vector2, playerPosition?: Vector2, playerHealth?: number): void {
    const distToPlayer = playerPosition 
      ? distance(selfPosition, playerPosition) 
      : Infinity;

    switch (this.behavior.state) {
      case 'idle':
        this.decideIdle(distToPlayer, playerPosition);
        break;
        
      case 'patrol':
        this.decidePatrol(selfPosition);
        break;
        
      case 'chase':
        this.decideChase(distToPlayer, selfPosition, playerPosition, playerHealth);
        break;
        
      case 'attack':
        this.decideAttack(selfPosition, playerPosition);
        break;
        
      case 'flee':
        this.decideFlee(selfPosition, distToPlayer, playerPosition);
        break;
        
      case 'wander':
        this.decideWander(selfPosition);
        break;
    }
  }

  private decideIdle(distToPlayer: number, playerPosition?: Vector2): void {
    // Check for aggro
    if (this.config.canChase && distToPlayer <= this.config.aggroRange) {
      this.changeState('chase');
      this.behavior.targetPosition = playerPosition;
      this.behavior.targetEntityId = 'player';
      return;
    }

    // Go to patrol if we have patrol points
    if (this.config.canPatrol && this.config.patrolPoints && this.config.patrolPoints.length > 0) {
      this.changeState('patrol');
      return;
    }

    // Otherwise wander
    if (this.config.canWander) {
      this.changeState('wander');
      return;
    }
  }

  private decidePatrol(selfPosition: Vector2): void {
    if (!this.config.patrolPoints || this.config.patrolPoints.length === 0) {
      this.changeState('idle');
      return;
    }

    const target = this.config.patrolPoints[this.patrolIndex];
    const dist = distance(selfPosition, target.position);

    if (dist < 10) {
      // Wait at patrol point
      this.executeAction({ type: 'wait', duration: this.config.patrolWaitTime });
      
      // Move to next point
      this.patrolIndex = (this.patrolIndex + 1) % this.config.patrolPoints.length;
    } else {
      // Move toward patrol point
      this.executeAction({ type: 'move', target: target.position });
    }
  }

  private decideChase(distToPlayer: number, selfPosition: Vector2, playerPosition?: Vector2, playerHealth?: number): void {
    // Lost player - deaggro
    if (distToPlayer > this.config.deaggroRange) {
      this.changeState('idle');
      this.behavior.targetPosition = undefined;
      this.behavior.targetEntityId = undefined;
      return;
    }

    // Check if should flee
    if (this.config.canFlee && playerHealth !== undefined) {
      const healthPercent = playerHealth / 100; // Assuming max health of 100
      if (healthPercent <= this.config.healthFleeThreshold / 100) {
        this.changeState('flee');
        return;
      }
    }

    // In attack range
    if (distToPlayer <= this.config.attackRange) {
      this.changeState('attack');
      return;
    }

    // Continue chasing
    if (playerPosition) {
      this.executeAction({ type: 'move', target: playerPosition });
    }
  }

  private decideAttack(selfPosition: Vector2, playerPosition?: Vector2): void {
    if (!playerPosition) {
      this.changeState('idle');
      return;
    }

    const dist = distance(selfPosition, playerPosition);
    const now = Date.now();

    // Check if can attack
    if (dist <= this.config.attackRange && now - this.lastAttack >= this.config.attackCooldown * 1000) {
      this.lastAttack = now;
      this.executeAction({ type: 'attack', target: 'player' });
      return;
    }

    // Too far - chase again
    if (dist > this.config.attackRange) {
      this.changeState('chase');
      return;
    }

    // Wait between attacks
    this.executeAction({ type: 'wait', duration: 0.5 });
  }

  private decideFlee(selfPosition: Vector2, distToPlayer: number, playerPosition?: Vector2): void {
    // If player is far enough, stop fleeing
    if (distToPlayer > this.config.deaggroRange * 2) {
      this.changeState('idle');
      return;
    }

    // Run away from player
    if (playerPosition) {
      const dx = selfPosition.x - playerPosition.x;
      const dy = selfPosition.y - playerPosition.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      
      if (len > 0) {
        const fleePos: Vector2 = {
          x: selfPosition.x + (dx / len) * 100,
          y: selfPosition.y + (dy / len) * 100
        };
        this.executeAction({ type: 'flee', target: fleePos });
      }
    }
  }

  private decideWander(selfPosition: Vector2): void {
    // Set random wander target if needed
    if (!this.wanderTarget) {
      this.wanderTarget = {
        x: selfPosition.x + (Math.random() - 0.5) * 200,
        y: selfPosition.y + (Math.random() - 0.5) * 200
      };
    }

    const dist = distance(selfPosition, this.wanderTarget);

    if (dist < 10) {
      // Reached wander target, idle for a bit
      this.executeAction({ type: 'wait', duration: 2 });
      this.wanderTarget = undefined;
      this.changeState('idle');
    } else {
      this.executeAction({ type: 'move', target: this.wanderTarget });
    }
  }

  private changeState(newState: AIState): void {
    if (this.behavior.state !== newState) {
      this.behavior.previousState = this.behavior.state;
      this.behavior.state = newState;
      this.behavior.stateTime = 0;
      
      this.eventBus.emit('ai:state_change', {
        entityId: this.config.entityId,
        from: this.behavior.previousState,
        to: newState
      });
    }
  }

  private executeAction(action: AIAction): void {
    this.behavior.lastAction = action.type;
    
    if (this.callback) {
      this.callback(action);
    }
    
    this.eventBus.emit('ai:action', {
      entityId: this.config.entityId,
      action
    });
  }

  getState(): AIState {
    return this.behavior.state;
  }

  getBehavior(): AIBehavior {
    return { ...this.behavior };
  }

  forceState(state: AIState): void {
    this.changeState(state);
  }
}

export class AISystem {
  private eventBus: EventBus;
  private brains: Map<string, AIBrain> = new Map();
  private entities: Map<string, { position: Vector2; health?: number }> = new Map();
  private playerPosition?: Vector2;
  private playerHealth?: number;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  registerEntity(entityId: string, config: Partial<AIConfig>, initialPosition: Vector2): void {
    const fullConfig: AIConfig = {
      entityId,
      initialState: config.initialState || 'idle',
      aggroRange: config.aggroRange || 100,
      deaggroRange: config.deaggroRange || 200,
      chaseRange: config.chaseRange || 150,
      canChase: config.canChase ?? true,
      canFlee: config.canFlee ?? false,
      canPatrol: config.canPatrol ?? false,
      canWander: config.canWander ?? true,
      healthFleeThreshold: config.healthFleeThreshold || 20,
      patrolWaitTime: config.patrolWaitTime || 2,
      decisionInterval: config.decisionInterval || 0.5,
      attackRange: config.attackRange || 50,
      attackCooldown: config.attackCooldown || 1,
      patrolPoints: config.patrolPoints,
      ...config
    };

    const brain = new AIBrain(fullConfig, this.eventBus);
    brain.setCallback((action) => this.handleAction(entityId, action));
    
    this.brains.set(entityId, brain);
    this.entities.set(entityId, { position: initialPosition });
  }

  unregisterEntity(entityId: string): void {
    this.brains.delete(entityId);
    this.entities.delete(entityId);
  }

  setPlayerState(position: Vector2, health?: number): void {
    this.playerPosition = position;
    this.playerHealth = health;
  }

  updateEntityPosition(entityId: string, position: Vector2, health?: number): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.position = position;
      if (health !== undefined) {
        entity.health = health;
      }
    }
  }

  update(deltaTime: number): void {
    for (const [entityId, brain] of this.brains) {
      const entity = this.entities.get(entityId);
      if (entity) {
        brain.update(deltaTime, entity.position, this.playerPosition, this.playerHealth);
      }
    }
  }

  private handleAction(entityId: string, action: AIAction): void {
    switch (action.type) {
      case 'move':
        this.eventBus.emit('ai:move', { entityId, target: action.target });
        break;
      case 'attack':
        this.eventBus.emit('ai:attack', { entityId, target: action.target });
        break;
      case 'flee':
        this.eventBus.emit('ai:flee', { entityId, from: this.playerPosition });
        break;
      case 'wait':
        // Just wait, no event needed
        break;
      case 'cast':
        this.eventBus.emit('ai:cast', { entityId, skillId: action.skillId, target: action.target });
        break;
    }
  }

  getBrain(entityId: string): AIBrain | undefined {
    return this.brains.get(entityId);
  }

  getAllStates(): Map<string, AIState> {
    const states = new Map<string, AIState>();
    for (const [entityId, brain] of this.brains) {
      states.set(entityId, brain.getState());
    }
    return states;
  }

  forceState(entityId: string, state: AIState): void {
    const brain = this.brains.get(entityId);
    if (brain) {
      brain.forceState(state);
    }
  }
}

// ==========================================
// DEFAULT AI CONFIGS
// ==========================================

export const DEFAULT_AI_CONFIGS: Record<string, Partial<AIConfig>> = {
  slime: {
    initialState: 'idle',
    aggroRange: 80,
    deaggroRange: 150,
    chaseRange: 100,
    canChase: true,
    canFlee: false,
    canPatrol: false,
    canWander: true,
    attackRange: 40,
    attackCooldown: 1.5,
    decisionInterval: 0.3
  },
  
  goblin: {
    initialState: 'patrol',
    aggroRange: 100,
    deaggroRange: 200,
    chaseRange: 180,
    canChase: true,
    canFlee: false,
    canPatrol: true,
    canWander: false,
    patrolWaitTime: 3,
    attackRange: 45,
    attackCooldown: 1.2,
    decisionInterval: 0.4
  },
  
  wolf: {
    initialState: 'wander',
    aggroRange: 120,
    deaggroRange: 250,
    chaseRange: 200,
    canChase: true,
    canFlee: false,
    canPatrol: false,
    canWander: true,
    attackRange: 35,
    attackCooldown: 0.8,
    decisionInterval: 0.25
  },
  
  boss: {
    initialState: 'guard',
    aggroRange: 150,
    deaggroRange: 300,
    chaseRange: 250,
    canChase: true,
    canFlee: false,
    canPatrol: false,
    canWander: false,
    healthFleeThreshold: 10, // Boss doesn't flee
    attackRange: 60,
    attackCooldown: 2,
    decisionInterval: 0.5
  },
  
  skeleton: {
    initialState: 'idle',
    aggroRange: 100,
    deaggroRange: 200,
    chaseRange: 180,
    canChase: true,
    canFlee: false,
    canPatrol: true,
    canWander: false,
    patrolWaitTime: 5,
    attackRange: 50,
    attackCooldown: 1.5,
    decisionInterval: 0.4
  }
};
