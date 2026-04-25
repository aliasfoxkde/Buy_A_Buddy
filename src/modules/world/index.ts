/**
 * World System Module - Zones, NPCs, and Map
 */

import { EventBus, Vector2, generateId, clamp } from '../../core';

export interface Zone {
  id: string;
  name: string;
  type: 'safe' | 'combat' | 'dungeon' | 'boss' | 'shop' | 'home';
  position: Vector2;
  size: { width: number; height: number };
  enemies: string[];
  npcs: string[];
  items: WorldItem[];
  connections: { zoneId: string; direction: string; requiredLevel?: number }[];
  background: string;
  music: 'peaceful' | 'battle' | 'boss' | 'dungeon';
  levelRange: { min: number; max: number };
}

export interface WorldItem {
  id: string;
  itemId: string;
  position: Vector2;
  respawnTime?: number;
  collectedBy?: string;
}

export interface NPC extends NPCState {}

export interface NPCState {
  id: string;
  name: string;
  position: Vector2;
  sprite: string;
  spriteIndex: number;
  behavior: 'idle' | 'patrol' | 'follow' | 'wander';
  patrolPath?: Vector2[];
  speed: number;
  isHostile: boolean;
  stats?: {
    health?: number;
    attack?: number;
    defense?: number;
  };
  dialogueId?: string;
  shopId?: string;
  questIds?: string[];
}

export interface AINode {
  type: 'sequence' | 'selector' | 'condition' | 'action' | 'wait';
  children?: AINode[];
  condition?: () => boolean;
  action?: () => void;
  duration?: number;
}

export class NPCAI {
  private state: 'idle' | 'patrol' | 'chase' | 'attack' | 'flee' | 'interact';
  private target: Vector2 | null = null;
  private patrolIndex: number = 0;
  private waitTime: number = 0;
  private npc: NPCState;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor(npc: NPCState) {
    this.npc = npc;
    this.state = 'idle';
  }

  update(deltaTime: number): void {
    switch (this.state) {
      case 'idle':
        this.updateIdle(deltaTime);
        break;
      case 'patrol':
        this.updatePatrol(deltaTime);
        break;
      case 'chase':
        this.updateChase(deltaTime);
        break;
      case 'attack':
        this.updateAttack(deltaTime);
        break;
    }
  }

  private updateIdle(deltaTime: number): void {
    this.waitTime += deltaTime;
    if (this.waitTime > 2) {
      this.waitTime = 0;
      this.state = this.npc.behavior === 'patrol' ? 'patrol' : 'idle';
    }
  }

  private updatePatrol(deltaTime: number): void {
    if (!this.npc.patrolPath || this.npc.patrolPath.length === 0) {
      this.state = 'idle';
      return;
    }

    const destination = this.npc.patrolPath[this.patrolIndex];
    const dx = destination.x - this.npc.position.x;
    const dy = destination.y - this.npc.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.patrolIndex = (this.patrolIndex + 1) % this.npc.patrolPath.length;
      this.state = 'idle';
    } else {
      const speed = this.npc.speed * deltaTime;
      this.npc.position.x += (dx / distance) * speed;
      this.npc.position.y += (dy / distance) * speed;
      this.emit('move', this.npc.position);
    }
  }

  private updateChase(deltaTime: number): void {
    if (!this.target) {
      this.state = 'idle';
      return;
    }

    const dx = this.target.x - this.npc.position.x;
    const dy = this.target.y - this.npc.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 200) {
      this.state = 'idle';
      this.target = null;
      return;
    }

    if (distance > 50) {
      const speed = this.npc.speed * 1.5 * deltaTime;
      this.npc.position.x += (dx / distance) * speed;
      this.npc.position.y += (dy / distance) * speed;
      this.emit('move', this.npc.position);
    } else {
      this.state = 'attack';
    }
  }

  private updateAttack(deltaTime: number): void {
    this.waitTime += deltaTime;
    if (this.waitTime > 1) {
      this.waitTime = 0;
      this.emit('attack', this.target);
    }
  }

  setTarget(position: Vector2): void {
    this.target = position;
    this.state = 'chase';
  }

  getPosition(): Vector2 {
    return { ...this.npc.position };
  }

  getState(): string {
    return this.state;
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export class WorldSystem {
  private eventBus: EventBus;
  private zones: Map<string, Zone> = new Map();
  private currentZone: string = '';
  private npcs: Map<string, NPCState> = new Map();
  private npcAIs: Map<string, NPCAI> = new Map();
  private worldItems: WorldItem[] = [];
  private playerPosition: Vector2 = { x: 0, y: 0 };

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.initializeDefaultWorld();
  }

  getZone(id: string): Zone | undefined {
    return this.zones.get(id);
  }

  getCurrentZone(): Zone | undefined {
    return this.zones.get(this.currentZone);
  }

  getNPCs(): NPC[] {
    return Array.from(this.npcs.values()) as NPC[];
  }

  getNPC(id: string): NPC | undefined {
    return this.npcs.get(id) as NPC | undefined;
  }

  getNPCPosition(id: string): Vector2 | undefined {
    return this.npcs.get(id)?.position;
  }

  moveToZone(zoneId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    this.currentZone = zoneId;
    this.eventBus.emit('world:zone_change', { zoneId, zone });
    return true;
  }

  movePlayer(direction: 'up' | 'down' | 'left' | 'right', speed: number, deltaTime: number): void {
    const zone = this.getCurrentZone();
    if (!zone) return;

    const moveSpeed = speed * deltaTime;
    let newX = this.playerPosition.x;
    let newY = this.playerPosition.y;

    switch (direction) {
      case 'up': newY -= moveSpeed; break;
      case 'down': newY += moveSpeed; break;
      case 'left': newX -= moveSpeed; break;
      case 'right': newX += moveSpeed; break;
    }

    // Clamp to zone bounds
    newX = clamp(newX, 0, zone.size.width);
    newY = clamp(newY, 0, zone.size.height);

    this.playerPosition = { x: newX, y: newY };
  }

  getPlayerPosition(): Vector2 {
    return { ...this.playerPosition };
  }

  interactWithNPC(npcId: string): boolean {
    const npc = this.npcs.get(npcId);
    if (!npc) return false;

    const distance = Math.sqrt(
      Math.pow(this.playerPosition.x - npc.position.x, 2) +
      Math.pow(this.playerPosition.y - npc.position.y, 2)
    );

    if (distance > 50) return false;

    const fullNpc = npc as NPC;
    if (fullNpc.dialogueId) {
      this.eventBus.emit('dialogue:start', { npcId, dialogueId: fullNpc.dialogueId });
      return true;
    }

    return false;
  }

  addWorldItem(itemId: string, position: Vector2): void {
    const item: WorldItem = {
      id: generateId(),
      itemId,
      position: { ...position }
    };
    this.worldItems.push(item);
  }

  collectItem(itemId: string): string | null {
    const index = this.worldItems.findIndex(i => i.id === itemId);
    if (index === -1) return null;

    const item = this.worldItems[index];
    const distance = Math.sqrt(
      Math.pow(this.playerPosition.x - item.position.x, 2) +
      Math.pow(this.playerPosition.y - item.position.y, 2)
    );

    if (distance > 50) return null;

    this.worldItems.splice(index, 1);
    this.eventBus.emit('world:item_collected', { itemId: item.itemId, position: item.position });
    return item.itemId;
  }

  update(deltaTime: number): void {
    // Update NPC AI
    for (const [id, ai] of this.npcAIs) {
      ai.update(deltaTime);
    }

    // Check for nearby items
    for (const item of this.worldItems) {
      const distance = Math.sqrt(
        Math.pow(this.playerPosition.x - item.position.x, 2) +
        Math.pow(this.playerPosition.y - item.position.y, 2)
      );

      if (distance < 50) {
        this.eventBus.emit('world:item_nearby', { item });
      }
    }
  }

  private initializeDefaultWorld(): void {
    // Starting Village
    this.zones.set('village_start', {
      id: 'village_start',
      name: 'Willowbrook Village',
      type: 'safe',
      position: { x: 0, y: 0 },
      size: { width: 800, height: 600 },
      enemies: [],
      npcs: ['mentor', 'shopkeeper', 'innkeeper'],
      items: [
        { id: 'item_1', itemId: 'potion_health_small', position: { x: 200, y: 150 } },
        { id: 'item_2', itemId: 'material_wood', position: { x: 400, y: 300 } }
      ],
      connections: [
        { zoneId: 'forest_1', direction: 'north', requiredLevel: 1 }
      ],
      background: 'village',
      music: 'peaceful',
      levelRange: { min: 1, max: 1 }
    });

    // Starting Forest
    this.zones.set('forest_1', {
      id: 'forest_1',
      name: 'Whispering Woods',
      type: 'combat',
      position: { x: 0, y: 0 },
      size: { width: 1200, height: 800 },
      enemies: ['slime_green', 'slime_blue', 'rabbit', 'bird'],
      npcs: ['hermit'],
      items: [
        { id: 'item_3', itemId: 'material_herb_green', position: { x: 300, y: 200 } },
        { id: 'item_4', itemId: 'material_herb_green', position: { x: 500, y: 400 } }
      ],
      connections: [
        { zoneId: 'village_start', direction: 'south' },
        { zoneId: 'dungeon_1', direction: 'east', requiredLevel: 3 }
      ],
      background: 'forest',
      music: 'battle',
      levelRange: { min: 1, max: 3 }
    });

    // First Dungeon
    this.zones.set('dungeon_1', {
      id: 'dungeon_1',
      name: 'Goblin Cave',
      type: 'dungeon',
      position: { x: 0, y: 0 },
      size: { width: 1000, height: 700 },
      enemies: ['goblin', 'goblin_warrior', 'spider'],
      npcs: [],
      items: [
        { id: 'item_5', itemId: 'weapon_iron_sword', position: { x: 800, y: 300 } },
        { id: 'item_6', itemId: 'key_dungeon', position: { x: 500, y: 500 } }
      ],
      connections: [
        { zoneId: 'forest_1', direction: 'west' },
        { zoneId: 'dungeon_boss', direction: 'north', requiredLevel: 5 }
      ],
      background: 'dungeon',
      music: 'dungeon',
      levelRange: { min: 3, max: 5 }
    });

    // Boss Room
    this.zones.set('dungeon_boss', {
      id: 'dungeon_boss',
      name: 'Cave Depths',
      type: 'boss',
      position: { x: 0, y: 0 },
      size: { width: 600, height: 500 },
      enemies: ['boss_goblin_king'],
      npcs: [],
      items: [
        { id: 'item_7', itemId: 'quest_ancient_scroll', position: { x: 300, y: 200 } }
      ],
      connections: [
        { zoneId: 'dungeon_1', direction: 'south' }
      ],
      background: 'dungeon_dark',
      music: 'boss',
      levelRange: { min: 5, max: 5 }
    });

    // NPCs
    this.npcs.set('mentor', {
      id: 'mentor',
      name: 'Old Mentor',
      position: { x: 400, y: 300 },
      sprite: 'npc',
      spriteIndex: 0,
      behavior: 'idle',
      speed: 0,
      isHostile: false,
      dialogueId: 'mentor'
    });

    this.npcs.set('shopkeeper', {
      id: 'shopkeeper',
      name: 'Friendly Shopkeeper',
      position: { x: 600, y: 200 },
      sprite: 'npc',
      spriteIndex: 4,
      behavior: 'idle',
      speed: 0,
      isHostile: false,
      dialogueId: 'shopkeeper',
      shopId: 'general_store'
    });

    this.npcs.set('innkeeper', {
      id: 'innkeeper',
      name: 'Inn Keeper',
      position: { x: 200, y: 400 },
      sprite: 'npc',
      spriteIndex: 3,
      behavior: 'idle',
      speed: 0,
      isHostile: false
    });

    this.npcs.set('hermit', {
      id: 'hermit',
      name: 'Forest Hermit',
      position: { x: 600, y: 400 },
      sprite: 'npc',
      spriteIndex: 6,
      behavior: 'idle',
      speed: 0,
      isHostile: false,
      dialogueId: 'hermit',
      questIds: ['quest_herbs']
    });

    // Initialize NPC AIs
    for (const [id, npc] of this.npcs) {
      this.npcAIs.set(id, new NPCAI(npc));
    }

    // Set starting zone
    this.currentZone = 'village_start';
    this.worldItems = [...this.zones.get('village_start')!.items];
  }
}
