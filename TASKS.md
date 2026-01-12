# FinanceViz - Implementation Task List

**Project:** Stock Chart Application  
**Created:** January 12, 2026  
**Status:** Not Started  

---

## Task Tracking Legend

| Status | Symbol | Description |
|--------|--------|-------------|
| Not Started | `[ ]` | Task not yet begun |
| In Progress | `[~]` | Currently being worked on |
| Completed | `[x]` | Task finished |
| Blocked | `[!]` | Blocked by dependency or issue |

---

## Priority Definitions

| Priority | Description | Timeline |
|----------|-------------|----------|
| **P0** | Must Have - Core MVP functionality | Weeks 1-6 |
| **P1** | Should Have - Important for complete experience | Weeks 7-8 |
| **P2** | Nice to Have - Enhanced features | Week 9-10 |

---

# P0 - Must Have (Core MVP)

## 1. Project Setup & Infrastructure

### 1.1 Initialize Project
- [x] **TASK-001**: Initialize Vite project with React and TypeScript template
  - Command: `npm create vite@latest . -- --template react-ts`
  - Acceptance: Project runs with `npm run dev`

- [x] **TASK-002**: Install and configure TailwindCSS
  - Install: `tailwindcss`, `postcss`, `autoprefixer`
  - Create `tailwind.config.js` and `postcss.config.js`
  - Add Tailwind directives to `index.css`
  - Acceptance: Tailwind classes work in components

- [x] **TASK-003**: Install core dependencies
  - `lightweight-charts` - Charting library
  - `axios` - HTTP client
  - `date-fns` - Date utilities
  - `lucide-react` - Icon library
  - Acceptance: All packages in `package.json`

- [x] **TASK-004**: Create project folder structure
  - Create directories: `api/`, `components/`, `context/`, `hooks/`, `utils/`, `types/`
  - Acceptance: Folder structure matches specification

- [x] **TASK-005**: Configure environment variables
  - Create `.env` file with `VITE_FINNHUB_API_KEY`
  - Create `.env.example` template
  - Add `.env` to `.gitignore`
  - Acceptance: Environment variables accessible in app

- [x] **TASK-006**: Setup base TypeScript types
  - Create `types/chart.ts` - Chart-related types
  - Create `types/stock.ts` - Stock data types (OHLCV, Quote)
  - Create `types/indicators.ts` - Indicator types
  - Acceptance: Types importable and used in components

---

### 1.2 API Layer
- [x] **TASK-007**: Create Finnhub API client base
  - File: `api/finnhub.ts`
  - Configure axios instance with base URL and API key
  - Implement request interceptor for authentication
  - Implement error handling interceptor
  - Acceptance: API client makes authenticated requests

- [x] **TASK-008**: Implement stock candle endpoint
  - Function: `getStockCandles(symbol, resolution, from, to)`
  - Transform response to OHLCV array
  - Handle `no_data` response status
  - Acceptance: Returns formatted OHLCV data

- [x] **TASK-009**: Implement quote endpoint
  - Function: `getQuote(symbol)`
  - Return current price, change, change percent
  - Acceptance: Returns Quote object

- [x] **TASK-010**: Implement symbol search endpoint
  - Function: `searchSymbols(query)`
  - Return array of matching symbols with company names
  - Acceptance: Returns search results for autocomplete

- [x] **TASK-011**: Implement company profile endpoint
  - Function: `getCompanyProfile(symbol)`
  - Return company name, logo, industry, market cap
  - Acceptance: Returns company information

- [x] **TASK-012**: Create data transformation utilities
  - File: `api/transforms.ts`
  - Function: `transformCandleResponse(response)` - API to OHLCV
  - Function: `aggregateToInterval(data, interval)` - Resample data
  - Acceptance: Data correctly transformed

---

## 2. State Management

### 2.1 Context Setup
- [x] **TASK-013**: Create Chart Context
  - File: `context/ChartContext.tsx`
  - State: symbol, timeRange, interval, chartType, isLoading, error
  - Actions: setSymbol, setTimeRange, setInterval, setChartType
  - Provider component wrapping app
  - Acceptance: Context accessible in child components

- [x] **TASK-014**: Create Indicator Context
  - File: `context/IndicatorContext.tsx`
  - State: overlays[], oscillators[]
  - Actions: addIndicator, removeIndicator, updateIndicatorParams
  - Acceptance: Indicators can be added/removed/updated

- [x] **TASK-015**: Create Theme Context
  - File: `context/ThemeContext.tsx`
  - State: theme ('light' | 'dark')
  - Actions: toggleTheme, setTheme
  - Persist to localStorage
  - Acceptance: Theme toggles and persists

---

## 3. Common Components

### 3.1 UI Primitives
- [x] **TASK-016**: Create Button component
  - File: `components/common/Button.tsx`
  - Variants: primary, secondary, ghost
  - Sizes: sm, md, lg
  - States: disabled, loading
  - Acceptance: All variants render correctly

- [x] **TASK-017**: Create Dropdown component
  - File: `components/common/Dropdown.tsx`
  - Props: options, value, onChange, placeholder
  - Keyboard navigation support
  - Acceptance: Dropdown opens, selects, closes

- [x] **TASK-018**: Create Modal component
  - File: `components/common/Modal.tsx`
  - Props: isOpen, onClose, title, children
  - Click outside to close
  - Escape key to close
  - Acceptance: Modal opens/closes correctly

- [x] **TASK-019**: Create Spinner component
  - File: `components/common/Spinner.tsx`
  - Sizes: sm, md, lg
  - Acceptance: Animated spinner displays

- [x] **TASK-020**: Create utility functions
  - File: `utils/formatters.ts`
  - `formatPrice(value)` - Currency formatting
  - `formatVolume(value)` - 1.2M, 500K format
  - `formatPercent(value)` - +2.45% format
  - `formatDate(timestamp, format)` - Date formatting
  - Acceptance: All formatters work correctly

- [x] **TASK-021**: Create constants file
  - File: `utils/constants.ts`
  - TIME_RANGES array with labels and values
  - INTERVALS array with labels and values
  - CHART_TYPES array with labels and values
  - COLOR_PALETTE for comparisons
  - Acceptance: Constants importable

---

## 4. Quote Header

### 4.1 Price Display
- [x] **TASK-022**: Create QuoteHeader component
  - File: `components/QuoteHeader/QuoteHeader.tsx`
  - Display: Symbol, Company Name, Current Price
  - Display: Change (absolute), Change % with color coding
  - Large, prominent price display
  - Acceptance: Quote data displays correctly

- [x] **TASK-023**: Create useQuote hook
  - File: `hooks/useQuote.ts`
  - Fetch quote data for current symbol
  - Auto-refresh every 15 seconds when market open
  - Return: quote, isLoading, error
  - Acceptance: Quote updates automatically

---

## 5. Toolbar

### 5.1 Symbol Search
- [x] **TASK-024**: Create SymbolSearch component
  - File: `components/Toolbar/SymbolSearch.tsx`
  - Autocomplete input with debounced search (300ms)
  - Display symbol + company name in dropdown
  - Select symbol updates Chart Context
  - Acceptance: Search works, selection updates chart

- [x] **TASK-025**: Create useDebounce hook
  - File: `hooks/useDebounce.ts`
  - Generic debounce hook with configurable delay
  - Acceptance: Value updates after delay

### 5.2 Chart Controls
- [x] **TASK-026**: Create ChartTypeSelect component
  - File: `components/Toolbar/ChartTypeSelect.tsx`
  - Dropdown with 7 chart types
  - Icons for each chart type
  - Updates Chart Context on selection
  - Acceptance: Chart type changes on selection

- [x] **TASK-027**: Create TimeRangeButtons component
  - File: `components/Toolbar/TimeRangeButtons.tsx`
  - Button group: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX
  - Active state styling for selected range
  - Updates Chart Context on click
  - Acceptance: Time range updates, active state visible

- [x] **TASK-028**: Create IntervalSelect component
  - File: `components/Toolbar/IntervalSelect.tsx`
  - Dropdown with intervals filtered by time range
  - Intraday intervals only for 1D-1M ranges
  - Updates Chart Context on selection
  - Acceptance: Valid intervals shown per time range

- [x] **TASK-029**: Create interval validation utility
  - File: `utils/intervals.ts`
  - Function: `getValidIntervals(timeRange)` - Filter intervals
  - Function: `getDefaultInterval(timeRange)` - Get default
  - Function: `getTimeRangeBounds(range)` - Get from/to timestamps
  - Acceptance: Correct intervals returned per range

### 5.3 Toolbar Container
- [x] **TASK-030**: Create Toolbar component
  - File: `components/Toolbar/Toolbar.tsx`
  - Layout: Symbol Search | Chart Type | Time Ranges | Interval
  - Responsive: Stack on mobile
  - Acceptance: All controls visible and functional

- [x] **TASK-031**: Create IndicatorsButton component
  - File: `components/Toolbar/IndicatorsButton.tsx`
  - Button that opens Indicators Panel
  - Badge showing count of active indicators
  - Acceptance: Opens panel, shows count

- [x] **TASK-032**: Create FullscreenButton component
  - File: `components/Toolbar/FullscreenButton.tsx`
  - Toggle fullscreen mode using Fullscreen API
  - Icon changes based on state
  - Acceptance: Fullscreen toggles correctly

---

## 6. Chart Core

### 6.1 Data Fetching
- [x] **TASK-033**: Create useStockData hook
  - File: `hooks/useStockData.ts`
  - Fetch candle data based on symbol, range, interval
  - Cache previous requests (simple in-memory cache)
  - Return: data, isLoading, error, refetch
  - Acceptance: Data fetches and caches correctly

### 6.2 Chart Container
- [x] **TASK-034**: Create Chart container component
  - File: `components/Chart/Chart.tsx`
  - Orchestrates ChartCanvas, VolumePane, IndicatorPanes
  - Manages layout and resizing
  - Handles loading and error states
  - Acceptance: Chart container renders sub-components

- [x] **TASK-035**: Create useChartResize hook
  - File: `hooks/useChartResize.ts`
  - Listen for container resize events
  - Return current width and height
  - Debounce resize events
  - Acceptance: Chart resizes with container

### 6.3 Main Chart Canvas
- [x] **TASK-036**: Create ChartCanvas component - Candlestick
  - File: `components/Chart/ChartCanvas.tsx`
  - Initialize Lightweight Charts instance
  - Render candlestick series from OHLCV data
  - Configure chart options (colors, grid, scale)
  - Acceptance: Candlestick chart renders

- [x] **TASK-037**: Implement Line chart type
  - Add line series rendering to ChartCanvas
  - Use close prices for line data
  - Acceptance: Line chart renders

- [x] **TASK-038**: Implement Bar (OHLC) chart type
  - Add bar series rendering to ChartCanvas
  - Acceptance: Bar chart renders

- [x] **TASK-039**: Implement Area chart type
  - Add area series rendering to ChartCanvas
  - Configure gradient fill
  - Acceptance: Area chart renders with gradient

- [x] **TASK-040**: Implement Hollow Candlestick chart type
  - Configure candlestick series for hollow style
  - Hollow when close > open, filled when close < open
  - Acceptance: Hollow candlesticks render correctly

- [x] **TASK-041**: Implement Heikin-Ashi chart type
  - Create utility: `calculateHeikinAshi(ohlcv)`
  - Transform data before rendering
  - Acceptance: Heikin-Ashi candles render

- [x] **TASK-042**: Implement Baseline chart type
  - Add baseline series rendering
  - Configure baseline value (default: first close)
  - Colors above/below baseline
  - Acceptance: Baseline chart renders

- [x] **TASK-043**: Implement chart type switching
  - Handle chartType changes from context
  - Remove old series, add new series
  - Maintain data and scale
  - Acceptance: Chart type switches smoothly

### 6.4 Volume Pane
- [x] **TASK-044**: Create VolumePane component
  - File: `components/Chart/VolumePane.tsx`
  - Histogram series below main chart
  - Color bars based on price direction (green up, red down)
  - Synchronized time scale with main chart
  - Acceptance: Volume bars render correctly

### 6.5 Interactive Features
- [x] **TASK-045**: Implement crosshair
  - Enable crosshair in chart options
  - Vertical and horizontal lines
  - Display date/time and price labels
  - Acceptance: Crosshair follows cursor

- [x] **TASK-046**: Create Legend component
  - File: `components/Chart/Legend.tsx`
  - Display OHLCV values for hovered bar
  - Update on crosshair move event
  - Format values appropriately
  - Acceptance: Legend shows current bar data

- [x] **TASK-047**: Implement mouse wheel zoom
  - Configure time scale for scroll zoom
  - Zoom centered on cursor position
  - Acceptance: Scroll zooms chart in/out

- [x] **TASK-048**: Implement pan/drag navigation
  - Enable drag-to-pan on time scale
  - Constrain to data boundaries
  - Acceptance: Chart pans left/right on drag

- [x] **TASK-049**: Implement double-click reset
  - Reset to fit all data on double-click
  - Acceptance: Double-click resets zoom/pan

- [x] **TASK-050**: Implement touch gestures
  - Pinch-to-zoom for mobile
  - Swipe-to-pan for mobile
  - Acceptance: Touch gestures work on mobile

---

## 7. Technical Indicators

### 7.1 Indicator Framework
- [x] **TASK-051**: Create indicator calculation interface
  - File: `components/Indicators/calculations/types.ts`
  - Interface: `IndicatorCalculation<Params, Output>`
  - Standard input: OHLCV array
  - Standard output: { time, value }[] or multi-series
  - Acceptance: Interface defined

- [x] **TASK-052**: Create useIndicator hook
  - File: `hooks/useIndicator.ts`
  - Calculate indicator values from OHLCV data
  - Memoize calculations
  - Recalculate on data or params change
  - Acceptance: Indicator values calculated

### 7.2 Overlay Indicators (on price chart)
- [x] **TASK-053**: Implement SMA (Simple Moving Average)
  - File: `components/Indicators/calculations/sma.ts`
  - Parameters: period (default: 20)
  - Formula: Sum of N closes / N
  - Acceptance: SMA line renders on chart

- [x] **TASK-054**: Implement EMA (Exponential Moving Average)
  - File: `components/Indicators/calculations/ema.ts`
  - Parameters: period (default: 20)
  - Formula: EMA = Close × k + EMA(prev) × (1-k), k = 2/(N+1)
  - Acceptance: EMA line renders on chart

- [x] **TASK-055**: Implement WMA (Weighted Moving Average)
  - File: `components/Indicators/calculations/wma.ts`
  - Parameters: period (default: 20)
  - Acceptance: WMA line renders on chart

- [x] **TASK-056**: Implement Bollinger Bands
  - File: `components/Indicators/calculations/bollingerBands.ts`
  - Parameters: period (20), stdDev (2)
  - Output: upper, middle (SMA), lower bands
  - Render as 3 lines with fill between
  - Acceptance: BB renders with bands

- [x] **TASK-057**: Implement DEMA (Double EMA)
  - File: `components/Indicators/calculations/dema.ts`
  - Parameters: period (default: 20)
  - Formula: 2 × EMA - EMA(EMA)
  - Acceptance: DEMA line renders

- [x] **TASK-058**: Implement TEMA (Triple EMA)
  - File: `components/Indicators/calculations/tema.ts`
  - Parameters: period (default: 20)
  - Formula: 3×EMA - 3×EMA(EMA) + EMA(EMA(EMA))
  - Acceptance: TEMA line renders

- [x] **TASK-059**: Implement VWAP
  - File: `components/Indicators/calculations/vwap.ts`
  - No parameters (session-based)
  - Formula: Cumulative(TypicalPrice × Volume) / Cumulative(Volume)
  - Acceptance: VWAP line renders

- [x] **TASK-060**: Implement Envelope
  - File: `components/Indicators/calculations/envelope.ts`
  - Parameters: period (20), percentage (2.5)
  - Upper = SMA × (1 + %) , Lower = SMA × (1 - %)
  - Acceptance: Envelope bands render

- [x] **TASK-061**: Implement Parabolic SAR
  - File: `components/Indicators/calculations/parabolicSar.ts`
  - Parameters: step (0.02), max (0.2)
  - Render as dots above/below price
  - Acceptance: SAR dots render

- [x] **TASK-062**: Implement Ichimoku Cloud
  - File: `components/Indicators/calculations/ichimoku.ts`
  - Parameters: tenkan (9), kijun (26), senkou (52)
  - Output: Tenkan-sen, Kijun-sen, Senkou Span A/B, Chikou Span
  - Render cloud with fill
  - Acceptance: Ichimoku cloud renders

### 7.3 Oscillator Indicators (separate panels)
- [x] **TASK-063**: Create IndicatorPane component
  - File: `components/Chart/IndicatorPane.tsx`
  - Separate chart instance for oscillators
  - Synchronized time scale with main chart
  - Configurable height with resize handle
  - Remove button (X)
  - Acceptance: Indicator pane renders below main chart

- [x] **TASK-064**: Implement RSI (Relative Strength Index)
  - File: `components/Indicators/calculations/rsi.ts`
  - Parameters: period (default: 14)
  - Range: 0-100, overbought (70), oversold (30) lines
  - Acceptance: RSI renders in separate pane

- [x] **TASK-065**: Implement MACD
  - File: `components/Indicators/calculations/macd.ts`
  - Parameters: fast (12), slow (26), signal (9)
  - Output: MACD line, signal line, histogram
  - Acceptance: MACD renders with histogram

- [x] **TASK-066**: Implement Stochastic Oscillator
  - File: `components/Indicators/calculations/stochastic.ts`
  - Parameters: %K (14), %D (3), smooth (3)
  - Range: 0-100, overbought/oversold lines
  - Acceptance: Stochastic renders with %K, %D

- [x] **TASK-067**: Implement Stochastic RSI
  - File: `components/Indicators/calculations/stochasticRsi.ts`
  - Parameters: rsiPeriod (14), stochPeriod (14)
  - Acceptance: StochRSI renders

- [x] **TASK-068**: Implement Williams %R
  - File: `components/Indicators/calculations/williamsR.ts`
  - Parameters: period (14)
  - Range: -100 to 0
  - Acceptance: Williams %R renders

- [x] **TASK-069**: Implement CCI (Commodity Channel Index)
  - File: `components/Indicators/calculations/cci.ts`
  - Parameters: period (20)
  - Acceptance: CCI renders

- [x] **TASK-070**: Implement ATR (Average True Range)
  - File: `components/Indicators/calculations/atr.ts`
  - Parameters: period (14)
  - Acceptance: ATR renders

- [x] **TASK-071**: Implement ADX (Average Directional Index)
  - File: `components/Indicators/calculations/adx.ts`
  - Parameters: period (14)
  - Output: ADX, +DI, -DI lines
  - Acceptance: ADX renders with DI lines

- [x] **TASK-072**: Implement ROC (Rate of Change)
  - File: `components/Indicators/calculations/roc.ts`
  - Parameters: period (12)
  - Acceptance: ROC renders

- [x] **TASK-073**: Implement Momentum
  - File: `components/Indicators/calculations/momentum.ts`
  - Parameters: period (10)
  - Acceptance: Momentum renders

- [x] **TASK-074**: Implement OBV (On-Balance Volume)
  - File: `components/Indicators/calculations/obv.ts`
  - No parameters
  - Acceptance: OBV renders

- [x] **TASK-075**: Implement CMF (Chaikin Money Flow)
  - File: `components/Indicators/calculations/cmf.ts`
  - Parameters: period (20)
  - Range: -1 to 1
  - Acceptance: CMF renders

- [x] **TASK-076**: Implement MFI (Money Flow Index)
  - File: `components/Indicators/calculations/mfi.ts`
  - Parameters: period (14)
  - Range: 0-100
  - Acceptance: MFI renders

- [x] **TASK-077**: Implement Aroon
  - File: `components/Indicators/calculations/aroon.ts`
  - Parameters: period (25)
  - Output: Aroon Up, Aroon Down
  - Acceptance: Aroon renders

- [x] **TASK-078**: Implement Awesome Oscillator
  - File: `components/Indicators/calculations/awesomeOscillator.ts`
  - Parameters: fast (5), slow (34)
  - Render as histogram
  - Acceptance: AO histogram renders

- [x] **TASK-079**: Create indicator calculations index
  - File: `components/Indicators/calculations/index.ts`
  - Export all calculation functions
  - Export indicator metadata (name, type, default params)
  - Acceptance: All indicators importable from index

### 7.4 Indicator UI
- [x] **TASK-080**: Create IndicatorsPanel component
  - File: `components/Indicators/IndicatorsPanel.tsx`
  - Searchable list of all indicators
  - Grouped by category (Trend, Momentum, Volume)
  - Click to add indicator
  - Acceptance: Panel shows all indicators, search works

- [x] **TASK-081**: Create IndicatorConfig component
  - File: `components/Indicators/IndicatorConfig.tsx`
  - Modal for editing indicator parameters
  - Input fields for each parameter
  - Color picker for indicator line
  - Save/Cancel buttons
  - Acceptance: Parameters editable and saved

- [x] **TASK-082**: Create ActiveIndicatorsList component
  - File: `components/Indicators/ActiveIndicatorsList.tsx`
  - List of currently active indicators
  - Settings icon to edit params
  - Toggle visibility
  - Remove button
  - Acceptance: Active indicators manageable

- [x] **TASK-083**: Implement resizable indicator panes
  - Drag handle between panes
  - Min/max height constraints
  - Cursor changes on hover
  - Acceptance: Panes resize by dragging

---

## 8. Responsive Design

### 8.1 Layout Adaptations
- [ ] **TASK-084**: Implement desktop layout (≥1024px)
  - Full toolbar visible
  - Side panel for indicators (optional)
  - Acceptance: Desktop layout renders correctly

- [ ] **TASK-085**: Implement tablet layout (768-1023px)
  - Collapsible toolbar sections
  - Modal for indicator panel
  - Acceptance: Tablet layout adapts

- [ ] **TASK-086**: Implement mobile layout (<768px)
  - Hamburger menu for controls
  - Bottom sheet for time ranges
  - Full-width chart
  - Acceptance: Mobile layout functional

- [ ] **TASK-087**: Implement responsive chart sizing
  - Chart fills available container width
  - Proper margins on all breakpoints
  - Acceptance: Chart responsive to viewport

---

## 9. Error Handling & Loading States

### 9.1 User Feedback
- [ ] **TASK-088**: Create error boundary component
  - File: `components/common/ErrorBoundary.tsx`
  - Catch React errors
  - Display friendly error message
  - Retry button
  - Acceptance: Errors caught and displayed

- [ ] **TASK-089**: Implement API error handling
  - Handle network errors
  - Handle rate limit errors (429)
  - Handle invalid symbol errors
  - Display user-friendly messages
  - Acceptance: All error types handled

- [ ] **TASK-090**: Create loading skeleton for chart
  - File: `components/Chart/ChartSkeleton.tsx`
  - Animated placeholder while loading
  - Acceptance: Skeleton displays during load

- [ ] **TASK-091**: Create empty state component
  - Display when no symbol selected
  - Prompt user to search for symbol
  - Acceptance: Empty state guides user

---

## 10. App Assembly

### 10.1 Main Application
- [ ] **TASK-092**: Create App component layout
  - File: `App.tsx`
  - Layout: QuoteHeader → Toolbar → Chart
  - Wrap with all context providers
  - Acceptance: Full app renders

- [ ] **TASK-093**: Set default symbol on load
  - Default to "AAPL" or last viewed symbol
  - Store last symbol in localStorage
  - Acceptance: App loads with default symbol

- [ ] **TASK-094**: Implement keyboard shortcuts
  - `+/-` for zoom
  - Arrow keys for pan
  - `R` for reset
  - `F` for fullscreen
  - Acceptance: Shortcuts work

---

# P1 - Should Have (Complete Experience)

## 11. Comparison Features

### 11.1 Multi-Symbol Comparison
- [ ] **TASK-095**: Create CompareButton component
  - File: `components/Toolbar/CompareButton.tsx`
  - Opens comparison symbol search
  - Shows count of active comparisons
  - Acceptance: Button opens comparison UI

- [ ] **TASK-096**: Create ComparisonSearch component
  - File: `components/Comparison/ComparisonSearch.tsx`
  - Search and select additional symbols
  - Maximum 5 comparisons
  - Auto-assign colors from palette
  - Acceptance: Symbols searchable and addable

- [ ] **TASK-097**: Implement comparison data fetching
  - Fetch data for all comparison symbols
  - Align time series to primary symbol
  - Acceptance: Comparison data loads

- [ ] **TASK-098**: Implement percentage mode
  - Normalize all series to percentage change from start
  - All series start at 0%
  - Y-axis shows percentage
  - Acceptance: Percentage normalization works

- [ ] **TASK-099**: Create ComparisonLegend component
  - File: `components/Comparison/ComparisonLegend.tsx`
  - Show all symbols with colors and current values
  - Toggle visibility per symbol
  - Remove symbol button
  - Acceptance: Legend controls comparisons

- [ ] **TASK-100**: Add quick-compare index options
  - Quick buttons: S&P 500, NASDAQ, DOW
  - Uses index symbols (^GSPC, ^IXIC, ^DJI)
  - Acceptance: Index comparisons work

---

## 12. Custom Date Range

### 12.1 Date Picker
- [ ] **TASK-101**: Create DatePicker component
  - File: `components/common/DatePicker.tsx`
  - Calendar UI for date selection
  - Accepts min/max date constraints
  - Acceptance: Date selectable via calendar

- [ ] **TASK-102**: Create DateRangePicker component
  - File: `components/Toolbar/DateRangePicker.tsx`
  - Start date and end date inputs
  - Validation: end > start, max 20 years
  - Apply button to fetch custom range
  - Acceptance: Custom date range fetches data

---

## 13. Quote Details Panel

### 13.1 Expanded Market Data
- [ ] **TASK-103**: Create QuoteDetails component
  - File: `components/QuoteHeader/QuoteDetails.tsx`
  - Collapsible panel with additional stats
  - Display: Previous Close, Day Range, 52-Week Range
  - Display: Volume, Avg Volume, Market Cap
  - Display: P/E, EPS, Dividend Yield, Beta
  - Acceptance: All data points display

- [ ] **TASK-104**: Fetch additional quote data
  - Add company metrics to API client
  - Merge with quote data
  - Acceptance: Additional metrics available

---

## 14. Events Overlay

### 14.1 Chart Events
- [ ] **TASK-105**: Implement earnings markers
  - Fetch earnings dates from API
  - Display "E" marker on chart at earnings dates
  - Tooltip shows earnings details on hover
  - Acceptance: Earnings markers visible

- [ ] **TASK-106**: Implement dividend markers
  - Fetch dividend dates from API
  - Display "D" marker on chart
  - Tooltip shows dividend amount
  - Acceptance: Dividend markers visible

- [ ] **TASK-107**: Implement split markers
  - Fetch split dates from API
  - Display "S" marker on chart
  - Tooltip shows split ratio
  - Acceptance: Split markers visible

- [ ] **TASK-108**: Create events toggle in settings
  - Toggle to show/hide event markers
  - Individual toggles per event type
  - Acceptance: Events toggleable

---

## 15. Settings Panel

### 15.1 Chart Settings
- [ ] **TASK-109**: Create SettingsPanel component
  - File: `components/Settings/SettingsPanel.tsx`
  - Accessible via gear icon in toolbar
  - Sections: Display, Colors, Data
  - Acceptance: Settings panel opens

- [ ] **TASK-110**: Implement scale type setting
  - Toggle: Linear / Logarithmic
  - Affects Y-axis scale
  - Acceptance: Scale type changes

- [ ] **TASK-111**: Implement extended hours setting
  - Toggle: Show pre-market / after-hours data
  - Fetch extended hours data when enabled
  - Acceptance: Extended hours toggleable

- [ ] **TASK-112**: Implement display toggles
  - Show/Hide Volume
  - Show/Hide Grid
  - Acceptance: Toggles work

- [ ] **TASK-113**: Implement color customization
  - Bullish color picker
  - Bearish color picker
  - Background color (chart area)
  - Acceptance: Colors customizable

- [ ] **TASK-114**: Implement theme toggle
  - Light / Dark mode switch
  - Updates all component colors
  - Persists to localStorage
  - Acceptance: Theme switches correctly

- [ ] **TASK-115**: Implement auto-refresh setting
  - Toggle: Enable/Disable auto-refresh
  - Interval selector: 5s, 15s, 30s, 60s
  - Acceptance: Auto-refresh configurable

---

## 16. Navigator

### 16.1 Mini Chart
- [ ] **TASK-116**: Create Navigator component
  - File: `components/Chart/Navigator.tsx`
  - Mini area chart showing full data range
  - Draggable viewport selector
  - Positioned below main chart
  - Acceptance: Navigator displays and controls zoom

---

# P2 - Nice to Have (Enhanced Features)

## 17. Export & Share

### 17.1 Export Features
- [ ] **TASK-117**: Implement PNG export
  - Capture chart as PNG image
  - Download with symbol and date in filename
  - Acceptance: PNG downloads correctly

- [ ] **TASK-118**: Implement CSV export
  - Export visible OHLCV data as CSV
  - Include header row
  - Acceptance: CSV downloads correctly

- [ ] **TASK-119**: Implement print functionality
  - Print-optimized styles
  - Browser print dialog
  - Acceptance: Chart prints correctly

- [ ] **TASK-120**: Implement share link
  - Generate URL with chart state (symbol, range, indicators)
  - Parse URL params on load
  - Acceptance: Shared link restores chart state

---

## 18. Additional Enhancements

### 18.1 Performance
- [ ] **TASK-121**: Implement data virtualization
  - Only render visible data points
  - Efficient handling of MAX range with 20+ years
  - Acceptance: Performance smooth with large datasets

- [ ] **TASK-122**: Implement request caching
  - Cache API responses in memory
  - Invalidate on symbol change
  - Acceptance: Repeat requests use cache

### 18.2 Accessibility
- [ ] **TASK-123**: Add ARIA labels
  - Label all interactive elements
  - Screen reader compatible
  - Acceptance: Screen reader can navigate

- [ ] **TASK-124**: Implement focus management
  - Visible focus indicators
  - Logical tab order
  - Acceptance: Keyboard navigation works

---

*Last Updated: January 12, 2026*
