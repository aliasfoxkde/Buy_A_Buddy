# Buy a Buddy - Master Build Plan
## v2.1.0 - Complete Game Engine

---

## EXECUTIVE SUMMARY

**Goal**: Build a fully functional 2D RPG from menu to combat with polished UX.

**Current State**: 
- Menu works, buttons fixed, audio balanced
- World scene partially working
- Combat exists but incomplete
- Mobile controls added but not fully tested

**Target State**:
- Complete menu → character select → world → combat → victory/defeat loop
- Working collision, camera, particles, screen shake
- Mobile-friendly with touch joystick
- 0 TypeScript errors, clean build

---

## IMPLEMENTATION CHECKLIST

### A. CORE LOOP (Critical Path)
- [ ] A1. Boot Scene → Main Menu transition
- [ ] A2. Main Menu → Character Select
- [ ] A3. Character Select → World Scene (data persists)
- [ ] A4. World Scene player movement + camera
- [ ] A5. World Scene → Battle Scene trigger
- [ ] A6. Battle Scene complete turn logic
- [ ] A7. Battle → World (on victory/defeat)

### B. SPRITES & GRAPHICS
- [ ] B1. All sprites load correctly in BootScene
- [ ] B2. Player renders with correct frame
- [ ] B3. Buddies render and follow
- [ ] B4. NPCs render with names
- [ ] B5. Tiles render in grid
- [ ] B6. Decorations (trees, rocks) render

### C. PHYSICS & COLLISION
- [ ] C1. Player bounded to world
- [ ] C2. Player can't walk through buildings
- [ ] C3. Player↔NPC interaction zones work
- [ ] C4. Item pickup zones work

### D. UI/UX
- [ ] D1. HUD shows HP/MP/EXP/Gold
- [ ] D2. Skill bar with hotkeys (1-6)
- [ ] D3. Mobile virtual joystick works
- [ ] D4. Loading screen with progress
- [ ] D5. Screen shake on damage
- [ ] D6. Particles on hit/pickup/heal

### E. COMBAT SYSTEM
- [ ] E1. Player turn: select skill or attack
- [ ] E2. Enemy turn: AI decision
- [ ] E3. Damage calculation
- [ ] E4. HP bars update during combat
- [ ] E5. Victory: XP gain, gold, return to world
- [ ] E6. Defeat: Game over or retry

### F. AUDIO
- [ ] F1. Menu music plays
- [ ] F2. Exploration music plays in world
- [ ] F3. Battle music plays in combat
- [ ] F4. Sound effects (click, attack, heal)
- [ ] F5. Volume respects settings

### G. SAVE/LOAD
- [ ] G1. Auto-save on scene transitions
- [ ] G2. Save slots (3 slots)
- [ ] G3. Load from main menu
- [ ] G4. New game resets properly

### H. SETTINGS
- [ ] H1. Master volume slider
- [ ] H2. Music volume slider
- [ ] H3. SFX volume slider
- [ ] H4. Settings persist across sessions

### I. TESTING & VALIDATION
- [ ] I1. TypeScript: 0 errors
- [ ] I2. Build: produces valid PWA
- [ ] I3. Deploy: accessible at *.pages.dev
- [ ] I4. Manual: Menu flow works
- [ ] I5. Manual: Movement works (WASD + touch)
- [ ] I6. Manual: Combat loop completes

---

## FILE RESPONSIBILITIES

| File | Responsibility | Priority |
|------|----------------|----------|
| BootScene.ts | Load all sprites, init systems | P0 |
| MainMenuScene.ts | Menu flow, button handlers | P0 |
| CharacterSelectScene.ts | Select character, create player | P0 |
| WorldScene.ts | Main gameplay, movement, camera | P0 |
| BattleScene.ts | Combat turns, AI, damage | P0 |
| GameSystems.ts | Core systems coordination | P0 |
| AudioManager.ts | Music + SFX | P1 |
| VisualEffects.ts | Particles, shake | P1 |
| MobileControls.ts | Touch joystick | P1 |
| Storage.ts | Save/load | P1 |
| SettingsScene.ts | Volume controls | P2 |

---

## TESTING PROCEDURE

After each change:
1. `npm run build` - verify compiles
2. `npx wrangler pages deploy` - deploy to test
3. Manual test on https://*.pages.dev:
   - Menu → Character Select → World flow
   - WASD movement
   - Touch joystick (mobile emulator)
   - Combat trigger and completion

---

## DEPLOY COMMAND

```bash
npx wrangler pages deploy dist --project-name=buy-a-buddy --commit-dirty=true
```

