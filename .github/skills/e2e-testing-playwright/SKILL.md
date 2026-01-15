---
name: e2e-testing-playwright
description: Guide for E2E testing using Playwright. Use this when asked to create e2e playwright tests.
---

# Web Application Testing with Playwright

This skill helps you create and run browser-based tests for web applications using Playwright.

## When to use this skill

Use this skill when you need to:
- Create new Playwright tests for FinanceViz features
- Debug failing browser tests
- Set up test infrastructure for a new feature

## Playwright Setup

**Location:** `src/frontend/e2e/`
**Config:** `src/frontend/e2e/playwright.config.ts`
**Browser:** Chromium only (expand later if needed)

## Commands

```bash
cd src/frontend && npm run dev     # Start dev server on port 5173
cd src/frontend && npm run test:e2e          # Run tests headless
cd src/frontend && npm run test:e2e:ui       # Open Playwright UI mode
cd src/frontend && npm run test:e2e:headed   # Run with visible browser
```

The dev server auto-starts on port 5173 when running tests.

## Test File Structure

Keep it flat - add more `*.spec.ts` files as needed:
```
src/frontend/e2e/
├── playwright.config.ts
├── app.spec.ts
├── toolbar.spec.ts
└── indicators.spec.ts
```

## Key Patterns

### Handle Responsive Duplicates
Components appear multiple times for different breakpoints. Use `.first()`:
```typescript
// ✅ Correct - handles duplicate elements
await expect(page.getByTestId('symbol-search').first()).toBeVisible();

// ❌ Wrong - fails with "strict mode violation"
await expect(page.getByTestId('symbol-search')).toBeVisible();
```

### Available Test IDs
- `symbol-search`, `chart-type-select`, `time-range-buttons`, `interval-select`
- `theme-toggle`, `data-source-toggle`, `indicators-button`
- `indicator-search-input`, `indicator-categories`, `active-indicators-list`

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('element').first()).toBeVisible();
    await page.getByTestId('element').first().click();
  });
});
```

## Best practices

- Use `data-testid` attributes for dynamic content (see list above).
- Keep tests independent and atomic.
- Use Page Object Model for complex pages if needed, but prefer simple functional tests for now.
- Take screenshots on failure (configured in playwright.config.ts).
- Verify both data sources (Mock + Alpha Vantage).
