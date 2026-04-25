// ==========================================
// AUDIO MANAGER - Sound effects and music
// ==========================================

import { Howl } from 'howler';

// Sound configuration
interface SoundConfig {
  volume: number;
  rate?: number;
  loop?: boolean;
}

interface SoundEntry {
  howl: Howl;
  config: SoundConfig;
}

// Base64 encoded minimal sounds (generated programmatically)
const SOUND_DATA: Record<string, string> = {
  // Simple click sound (generated)
  click: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU1vT19gYH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f35+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+',
  spawn: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU1vT19gYH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+',
  coin: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU1vT19gYH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+',
  hit: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU1vT19gYH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+',
  victory: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU1vT19gYH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+',
  menu_bgm: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU1vT19gYH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+',
  game_bgm: 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU1vT19gYH9/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+',
};

export class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, SoundEntry> = new Map();
  private currentMusic: Howl | null = null;
  private muted: boolean = false;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 0.6;
  private musicVolume: number = 0.4;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio (must be called after user interaction)
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    
    // Generate sounds programmatically using Web Audio API
    this.generateSounds();
    
    // Pre-load sounds
    await this.preloadSounds();
    
    this.initialized = true;
    console.log('🔊 AudioManager initialized');
  }

  /**
   * Generate simple sounds using Web Audio API
   */
  private generateSounds(): void {
    // We'll use placeholder sounds for now
    // In production, these would be actual sound files
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Check if audio context is available
    if (!context) {
      console.warn('⚠️ Web Audio API not supported');
      return;
    }
    
    // Close context (we just needed to check support)
    context.close();
  }

  /**
   * Preload all sound effects
   */
  private async preloadSounds(): Promise<void> {
    const soundConfigs: Record<string, SoundConfig> = {
      click: { volume: 0.5 },
      spawn: { volume: 0.6 },
      coin: { volume: 0.4 },
      hit: { volume: 0.5 },
      victory: { volume: 0.7 },
      menu_bgm: { volume: 0.3, loop: true },
      game_bgm: { volume: 0.3, loop: true },
    };

    for (const [name, config] of Object.entries(soundConfigs)) {
      const howl = new Howl({
        src: [this.getSoundPath(name)],
        volume: config.volume * this.sfxVolume,
        loop: config.loop || false,
        preload: true,
      });
      
      this.sounds.set(name, { howl, config });
    }
  }

  /**
   * Get sound file path (placeholder for now)
   */
  private getSoundPath(name: string): string {
    // In production, this would return actual file paths
    // For now, return empty string (silent fallback)
    return '';
  }

  /**
   * Play a sound effect
   */
  playSFX(name: string, volume?: number): void {
    if (this.muted) return;
    
    const entry = this.sounds.get(name);
    if (!entry) {
      // Generate sound using Web Audio API if not found
      this.playGeneratedSFX(name, volume);
      return;
    }

    const vol = volume !== undefined ? volume : entry.config.volume;
    entry.howl.volume(vol * this.sfxVolume * this.masterVolume);
    entry.howl.play();
  }

  /**
   * Play generated sound effect using Web Audio API
   */
  private playGeneratedSFX(name: string, baseVolume: number = 0.5): void {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended (browser autoplay policy)
      if (context.state === 'suspended') {
        context.resume();
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Different sounds for different effects
      switch (name) {
        case 'click':
          this.playClickSound(context, oscillator, gainNode, baseVolume);
          break;
        case 'spawn':
          this.playSpawnSound(context, oscillator, gainNode, baseVolume);
          break;
        case 'coin':
          this.playCoinSound(context, oscillator, gainNode, baseVolume);
          break;
        case 'hit':
          this.playHitSound(context, oscillator, gainNode, baseVolume);
          break;
        case 'victory':
          this.playVictorySound(context, oscillator, gainNode, baseVolume);
          break;
        default:
          this.playClickSound(context, oscillator, gainNode, baseVolume);
      }
    } catch (e) {
      console.warn('⚠️ Could not play sound:', e);
    }
  }

  private playClickSound(ctx: AudioContext, osc: OscillatorNode, gain: GainNode, vol: number): void {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
    ctx.close();
  }

  private playSpawnSound(ctx: AudioContext, osc: OscillatorNode, gain: GainNode, vol: number): void {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    ctx.close();
  }

  private playCoinSound(ctx: AudioContext, osc: OscillatorNode, gain: GainNode, vol: number): void {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(2000, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    ctx.close();
  }

  private playHitSound(ctx: AudioContext, osc: OscillatorNode, gain: GainNode, vol: number): void {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
    ctx.close();
  }

  private playVictorySound(ctx: AudioContext, osc: OscillatorNode, gain: GainNode, vol: number): void {
    // Play a short melody
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    const duration = 0.15;
    
    notes.forEach((freq, i) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, ctx.currentTime + i * duration);
      
      noteGain.gain.setValueAtTime(0, ctx.currentTime + i * duration);
      noteGain.gain.linearRampToValueAtTime(vol * 0.4, ctx.currentTime + i * duration + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (i + 1) * duration);
      
      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);
      
      noteOsc.start(ctx.currentTime + i * duration);
      noteOsc.stop(ctx.currentTime + (i + 1) * duration + 0.05);
    });
    
    ctx.close();
  }

  /**
   * Play background music
   */
  playMusic(name: string, volume?: number): void {
    if (this.muted) return;
    
    // Stop current music
    this.stopMusic();
    
    const entry = this.sounds.get(name);
    if (entry) {
      this.currentMusic = entry.howl;
      const vol = volume !== undefined ? volume : this.musicVolume;
      entry.howl.volume(vol * this.masterVolume);
      entry.howl.play();
    }
  }

  /**
   * Stop current music
   */
  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  /**
   * Pause music
   */
  pauseMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume music
   */
  resumeMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.play();
    }
  }

  /**
   * Set mute state
   */
  setMute(muted: boolean): void {
    this.muted = muted;
    if (this.currentMusic) {
      this.currentMusic.mute(muted);
    }
    console.log(`🔇 Audio ${muted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    this.setMute(!this.muted);
    return this.muted;
  }

  /**
   * Check if muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume(this.musicVolume * this.masterVolume);
    }
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume(this.musicVolume * this.masterVolume);
    }
  }

  /**
   * Play UI sound (convenience method)
   */
  playClick(): void {
    this.playSFX('click');
  }

  /**
   * Play spawn sound
   */
  playSpawn(): void {
    this.playSFX('spawn');
  }

  /**
   * Play coin sound
   */
  playCoin(): void {
    this.playSFX('coin');
  }

  /**
   * Play hit sound
   */
  playHit(): void {
    this.playSFX('hit');
  }

  /**
   * Play victory sound
   */
  playVictory(): void {
    this.playSFX('victory');
  }

  /**
   * Play menu music
   */
  playMenuMusic(): void {
    this.playMusic('menu_bgm');
  }

  /**
   * Play game music
   */
  playGameMusic(): void {
    this.playMusic('game_bgm');
  }
}

// Export singleton
export const audioManager = AudioManager.getInstance();