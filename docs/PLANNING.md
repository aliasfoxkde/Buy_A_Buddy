Here’s a **complete, structured, handoff-ready plan** you can give directly to another AI or developer. It’s written as a clear specification with architecture, phases, and implementation detail.

---

# 🎮 GAME DEVELOPMENT PLAN

## **Project: “Buy a Buddy” (Web Idle Game)**

---

# 🧾 1. PROJECT OVERVIEW

**Type:** Idle / Tycoon / Management Game
**Platform:** Web (PWA installable)
**Tech Stack:**

* **Build Tool:** Vite.js
* **Rendering/Game Engine:** Phaser.js (preferred) OR PixiJS
* **Language:** JavaScript (or TypeScript if preferred)
* **PWA Support:** vite-plugin-pwa
* **Deployment:** Cloudflare Pages

---

# 🎯 2. CORE GAME CONCEPT

Players buy and manage “Buddies” that generate passive income over time.
They assign buddies to plots, upgrade them, and unlock rarer units through a randomized spawner system.

---

# 🔁 3. CORE GAME LOOP

1. Player starts with small amount of currency
2. Buys a buddy
3. Assigns buddy to a plot
4. Buddy generates income over time
5. Player collects earnings
6. Player upgrades buddies/plots or buys more
7. Player unlocks spawner for rare buddies
8. Repeat with scaling progression

---

# 🧱 4. SYSTEM ARCHITECTURE

## 4.1 Game State (Single Source of Truth)

Create a central state object:

```js
gameState = {
  currency: 0,
  buddies: [],
  plots: [],
  upgrades: {},
  stats: {},
  lastUpdate: timestamp
}
```

---

## 4.2 Buddy System

### Data Structure:

```js
buddy = {
  id: string,
  name: string,
  rarity: "common" | "rare" | "epic" | "legendary",
  baseIncome: number,
  level: number,
  assignedPlotId: string | null,
  modifiers: []
}
```

### Mechanics:

* Generates income per second
* Can be upgraded (linear or exponential scaling)
* May have special traits (Phase 3+)

---

## 4.3 Plot System

```js
plot = {
  id: string,
  level: number,
  multiplier: number,
  assignedBuddyId: string | null
}
```

### Rules:

* One buddy per plot
* Income = buddy income × plot multiplier
* Plots upgrade to increase multiplier

---

## 4.4 Income System

### Passive Income Formula:

```js
incomePerSecond = sum(
  buddy.baseIncome * buddy.level * plot.multiplier
)
```

### Game Loop Tick:

* Runs every ~100ms–1000ms
* Updates currency incrementally

---

## 4.5 Offline Progress (Critical Feature)

When game loads:

```js
timeAway = now - lastUpdate

offlineIncome = incomePerSecond * timeAway

currency += offlineIncome
```

---

## 4.6 Spawner System (Gacha Mechanic)

### Function:

Randomly generates a buddy

### Example Drop Table:

```js
rarityChances = {
  common: 60,
  rare: 25,
  epic: 10,
  legendary: 5
}
```

### Output:

* New buddy added to inventory

---

## 4.7 Economy System

### Currency:

* Coins (main)

### Scaling:

* Costs increase exponentially:

```js
cost = baseCost * (1.15 ^ ownedCount)
```

---

## 4.8 Save System

Use:

* `localStorage` (Phase 1–2)
* Optional: Cloudflare KV (Phase 4+)

Auto-save every:

* 5–10 seconds
* On tab close

---

# 🧩 5. UI STRUCTURE

## Screens:

### Main Game Screen:

* Currency display
* Plots grid
* Active buddies

### Shop Panel:

* Buy buddies
* Spawner button

### Upgrade Panel:

* Upgrade plots
* Upgrade buddies

### Inventory:

* Unassigned buddies

---

# ⚙️ 6. TECHNICAL STACK DETAILS

## 6.1 Vite Setup

```bash
npm create vite@latest buy-a-buddy
cd buy-a-buddy
npm install
```

---

## 6.2 Install Dependencies

```bash
npm install phaser
npm install vite-plugin-pwa
```

---

## 6.3 Project Structure

```
/src
  /game
    Game.js
    scenes/
      MainScene.js
  /systems
    economy.js
    saveSystem.js
    spawner.js
  /ui
    hud.js
  main.js
index.html
vite.config.js
```

---

## 6.4 Phaser Integration

* Use Phaser Scene system
* One main scene for gameplay
* Optional UI overlay scene

---

# 📱 7. PWA IMPLEMENTATION

## vite.config.js

```js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Buy a Buddy',
        short_name: 'BuddyGame',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#00aaff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
}
```

---

## PWA Requirements:

* Service worker auto-generated
* Offline caching enabled
* Installable on mobile

---

# ☁️ 8. DEPLOYMENT (CLOUDFLARE)

## Steps:

1. Build project:

```bash
npm run build
```

2. Output folder:

```
/dist
```

3. Deploy to:

* Cloudflare Pages

## Settings:

* Build command: `npm run build`
* Output directory: `dist`

---

# 🚀 9. DEVELOPMENT PHASES

---

## 🟢 Phase 1: Core Prototype (MVP)

**Goal:** Playable basic loop

### Features:

* Currency system
* One buddy type
* One plot
* Passive income ticking
* Basic UI (text/buttons)
* Save/load system

---

## 🟡 Phase 2: Core Gameplay Expansion

**Goal:** Make it feel like a real game

### Add:

* Multiple buddies
* Rarity system
* Spawner (random generation)
* Multiple plots
* Upgrades
* Better UI layout

---

## 🔵 Phase 3: Depth & Engagement

**Goal:** Increase retention

### Add:

* Special abilities
* Merge system (combine buddies)
* Lucky drops / bonus events
* Animations
* Sound effects

---

## 🟣 Phase 4: Polish & Optimization

**Goal:** Production-ready

### Add:

* Full PWA polish
* Performance tuning
* Better balancing
* Responsive UI (mobile-first)

---

## 🔴 Phase 5: Optional Advanced Features

* Cloud save (Cloudflare KV)
* Leaderboards
* Daily rewards
* Limited-time events

---

# 🧪 10. PERFORMANCE GUIDELINES

* Use requestAnimationFrame for rendering
* Use setInterval for economy ticks (500–1000ms)
* Avoid heavy re-renders
* Keep state minimal and normalized

---

# 🧠 11. AI IMPLEMENTATION INSTRUCTIONS

Hand this to the AI:

> Build a browser-based idle tycoon game using Vite and Phaser.
> Implement a buddy system where characters generate passive income when assigned to plots.
> Include a central game state, save/load system, offline progress calculation, and a random spawner mechanic with rarity tiers.
> Structure the code modularly with systems for economy, spawning, and saving.
> Ensure the game works as a PWA and is optimized for deployment on Cloudflare Pages.

---

# 💡 12. OPTIONAL IMPROVEMENTS

* Add humor/personality to buddies
* Add visual evolution when leveling up
* Add achievements system
* Add “AFK bonus” multipliers

---

If you want next, I can generate:

* A **starter codebase (copy-paste ready)**
* Or a **prompt specifically tuned for Cursor / GPT / Claude to build this automatically**
