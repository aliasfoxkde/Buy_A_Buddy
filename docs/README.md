# Buy a Buddy - Game Development Documentation

## 📋 Overview

**Buy a Buddy** is a web-based idle tycoon game built with TypeScript and Vite. Players buy and manage "Buddies" that generate passive income over time.

### Tech Stack
- **Build Tool:** Vite 6.x
- **Language:** TypeScript 5.x
- **Testing:** Vitest 3.x with jsdom
- **API Server:** Express 4.x with Swagger UI
- **PWA:** vite-plugin-pwa with Workbox
- **Deployment:** Cloudflare Pages

---

## 🏗️ Architecture

```
src/
├── api/                    # Express API server
│   ├── docs/              # OpenAPI/Swagger documentation
│   ├── routes/            # API route handlers
│   ├── server.ts          # Server entry point
│   └── types.ts            # API DTOs and response types
├── game/                   # Core game logic
│   ├── gameEngine.ts      # Main game state management
│   └── types.ts           # Game type definitions
├── systems/                # Game systems
│   ├── economy.ts         # Income calculations
│   ├── saveSystem.ts      # localStorage persistence
│   └── spawner.ts         # Buddy creation and rarity
├── ui/                     # Frontend UI
│   ├── components.ts      # UI components
│   └── uiManager.ts       # DOM rendering and events
└── main.ts                # Entry point
```

---

## 🎮 Core Concepts

### Buddies

Each buddy has:
- **Rarity:** common (60%), rare (25%), epic (12%), legendary (3%)
- **Base Income:** 1× to 8× multiplier based on rarity
- **Level:** Upgradeable, increases income
- **Assignment:** Can work on a plot or be in inventory

### Plots

Each plot:
- **Multiplier:** Increases with level (1 + (level-1) × 0.5)
- **Assignment:** One buddy per plot
- **Income:** buddy.baseIncome × buddy.level × plot.multiplier

### Upgrades

| Upgrade | Effect | Max Level |
|---------|--------|-----------|
| Plot Power | +50% plot multiplier per level | 20 |
| Lucky Spawn | +5% rare+ spawn chance per level | 10 |

### Income Formula

```
incomePerSecond = Σ(buddy.baseIncome × buddy.level × plot.multiplier)
```

---

## 🧪 Testing

### Run Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage    # Coverage report
```

### Test Structure
```
tests/
├── api/api.test.ts       # API response format tests
├── game/types.test.ts    # Type system tests
├── systems/
│   ├── economy.test.ts   # Income calculations
│   ├── saveSystem.test.ts # Persistence tests
│   └── spawner.test.ts   # Buddy generation
└── setup.ts             # Test utilities
```

### Coverage Targets
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

---

## 🌐 API Documentation

The API server provides RESTful endpoints for game operations.

### Start Server
```bash
npm run dev:api          # Start API server on port 3001
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/game/state` | Get current game state |
| GET | `/api/game/income` | Get income rate |
| GET | `/api/game/spawner` | Get spawner info |
| POST | `/api/buddy/buy` | Buy a new buddy |
| POST | `/api/buddy/assign` | Assign to plot |
| POST | `/api/buddy/unassign` | Unassign from plot |
| POST | `/api/buddy/upgrade` | Upgrade buddy level |
| POST | `/api/plot/upgrade` | Upgrade plot level |
| POST | `/api/upgrade/purchase` | Buy global upgrade |
| POST | `/api/admin/add-currency` | Add currency (dev) |
| POST | `/api/admin/reset` | Reset game (dev) |
| GET | `/api/health` | Health check |

### API Docs UI
Visit `http://localhost:3001/api-docs` for Swagger UI.

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1234567890
}
```

---

## 📱 PWA Configuration

### Installation
The game can be installed as a Progressive Web App on mobile and desktop.

### Features
- Offline support via Service Worker
- Auto-update on new version
- App-like experience (standalone display)

### Icons
Located in `/public/icons/`:
- `icon-192.svg` (192×192)
- `icon-512.svg` (512×512)

---

## ☁️ Cloudflare Deployment

### Setup
1. Install Wrangler CLI: `npm i -g wrangler`
2. Configure `wrangler.toml`:
```toml
name = "buy-a-buddy"
compatibility_date = "2024-12-01"
pages_build_output_dir = "dist"
```

### Deploy
```bash
npm run deploy
# or manually:
npm run build
wrangler pages deploy dist --project-name buy-a-buddy
```

### Environment Variables
```env
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

---

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
npm install
```

### Commands
```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run dev:api      # Start API server
npm run test         # Run tests
npm run lint         # Lint code
```

### Project Structure
```
.
├── docs/              # Documentation
├── public/            # Static assets
├── references/        # Design references
├── src/               # Source code
├── tests/             # Test files
├── index.html         # Entry HTML
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── vite.config.ts     # Vite config
├── vitest.config.ts   # Test config
└── wrangler.toml     # CF deployment
```

---

## 🎯 Roadmap

### Phase 1 ✅ (Complete)
- [x] Core game types and state
- [x] Buddy spawner with rarity
- [x] Income calculation
- [x] Save system

### Phase 2 ✅ (Complete)
- [x] 3×3 plot grid
- [x] Buddy assignment
- [x] Upgrade system
- [x] Basic UI

### Phase 3 🔄 (Current)
- [ ] Animations and visual feedback
- [ ] Sound effects
- [ ] Achievement system
- [ ] Mobile responsiveness

### Phase 4 📋 (Planned)
- [ ] Cloud save (Cloudflare KV)
- [ ] Leaderboards
- [ ] Daily rewards
- [ ] Limited-time events

---

## 📖 References

- Game design inspiration from reference images in `/references/`
- Color scheme: Dark purple (#1a0a2e) with pink (#a855f7, #ec4899) accents
- Emoji-based buddy characters

---

## 📄 License

MIT