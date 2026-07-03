# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Buy a Buddy is a 2D RPG game built with **Phaser 3** (frontend) and **Express** (API backend), deployed on Cloudflare Pages. The game features idle farming mechanics, turn-based battles, buddy collection/gacha, and exploration.

## Common Commands

```bash
# Development
npm run dev          # Start Vite dev server (port 5173)
npm run dev:api      # Start Express API server (port 3001)

# Build & Deploy
npm run build        # TypeScript compile + Vite build → dist/
npm run deploy       # Build + deploy to Cloudflare Pages

# Testing
npm run test         # Run Vitest unit tests
npm run test:watch   # Watch mode for tests
npm run test:coverage # Coverage report
npm run test:e2e     # Run Playwright E2E tests

# Code Quality
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier formatting
npm run check        # typecheck + lint + test
npm run audit        # lint + test + build
```

**Run a single test file:**
```bash
npx vitest run tests/unit/IdleSystem.test.ts
```

## Architecture

### Game Engine (Phaser 3)

The game uses Phaser 3 with a scene-based architecture. Entry point is `src/game/gameEngine.ts` which registers 13 scenes:

| Scene | Purpose |
|-------|---------|
| `BootScene` | Asset loading, initial setup |
| `MainMenuScene` | Title screen |
| `CharacterSelectScene` | Buddy selection |
| `WorldScene` | Main exploration (52KB - largest scene) |
| `BattleScene` | Turn-based combat |
| `InventoryScene` | Equipment management |
| `ShopScene` | Store purchases |
| `QuestScene` | Quest tracking |
| `MenuScene` | Pause menu |
| `SettingsScene` | Game settings |
| `SaveLoadScene` | Save/load game state |
| `AchievementScene` | Achievements display |
| `StatsScene` | Player statistics |

### State Management

`GameStateService` (singleton in `src/services/GameStateService.ts`) is the central state manager. It:
- Holds the complete `GameState` object
- Processes actions via `processAction(action)` method
- Notifies subscribers on state changes
- Handles: spawning, assigning, upgrading buddies, work plots, breeding

### Module System

Game logic is organized into modules under `src/modules/`:
- `achievements/`, `ai/`, `buffs/`, `combat/`, `crafting/`, `dialogue/`, `events/`, `inventory/`, `npc/`, `quests/`, `skills/`, `storage/`, `story/`, `tutorial/`, `world/`

Core systems in `src/systems/`:
- `GameSystems.ts` - Main game logic orchestrator
- `BuddySystem.ts` - Buddy management
- `AchievementSystem.ts` - Achievement tracking
- `TutorialSystem.ts` - Tutorial flow

### API Server

Express server (`src/api/server.ts`) runs separately from the game:
- Port 3001 (dev) or from `API_PORT` env var
- Swagger docs at `/api-docs`
- Routes: `/api/game`, `/api/health`, `/api/debug`, `/api/metrics`
- Game state actions via `POST /api/game/action`

### Data Layer

Static game data in `src/data/`:
- `enemies.ts`, `equipment.ts`, `equipmentSets.ts`, `quests.ts`, `skills.ts`, `zones.ts`, `dialogue.ts`

### Build & Development Notes

- Vite dev server proxies API requests (configured in `vite.config.ts`)
- PWA via `vite-plugin-pwa` with service worker registration in `main.ts`
- Game pauses/resumes on tab visibility change (`visibilitychange` event)
- Path alias: `@/*` maps to `./src/*` (configured in tsconfig and vite)
- TypeScript strict mode enabled with `noImplicitAny`, `strictNullChecks`

## Key Files

- `src/main.ts` - DOM initialization, game startup
- `src/game/gameEngine.ts` - Phaser config and scene registration
- `src/services/GameStateService.ts` - Central state management
- `src/scenes/WorldScene.ts` - Main gameplay scene
- `src/scenes/BattleScene.ts` - Combat system
- `src/data/*.ts` - Game data definitions
- `src/api/server.ts` - Express backend
