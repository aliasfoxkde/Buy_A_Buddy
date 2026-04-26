# BUY A BUDDY - COMPREHENSIVE IMPROVEMENT PLAN v4.1

**Based on:** GAME_AUDIT_v4.1.md
**Date:** 2026-04-25
**Priority:** Critical fixes → Integration → Polish → Content

---

## PHASE 1: CRITICAL FIXES (30 min)

### 1.1 Register StatsScene in Game Engine ⚡
```typescript
// src/game/gameEngine.ts
import { StatsScene } from '../scenes/StatsScene';
// Add to scene array:
StatsScene,
```

### 1.2 Fix Console Error ⚡
- Investigate BootScene sprite loading
- Check for duplicate texture keys
- Add validation/fallback for missing textures

### 1.3 Validate Set Bonus Calculation ⚡
- Test `calculateSetBonuses()` with equipped items
- Debug why it shows "No Set Bonuses Active"
- Fix InventoryScene to pass correct equipped item IDs

---

## PHASE 2: INTEGRATION GAPS (45 min)

### 2.1 Progress Tracking System
Connect stats tracking throughout the game:

```typescript
// On enemy kill - update progress
gameSystems.eventBus.emit('player:kill', { enemyId, type });
// Listener in StatsScene or dedicated tracker

// On quest complete - update progress
gameSystems.eventBus.emit('quest:complete', { questId });

// On level up - update highest level
gameSystems.eventBus.emit('player:levelUp', { level });
```

### 2.2 Achievement Triggers
Add achievement unlock conditions in WorldScene:

| Trigger | Achievement |
|---------|--------------|
| Kill 1 enemy | First Blood |
| Kill 10 enemies | Monster Slayer |
| Kill 50 enemies | Veteran Hunter |
| Complete 1 quest | Quest Beginner |
| Complete 5 quests | Quest Master |
| Reach level 5 | Level 5 |
| Reach level 10 | Level 10 |
| Earn 1000 gold | Wealthy |
| Collect 7 set pieces | Fashionable |
| Defeat boss | Boss Slayer |

### 2.3 Dialogue Actions
Implement action triggers from dialogue:

```typescript
// In WorldScene dialogue handler:
switch (action) {
  case 'heal_player':
    gameSystems.getPlayer()?.heal(50);
    this.showNotification('You feel rejuvenated!');
    break;
  case 'open_shop':
    this.scene.pause();
    this.scene.launch('ShopScene');
    break;
  case 'buff_player':
    // Apply temporary buff
    break;
}
```

### 2.4 Buddy Combat Integration
Make buddy actually help in battle:

```typescript
// BattleScene - on player attack:
if (buddy && Math.random() < 0.3) {
  const buddyDamage = 5 + (level * 2);
  enemyHp -= buddyDamage;
  this.addBattleLog(`Buddy assists for ${buddyDamage} damage!`);
}
```

---

## PHASE 3: UI/UX POLISH (30 min)

### 3.1 Tooltips
Add missing tooltips using existing TooltipManager:

| Element | Tooltip Content |
|---------|-----------------|
| Skill bar | Name, description, cooldown, mana cost |
| Inventory items | Name, type, stats, sell price |
| Equipment slots | Current item or "Empty" |
| Quest objectives | Progress: X/Y |

### 3.2 Equipment Slot Display
Update InventoryScene to show equipped items:

```typescript
// In createEquipment():
const equipped = gameSystems.inventory.getEquipment();
for (let i = 0; i < 7; i++) {
  const slot = equipped[i];
  if (slot?.item) {
    // Show item icon and name
    icon.setText(getItemEmoji(slot.item.id));
  }
}
```

### 3.3 Skill Bar Enhancements
Make hotbar interactive:

```typescript
// In WorldScene createBottomButtons():
// Add keyboard shortcuts 1-6
// Add cooldown overlay
// Add mana cost indicator
```

---

## PHASE 4: ACCESSIBILITY FIXES (20 min)

### 4.1 Focus Indicators
Add visible focus states:

```css
/* In style.css or component */
button:focus,
.container:focus {
  outline: 3px solid #a855f7;
  outline-offset: 2px;
}
```

### 4.2 Keyboard Navigation
Ensure all UI elements are keyboard accessible:

| Element | Keyboard | Action |
|---------|----------|--------|
| Menu buttons | Tab/Enter | Navigate/Select |
| Inventory | I | Open/Close |
| Quests | Q | Open/Close |
| Settings | ESC | Close |
| HUD buttons | Click | Open respective scenes |

### 4.3 Zoom Handling
Fix zoom up to 200%:

- Ensure UI scales with viewport
- Use relative positioning
- Test at different zoom levels

---

## PHASE 5: BALANCE ADJUSTMENTS (20 min)

### 5.1 Early Game Economy
Increase starting gold and quest rewards:

| Item | Current | Proposed |
|------|---------|----------|
| Starting gold | 100 | 200 |
| Goblin Trouble reward | 50 | 75 |
| Wolf Pack reward | 75 | 100 |

### 5.2 XP Curve Adjustment
Make leveling faster early:

| Level | Current XP | Proposed XP |
|-------|------------|-------------|
| 2 | 100 | 75 |
| 3 | 225 | 150 |
| 4 | 506 | 300 |
| 5 | 1139 | 500 |

### 5.3 Enemy Scaling
Add intermediate enemies:

| Enemy | HP | ATK | DEF | XP | Location |
|-------|-----|-----|-----|-----|----------|
| goblin_archer | 70 | 14 | 4 | 25 | Between goblin and wolf |
| skeleton_warrior | 120 | 25 | 12 | 60 | Between wolf and skeleton |
| orc_warrior | 180 | 35 | 18 | 90 | Before orc |

---

## PHASE 6: CONTENT ADDITIONS (30 min)

### 6.1 New Quests
Add 5 more quests for variety:

1. **Herb Collector** - Collect 10 herbs, 50g + Potion bundle
2. **The Merchant's Request** - Deliver item to NPC, 100g
3. **Training Day** - Kill 5 enemies with buddy assist, 75g
4. **Treasure Hunt** - Find hidden chest, Epic item + 200g
5. **Boss Hunt** - Defeat Slime Boss, 500g + Epic set piece

### 6.2 New Achievements
Add missing achievements:

| ID | Name | Condition | Reward |
|----|------|-----------|--------|
| first_blood | First Blood | Kill 1 enemy | 10g |
| monster_slayer | Monster Slayer | Kill 10 enemies | 50g |
| quest_beginner | Quest Beginner | Complete 1 quest | 25g |
| collector | Collector | Collect 20 items | 100g |
| well_equipped | Well Equipped | Equip 5 items | 30g |

### 6.3 Equipment Set Completion
Add missing set pieces to shop:

| Set | Missing Pieces |
|-----|---------------|
| Dragon Slayer | 4th piece (accessory) |
| Shadow Assassin | Missing boots/accessory |
| Epic tier sets | Dragon Scale set (4 pieces) |

---

## PHASE 7: TECHNICAL IMPROVEMENTS (25 min)

### 7.1 Memory Management
Complete shutdown handlers:

```typescript
// In WorldScene.shutdown():
super.shutdown(); // Call Phaser.Scene shutdown

// In BattleScene.shutdown():
super.shutdown();
this.particleSystem.destroy();
```

### 7.2 TypeScript Strictness
Reduce `as any` casts:

```typescript
// Instead of:
(this.player.body as any).setVelocity(0, 0)

// Use:
if (this.player.body instanceof Phaser.Physics.Arcade.Body) {
  this.player.body.setVelocity(0, 0);
}
```

### 7.3 Save/Load Improvements
Add auto-save:

```typescript
// On scene transitions:
gameSystems.saveGame(slotIndex);

// On game start:
gameSystems.loadGame(slotIndex);
```

---

## IMPLEMENTATION CHECKLIST

### Day 1: Critical Fixes (30 min)
- [ ] Register StatsScene in gameEngine.ts
- [ ] Fix console error (texture key)
- [ ] Validate set bonus calculation
- [ ] Run tests to verify fixes

### Day 2: Integration (45 min)
- [ ] Add progress tracking event listeners
- [ ] Connect achievement triggers
- [ ] Implement dialogue actions
- [ ] Add buddy combat assist

### Day 3: UI/UX (30 min)
- [ ] Add skill bar tooltips
- [ ] Show equipped items in slots
- [ ] Add inventory item tooltips
- [ ] Style improvements

### Day 4: Accessibility (20 min)
- [ ] Add focus indicators
- [ ] Fix keyboard navigation
- [ ] Test zoom functionality
- [ ] Run accessibility tests

### Day 5: Balance (20 min)
- [ ] Adjust starting gold
- [ ] Balance XP curve
- [ ] Add intermediate enemies
- [ ] Update quest rewards

### Day 6: Content (30 min)
- [ ] Add 5 new quests
- [ ] Add 5 new achievements
- [ ] Complete equipment sets
- [ ] Add missing shop items

### Day 7: Technical (25 min)
- [ ] Complete shutdown handlers
- [ ] Reduce TypeScript any casts
- [ ] Add auto-save
- [ ] Test full game loop

---

## SUCCESS METRICS

### Before Fixes
| Metric | Value |
|--------|-------|
| Console Errors | 1+ |
| Failed Tests | 6 |
| Tooltips | 0 |
| Tracked Stats | 0 |
| Working Achievements | 0/12 |

### After Fixes
| Metric | Target |
|--------|--------|
| Console Errors | 0 |
| Failed Tests | 0 |
| Tooltips | 15+ |
| Tracked Stats | 10+ |
| Working Achievements | 12/12 |

---

## ESTIMATED TIME

| Phase | Time | Priority |
|-------|------|----------|
| Phase 1 | 30 min | Critical |
| Phase 2 | 45 min | High |
| Phase 3 | 30 min | High |
| Phase 4 | 20 min | Medium |
| Phase 5 | 20 min | Medium |
| Phase 6 | 30 min | Medium |
| Phase 7 | 25 min | Low |

**Total: 3 hours**

---

## TESTING REQUIREMENTS

After each phase, run:

```bash
# Quick test
npx playwright test tests/e2e/menu-flow.test.ts --project=chromium

# Full test
npx playwright test --project=chromium

# Type check
npm run build
```

---

**Plan Version:** 1.0
**Created:** 2026-04-25
**Author:** Claude
**Status:** Ready for Implementation
