# Buy a Buddy - SYSTEMATIC IMPROVEMENT PLAN v4.0

## BASED ON: PRODUCTION_AUDIT_v4.0.md

---

## PHASE 1: CRITICAL FIXES (Day 1)

### 1.1 Tutorial Overlay ✅ (PARTIALLY DONE)
**Priority:** HIGH  
**Status:** Existing but incomplete

**Todo:**
- [x] Controls hint text (bottom of screen) - EXISTS
- [ ] First-time tutorial overlay explaining WASD, E to interact
- [ ] Highlight interactive elements on first play

**Implementation:** Add TutorialOverlay class that shows on first WorldScene load

### 1.2 Combat Feedback ✅ (PARTIALLY DONE)
**Priority:** HIGH  
**Status:** Damage numbers exist but could be better

**Todo:**
- [x] Element-colored damage numbers - EXISTS in VisualEffects.ts
- [x] Screen shake on damage - EXISTS
- [x] Flash on hit - EXISTS
- [ ] Skill effectiveness preview
- [ ] Combat log improvement

### 1.3 Quest Visibility ✅ (PARTIALLY DONE)
**Priority:** HIGH  
**Status:** Quest panel exists

**Todo:**
- [x] Quest panel (top-right) - EXISTS
- [x] Progress display - EXISTS
- [ ] Pulsing "!" on NPCs with quests
- [ ] Walk-to marker on map

---

## PHASE 2: POLISH (Days 2-4)

### 2.1 Background Music
**Priority:** MEDIUM  
**Status:** Not implemented

**Todo:**
- [ ] Add placeholder music track (can use free CC0 music)
- [ ] Music plays during WorldScene
- [ ] Combat music during BattleScene
- [ ] Mute option in settings

**Implementation:**
```typescript
// In AudioManager.ts
playBackgroundMusic(): void
stopBackgroundMusic(): void
setMusicTrack(track: string): void
```

### 2.2 UI Consistency
**Priority:** MEDIUM  
**Status:** Inconsistent

**Todo:**
- [ ] Standardize button colors (purple theme: #a855f7)
- [ ] Consistent font sizes (title: 36px, body: 16px, small: 12px)
- [ ] Uniform spacing (8px grid)
- [ ] Same border radius (8px)

**Files to update:**
- WorldScene.ts (HUD)
- BattleScene.ts (Combat UI)
- InventoryScene.ts
- ShopScene.ts

### 2.3 Mobile Polish
**Priority:** MEDIUM  
**Status:** Basic joystick exists

**Todo:**
- [ ] Larger touch targets (60px minimum)
- [ ] Joystick repositioning option
- [ ] Hide keyboard shortcuts on mobile
- [ ] Bottom action buttons for mobile

### 2.4 Visual Effects
**Priority:** MEDIUM  
**Status:** Basic effects exist

**Todo:**
- [ ] Particle effects on level up
- [ ] Screen flash on victory
- [ ] Enemy spawn animation
- [ ] Item pickup glow

---

## PHASE 3: CONTENT EXPANSION (Days 5-10)

### 3.1 More Quests
**Priority:** MEDIUM  
**Status:** 6 quests

**Todo:**
- [ ] 10 total quests
- [ ] Branching story (choices matter)
- [ ] Daily quests (respawn)
- [ ] Achievement-linked quests

### 3.2 More Enemies
**Priority:** LOW  
**Status:** 19 enemies

**Todo:**
- [ ] Zone-specific enemy pools
- [ ] 25+ enemy variety
- [ ] Elite variants
- [ ] World bosses

### 3.3 Equipment Sets
**Priority:** LOW  
**Status:** Individual items

**Todo:**
- [ ] Equipment sets (2/4 bonus)
- [ ] Set effects (fire damage, lifesteal, etc.)
- [ ] Visual indicators for equipped sets

---

## PHASE 4: RELEASE PREP (Days 11-14)

### 4.1 Performance
**Priority:** HIGH  
**Status:** 1.7MB bundle

**Todo:**
- [ ] Code splitting by scene
- [ ] Lazy load non-critical assets
- [ ] Optimize spritesheet sizes
- [ ] Tree-shake dead code

### 4.2 Error Handling
**Priority:** HIGH  
**Status:** Basic

**Todo:**
- [ ] Global error boundary
- [ ] Graceful fallback for audio
- [ ] Save corruption recovery
- [ ] Network error handling (for future multiplayer)

### 4.3 Testing
**Priority:** MEDIUM  
**Status:** 4 tests

**Todo:**
- [ ] 20+ E2E tests
- [ ] Combat system tests
- [ ] Save/load tests
- [ ] Performance benchmarks

### 4.4 Documentation
**Priority:** LOW  
**Status:** Basic

**Todo:**
- [ ] API documentation
- [ ] Developer guide
- [ ] Content spreadsheet
- [ ] Contribution guidelines

---

## TASK BREAKDOWN

### Day 1 Tasks
| Task | Time | Status |
|------|------|--------|
| Fix sprite loading | 1h | ✅ DONE |
| Add tutorial overlay | 2h | IN PROGRESS |
| Quest markers polish | 1h | TODO |
| Combat feedback polish | 1h | TODO |

### Day 2 Tasks
| Task | Time | Status |
|------|------|--------|
| Add background music | 2h | TODO |
| UI consistency pass | 3h | TODO |
| Mobile polish | 2h | TODO |

### Day 3-4 Tasks
| Task | Time | Status |
|------|------|--------|
| Visual effects | 3h | TODO |
| Particle systems | 2h | TODO |
| Screen transitions | 1h | TODO |

### Day 5-10 Tasks
| Task | Time | Status |
|------|------|--------|
| Quest content | 4h | TODO |
| Enemy variety | 3h | TODO |
| Dialogue branches | 3h | TODO |

### Day 11-14 Tasks
| Task | Time | Status |
|------|------|--------|
| Performance opt | 4h | TODO |
| Error handling | 3h | TODO |
| Testing | 4h | TODO |
| Bug fixes | 3h | TODO |

---

## SUCCESS METRICS

### Before (Current State)
- Sprite loading errors: YES
- Tutorial: MINIMAL
- Background music: NO
- Mobile polish: BASIC
- Test coverage: 4 tests

### After (Target State)
- Sprite loading errors: 0
- Tutorial: COMPLETE
- Background music: YES
- Mobile polish: POLISHED
- Test coverage: 20+ tests

---

## EXECUTION ORDER

1. **THIS WEEK:** Fix critical issues, add tutorial, polish combat
2. **NEXT WEEK:** Content expansion, mobile polish
3. **FINAL WEEK:** Performance, testing, release prep

---

*Plan Version: 4.0*  
*Created: 2026-04-26*  
*Based on Audit: PRODUCTION_AUDIT_v4.0.md*
