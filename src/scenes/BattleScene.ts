// ==========================================
// BATTLE SCENE - Turn-based RPG combat with puzzles
// ==========================================

import Phaser from 'phaser';
import { COLORS } from '../config/constants';
import { audioManager } from '../audio/AudioManager';

interface BattleBuddy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
  type: string;
  sprite: string;
  level: number;
}

export class BattleScene extends Phaser.Scene {
  // Player team
  private playerTeam: BattleBuddy[] = [];
  private playerIndex = 0;
  
  // Enemy team
  private enemyTeam: BattleBuddy[] = [];
  private enemyIndex = 0;
  
  // UI
  private playerBuddy!: Phaser.GameObjects.Container;
  private enemyBuddy!: Phaser.GameObjects.Container;
  private actionButtons: Phaser.GameObjects.Container[] = [];
  private battleLog!: Phaser.GameObjects.Text;
  private playerHPBar!: Phaser.GameObjects.Graphics;
  private enemyHPBar!: Phaser.GameObjects.Graphics;
  
  // State
  private isPlayerTurn = true;
  private isAnimating = false;
  private currentPhase: 'select' | 'puzzle' | 'result' = 'select';
  
  // Puzzle system
  private puzzleSymbols: string[] = ['🔴', '🔵', '🟢', '🟡'];
  private puzzleSequence: string[] = [];
  private playerSequence: string[] = [];
  private puzzleActive = false;
  
  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0d0d1a');
    
    // Initialize teams
    this.initTeams();
    
    // Create background
    this.createBackground();
    
    // Create battle arena
    this.createArena();
    
    // Create buddies
    this.createPlayerBuddy();
    this.createEnemyBuddy();
    
    // Create UI
    this.createHPBars();
    this.createActionButtons();
    this.createBattleLog();
    this.createBackButton();
    
    // Show intro
    this.showBattleIntro();
    
    console.log('⚔️ Battle started!');
  }

  private initTeams(): void {
    this.playerTeam = [
      {
        name: 'Bubbleslime',
        hp: 80, maxHp: 80, atk: 12, def: 8, speed: 15,
        type: 'water', sprite: 'buddy_slime_common', level: 1,
      },
    ];
    this.enemyTeam = [
      {
        name: 'Wild Slime', hp: 50, maxHp: 50, atk: 10, def: 5, speed: 12,
        type: 'nature', sprite: 'buddy_slime_common', level: 1,
      },
    ];
  }

  private createBackground(): void {
    // Battle arena gradient
    const graphics = this.add.graphics();
    
    // Dark purple arena
    for (let y = 0; y < this.scale.height; y += 4) {
      const alpha = 0.1 + (y / this.scale.height) * 0.1;
      graphics.fillStyle(0xa855f7, alpha);
      graphics.fillRect(0, y, this.scale.width, 4);
    }
    
    // Arena platform
    const platform = this.add.graphics();
    platform.fillStyle(0x4d3b6e, 1);
    platform.fillEllipse(this.scale.width / 2, this.scale.height - 100, 600, 80);
  }

  private createArena(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // VS text
    this.add.text(width / 2, height * 0.35, '⚔️ VS ⚔️', {
      fontSize: '24px',
      color: COLORS.gold,
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);
    
    // Decorative particles
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(100, height - 200);
      
      const sparkle = this.add.text(x, y, '✨', {
        fontSize: '12px',
      }).setAlpha(0.3);
      
      this.tweens.add({
        targets: sparkle,
        y: y - 30,
        alpha: 0.1,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }
  }

  private createPlayerBuddy(): void {
    const player = this.playerTeam[this.playerIndex];
    const x = this.scale.width * 0.25;
    const y = this.scale.height * 0.45;
    
    this.playerBuddy = this.add.container(x, y);
    
    // Glow
    const glow = this.add.graphics();
    glow.fillStyle(0x06b6d4, 0.4);
    glow.fillCircle(0, 0, 50);
    this.playerBuddy.add(glow);
    
    // Body (cute blob)
    const body = this.add.graphics();
    body.fillStyle(0x87CEEB, 1);
    body.fillCircle(0, -5, 35);
    body.fillStyle(0xB0E0E6, 0.6);
    body.fillCircle(-8, -15, 15);
    this.playerBuddy.add(body);
    
    // Face
    const face = this.add.graphics();
    face.fillStyle(0xffffff, 1);
    face.fillCircle(-10, -5, 10);
    face.fillCircle(10, -5, 10);
    face.fillStyle(0x1a1a2e, 1);
    face.fillCircle(-8, -4, 5);
    face.fillCircle(12, -4, 5);
    // Cheeks
    face.fillStyle(0xff69b4, 0.5);
    face.fillCircle(-18, 5, 5);
    face.fillCircle(18, 5, 5);
    // Smile
    face.lineStyle(3, 0x1a1a2e, 1);
    face.arc(0, 5, 10, 0.2 * Math.PI, 0.8 * Math.PI, false);
    this.playerBuddy.add(face);
    
    // Name tag
    this.add.text(x, y - 70, player.name, {
      fontSize: '16px',
      color: '#06b6d4',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Idle bounce
    this.tweens.add({
      targets: this.playerBuddy,
      y: y + 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createEnemyBuddy(): void {
    const enemy = this.enemyTeam[this.enemyIndex];
    const x = this.scale.width * 0.75;
    const y = this.scale.height * 0.45;
    
    this.enemyBuddy = this.add.container(x, y);
    
    // Glow (red for enemy)
    const glow = this.add.graphics();
    glow.fillStyle(0xef4444, 0.4);
    glow.fillCircle(0, 0, 50);
    this.enemyBuddy.add(glow);
    
    // Body (angry slime)
    const body = this.add.graphics();
    body.fillStyle(0x22c55e, 1);
    body.fillCircle(0, -5, 35);
    body.fillStyle(0x4ade80, 0.6);
    body.fillCircle(-8, -15, 15);
    this.enemyBuddy.add(body);
    
    // Face (angry)
    const face = this.add.graphics();
    face.fillStyle(0xffffff, 1);
    face.fillCircle(-10, -5, 10);
    face.fillCircle(10, -5, 10);
    face.fillStyle(0x1a1a2e, 1);
    face.fillCircle(-8, -4, 5);
    face.fillCircle(12, -4, 5);
    // Angry eyebrows
    face.lineStyle(3, 0x1a1a2e, 1);
    face.moveTo(-18, -18);
    face.lineTo(-5, -12);
    face.moveTo(18, -18);
    face.lineTo(5, -12);
    face.stroke();
    // Angry mouth
    face.beginPath();
    face.arc(0, 12, 8, 1.1 * Math.PI, 1.9 * Math.PI);
    face.stroke();
    this.enemyBuddy.add(face);
    
    // Name tag
    this.add.text(x, y - 70, enemy.name, {
      fontSize: '16px',
      color: '#ef4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    // Idle bounce (opposite timing)
    this.tweens.add({
      targets: this.enemyBuddy,
      y: y + 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 400,
    });
  }

  private createHPBars(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Player HP bar
    const playerHP = this.playerTeam[this.playerIndex];
    
    this.add.text(50, 70, 'Your Buddy', {
      fontSize: '14px',
      color: '#ffffff',
    });
    
    this.playerHPBar = this.add.graphics();
    this.updateHPBar(this.playerHPBar, 50, 90, 150, playerHP.hp, playerHP.maxHp, 0x06b6d4);
    
    // Enemy HP bar
    const enemyHP = this.enemyTeam[this.enemyIndex];
    
    this.add.text(width - 200, 70, 'Enemy', {
      fontSize: '14px',
      color: '#ffffff',
    });
    
    this.enemyHPBar = this.add.graphics();
    this.updateHPBar(this.enemyHPBar, width - 200, 90, 150, enemyHP.hp, enemyHP.maxHp, 0xef4444);
  }

  private updateHPBar(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    current: number,
    max: number,
    color: number
  ): void {
    graphics.clear();
    
    // Background
    graphics.fillStyle(0x2d1b4e, 1);
    graphics.fillRoundedRect(x, y, width, 20, 5);
    
    // HP fill
    const fillWidth = (current / max) * (width - 4);
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x + 2, y + 2, Math.max(0, fillWidth), 16, 3);
    
    // HP text
    this.add.text(x + width / 2, y + 10, `${Math.floor(current)}/${max}`, {
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  private createActionButtons(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    this.actionButtons = [];
    
    const actions = [
      { icon: '⚔️', label: 'ATTACK', color: 0xef4444, action: () => this.startPuzzleAttack() },
      { icon: '🛡️', label: 'DEFEND', color: 0x3b82f6, action: () => this.defend() },
      { icon: '🧪', label: 'ITEM', color: 0x22c55e, action: () => this.useItem() },
      { icon: '🏃', label: 'RUN', color: 0x6b7280, action: () => this.flee() },
    ];
    
    actions.forEach((action, i) => {
      const btn = this.add.container(width / 2, height - 80);
      
      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(action.color, 1);
      bg.fillRoundedRect(-60, -25, 120, 50, 10);
      bg.lineStyle(2, 0xffffff, 0.3);
      bg.strokeRoundedRect(-60, -25, 120, 50, 10);
      btn.add(bg);
      
      // Icon
      const icon = this.add.text(-30, -5, action.icon, { fontSize: '24px' }).setOrigin(0.5);
      btn.add(icon);
      
      // Label
      const label = this.add.text(20, -5, action.label, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);
      btn.add(label);
      
      // Hit area
      const hit = this.add.rectangle(0, 0, 140, 60).setInteractive({ useHandCursor: true }).setAlpha(0.001);
      btn.add(hit);
      
      hit.on('pointerdown', () => {
        if (!this.isAnimating && this.isPlayerTurn) {
          audioManager.playClick?.();
          this.isAnimating = true;
          action.action();
        }
      });
      
      hit.on('pointerover', () => {
        this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
      });
      
      hit.on('pointerout', () => {
        this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
      });
      
      this.actionButtons.push(btn);
    });
    
    // Disable buttons initially
    this.setButtonsEnabled(false);
  }

  private createBattleLog(): void {
    const width = this.scale.width;
    
    this.battleLog = this.add.text(width / 2, this.scale.height - 150, 'Choose your action!', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Georgia, serif',
      backgroundColor: '#1a0a2e',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);
  }

  private createBackButton(): void {
    const backBtn = this.add.container(35, 30);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2d1b4e, 0.9);
    bg.fillRoundedRect(-18, -18, 36, 36, 8);
    bg.lineStyle(2, 0xa855f7, 0.6);
    bg.strokeRoundedRect(-18, -18, 36, 36, 8);
    backBtn.add(bg);
    
    const icon = this.add.text(0, 0, '✕', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    backBtn.add(icon);
    
    const hit = this.add.rectangle(0, 0, 46, 46).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    backBtn.add(hit);
    
    hit.on('pointerdown', () => {
      audioManager.playClick?.();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('WorldScene');
      });
    });
  }

  private showBattleIntro(): void {
    const enemy = this.enemyTeam[this.enemyIndex];
    
    this.battleLog.setText(`A wild ${enemy.name} appeared!`);
    
    this.time.delayedCall(1500, () => {
      this.isPlayerTurn = true;
      this.setButtonsEnabled(true);
      this.battleLog.setText('Choose your action!');
    });
  }

  private startPuzzleAttack(): void {
    this.currentPhase = 'puzzle';
    this.puzzleActive = true;
    
    // Generate sequence
    this.puzzleSequence = [];
    for (let i = 0; i < 4; i++) {
      this.puzzleSequence.push(this.puzzleSymbols[Phaser.Math.Between(0, 3)]);
    }
    
    // Show puzzle
    this.showPuzzleUI();
    
    this.battleLog.setText('Quick! Match the symbols!');
  }

  private showPuzzleUI(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Puzzle container
    const puzzleContainer = this.add.container(width / 2, height * 0.25).setName('puzzle');
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a2e, 0.95);
    bg.fillRoundedRect(-150, -60, 300, 120, 15);
    bg.lineStyle(3, 0xa855f7, 0.8);
    bg.strokeRoundedRect(-150, -60, 300, 120, 15);
    puzzleContainer.add(bg);
    
    // Sequence display
    this.add.text(0, -35, 'Watch the pattern:', {
      fontSize: '14px',
      color: '#a78bfa',
    }).setOrigin(0.5);
    
    // Symbols
    const symbolText = this.add.text(0, 5, this.puzzleSequence.join(' '), {
      fontSize: '32px',
    }).setOrigin(0.5);
    puzzleContainer.add(symbolText);
    
    // Your turn indicator
    const indicator = this.add.text(0, 45, 'Your turn! Tap the symbols:', {
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);
    puzzleContainer.add(indicator);
    
    // Symbol buttons
    const btnY = height * 0.65;
    this.puzzleSymbols.forEach((sym, i) => {
      const btnX = width * 0.2 + i * width * 0.15;
      
      const symBtn = this.add.container(btnX, btnY);
      
      const bg = this.add.graphics();
      bg.fillStyle(0x4d3b6e, 1);
      bg.fillRoundedRect(-30, -30, 60, 60, 12);
      bg.lineStyle(2, 0xa855f7, 0.6);
      bg.strokeRoundedRect(-30, -30, 60, 60, 12);
      symBtn.add(bg);
      
      const label = this.add.text(0, 0, sym, { fontSize: '28px' }).setOrigin(0.5);
      symBtn.add(label);
      
      const hit = this.add.rectangle(0, 0, 70, 70).setInteractive({ useHandCursor: true }).setAlpha(0.001);
      symBtn.add(hit);
      
      hit.on('pointerdown', () => {
        audioManager.playClick?.();
        this.playerSequence.push(sym);
        
        // Visual feedback
        this.tweens.add({
          targets: symBtn,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 50,
          yoyo: true,
        });
        
        this.checkPuzzleProgress();
      });
    });
    
    // Animate sequence display
    let showIndex = 0;
    const showNext = () => {
      if (showIndex < this.puzzleSequence.length) {
        symbolText.setText(this.puzzleSequence[showIndex]);
        this.tweens.add({
          targets: symbolText,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 200,
          yoyo: true,
          onComplete: () => {
            showIndex++;
            showNext();
          }
        });
      } else {
        // Show full sequence
        symbolText.setText(this.puzzleSequence.join(' '));
        
        // Start player input
        this.time.delayedCall(500, () => {
          indicator.setText('Your turn! Tap the symbols in order:');
        });
      }
    };
    
    showNext();
  }

  private checkPuzzleProgress(): void {
    const idx = this.playerSequence.length - 1;
    
    if (this.playerSequence[idx] !== this.puzzleSequence[idx]) {
      // Wrong!
      this.battleLog.setText('❌ Wrong! Try again...');
      this.playerSequence = [];
      this.showPuzzleResult(false);
      return;
    }
    
    if (this.playerSequence.length === this.puzzleSequence.length) {
      // Correct!
      this.battleLog.setText('✨ Perfect!');
      this.showPuzzleResult(true);
    }
  }

  private showPuzzleResult(success: boolean): void {
    this.puzzleActive = false;
    
    // Remove puzzle UI
    const puzzle = this.children.getByName('puzzle') as Phaser.GameObjects.Container;
    if (puzzle) {
      puzzle.destroy();
    }
    
    // Damage calculation based on success
    const player = this.playerTeam[this.playerIndex];
    const enemy = this.enemyTeam[this.enemyIndex];
    
    if (success) {
      // Critical hit!
      const damage = Math.floor(player.atk * 2);
      enemy.hp = Math.max(0, enemy.hp - damage);
      
      this.showDamageEffect(this.enemyBuddy, damage, true);
      this.battleLog.setText(`Critical hit! ${damage} damage!`);
      audioManager.playVictory?.();
      
      // Update HP bar
      this.updateHPBar(this.enemyHPBar, this.scale.width - 200, 90, 150, enemy.hp, enemy.maxHp, 0xef4444);
      
      this.time.delayedCall(1000, () => {
        this.checkBattleEnd();
      });
    } else {
      // Normal attack
      const damage = Math.floor(player.atk * 0.5);
      enemy.hp = Math.max(0, enemy.hp - damage);
      
      this.showDamageEffect(this.enemyBuddy, damage, false);
      this.battleLog.setText(`${player.name} attacks! ${damage} damage!`);
      audioManager.playHit?.();
      
      this.updateHPBar(this.enemyHPBar, this.scale.width - 200, 90, 150, enemy.hp, enemy.maxHp, 0xef4444);
      
      this.time.delayedCall(1000, () => {
        this.isPlayerTurn = false;
        this.isAnimating = false;
        this.enemyTurn();
      });
    }
  }

  private defend(): void {
    this.battleLog.setText('🛡️ Defending...');
    
    const player = this.playerTeam[this.playerIndex];
    player.def *= 1.5;
    
    this.tweens.add({
      targets: this.playerBuddy,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 200,
      yoyo: true,
    });
    
    this.time.delayedCall(1000, () => {
      player.def /= 1.5;
      this.isPlayerTurn = false;
      this.isAnimating = false;
      this.enemyTurn();
    });
  }

  private useItem(): void {
    this.battleLog.setText('💊 Using item...');
    
    const player = this.playerTeam[this.playerIndex];
    player.hp = Math.min(player.maxHp, player.hp + 30);
    
    this.updateHPBar(this.playerHPBar, 50, 90, 150, player.hp, player.maxHp, 0x06b6d4);
    
    // Heal effect
    const healEffect = this.add.text(this.scale.width * 0.25, this.scale.height * 0.4, '+30 HP', {
      fontSize: '24px',
      color: '#22c55e',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: healEffect,
      y: this.scale.height * 0.3,
      alpha: 0,
      duration: 1000,
      onComplete: () => healEffect.destroy(),
    });
    
    this.time.delayedCall(1000, () => {
      this.isPlayerTurn = false;
      this.isAnimating = false;
      this.enemyTurn();
    });
  }

  private flee(): void {
    this.battleLog.setText('🏃 Attempting to flee...');
    
    const chance = Math.random();
    
    this.time.delayedCall(1000, () => {
      if (chance > 0.5) {
        this.battleLog.setText('Got away safely!');
        this.time.delayedCall(1000, () => {
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.time.delayedCall(300, () => {
            this.scene.start('WorldScene');
          });
        });
      } else {
        this.battleLog.setText("Can't escape!");
        this.isPlayerTurn = false;
        this.isAnimating = false;
        this.enemyTurn();
      }
    });
  }

  private enemyTurn(): void {
    if (this.enemyTeam[this.enemyIndex].hp <= 0) {
      this.checkBattleEnd();
      return;
    }
    
    this.battleLog.setText(`${this.enemyTeam[this.enemyIndex].name}'s turn!`);
    
    this.time.delayedCall(1000, () => {
      const player = this.playerTeam[this.playerIndex];
      const enemy = this.enemyTeam[this.enemyIndex];
      
      const damage = Math.max(1, enemy.atk - player.def / 2);
      player.hp = Math.max(0, player.hp - damage);
      
      this.showDamageEffect(this.playerBuddy, damage, false);
      this.battleLog.setText(`${enemy.name} attacks! ${damage} damage!`);
      audioManager.playHit?.();
      
      this.updateHPBar(this.playerHPBar, 50, 90, 150, player.hp, player.maxHp, 0x06b6d4);
      
      this.time.delayedCall(1000, () => {
        if (player.hp <= 0) {
          this.showDefeat();
        } else {
          this.isPlayerTurn = true;
          this.isAnimating = false;
          this.setButtonsEnabled(true);
          this.battleLog.setText('Choose your action!');
        }
      });
    });
  }

  private showDamageEffect(target: Phaser.GameObjects.Container, damage: number, isCritical: boolean): void {
    // Flash red
    this.tweens.add({
      targets: target,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });
    
    // Damage number
    const dmgText = this.add.text(target.x, target.y - 50, `-${damage}`, {
      fontSize: isCritical ? '32px' : '24px',
      color: isCritical ? '#FFD700' : '#ef4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: dmgText,
      y: target.y - 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => dmgText.destroy(),
    });
  }

  private checkBattleEnd(): void {
    const enemy = this.enemyTeam[this.enemyIndex];
    
    if (enemy.hp <= 0) {
      this.showVictory();
    } else {
      this.isPlayerTurn = true;
      this.isAnimating = false;
      this.setButtonsEnabled(true);
      this.battleLog.setText('Choose your action!');
    }
  }

  private showVictory(): void {
    this.setButtonsEnabled(false);
    
    this.battleLog.setText('🎉 Victory!');
    audioManager.playVictory?.();
    
    // Victory animation
    this.tweens.add({
      targets: this.playerBuddy,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 300,
      yoyo: true,
      repeat: 2,
    });
    
    // Reward
    this.time.delayedCall(2000, () => {
      this.showReward();
    });
  }

  private showDefeat(): void {
    this.setButtonsEnabled(false);
    
    this.battleLog.setText('💀 Defeat...');
    audioManager.playHit?.();
    
    this.tweens.add({
      targets: this.playerBuddy,
      alpha: 0.3,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 500,
    });
    
    this.time.delayedCall(2000, () => {
      this.showReward();
    });
  }

  private showReward(): void {
    const enemy = this.enemyTeam[this.enemyIndex];
    const reward = 50 + enemy.level * 10;
    
    const rewardText = this.add.text(this.scale.width / 2, this.scale.height / 2, `Earned ${reward} coins!`, {
      fontSize: '24px',
      color: '#FFD700',
      fontStyle: 'bold',
      backgroundColor: '#1a0a2e',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: rewardText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
    });
    
    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('WorldScene');
      });
    });
  }

  private setButtonsEnabled(enabled: boolean): void {
    this.actionButtons.forEach(btn => {
      (btn as any).inputEnabled = enabled;
      btn.setAlpha(enabled ? 1 : 0.5);
    });
  }
}