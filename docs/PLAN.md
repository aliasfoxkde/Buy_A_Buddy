# Plan: Buy a Buddy Fixes & Improvements

## Phase 1: Immediate Fixes
1. Create `eslint.config.js` (ESLint v9 flat config)
2. Fix failing tests - update expected gold from 100 to 200
3. Verify all tests pass

## Phase 2: Code Quality
4. Run full lint check and fix errors
5. Run TypeScript type check and fix errors
6. Configure Vite code splitting for large chunks

## Phase 3: Testing & Deployment
7. Start dev server and verify game runs
8. Build E2E test suite with Playwright
9. Deploy to Cloudflare Pages

## Phase 4: Validation
10. Verify game works in browser
11. Run full test suite (unit + e2e)
12. Verify deployment
