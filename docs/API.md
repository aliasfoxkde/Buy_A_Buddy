# 🔧 API Documentation

> Last Updated: 2026-04-25

---

## 📋 Overview

The Buy a Buddy API is built with Express.js and provides endpoints for game state management, debugging, and health monitoring.

**Base URL:** `http://localhost:3001/api`

**Interactive Docs:** Visit `/api-docs` for Swagger UI.

---

## 📡 Endpoints

### Game State

#### GET /api/game/state
Get the current game state.

**Response:**
```json
{
  "success": true,
  "data": {
    "player": { "name": "Trainer", "level": 1, "coins": 100 },
    "buddies": [],
    "plots": [],
    "inventory": [],
    "quests": [],
    "statistics": { ... },
    "settings": { ... }
  }
}
```

#### POST /api/game/action
Perform a game action (spawn buddy, assign to plot, etc.)

**Request:**
```json
{
  "type": "SPAWN_BUDDY",
  "payload": { }
}
```

**Action Types:**
- `SPAWN_BUDDY` - Spawn a new buddy
- `ASSIGN_BUDDY` - Assign buddy to plot
- `UNASSIGN_BUDDY` - Remove buddy from plot
- `UPGRADE_PLOT` - Upgrade a work plot
- `UPGRADE_BUDDY` - Level up a buddy
- `START_QUEST` - Start a new quest
- `COMPLETE_QUEST` - Complete a quest objective
- `CLAIM_QUEST_REWARD` - Claim quest rewards

---

### Spawning

#### GET /api/game/spawner
Get spawner information and costs.

**Response:**
```json
{
  "success": true,
  "data": {
    "nextCost": 100,
    "totalSpawned": 0,
    "rarityRates": {
      "common": 0.60,
      "rare": 0.25,
      "epic": 0.12,
      "legendary": 0.03
    }
  }
}
```

#### POST /api/game/spawn
Spawn a new buddy.

**Request:**
```json
{
  "forceRarity": "rare"
}
```

---

### Buddies

#### GET /api/game/buddies
List all buddies in inventory.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "buddy_abc123",
      "name": "Blobby",
      "rarity": "rare",
      "level": 1,
      "xp": 0,
      "xpRequired": 100,
      "baseIncome": 3,
      "stats": {
        "attack": 10,
        "defense": 5,
        "speed": 8,
        "hp": 100,
        "maxHp": 100
      },
      "isWorking": true,
      "workPlotId": "plot_1"
    }
  ]
}
```

---

### Plots

#### GET /api/game/plots
List all work plots.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "plot_1",
      "level": 1,
      "multiplier": 1.0,
      "buddyId": "buddy_abc123",
      "buddy": { ... }
    }
  ]
}
```

---

### Debug

#### GET /api/debug/report
Get debug report with game state analysis.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": 1714000000000,
    "state": { ... },
    "metrics": {
      "fps": 60,
      "frameTime": 16.67
    },
    "issues": []
  }
}
```

#### GET /api/debug/validate
Validate game state integrity.

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

#### GET /api/debug/metrics
Get performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "fps": 60,
    "frameTime": 16.67,
    "memory": { "used": 0, "total": 0 },
    "entities": 0,
    "drawCalls": 0
  }
}
```

---

### Health

#### GET /api/health
Health check (summary).

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": 1714000000000,
    "uptime": 3600,
    "services": {
      "api": "healthy",
      "game": "healthy"
    }
  }
}
```

#### GET /api/health/ready
Readiness probe.

**Response:**
```json
{
  "success": true,
  "data": { "ready": true }
}
```

#### GET /api/health/live
Liveness probe.

**Response:**
```json
{
  "success": true,
  "data": { "alive": true }
}
```

---

## 🛡 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Not enough coins to spawn buddy",
    "details": { "required": 100, "available": 50 }
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_ACTION` | 400 | Unknown action type |
| `INVALID_PAYLOAD` | 400 | Malformed request body |
| `INSUFFICIENT_FUNDS` | 402 | Not enough coins |
| `NOT_FOUND` | 404 | Resource not found |
| `PLOT_OCCUPIED` | 409 | Plot already has buddy |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 🔒 Rate Limiting

Currently no rate limiting. Future versions may implement:
- 100 requests/minute per IP
- 10 spawns/minute per player

---

## 📝 Versioning

API versioning will follow this pattern when needed:
- `v1` - Current version
- Breaking changes will bump to `v2`

---

## 🚀 CORS

CORS is enabled for all origins in development.
In production, configure allowed origins in `src/api/server.ts`.

---

## 📚 Related Documentation

- [docs/README.md](../README.md) - Project overview
- [docs/TESTING.md](./TESTING.md) - Testing guide
- [docs/DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide