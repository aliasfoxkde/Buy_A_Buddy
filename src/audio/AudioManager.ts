/**
 * Audio Manager - Enhanced with procedural sound generation
 * Buy a Buddy - All sounds generated using Web Audio API
 */

// Sound types
export type SoundType = 
  | 'click'
  | 'hover'
  | 'open'
  | 'close'
  | 'success'
  | 'error'
  | 'pickup'
  | 'drop'
  | 'attack'
  | 'defend'
  | 'heal'
  | 'levelup'
  | 'victory'
  | 'defeat'
  | 'coin'
  | 'door'
  | 'step'
  | 'swing'
  | 'potion'
  | 'achievement'
  | 'quest_complete';

export type MusicType =
  | 'menu'
  | 'exploration'
  | 'battle'
  | 'victory'
  | 'defeat'
  | 'shop'
  | 'inn';

interface SoundConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;
  attack: number;
  decay: number;
  volume: number;
  pitchVariation?: number;
}

interface MusicTrack {
  notes: number[];
  durations: number[];
  instrument: OscillatorType;
  volume: number;
}

class AudioManager {
  private static instance: AudioManager;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentMusic: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isPlaying: boolean = false;
  
  // Volume settings
  public masterVolume: number = 1.0;
  public musicVolume: number = 0.4;
  public sfxVolume: number = 0.7;
  public muted: boolean = false;
  
  // Sound configurations
  private readonly sounds: Record<SoundType, SoundConfig> = {
    click: { frequency: 800, type: 'sine', duration: 0.08, attack: 0.01, decay: 0.07, volume: 0.15 },
    hover: { frequency: 600, type: 'sine', duration: 0.05, attack: 0.01, decay: 0.04, volume: 0.08 },
    open: { frequency: 400, type: 'triangle', duration: 0.15, attack: 0.02, decay: 0.13, volume: 0.12 },
    close: { frequency: 300, type: 'triangle', duration: 0.1, attack: 0.01, decay: 0.09, volume: 0.1 },
    success: { frequency: 880, type: 'sine', duration: 0.3, attack: 0.02, decay: 0.28, volume: 0.2, pitchVariation: 220 },
    error: { frequency: 200, type: 'sawtooth', duration: 0.2, attack: 0.01, decay: 0.19, volume: 0.15 },
    pickup: { frequency: 1000, type: 'sine', duration: 0.12, attack: 0.01, decay: 0.11, volume: 0.15, pitchVariation: 500 },
    drop: { frequency: 400, type: 'triangle', duration: 0.1, attack: 0.01, decay: 0.09, volume: 0.12 },
    attack: { frequency: 150, type: 'sawtooth', duration: 0.15, attack: 0.01, decay: 0.14, volume: 0.2 },
    defend: { frequency: 300, type: 'square', duration: 0.2, attack: 0.02, decay: 0.18, volume: 0.12 },
    heal: { frequency: 1200, type: 'sine', duration: 0.5, attack: 0.05, decay: 0.45, volume: 0.15, pitchVariation: 400 },
    levelup: { frequency: 523, type: 'sine', duration: 0.8, attack: 0.05, decay: 0.75, volume: 0.2, pitchVariation: 262 },
    victory: { frequency: 784, type: 'sine', duration: 1.0, attack: 0.05, decay: 0.95, volume: 0.2, pitchVariation: 392 },
    defeat: { frequency: 300, type: 'sawtooth', duration: 0.8, attack: 0.05, decay: 0.75, volume: 0.18, pitchVariation: 100 },
    coin: { frequency: 1500, type: 'triangle', duration: 0.1, attack: 0.01, decay: 0.09, volume: 0.12, pitchVariation: 500 },
    door: { frequency: 200, type: 'square', duration: 0.3, attack: 0.05, decay: 0.25, volume: 0.1 },
    step: { frequency: 100, type: 'triangle', duration: 0.05, attack: 0.01, decay: 0.04, volume: 0.05 },
    swing: { frequency: 250, type: 'sawtooth', duration: 0.12, attack: 0.01, decay: 0.11, volume: 0.18 },
    potion: { frequency: 900, type: 'sine', duration: 0.2, attack: 0.02, decay: 0.18, volume: 0.15, pitchVariation: 300 },
    achievement: { frequency: 784, type: 'sine', duration: 0.6, attack: 0.02, decay: 0.58, volume: 0.18, pitchVariation: 392},
    quest_complete: { frequency: 659, type: 'triangle', duration: 0.5, attack: 0.02, decay: 0.48, volume: 0.15, pitchVariation: 165 }
  };
  
  // Music tracks (longer melodies with more variety)
  private readonly musicTracks: Record<MusicType, MusicTrack> = {
    menu: {
      notes: [392, 440, 494, 523, 587, 523, 494, 440, 392, 349, 330, 294, 262, 294, 330, 349],
      durations: [0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0],
      instrument: 'sine',
      volume: 0.08
    },
    exploration: {
      notes: [262, 294, 330, 349, 392, 440, 494, 392, 330, 294, 262, 294, 330, 294, 262, 247],
      durations: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1.6, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1.6],
      instrument: 'triangle',
      volume: 0.06
    },
    battle: {
      notes: [196, 196, 247, 294, 247, 196, 165, 196, 247, 294, 330, 294, 247, 196, 165, 130],
      durations: [0.2, 0.2, 0.3, 0.3, 0.2, 0.2, 0.4, 0.2, 0.2, 0.3, 0.3, 0.2, 0.2, 0.4, 0.4, 0.8],
      instrument: 'sawtooth',
      volume: 0.1
    },
    victory: {
      notes: [523, 587, 659, 784, 880, 784, 1047, 1175, 1047, 1319, 1568, 1760],
      durations: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 1.0],
      instrument: 'sine',
      volume: 0.15
    },
    defeat: {
      notes: [392, 349, 330, 294, 262, 247, 220, 196, 165, 147, 131, 98],
      durations: [0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1.0, 1.0, 1.0, 2.0],
      instrument: 'triangle',
      volume: 0.1
    },
    shop: {
      notes: [330, 370, 415, 440, 494, 440, 415, 370, 330, 294, 262, 294],
      durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.0],
      instrument: 'sine',
      volume: 0.05
    },
    inn: {
      notes: [262, 294, 330, 370, 330, 294, 262, 247, 220, 247, 262, 294, 262, 220],
      durations: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0],
      instrument: 'sine',
      volume: 0.04
    }
  };

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async init(): Promise<void> {
    if (this.context) return;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = this.masterVolume;
      
      this.musicGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = this.musicVolume;
      
      this.sfxGain = this.context.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = this.sfxVolume;
      
      console.log('🔊 AudioManager initialized');
    } catch (error) {
      console.warn('⚠️ Audio initialization failed:', error);
    }
  }

  /**
   * Resume audio context if suspended
   */
  private async ensureContext(): Promise<boolean> {
    if (!this.context || !this.sfxGain || !this.musicGain) {
      await this.init();
    }
    
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
    
    return !!this.context;
  }

  /**
   * Play a sound effect
   */
  async playSound(sound: SoundType): Promise<void> {
    if (this.muted || !await this.ensureContext()) return;
    
    const config = this.sounds[sound];
    if (!config) return;
    
    const now = this.context!.currentTime;
    
    // Create oscillator
    const osc = this.context!.createOscillator();
    const gain = this.context!.createGain();
    
    osc.type = config.type;
    
    // Add pitch variation if specified
    const freqVariation = config.pitchVariation 
      ? (Math.random() - 0.5) * config.pitchVariation 
      : 0;
    osc.frequency.setValueAtTime(config.frequency + freqVariation, now);
    
    // ADSR envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(config.volume, now + config.attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + config.duration);
    
    osc.connect(gain);
    gain.connect(this.sfxGain!);
    
    osc.start(now);
    osc.stop(now + config.duration);
  }

  /**
   * Play a sequence of sounds (for melodies)
   */
  async playSoundSequence(sounds: SoundType[], interval: number = 0.15): Promise<void> {
    for (let i = 0; i < sounds.length; i++) {
      setTimeout(() => this.playSound(sounds[i]), i * interval * 1000);
    }
  }

  /**
   * Play background music
   */
  async playMusic(track: MusicType): Promise<void> {
    if (this.muted || !await this.ensureContext()) return;
    
    // Stop current music
    this.stopMusic();
    
    const musicTrack = this.musicTracks[track];
    if (!musicTrack) return;
    
    const now = this.context!.currentTime;
    this.isPlaying = true;
    
    // Schedule the melody to loop
    this.scheduleMusicLoop(musicTrack, now);
    
    // Store reference for stopping
    this.scheduleMusicLoop = this.scheduleMusicLoop.bind(this);
  }
  
  private scheduleMusicLoop(track: MusicTrack, startTime: number): void {
    if (!this.isPlaying || !this.context || !this.musicGain) return;
    
    const totalDuration = track.durations.reduce((a, b) => a + b, 0);
    
    track.notes.forEach((freq, i) => {
      const noteTime = startTime + track.durations.slice(0, i).reduce((a, b) => a + b, 0);
      const duration = track.durations[i];
      
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      
      osc.type = track.instrument;
      osc.frequency.setValueAtTime(freq, noteTime);
      
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(track.volume, noteTime + 0.02);
      gain.gain.setValueAtTime(track.volume, noteTime + duration - 0.02);
      gain.gain.linearRampToValueAtTime(0, noteTime + duration);
      
      osc.connect(gain);
      gain.connect(this.musicGain!);
      
      osc.start(noteTime);
      osc.stop(noteTime + duration);
    });
    
    // Schedule next loop
    setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleMusicLoop(track, this.context!.currentTime);
      }
    }, totalDuration * 1000);
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    this.isPlaying = false;
  }

  /**
   * Pause music
   */
  pauseMusic(): void {
    if (this.musicGain) {
      this.musicGain.gain.value = 0;
    }
  }

  /**
   * Resume music
   */
  resumeMusic(): void {
    if (this.musicGain && !this.muted) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  /**
   * Set master volume (0.0 - 1.0)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    }
  }

  /**
   * Set music volume (0.0 - 1.0)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain && !this.muted) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  /**
   * Set SFX volume (0.0 - 1.0)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain && !this.muted) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  /**
   * Mute/unmute all audio
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.masterVolume;
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Convenience methods for common sounds
  playClick(): void { this.playSound('click'); }
  playHover(): void { this.playSound('hover'); }
  playPickup(): void { this.playSound('pickup'); }
  playCoin(): void { this.playSound('coin'); }
  playAttack(): void { this.playSound('attack'); }
  playHeal(): void { this.playSound('heal'); }
  playVictory(): void { this.playSound('victory'); }
  playDefeat(): void { this.playSound('defeat'); }
  playDefend(): void { this.playSound('defend'); }
  playLevelUp(): void { this.playSound('levelup'); }
  playAchievement(): void { this.playSound('achievement'); }
  playQuestComplete(): void { this.playSound('quest_complete'); }
  playPotion(): void { this.playSound('potion'); }
  
  playMenuMusic(): void { this.playMusic('menu'); }
  playExplorationMusic(): void { this.playMusic('exploration'); }
  playBattleMusic(): void { this.playMusic('battle'); }
  playShopMusic(): void { this.playMusic('shop'); }
  playInnMusic(): void { this.playMusic('inn'); }
}

export const audioManager = AudioManager.getInstance();
