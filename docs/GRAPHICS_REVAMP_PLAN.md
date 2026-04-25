# BUY A BUDDY - GRAPHICS REVAMP PLAN

## Current State Assessment

### Problems Identified
1. Sprite extraction was done incorrectly (random naming, broken paths)
2. Character select screen shows wrong sprites
3. Menu doesn't match the anime art style
4. No proper sprite atlas/sheet structure
5. Missing UI elements that match the reference style

### Reference Art Available
| File | Content | Dimensions |
|------|---------|------------|
| `6f01f97c-f64d-...png` | Character roster Row 1 (3 chars) | 1536x1024 |
| `2302f2f7-cafe-...png` | Character roster Row 2 (3 chars) | 1536x1024 |
| `d19219d5-8e04-...png` | Character selection UI grid | 1536x1024 |
| `04b88bcc-abd3-...png` | Full character list with names | 1536x1024 |

### Extracted Character Sprites (12 total)
Based on visual inspection of composite image:

| Sprite File | Character | Rarity | Visual Features |
|-------------|-----------|--------|------------------|
| `twilight_petal.png` | Twilight Petal | Rare | Pink twin-tails, purple dress, wings, thigh-highs |
| `rose_angel.png` | Rose Angel | Common | White/pink outfit, blonde hair, cross accessory |
| `shadow_mistress.png` | Shadow Mistress | Epic | Dark purple outfit, long flowing hair |
| `crimson_flame.png` | Crimson Flame | Epic | Red dress, black hair, dramatic |
| `violet_dream.png` | Violet Dream | Rare | Purple outfit, matching hair |
| `dark_princess.png` | Dark Princess | Legendary | Dark purple, white stockings, crown |
| `golden_hero.png` | Golden Hero | Legendary | Gold/yellow dress, crown, majestic |
| `petal_fairy.png` | Petal Fairy | Common | Pink outfit, soft appearance |
| `night_weaver.png` | Night Weaver | Rare | Dark purple/black, mysterious |
| `emerald_sprite.png` | Emerald Sprite | Common | Green, ribbon, hair up |
| `storm_mage.png` | Storm Mage | Epic | Purple/pink, hair up |
| `frost_enchantress.png` | Frost Enchantress | Rare | Light purple, pigtails, frozen beauty |

---

## IMPLEMENTATION PLAN

### Phase 1: Sprite System Overhaul
- [x] Extract sprites from reference sheets using Python Pillow
- [x] Create sprite atlas with proper naming
- [x] Verify all 12 sprites visually
- [ ] Update SpriteRenderer with correct sprite paths
- [ ] Fix character loading in CharacterSelectScene

### Phase 2: Menu Revamp
- [ ] Create anime-style menu background using reference art
- [ ] Add animated character sprites to menu
- [ ] Match color scheme to reference (purple, pink, gold accents)
- [ ] Add particle effects and animations

### Phase 3: UI Elements
- [ ] Extract UI buttons from `d19219d5` image
- [ ] Create matching stat bars and info panels
- [ ] Add rarity indicators matching reference style

### Phase 4: Game Levels & Assets
- [ ] Use reference art for background elements
- [ ] Create tiled backgrounds from reference images
- [ ] Add character-specific battle animations

### Phase 5: Testing & Polish
- [ ] Playwright E2E tests for all scenes
- [ ] Visual regression testing with screenshots
- [ ] Performance optimization

---

## Technical Implementation

### Sprite Extraction Command
```python
from PIL import Image

def extract_sprites():
    sheet = Image.open('reference.png')
    w, h = sheet.size
    
    for row in range(2):
        for col in range(3):
            x = col * (w // 3)
            y = row * (h // 2)
            cell = sheet.crop((x, y, x + 512, y + 512))
            cell.save(f'sprite_{row}_{col}.png')
```

### Sprite Loading
```typescript
const SPRITES = {
  twilight_petal: '/images/buddies/twilight_petal.png',
  rose_angel: '/images/buddies/rose_angel.png',
  // ... etc
};

export function loadSprites(scene: Phaser.Scene) {
  Object.entries(SPRITES).forEach(([key, path]) => {
    scene.load.image(`sprite_${key}`, path);
  });
}
```

---

## File Structure
```
public/images/
├── buddies/              # Character sprites (512x512 each)
│   ├── twilight_petal.png
│   ├── rose_angel.png
│   ├── shadow_mistress.png
│   ├── crimson_flame.png
│   ├── violet_dream.png
│   ├── dark_princess.png
│   ├── golden_hero.png
│   ├── petal_fairy.png
│   ├── night_weaver.png
│   ├── emerald_sprite.png
│   ├── storm_mage.png
│   └── frost_enchantress.png
├── ui/                   # UI elements (to extract)
│   ├── buttons/
│   ├── panels/
│   └── icons/
├── backgrounds/          # Level backgrounds
│   ├── forest.png
│   ├── castle.png
│   └── etc.
└── sheets/              # Original reference sheets
    ├── sheet1.png
    ├── sheet2.png
    └── character_select.png
```

---

## Verification Checklist
- [ ] All 12 sprites visible in character select
- [ ] Menu background matches anime style
- [ ] Rarity badges display correctly
- [ ] Stats panels render properly
- [ ] Animations are smooth
- [ ] Playwright tests pass
- [ ] Mobile responsive
- [ ] Fullscreen works

---

## Deploy Command
```bash
npm run build && npx wrangler pages deploy dist --project-name buy-a-buddy
```