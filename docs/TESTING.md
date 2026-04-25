# Testing Guide

## Overview

The game includes a comprehensive test suite using Vitest with jsdom environment for DOM testing.

## Running Tests

### All Tests
```bash
npm run test
```

### Watch Mode (TDD)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
tests/
├── api/
│   └── api.test.ts          # API response format tests
├── game/
│   └── types.test.ts        # Type system and game state tests
├── systems/
│   ├── economy.test.ts      # Income calculations
│   ├── saveSystem.test.ts   # Persistence tests
│   └── spawner.test.ts      # Buddy generation tests
└── setup.ts                 # Test utilities and mocks
```

## Test Categories

### Type Tests (`tests/game/types.test.ts`)
- Game state initialization
- Rarity configuration validation
- Buddy name pools
- Initial plot and upgrade setup

### Spawner Tests (`tests/systems/spawner.test.ts`)
- Rarity rolling mechanics
- Buddy creation with proper attributes
- Cost calculations (exponential scaling)
- ID generation uniqueness

### Economy Tests (`tests/systems/economy.test.ts`)
- Income per second calculation
- Offline earnings (50% efficiency)
- Currency formatting (K, M, B suffixes)
- Plot multiplier bonuses
- Spawn luck bonuses

### Save System Tests (`tests/systems/saveSystem.test.ts`)
- localStorage persistence
- Save/load round-trip
- Corruption handling
- Export/import (base64)
- Auto-save manager

### API Tests (`tests/api/api.test.ts`)
- Response format consistency
- Error code definitions
- Health endpoint structure

## Writing Tests

### Example: Testing Income Calculation
```typescript
it('should calculate income for assigned buddy', () => {
  const buddy = createMockBuddy({ 
    baseIncome: 1, 
    level: 1, 
    assignedPlotId: 'plot-1' 
  });
  const plot = createMockPlot({ id: 'plot-1', multiplier: 1 });
  const state = createMockGameState({ buddies: [buddy], plots: [plot] });
  
  // income = baseIncome * level * multiplier = 1 * 1 * 1 = 1
  expect(calculateIncomePerSecond(state)).toBe(1);
});
```

### Example: Testing Rarity Rolling
```typescript
it('should return rare for rolls 60-85%', () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.6);
  expect(rollRarity()).toBe('rare');
  
  vi.spyOn(Math, 'random').mockReturnValue(0.84);
  expect(rollRarity()).toBe('rare');
});
```

## Test Utilities

Located in `tests/setup.ts`:

### Mock Data Factories
- `createMockBuddy(overrides)` - Creates test buddy
- `createMockPlot(overrides)` - Creates test plot
- `createMockGameState(overrides)` - Creates full game state

### Mock Helpers
- `setupLocalStorageMock()` - Mock localStorage
- `cleanup()` - Reset mocks between tests

## Coverage Targets

| Metric | Target |
|--------|--------|
| Statements | 80% |
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |

## CI Integration

Tests run on every commit via pre-commit hooks. Ensure all tests pass before pushing.

## Debugging Tests

### Run specific test file:
```bash
npx vitest run tests/systems/spawner.test.ts
```

### Run specific test:
```bash
npx vitest run -t "should return rare for rolls"
```

### Watch specific file:
```bash
npx vitest run tests/systems/spawner.test.ts --watch
```