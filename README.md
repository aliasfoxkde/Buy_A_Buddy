# 🎮 Buy a Buddy

> An immersive 2D RPG with integrated mini-games featuring adorable buddies, idle farming, turn-based battles, and exploration.

[![GitHub Issues](https://img.shields.io/github/issues/aliasfoxkde/Buy_a_Buddy)](https://github.com/aliasfoxkde/Buy_a_Buddy/issues)
[![License](https://img.shields.io/github/license/aliasfoxkde/Buy_a_Buddy)](#license)
[![Deploy Status](https://img.shields.io/github/deployments/aliasfoxkde/Buy_a_Buddy/production)](https://buy-a-buddy.pages.dev)

**[🌐 Play Now](https://buy-a-buddy.pages.dev)** | **[📖 Documentation](docs/README.md)** | **[🧪 Testing](docs/TESTING.md)** | **[🔧 API](docs/API.md)**

---

## 🎯 Quick Start

```bash
# Clone and install
git clone https://github.com/aliasfoxkde/Buy_a_Buddy.git
cd Buy_A_Buddy
npm install

# Development
npm run dev          # Start game at http://localhost:5173

# Production
npm run build        # Build for deployment
npm run deploy       # Deploy to Cloudflare Pages

# Testing
npm run test         # Run all tests
npm run test:e2e     # Run Playwright E2E tests
```

---

## 📚 Documentation

### Planning & Progress
| Document | Description |
|----------|-------------|
| [📋 PLANNING.md](docs/PLANNING.md) | Feature roadmap and implementation plan |
| [📊 PROGRESS.md](docs/PROGRESS.md) | Development progress and milestones |
| [📝 TASKS.md](docs/TASKS.md) | Current and upcoming tasks |
| [🔬 RESEARCH.md](docs/RESEARCH.md) | Technical research and decisions |

### Technical Documentation
| Document | Description |
|----------|-------------|
| [📖 docs/README.md](docs/README.md) | Complete project documentation |
| [🔧 API.md](docs/API.md) | API endpoints and usage |
| [🧪 TESTING.md](docs/TESTING.md) | Testing strategy and coverage |
| [🚀 DEPLOYMENT.md](docs/DEPLOYMENT.md) | Cloudflare Pages deployment guide |

### Project Structure
```
Buy_A_Buddy/
├── src/
│   ├── api/           # Express API server with Swagger docs
│   ├── config/        # Game constants and configuration
│   ├── debug/         # Debug overlay and performance tools
│   ├── game/          # Core game types
│   ├── scenes/        # Phaser 3 scenes (Boot, Menu, Game)
│   ├── services/      # Game state management
│   ├── sprites/       # Procedural sprite generation
│   ├── systems/       # Core game logic systems
│   └── ui/            # UI components
├── tests/
│   ├── unit/          # Unit tests (Vitest)
│   ├── integration/   # Integration tests
│   └── e2e/           # Playwright E2E tests
├── docs/              # Full documentation
├── scripts/          # Utility scripts
└── public/            # Static assets and PWA icons
```

---

## 🎮 Features

### Core Gameplay
- **Idle Farm** - Assign buddies to work plots for passive income
- **Buddy Gacha** - Spawn buddies with 4 rarity tiers (Common → Legendary)
- **Turn-Based Battles** - Combat system with attack, defense, and speed stats
- **Quest System** - Complete objectives for rewards
- **Breeding** - Combine buddies to create new ones

### Technical Features
- **PWA Installable** - Play on desktop or mobile
- **Touch Controls** - Virtual joystick for mobile
- **Offline Earnings** - Earn coins while away (50% efficiency, max 24h)
- **Cloud Save Ready** - State persistence via API

### Rarity System
| Rarity | Color | Drop Rate | Base Income |
|--------|-------|-----------|-------------|
| Common | Sky Blue | 60% | 1/sec |
| Rare | Purple | 25% | 3/sec |
| Epic | Pink | 12% | 7/sec |
| Legendary | Gold | 3% | 20/sec |

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Test Coverage
| Category | Tests | Status |
|----------|-------|--------|
| IdleSystem | 10 | ✅ |
| SpawnerSystem | 6 | ✅ |
| BattleSystem | 8 | ✅ |
| QuestSystem | 6 | ✅ |
| ValidationSystem | 4 | ✅ |
| SaveSystem | 6 | ✅ |
| DebugSystem | 3 | ✅ |

---

## 🌐 API

### Endpoints

#### Game State
- `GET /api/game/state` - Get current game state
- `POST /api/game/action` - Perform game action

#### Spawning
- `GET /api/game/spawner` - Get spawner info
- `POST /api/game/spawn` - Spawn a buddy

#### Buddies & Plots
- `GET /api/game/buddies` - List all buddies
- `GET /api/game/plots` - List work plots

#### Debug
- `GET /api/debug/report` - Get debug report
- `GET /api/debug/validate` - Validate game state
- `GET /api/debug/metrics` - Get performance metrics

#### Health
- `GET /api/health` - Health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

### Interactive Docs

Visit `/api-docs` for Swagger UI documentation.

---

## 🚀 Deployment

### Cloudflare Pages

1. Fork/clone the repo
2. Connect to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy!

### Environment Variables

```env
# Optional
NODE_ENV=production
API_PORT=3001
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

---

## 📄 License

See [LICENSE](LICENSE) for details.

---

## 🙏 Credits

- **Phaser 3** - Game engine
- **Vite** - Build tool
- **Express** - API server
- **Vitest** - Testing
- **Playwright** - E2E testing
- **Cloudflare Pages** - Hosting

---

**Built with 💜 by the Buy a Buddy Team**