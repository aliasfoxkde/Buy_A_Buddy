# Buy a Buddy - Comprehensive Implementation Plan
## v2.2.0 - From Prototype to Playable Game

---

## PHASE 1: CORE GAMEPLAY (P0 - Must Fix)

### 1.1 Fix Collision Detection ⏱️ 30min
**Problem**: Player walks through buildings and rocks

**Tasks**:
- [ ] Add static collision bodies to buildings
- [ ] Add static collision bodies to rocks/obstacles
- [ ] Test player can't walk through solid objects
- [ ] Add world bounds (can't walk off map)

**Files**: `src/scenes/WorldScene.ts`

### 1.2 Add Enemy Variety ⏱️ 2hr
**Problem**: Only one enemy type (slime)

**Tasks**:
- [ ] Define 3 enemy types: Slime, Goblin, Wolf
- [ ] Add enemy stats (HP, damage, XP, gold)
- [ ] Random enemy selection on encounter
- [ ] Update BattleScene to show different enemies
- [ ] Create enemy sprite mapping

**Files**: `src/data/enemies.ts`, `src/scenes/BattleScene.ts`

### 1.3 Implement XP/Leveling ⏱️ 1hr
**Problem**: XP gained but no level up effect

**Tasks**:
- [ ] Calculate XP required per level
- [ ] Add level up check after combat
- [ ] Show level up UI with animation
- [ ] Increase stats on level up
- [ ] Show stat increases to player

**Files**: `src/systems/GameSystems.ts`, `src/scenes/BattleScene.ts`

### 1.4 Save Confirmation ⏱️ 30min
**Problem**: No confirmation on save/load

**Tasks**:
- [ ] Add confirmation dialog before overwrite
- [ ] Add "Save successful" notification
- [ ] Add "No save found" message for Continue
- [ ] Auto-save on zone transition

**Files**: `src/scenes/SaveLoadScene.ts`

---

## PHASE 2: GAME SYSTEMS (P1 - Should Fix)

### 2.1 Quest System ⏱️ 3hr
**Problem**: Quest scene exists but no quests

**Tasks**:
- [ ] Create quest data structure
- [ ] Add 3 tutorial quests
- [ ] Connect quest progress to combat
- [ ] Show quest completion UI
- [ ] Add quest rewards (gold, items, XP)

**Files**: `src/data/quests.ts`, `src/scenes/QuestScene.ts`

### 2.2 NPC Dialogue ⏱️ 2hr
**Problem**: NPCs have no dialogue

**Tasks**:
- [ ] Create dialogue data structure
- [ ] Add dialogue for 3 NPCs
- [ ] Implement dialogue tree system
- [ ] Connect dialogue to quest triggers
- [ ] Add dialogue choices (optional)

**Files**: `src/data/dialogue.ts`, `src/ui/DialogueUI.ts`

### 2.3 Enemy Scaling ⏱️ 1hr
**Problem**: Enemies always same strength

**Tasks**:
- [ ] Scale enemy HP by player level
- [ ] Scale enemy damage by player level
- [ ] Scale rewards by enemy difficulty
- [ ] Add "elite" enemy chance (rare, harder, better loot)

**Files**: `src/scenes/BattleScene.ts`, `src/systems/GameSystems.ts`

### 2.4 Shop System ⏱️ 2hr
**Problem**: Shop exists but buy/sell untested

**Tasks**:
- [ ] Add item catalog to shop
- [ ] Implement gold transaction
- [ ] Add "not enough gold" feedback
- [ ] Add equipment slots
- [ ] Equip/unequip items

**Files**: `src/scenes/ShopScene.ts`, `src/systems/GameSystems.ts`

---

## PHASE 3: POLISH (P2 - Nice to Have)

### 3.1 Add Screen Transitions ⏱️ 1hr
**Tasks**:
- [ ] Fade transitions between scenes
- [ ] Loading indicator during asset load
- [ ] Battle entrance animation
- [ ] Victory/defeat animations

### 3.2 Sound Variety ⏱️ 2hr
**Tasks**:
- [ ] Different attack sounds per enemy
- [ ] Footstep sounds while walking
- [ ] Ambient world sounds
- [ ] UI interaction sounds

### 3.3 Mobile Polish ⏱️ 1hr
**Tasks**:
- [ ] Action buttons for mobile combat
- [ ] Fix joystick dead zone
- [ ] Add buttons HUD
- [ ] Test on real device (if possible)

### 3.4 Tutorial System ⏱️ 2hr
**Tasks**:
- [ ] Create tutorial steps
- [ ] Trigger tutorial on first play
- [ ] Skip option for returning players
- [ ] Tutorial progress tracking

---

## PHASE 4: CONTENT (P3 - Future)

### 4.1 More Zones ⏱️ 4hr
- Forest zone
- Cave zone
- Boss arena

### 4.2 More Enemies ⏱️ 2hr
- 10+ enemy types
- Boss enemies
- Mini-bosses

### 4.3 Buddy Abilities ⏱️ 3hr
- Buddy combat participation
- Buddy skills
- Buddy leveling

---

## IMPLEMENTATION ORDER

```
Week 1:
├── Day 1: Collision detection
├── Day 2: Enemy variety (3 types)
├── Day 3: XP/Leveling system
├── Day 4: Save confirmation
└── Day 5: Testing & bug fixes

Week 2:
├── Day 1: Quest system (3 quests)
├── Day 2: NPC dialogue
├── Day 3: Enemy scaling
├── Day 4: Shop polish
└── Day 5: Testing & deploy

Week 3:
├── Day 1: Screen transitions
├── Day 2: Sound variety
├── Day 3: Mobile polish
├── Day 4: Tutorial
└── Day 5: Full test & deploy
```

---

## SUCCESS CRITERIA

After Phase 1 (Must Have):
- [ ] Player can't walk through buildings
- [ ] 3 enemy types spawn in combat
- [ ] Level up triggers on XP threshold
- [ ] Save shows confirmation dialog

After Phase 2 (Should Have):
- [ ] At least 3 active quests
- [ ] NPCs have dialogue
- [ ] Enemies scale with player level
- [ ] Shop buy/sell works correctly

After Phase 3 (Nice to Have):
- [ ] Smooth scene transitions
- [ ] Varied sound effects
- [ ] Mobile controls work well
- [ ] Tutorial guides new players

---

## METRICS

| Metric | Current | Target |
|--------|---------|--------|
| Enemy Types | 1 | 10+ |
| Quests | 0 | 10+ |
| NPCs with Dialogue | 0 | 5+ |
| Playable Zones | 1 | 5+ |
| Collision | ❌ | ✅ |
| Level Up UI | ❌ | ✅ |

