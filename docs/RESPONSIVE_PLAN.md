# 📱 Responsive Design & Device Support Plan

> Last Updated: 2026-04-25

---

## 🎯 Current Issues

1. **Buttons not clickable** - Interactive elements need proper hit areas
2. **No device detection** - Same UI for all devices
3. **No sound effects** - Game is silent
4. **Limited mobile support** - Joystick exists but basic

---

## 📋 Device Detection Strategy

### Device Categories
| Device | Screen Size | Input Type | Layout |
|--------|-------------|------------|--------|
| Mobile | < 768px | Touch | Bottom-heavy UI |
| Tablet | 768px - 1024px | Touch + Stylus | Balanced UI |
| Desktop | > 1024px | Keyboard + Mouse | Full UI |
| TV | Any (output) | Remote/Gamepad | Large UI, minimal interaction |

### Detection Method
```typescript
// Device detection utility
export const DeviceDetector = {
  isMobile: () => window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent),
  isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
  isDesktop: () => window.innerWidth >= 1024 && !this.isMobile(),
  isTV: () => window.matchMedia('(display-mode: fullscreen)').matches && !this.isMobile(),
  isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  isGamepad: () => 'getGamepads' in navigator,
}
```

---

## 🎮 Input Mapping

### Mobile
- Virtual joystick (left thumb)
- Tap to interact
- Swipe for menus
- Two-finger for zoom (future)

### Tablet
- Touch controls
- Larger touch targets
- Keyboard support (external)

### Desktop
- Full keyboard support (WASD + arrows)
- Mouse click
- Scroll wheel zoom

### TV
- D-pad navigation
- A/B buttons for confirm/cancel
- Color buttons for shortcuts

---

## 📐 Responsive Layouts

### Mobile (< 768px)
```
┌─────────────────────────┐
│      [Stats Bar]        │
├─────────────────────────┤
│                         │
│    [Game Canvas]        │
│                         │
├─────────────────────────┤
│ [Joystick]      [Actions]│
│                   [Buy]  │
└─────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌────────────────────────────────┐
│ [Stats Bar]                    │
├────────────────────────────────┤
│                                │
│        [Game Canvas]           │
│                                │
├────────────────────────────────┤
│ [Joystick]    [Actions]  [Buy] │
└────────────────────────────────┘
```

### Desktop (> 1024px)
```
┌──────────────────────────────────────┐
│ [Menu] [Stats Bar]           [Help] │
├──────────────────────────────────────┤
│                                      │
│           [Game Canvas]              │
│                                      │
├──────────────────────────────────────┤
│        [Control Hints]               │
└──────────────────────────────────────┘
```

### TV (> 1920px)
```
┌────────────────────────────────────────┐
│         [BUY A BUDDY]                  │
│                                        │
│    ┌─────────────────────────────┐     │
│    │                             │     │
│    │        [Game Canvas]        │     │
│    │                             │     │
│    └─────────────────────────────┘     │
│                                        │
│    [A] Select   [B] Back   [D-pad] Move│
└────────────────────────────────────────┘
```

---

## 🎨 UI Scaling

### Scale Factors
| Device | Scale Factor | Min Touch Target |
|--------|--------------|------------------|
| Mobile | 1.0x | 44px |
| Tablet | 1.2x | 40px |
| Desktop | 1.0x | 20px |
| TV | 1.5x | 48px |

### Font Sizes
| Element | Mobile | Tablet | Desktop | TV |
|---------|--------|--------|---------|-----|
| Title | 32px | 42px | 48px | 64px |
| Button | 18px | 20px | 20px | 28px |
| Body | 14px | 16px | 16px | 24px |
| Caption | 12px | 12px | 12px | 16px |

---

## 🔊 Audio System

### Sound Categories
1. **UI Sounds** - Button clicks, menu navigation
2. **Game Sounds** - Buddy spawn, coin earn, battle hits
3. **Ambient** - Background music, environmental

### Implementation
```typescript
// Audio manager
export class AudioManager {
  private sounds: Map<string, Howl>;
  private music: Howl;
  private muted: boolean = false;
  
  playSFX(name: string, volume: number = 0.5): void;
  playMusic(name: string, volume: number = 0.3): void;
  setMute(muted: boolean): void;
  isMuted(): boolean;
}
```

### Sound Assets Needed
| Sound | File | Duration |
|-------|------|----------|
| Button Click | click.mp3 | 0.1s |
| Buddy Spawn | spawn.mp3 | 0.5s |
| Coin Earn | coin.mp3 | 0.3s |
| Battle Hit | hit.mp3 | 0.2s |
| Victory | victory.mp3 | 2s |
| Menu BGM | menu.mp3 | loop |
| Battle BGM | battle.mp3 | loop |
| Farm BGM | farm.mp3 | loop |

---

## 📋 Implementation Tasks

### Phase 1: Fix Current Issues
- [x] Fix button click detection in MenuScene
- [ ] Add device detection utility
- [ ] Create responsive UI overlay
- [ ] Add basic sound effects (Web Audio API fallback)

### Phase 2: Mobile Optimization
- [ ] Virtual joystick with better visual feedback
- [ ] Bottom-anchored action buttons
- [ ] Pull-to-refresh for menus
- [ ] Haptic feedback on interactions

### Phase 3: Desktop Enhancement
- [ ] Keyboard shortcuts overlay
- [ ] Mouse hover states
- [ ] Window resize handling
- [ ] Fullscreen toggle

### Phase 4: TV Support
- [ ] Gamepad API integration
- [ ] Large UI elements
- [ ] D-pad navigation
- [ ] Focus indicators

### Phase 5: Audio Polish
- [ ] Background music
- [ ] Sound effects library
- [ ] Volume controls
- [ ] Mute toggle in settings

---

## 🧪 Testing Checklist

### Device Testing Matrix
| Device | Browser | Touch | Click | Sound |
|--------|---------|-------|-------|-------|
| iPhone | Safari | ✅ | ✅ | ✅ |
| Android | Chrome | ✅ | ✅ | ✅ |
| iPad | Safari | ✅ | ✅ | ✅ |
| Windows | Chrome | ❌ | ✅ | ✅ |
| macOS | Safari | ❌ | ✅ | ✅ |
| TV (Chromecast) | Chrome | ❌ | ✅ | ✅ |

### Test Cases
1. [ ] Menu buttons clickable on mobile
2. [ ] Joystick responds to touch
3. [ ] Sound plays on interaction
4. [ ] UI scales correctly on resize
5. [ ] Gamepad works on TV

---

## 📊 Performance Targets

| Device | Target FPS | Max Memory |
|--------|------------|------------|
| Mobile | 30 FPS | 100MB |
| Tablet | 45 FPS | 150MB |
| Desktop | 60 FPS | 500MB |
| TV | 30 FPS | 200MB |

---

## 🔧 Code Organization

```
src/
├── utils/
│   ├── deviceDetector.ts    # Device detection
│   └── responsive.ts        # Layout utilities
├── audio/
│   ├── AudioManager.ts     # Sound management
│   └── sounds/             # Sound files
├── ui/
│   ├── mobile/             # Mobile-specific UI
│   ├── desktop/            # Desktop-specific UI
│   └── tv/                 # TV-specific UI
└── scenes/
    ├── MenuScene.ts        # Updated with responsive
    └── GameScene.ts        # Updated with responsive
```

---

## 🎯 Success Metrics

1. **100% button clickability** across devices
2. **60 FPS** on desktop, **30 FPS** minimum on mobile
3. **Sound plays** on user interaction
4. **UI readable** without zoom on all devices
5. **Touch targets** minimum 44px on mobile

---

## 📅 Priority Order

1. **Fix buttons** - Game must be playable
2. **Add device detection** - Foundation for responsive
3. **Implement sound** - Audio feedback
4. **Scale UI** - Responsive layouts
5. **Polish** - TV support, gamepad, etc.