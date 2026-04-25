# 📋 Buy a Buddy - Development Plan

> Last Updated: 2026-04-25

---

## 🎯 Project Overview

**Buy a Buddy** is an immersive 2D RPG with integrated mini-games. Players collect and breed adorable buddies, earn passive income from idle farming, and engage in turn-based combat.

### Core Pillars
1. **Cute Factor** - Kawaii-style creatures with expressive faces
2. **Idle Progression** - Satisfying passive income loops
3. **Collection & Breeding** - Deep buddy collection system
4. **Accessibility** - PWA for mobile/desktop, touch controls

---

## 📊 Roadmap

### Phase 1: Core Foundation ✅
- [x] Project setup (Vite + Phaser 3 + TypeScript)
- [x] Core game types and constants
- [x] Basic Phaser scenes (Boot, Menu, Game)
- [x] Idle income system
- [x] Buddy spawner with gacha
- [x] Work plots (9 slots)
- [x] Debug overlay
- [x] Unit tests

### Phase 2: Game Systems 🔄
- [x] IdleSystem - Passive income
- [x] SpawnerSystem - Buddy creation
- [x] BattleSystem - Turn-based combat
- [x] QuestSystem - Objectives and rewards
- [x] BreedingSystem - Buddy combination
- [ ] Quest system integration
- [ ] Battle system UI

### Phase 3: World & Exploration
- [ ] WorldMapScene - Full RPG map
- [ ] NPC interactions
- [ ] Portal system to mini-games
- [ ] Region progression

### Phase 4: Polish & Expansion
- [ ] Animations and particles
- [ ] Sound effects and music
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Social features

### Phase 5: Multiplayer (Future)
- [ ] Co-op battles
- [ ] Guild system
- [ ] Trading
- [ ] Seasonal events

---

## 🎮 Mini-Games

### 1. Idle Farm ✅
**Status:** Implemented
- 9 work plots
- Buddy assignment
- Passive income generation
- Plot upgrades

### 2. Buddy Brawl 🔄
**Status:** Core system ready, UI pending
- Turn-based combat
- Attack/Defense/Speed stats
- HP system

### 3. Quest Quest 🔄
**Status:** Core system ready
- Objective types
- Reward claims
- Progress tracking

### 4. Buddy Breeding 🔄
**Status:** Core system ready
- Gene inheritance
- Rarity chances
- Offspring generation

### 5. Daily Challenges ⏳
**Status:** Planned
- Rotating challenges
- Bonus rewards

---

## 🛠 Technical Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Phaser 3.60+ | 2D game engine |
| TypeScript 5.0 | Type safety |
| Vite 6 | Build tool |
| vite-plugin-pwa | PWA support |

### Backend
| Technology | Purpose |
|------------|---------|
| Express 4 | API server |
| Swagger | API documentation |
| Node.js 18+ | Runtime |

### Testing
| Technology | Purpose |
|------------|---------|
| Vitest | Unit tests |
| Playwright | E2E tests |
| Istanbul | Coverage |

### Deployment
| Technology | Purpose |
|------------|---------|
| Cloudflare Pages | Static hosting |
| Wrangler | Deployment CLI |

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| Frame Rate | 60 FPS |
| Frame Time | < 16.67ms |
| Input Latency | < 100ms |
| Initial Load | < 500KB |
| Bundle Size | < 2MB |

### Optimizations
- Sprite pooling for object reuse
- Throttled updates (16ms)
- Lazy loading for scenes
- PWA service worker caching

---

## 🎨 Visual Style

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0d0d1a` | Deep purple-black |
| Primary | `#a855f7` | Purple accent |
| Secondary | `#ec4899` | Pink highlight |
| Accent | `#06b6d4` | Cyan interactive |
| Gold | `#fbbf24` | Currency/rewards |

### Rarity Colors
| Rarity | Hex | Glow |
|--------|-----|------|
| Common | `#87CEEB` | Light blue |
| Rare | `#9370DB` | Purple |
| Epic | `#FF69B4` | Pink |
| Legendary | `#FFD700` | Gold sparkle |

### Sprite Style
- Round, blob-like bodies
- Big expressive eyes
- Cheek blush
- Rarity-based decorations (crowns, sparkles)

---

## 🔧 Configuration

### Game Constants
See [`src/config/constants.ts`](src/config/constants.ts) for:
- Rarity drop rates
- Income formulas
- Cost scaling
- XP requirements

### Environment Variables
```env
NODE_ENV=development|production
API_PORT=3001
```

---

## 🧪 Quality Gates

### Code Quality
- [x] TypeScript strict mode
- [x] ESLint rules
- [ ] Prettier formatting
- [ ] No `any` types (except where necessary)

### Testing
- [x] Unit tests for all systems
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] 70%+ coverage target

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Reduced motion support

---

## 📱 Mobile Support

### Touch Controls
- Virtual joystick (left side)
- Tap to interact
- Pinch to zoom (future)
- Swipe for menus

### Responsive Design
- 400×700 base resolution
- Scales to screen size
- Touch-optimized UI elements (44px min)

### PWA Features
- Install to home screen
- Offline play
- Push notifications (future)

---

## 🔮 Future Features

### Short-term
- [ ] More buddy types
- [ ] Seasonal events
- [ ] Social sharing
- [ ] Cloud save (Cloudflare KV)

### Long-term
- [ ] Multiplayer co-op
- [ ] Guild system
- [ ] Steam release
- [ ] Native mobile app (Capacitor)

---

## 📝 Changelog

### v2.0.0 (2026-04-25)
- Complete game implementation
- Phaser 3 scenes
- Idle system with plots
- Buddy gacha spawner
- Debug overlay
- Unit tests (30 passing)
- PWA configuration

### v1.0.0 (2026-04-24)
- Initial project setup
- Basic structure
- Placeholder scenes

---

## 🔗 Related Links

- [GitHub Repository](https://github.com/aliasfoxkde/Buy_a_Buddy)
- [Live Demo](https://buy-a-buddy.pages.dev)
- [API Docs](/api-docs)
- [Issues](https://github.com/aliasfoxkde/Buy_a_Buddy/issues)

---

## 📞 Contact

- GitHub Issues: [Report a bug](https://github.com/aliasfoxkde/Buy_a_Buddy/issues)
- Discussions: [GitHub Discussions](https://github.com/aliasfoxkde/Buy_a_Buddy/discussions)