/**
 * Ambient Sound Generator - Creates procedural ambient sounds
 */

export class AmbientSound {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private oscillators: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  
  constructor() {
    // Audio context created on user interaction
  }
  
  private initAudio(): void {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.15;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }
  
  /**
   * Play ambient forest sounds (gentle wind + birds)
   */
  playForestAmbient(): void {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;
    
    this.stop();
    this.isPlaying = true;
    
    // Wind (filtered noise simulation with low oscillator)
    const windOsc = this.audioContext.createOscillator();
    const windGain = this.audioContext.createGain();
    windOsc.type = 'sine';
    windOsc.frequency.value = 80;
    windGain.gain.value = 0.08;
    
    // Modulate wind
    const windLFO = this.audioContext.createOscillator();
    const windLFOGain = this.audioContext.createGain();
    windLFO.type = 'sine';
    windLFO.frequency.value = 0.2;
    windLFOGain.gain.value = 20;
    windLFO.connect(windLFOGain);
    windLFOGain.connect(windOsc.frequency);
    
    windOsc.connect(windGain);
    windGain.connect(this.masterGain);
    windOsc.start();
    windLFO.start();
    
    this.oscillators.push(windOsc, windLFO);
    this.gains.push(windGain);
  }
  
  /**
   * Play battle music (intense, rhythmic)
   */
  playBattleAmbient(): void {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;
    
    this.stop();
    this.isPlaying = true;
    
    // Drum beat simulation
    const drumOsc = this.audioContext.createOscillator();
    const drumGain = this.audioContext.createGain();
    drumOsc.type = 'square';
    drumOsc.frequency.value = 60;
    drumGain.gain.value = 0;
    
    // Beat pattern
    drumOsc.connect(drumGain);
    drumGain.connect(this.masterGain);
    drumOsc.start();
    
    // Pulse the drum
    const pulseDrum = () => {
      if (!this.isPlaying || !drumGain) return;
      drumGain.gain.setValueAtTime(0.2, this.audioContext!.currentTime);
      drumGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.1);
      setTimeout(pulseDrum, 400);
    };
    pulseDrum();
    
    // Tension pad
    const padOsc = this.audioContext.createOscillator();
    const padGain = this.audioContext.createGain();
    padOsc.type = 'sawtooth';
    padOsc.frequency.value = 110;
    padGain.gain.value = 0.03;
    
    padOsc.connect(padGain);
    padGain.connect(this.masterGain);
    padOsc.start();
    
    this.oscillators.push(drumOsc, padOsc);
    this.gains.push(drumGain, padGain);
  }
  
  /**
   * Play victory fanfare
   */
  playVictorySound(): void {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;
    
    const now = this.audioContext.currentTime;
    
    // fanfare chord
    const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
    
    for (const freq of notes) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.stop(now + 1.5);
    }
  }
  
  /**
   * Play UI click sound
   */
  playClickSound(): void {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;
    
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.stop(now + 0.1);
  }
  
  /**
   * Play damage hit sound
   */
  playHitSound(): void {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;
    
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    gain.gain.value = 0.15;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.stop(now + 0.2);
  }
  
  /**
   * Play critical hit sound
   */
  playCritSound(): void {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;
    
    const now = this.audioContext.currentTime;
    
    // Impact
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 200;
    gain.gain.value = 0.2;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.stop(now + 0.3);
    
    // Sizzle effect
    const noise = this.audioContext.createOscillator();
    const noiseGain = this.audioContext.createGain();
    noise.type = 'square';
    noise.frequency.value = 2000;
    noiseGain.gain.value = 0.05;
    
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.stop(now + 0.15);
  }
  
  /**
   * Stop all sounds
   */
  stop(): void {
    this.isPlaying = false;
    
    for (const osc of this.oscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    }
    this.oscillators = [];
    
    for (const gain of this.gains) {
      try {
        gain.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }
    this.gains = [];
  }
  
  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume)) * 0.3;
    }
  }
  
  /**
   * Resume audio context (for browser autoplay policy)
   */
  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const ambientSound = new AmbientSound();
