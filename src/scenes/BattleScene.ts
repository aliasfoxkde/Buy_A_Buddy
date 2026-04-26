/**
 * Battle Scene - Turn-based combat with full UI
 */

import Phaser from 'phaser';
import { gameSystems } from '../systems/GameSystems';
import { audioManager } from '../audio/AudioManager';
import { VisualEffects } from '../utils/VisualEffects';
import { LevelUpUI } from '../ui/LevelUpUI';
import { DeathScreen } from '../ui/DeathScreen';
import { ParticleSystem } from '../utils/ParticleSystem';
import { achievementSystem } from '../systems/AchievementSystem';
import { getRandomEnemy, getEnemy, scaleEnemyStats, EnemyType } from '../data/enemies';
import { SKILLS, getClassSkills, type Skill } from '../data/skills';

export class BattleScene extends Phaser.Scene {
  private playerEntity: any = null;
  private enemyEntity: any = null;
  private currentEnemy!: EnemyType;
  
  private uiElements: {
    playerHp: Phaser.GameObjects.Rectangle;
    playerHpText: Phaser.GameObjects.Text;
    enemyHp: Phaser.GameObjects.Rectangle;
    enemyHpText: Phaser.GameObjects.Text;
    enemyName: Phaser.GameObjects.Text;
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
  private playerMp: number = 50;
  private playerMaxMp: number = 50;
  private enemyMaxHp: number = 40;
  private enemyHp: number = 40;
  private enemyDamage: number = 8;
  private battleMusicStarted: boolean = false;
  private vfx!: VisualEffects;
  private levelUpUI!: LevelUpUI;
  private deathScreen!: DeathScreen;
  private particleSystem!: ParticleSystem;
  private isPlayerDefeated: boolean = false;
  private skillCooldowns: Map<string, number> = new Map();
  private availableSkills: Skill[] = [];
  private skillButtons: Phaser.GameObjects.Container[] = [];
  
  constructor() {
    super({ key: 'BattleScene' });
  }
  
  create(): void {
    // Get scene data (passed from WorldScene)
    const sceneData = this.scene.settings.data as any || {};
    
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
    
    // Start battle music
    this.startBattleMusic();
    
    // Initialize visual effects
    this.vfx = new VisualEffects(this);
    
    // Initialize level up UI
    this.levelUpUI = new LevelUpUI(this);
    
    // Initialize death screen
    this.deathScreen = new DeathScreen(this);
    this.deathScreen.hide();
    
    // Initialize particle system
    this.particleSystem = new ParticleSystem(this);
    
    // Initialize skills
    this.availableSkills = getClassSkills('default');
    this.createSkillPanel(width, height);
    
    // Listen for player level up
    gameSystems.eventBus.on('entity:levelUp', (event: any) => {
      if (event.entity === gameSystems.player) {
        const stats = gameSystems.getPlayerStats();
        this.levelUpUI.showLevelUp(stats.level, {
          hp: 10,
          attack: 2,
          defense: 1
        });
      }
    });
  }
  
  private startBattleMusic(): void {
    if (!this.battleMusicStarted) {
      audioManager.playBattleMusic();
      this.battleMusicStarted = true;
    }
  }
  
  private initializeBattle(): void {
    // Get scene data (passed from WorldScene)
    const sceneData = this.scene.settings.data as any || {};
    const isBoss = sceneData.isBoss || false;
    const specifiedEnemyId = sceneData.enemyId || null;
    
    // Get player stats from game systems
    const stats = gameSystems.getPlayerStats();
    if (stats) {
      this.playerMaxHp = stats.maxHealth;
      this.playerHp = stats.health;
    }
    
    // Select enemy based on context
    const playerLevel = stats?.level || 1;
    if (isBoss && specifiedEnemyId) {
      // Boss encounter - use specified boss
      const bossEnemy = getEnemy(specifiedEnemyId);
      if (bossEnemy) {
        this.currentEnemy = bossEnemy;
      } else {
        this.currentEnemy = getRandomEnemy(playerLevel);
      }
    } else {
      // Normal encounter - random enemy
      this.currentEnemy = getRandomEnemy(playerLevel);
    }
    
    // Scale enemy stats
    const scaledEnemy = scaleEnemyStats(this.currentEnemy, playerLevel);
    this.enemyMaxHp = scaledEnemy.maxHp;
    this.enemyHp = scaledEnemy.maxHp;
    this.enemyDamage = scaledEnemy.damage;
    
    // Set enemy sprite based on type
    const enemySprite = this.add.sprite(900, 280, 'enemies');
    enemySprite.setFrame(this.currentEnemy.spriteIndex);
    enemySprite.setScale(1.5);
    
    // Add enemy name to UI with level and type indicator
    if (this.uiElements) {
      this.uiElements.enemyName?.destroy();
      const playerLevel = gameSystems.getPlayerStats()?.level || 1;
      const enemyLevel = this.currentEnemy.level || playerLevel;
      
      // Enemy type indicator
      let typeIndicator = '';
      if (this.currentEnemy.range) typeIndicator = ' [Ranged]';
      if (this.currentEnemy.element === 'air') typeIndicator = ' [Flying]';
      if (this.currentEnemy.element === 'undead') typeIndicator = ' [Undead]';
      
      const levelText = enemyLevel > playerLevel ? ' ⚠️' : '';
      
      this.uiElements.enemyName = this.add.text(this.scale.width - 250, 160, 
        `${this.currentEnemy.name}${typeIndicator} [Lv.${enemyLevel}]${levelText}`, {
        fontSize: '18px',
        fontFamily: 'Arial Black, sans-serif',
        color: enemyLevel > playerLevel ? '#f59e0b' : '#ef4444'
      }).setOrigin(0.5);
    }
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
  
  private createSkillPanel(width: number, height: number): void {
    const panelY = height - 60;
    
    // Skill bar background
    const skillBg = this.add.rectangle(width / 2, panelY, 600, 50, 0x0a0a15);
    skillBg.setStrokeStyle(1, 0x3b82f6);
    
    // Create skill buttons
    this.skillButtons = [];
    this.availableSkills.forEach((skill, i) => {
      const x = 150 + i * 100;
      const btn = this.createSkillButton(x, panelY, skill);
      this.skillButtons.push(btn);
    });
  }
  
  private createSkillButton(x: number, y: number, skill: Skill): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Skill background
    const bg = this.add.rectangle(0, 0, 80, 40, 0x2d1b4e);
    bg.setStrokeStyle(2, skill.manaCost > 0 ? 0x3b82f6 : 0x555);
    
    // Skill icon
    const icon = this.add.text(-25, 0, skill.icon, {
      fontSize: '20px'
    }).setOrigin(0.5);
    
    // Skill name
    const name = this.add.text(10, 0, skill.name.substring(0, 6), {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    }).setOrigin(0, 0.5);
    
    // Cooldown overlay
    const cooldown = this.skillCooldowns.get(skill.id) || 0;
    if (cooldown > 0) {
      bg.setFillStyle(0x333333, 0.8);
      const cdText = this.add.text(0, 0, `${cooldown}`, {
        fontSize: '16px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#ef4444'
      }).setOrigin(0.5);
      container.add([bg, cdText]);
    } else {
      container.add([bg, icon, name]);
    }
    
    container.setSize(80, 40);
    container.setInteractive({ useHandCursor: true });
    
    // Skill click handler
    container.on('pointerdown', () => {
      if (this.isPlayerTurn && cooldown === 0) {
        this.useSkill(skill);
      }
    });
    
    container.on('pointerover', () => {
      bg.setStrokeStyle(2, 0xfbbf24);
    });
    
    container.on('pointerout', () => {
      bg.setStrokeStyle(2, skill.manaCost > 0 ? 0x3b82f6 : 0x555);
    });
    
    return container;
  }
  
  private useSkill(skill: Skill): void {
    if (!this.isPlayerTurn || this.isBattleOver) return;
    
    // Check mana
    const stats = gameSystems.getPlayerStats();
    if (stats && stats.mana < skill.manaCost) {
      this.addBattleLog('Not enough mana!');
      return;
    }
    
    this.isPlayerTurn = false;
    
    // Apply skill effect
    if (skill.type === 'attack' && skill.damage) {
      const baseDamage = stats?.attack || 10;
      const damage = Math.floor(baseDamage * skill.damage);
      this.enemyHp = Math.max(0, this.enemyHp - damage);
      this.addBattleLog(`${skill.name}! -${damage} HP`);
      this.showDamageNumber(damage, 900);
      
      // Decrease enemy HP bar
      const enemyPercent = this.enemyHp / this.enemyMaxHp;
      if (this.uiElements?.enemyHp) {
        (this.uiElements.enemyHp as Phaser.GameObjects.Rectangle).setScale(enemyPercent, 1);
      }
      
    } else if (skill.type === 'heal' && skill.healAmount) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + skill.healAmount);
      this.addBattleLog(`${skill.name}! +${skill.healAmount} HP`);
      this.particleSystem.showHealNumber(300, 280, skill.healAmount);
      
      // Update player HP bar
      const playerPercent = this.playerHp / this.playerMaxHp;
      if (this.uiElements?.playerHp) {
        (this.uiElements.playerHp as Phaser.GameObjects.Rectangle).setScale(playerPercent, 1);
      }
      
    } else if (skill.type === 'defense' && skill.defenseBonus) {
      this.addBattleLog(`${skill.name}! Defense up!`);
      // Defense would be applied during enemy turn
    }
    
    // Set cooldown
    if (skill.cooldown > 0) {
      this.skillCooldowns.set(skill.id, skill.cooldown);
    }
    
    // Disable all skill buttons
    this.skillButtons.forEach(btn => btn.removeInteractive());
    
    // Check battle end
    this.checkBattleEnd();
  }
  
  private updateSkillCooldowns(): void {
    // Reduce cooldowns at start of player turn
    for (const [skillId, cooldown] of this.skillCooldowns) {
      if (cooldown > 0) {
        this.skillCooldowns.set(skillId, cooldown - 1);
      }
    }
    
    // Re-enable skill buttons if player turn
    if (this.isPlayerTurn) {
      this.skillButtons.forEach((btn, i) => {
        const skill = this.availableSkills[i];
        const cooldown = this.skillCooldowns.get(skill.id) || 0;
        if (cooldown === 0) {
          btn.setInteractive({ useHandCursor: true });
        }
      });
    }
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
    this.uiElements!.turnIndicator = this.add.text(width / 2, 70, 'YOUR TURN', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#22c55e'
    }).setOrigin(0.5);
  }
  
  private updateTurnIndicator(): void {
    if (!this.uiElements) return;
    
    const text = this.isPlayerTurn ? 'YOUR TURN' : 'ENEMY TURN';
    const color = this.isPlayerTurn ? '#22c55e' : '#ef4444';
    
    this.uiElements.turnIndicator?.destroy();
    this.uiElements.turnIndicator = this.add.text(this.scale.width / 2, 70, text, {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: color
    }).setOrigin(0.5);
  }
  
  private playerAttack(): void {
    if (!this.isPlayerTurn || this.isBattleOver) return;
    
    // Update skill cooldowns at start of turn
    this.updateSkillCooldowns();
    
    // Play attack sound
    audioManager.playAttack();
    
    // Calculate damage with equipment bonus
    const stats = gameSystems.getPlayerStats();
    let baseDamage = stats?.attack || 10;
    
    // Simple equipment bonus - check inventory for weapons
    const inventory = gameSystems.inventory.getInventory();
    for (const slot of inventory.slots) {
      if (slot?.itemId && (
        slot.itemId.includes('silver') || 
        slot.itemId.includes('iron') || 
        slot.itemId.includes('steel')
      )) {
        baseDamage += 5; // Weapon bonus
      }
    }
    
    const damage = Math.max(1, baseDamage + Math.floor(Math.random() * 8) - 4);
    
    // Critical hit check (10% base chance)
    const isCrit = Math.random() < 0.1;
    const finalDamage = isCrit ? Math.floor(damage * 1.5) : damage;
    
    this.enemyHp = Math.max(0, this.enemyHp - finalDamage);
    
    this.addBattleLog(`Hero attacks for ${finalDamage} damage!`);
    
    // Show damage number
    this.showDamageNumber(finalDamage, 900, isCrit);
    
    // Screen shake on hit (stronger on crit)
    this.vfx.shake(isCrit ? 0.015 : 0.008, 100);
    
    // Particles on enemy (red for normal, gold for crit)
    this.vfx.showHitParticles(900, 300, isCrit ? 0xfbbf24 : 0xff4444, isCrit ? 20 : 8);
    
    // Critical hit text
    if (isCrit) {
      this.showCriticalHitText(900, 250);
    }
    
    this.isPlayerTurn = false;
    this.updateTurnIndicator();
    this.checkBattleEnd();
  }
  
  private playerDefend(): void {
    if (!this.isPlayerTurn || this.isBattleOver) return;
    
    // Update skill cooldowns
    this.updateSkillCooldowns();
    
    audioManager.playDefend();
    this.addBattleLog('Hero takes a defensive stance!');
    
    this.isPlayerTurn = false;
    this.updateTurnIndicator();
    this.checkBattleEnd();
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
      
      // Play heal sound
      audioManager.playHeal();
      
      this.addBattleLog(`Hero drinks a potion and heals ${healAmount} HP!`);
      this.updateHealthBars();
      this.vfx.showHealParticles(300, 350);
    }
    
    if (!foundPotion) {
      this.addBattleLog('No health potions available!');
    }
    
    this.isPlayerTurn = false;
    this.updateTurnIndicator();
    this.checkBattleEnd();
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
      this.checkBattleEnd();
    }
  }
  
  private enemyTurn(): void {
    if (this.isBattleOver) return;
    
    // Use scaled enemy damage
    const baseDamage = this.enemyDamage;
    const damage = Math.max(1, baseDamage + Math.floor(Math.random() * 5) - 3);
    
    this.playerHp = Math.max(0, this.playerHp - damage);
    
    this.addBattleLog(`Slime attacks for ${damage} damage!`);
    this.showDamageNumber(damage, 300);
    this.updateHealthBars();
    
    // Screen shake when player takes damage
    this.vfx.heavyShake();
    this.vfx.flash(0xff0000, 100);
    this.vfx.showHitParticles(300, 300, 0xffaa00);
    
    const enemyName = this.currentEnemy?.name || 'Enemy';
    this.addBattleLog(`${enemyName} attacks for ${damage} damage!`);
    if (this.enemyHp <= 0) {
      this.isBattleOver = true;
      this.addBattleLog('VICTORY!');
      gameSystems.eventBus.emit('battle:end', { victory: true });
      this.time.delayedCall(2000, () => this.endBattle(true));
      return;
    }
    
    if (this.playerHp <= 0) {
      this.isBattleOver = true;
      this.isPlayerDefeated = true;
      this.addBattleLog('DEFEAT...');
      
      // Show death screen
      this.deathScreen.show({
        onRespawn: () => this.respawnPlayer(),
        onQuit: () => this.returnToMenu()
      });
      
      return;
    }
    
    // Schedule next enemy turn
    if (!this.isPlayerTurn && !this.isBattleOver) {
      this.time.delayedCall(1500, () => this.enemyTurn());
    }
  }
  
  private checkBattleEnd(): void {
    if (this.enemyHp <= 0) {
      this.isBattleOver = true;
      this.addBattleLog('VICTORY!');
      
      // Emit enemy defeated event for quest tracking
      gameSystems.eventBus.emit('enemy:defeated', { 
        enemyId: this.currentEnemy?.id,
        enemyName: this.currentEnemy?.name
      });
      
      // Track for achievements
      if (this.currentEnemy) {
        achievementSystem.onEnemyDefeated(this.currentEnemy.id);
      }
      
      gameSystems.eventBus.emit('battle:end', { victory: true });
      this.time.delayedCall(2000, () => this.endBattle(true));
      return;
    }
    
    if (this.playerHp <= 0) {
      this.isBattleOver = true;
      this.isPlayerDefeated = true;
      this.addBattleLog('DEFEAT...');
      
      // Show death screen
      this.deathScreen.show({
        onRespawn: () => this.respawnPlayer(),
        onQuit: () => this.returnToMenu()
      });
      
      return;
    }
    
    // Continue to enemy turn if not player turn
    if (!this.isPlayerTurn && !this.isBattleOver) {
      this.time.delayedCall(1500, () => this.enemyTurn());
    }
  }
  
  private respawnPlayer(): void {
    // Respawn player with half HP
    const stats = gameSystems.getPlayerStats();
    if (stats && gameSystems.player) {
      gameSystems.player.stats.currentHealth = Math.floor(stats.maxHealth / 2);
    }
    
    // Return to world
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(500, () => {
      this.scene.stop();
      this.scene.resume('WorldScene');
    });
  }
  
  private returnToMenu(): void {
    // Return to main menu
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(600, () => {
      this.scene.stop('WorldScene');
      this.scene.start('MainMenuScene');
    });
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
  
  private showDamageNumber(damage: number, x: number, isCrit: boolean = false): void {
    // Create damage text with effects
    const textColor = isCrit ? '#fbbf24' : '#ef4444';
    const fontSize = isCrit ? '48px' : '36px';
    const yOffset = isCrit ? 250 : 280;
    
    const text = this.add.text(x, yOffset, `-${damage}`, {
      fontSize,
      fontFamily: 'Arial Black, sans-serif',
      color: textColor,
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    text.setDepth(100);
    
    // Float up and fade
    this.tweens.add({
      targets: text,
      y: yOffset - 50,
      alpha: 0,
      scale: isCrit ? 1.3 : 1.1,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
    
    // Also use particle system
    this.particleSystem.showDamageNumber(x, 300, damage);
  }
  
  private showCriticalHitText(x: number, y: number): void {
    const text = this.add.text(x, y, 'CRITICAL!', {
      fontSize: '24px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fbbf24',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(101);
    
    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      scale: 1.5,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => text.destroy()
    });
  }
  
  private endBattle(victory: boolean, fled: boolean = false): void {
    // Stop battle music
    audioManager.stopMusic();
    
    // Give rewards if victory
    if (victory && this.currentEnemy) {
      const expGain = scaleEnemyStats(this.currentEnemy, gameSystems.getPlayerStats()?.level || 1).xpReward;
      const goldGain = scaleEnemyStats(this.currentEnemy, gameSystems.getPlayerStats()?.level || 1).goldReward;
      
      // Add gold and experience
      gameSystems.inventory.addGold(goldGain);
      if (gameSystems.player) {
        gameSystems.player.gainExperience(expGain);
      }
      
      // Play victory sound
      audioManager.playVictory();
      
      // Victory text overlay
      const victoryText = this.add.text(640, 200, 'VICTORY!', {
        fontSize: '64px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#fbbf24',
        stroke: '#000',
        strokeThickness: 6
      }).setOrigin(0.5).setAlpha(0).setDepth(200);
      
      this.tweens.add({
        targets: victoryText,
        alpha: 1,
        scale: 1.2,
        duration: 500,
        ease: 'Back.easeOut'
      });
      
      // Victory particles using particle system
      this.particleSystem.victoryBurst(640, 300);
      
      // Show gold pickup
      this.particleSystem.showGoldPickup(640, 350, goldGain);
      
      // Show XP gain
      this.particleSystem.showXPGain(640, 250, expGain);
      
      this.addBattleLog(`Victory! +${expGain} EXP, +${goldGain} Gold`);
    } else if (!fled) {
      // Play defeat sound
      audioManager.playDefeat();
      this.addBattleLog('Defeated... Better luck next time!');
    } else {
      this.addBattleLog('Escaped safely!');
    }
    
    // Fade out and return
    this.cameras.main.fadeOut(500);
    
    // Return to world
    this.time.delayedCall(2000, () => {
      this.scene.stop();
      this.scene.resume('WorldScene');
    });
  }
}
