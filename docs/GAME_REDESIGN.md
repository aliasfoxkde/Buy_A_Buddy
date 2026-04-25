# 🎮 Buy a Buddy - Game Redesign Plan

> Based on Reference Art: Cute Kawaii Creatures

## Reference Art Analysis

### IMG_20260424_184959959.jpg
- Purple creature with dress/horns
- Big sparkly eyes
- Pink cheeks
- Hearts decoration
- Cute, elegant pose

### IMG_20260424_185054803.jpg  
- Blue/cyan winged creature
- White shirt/top
- Big friendly eyes
- Soft colors
- Angelic/good vibes

### IMG_20260424_185128463.jpg
- Dark RPG character
- Floating gems/crystals
- Mysterious aura
- Purple/gem aesthetic

### 17770721187824770666356491552512.jpg
- Floating crystals/gems
- Various colors (pink, blue, purple, gold)
- Magical sparkle effects
- Collectible feel

---

## Sprite Generation Strategy

### Buddy Types (Matching Reference Art)
1. **Angel Buddy** - Blue wings, white outfit, friendly face
2. **Demon Buddy** - Purple dress, horns, elegant
3. **Crystal Buddy** - Gem-like body, floating crystals
4. **Fairy Buddy** - Wings, pink, magical
5. **Slime Buddy** - Cute blob, simple but expressive

### Visual Style
- Large expressive eyes (40% of face)
- Rounded blob-like bodies
- Soft gradients (no hard edges)
- Sparkle/shine effects on rare+
- Rarity-based decorations (wings, crowns, halos)

### Color Palette
| Rarity | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| Common | #87CEEB (sky) | #E0F7FF | white |
| Rare | #9370DB (purple) | #D8B4FE | pink |
| Epic | #FF69B4 (pink) | #FFB6C1 | gold |
| Legendary | #FFD700 (gold) | #FFF8DC | rainbow |

---

## Gameplay Overhaul

### Core Loop
1. **Spawn Buddies** - Gacha with visual excitement
2. **Collect** - Inventory of cute creatures
3. **Upgrade** - Level up buddies, increase income
4. **Decorate** - Show off rare buddies
5. **Evolve** - Combine buddies for better ones

### Main Screen Layout
```
┌────────────────────────────────────┐
│  💰 Coins    ❤️ Health    📊 Level │
├────────────────────────────────────┤
│                                    │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │   BUDDY DISPLAY AREA    │     │
│    │   (Current selected)    │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                    │
│    ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐       │
│    │1│ │2│ │3│ │4│ │5│ │6│  Buddy │
│    └─┘ └─┘ └─┘ └─┘ └─┘ └─┘  Slots │
│                                    │
├────────────────────────────────────┤
│  [🎲 SPAWN]  [💼 INVENTORY]  [⚙️] │
└────────────────────────────────────┘
```

### Spawn Animation
1. Button press → anticipation wobble
2. Egg/gem appears → particle swirl
3. Crack/break → reveal buddy
4. Buddy bounces → sparkle explosion
5. Rarity indicator glow

### Work Plots (Idle Income)
- 6 buddy slots that work while you're away
- Each slot has visual buddy working
- Income rate shown per buddy
- Tap to collect earnings

---

## Technical Implementation

### Sprite Generation Canvas
- 64x64 base sprites (scalable)
- Layer-based rendering:
  1. Body base
  2. Face (eyes, mouth)
  3. Accessories (wings, horns, crowns)
  4. Effects (sparkles, glow)

### Animation System
- Idle bounce (subtle)
- Working animation (gentle bounce)
- Happy animation (jump + sparkles)
- Level up animation (glow + particles)

---

## File Structure
```
src/
├── sprites/
│   ├── BuddyFactory.ts      # Generate buddy sprites
│   ├── SpriteRenderer.ts    # Canvas-based rendering
│   └── animations.ts        # Animation presets
├── scenes/
│   ├── MenuScene.ts         # Main menu
│   ├── FarmScene.ts         # Idle farm gameplay
│   ├── CollectionScene.ts   # Buddy collection view
│   └── SpawnScene.ts        # Gacha spawn animation
└── ui/
    ├── BuddyCard.ts         # Buddy display component
    ├── CoinCounter.ts        # Animated coin counter
    └── Button.ts             # Styled buttons
```

---

## Success Criteria
- [ ] Sprites match reference art kawaii style
- [ ] Gameplay is clear and intuitive
- [ ] Spawning is exciting with visual feedback
- [ ] Buddies are collectible and upgradeable
- [ ] Idle income works and is visible
- [ ] UI is polished and responsive