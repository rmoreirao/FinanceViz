# FinanceViz - Stock Chart Application Specification

## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** January 12, 2026  
**Author:** Product Owner  
**Status:** Draft  

---

## 1. Executive Summary

### 1.1 Product Vision
FinanceViz is a web-based interactive stock charting application that replicates the core functionality of Yahoo Finance's full-screen chart experience. The application enables users to analyze stock price movements, apply technical indicators, compare multiple securities, and interact with financial data through an intuitive interface.

### 1.2 Goals
- Deliver a responsive, performant stock charting experience
- Support multiple chart types and 15+ technical indicators
- Enable real-time and historical data visualization
- Provide comparison tools for multiple securities
- Ensure mobile-responsive design

### 1.3 Out of Scope
- Drawing tools and annotations (trend lines, Fibonacci, shapes, text)
- User authentication and account management
- Portfolio tracking and watchlists
- Premium/paid features
- Options chain data

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend Framework** | React 18 + TypeScript | Industry standard, strong typing, component reusability |
| **Build Tool** | Vite | Fast development, optimized builds |
| **Charting Library** | Lightweight Charts (TradingView) | Purpose-built for financial charts, MIT license, excellent performance |
| **Styling** | TailwindCSS | Rapid UI development, consistent design system |
| **State Management** | React Context + useReducer | Simple, no external dependencies, sufficient for app complexity |
| **HTTP Client** | Axios | Promise-based, interceptors, error handling |
| **Data Source** | Finnhub API (primary) | Free tier with real-time US stocks, WebSocket support |
| **Date Handling** | date-fns | Lightweight, tree-shakeable |
| **Icons** | Lucide React | Modern, lightweight icon set |

---

## 3. Feature Requirements

### 3.1 Priority Levels
- **P0 (Must Have):** Core functionality required for MVP
- **P1 (Should Have):** Important features for complete experience
- **P2 (Nice to Have):** Enhanced features for future iterations

---

### 3.2 Chart Display Features

#### 3.2.1 Chart Types (P0)

| ID | Chart Type | Description |
|----|------------|-------------|
| CT-01 | Candlestick | Japanese candlestick with OHLC, colored bodies (green/red) |
| CT-02 | Line | Simple line connecting closing prices |
| CT-03 | Bar (OHLC) | Traditional OHLC bar representation |
| CT-04 | Area | Line chart with gradient fill below |
| CT-05 | Hollow Candlestick | Hollow/filled based on close vs open |
| CT-06 | Heikin-Ashi | Smoothed candlestick variation |
| CT-07 | Baseline | Price relative to configurable baseline |

**Acceptance Criteria:**
- User can switch between chart types via dropdown
- Chart re-renders smoothly without data refetch
- Volume bars maintain synchronization with price chart
- Default chart type: Candlestick

---

#### 3.2.2 Time Ranges (P0)

| ID | Range | Data Points | Default Interval |
|----|-------|-------------|------------------|
| TR-01 | 1D | Intraday | 5 minutes |
| TR-02 | 5D | 5 trading days | 15 minutes |
| TR-03 | 1M | 1 month | 30 minutes |
| TR-04 | 6M | 6 months | Daily |
| TR-05 | YTD | Year-to-date | Daily |
| TR-06 | 1Y | 1 year | Daily |
| TR-07 | 5Y | 5 years | Weekly |
| TR-08 | MAX | All available | Weekly/Monthly |

**Acceptance Criteria:**
- Time range buttons displayed in toolbar
- Active range visually highlighted
- Data fetched/aggregated appropriately for each range
- Smooth transition between ranges

---

#### 3.2.3 Time Intervals (P0)

| Category | Intervals |
|----------|-----------|
| Intraday | 1min, 5min, 15min, 30min, 60min |
| Daily+ | Daily, Weekly, Monthly |

**Acceptance Criteria:**
- Interval dropdown shows valid options based on selected time range
- Intraday intervals only available for 1D-1M ranges
- Chart updates on interval change

---

#### 3.2.4 Custom Date Range (P1)

| ID | Feature | Description |
|----|---------|-------------|
| DR-01 | Date Picker | Calendar component for start/end date selection |
| DR-02 | Validation | End date must be after start date, max 20 years |
| DR-03 | Quick Apply | Apply button to fetch custom range data |

---

### 3.3 Technical Indicators

#### 3.3.1 Overlay Indicators (P0)

Indicators rendered directly on the price chart:

| ID | Indicator | Parameters | Default |
|----|-----------|------------|---------|
| OV-01 | Simple Moving Average (SMA) | Period | 20 |
| OV-02 | Exponential Moving Average (EMA) | Period | 20 |
| OV-03 | Weighted Moving Average (WMA) | Period | 20 |
| OV-04 | Bollinger Bands | Period, StdDev | 20, 2 |
| OV-05 | Double EMA (DEMA) | Period | 20 |
| OV-06 | Triple EMA (TEMA) | Period | 20 |
| OV-07 | VWAP | None | - |
| OV-08 | Envelope | Period, Percentage | 20, 2.5% |
| OV-09 | Parabolic SAR | Step, Max | 0.02, 0.2 |
| OV-10 | Ichimoku Cloud | Tenkan, Kijun, Senkou | 9, 26, 52 |

---

#### 3.3.2 Oscillator Indicators (P0)

Indicators rendered in separate panels below the main chart:

| ID | Indicator | Parameters | Default | Range |
|----|-----------|------------|---------|-------|
| OS-01 | RSI | Period | 14 | 0-100 |
| OS-02 | MACD | Fast, Slow, Signal | 12, 26, 9 | Dynamic |
| OS-03 | Stochastic | %K, %D, Smooth | 14, 3, 3 | 0-100 |
| OS-04 | Stochastic RSI | RSI Period, Stoch Period | 14, 14 | 0-100 |
| OS-05 | Williams %R | Period | 14 | -100 to 0 |
| OS-06 | CCI | Period | 20 | Dynamic |
| OS-07 | ATR | Period | 14 | Dynamic |
| OS-08 | ADX | Period | 14 | 0-100 |
| OS-09 | ROC | Period | 12 | Dynamic |
| OS-10 | Momentum | Period | 10 | Dynamic |
| OS-11 | OBV | None | - | Dynamic |
| OS-12 | CMF | Period | 20 | -1 to 1 |
| OS-13 | MFI | Period | 14 | 0-100 |
| OS-14 | Aroon | Period | 25 | 0-100 |
| OS-15 | Awesome Oscillator | Fast, Slow | 5, 34 | Dynamic |

**Acceptance Criteria:**
- Indicators accessible via searchable dropdown menu
- Multiple indicators can be added simultaneously
- Each indicator panel is resizable (drag handle)
- Indicator can be removed via X button
- Indicator parameters editable via settings gear icon
- Indicator values displayed in legend on hover

---

### 3.4 Comparison Features (P1)

| ID | Feature | Description |
|----|---------|-------------|
| CP-01 | Add Comparison | Search and add symbols to overlay |
| CP-02 | Percentage Mode | Normalize all series to percentage change from start |
| CP-03 | Color Assignment | Auto-assign distinct colors to each symbol |
| CP-04 | Legend Display | Show all symbols with current values |
| CP-05 | Remove Symbol | Click X on legend to remove comparison |
| CP-06 | Compare to Index | Quick-add S&P 500, NASDAQ, DOW |

**Acceptance Criteria:**
- Maximum 5 comparison symbols
- Comparison mode automatically switches to percentage display
- All series start from 0% at left edge
- Each symbol has unique color with legend

---

### 3.5 Interactive Features (P0)

| ID | Feature | Description |
|----|---------|-------------|
| IN-01 | Crosshair | Vertical + horizontal lines following cursor |
| IN-02 | Tooltip | OHLCV data displayed on hover |
| IN-03 | Mouse Wheel Zoom | Scroll to zoom in/out on time axis |
| IN-04 | Pan/Drag | Click and drag to pan chart horizontally |
| IN-05 | Double-click Reset | Reset zoom to default view |
| IN-06 | Touch Gestures | Pinch-to-zoom, swipe-to-pan on mobile |
| IN-07 | Navigator | Mini-chart below for quick navigation |
| IN-08 | Auto-scroll | New data appears on right edge (live mode) |

**Acceptance Criteria:**
- Crosshair displays date/time and price at intersection
- Tooltip updates in real-time with cursor movement
- Zoom maintains cursor position as anchor point
- Pan respects data boundaries (no scroll past data)
- All interactions work on touch devices

---

### 3.6 Data Display (P0)

#### 3.6.1 Price Header

| Element | Description |
|---------|-------------|
| Symbol | Ticker symbol (e.g., AAPL) |
| Company Name | Full company name |
| Current Price | Large, prominent display |
| Change | Absolute change from previous close |
| Change % | Percentage change |
| Color Coding | Green (positive), Red (negative) |

#### 3.6.2 Chart Legend

| Element | Description |
|---------|-------------|
| OHLC Values | Open, High, Low, Close for hovered bar |
| Volume | Formatted volume (e.g., 1.2M) |
| Indicator Values | Current values for all active indicators |

#### 3.6.3 Quote Details Panel (P1)

| Data Point | Description |
|------------|-------------|
| Previous Close | Prior trading day close |
| Day Range | Intraday high - low |
| 52-Week Range | Annual high - low |
| Volume | Current day volume |
| Avg Volume | 3-month average |
| Market Cap | Total market capitalization |
| P/E Ratio | Price-to-Earnings |
| EPS | Earnings Per Share |
| Dividend Yield | Annual dividend % |
| Beta | Volatility vs market |

---

### 3.7 Events Overlay (P1)

| ID | Event Type | Display |
|----|------------|---------|
| EV-01 | Earnings | "E" marker on chart |
| EV-02 | Dividends | "D" marker on chart |
| EV-03 | Stock Splits | "S" marker on chart |

**Acceptance Criteria:**
- Events toggleable via settings
- Hover on marker shows event details
- Click on marker shows popup with full information

---

### 3.8 UI Components

#### 3.8.1 Toolbar (P0)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [🔍 Symbol Search] │ Chart Type ▼ │ 1D 5D 1M 6M YTD 1Y 5Y MAX │ Interval ▼ │
│ [Compare] [Indicators] [Settings ⚙️] [Fullscreen ⛶]                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.8.2 Indicators Panel (P0)

```
┌──────────────────────────────┐
│ 🔍 Search Indicators...      │
├──────────────────────────────┤
│ ▶ Trend (Overlay)            │
│   ├ SMA                      │
│   ├ EMA                      │
│   ├ Bollinger Bands          │
│   └ ...                      │
│ ▶ Momentum (Oscillator)      │
│   ├ RSI                      │
│   ├ MACD                     │
│   └ ...                      │
│ ▶ Volume                     │
│   ├ OBV                      │
│   └ ...                      │
└──────────────────────────────┘
```

#### 3.8.3 Settings Panel (P1)

| Setting | Options |
|---------|---------|
| Scale Type | Linear / Logarithmic |
| Show Extended Hours | On / Off |
| Show Volume | On / Off |
| Show Grid | On / Off |
| Theme | Light / Dark |
| Bullish Color | Color picker (default: #22c55e) |
| Bearish Color | Color picker (default: #ef4444) |
| Auto-refresh | On / Off |
| Refresh Interval | 5s, 15s, 30s, 60s |

---

### 3.9 Export & Share (P2)

| ID | Feature | Description |
|----|---------|-------------|
| EX-01 | Download PNG | Export chart as PNG image |
| EX-02 | Download CSV | Export visible data as CSV |
| EX-03 | Copy Link | Generate shareable URL with chart state |
| EX-04 | Print | Browser print dialog |

---

### 3.10 Responsive Design (P0)

| Breakpoint | Layout |
|------------|--------|
| Desktop (≥1024px) | Full toolbar, side panel for indicators |
| Tablet (768-1023px) | Collapsible toolbar, modal for indicators |
| Mobile (<768px) | Hamburger menu, bottom sheet for controls |

---

## 4. Technical Architecture

### 4.1 Project Structure

```
src/
├── api/
│   ├── finnhub.ts           # Finnhub API client
│   ├── types.ts             # API response types
│   └── transforms.ts        # Data transformation utilities
│
├── components/
│   ├── Chart/
│   │   ├── Chart.tsx        # Main chart container
│   │   ├── ChartCanvas.tsx  # Lightweight Charts wrapper
│   │   ├── VolumePane.tsx   # Volume sub-chart
│   │   ├── IndicatorPane.tsx# Oscillator indicator panes
│   │   └── Legend.tsx       # Dynamic OHLCV legend
│   │
│   ├── Toolbar/
│   │   ├── Toolbar.tsx      # Main toolbar container
│   │   ├── SymbolSearch.tsx # Autocomplete symbol search
│   │   ├── ChartTypeSelect.tsx
│   │   ├── TimeRangeButtons.tsx
│   │   ├── IntervalSelect.tsx
│   │   ├── CompareButton.tsx
│   │   └── IndicatorsButton.tsx
│   │
│   ├── Indicators/
│   │   ├── IndicatorsPanel.tsx  # Indicator selection panel
│   │   ├── IndicatorConfig.tsx  # Parameter configuration modal
│   │   └── calculations/        # Indicator calculation functions
│   │       ├── sma.ts
│   │       ├── ema.ts
│   │       ├── rsi.ts
│   │       ├── macd.ts
│   │       ├── bollingerBands.ts
│   │       └── index.ts
│   │
│   ├── QuoteHeader/
│   │   ├── QuoteHeader.tsx  # Price display header
│   │   └── QuoteDetails.tsx # Expanded quote info
│   │
│   ├── Settings/
│   │   ├── SettingsPanel.tsx
│   │   └── ThemeToggle.tsx
│   │
│   └── common/
│       ├── Button.tsx
│       ├── Dropdown.tsx
│       ├── Modal.tsx
│       ├── DatePicker.tsx
│       └── Spinner.tsx
│
├── context/
│   ├── ChartContext.tsx     # Chart state (symbol, range, interval, type)
│   ├── IndicatorContext.tsx # Active indicators and configs
│   └── ThemeContext.tsx     # Light/dark theme
│
├── hooks/
│   ├── useStockData.ts      # Fetch and cache stock data
│   ├── useQuote.ts          # Real-time quote updates
│   ├── useIndicator.ts      # Calculate indicator values
│   ├── useChartResize.ts    # Responsive chart sizing
│   └── useDebounce.ts       # Debounce utility
│
├── utils/
│   ├── formatters.ts        # Number, date, currency formatting
│   ├── colors.ts            # Color palette utilities
│   ├── intervals.ts         # Time range/interval mappings
│   └── constants.ts         # App-wide constants
│
├── types/
│   ├── chart.ts             # Chart-related types
│   ├── indicators.ts        # Indicator types
│   └── stock.ts             # Stock data types
│
├── App.tsx
├── main.tsx
└── index.css                # Tailwind imports
```

---

### 4.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERACTION                                │
│        (Select symbol, change range, add indicator, pan/zoom)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CHART CONTEXT                                   │
│    { symbol, timeRange, interval, chartType, comparisons[], settings }      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
         ┌──────────────────────────┐   ┌──────────────────────────┐
         │      useStockData        │   │    useIndicator          │
         │   (API fetch + cache)    │   │  (Calculate from OHLCV)  │
         └──────────────────────────┘   └──────────────────────────┘
                        │                           │
                        └─────────────┬─────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CHART COMPONENTS                                    │
│   ChartCanvas (Price) + VolumePane + IndicatorPane[] + Legend + Crosshair   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3 State Shape

```typescript
// ChartContext State
interface ChartState {
  symbol: string;
  companyName: string;
  timeRange: '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';
  interval: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';
  chartType: 'candlestick' | 'line' | 'bar' | 'area' | 'hollowCandle' | 'heikinAshi' | 'baseline';
  comparisons: ComparisonSymbol[];
  isLoading: boolean;
  error: string | null;
}

interface ComparisonSymbol {
  symbol: string;
  color: string;
  visible: boolean;
}

// IndicatorContext State
interface IndicatorState {
  overlays: OverlayIndicator[];
  oscillators: OscillatorIndicator[];
}

interface OverlayIndicator {
  id: string;
  type: 'SMA' | 'EMA' | 'BB' | 'VWAP' | ...;
  params: Record<string, number>;
  color: string;
  visible: boolean;
}

interface OscillatorIndicator {
  id: string;
  type: 'RSI' | 'MACD' | 'STOCH' | ...;
  params: Record<string, number>;
  height: number; // Panel height in pixels
  visible: boolean;
}
```

---

### 4.4 API Integration

#### 4.4.1 Finnhub API Endpoints

| Endpoint | Purpose | Rate Limit |
|----------|---------|------------|
| `GET /stock/candle` | Historical OHLCV data | 60/min |
| `GET /quote` | Real-time quote | 60/min |
| `GET /search` | Symbol search/autocomplete | 60/min |
| `GET /stock/profile2` | Company profile | 60/min |
| `WebSocket` | Real-time price updates | Unlimited |

#### 4.4.2 Data Models

```typescript
// API Response (Finnhub candle)
interface CandleResponse {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  t: number[];  // Timestamps (UNIX)
  v: number[];  // Volume
  s: 'ok' | 'no_data';
}

// Transformed for chart
interface OHLCV {
  time: number;     // UNIX timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Quote data
interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1-2)

| Task | Description | Priority |
|------|-------------|----------|
| Project Setup | Vite + React + TS + Tailwind | P0 |
| API Client | Finnhub integration with error handling | P0 |
| Basic Chart | Candlestick chart with Lightweight Charts | P0 |
| Symbol Search | Autocomplete with debounce | P0 |
| Quote Header | Price display with change | P0 |

**Deliverable:** Searchable stock chart with candlestick display

---

### Phase 2: Core Features (Week 3-4)

| Task | Description | Priority |
|------|-------------|----------|
| Chart Types | All 7 chart type implementations | P0 |
| Time Ranges | 8 preset ranges with data fetching | P0 |
| Intervals | Interval selector with validation | P0 |
| Volume Pane | Synchronized volume bars | P0 |
| Crosshair/Tooltip | Interactive hover with OHLCV display | P0 |
| Zoom/Pan | Mouse and touch navigation | P0 |

**Deliverable:** Fully interactive chart with all time controls

---

### Phase 3: Indicators (Week 5-6)

| Task | Description | Priority |
|------|-------------|----------|
| Indicator Framework | Extensible calculation engine | P0 |
| Overlay Indicators | SMA, EMA, BB, VWAP, SAR | P0 |
| Oscillator Indicators | RSI, MACD, Stochastic, ATR | P0 |
| Indicator Panel UI | Searchable menu, add/remove | P0 |
| Parameter Config | Editable indicator settings | P0 |
| Resizable Panes | Drag-to-resize indicator panels | P0 |

**Deliverable:** 15+ working indicators with configuration

---

### Phase 4: Advanced Features (Week 7-8)

| Task | Description | Priority |
|------|-------------|----------|
| Symbol Comparison | Multi-symbol overlay | P1 |
| Percentage Mode | Normalized comparison view | P1 |
| Custom Date Range | Date picker component | P1 |
| Quote Details | Expanded market data panel | P1 |
| Events Overlay | Earnings, dividends, splits markers | P1 |
| Settings Panel | Theme, colors, preferences | P1 |

**Deliverable:** Complete feature set matching Yahoo Finance

---

### Phase 5: Polish (Week 9-10)

| Task | Description | Priority |
|------|-------------|----------|
| Responsive Design | Mobile/tablet layouts | P0 |
| Performance | Virtualization, lazy loading | P1 |
| Error Handling | User-friendly error states | P0 |
| Loading States | Skeletons, spinners | P1 |
| Export Features | PNG, CSV download | P2 |
| Accessibility | Keyboard nav, ARIA labels | P1 |
| Documentation | README, inline comments | P1 |

**Deliverable:** Production-ready application

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric | Target |
|--------|--------|
| Initial Load | < 2 seconds |
| Chart Render | < 500ms for 10,000 data points |
| Interaction Response | < 100ms for pan/zoom |
| Memory Usage | < 150MB for complex charts |

### 6.2 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |

### 6.3 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigable controls
- Screen reader compatible legends
- Color contrast ratio ≥ 4.5:1

---

## 7. Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit Tests | Vitest | Indicator calculations: 100% |
| Component Tests | React Testing Library | UI components: 80% |
| E2E Tests | Playwright | Critical user flows: 100% |
| Visual Regression | Chromatic | Chart renders |

---

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| API Rate Limits | High | Implement caching, request batching |
| Data Accuracy | High | Validate against multiple sources |
| Performance with Large Data | Medium | Virtual scrolling, data windowing |
| Mobile Touch Complexity | Medium | Extensive touch device testing |
| Third-party Library Updates | Low | Pin versions, monitor releases |

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Chart Load Time | < 2s P95 |
| User Error Rate | < 1% |
| Feature Parity | 90% of Yahoo Finance core features |
| Mobile Usability | 100% functionality on mobile |
| Code Coverage | > 80% |

---

## 10. Appendix

### 10.1 Finnhub API Key Setup

1. Register at https://finnhub.io/
2. Obtain free API key (60 calls/minute)
3. Store in `.env` as `VITE_FINNHUB_API_KEY`

### 10.2 Color Palette

```css
/* Bullish/Bearish */
--bullish: #22c55e;  /* Green */
--bearish: #ef4444;  /* Red */

/* Chart Background */
--bg-light: #ffffff;
--bg-dark: #1a1a2e;

/* Grid */
--grid-light: #e5e7eb;
--grid-dark: #374151;

/* Comparison Colors */
--compare-1: #3b82f6;  /* Blue */
--compare-2: #f59e0b;  /* Amber */
--compare-3: #8b5cf6;  /* Purple */
--compare-4: #ec4899;  /* Pink */
--compare-5: #06b6d4;  /* Cyan */
```

### 10.3 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `+` / `-` | Zoom in/out |
| `←` / `→` | Pan left/right |
| `Home` | Go to oldest data |
| `End` | Go to newest data |
| `Esc` | Close modal/panel |
| `F` | Toggle fullscreen |
| `R` | Reset zoom |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-12 | Product Owner | Initial specification |
