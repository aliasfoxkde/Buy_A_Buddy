# Buy a Buddy - Implementation Plan

## Status: IN PROGRESS

---

## Phase 1: Module Completion (EMPTY STUBS)

### 1.1 Buff System Module ✅
- [x] `src/modules/buffs/index.ts` - Implement buff/debuff effects
  - [x] 13 buff types: poison, burn, freeze, stun, slow, haste, shield, regen, strength, weakness, fortify, vulnerable, silence
  - [x] Duration tracking, tick effects
  - [x] Stack management
  - [x] BuffableEntity interface

### 1.2 Events System Module  
- [x] `src/modules/events/index.ts` - Event queue and history
  - [x] Event prioritization
  - [x] Event filtering
  - [x] Performance tracking

### 1.3 NPC System Module
- [x] `src/modules/npc/index.ts` - NPC behavior and schedules
  - [x] Daily schedules (wake, work, eat, sleep, patrol)
  - [x] Shop inventory (3 default shops)
  - [x] Quest giver logic
  - [x] 5 default NPCs: mentor, shopkeeper, blacksmith, guard, innkeeper

### 1.4 AI System Module
- [x] `src/modules/ai/index.ts` - Enemy AI behaviors
  - [x] Patrol AI with waypoints
  - [x] Chase/attack AI with aggro ranges
  - [x] Flee AI (health-based)
  - [x] Wander AI
  - [x] 5 default AI configs: slime, goblin, wolf, boss, skeleton

### 1.5 Tutorial System Module
- [x] `src/modules/tutorial/index.ts` - Guided tutorial
  - [x] Step-by-step hints
  - [x] Tooltip system
  - [x] Skip functionality
  - [x] 2 default tutorials: main, combat

---

## Phase 2: Scene Integration

### 2.1 Boot Scene
- [ ] Initialize all game modules
- [ ] Load spritesheets
- [ ] Show loading progress
- [ ] Transition to main menu

### 2.2 Main Menu Scene
- [ ] Wire storage system
- [ ] Load/save functionality
- [ ] Settings integration
- [ ] Audio controls

### 2.3 Character Select Scene
- [ ] Display character sprites
- [ ] Buddy selection
- [ ] Stats preview
- [ ] Confirm/cancel buttons

### 2.4 World Scene
- [ ] Integrate world system
- [ ] Camera follow player
- [ ] Zone transitions
- [ ] NPC interaction zones
- [ ] World items collection

### 2.5 Battle Scene
- [ ] Integrate combat system
- [ ] Skill bar UI
- [ ] Turn indicators
- [ ] Damage number display
- [ ] Victory/defeat screens

### 2.6 Inventory Scene
- [ ] Integrate inventory system
- [ ] Grid display (6x4)
- [ ] Equipment slots (7)
- [ ] Item tooltips
- [ ] Use/equip/drop actions

### 2.7 Quest Scene
- [ ] Integrate quest system
- [ ] Active quests list
- [ ] Quest objectives progress
- [ ] Rewards display

### 2.8 Dialogue System
- [ ] Integrate dialogue module
- [ ] Typewriter text effect
- [ ] Choice buttons
- [ ] Portrait display
- [ ] Close on end

---

## Phase 3: Sprite Integration

### 3.1 Sprite Renderer
- [ ] Load all spritesheets
- [ ] Implement cell-based rendering
- [ ] Animation frame system
- [ ] Flip/scale support

### 3.2 Character Sprites
- [ ] 12 characters (6x2 grid)
- [ ] Idle animations
- [ ] Walk animations
- [ ] Attack animations

### 3.3 Buddy Sprites
- [ ] 12 buddies (6x2 grid)
- [ ] Idle animations
- [ ] Follow behavior

### 3.4 Enemy Sprites
- [ ] 24 enemies (6x4 grid)
- [ ] Idle animations
- [ ] Attack animations

### 3.5 UI Sprites
- [ ] Button states (normal/hover/pressed)
- [ ] Status bars (health/mana/exp)
- [ ] Inventory grid
- [ ] Window frames

---

## Phase 4: UI Components

### 4.1 HUD Components
- [ ] Health bar
- [ ] Mana bar  
- [ ] Experience bar
- [ ] Gold display
- [ ] Level indicator

### 4.2 Skill Bar
- [ ] 6 skill slots
- [ ] Cooldown overlays
- [ ] Hotkey hints
- [ ] Disabled states

### 4.3 Inventory UI
- [ ] Grid container
- [ ] Item slots
- [ ] Equipment panel
- [ ] Tooltip component
- [ ] Context menu

### 4.4 Dialog Box
- [ ] Speaker name
- [ ] Portrait area
- [ ] Text area
- [ ] Choice buttons

### 4.5 Notification System
- [ ] Toast notifications
- [ ] Achievement popups
- [ ] Level up announcements

---

## Phase 5: Game Logic

### 5.1 Player Controller
- [ ] WASD movement
- [ ] Collision detection
- [ ] Interaction button
- [ ] Camera bounds

### 5.2 NPC Interaction
- [ ] Proximity detection
- [ ] Interaction prompt
- [ ] Dialogue trigger
- [ ] Shop trigger

### 5.3 Combat Flow
- [ ] Enemy encounter
- [ ] Turn resolution
- [ ] Damage calculation
- [ ] Victory rewards
- [ ] Defeat handling

### 5.4 Quest Updates
- [ ] Kill tracking
- [ ] Collection tracking
- [ ] Talk tracking
- [ ] Completion rewards

---

## Phase 6: Save/Load System

### 6.1 Save Slot UI
- [ ] New game slot
- [ ] Load game slots
- [ ] Delete confirmation
- [ ] Save info preview

### 6.2 Auto-Save
- [ ] Zone transition save
- [ ] Quest completion save
- [ ] Periodic save (1 min)

### 6.3 Export/Import
- [ ] Base64 export
- [ ] Import validation
- [ ] Cross-device sync

---

## Phase 7: Audio Integration

### 7.1 Music Manager
- [ ] Menu theme
- [ ] Peaceful exploration
- [ ] Battle theme
- [ ] Boss theme
- [ ] Victory theme

### 7.2 SFX Integration
- [ ] UI clicks
- [ ] Combat sounds
- [ ] Item pickup
- [ ] Level up
- [ ] Achievement unlock

### 7.3 Settings
- [ ] Master volume
- [ ] Music volume
- [ ] SFX volume
- [ ] Mute toggle

---

## Phase 8: Testing & Polish

### 8.1 Unit Tests
- [ ] All modules tested
- [ ] 90%+ coverage
- [ ] Edge cases covered

### 8.2 Integration Tests
- [ ] Scene transitions
- [ ] Save/load flow
- [ ] Combat flow
- [ ] Quest flow

### 8.3 E2E Tests
- [ ] Playwright scenarios
- [ ] Full gameplay walkthrough

### 8.4 Polish
- [ ] Screen transitions
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility (WCAG 2.1 AA)

---

## Progress Tracking

### Completed ✅
- [x] Core engine (EventBus, Entity, GameState)
- [x] Combat module + Buffs module
- [x] Inventory module  
- [x] Quests module
- [x] Dialogue module
- [x] Skills module
- [x] Crafting module
- [x] Achievements module
- [x] World module
- [x] Storage module
- [x] Buffs module (13 buff types)
- [x] Events module (queue, history, stats)
- [x] NPC module (schedules, shops, quests)
- [x] AI module (patrol, chase, attack, flee)
- [x] Tutorial module (step-by-step, tooltips)
- [x] 123 unit tests passing
- [x] Placeholder spritesheets (25)
- [x] MIT License

### In Progress
- [x] Phase 2: Scene integration (Phaser scenes ↔ modules) ✅
- [x] Phase 3: Sprite integration ✅
- [x] Phase 4: UI components (inventory, quests, settings) ✅
- [x] Phase 5: Game logic (combat, dialogue, crafting, shop UIs) ✅
- [x] Phase 6: Save/load UI ✅
- [x] Phase 7: Audio integration ✅
- [ ] Phase 8: Testing & polish

---

## Dependencies

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8
  ↓          ↓         ↓         ↓         ↓         ↓         ↓         ↓
Modules   Scenes    Sprites   UI       Logic     Save UI   Audio    Testing
```

---

## Notes

- All sprites use 256x512 cells (characters) or 256x256 (items)
- 6x4 grid = 24 slots per spritesheet
- Grid positions: row_col (1_1 = top-left, 6_4 = bottom-right)
