# Buy a Buddy - Comprehensive Game Documentation

## 🎮 Project Overview

**Buy a Buddy** is an immersive 2D RPG with integrated mini-games, built with Vite, Phaser 3, and TypeScript.

### Tech Stack
- **Frontend:** Vite 6 + Phaser 3 + TypeScript
- **Backend:** Express 4 + Swagger UI
- **Testing:** Vitest + Playwright
- **Deployment:** Cloudflare Pages (PWA)

---

## 📁 Project Structure

```
Buy_A_Buddy/
├── src/
│   ├── api/                 # Express API server
│   │   ├── docs/            # OpenAPI specs
│   │   ├── routes/         # API endpoints
│   │   ├── types.ts        # API DTOs
│   │   └── server.ts       # Express server
│   ├── config/
│   │   └── constants.ts    # Game configuration
│   ├── debug/
│   │   └── DebugTools.ts   # Debug overlay, performance monitor
│   ├── game/
│   │   └── types.ts        # Core game types
│   ├── scenes/              # Phaser scenes
│   ├── services/
│   │   └── GameStateService.ts  # Central state management
│   ├── systems/
│   │   └── GameSystems.ts  # Core game logic
│   └── ui/                  # UI components
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/                # Playwright E2E tests
│   └── fixtures/          # Test data
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── public/                 # Static assets
```

---

## 🎯 Core Features

### 1. Idle Buddy Farm
- Buy buddies from gacha spawner
- Assign buddies to 9 work plots
- Passive income generation
- Upgrade system (buddy level, plot multiplier)

### 2. RPG World Map
- Top-down 2D exploration
- Player movement with WASD/arrows
- Touch joystick for mobile
- NPC interactions
- Portal transitions

### 3. Mini-Games Hub
- Idle Farm (passive income)
- Buddy Brawl (turn-based combat)
- Quest Quest (task-based)
- Buddy Breeding (combination)

### 4. Progression System
- Player level with XP
- Buddy leveling
- Region unlocks
- Achievement system

---

## 🔧 Development

### Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev          # Frontend (Vite)
npm run dev:api       # Backend (Express)

# Testing
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # Playwright E2E

# Code quality
npm run lint          # ESLint
npm run lint:fix      # Auto-fix
npm run check         # Full check (tsc + lint + test)

# Build & Deploy
npm run build         # Production build
npm run deploy        # Deploy to Cloudflare Pages
```

---

## 🌐 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API info |
| GET | `/api/game/state` | Get game state |
| POST | `/api/game/action` | Perform game action |
| GET | `/api/game/spawner` | Spawner info |
| GET | `/api/game/buddies` | List buddies |
| GET | `/api/game/plots` | List plots |
| GET | `/api/debug/report` | Debug report |
| GET | `/api/debug/validate` | State validation |
| GET | `/api/debug/metrics` | Performance metrics |
| GET | `/api/health` | Health check |
| GET | `/api/health/ready` | Readiness |
| GET | `/api/health/live` | Liveness |

### Interactive Docs

Visit `/api-docs` for Swagger UI.

---

## 🧪 Testing Strategy

### Unit Tests
- Game systems (Idle, Spawner, Battle, Quest, Breeding)
- Validation system
- Save system
- Debug utilities

### Integration Tests
- API endpoints
- State management
- Cross-system interactions

### E2E Tests
- Full game flow
- Mobile responsiveness
- Performance benchmarks

### Coverage Targets
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

---

## 🎨 Visual Design

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0d0d1a` | Main background |
| Primary | `#a855f7` | Purple accents |
| Secondary | `#ec4899` | Pink highlights |
| Accent | `#06b6d4` | Cyan interactive |
| Gold | `#fbbf24` | Coins/values |

### Rarity Colors
- **Common:** Sky blue (`#87CEEB`)
- **Rare:** Purple (`#9370DB`)
- **Epic:** Pink (`#FF69B4`)
- **Legendary:** Gold (`#FFD700`)

---

## 📱 Mobile Support

### Touch Controls
- Virtual joystick (left side)
- Tap to interact
- Swipe gestures for menus
- Haptic feedback

### Responsive Layout
- 400×700 base resolution
- Scales to screen size
- Touch-optimized UI

---

## 🔐 Debug System

### Debug Overlay
Press `Ctrl+Shift+D` to toggle.

Features:
- Performance metrics (FPS, frame time)
- Quick actions (add coins, spawn buddy)
- Console log viewer
- State inspector

### Validation
- `GET /api/debug/validate` - Check game state integrity
- `GET /api/debug/report` - Get debug report

---

## 🚀 Deployment

### Cloudflare Pages

1. Build: `npm run build`
2. Deploy: `wrangler pages deploy dist --project-name buy-a-buddy`

### CI/CD

GitHub Actions workflow for:
- Lint & type check
- Unit tests
- E2E tests
- Auto-deploy on main

---

## 📈 Performance

### Targets
- 60 FPS gameplay
- < 16.67ms frame time
- < 100ms input latency
- < 500KB initial bundle

### Optimization
- Sprite pooling
- Object reuse
- Throttled updates
- Lazy loading

---

## 🔮 Future Features

- [ ] Multiplayer co-op battles
- [ ] Guild system
- [ ] Seasonal events
- [ ] Cloud save (Cloudflare KV)
- [ ] Leaderboards
- [ ] Steam release
- [ ] Native mobile app (Capacitor)

---

## 📝 License

MIT