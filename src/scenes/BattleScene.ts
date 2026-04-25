/**
 * Battle Scene - Turn-based combat with full UI
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';

export class BattleScene extends Phaser.Scene {
  private playerEntity: any = null;
  private enemyEntity: any = null;
  
  private uiElements: {
    playerHp: Phaser.GameObjects.Rectangle;
    playerHpText: Phaser.GameObjects.Text;
    enemyHp: Phaser.GameObjects.Rectangle;
    enemyHpText: Phaser.GameObjects.Text;
    playerMp: Phaser.GameObjects.Rectangle;
    playerMpText: Phaser.GameObjects.Text;
    actionButtons: Phaser.GameObjects.Container[];
    logText: Phaser.GameObjects.Text;
    turnIndicator: Phaser.GameObjects.Text;
  } | null = null;
  
  private isPlayerTurn: boolean = true;
  private isBattleOver: boolean = false;
  private playerMaxHp: number = 100;
  private playerHp: number = 100;
  private enemyMaxHp: number = 40;
  private enemyHp: number = 40;
  
  constructor() {
    super({ key: 'BattleScene' });
  }
  
  create(): void {
    const { width, height } = this.scale;
    
    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a15');
    
    // Arena border
    const arenaBg = this.add.rectangle(width / 2, height / 2, width - 40, height - 160, 0x1a1a2e);
    arenaBg.setStrokeStyle(3, 0xa855f7);
    
    // Title
    this.add.text(width / 2, 30, 'BATTLE', {
      fontSize: '32px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ef4444'
    }).setOrigin(0.5);
    
    // Initialize battle state
    this.initializeBattle();
    
    // Create UI
    this.createHealthBars(width, 100);
    this.createManaBar(width, 160);
    this.createActionPanel(width, height);
    this.createBattleLog(width, height);
    
    // Turn indicator
    this.updateTurnIndicator();
    
    // Enemy AI turn timer
    this.time.addEvent({
      delay: 1500,
      callback: () => this.enemyTurn(),
      callbackScope: this,
      loop: false
    });
    
    // Listen for events
    this.setupEventListeners();
  }
  
  private initializeBattle(): void {
    // Get player stats from game systems
    const stats = gameSystems.getPlayerStats();
    if (stats) {
      this.playerMaxHp = stats.maxHealth;
      this.playerHp = stats.health;
    }
  }
  
  private createHealthBars(width: number, y: number): void {
    // Player HP
    this.add.text(100, y, 'HERO', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e'
    });
    
    const playerHpBg = this.add.rectangle(250, y, 250, 30, 0x2d1b4e);
    playerHpBg.setStrokeStyle(2, 0x555);
    
    const playerHp = this.add.rectangle(125, y, 250, 24, 0x22c55e);
    
    this.uiElements!.playerHp = playerHp;
    this.uiElements!.playerHpText = this.add.text(250, y, `${this.playerHp}/${this.playerMaxHp}`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    // Enemy HP
    this.add.text(width - 100, y, 'SLIME', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ef4444'
    }).setOrigin(1, 0);
    
    const enemyHpBg = this.add.rectangle(width - 250, y, 250, 30, 0x2d1b4e);
    enemyHpBg.setStrokeStyle(2, 0x555);
    
    const enemyHp = this.add.rectangle(width - 375, y, 250, 24, 0xef4444);
    
    this.uiElements!.enemyHp = enemyHp;
    this.uiElements!.enemyHpText = this.add.text(width - 250, y, `${this.enemyHp}/${this.enemyMaxHp}`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
  }
  
  private createManaBar(width: number, y: number): void {
    this.add.text(100, y, 'MP', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#3b82f6'
    });
    
    const mpBg = this.add.rectangle(250, y, 200, 20, 0x2d1b4e);
    mpBg.setStrokeStyle(1, 0x3b82f6);
    
    const mpFill = this.add.rectangle(150, y, 200, 14, 0x3b82f6);
    
    this.uiElements!.playerMp = mpFill;
    this.uiElements!.playerMpText = this.add.text(250, y, '50/50', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
  }
  
  private createActionPanel(width: number, height: number): void {
    const panelY = height - 180;
    
    // Panel background
    const panel = this.add.rectangle(width / 2, panelY, width - 60, 160, 0x1a1a2e);
    panel.setStrokeStyle(2, 0xa855f7);
    
    // Action buttons
    const actions = [
      { text: 'ATTACK', action: () => this.playerAttack() },
      { text: 'DEFEND', action: () => this.playerDefend() },
      { text: 'ITEM', action: () => this.useItem() },
      { text: 'FLEE', action: () => this.attemptFlee() }
    ];
    
    this.uiElements!.actionButtons = [];
    
    actions.forEach((action, i) => {
      const x = 200 + i * 250;
      const btn = this.createButton(x, panelY - 30, action.text, action.action);
      this.uiElements!.actionButtons.push(btn);
    });
  }
  
  private createButton(x: number, y: number, text: string, action: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 180, 50, 0x2d1b4e);
    bg.setStrokeStyle(2, 0xa855f7);
    
    const label = this.add.text(0, 0, text, {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setSize(180, 50);
    container.setInteractive({ useHandCursor: true });
    
    container.on('pointerover', () => {
      bg.setFillStyle(0x3d2b5e);
    });
    
    container.on('pointerout', () => {
      bg.setFillStyle(0x2d1b4e);
    });
    
    container.on('pointerdown', () => {
      if (this.isPlayerTurn && !this.isBattleOver) {
        action();
      }
    });
    
    return container;
  }
  
  private createBattleLog(width: number, height: number): void {
    const logY = height - 240;
    
    const logBg = this.add.rectangle(width / 2, logY, width - 80, 60, 0x0d0d15);
    logBg.setStrokeStyle(1, 0x333);
    
    this.uiElements!.logText = this.add.text(width / 2, logY, 'Battle started!', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    }).setOrigin(0.5);
    
    // Turn indicator
    this.uiElements!.turnIndicator = this.add.text(width / 2, 70, "YOUR TURN", {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
  }
  
  private updateTurnIndicator(): void {
    if (!this.uiElements) return;
    
    const text = this.isPlayerTurn ? "YOUR TURN" : "ENEMY TURN";
    const color = this.isPlayerTurn ? '#22c55e' : '#ef4444';
    
    this.uiElements.turnIndicator?.destroy();
    this.uiElements.turnIndicator = this.add.text(this.scale.width / 2, 70, text, {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: color
    }).setOrigin(0.5);
  }
  
  private setupEventListeners(): void {
    // Listen for combat events from game systems
    gameSystems.eventBus.on('battle:start', () => {
      this.addBattleLog('Battle started!');
    });
    
    gameSystems.eventBus.on('battle:end', (event: any) => {
      if (event.payload?.victory) {
        this.isBattleOver = true;
        this.addBattleLog('VICTORY!');
        this.time.delayedCall(2000, () => this.endBattle(true));
      }
    });
  }
  
  private playerAttack(): void {
    if (!this.isPlayerTurn || this.isBattleOver) return;
    
    // Calculate damage
    const baseDamage = 15;
    const damage = Math.max(1, baseDamage + Math.floor(Math.random() * 10) - 5);
    
    this.enemyHp = Math.max(0, this.enemyHp - damage);
    
    this.addBattleLog(`Hero attacks for ${damage} damage!`);
    this.showDamageNumber(damage, 900);
    this.updateHealthBars();
    
    this.isPlayerTurn = false;
    this.updateTurnIndicator();
    
    this.checkBattleEnd();
  }
  
  private playerDefend(): void {
    if (!this.isPlayerTurn || this.isBattleOver) return;
    
    this.addBattleLog('Hero takes a defensive stance!');
    
    this.isPlayerTurn = false;
    this.updateTurnIndicator();
    
    this.time.delayedCall(1000, () => this.enemyTurn());
  }
  
  private useItem(): void {
    if (!this.isPlayerTurn || this.isBattleOver) return;
    
    // Find health potion in inventory
    const inventory = gameSystems.inventory.getInventory();
    let foundPotion = false;
    let potionIndex = -1;
    
    // Find potion slot
    for (let i = 0; i < inventory.slots.length; i++) {
      const slot = inventory.slots[i];
      if (slot?.itemId && slot.itemId.includes('potion') && slot.itemId.includes('health')) {
        potionIndex = i;
        foundPotion = true;
        break;
      }
    }
    
    if (foundPotion && potionIndex >= 0) {
      const slot = inventory.slots[potionIndex];
      const healAmount = slot!.itemId!.includes('small') ? 30 : slot!.itemId!.includes('medium') ? 60 : 100;
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmount);
      
      // Remove item
      gameSystems.inventory.removeItem(potionIndex, 1);
      
      this.addBattleLog(`Hero drinks a potion and heals ${healAmount} HP!`);
      this.updateHealthBars();
    }
    
    if (!foundPotion) {
      this.addBattleLog('No health potions available!');
    }
    
    this.isPlayerTurn = false;
    this.updateTurnIndicator();
    
    this.time.delayedCall(1000, () => this.enemyTurn());
  }
  
  private attemptFlee(): void {
    if (!this.isPlayerTurn || this.isBattleOver) return;
    
    const fleeChance = 0.4;
    if (Math.random() < fleeChance) {
      this.addBattleLog('Escaped successfully!');
      this.time.delayedCall(1000, () => this.endBattle(false, true));
    } else {
      this.addBattleLog('Failed to escape!');
      this.isPlayerTurn = false;
      this.updateTurnIndicator();
      this.time.delayedCall(1000, () => this.enemyTurn());
    }
  }
  
  private enemyTurn(): void {
    if (this.isBattleOver) return;
    
    // Simple enemy AI - always attacks
    const baseDamage = 8;
    const damage = Math.max(1, baseDamage + Math.floor(Math.random() * 5) - 3);
    
    this.playerHp = Math.max(0, this.playerHp - damage);
    
    this.addBattleLog(`Slime attacks for ${damage} damage!`);
    this.showDamageNumber(damage, 300);
    this.updateHealthBars();
    
    this.isPlayerTurn = true;
    this.updateTurnIndicator();
    
    this.checkBattleEnd();
  }
  
  private checkBattleEnd(): void {
    if (this.enemyHp <= 0) {
      this.isBattleOver = true;
      this.addBattleLog('VICTORY!');
      gameSystems.eventBus.emit('battle:end', { victory: true });
      this.time.delayedCall(2000, () => this.endBattle(true));
      return;
    }
    
    if (this.playerHp <= 0) {
      this.isBattleOver = true;
      this.addBattleLog('DEFEAT...');
      this.time.delayedCall(2000, () => this.endBattle(false));
      return;
    }
    
    // Schedule next enemy turn
    if (!this.isPlayerTurn && !this.isBattleOver) {
      this.time.delayedCall(1500, () => this.enemyTurn());
    }
  }
  
  private updateHealthBars(): void {
    if (!this.uiElements) return;
    
    // Player HP
    const playerPercent = this.playerHp / this.playerMaxHp;
    this.uiElements.playerHp.setDisplaySize(250 * playerPercent, 24);
    this.uiElements.playerHpText.setText(`${this.playerHp}/${this.playerMaxHp}`);
    
    // Enemy HP
    const enemyPercent = this.enemyHp / this.enemyMaxHp;
    this.uiElements.enemyHp.setDisplaySize(250 * enemyPercent, 24);
    this.uiElements.enemyHpText.setText(`${this.enemyHp}/${this.enemyMaxHp}`);
  }
  
  private updateManaBar(): void {
    if (!this.uiElements) return;
    // Mana bar update would go here
  }
  
  private addBattleLog(message: string): void {
    if (!this.uiElements) return;
    this.uiElements.logText.setText(message);
    
    // Flash effect
    this.tweens.add({
      targets: this.uiElements.logText,
      alpha: 0.5,
      duration: 100,
      yoyo: true
    });
  }
  
  private showDamageNumber(damage: number, x: number): void {
    const text = this.add.text(x, 300, `-${damage}`, {
      fontSize: '32px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ef4444'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      y: 200,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
  
  private endBattle(victory: boolean, fled: boolean = false): void {
    // Give rewards if victory
    if (victory) {
      const expGain = 25;
      const goldGain = 15;
      
      // Add gold
      gameSystems.inventory.addGold(goldGain);
      
      this.addBattleLog(`+${expGain} EXP, +${goldGain} Gold`);
    }
    
    // Return to world
    this.time.delayedCall(2000, () => {
      this.scene.stop();
      this.scene.resume('WorldScene');
    });
  }
}
