# 🧪 Testing Guide

> Last Updated: 2026-04-25

---

## 📋 Overview

Buy a Buddy uses a comprehensive testing strategy with unit tests, integration tests, and E2E tests.

### Test Stack
| Type | Tool | Purpose |
|------|------|---------|
| Unit Tests | Vitest | Test game systems in isolation |
| Integration | Vitest | Test API endpoints and state |
| E2E | Playwright | Test full game flow in browser |

---

## 🚀 Running Tests

### All Tests
```bash
npm run test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📊 Test Coverage

### Game Systems
| System | Tests | Status |
|--------|-------|--------|
| IdleSystem | 10 | ✅ |
| SpawnerSystem | 6 | ✅ |
| BattleSystem | 8 | ✅ |
| QuestSystem | 6 | ✅ |
| BreedingSystem | 4 | ✅ |
| ValidationSystem | 4 | ✅ |
| SaveSystem | 6 | ✅ |
| DebugSystem | 3 | ✅ |
| **Total** | **30** | **✅** |

---

## 📁 Test Structure

```
tests/
├── unit/
│   └── gameSystems.test.ts    # Game logic tests
├── integration/
│   └── api.test.ts            # API integration tests
├── e2e/
│   └── game.test.ts           # Playwright E2E tests
└── fixtures/                  # Test data files
```

---

## 🔧 Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { IdleSystem } from '../../src/systems/GameSystems';

describe('IdleSystem', () => {
  it('should return 0 with no buddies', () => {
    const system = new IdleSystem(createMockState());
    expect(system.calculateIncomePerSecond()).toBe(0);
  });

  it('should calculate income for working buddy', () => {
    const state = createMockState({
      buddies: [{ id: 'b1', baseIncome: 1, level: 1, isWorking: true }],
      plots: [{ id: 'p1', multiplier: 1, buddyId: 'b1' }]
    });
    const system = new IdleSystem(state);
    expect(system.calculateIncomePerSecond()).toBe(1);
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should spawn a buddy', async ({ page }) => {
  await page.goto('/');
  
  // Click spawn button
  await page.locator('button:has-text("BUY")').click();
  
  // Verify buddy appears
  await page.waitForTimeout(500);
});
```

---

## 🎯 Test Targets

| Metric | Target | Current |
|--------|--------|---------|
| Statements | 70% | 100% |
| Branches | 70% | 100% |
| Functions | 70% | 100% |
| Lines | 70% | 100% |

---

## 🔍 Test Categories

### Functional Tests
- [x] Idle income calculation
- [x] Buddy spawning with rarities
- [x] Plot assignment
- [x] Battle damage calculation
- [x] Quest progression
- [x] Save/load system

### Edge Case Tests
- [x] Zero income calculation
- [x] Offline earnings cap (24h)
- [x] Invalid state validation
- [x] Diagonal movement normalization

### Integration Tests
- [ ] API endpoint responses
- [ ] State synchronization
- [ ] Cross-system interactions

---

## 🌍 E2E Browser Testing

### Playwright Configuration
| Browser | Platform | Status |
|---------|----------|--------|
| Chromium | Desktop | ✅ |
| Firefox | Desktop | ✅ |
| WebKit | Desktop | ✅ |
| Chrome | Mobile | ✅ |
| Safari | Mobile | ✅ |

### E2E Test Coverage
- [ ] Game loads successfully
- [ ] Title screen displays
- [ ] Buddy spawning works
- [ ] Plot assignment works
- [ ] Passive income works
- [ ] Shop panel opens
- [ ] Navigation works
- [ ] API integration works
- [ ] Performance maintains 60 FPS

---

## 🐛 Debugging Tests

### Verbose Output
```bash
npm run test -- --reporter=verbose
```

### Debug Specific Test
```bash
npm run test -- --grep "IdleSystem"
```

### Update Snapshots
```bash
npm run test -- --update
```

---

## ✅ Pre-commit Testing

Tests run automatically on:
- Pre-commit hook (if configured)
- Push to remote
- Pull request creation

To skip tests (not recommended):
```bash
git commit --no-verify
```

---

## 📚 Related Documentation

- [docs/API.md](./API.md) - API documentation
- [docs/PLANNING.md](./PLANNING.md) - Project planning
- [Vitest Docs](https://vitest.dev/guide)
- [Playwright Docs](https://playwright.dev/docs)