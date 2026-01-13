# FinanceViz - Implementation Task List

**Version:** 1.0  
**Created:** January 13, 2026  
**Based on:** SPECIFICATIONS.md v1.0  
**Status:** Active  

---

## Overview

This document contains the implementation task list for FinanceViz, organized by priority level. Each task includes acceptance criteria and validation requirements.

### Implementation Guidelines

- **UI First Approach:** Build UI components with mock data before API integration
- **Data Source Toggle:** Implement a dropdown to switch between Mock Data and Alpha Vantage API
- **Validation:** After each task implementation, validate UI changes using Playwright MCP server
- **Backend API:** Alpha Vantage (replacing Finnhub from original spec)

### Task Status Legend

- [ ] Not Started
- [x] Completed
- 🔄 In Progress
- ⏸️ Blocked

---

## Priority P0 - Must Have (MVP)

### Phase 1: Foundation & Project Setup

#### TASK-001: Project Initialization
- **Description:** Set up Vite + React 18 + TypeScript project with TailwindCSS
- **Files to Create/Modify:**
  - `package.json`
  - `vite.config.ts`
  - `tsconfig.json`
  - `tailwind.config.js`
  - `postcss.config.js`
  - `src/index.css`
  - `src/main.tsx`
  - `src/App.tsx`
- **Acceptance Criteria:**
  - [x] Project builds successfully with `npm run dev`
  - [x] TailwindCSS classes render correctly
  - [x] TypeScript compilation without errors
- **Playwright Validation:**
  - [x] Application loads at localhost
  - [x] No console errors on initial load
- **Status:** [x] Completed

---

#### TASK-002: Mock Data Infrastructure
- **Description:** Create mock data service with realistic OHLCV stock data
- **Files to Create:**
  - `src/api/mockData.ts` - Mock OHLCV generator
  - `src/api/mockQuotes.ts` - Mock quote data
  - `src/api/mockSymbols.ts` - Mock symbol search results
  - `src/types/stock.ts` - Stock data types
  - `src/types/chart.ts` - Chart-related types
- **Acceptance Criteria:**
  - [x] Mock data generates realistic candlestick patterns
  - [x] Data supports all time ranges (1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX)
  - [x] Data includes volume information
  - [x] Multiple symbols available (AAPL, MSFT, GOOGL, AMZN, TSLA)
- **Status:** [x] Completed

---

#### TASK-003: Data Source Toggle Component
- **Description:** Create UI dropdown to switch between Mock Data and Alpha Vantage API
- **Files to Create:**
  - `src/components/common/DataSourceToggle.tsx`
  - `src/context/DataSourceContext.tsx`
- **Acceptance Criteria:**
  - [x] Dropdown displays "Mock Data" and "Alpha Vantage API" options
  - [x] Selection persists across page refreshes (localStorage)
  - [x] Context provides data source state to all components
- **Playwright Validation:**
  - [x] Dropdown renders in toolbar
  - [x] Selection changes are reflected in UI
  - [x] Default is "Mock Data"
- **Status:** [x] Completed

---

#### TASK-004: Core Type Definitions
- **Description:** Define all TypeScript interfaces and types
- **Files to Create:**
  - `src/types/stock.ts` - OHLCV, Quote interfaces
  - `src/types/chart.ts` - ChartType, TimeRange, Interval types
  - `src/types/indicators.ts` - Indicator types and configurations
  - `src/types/index.ts` - Re-exports
- **Acceptance Criteria:**
  - [x] All chart types defined: candlestick, line, bar, area, hollowCandle, heikinAshi, baseline
  - [x] Time ranges defined: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX
  - [x] Intervals defined: 1min, 5min, 15min, 30min, 60min, Daily, Weekly, Monthly
  - [x] OHLCV interface with time, open, high, low, close, volume
- **Status:** [x] Completed

---

#### TASK-005: Theme Context & Provider
- **Description:** Implement light/dark theme context with TailwindCSS
- **Files to Create:**
  - `src/context/ThemeContext.tsx`
- **Files to Modify:**
  - `src/App.tsx` - Wrap with ThemeProvider
  - `tailwind.config.js` - Add dark mode configuration
- **Acceptance Criteria:**
  - [x] Theme toggles between light and dark mode
  - [x] Theme persists in localStorage
  - [x] CSS variables for bullish (#22c55e) and bearish (#ef4444) colors
- **Playwright Validation:**
  - [x] Theme toggle button works
  - [x] Background colors change appropriately
- **Status:** [x] Completed

---

#### TASK-006: Chart Context & State Management
- **Description:** Implement chart state context with useReducer
- **Files to Create:**
  - `src/context/ChartContext.tsx`
  - `src/context/index.ts`
- **State Shape:**
  ```typescript
  {
    symbol: string;
    companyName: string;
    timeRange: TimeRange;
    interval: Interval;
    chartType: ChartType;
    isLoading: boolean;
    error: string | null;
  }
  ```
- **Acceptance Criteria:**
  - [x] Context provides symbol, timeRange, interval, chartType state
  - [x] Actions: SET_SYMBOL, SET_TIME_RANGE, SET_INTERVAL, SET_CHART_TYPE
  - [x] Default symbol: 'AAPL'
  - [x] Default chart type: 'candlestick'
- **Status:** [x] Completed

---

### Phase 2: Core UI Components

#### TASK-007: Common UI Components
- **Description:** Create reusable UI components
- **Files to Create:**
  - `src/components/common/Button.tsx`
  - `src/components/common/Dropdown.tsx`
  - `src/components/common/Modal.tsx`
  - `src/components/common/Spinner.tsx`
  - `src/components/common/ErrorBoundary.tsx`
  - `src/components/common/index.ts`
- **Acceptance Criteria:**
  - [x] Button supports variants: primary, secondary, ghost
  - [x] Dropdown supports searchable option
  - [x] Modal has overlay and close button
  - [x] Spinner has configurable size
  - [x] ErrorBoundary catches and displays errors gracefully
- **Playwright Validation:**
  - [x] All components render correctly
  - [x] Interactive states (hover, focus, active) work
- **Status:** [x] Completed

---

#### TASK-008: Main Toolbar Container
- **Description:** Create the main toolbar layout
- **Files to Create:**
  - `src/components/Toolbar/Toolbar.tsx`
  - `src/components/Toolbar/index.ts`
- **Layout:**
  ```
  [Symbol Search] | [Chart Type ▼] | [1D 5D 1M 6M YTD 1Y 5Y MAX] | [Interval ▼] | [Data Source ▼]
  [Indicators] [Fullscreen]
  ```
- **Acceptance Criteria:**
  - [x] Responsive layout with flex/grid
  - [x] Placeholder slots for all toolbar items
  - [x] Proper spacing and alignment
- **Playwright Validation:**
  - [x] Toolbar renders at top of page
  - [x] All placeholder elements visible
- **Status:** [x] Completed

---

#### TASK-009: Symbol Search Component
- **Description:** Autocomplete search for stock symbols
- **Files to Create:**
  - `src/components/Toolbar/SymbolSearch.tsx`
  - `src/hooks/useDebounce.ts`
- **Acceptance Criteria:**
  - [x] Search input with magnifying glass icon
  - [x] Debounced search (300ms)
  - [x] Dropdown shows matching symbols from mock data
  - [x] Displays symbol and company name
  - [x] Selection updates ChartContext
  - [x] Keyboard navigation (arrow keys, enter)
- **Playwright Validation:**
  - [x] Search input accepts text
  - [x] Dropdown appears with results
  - [x] Selection updates displayed symbol
- **Status:** [x] Completed

---

#### TASK-010: Chart Type Selector
- **Description:** Dropdown to select chart type
- **Files to Create:**
  - `src/components/Toolbar/ChartTypeSelect.tsx`
- **Options:**
  - Candlestick (default)
  - Line
  - Bar (OHLC)
  - Area
  - Hollow Candlestick
  - Heikin-Ashi
  - Baseline
- **Acceptance Criteria:**
  - [x] Dropdown with all 7 chart types
  - [x] Icons for each chart type
  - [x] Selection updates ChartContext
  - [x] Current selection highlighted
- **Playwright Validation:**
  - [x] Dropdown opens on click
  - [x] All options visible
  - [x] Selection changes chart type state
- **Status:** [x] Completed

---

#### TASK-011: Time Range Buttons
- **Description:** Button group for time range selection
- **Files to Create:**
  - `src/components/Toolbar/TimeRangeButtons.tsx`
- **Buttons:** 1D | 5D | 1M | 6M | YTD | 1Y | 5Y | MAX
- **Acceptance Criteria:**
  - [x] All 8 time range buttons displayed
  - [x] Active button visually highlighted
  - [x] Selection updates ChartContext
  - [x] Updates interval to default for selected range
- **Playwright Validation:**
  - [x] All buttons visible
  - [x] Click changes active state
  - [x] Active button has distinct styling
- **Status:** [x] Completed

---

#### TASK-012: Interval Selector
- **Description:** Dropdown for time interval selection
- **Files to Create:**
  - `src/components/Toolbar/IntervalSelect.tsx`
  - `src/utils/intervals.ts` - Interval/range mappings
- **Intervals:**
  - Intraday: 1min, 5min, 15min, 30min, 60min
  - Daily+: Daily, Weekly, Monthly
- **Acceptance Criteria:**
  - [x] Dropdown shows valid intervals based on time range
  - [x] Intraday intervals only for 1D-1M ranges
  - [x] Selection updates ChartContext
  - [x] Disabled intervals grayed out
- **Playwright Validation:**
  - [x] Dropdown shows appropriate options
  - [x] Invalid options not selectable
- **Status:** [x] Completed

---

#### TASK-013: Fullscreen Button
- **Description:** Toggle fullscreen mode
- **Files to Create:**
  - `src/components/Toolbar/FullscreenButton.tsx`
- **Acceptance Criteria:**
  - [x] Button with fullscreen icon
  - [x] Toggles browser fullscreen API
  - [x] Icon changes based on fullscreen state
  - [x] Keyboard shortcut: F
- **Playwright Validation:**
  - [x] Button renders
  - [x] Fullscreen toggles on click
- **Status:** [x] Completed

---

#### TASK-014: Quote Header Component
- **Description:** Display current stock quote information
- **Files to Create:**
  - `src/components/QuoteHeader/QuoteHeader.tsx`
  - `src/components/QuoteHeader/index.ts`
  - `src/hooks/useQuote.ts`
- **Display Elements:**
  - Symbol (large)
  - Company Name
  - Current Price (prominent)
  - Change (absolute)
  - Change % (percentage)
  - Color coding (green/red)
- **Acceptance Criteria:**
  - [x] Displays symbol and company name
  - [x] Price formatted with 2 decimals
  - [x] Change shows + or - prefix
  - [x] Green for positive, red for negative
  - [x] Updates when symbol changes
- **Playwright Validation:**
  - [x] Header displays at top
  - [x] Price and change visible
  - [x] Colors reflect positive/negative
- **Status:** [x] Completed

---

### Phase 3: Chart Implementation

#### TASK-015: Install Lightweight Charts Library
- **Description:** Add TradingView Lightweight Charts dependency
- **Commands:**
  ```bash
  npm install lightweight-charts
  ```
- **Acceptance Criteria:**
  - [x] Package installed and in package.json
  - [x] No version conflicts
- **Status:** [x] Completed

---

#### TASK-016: Chart Container Component
- **Description:** Main chart wrapper component
- **Files to Create:**
  - `src/components/Chart/Chart.tsx`
  - `src/components/Chart/index.ts`
  - `src/hooks/useStockData.ts`
  - `src/hooks/useChartResize.ts`
- **Acceptance Criteria:**
  - [x] Container fills available space
  - [x] Responsive to window resize
  - [x] Shows loading spinner while data loads
  - [x] Shows error state on failure
- **Playwright Validation:**
  - [x] Chart container visible
  - [x] Resizes with window
- **Status:** [x] Completed

---

#### TASK-017: Chart Canvas - Candlestick
- **Description:** Implement candlestick chart with Lightweight Charts
- **Files to Create:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Acceptance Criteria:**
  - [x] Candlestick series renders with mock data
  - [x] Green candles for bullish (close > open)
  - [x] Red candles for bearish (close < open)
  - [x] Time axis shows appropriate labels
  - [x] Price axis on right side
- **Playwright Validation:**
  - [x] Candlesticks visible on chart
  - [x] Colors correct (green/red)
  - [x] Axes display values
- **Status:** [x] Completed

---

#### TASK-018: Chart Canvas - Line Type
- **Description:** Implement line chart type
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Acceptance Criteria:**
  - [x] Line connects closing prices
  - [x] Smooth line rendering
  - [x] Switches from candlestick when selected
- **Playwright Validation:**
  - [x] Line chart renders when selected
  - [x] Smooth transitions between types
- **Status:** [x] Completed

---

#### TASK-019: Chart Canvas - Bar (OHLC) Type
- **Description:** Implement OHLC bar chart type
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Acceptance Criteria:**
  - [x] Traditional OHLC bar representation
  - [x] High-low vertical line
  - [x] Open tick on left, close tick on right
  - [x] Colored by direction
- **Playwright Validation:**
  - [x] Bar chart renders when selected
- **Status:** [x] Completed

---

#### TASK-020: Chart Canvas - Area Type
- **Description:** Implement area chart type
- **Files to Create:**
  - `src/components/Chart/ChartCanvas.tsx` (modify)
- **Acceptance Criteria:**
  - [x] Line chart with gradient fill below
  - [x] Gradient from line color to transparent
  - [x] Smooth area rendering
- **Playwright Validation:**
  - [x] Area chart renders when selected
  - [x] Gradient fill visible
- **Status:** [x] Completed

---

#### TASK-021: Chart Canvas - Hollow Candlestick Type
- **Description:** Implement hollow candlestick chart type
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Acceptance Criteria:**
  - [x] Hollow body when close > open
  - [x] Filled body when close < open
  - [x] Border color indicates direction
- **Playwright Validation:**
  - [x] Hollow candlesticks render when selected
- **Status:** [x] Completed

---

#### TASK-022: Chart Canvas - Heikin-Ashi Type
- **Description:** Implement Heikin-Ashi chart type
- **Files to Create:**
  - `src/utils/heikinAshi.ts` - Calculation function
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Calculation:**
  ```
  HA Close = (O + H + L + C) / 4
  HA Open = (prev HA Open + prev HA Close) / 2
  HA High = max(H, HA Open, HA Close)
  HA Low = min(L, HA Open, HA Close)
  ```
- **Acceptance Criteria:**
  - [x] Heikin-Ashi values calculated correctly
  - [x] Smoother appearance than regular candlesticks
  - [x] Trend more visible
- **Playwright Validation:**
  - [x] Heikin-Ashi chart renders when selected
- **Status:** [x] Completed

---

#### TASK-023: Chart Canvas - Baseline Type
- **Description:** Implement baseline chart type
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Acceptance Criteria:**
  - [x] Price relative to configurable baseline
  - [x] Area above baseline in green
  - [x] Area below baseline in red
  - [x] Baseline defaults to first visible price
- **Playwright Validation:**
  - [x] Baseline chart renders when selected
  - [x] Two-tone coloring visible
- **Status:** [x] Completed

---

#### TASK-024: Volume Pane
- **Description:** Create synchronized volume bar chart
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx` (integrated volume histogram)
- **Acceptance Criteria:**
  - [x] Volume bars below main chart
  - [x] Synchronized with price chart time axis
  - [x] Color matches price direction (green/red)
  - [x] Proper height ratio (20% of chart area)
- **Playwright Validation:**
  - [x] Volume bars visible below chart
  - [x] Colors sync with price direction
  - [x] Scrolling syncs with main chart
- **Status:** [x] Completed

---

#### TASK-025: Chart Legend
- **Description:** Dynamic OHLCV legend on hover
- **Files to Create:**
  - `src/components/Chart/Legend.tsx`
- **Display:**
  - O: [open] H: [high] L: [low] C: [close]
  - Volume: [formatted volume]
- **Acceptance Criteria:**
  - [x] Legend updates on crosshair move
  - [x] Values formatted appropriately (2 decimals for price)
  - [x] Volume formatted with K/M/B suffixes
  - [x] Positioned at top-left of chart
- **Playwright Validation:**
  - [x] Legend visible on chart
  - [x] Values update on hover
- **Status:** [x] Completed

---

#### TASK-026: Crosshair Implementation
- **Description:** Interactive crosshair with price/time display
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Acceptance Criteria:**
  - [x] Vertical line follows cursor
  - [x] Horizontal line follows cursor
  - [x] Time label on bottom axis
  - [x] Price label on right axis
  - [x] Crosshair visible on hover
- **Playwright Validation:**
  - [x] Crosshair appears on chart hover
  - [x] Labels show correct values
- **Status:** [x] Completed

---

#### TASK-027: Chart Zoom & Pan
- **Description:** Implement mouse/touch navigation
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Features:**
  - Mouse wheel zoom (time axis)
  - Click and drag to pan
  - Double-click to reset
  - Touch: pinch-to-zoom, swipe-to-pan
- **Acceptance Criteria:**
  - [x] Mouse wheel zooms in/out
  - [x] Drag pans chart horizontally
  - [x] Double-click resets view
  - [x] Pan respects data boundaries
  - [x] Touch gestures work on mobile
- **Playwright Validation:**
  - [x] Zoom changes visible data range
  - [x] Pan moves visible window
  - [x] Reset restores default view
- **Status:** [x] Completed

---

#### TASK-028: Loading & Error States
- **Description:** Implement chart loading and error UI
- **Files to Create:**
  - `src/components/Chart/ChartSkeleton.tsx`
  - `src/components/Chart/EmptyState.tsx`
- **Acceptance Criteria:**
  - [x] Skeleton loader while data loading
  - [x] Error message with retry button
  - [x] "No data available" empty state
- **Playwright Validation:**
  - [x] Loading state shows spinner/skeleton
  - [x] Error state shows message
- **Status:** [x] Completed

---

### Phase 4: Technical Indicators

#### TASK-029: Indicator Context & State
- **Description:** Create indicator state management
- **Files to Create:**
  - `src/context/IndicatorContext.tsx`
- **State Shape:**
  ```typescript
  {
    overlays: OverlayIndicator[];
    oscillators: OscillatorIndicator[];
  }
  ```
- **Acceptance Criteria:**
  - [x] Add/remove overlay indicators
  - [x] Add/remove oscillator indicators
  - [x] Update indicator parameters
  - [x] Toggle indicator visibility
- **Status:** [x] Completed

---

#### TASK-030: Indicator Calculation Types
- **Description:** Define indicator calculation types
- **Files to Create:**
  - `src/components/Indicators/calculations/types.ts`
- **Types:**
  - IndicatorInput (OHLCV[])
  - IndicatorOutput (time, value pairs)
  - IndicatorParams (period, etc.)
- **Acceptance Criteria:**
  - [x] All indicator types defined
  - [x] Parameter interfaces for each indicator
- **Status:** [x] Completed

---

#### TASK-031: SMA Indicator Calculation
- **Description:** Simple Moving Average calculation
- **Files to Create:**
  - `src/components/Indicators/calculations/sma.ts`
- **Formula:** SMA = sum(close, period) / period
- **Parameters:** Period (default: 20)
- **Acceptance Criteria:**
  - [x] Correct SMA calculation
  - [x] Returns array of {time, value}
  - [x] Handles edge cases (insufficient data)
- **Status:** [x] Completed

---

#### TASK-032: EMA Indicator Calculation
- **Description:** Exponential Moving Average calculation
- **Files to Create:**
  - `src/components/Indicators/calculations/ema.ts`
- **Formula:** EMA = (close * multiplier) + (prevEMA * (1 - multiplier))
- **Multiplier:** 2 / (period + 1)
- **Parameters:** Period (default: 20)
- **Acceptance Criteria:**
  - [x] Correct EMA calculation
  - [x] Initial EMA uses SMA
  - [x] Handles edge cases
- **Status:** [x] Completed

---

#### TASK-033: WMA Indicator Calculation
- **Description:** Weighted Moving Average calculation
- **Files to Create:**
  - `src/components/Indicators/calculations/wma.ts`
- **Formula:** WMA = sum(close * weight) / sum(weights)
- **Parameters:** Period (default: 20)
- **Acceptance Criteria:**
  - [x] Correct WMA calculation
  - [x] Weights increase linearly
- **Status:** [x] Completed

---

#### TASK-034: Bollinger Bands Calculation
- **Description:** Bollinger Bands indicator
- **Files to Create:**
  - `src/components/Indicators/calculations/bollingerBands.ts`
- **Components:**
  - Middle Band: SMA(period)
  - Upper Band: SMA + (stdDev * multiplier)
  - Lower Band: SMA - (stdDev * multiplier)
- **Parameters:** Period (20), StdDev Multiplier (2)
- **Acceptance Criteria:**
  - [x] Three lines calculated correctly
  - [x] Standard deviation calculated properly
  - [x] Returns upper, middle, lower arrays
- **Status:** [x] Completed

---

#### TASK-035: DEMA Indicator Calculation
- **Description:** Double Exponential Moving Average
- **Files to Create:**
  - `src/components/Indicators/calculations/dema.ts`
- **Formula:** DEMA = 2 * EMA - EMA(EMA)
- **Parameters:** Period (default: 20)
- **Acceptance Criteria:**
  - [x] Correct DEMA calculation
  - [x] Uses EMA calculation internally
- **Status:** [x] Completed

---

#### TASK-036: TEMA Indicator Calculation
- **Description:** Triple Exponential Moving Average
- **Files to Create:**
  - `src/components/Indicators/calculations/tema.ts`
- **Formula:** TEMA = 3*EMA - 3*EMA(EMA) + EMA(EMA(EMA))
- **Parameters:** Period (default: 20)
- **Acceptance Criteria:**
  - [x] Correct TEMA calculation
- **Status:** [x] Completed

---

#### TASK-037: VWAP Indicator Calculation
- **Description:** Volume Weighted Average Price
- **Files to Create:**
  - `src/components/Indicators/calculations/vwap.ts`
- **Formula:** VWAP = sum(typical price * volume) / sum(volume)
- **Typical Price:** (H + L + C) / 3
- **Acceptance Criteria:**
  - [x] Correct VWAP calculation
  - [x] Resets at session start
- **Status:** [x] Completed

---

#### TASK-038: Envelope Indicator Calculation
- **Description:** Moving Average Envelope
- **Files to Create:**
  - `src/components/Indicators/calculations/envelope.ts`
- **Components:**
  - Upper: SMA * (1 + percentage)
  - Lower: SMA * (1 - percentage)
- **Parameters:** Period (20), Percentage (2.5%)
- **Acceptance Criteria:**
  - [x] Upper and lower bands calculated
  - [x] Percentage applied correctly
- **Status:** [x] Completed

---

#### TASK-039: Parabolic SAR Calculation
- **Description:** Parabolic Stop and Reverse
- **Files to Create:**
  - `src/components/Indicators/calculations/parabolicSar.ts`
- **Parameters:** Step (0.02), Max (0.2)
- **Acceptance Criteria:**
  - [x] Correct SAR calculation
  - [x] Acceleration factor applied
  - [x] Direction reversals handled
- **Status:** [x] Completed

---

#### TASK-040: Ichimoku Cloud Calculation
- **Description:** Ichimoku Kinko Hyo indicator
- **Files to Create:**
  - `src/components/Indicators/calculations/ichimoku.ts`
- **Components:**
  - Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
  - Kijun-sen (Base Line): (26-period high + 26-period low) / 2
  - Senkou Span A: (Tenkan-sen + Kijun-sen) / 2, plotted 26 periods ahead
  - Senkou Span B: (52-period high + 52-period low) / 2, plotted 26 periods ahead
  - Chikou Span: Close plotted 26 periods behind
- **Parameters:** Tenkan (9), Kijun (26), Senkou (52)
- **Acceptance Criteria:**
  - [x] All five components calculated
  - [x] Future projection for cloud
  - [x] Cloud shading between Senkou A and B
- **Status:** [x] Completed

---

#### TASK-041: RSI Indicator Calculation
- **Description:** Relative Strength Index
- **Files to Create:**
  - `src/components/Indicators/calculations/rsi.ts`
- **Formula:**
  - RS = Average Gain / Average Loss
  - RSI = 100 - (100 / (1 + RS))
- **Parameters:** Period (default: 14)
- **Range:** 0-100
- **Acceptance Criteria:**
  - [x] Correct RSI calculation
  - [x] Smoothed averages after initial period
  - [x] Overbought (70) / Oversold (30) reference lines
- **Status:** [x] Completed

---

#### TASK-042: MACD Indicator Calculation
- **Description:** Moving Average Convergence Divergence
- **Files to Create:**
  - `src/components/Indicators/calculations/macd.ts`
- **Components:**
  - MACD Line: EMA(12) - EMA(26)
  - Signal Line: EMA(9) of MACD Line
  - Histogram: MACD Line - Signal Line
- **Parameters:** Fast (12), Slow (26), Signal (9)
- **Acceptance Criteria:**
  - [x] MACD line calculated correctly
  - [x] Signal line is EMA of MACD
  - [x] Histogram shows difference
- **Status:** [x] Completed

---

#### TASK-043: Stochastic Oscillator Calculation
- **Description:** Stochastic %K and %D
- **Files to Create:**
  - `src/components/Indicators/calculations/stochastic.ts`
- **Formula:**
  - %K = (Close - Low(n)) / (High(n) - Low(n)) * 100
  - %D = SMA(%K, smoothPeriod)
- **Parameters:** %K Period (14), %D Period (3), Smooth (3)
- **Range:** 0-100
- **Acceptance Criteria:**
  - [x] %K and %D calculated correctly
  - [x] Smoothing applied
- **Status:** [x] Completed

---

#### TASK-044: Stochastic RSI Calculation
- **Description:** Stochastic RSI indicator
- **Files to Create:**
  - `src/components/Indicators/calculations/stochasticRsi.ts`
- **Formula:** StochRSI on RSI values
- **Parameters:** RSI Period (14), Stoch Period (14)
- **Range:** 0-100
- **Acceptance Criteria:**
  - [x] RSI calculated first
  - [x] Stochastic applied to RSI values
- **Status:** [x]

---

#### TASK-045: Williams %R Calculation
- **Description:** Williams Percent Range
- **Files to Create:**
  - `src/components/Indicators/calculations/williamsR.ts`
- **Formula:** %R = (Highest High - Close) / (Highest High - Lowest Low) * -100
- **Parameters:** Period (default: 14)
- **Range:** -100 to 0
- **Acceptance Criteria:**
  - [x] Correct Williams %R calculation
  - [x] Negative values
- **Status:** [x]

---

#### TASK-046: CCI Indicator Calculation
- **Description:** Commodity Channel Index
- **Files to Create:**
  - `src/components/Indicators/calculations/cci.ts`
- **Formula:** CCI = (Typical Price - SMA) / (0.015 * Mean Deviation)
- **Parameters:** Period (default: 20)
- **Acceptance Criteria:**
  - [x] Correct CCI calculation
  - [x] Mean deviation calculated properly
- **Status:** [x]

---

#### TASK-047: ATR Indicator Calculation
- **Description:** Average True Range
- **Files to Create:**
  - `src/components/Indicators/calculations/atr.ts`
- **Formula:**
  - True Range = max(H-L, |H-prevC|, |L-prevC|)
  - ATR = EMA(True Range, period)
- **Parameters:** Period (default: 14)
- **Acceptance Criteria:**
  - [x] True Range calculated correctly
  - [x] ATR is smoothed average
- **Status:** [x]

---

#### TASK-048: ADX Indicator Calculation
- **Description:** Average Directional Index
- **Files to Create:**
  - `src/components/Indicators/calculations/adx.ts`
- **Components:**
  - +DI (Positive Directional Indicator)
  - -DI (Negative Directional Indicator)
  - ADX (Average of DX)
- **Parameters:** Period (default: 14)
- **Range:** 0-100
- **Acceptance Criteria:**
  - [x] +DI, -DI, and ADX calculated
  - [x] DX smoothing applied
- **Status:** [x]

---

#### TASK-049: ROC Indicator Calculation
- **Description:** Rate of Change
- **Files to Create:**
  - `src/components/Indicators/calculations/roc.ts`
- **Formula:** ROC = ((Close - Close[n]) / Close[n]) * 100
- **Parameters:** Period (default: 12)
- **Acceptance Criteria:**
  - [x] Correct ROC calculation
  - [x] Percentage values
- **Status:** [x]

---

#### TASK-050: Momentum Indicator Calculation
- **Description:** Momentum oscillator
- **Files to Create:**
  - `src/components/Indicators/calculations/momentum.ts`
- **Formula:** Momentum = Close - Close[n]
- **Parameters:** Period (default: 10)
- **Acceptance Criteria:**
  - [x] Correct momentum calculation
  - [x] Zero line reference
- **Status:** [x]

---

#### TASK-051: OBV Indicator Calculation
- **Description:** On-Balance Volume
- **Files to Create:**
  - `src/components/Indicators/calculations/obv.ts`
- **Formula:**
  - If close > prev close: OBV = prevOBV + volume
  - If close < prev close: OBV = prevOBV - volume
  - If close = prev close: OBV = prevOBV
- **Acceptance Criteria:**
  - [x] Correct OBV calculation
  - [x] Cumulative volume
- **Status:** [x]

---

#### TASK-052: CMF Indicator Calculation
- **Description:** Chaikin Money Flow
- **Files to Create:**
  - `src/components/Indicators/calculations/cmf.ts`
- **Formula:**
  - Money Flow Multiplier = ((C-L) - (H-C)) / (H-L)
  - Money Flow Volume = MFM * Volume
  - CMF = sum(MFV, period) / sum(Volume, period)
- **Parameters:** Period (default: 20)
- **Range:** -1 to 1
- **Acceptance Criteria:**
  - [x] Correct CMF calculation
  - [x] Range bounded correctly
- **Status:** [x]

---

#### TASK-053: MFI Indicator Calculation
- **Description:** Money Flow Index
- **Files to Create:**
  - `src/components/Indicators/calculations/mfi.ts`
- **Formula:**
  - Raw Money Flow = Typical Price * Volume
  - Money Ratio = Positive MF / Negative MF
  - MFI = 100 - (100 / (1 + Money Ratio))
- **Parameters:** Period (default: 14)
- **Range:** 0-100
- **Acceptance Criteria:**
  - [x] Correct MFI calculation
  - [x] Similar to RSI but volume-weighted
- **Status:** [x]

---

#### TASK-054: Aroon Indicator Calculation
- **Description:** Aroon Up and Down
- **Files to Create:**
  - `src/components/Indicators/calculations/aroon.ts`
- **Formula:**
  - Aroon Up = ((period - periods since highest high) / period) * 100
  - Aroon Down = ((period - periods since lowest low) / period) * 100
- **Parameters:** Period (default: 25)
- **Range:** 0-100
- **Acceptance Criteria:**
  - [x] Aroon Up and Down calculated
  - [x] Tracks days since high/low
- **Status:** [x]

---

#### TASK-055: Awesome Oscillator Calculation
- **Description:** Awesome Oscillator (AO)
- **Files to Create:**
  - `src/components/Indicators/calculations/awesomeOscillator.ts`
- **Formula:** AO = SMA(Median Price, 5) - SMA(Median Price, 34)
- **Median Price:** (H + L) / 2
- **Parameters:** Fast (5), Slow (34)
- **Acceptance Criteria:**
  - [x] Correct AO calculation
  - [x] Histogram display (green/red bars)
- **Status:** [x]

---

#### TASK-056: Indicator Calculation Index
- **Description:** Export all indicator calculations
- **Files to Create:**
  - `src/components/Indicators/calculations/index.ts`
- **Acceptance Criteria:**
  - [x] All calculations exported
  - [x] Factory function to get calculation by type
- **Status:** [x]

---

#### TASK-057: Indicators Panel UI
- **Description:** Searchable panel for adding indicators
- **Files to Create:**
  - `src/components/Indicators/IndicatorsPanel.tsx`
  - `src/components/Indicators/index.ts`
- **Layout:**
  ```
  [🔍 Search Indicators...]
  ▶ Trend (Overlay)
    ├ SMA
    ├ EMA
    └ ...
  ▶ Momentum (Oscillator)
    ├ RSI
    └ ...
  ▶ Volume
    ├ OBV
    └ ...
  ```
- **Acceptance Criteria:**
  - [x] Searchable input filters indicators
  - [x] Collapsible categories
  - [x] Click adds indicator
  - [x] Modal/panel display
- **Playwright Validation:**
  - [x] Panel opens from toolbar button
  - [x] Search filters list
  - [x] Categories expand/collapse
  - [x] Indicator can be added
- **Status:** [x] Completed

---

#### TASK-058: Indicators Button
- **Description:** Toolbar button to open indicators panel
- **Files to Create:**
  - `src/components/Toolbar/IndicatorsButton.tsx`
- **Acceptance Criteria:**
  - [x] Button with chart icon
  - [x] Opens indicator panel modal
  - [x] Badge shows count of active indicators
- **Playwright Validation:**
  - [x] Button visible in toolbar
  - [x] Click opens indicator panel
- **Status:** [x] Completed

---

#### TASK-059: Active Indicators List
- **Description:** Display list of active indicators
- **Files to Create:**
  - `src/components/Indicators/ActiveIndicatorsList.tsx`
- **Features:**
  - Show each active indicator
  - Settings gear icon to edit parameters
  - X button to remove
  - Eye icon to toggle visibility
- **Acceptance Criteria:**
  - [x] Lists all active indicators
  - [x] Remove button works
  - [x] Settings opens config modal
  - [x] Visibility toggle works
- **Playwright Validation:**
  - [x] Active indicators displayed
  - [x] Remove removes indicator
  - [x] Toggle hides/shows on chart
- **Status:** [x] Completed

---

#### TASK-060: Indicator Configuration Modal
- **Description:** Modal to edit indicator parameters
- **Files to Create:**
  - `src/components/Indicators/IndicatorConfig.tsx`
- **Features:**
  - Input fields for each parameter
  - Color picker for line colors
  - Apply and Cancel buttons
  - Validation for numeric inputs
- **Acceptance Criteria:**
  - [x] Shows parameters for selected indicator
  - [x] Validates numeric input
  - [x] Apply updates indicator
  - [x] Cancel discards changes
- **Playwright Validation:**
  - [x] Modal opens from gear icon
  - [x] Parameters editable
  - [x] Changes apply to chart
- **Status:** [x] Completed

---

#### TASK-061: Overlay Indicator Rendering
- **Description:** Render overlay indicators on price chart
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Acceptance Criteria:**
  - [x] SMA/EMA/WMA render as lines
  - [x] Bollinger Bands render as 3 lines
  - [x] Ichimoku renders with cloud
  - [x] Colors configurable
  - [x] Multiple overlays supported
- **Playwright Validation:**
  - [x] Overlay appears after adding indicator
  - [x] Line colors match config
- **Status:** [x] Completed

---

#### TASK-062: Oscillator Indicator Pane
- **Description:** Render oscillator indicators in separate panes
- **Files to Create:**
  - `src/components/Chart/IndicatorPane.tsx`
- **Features:**
  - Separate panel below main chart
  - Own price scale (0-100 for RSI, etc.)
  - Reference lines (overbought/oversold)
  - Synchronized time scale
- **Acceptance Criteria:**
  - [x] Panel renders below main chart
  - [x] Correct scale for indicator type
  - [x] Reference lines visible
  - [x] Crosshair syncs with main chart
- **Playwright Validation:**
  - [x] Oscillator panel appears when added
  - [x] Values update with crosshair
- **Status:** [x] Completed

---

#### TASK-063: Indicator Legend Values
- **Description:** Show indicator values in legend on hover
- **Files to Modify:**
  - `src/components/Chart/Legend.tsx`
- **Acceptance Criteria:**
  - [x] Legend shows indicator names and values
  - [x] Values update on crosshair move
  - [x] Multiple indicator values displayed
- **Playwright Validation:**
  - [x] Indicator values appear in legend
  - [x] Values update on hover
- **Status:** [x] Completed

---

#### TASK-064: useIndicator Hook
- **Description:** Hook to calculate and manage indicator data
- **Files to Create:**
  - `src/hooks/useIndicator.ts`
- **Features:**
  - Takes OHLCV data and indicator config
  - Returns calculated indicator data
  - Memoized calculation
  - Recalculates when data or params change
- **Acceptance Criteria:**
  - [x] Hook returns indicator data
  - [x] Memoization prevents unnecessary recalculation
  - [x] Supports all indicator types
- **Status:** [x] Completed

---

### Phase 5: Responsive Design

#### TASK-065: Desktop Layout (≥1024px)
- **Description:** Implement full desktop layout
- **Files to Modify:**
  - `src/App.tsx`
  - `src/components/Toolbar/Toolbar.tsx`
- **Acceptance Criteria:**
  - [x] Full toolbar visible
  - [x] Side panel for indicators
  - [x] Optimal chart dimensions
- **Playwright Validation:**
  - [x] Desktop layout renders at 1024px+
  - [x] All controls accessible
- **Status:** [x] Completed

---

#### TASK-066: Tablet Layout (768-1023px)
- **Description:** Implement tablet responsive layout
- **Files to Modify:**
  - `src/components/Toolbar/Toolbar.tsx`
- **Acceptance Criteria:**
  - [x] Collapsible toolbar sections
  - [x] Modal for indicators
  - [x] Adjusted chart dimensions
- **Playwright Validation:**
  - [x] Layout adapts at tablet breakpoint
  - [x] Modals work correctly
- **Status:** [x] Completed

---

#### TASK-067: Mobile Layout (<768px)
- **Description:** Implement mobile responsive layout
- **Files to Modify:**
  - `src/components/Toolbar/Toolbar.tsx`
  - `src/App.tsx`
- **Acceptance Criteria:**
  - [x] Hamburger menu for toolbar
  - [x] Bottom sheet for controls
  - [x] Full-width chart
  - [x] Touch-friendly button sizes
- **Playwright Validation:**
  - [x] Layout adapts at mobile breakpoint
  - [x] Hamburger menu opens/closes
  - [x] Bottom sheet slides up
- **Status:** [x] Completed

---

### Phase 6: Error Handling & Polish

#### TASK-068: Error Boundary Implementation
- **Description:** Implement error boundaries for graceful error handling
- **Files to Modify:**
  - `src/components/common/ErrorBoundary.tsx`
  - `src/App.tsx`
- **Acceptance Criteria:**
  - [x] Catches JavaScript errors
  - [x] Shows user-friendly error message
  - [x] Retry button resets state
  - [x] Errors logged to console
- **Playwright Validation:**
  - [x] Error boundary catches errors
  - [x] Error UI displays
  - [x] Retry reloads component
- **Status:** [x] Completed

---

#### TASK-069: Loading States
- **Description:** Implement loading skeletons and spinners
- **Files to Modify:**
  - `src/components/Chart/ChartSkeleton.tsx`
  - `src/components/QuoteHeader/QuoteHeader.tsx`
- **Acceptance Criteria:**
  - [x] Chart skeleton during data load
  - [x] Quote header skeleton
  - [x] Smooth transition to loaded state
- **Playwright Validation:**
  - [x] Loading states appear
  - [x] Transitions are smooth
- **Status:** [x] Completed

---

---

## Priority P1 - Should Have

### Phase 7: Advanced Features

#### TASK-070: Symbol Comparison Feature
- **Description:** Add multiple symbols for comparison
- **Files to Create:**
  - `src/components/Toolbar/CompareButton.tsx`
  - `src/components/Comparison/ComparisonSearch.tsx`
  - `src/components/Comparison/ComparisonLegend.tsx`
- **Acceptance Criteria:**
  - [ ] Search and add comparison symbols
  - [ ] Maximum 5 comparison symbols
  - [ ] Distinct colors auto-assigned
  - [ ] Remove symbol via X button
- **Playwright Validation:**
  - [ ] Compare button opens search
  - [ ] Symbols can be added
  - [ ] Legend shows all symbols
- **Status:** [ ]

---

#### TASK-071: Percentage Mode for Comparison
- **Description:** Normalize comparison to percentage change
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
  - `src/context/ChartContext.tsx`
- **Acceptance Criteria:**
  - [ ] Auto-switches to percentage when comparing
  - [ ] All series start at 0% at left edge
  - [ ] Y-axis shows percentage
- **Playwright Validation:**
  - [ ] Percentage mode activates on comparison
  - [ ] Values normalized correctly
- **Status:** [ ]

---

#### TASK-072: Quick Compare to Index
- **Description:** Quick buttons to compare to major indices
- **Files to Modify:**
  - `src/components/Toolbar/CompareButton.tsx`
- **Indices:**
  - S&P 500 (^GSPC)
  - NASDAQ (^IXIC)
  - DOW (^DJI)
- **Acceptance Criteria:**
  - [ ] Quick buttons for indices
  - [ ] One-click add to comparison
- **Playwright Validation:**
  - [ ] Index buttons visible
  - [ ] Click adds index to comparison
- **Status:** [ ]

---

#### TASK-073: Custom Date Range Picker
- **Description:** Calendar component for date range selection
- **Files to Create:**
  - `src/components/common/DatePicker.tsx`
  - `src/components/Toolbar/DateRangePicker.tsx`
- **Acceptance Criteria:**
  - [ ] Calendar UI for start/end dates
  - [ ] Validation (end > start, max 20 years)
  - [ ] Apply button fetches data
  - [ ] Clear button resets
- **Playwright Validation:**
  - [ ] Date picker opens
  - [ ] Dates can be selected
  - [ ] Apply updates chart
- **Status:** [ ]

---

#### TASK-074: Quote Details Panel
- **Description:** Expanded market data panel
- **Files to Create:**
  - `src/components/QuoteHeader/QuoteDetails.tsx`
- **Data Points:**
  - Previous Close
  - Day Range
  - 52-Week Range
  - Volume
  - Avg Volume
  - Market Cap
  - P/E Ratio
  - EPS
  - Dividend Yield
  - Beta
- **Acceptance Criteria:**
  - [ ] Expandable panel
  - [ ] All data points displayed
  - [ ] Formatted values (currency, %)
- **Playwright Validation:**
  - [ ] Panel expands/collapses
  - [ ] All data visible
- **Status:** [ ]

---

#### TASK-075: Events Overlay
- **Description:** Display earnings, dividends, splits on chart
- **Files to Create:**
  - `src/components/Chart/EventMarkers.tsx`
  - `src/api/mockEvents.ts`
- **Markers:**
  - "E" for Earnings
  - "D" for Dividends
  - "S" for Stock Splits
- **Acceptance Criteria:**
  - [ ] Markers display on chart
  - [ ] Hover shows event details
  - [ ] Click shows popup
  - [ ] Toggleable via settings
- **Playwright Validation:**
  - [ ] Markers visible on chart
  - [ ] Hover tooltip works
  - [ ] Toggle hides/shows
- **Status:** [ ]

---

#### TASK-076: Settings Panel
- **Description:** User preferences panel
- **Files to Create:**
  - `src/components/Settings/SettingsPanel.tsx`
  - `src/components/Settings/ThemeToggle.tsx`
  - `src/components/Toolbar/SettingsButton.tsx`
- **Settings:**
  - Scale Type (Linear/Logarithmic)
  - Show Extended Hours
  - Show Volume
  - Show Grid
  - Theme (Light/Dark)
  - Bullish/Bearish Colors
  - Auto-refresh (On/Off)
  - Refresh Interval
- **Acceptance Criteria:**
  - [ ] Settings panel accessible from toolbar
  - [ ] Settings persist in localStorage
  - [ ] Changes apply immediately
- **Playwright Validation:**
  - [ ] Settings panel opens
  - [ ] Toggle changes take effect
  - [ ] Settings persist on reload
- **Status:** [ ]

---

#### TASK-077: Logarithmic Scale Option
- **Description:** Toggle between linear and log scale
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
  - `src/components/Settings/SettingsPanel.tsx`
- **Acceptance Criteria:**
  - [ ] Scale type togglable
  - [ ] Chart re-renders with log scale
  - [ ] Y-axis labels adjusted
- **Playwright Validation:**
  - [ ] Scale changes on toggle
  - [ ] Price spacing changes
- **Status:** [ ]

---

#### TASK-078: Grid Toggle
- **Description:** Show/hide chart grid lines
- **Files to Modify:**
  - `src/components/Chart/ChartCanvas.tsx`
- **Acceptance Criteria:**
  - [ ] Grid visibility toggleable
  - [ ] Applies to both axes
- **Playwright Validation:**
  - [ ] Grid shows/hides on toggle
- **Status:** [ ]

---

#### TASK-079: Volume Toggle
- **Description:** Show/hide volume pane
- **Files to Modify:**
  - `src/components/Chart/Chart.tsx`
- **Acceptance Criteria:**
  - [ ] Volume pane visibility toggleable
  - [ ] Main chart resizes to fill space
- **Playwright Validation:**
  - [ ] Volume pane shows/hides
  - [ ] Chart adjusts height
- **Status:** [ ]

---

#### TASK-080: Color Customization
- **Description:** Customize bullish/bearish colors
- **Files to Modify:**
  - `src/components/Settings/SettingsPanel.tsx`
  - `src/context/ThemeContext.tsx`
- **Acceptance Criteria:**
  - [ ] Color pickers for bullish/bearish
  - [ ] Colors apply to chart
  - [ ] Colors persist in localStorage
- **Playwright Validation:**
  - [ ] Color pickers work
  - [ ] Chart colors update
- **Status:** [ ]

---

#### TASK-081: Keyboard Shortcuts
- **Description:** Implement keyboard navigation
- **Shortcuts:**
  - `+` / `-` : Zoom in/out
  - `←` / `→` : Pan left/right
  - `Home` : Go to oldest data
  - `End` : Go to newest data
  - `Esc` : Close modal/panel
  - `F` : Toggle fullscreen
  - `R` : Reset zoom
- **Acceptance Criteria:**
  - [ ] All shortcuts work
  - [ ] No conflict with browser shortcuts
  - [ ] Shortcuts work when chart focused
- **Playwright Validation:**
  - [ ] Keyboard shortcuts trigger actions
- **Status:** [ ]

---

#### TASK-082: Performance Optimization
- **Description:** Optimize chart rendering for large datasets
- **Tasks:**
  - Data windowing/virtualization
  - Lazy loading for indicators
  - Memoization of expensive calculations
  - Debounced resize handlers
- **Acceptance Criteria:**
  - [ ] < 500ms render for 10,000 data points
  - [ ] Smooth pan/zoom at 60fps
  - [ ] Memory usage < 150MB
- **Playwright Validation:**
  - [ ] Large dataset renders smoothly
- **Status:** [ ]

---

#### TASK-083: Accessibility Improvements
- **Description:** Ensure WCAG 2.1 AA compliance
- **Tasks:**
  - ARIA labels for all controls
  - Keyboard navigation
  - Screen reader compatible legends
  - Color contrast ≥ 4.5:1
  - Focus indicators
- **Acceptance Criteria:**
  - [ ] All interactive elements keyboard accessible
  - [ ] ARIA labels present
  - [ ] Color contrast passes
- **Playwright Validation:**
  - [ ] Tab navigation works
  - [ ] Focus indicators visible
- **Status:** [ ]

---

---

## Priority P2 - Nice to Have

### Phase 8: Export & Sharing

#### TASK-084: Export Chart as PNG
- **Description:** Download chart as PNG image
- **Files to Create:**
  - `src/components/Export/ExportButton.tsx`
  - `src/utils/exportChart.ts`
- **Acceptance Criteria:**
  - [ ] Export button in toolbar
  - [ ] Chart exported with current state
  - [ ] Includes header and legend
  - [ ] Filename includes symbol and date
- **Playwright Validation:**
  - [ ] Export button works
  - [ ] File downloads
- **Status:** [ ]

---

#### TASK-085: Export Data as CSV
- **Description:** Download visible data as CSV file
- **Files to Create:**
  - `src/utils/exportCsv.ts`
- **Acceptance Criteria:**
  - [ ] Exports OHLCV data
  - [ ] Includes indicator values
  - [ ] Proper date formatting
  - [ ] Filename includes symbol
- **Playwright Validation:**
  - [ ] CSV downloads
  - [ ] Data is correct
- **Status:** [ ]

---

#### TASK-086: Copy Shareable Link
- **Description:** Generate URL with chart state
- **Files to Create:**
  - `src/utils/shareUrl.ts`
- **URL Parameters:**
  - symbol
  - timeRange
  - interval
  - chartType
  - indicators
- **Acceptance Criteria:**
  - [ ] URL encodes chart state
  - [ ] Loading URL restores state
  - [ ] Copy to clipboard button
- **Playwright Validation:**
  - [ ] Link copies to clipboard
  - [ ] Opening link restores state
- **Status:** [ ]

---

#### TASK-087: Print Support
- **Description:** Print chart via browser dialog
- **Acceptance Criteria:**
  - [ ] Print button opens browser dialog
  - [ ] Chart renders properly for print
  - [ ] Optimized for paper format
- **Playwright Validation:**
  - [ ] Print dialog opens
- **Status:** [ ]

---

---

## API Integration Phase

### TASK-088: Alpha Vantage API Client Setup
- **Description:** Create API client for Alpha Vantage
- **Files to Create:**
  - `src/api/alphavantage.ts`
  - `src/api/types.ts`
- **Endpoints:**
  - TIME_SERIES_INTRADAY (1min, 5min, 15min, 30min, 60min)
  - TIME_SERIES_DAILY
  - TIME_SERIES_WEEKLY
  - TIME_SERIES_MONTHLY
  - SYMBOL_SEARCH
  - GLOBAL_QUOTE
- **Acceptance Criteria:**
  - [x] API key configuration via .env
  - [x] Rate limiting handled (5 calls/min free tier)
  - [x] Error handling for API failures
  - [x] Response type definitions
- **Status:** [x] Completed

---

#### TASK-089: Data Transformation Layer
- **Description:** Transform Alpha Vantage responses to chart format
- **Files to Create:**
  - `src/api/transforms.ts`
- **Acceptance Criteria:**
  - [x] Converts AV response to OHLCV[]
  - [x] Handles all time series formats
  - [x] Sorts data chronologically
  - [x] Validates data integrity
- **Status:** [x] Completed

---

#### TASK-090: API/Mock Data Switcher Logic
- **Description:** Implement data source switching logic
- **Files to Modify:**
  - `src/hooks/useStockData.ts`
  - `src/hooks/useQuote.ts`
- **Acceptance Criteria:**
  - [x] DataSourceContext determines data source
  - [x] Seamless switching without page reload
  - [x] Loading states for API calls
  - [x] Error handling for API failures
- **Status:** [x] Completed

---

#### TASK-091: Symbol Search API Integration
- **Description:** Connect symbol search to Alpha Vantage
- **Files to Modify:**
  - `src/components/Toolbar/SymbolSearch.tsx`
- **Acceptance Criteria:**
  - [x] Uses SYMBOL_SEARCH endpoint when API selected
  - [x] Falls back to mock data if API fails
  - [x] Caches search results
- **Playwright Validation:**
  - [x] Search returns API results
  - [x] Fallback works on API failure
- **Status:** [x] Completed

---

#### TASK-092: Real-time Quote Integration
- **Description:** Fetch real-time quotes from API
- **Files to Modify:**
  - `src/hooks/useQuote.ts`
- **Acceptance Criteria:**
  - [x] Uses GLOBAL_QUOTE endpoint
  - [x] Updates quote header
  - [x] Optional auto-refresh
- **Playwright Validation:**
  - [x] Quote updates from API
  - [x] Auto-refresh works if enabled
- **Status:** [x] Completed

---

#### TASK-093: Historical Data Integration
- **Description:** Fetch historical OHLCV data from API
- **Files to Modify:**
  - `src/hooks/useStockData.ts`
- **Acceptance Criteria:**
  - [x] Fetches appropriate time series based on range
  - [x] Handles API rate limiting
  - [x] Caches responses
  - [x] Shows loading/error states
- **Playwright Validation:**
  - [x] Chart displays API data
  - [x] Different ranges fetch correctly
- **Status:** [x] Completed

---

#### TASK-094: API Error Handling & Caching
- **Description:** Implement robust error handling and caching
- **Files to Create:**
  - `src/api/cache.ts`
- **Features:**
  - In-memory cache with TTL
  - Retry logic for failed requests
  - User-friendly error messages
  - Offline detection
- **Acceptance Criteria:**
  - [x] Cached data returned when available
  - [x] Errors show user-friendly messages
  - [x] Retry button on errors
  - [x] Rate limit messages displayed
- **Playwright Validation:**
  - [x] Cached data loads immediately
  - [x] Error states display correctly
- **Status:** [x] Completed

---

---

## Final Validation

#### TASK-095: Full Application E2E Validation
- **Description:** Complete end-to-end Playwright validation
- **Test Scenarios:**
  - [ ] Load application
  - [ ] Search and select symbol
  - [ ] Change chart type
  - [ ] Change time range
  - [ ] Change interval
  - [ ] Add overlay indicator
  - [ ] Add oscillator indicator
  - [ ] Configure indicator parameters
  - [ ] Remove indicator
  - [ ] Zoom and pan chart
  - [ ] Toggle theme
  - [ ] Switch data source
  - [ ] Responsive layouts
- **Status:** [ ]
