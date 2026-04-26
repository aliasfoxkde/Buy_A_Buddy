/**
 * Buy a Buddy - Core Game Engine
 * A modular RPG game system
 */

// ==========================================
// CORE TYPES & INTERFACES
// ==========================================

export interface Vector2 {
  x: number;
  y: number;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EntityStats {
  maxHealth: number;
  currentHealth: number;
  maxMana: number;
  currentMana: number;
  attack: number;
  defense: number;
  speed: number;
  luck: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

export interface Position extends Vector2 {
  rotation?: number;
}

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
    parent: string;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  debug: boolean;
}

export interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerData;
  inventory: InventoryData;
  quests: QuestData[];
  settings: GameSettings;
}

export interface PlayerData {
  name: string;
  characterIndex: number;
  buddyIndex: number;
  position: Vector2;
  stats: EntityStats;
  skills: string[];
  achievements: string[];
  playTime: number;
}

export interface InventoryData {
  slots: InventorySlot[];
  gold: number;
  maxSlots: number;
}

export interface InventorySlot {
  itemId: string | null;
  quantity: number;
  metadata?: Record<string, unknown>;
}

export interface QuestData {
  questId: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  startTime?: number;
  completeTime?: number;
}

export interface QuestObjective {
  type: string;
  target: string;
  current: number;
  required: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  masterVolume: number;
  graphics: {
    particleEffects: boolean;
    screenShake: boolean;
    showFPS: boolean;
  };
  accessibility: {
    colorBlindMode: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
}

// ==========================================
// EVENTS SYSTEM
// ==========================================

export type GameEventType = 
  | 'entity:damage'
  | 'entity:heal'
  | 'entity:death'
  | 'entity:spawn'
  | 'entity:levelUp'
  | 'inventory:change'
  | 'inventory:itemUsed'
  | 'inventory:add'
  | 'inventory:remove'
  | 'inventory:gold'
  | 'quest:start'
  | 'quest:complete'
  | 'quest:fail'
  | 'skill:cast'
  | 'skill:learn'
  | 'achievement:unlock'
  | 'game:save'
  | 'game:save_request'
  | 'game:load'
  | 'audio:play'
  | 'battle:start'
  | 'battle:end'
  | 'enemy:defeated'
  | 'dialogue:node'
  | 'dialogue:end'
  | 'dialogue:start'
  | 'crafting:complete'
  | 'player:experience'
  | 'flag:change'
  | 'explore:location'
  | 'world:zone_change'
  | 'world:item_collected'
  | 'world:item_nearby'
  | 'stats:update'
  | 'storage:save_start'
  | 'storage:save_complete'
  | 'storage:load_start'
  | 'storage:load_complete'
  | 'storage:load_error'
  | 'storage:cleared'
  | 'buff:apply'
  | 'buff:tick'
  | 'buff:remove'
  | 'npc:interact'
  | 'shop:open'
  | 'tooltip:show'
  | 'tooltip:hide'
  | 'tutorial:start'
  | 'tutorial:end'
  | 'tutorial:step'
  | 'tutorial:skip'
  | 'tutorial:cannot_start'
  | 'ai:state_change'
  | 'ai:action'
  | 'ai:move'
  | 'ai:attack'
  | 'ai:flee'
  | 'ai:cast'
  | 'game:initialized'
  | 'game:pause'
  | 'game:resume'
  | 'game:new_game'
  | 'test:event'
  | 'test';

export interface GameEvent {
  type: GameEventType;
  payload: unknown;
  timestamp: number;
}

type EventCallback = (event: GameEvent) => void;

export class EventBus {
  private listeners: Map<GameEventType, Set<EventCallback>> = new Map();
  private eventLog: GameEvent[] = [];
  private maxLogSize = 100;

  on(type: GameEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => this.off(type, callback);
  }

  off(type: GameEventType, callback: EventCallback): void {
    this.listeners.get(type)?.delete(callback);
  }

  emit(type: GameEventType, payload: unknown = {}): void {
    const event: GameEvent = {
      type,
      payload,
      timestamp: Date.now()
    };
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
    this.listeners.get(type)?.forEach(cb => cb(event));
  }

  getEventLog(): GameEvent[] {
    return [...this.eventLog];
  }
}

// ==========================================
// BASE ENTITY CLASS
// ==========================================

export abstract class Entity {
  id: string;
  name: string;
  position: Vector2;
  stats: EntityStats;
  spritesheet: string;
  spriteIndex: number;
  hitbox: Hitbox;
  isAlive: boolean = true;
  protected eventBus: EventBus;

  constructor(config: {
    id: string;
    name: string;
    position: Vector2;
    spritesheet: string;
    spriteIndex: number;
    stats?: Partial<EntityStats>;
    hitbox?: Partial<Hitbox>;
  }, eventBus: EventBus) {
    this.id = config.id;
    this.name = config.name;
    this.position = { ...config.position };
    this.spritesheet = config.spritesheet;
    this.spriteIndex = config.spriteIndex;
    this.eventBus = eventBus;
    
    this.stats = {
      maxHealth: 100,
      currentHealth: 100,
      maxMana: 50,
      currentMana: 50,
      attack: 10,
      defense: 5,
      speed: 10,
      luck: 5,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100
    };
    
    if (config.stats) {
      Object.assign(this.stats, config.stats);
    }
    
    this.hitbox = {
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      ...config.hitbox
    };
  }

  takeDamage(amount: number, source?: Entity): number {
    const actualDamage = Math.max(1, amount - this.stats.defense);
    this.stats.currentHealth = Math.max(0, this.stats.currentHealth - actualDamage);
    this.eventBus.emit('entity:damage', { entity: this, damage: actualDamage, source });
    
    if (this.stats.currentHealth <= 0) {
      this.isAlive = false;
      this.eventBus.emit('entity:death', { entity: this, killer: source });
    }
    
    return actualDamage;
  }

  heal(amount: number): number {
    const actualHeal = Math.min(amount, this.stats.maxHealth - this.stats.currentHealth);
    this.stats.currentHealth += actualHeal;
    this.eventBus.emit('entity:heal', { entity: this, amount: actualHeal });
    return actualHeal;
  }

  gainExperience(amount: number): boolean {
    this.stats.experience += amount;
    let leveledUp = false;
    
    while (this.stats.experience >= this.stats.experienceToNextLevel) {
      this.stats.experience -= this.stats.experienceToNextLevel;
      this.levelUp();
      leveledUp = true;
    }
    
    return leveledUp;
  }

  protected levelUp(): void {
    this.stats.level++;
    this.stats.maxHealth += 10;
    this.stats.currentHealth = this.stats.maxHealth;
    this.stats.maxMana += 5;
    this.stats.currentMana = this.stats.maxMana;
    this.stats.attack += 2;
    this.stats.defense += 1;
    this.stats.experienceToNextLevel = Math.floor(this.stats.experienceToNextLevel * 1.5);
    this.eventBus.emit('entity:levelUp', { entity: this });
  }

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}

// ==========================================
// SPRITE MANAGER
// ==========================================

export interface SpriteConfig {
  spritesheet: string;
  frameWidth: number;
  frameHeight: number;
  framesPerRow: number;
  animations: Map<string, AnimationFrames>;
}

export interface AnimationFrames {
  frames: number[];
  frameDuration: number;
  loop: boolean;
}

export class SpriteManager {
  private sprites: Map<string, HTMLImageElement> = new Map();
  private configs: Map<string, SpriteConfig> = new Map();
  private loadedCount = 0;
  private totalCount = 0;

  async loadSprites(sprites: Record<string, string>): Promise<void> {
    const promises: Promise<void>[] = [];
    this.totalCount = Object.keys(sprites).length;

    for (const [key, src] of Object.entries(sprites)) {
      promises.push(this.loadSprite(key, src));
    }

    await Promise.all(promises);
  }

  private async loadSprite(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(key, img);
        this.loadedCount++;
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to load sprite: ${src}`));
      img.src = src;
    });
  }

  registerConfig(key: string, config: SpriteConfig): void {
    this.configs.set(key, config);
  }

  getSprite(key: string): HTMLImageElement | undefined {
    return this.sprites.get(key);
  }

  getConfig(key: string): SpriteConfig | undefined {
    return this.configs.get(key);
  }

  getLoadProgress(): number {
    return this.totalCount > 0 ? this.loadedCount / this.totalCount : 0;
  }

  drawSprite(
    ctx: CanvasRenderingContext2D,
    key: string,
    x: number,
    y: number,
    frame: number = 0,
    scale: number = 1,
    flipX: boolean = false
  ): void {
    const sprite = this.sprites.get(key);
    const config = this.configs.get(key);

    if (!sprite || !config) return;

    const frameX = (frame % config.framesPerRow) * config.frameWidth;
    const frameY = Math.floor(frame / config.framesPerRow) * config.frameHeight;

    ctx.save();
    if (flipX) {
      ctx.translate(x + config.frameWidth * scale, y);
      ctx.scale(-1, 1);
      x = 0;
      y = 0;
    }

    ctx.drawImage(
      sprite,
      frameX, frameY,
      config.frameWidth, config.frameHeight,
      x, y,
      config.frameWidth * scale,
      config.frameHeight * scale
    );
    ctx.restore();
  }
}

// ==========================================
// AUDIO MANAGER (Procedural Generation)
// ==========================================

export interface AudioTrack {
  name: string;
  buffer: AudioBuffer | null;
  gainNode: GainNode | null;
}

export class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private tracks: Map<string, AudioTrack> = new Map();
  private currentMusic: AudioBufferSourceNode | null = null;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    
    this.masterGain.connect(this.context.destination);
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    
    this.isInitialized = true;
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setMusicVolume(volume: number): void {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setSfxVolume(volume: number): void {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  async generateMusic(type: 'battle' | 'peaceful' | 'boss' | 'victory' | 'menu'): Promise<void> {
    if (!this.context || !this.musicGain) await this.init();
    if (!this.context) return;

    const duration = 10;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(2, sampleRate * duration, sampleRate);

    const patterns = {
      battle: { root: 330, tempo: 140, notes: [1, 0, 1.2, 0, 0.8, 1, 0.6, 0] },
      peaceful: { root: 262, tempo: 90, notes: [1, 1.25, 1.5, 2, 1.5, 1.25, 1, 0.5] },
      boss: { root: 165, tempo: 120, notes: [1, 0, 0.5, 1, 0, 0.75, 1, 0] },
      victory: { root: 392, tempo: 130, notes: [1, 1.33, 1.66, 2, 1.66, 1.33, 1, 0.5] },
      menu: { root: 294, tempo: 100, notes: [1, 1.25, 1, 0.75, 1, 1.25, 1.5, 2] }
    };

    const config = patterns[type];
    const channels = buffer.getChannelData(0);
    const channels2 = buffer.getChannelData(1);

    for (let i = 0; i < channels.length; i++) {
      const t = i / sampleRate;
      const beatIndex = Math.floor((t * config.tempo / 60) % config.notes.length);
      const noteFreq = config.notes[beatIndex] * config.root;
      
      // Melody
      const melody = Math.sin(2 * Math.PI * noteFreq * t) * 0.3;
      
      // Bass
      const bass = Math.sin(2 * Math.PI * (noteFreq / 2) * t) * 0.2;
      
      // Arpeggio
      const arpFreq = noteFreq * (1 + (beatIndex % 3) * 0.5);
      const arp = Math.sin(2 * Math.PI * arpFreq * t) * 0.1;
      
      // Pad
      const pad = Math.sin(2 * Math.PI * config.root * t) * 0.05;
      
      // Envelope
      const noteTime = t * config.tempo / 60;
      const envelope = Math.exp(-0.5 * (noteTime % 1));
      
      const sample = (melody + bass + arp + pad) * envelope;
      
      channels[i] = sample * 0.7;
      channels2[i] = sample * 0.7 * (1 + Math.sin(t * 0.5) * 0.1);
    }

    this.tracks.set(type, { name: type, buffer, gainNode: this.musicGain });
  }

  async generateSFX(type: 'click' | 'hit' | 'heal' | 'coin' | 'powerup' | 'damage' | 'death' | 'levelup' | 'skill' | 'equip'): Promise<void> {
    if (!this.context || !this.sfxGain) await this.init();
    if (!this.context) return;

    const duration = 0.3;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    const configs: Record<string, { freq: number; decay: number; type: OscillatorType; mod?: number }> = {
      click: { freq: 800, decay: 15, type: 'square' },
      hit: { freq: 150, decay: 8, type: 'sawtooth' },
      heal: { freq: 523, decay: 20, type: 'sine', mod: 2 },
      coin: { freq: 988, decay: 30, type: 'square', mod: 1.5 },
      powerup: { freq: 440, decay: 25, type: 'sawtooth', mod: 1.25 },
      damage: { freq: 100, decay: 6, type: 'sawtooth' },
      death: { freq: 80, decay: 4, type: 'sawtooth' },
      levelup: { freq: 523, decay: 20, type: 'sine', mod: 2 },
      skill: { freq: 660, decay: 25, type: 'triangle', mod: 1.5 },
      equip: { freq: 350, decay: 18, type: 'triangle' }
    };

    const cfg = configs[type] || configs.click;

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const freq = cfg.freq * (1 + (cfg.mod ? Math.sin(t * cfg.mod * Math.PI) * 0.1 : 0));
      const envelope = Math.exp(-cfg.decay * t);
      
      let sample: number;
      switch (cfg.type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * freq * t);
          break;
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * freq * t));
          break;
        case 'sawtooth':
          sample = 2 * ((freq * t) % 1) - 1;
          break;
        default:
          sample = Math.sin(2 * Math.PI * freq * t);
      }
      
      data[i] = sample * envelope * 0.3;
    }

    this.tracks.set(type, { name: type, buffer, gainNode: this.sfxGain });
  }

  async playMusic(type: 'battle' | 'peaceful' | 'boss' | 'victory' | 'menu', loop: boolean = true): Promise<void> {
    if (!this.context || !this.musicGain) await this.init();
    
    this.stopMusic();
    
    let track = this.tracks.get(type);
    if (!track?.buffer) {
      await this.generateMusic(type);
      track = this.tracks.get(type);
    }
    
    if (track?.buffer && this.context) {
      this.currentMusic = this.context.createBufferSource();
      this.currentMusic.buffer = track.buffer;
      this.currentMusic.loop = loop;
      this.currentMusic.connect(this.musicGain!);
      this.currentMusic.start();
    }
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  async playSFX(type: string): Promise<void> {
    if (!this.context || !this.sfxGain) await this.init();
    
    let track = this.tracks.get(type);
    if (!track?.buffer) {
      await this.generateSFX(type as Parameters<typeof this.generateSFX>[0]);
      track = this.tracks.get(type);
    }
    
    if (track?.buffer && this.context) {
      const source = this.context.createBufferSource();
      source.buffer = track.buffer;
      source.connect(this.sfxGain!);
      source.start();
    }
  }

  async generateAllAudio(): Promise<void> {
    const musicTypes: Array<'battle' | 'peaceful' | 'boss' | 'victory' | 'menu'> = 
      ['battle', 'peaceful', 'boss', 'victory', 'menu'];
    const sfxTypes: Array<'click' | 'hit' | 'heal' | 'coin' | 'powerup' | 'damage' | 'death' | 'levelup' | 'skill' | 'equip'> = 
      ['click', 'hit', 'heal', 'coin', 'powerup', 'damage', 'death', 'levelup', 'skill', 'equip'];
    
    for (const type of musicTypes) {
      await this.generateMusic(type);
    }
    for (const type of sfxTypes) {
      await this.generateSFX(type);
    }
  }
}

// ==========================================
// GAME STATE MANAGER
// ==========================================

export class GameState {
  player: PlayerData;
  inventory: InventoryData;
  quests: QuestData[];
  settings: GameSettings;
  playTime: number = 0;
  
  constructor() {
    this.player = this.createDefaultPlayer();
    this.inventory = this.createDefaultInventory();
    this.quests = [];
    this.settings = this.createDefaultSettings();
  }

  private createDefaultPlayer(): PlayerData {
    return {
      name: 'Hero',
      characterIndex: 0,
      buddyIndex: 0,
      position: { x: 100, y: 100 },
      stats: {
        maxHealth: 100,
        currentHealth: 100,
        maxMana: 50,
        currentMana: 50,
        attack: 10,
        defense: 5,
        speed: 10,
        luck: 5,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100
      },
      skills: [],
      achievements: [],
      playTime: 0
    };
  }

  private createDefaultInventory(): InventoryData {
    return {
      slots: Array(24).fill(null).map(() => ({ itemId: null, quantity: 0 })),
      gold: 100,
      maxSlots: 24
    };
  }

  private createDefaultSettings(): GameSettings {
    return {
      musicVolume: 0.7,
      sfxVolume: 0.8,
      masterVolume: 1.0,
      graphics: {
        particleEffects: true,
        screenShake: true,
        showFPS: false
      },
      accessibility: {
        colorBlindMode: false,
        reducedMotion: false,
        largeText: false
      }
    };
  }

  toJSON(): SaveData {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      player: this.player,
      inventory: this.inventory,
      quests: this.quests,
      settings: this.settings
    };
  }

  fromJSON(data: SaveData): void {
    this.player = data.player;
    this.inventory = data.inventory;
    this.quests = data.quests;
    this.settings = data.settings;
  }
}

// ==========================================
// MAIN GAME ENGINE
// ==========================================

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  eventBus: EventBus;
  spriteManager: SpriteManager;
  audioManager: AudioManager;
  state: GameState;
  config: GameConfig;
  
  private lastTime: number = 0;
  private running: boolean = false;
  private scenes: Map<string, Scene> = new Map();
  private currentScene: string = 'boot';
  private deltaTime: number = 0;
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsTime: number = 0;

  constructor(config: GameConfig) {
    this.config = config;
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.canvas.width;
    this.canvas.height = config.canvas.height;
    this.canvas.id = 'gameCanvas';
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    
    document.getElementById(config.canvas.parent)?.appendChild(this.canvas);
    
    this.eventBus = new EventBus();
    this.spriteManager = new SpriteManager();
    this.audioManager = new AudioManager();
    this.state = new GameState();
  }

  async init(): Promise<void> {
    await this.audioManager.init();
    await this.audioManager.generateAllAudio();
    
    // Load sprites
    await this.spriteManager.loadSprites({
      characters: '/images/sprites/characters.png',
      buddies: '/images/sprites/buddies.png',
      enemies: '/images/sprites/enemies.png',
      bosses: '/images/sprites/bosses.png',
      items: '/images/sprites/items.png',
      weapons: '/images/sprites/weapons.png',
      armor: '/images/sprites/armor.png',
      skills: '/images/sprites/skills.png',
      effects: '/images/sprites/effects.png',
      environment: '/images/sprites/environment.png',
      nature: '/images/sprites/nature.png',
      npc: '/images/sprites/npc.png',
      buildings: '/images/sprites/buildings.png',
      vehicles: '/images/sprites/vehicles.png',
      objects: '/images/sprites/objects.png',
      tilesGround: '/images/sprites/tiles_ground.png',
      tilesWalls: '/images/sprites/tiles_walls.png',
      tilesRoofs: '/images/sprites/tiles_roofs.png',
      tilesFurniture: '/images/sprites/tiles_furniture.png',
      uiMenu: '/images/sprites/ui/menu.png',
      uiInventory: '/images/sprites/ui/inventory.png',
      uiBars: '/images/sprites/ui/bars.png',
      uiButtons: '/images/sprites/ui/buttons.png',
      uiWindows: '/images/sprites/ui/windows.png',
      uiPopups: '/images/sprites/ui/popups.png'
    });

    this.eventBus.emit('game:load', this.state);
  }

  registerScene(name: string, scene: Scene): void {
    this.scenes.set(name, scene);
    scene.engine = this;
  }

  setScene(name: string): void {
    if (this.scenes.has(name)) {
      this.currentScene = name;
      this.scenes.get(name)?.onEnter();
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.running = false;
  }

  private gameLoop(): void {
    if (!this.running) return;

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.state.playTime += this.deltaTime;

    // FPS calculation
    this.frameCount++;
    this.fpsTime += this.deltaTime;
    if (this.fpsTime >= 1) {
      this.fps = Math.round(this.frameCount / this.fpsTime);
      this.frameCount = 0;
      this.fpsTime = 0;
    }

    this.update(this.deltaTime);
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime: number): void {
    this.scenes.get(this.currentScene)?.update(deltaTime);
  }

  render(): void {
    const scene = this.scenes.get(this.currentScene);
    
    // Clear
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render scene
    scene?.render(this.ctx);
    
    // Debug FPS
    if (this.state.settings.graphics.showFPS) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '14px monospace';
      this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    }
  }

  async save(): Promise<string> {
    const data = this.state.toJSON();
    const json = JSON.stringify(data);
    localStorage.setItem('buyabuddy_save', json);
    this.eventBus.emit('game:save', data);
    await this.audioManager.playSFX('coin');
    return json;
  }

  async load(): Promise<boolean> {
    const json = localStorage.getItem('buyabuddy_save');
    if (!json) return false;
    
    try {
      const data = JSON.parse(json) as SaveData;
      this.state.fromJSON(data);
      this.eventBus.emit('game:load', this.state);
      return true;
    } catch {
      return false;
    }
  }
}

// ==========================================
// BASE SCENE CLASS
// ==========================================

export abstract class Scene {
  engine?: GameEngine;
  protected eventBus?: EventBus;

  abstract onEnter(): void;
  abstract onExit(): void;
  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export function calculateDamage(attacker: EntityStats, defender: EntityStats): number {
  const baseDamage = attacker.attack;
  const variance = 0.1 + Math.random() * 0.2;
  const critChance = attacker.luck / 100;
  const isCrit = Math.random() < critChance;
  
  let damage = Math.floor(baseDamage * variance * (1 - defender.defense / 100));
  if (isCrit) damage *= 2;
  
  return Math.max(1, damage);
}

export function calculateExperienceReward(level: number): number {
  return Math.floor(10 + level * 5 + Math.pow(level, 1.5) * 2);
}

export function calculateGoldReward(level: number): number {
  return Math.floor(5 + level * 2 + Math.random() * level * 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function distance(a: Vector2, b: Vector2): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function rectIntersects(a: Hitbox, b: Hitbox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
