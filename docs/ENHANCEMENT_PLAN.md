# Buy a Buddy - Comprehensive Enhancement Plan
## v2.1.0

---

## 1. AUDIT SUMMARY

### Code Quality
- **Files**: 60 TypeScript files, 11,737 lines
- **Errors**: TypeScript compiles clean ✅
- **Coverage Gaps**: Scenes partially implemented, some systems disconnected

### Game Systems Status
| System | Status | Notes |
|--------|--------|-------|
| Sprite Pipeline | ⚠️ Fixed | Missing sprites now loading |
| Frame Calculations | ⚠️ Fixed | Now using spriteUtils helpers |
| Main Menu | ✅ Working | Buttons fixed, audio balanced |
| World Scene | ⚠️ Partial | Tiles render, movement may be broken |
| Combat System | ❌ Partial | BattleScene exists, AI incomplete |
| Mobile Controls | ❌ Not Integrated | MobileControls.ts exists but unused |
| Save/Load | ⚠️ Partial | Storage works, UI minimal |
| Audio | ✅ Fixed | Volumes balanced, longer melodies |
| Settings | ⚠️ Minimal | Volume sliders exist, persistence ok |

### Known Issues
1. Character select scene may not properly pass selected character to world
2. Player movement - need to verify physics and collision
3. Mobile controls not wired up
4. Combat AI - enemies don't make decisions
5. No particle effects system
6. Tutorial system exists but never triggers

---

## 2. ENHANCEMENT PHASES

### Phase 1: Core Fixes (High Priority)
```
1.1 Fix character selection → world scene data flow
1.2 Verify player movement and collision
1.3 Add basic collision detection
1.4 Fix camera following player
```

### Phase 2: User Experience
```
2.1 Integrate mobile controls (touch joystick)
2.2 Add loading screen with progress
2.3 Improve button feedback (sound + visual)
2.4 Add screen shake on damage
2.5 Add particle effects for combat
```

### Phase 3: Game Systems
```
3.1 Complete combat AI (enemy turns)
3.2 Add status effects system
3.3 Implement tutorial trigger flow
3.4 Add save reminder on quit
```

### Phase 4: Polish
```
4.1 Add achievement system structure
4.2 Improve settings persistence
4.3 Add more sound variety
4.4 Performance optimizations
```

### Phase 5: Content
```
5.1 Add more enemy types
5.2 Add more zones/maps
5.3 Add more items and equipment
5.4 Add buddy evolution
```

---

## 3. IMPLEMENTATION TASKS

### Task 1.1: Fix Character Selection Data Flow
**Problem**: CharacterSelectScene creates player but WorldScene may not read correctly
**Files**: CharacterSelectScene.ts, GameSystems.ts, WorldScene.ts
**Action**: 
- Verify GameSystems.createPlayer() stores characterIndex
- Verify WorldScene reads from gameSystems.player
- Add console logs for debugging

### Task 1.2: Verify Player Movement
**Problem**: May be broken after sprite changes
**Files**: WorldScene.ts
**Action**:
- Check WASD/Arrow key handling
- Verify physics body settings
- Test actual movement in browser

### Task 1.3: Add Collision Detection
**Problem**: Player can walk through everything
**Files**: WorldScene.ts
**Action**:
- Add world bounds
- Add collision between player and buildings/rocks
- Add player↔NPC interaction zones

### Task 1.4: Fix Camera
**Problem**: Camera may not follow player
**Files**: WorldScene.ts
**Action**:
- Set world bounds
- Enable camera follow
- Test with large world

### Task 2.1: Mobile Controls
**Problem**: Touch not supported
**Files**: MobileControls.ts, WorldScene.ts, MainMenuScene.ts
**Action**:
- Create virtual joystick overlay
- Wire up touch events
- Test on mobile emulator

### Task 2.4: Screen Shake
**Problem**: No impact feedback
**Files**: VisualEffects.ts, BattleScene.ts, WorldScene.ts
**Action**:
- Add camera shake utility
- Trigger on damage taken
- Trigger on nearby explosions

### Task 2.5: Particles
**Problem**: No visual juice
**Files**: VisualEffects.ts
**Action**:
- Add hit particles (combat)
- Add pickup particles (items)
- Add magic particles (skills)

---

## 4. SUCCESS METRICS

- [ ] TypeScript compiles with 0 errors
- [ ] Build produces valid PWA
- [ ] Menu buttons respond to click/touch/keyboard
- [ ] Character selection persists to world scene
- [ ] Player moves with WASD/arrows
- [ ] Camera follows player smoothly
- [ ] Mobile shows virtual joystick
- [ ] Combat hits trigger screen shake
- [ ] Pickups show particle effect
- [ ] Pre-commit hooks pass

---

## 5. EXECUTION ORDER

1. Audit and document current state
2. Fix critical path (menu → character select → world → combat)
3. Add mobile controls
4. Add visual polish (shake, particles)
5. Test and deploy
6. Iterate on feedback

