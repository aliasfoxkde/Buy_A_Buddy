# API Documentation

## Base URL
```
http://localhost:3001
```

## Interactive Documentation
Visit `/api-docs` for Swagger UI with interactive testing.

---

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1713936000000
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "timestamp": 1713936000000
}
```

---

## Endpoints

### Game State

#### `GET /api/game/state`
Get the complete current game state.

**Response:**
```json
{
  "success": true,
  "data": {
    "currency": 100,
    "buddies": [...],
    "plots": [...],
    "upgrades": [...],
    "stats": {
      "totalEarned": 0,
      "sessionEarned": 0,
      "highScore": 0
    },
    "lastUpdate": 1713936000000,
    "totalPlayTime": 0,
    "buddiesBought": 0,
    "moneyEarned": 0
  },
  "timestamp": 1713936000000
}
```

---

#### `GET /api/game/income`
Get current income per second.

**Response:**
```json
{
  "success": true,
  "data": { "incomePerSecond": 5.5 },
  "timestamp": 1713936000000
}
```

---

#### `GET /api/game/spawner`
Get spawner information.

**Response:**
```json
{
  "success": true,
  "data": {
    "ownedCount": 3,
    "spawnCost": 13,
    "spawnCostNext": 15
  },
  "timestamp": 1713936000000
}
```

---

### Buddies

#### `POST /api/buddy/buy`
Buy a new random buddy.

**Request Body (optional):**
```json
{
  "forceRarity": "legendary"  // Admin/testing only
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1713936000000-abc123",
    "name": "Cosmic",
    "emoji": "💜",
    "rarity": "epic",
    "baseIncome": 4,
    "level": 1,
    "assignedPlotId": null
  },
  "timestamp": 1713936000000
}
```

**Errors:**
- `INSUFFICIENT_FUNDS` - Not enough currency (cost scales with owned count)

---

#### `POST /api/buddy/assign`
Assign a buddy to a plot.

**Request Body:**
```json
{
  "buddyId": "buddy-123",
  "plotId": "plot-1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "buddy": { ... },
    "plot": { ... }
  },
  "timestamp": 1713936000000
}
```

**Errors:**
- `BUDDY_NOT_FOUND` - Buddy doesn't exist
- `PLOT_NOT_FOUND` - Plot doesn't exist
- `PLOT_OCCUPIED` - Plot already has a buddy

---

#### `POST /api/buddy/unassign`
Unassign a buddy from their current plot.

**Request Body:**
```json
{
  "buddyId": "buddy-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "buddy": { ... } },
  "timestamp": 1713936000000
}
```

---

#### `POST /api/buddy/upgrade`
Upgrade a buddy's level.

**Request Body:**
```json
{
  "buddyId": "buddy-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "buddy": { ... },
    "cost": 7
  },
  "timestamp": 1713936000000
}
```

**Cost Formula:** `5 × 1.5^(level-1)`

---

### Plots

#### `POST /api/plot/upgrade`
Upgrade a plot's multiplier.

**Request Body:**
```json
{
  "plotId": "plot-1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plot": { ... },
    "cost": 35
  },
  "timestamp": 1713936000000
}
```

**Cost Formula:** `25 × 1.4^(level-1)`

---

### Upgrades

#### `POST /api/upgrade/purchase`
Purchase a global upgrade.

**Request Body:**
```json
{
  "upgradeId": "plot-boost"
}
```

**Available Upgrades:**
- `plot-boost` - Increases all plot multipliers (+50% per level)
- `spawn-luck` - Better rare+ spawn chances (+5% per level)

**Response:**
```json
{
  "success": true,
  "data": {
    "upgrade": { ... },
    "cost": 100
  },
  "timestamp": 1713936000000
}
```

**Errors:**
- `UPGRADE_NOT_FOUND` - Upgrade doesn't exist
- `UPGRADE_MAXED` - Already at max level

---

### Admin

#### `POST /api/admin/add-currency`
Add currency to the game (development/testing).

**Request Body:**
```json
{
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": { "newBalance": 1100 },
  "timestamp": 1713936000000
}
```

---

#### `POST /api/admin/reset`
Reset the game to initial state.

**Response:**
```json
{
  "success": true,
  "data": { ... },  // New game state
  "timestamp": 1713936000000
}
```

---

### Health

#### `GET /api/health`
System health check.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "uptime": 3600,
    "timestamp": 1713936000000
  },
  "timestamp": 1713936000000
}
```

---

#### `GET /api/health/ready`
Kubernetes-style readiness probe.

**Response:**
```json
{
  "success": true,
  "data": { "ready": true },
  "timestamp": 1713936000000
}
```

---

#### `GET /api/health/live`
Kubernetes-style liveness probe.

**Response:**
```json
{
  "success": true,
  "data": { "alive": true },
  "timestamp": 1713936000000
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Missing or invalid parameters |
| `NOT_FOUND` | Resource not found |
| `INSUFFICIENT_FUNDS` | Not enough currency |
| `BUDDY_NOT_FOUND` | Buddy doesn't exist |
| `PLOT_NOT_FOUND` | Plot doesn't exist |
| `UPGRADE_NOT_FOUND` | Upgrade doesn't exist |
| `PLOT_OCCUPIED` | Plot already has a buddy |
| `BUDDY_ASSIGNED` | Buddy is already working |
| `UPGRADE_MAXED` | Upgrade at maximum level |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

Not currently implemented. Consider adding for production use.

---

## CORS

The API accepts requests from any origin by default. Configure via `CORS_ORIGIN` environment variable.