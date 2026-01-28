# Copilot Instructions for FinanceViz

## Project Context
FinanceViz is a React-based financial charting application simulating Yahoo Finance. It uses Lightweight Charts for visualization and toggleable data sources (Mock vs Alpha Vantage).

## Architecture & Data Flow
- **Root:** `src/frontend` (Vite + React + TypeScript)
- **State Management:** React Context (`src/frontend/src/context/`). 
  - `ChartContext` manages symbol, time range, and chart type.
  - `DataSourceContext` toggles between Mock and API data.
  - `IndicatorContext` manages active technical indicators.
  - `ApiKeyContext` manages Alpha Vantage API key (localStorage persistence, env fallback, validation).
- **Data Layer:** 
  - Abstraction via `useStockData` hook (`src/frontend/src/hooks/useStockData.ts`).
  - API adapters in `src/frontend/src/api/`. `alphavantage.ts` handles the real API, `mockData.ts` handles simulation.
  - Data types defined in `src/frontend/src/types/stock.ts`.
  - API key resolution: localStorage (`alphavantage_api_key`) → env (`VITE_ALPHA_VANTAGE_API_KEY`) → prompt user.
- **Charting:** 
  - `Chart.tsx` wraps `lightweight-charts` instance.
  - `ChartCanvas.tsx` handles the imperative chart library logic (refs, updates).
  - Indicators are calculated in `components/Indicators/calculations/` and overlaid on the chart.

- **Responsiveness:** `App.tsx` handles layout calculations for the chart container height.
- **Error Handling:** `ErrorBoundary` generic wrapper, plus specific error states in `Chart.tsx`.

## Development Patterns
- **Feature-based structure:** Components often grouped by feature (e.g., `components/Chart`, `components/Indicators`).

## Key Conventions
- **Types:** Centralized in `src/frontend/src/types/`. Avoid inline types for domain objects.
- **Data Source:** Always check `DataSourceContext` when fetching data. Respect the toggle.
- **Charting:** Do not manipulate the DOM directly outside of `Ref` initialization. Use `useEffect` to sync props to chart instance.
- **Styling:** Tailwind CSS for all styling. Dark mode support via `dark:` prefix.

## Architecture Conventions

### Data Flow
1. **Context** provides global state (ChartContext, DataSourceContext, IndicatorContext)
2. **Hooks** (useStockData, useQuote) abstract data fetching
3. **API adapters** (alphavantage.ts, mockData.ts) handle data sources
4. **Components** consume hooks and render UI

### File Organization
- Components: `src/frontend/src/components/{Feature}/{Component}.tsx`
- Settings: `src/frontend/src/components/Settings/` (API key modal, configuration UI)
- Hooks: `src/frontend/src/hooks/use{Name}.ts`
- Context: `src/frontend/src/context/{Name}Context.tsx`
- Types: `src/frontend/src/types/{domain}.ts`
- Utils: `src/frontend/src/utils/{name}.ts`
- E2E Tests: `src/frontend/e2e/*.spec.ts` (config: `src/frontend/e2e/playwright.config.ts`)

### Styling
- Use TailwindCSS for all styling
- Support dark mode with `dark:` prefix
- Follow existing spacing and color patterns

## Build & Test Workflow

### Build and Validate
```bash
cd src/frontend && npm run build
```

### UI Verification (if applicable)
```bash
cd src/frontend && npm run dev
```

### Run E2E Tests
```bash
cd src/frontend && npm run test:e2e
```