# 📝 Tasks

> Last Updated: 2026-04-25

---

## 🔴 Current Tasks

### High Priority
1. **Add Unit Tests** - 60% of modules untested (achievements, buffs, crafting, dialogue, npc, storage, story, tutorial, world, ai)
2. **Fix `any` Type Warnings** - 59 warnings in event handlers, scene data
3. **Implement Code Splitting** - Lazy-load WorldScene, BattleScene (1.7MB bundle)
4. **Implement Breeding System** - Not found despite being in Phase 2
5. **Complete Idle Farm Mechanics** - No idle income or farming plots found

### Medium Priority
1. **Implement Offline Earnings** - Calculate earnings on return (50% efficiency, max 24h)
2. **Implement Cloud Save** - Currently only localStorage
3. **Complete Screen Transitions** - Integrate ScreenTransition system
4. **Add Shop E2E Tests** - Shop not tested in E2E suite
5. **Add Quest UI E2E Tests** - Quest UI not tested

---

## 🟡 Planned Tasks

### Phase 3: World & Exploration
- [ ] WorldMapScene with tile-based map
- [ ] Player movement (WASD + touch joystick)
- [ ] Camera following player
- [ ] Collision detection
- [ ] NPC sprites and interaction
- [ ] Portal sprites to mini-game areas

### Phase 4: Polish & Expansion
- [ ] Sprite animations (idle, walk, attack)
- [ ] Sound effects (spawn, income, combat)
- [ ] Background music
- [ ] Achievement system UI
- [ ] Achievement tracking
- [ ] Achievement rewards

### Phase 5: Multiplayer (Future)
- [ ] Co-op battle implementation
- [ ] Guild system
- [ ] Trading system
- [ ] Seasonal events

---

## 🟢 Completed Tasks

### Phase 1: Foundation ✅
- [x] Project setup (Vite + Phaser + TS)
- [x] tsconfig.json configuration
- [x] package.json with dependencies
- [x] vite.config.ts with PWA
- [x] Core game types (Buddy, Player, Plot, etc.)
- [x] Game constants (rarities, income, costs)
- [x] Initial documentation

### Phase 2: Game Systems ✅
- [x] IdleSystem (passive income, offline earnings)
- [x] SpawnerSystem (gacha, rarity roll)
- [x] BattleSystem (turn-based, damage calculation)
- [x] QuestSystem (objectives, progress tracking)
- [x] BreedingSystem (gene inheritance, offspring)
- [x] ValidationSystem (state integrity checks)
- [x] SaveSystem (export/import JSON)
- [x] DebugSystem (logging, metrics, report)

### Phase 3: Scenes (Partial) ✅
- [x] BootScene (loading, sprite generation)
- [x] MenuScene (title screen, buttons)
- [x] GameScene (main gameplay, UI, plots)

### Phase 4: Testing ✅
- [x] Unit tests for all systems (30 tests)
- [x] Playwright configuration
- [x] E2E test templates
- [x] Integration test templates

### Documentation ✅
- [x] README.md
- [x] PLANNING.md
- [x] PROGRESS.md
- [x] TASKS.md
- [x] docs/README.md
- [x] docs/API.md
- [x] docs/TESTING.md
- [x] docs/DEPLOYMENT.md

---

## 📋 Task Details

### Battle System UI
```
Description: Create UI for turn-based battles
Steps:
  1. Create BattleScene
  2. Add action buttons (Attack, Defend, Special)
  3. Add health bars
  4. Add battle log
  5. Add enemy display
  6. Add win/lose conditions
Estimate: 8 hours
```

### World Map Scene
```
Description: Create full RPG world exploration
Steps:
  1. Create tile-based map (procedural)
  2. Add player sprite with movement
  3. Add camera following player
  4. Add collision detection
  5. Add NPCs with interaction prompts
  6. Add portals to mini-game areas
Estimate: 16 hours
```

### Animation System
```
Description: Add sprite animations for buddies
Types:
  - Idle animation (breathing)
  - Walk animation (bounce)
  - Attack animation (lunge)
  - Hurt animation (flash)
  - Death animation (fade)
Estimate: 12 hours
```

---

## 🏷 Labels

| Label | Meaning |
|-------|---------|
| 🔴 high | High priority |
| 🟡 medium | Medium priority |
| 🟢 low | Low priority |
| 🎮 game | Game feature |
| 🧪 testing | Testing related |
| 📱 mobile | Mobile support |
| 🐛 bug | Bug fix |
| 📖 docs | Documentation |