/**
 * Mobile Controls - Touch joystick and virtual buttons
 */

import Phaser from 'phaser';

export interface VirtualJoystickConfig {
  radius: number;
  deadzone: number;
  baseColor: number;
  knobColor: number;
}

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base!: Phaser.GameObjects.Graphics;
  private knob!: Phaser.GameObjects.Graphics;
  private vector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private active: boolean = false;
  private basePosition: { x: number; y: number } = { x: 0, y: 0 };
  private currentKnobPos: { x: number; y: number } = { x: 0, y: 0 };
  
  constructor(scene: Phaser.Scene, x: number, y: number, config: Partial<VirtualJoystickConfig> = {}) {
    this.scene = scene;
    
    const radius = config.radius || 80;
    const baseColor = config.baseColor || 0x2d1b4e;
    const knobColor = config.knobColor || 0xa855f7;
    
    this.basePosition = { x, y };
    this.currentKnobPos = { x, y };
    
    // Create base graphics
    this.base = scene.add.graphics();
    this.base.fillStyle(baseColor, 0.5);
    this.base.fillCircle(radius, radius, radius);
    this.base.lineStyle(3, baseColor, 0.8);
    this.base.strokeCircle(radius, radius, radius);
    this.base.setPosition(x - radius, y - radius);
    this.base.setVisible(false);
    this.base.setDepth(1000);
    
    // Create knob graphics
    const knobRadius = radius * 0.4;
    this.knob = scene.add.graphics();
    this.knob.fillStyle(knobColor, 0.8);
    this.knob.fillCircle(knobRadius, knobRadius, knobRadius);
    this.knob.setPosition(x - knobRadius, y - knobRadius);
    this.knob.setVisible(false);
    this.knob.setDepth(1001);
    
    // Setup touch input
    this.setupInput();
  }
  
  private setupInput(): void {
    const input = this.scene.input;
    
    input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < this.scene.scale.width * 0.4) {
        this.activate(pointer.x, pointer.y);
      }
    });
    
    input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.active) {
        this.updateKnob(pointer.x, pointer.y);
      }
    });
    
    input.on('pointerup', () => {
      this.deactivate();
    });
    
    input.on('pointerout', () => {
      this.deactivate();
    });
  }
  
  private activate(x: number, y: number): void {
    this.active = true;
    this.basePosition = { x, y };
    this.currentKnobPos = { x, y };
    
    const radius = 80;
    this.base.setPosition(x - radius, y - radius);
    this.base.setVisible(true);
    
    const knobRadius = radius * 0.4;
    this.knob.setPosition(x - knobRadius, y - knobRadius);
    this.knob.setVisible(true);
  }
  
  private deactivate(): void {
    this.active = false;
    this.base.setVisible(false);
    this.knob.setVisible(false);
    this.vector.set(0, 0);
  }
  
  private updateKnob(pointerX: number, pointerY: number): void {
    const dx = pointerX - this.basePosition.x;
    const dy = pointerY - this.basePosition.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 80;
    const deadzone = 10;
    
    if (distance < deadzone) {
      this.vector.set(0, 0);
      this.knob.setPosition(this.basePosition.x - 32, this.basePosition.y - 32);
      this.currentKnobPos = { x: this.basePosition.x, y: this.basePosition.y };
      return;
    }
    
    const normalizedX = dx / distance;
    const normalizedY = dy / distance;
    
    const clampedDistance = Math.min(distance, maxRadius);
    
    const knobRadius = maxRadius * 0.4;
    const knobX = this.basePosition.x + normalizedX * clampedDistance;
    const knobY = this.basePosition.y + normalizedY * clampedDistance;
    
    this.knob.setPosition(knobX - knobRadius, knobY - knobRadius);
    this.currentKnobPos = { x: knobX, y: knobY };
    
    const magnitude = Math.min(1, (distance - deadzone) / (maxRadius - deadzone));
    this.vector.set(normalizedX * magnitude, normalizedY * magnitude);
  }
  
  getVector(): Phaser.Math.Vector2 {
    return this.vector.clone();
  }
  
  isActive(): boolean {
    return this.active;
  }
  
  getAngle(): number {
    return Math.atan2(this.vector.y, this.vector.x);
  }
  
  getMagnitude(): number {
    return this.vector.length();
  }
  
  setVisible(visible: boolean): void {
    this.base.setVisible(visible);
    this.knob.setVisible(visible);
  }
  
  destroy(): void {
    this.base.destroy();
    this.knob.destroy();
  }
}

export class ActionButton {
  private scene: Phaser.Scene;
  private button!: Phaser.GameObjects.Container;
  private action: () => void;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    action: () => void,
    size: number = 60
  ) {
    this.scene = scene;
    this.action = action;
    
    this.button = scene.add.container(x, y);
    
    const bg = scene.add.rectangle(0, 0, size, size, 0x2d1b4e, 0.8);
    bg.setStrokeStyle(3, 0xa855f7);
    bg.setInteractive({ useHandCursor: true });
    
    const text = scene.add.text(0, 0, label, {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    this.button.add([bg, text]);
    this.button.setDepth(1000);
    
    bg.on('pointerdown', () => {
      bg.setFillStyle(0x3d2b5e);
      this.action();
    });
    
    bg.on('pointerup', () => {
      bg.setFillStyle(0x2d1b4e);
    });
    
    bg.on('pointerout', () => {
      bg.setFillStyle(0x2d1b4e);
    });
  }
  
  setVisible(visible: boolean): void {
    this.button.setVisible(visible);
  }
  
  setPosition(x: number, y: number): void {
    this.button.setPosition(x, y);
  }
  
  destroy(): void {
    this.button.destroy();
  }
}

export class MobileControls {
  private scene: Phaser.Scene;
  private joystick?: VirtualJoystick;
  private actionButtons: ActionButton[] = [];
  private enabled: boolean = false;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  enable(): void {
    if (this.enabled) return;
    
    // Only enable on touch devices
    const isTouchDevice = this.scene.sys.game.device.input.touch;
    if (!isTouchDevice) {
      return;
    }
    
    this.enabled = true;
    
    const joystickX = 120;
    const joystickY = this.scene.scale.height - 150;
    this.joystick = new VirtualJoystick(this.scene, joystickX, joystickY);
    
    const buttonX = this.scene.scale.width - 80;
    const buttonSpacing = 80;
    
    this.actionButtons.push(new ActionButton(
      this.scene,
      buttonX,
      this.scene.scale.height - 120,
      'ATK',
      () => this.scene.events.emit('mobile:action', 'attack')
    ));
    
    this.actionButtons.push(new ActionButton(
      this.scene,
      buttonX,
      this.scene.scale.height - 200,
      'DEF',
      () => this.scene.events.emit('mobile:action', 'defend')
    ));
    
    this.actionButtons.push(new ActionButton(
      this.scene,
      buttonX - buttonSpacing,
      this.scene.scale.height - 120,
      'ACT',
      () => this.scene.events.emit('mobile:action', 'interact')
    ));
    
    this.actionButtons.push(new ActionButton(
      this.scene,
      this.scene.scale.width - 80,
      60,
      'MNU',
      () => this.scene.events.emit('mobile:action', 'menu')
    ));
  }
  
  disable(): void {
    this.enabled = false;
    this.joystick?.destroy();
    this.actionButtons.forEach(btn => btn.destroy());
    this.actionButtons = [];
  }
  
  getMovement(): Phaser.Math.Vector2 {
    return this.joystick?.getVector() || new Phaser.Math.Vector2(0, 0);
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
  
  update(): void {
    if (!this.enabled) return;
    
    if (this.joystick?.isActive()) {
      const vector = this.joystick.getVector();
      this.scene.events.emit('mobile:move', vector);
    }
  }
}
