---
applyTo: '**/*.ts, **/*.tsx'
---
# TypeScript & React Coding Standards

## TypeScript Patterns
- Define domain types in `src/frontend/src/types/` (e.g., `OHLCV`, `Quote`, `ChartState`)
- Use `interface` for data structures, `type` for unions/aliases
- Prefer explicit return types on exported functions
- Use `type` imports: `import type { OHLCV } from '../types'`

## React Component Patterns
- Functional components only, no class components
- Props interface defined inline above component: `interface ErrorStateProps { ... }`
- Use `ReactNode` for children props, not `React.FC`
- Export named components: `export function Chart() { ... }`

## State Management
- Global state via Context + `useReducer` (see `ChartContext.tsx`)
- Context pattern: `createContext` → Provider → `useContext` hook
- Convenience methods alongside dispatch: `setSymbol()`, `setTimeRange()`

## Data Fetching
- Abstract via custom hooks: `useStockData`, `useQuote`
- Check `useDataSource()` to route mock vs API
- API adapters in `src/frontend/src/api/` transform responses to domain types

## Indicator Calculations
- Pure functions in `components/Indicators/calculations/`
- Input: `IndicatorInput` (OHLCV[]), Output: `IndicatorOutput` ({time, value}[])
- Export default params: `export const DEFAULT_RSI_PARAMS = { period: 14 }`

## Component Documentation
- JSDoc header with task references: `@example` for complex functions
- Document formula/algorithm in calculations (see `rsi.ts`)

## Styling
- TailwindCSS exclusively, no CSS files
- Dark mode: use `dark:` prefix consistently
- Responsive: `sm:`, `lg:` breakpoints for layout adjustments
