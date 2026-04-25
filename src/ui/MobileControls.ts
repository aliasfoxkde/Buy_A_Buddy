/**
 * Mobile Controls - Virtual Joystick for Touch Devices
 */

import Phaser from 'phaser';

export interface JoystickOutput {
  x: number;
  y: number;
  isActive: boolean;
}

export class MobileControls {
  private scene: Phaser.Scene;
  private joystickRadius: number = 60;
  private knobRadius: number = 25;
  private joystickX: number = 120;
  private joystickY: number = 0; // Set dynamically
  private baseGraphics!: Phaser.GameObjects.Graphics;
  private knobGraphics!: Phaser.GameObjects.Graphics;
  private isActive: boolean = false;
  private currentX: number = 0;
  private currentY: number = 0;
  private pointer: Phaser.Input.Pointer | null = null;
  private isMobile: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.detectMobile();
    if (this.isMobile) {
      this.create();
    }
  }

  private detectMobile(): void {
    // Detect touch device
    this.isMobile = this.scene.sys.game.device.input.touch || 
                   'ontouchstart' in window ||
                   navigator.maxTouchPoints > 0;
  }

  private create(): void {
    const { height } = this.scene.scale;
    this.joystickY = height - 150;

    // Joystick base (semi-transparent)
    this.baseGraphics = this.scene.add.graphics();
    this.baseGraphics.fillStyle(0xffffff, 0.15);
    this.baseGraphics.fillCircle(this.joystickX, this.joystickY, this.joystickRadius);
    this.baseGraphics.lineStyle(3, 0xffffff, 0.3);
    this.baseGraphics.strokeCircle(this.joystickX, this.joystickY, this.joystickRadius);

    // Joystick knob
    this.knobGraphics = this.scene.add.graphics();
    this.updateKnob(this.joystickX, this.joystickY);

    // Set initial visibility
    this.baseGraphics.setDepth(100);
    this.knobGraphics.setDepth(101);
    this.baseGraphics.setVisible(false);
    this.knobGraphics.setVisible(false);

    // Touch events
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.isMobile) return;
    
    // Check if touch is in left half of screen (joystick area)
    if (pointer.x < this.scene.scale.width / 2) {
      this.pointer = pointer;
      this.isActive = true;
      this.baseGraphics.setVisible(true);
      this.knobGraphics.setVisible(true);
      this.updateKnob(pointer.x, pointer.y);
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isActive || pointer !== this.pointer) return;

    const dx = pointer.x - this.joystickX;
    const dy = pointer.y - this.joystickY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let angle = Math.atan2(dy, dx);
    if (distance > this.joystickRadius) {
      // Clamp to radius
      const clampedX = this.joystickX + Math.cos(angle) * this.joystickRadius;
      const clampedY = this.joystickY + Math.sin(angle) * this.joystickRadius;
      this.updateKnob(clampedX, clampedY);
      this.currentX = Math.cos(angle);
      this.currentY = Math.sin(angle);
    } else {
      this.updateKnob(pointer.x, pointer.y);
      this.currentX = dx / this.joystickRadius;
      this.currentY = dy / this.joystickRadius;
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer === this.pointer) {
      this.isActive = false;
      this.pointer = null;
      this.currentX = 0;
      this.currentY = 0;
      this.baseGraphics.setVisible(false);
      this.knobGraphics.setVisible(false);
      this.updateKnob(this.joystickX, this.joystickY);
    }
  }

  private updateKnob(x: number, y: number): void {
    this.knobGraphics.clear();
    this.knobGraphics.fillStyle(0xffffff, 0.4);
    this.knobGraphics.fillCircle(x, y, this.knobRadius);
    this.knobGraphics.lineStyle(2, 0xffffff, 0.6);
    this.knobGraphics.strokeCircle(x, y, this.knobRadius);
  }

  /**
   * Get current joystick state
   */
  getOutput(): JoystickOutput {
    return {
      x: this.currentX,
      y: this.currentY,
      isActive: this.isActive
    };
  }

  /**
   * Check if mobile controls are available
   */
  isTouchDevice(): boolean {
    return this.isMobile;
  }

  /**
   * Destroy controls
   */
  destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.baseGraphics?.destroy();
    this.knobGraphics?.destroy();
  }
}

export default MobileControls;
