# FinanceViz - Alpha Vantage Migration Task List

**Project:** Stock Chart Application - API Migration  
**Created:** January 13, 2026  
**Status:** Complete (P0 + P1 + P2 Core)  
**Reason:** Finnhub free tier does not include OHLC/candle data for US stocks (403 Forbidden)

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
| **P0** | Critical - Blocking app functionality | Immediate |
| **P1** | Important - Complete API feature parity | Day 1-2 |
| **P2** | Enhancement - Improved error handling & optimization | Day 3+ |

---

## Overview

This migration replaces the Finnhub API with Alpha Vantage API for stock market data. Alpha Vantage provides:
- ✅ **CORS-enabled** - Works directly from browser (no backend needed)
- ✅ Free API key with 25 requests/day (standard) or 500/day (premium free)
- ✅ Historical OHLCV data (20+ years)
- ✅ Real-time quotes
- ✅ Symbol search
- ✅ Company overview

**API Key:** `PEXJZJLUFOB7CY06` (validated and working)

---

## API Endpoint Mapping

| Feature | Finnhub | Alpha Vantage |
|---------|---------|---------------|
| Daily Candles | `/stock/candle` | `TIME_SERIES_DAILY` |
| Intraday Candles | `/stock/candle` | `TIME_SERIES_INTRADAY` |
| Weekly Candles | `/stock/candle` | `TIME_SERIES_WEEKLY` |
| Monthly Candles | `/stock/candle` | `TIME_SERIES_MONTHLY` |
| Quote | `/quote` | `GLOBAL_QUOTE` |
| Search | `/search` | `SYMBOL_SEARCH` |
| Profile | `/stock/profile2` | `OVERVIEW` |

---

# P0 - Critical (Restore Core Functionality)

## 1. Dependencies & Configuration

### 1.1 Update Environment Configuration
- [x] **TASK-AV-001**: Update environment variables
  - File: `.env`
  - Replace `VITE_FINNHUB_API_KEY` with `VITE_ALPHA_VANTAGE_API_KEY`
  - Value: `PEXJZJLUFOB7CY06`
  - Acceptance: Environment variable accessible in app

- [x] **TASK-AV-002**: Update .env.example template
  - File: `.env.example`
  - Update to reference Alpha Vantage API key
  - Add comment with signup URL: https://www.alphavantage.co/support/#api-key
  - Acceptance: Template reflects new API

---

## 2. Type Definitions

### 2.1 Add Alpha Vantage Types
- [x] **TASK-AV-003**: Create Alpha Vantage response types
  - File: `types/stock.ts`
  - Add types for Alpha Vantage API responses:
    ```typescript
    interface AlphaVantageQuoteResponse {
      'Global Quote': {
        '01. symbol': string;
        '02. open': string;
        '03. high': string;
        '04. low': string;
        '05. price': string;
        '06. volume': string;
        '07. latest trading day': string;
        '08. previous close': string;
        '09. change': string;
        '10. change percent': string;
      };
    }
    
    interface AlphaVantageTimeSeriesResponse {
      'Meta Data': {
        '1. Information': string;
        '2. Symbol': string;
        '3. Last Refreshed': string;
        '4. Output Size'?: string;
        '5. Time Zone': string;
      };
      'Time Series (Daily)'?: Record<string, AlphaVantageOHLCV>;
      'Time Series (5min)'?: Record<string, AlphaVantageOHLCV>;
      // ... other time series
    }
    
    interface AlphaVantageOHLCV {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    }
    
    interface AlphaVantageSearchResponse {
      bestMatches: Array<{
        '1. symbol': string;
        '2. name': string;
        '3. type': string;
        '4. region': string;
        '8. currency': string;
        '9. matchScore': string;
      }>;
    }
    
    interface AlphaVantageOverviewResponse {
      Symbol: string;
      Name: string;
      Description: string;
      Exchange: string;
      Currency: string;
      Country: string;
      Sector: string;
      Industry: string;
      MarketCapitalization: string;
      PERatio: string;
      DividendYield: string;
      // ... additional fields
    }
    ```
  - Keep existing Finnhub types (remove in cleanup phase)
  - Acceptance: TypeScript types available for Alpha Vantage responses

---

## 3. API Client Migration

### 3.1 Create Alpha Vantage API Client
- [x] **TASK-AV-004**: Create Alpha Vantage API client
  - File: `api/alphavantage.ts` (new file)
  - Base URL: `https://www.alphavantage.co/query`
  - Configure axios instance with API key parameter
  - Implement request/response interceptors
  - Reuse existing error handling patterns
  - Acceptance: API client makes authenticated requests

- [x] **TASK-AV-005**: Implement error handling for Alpha Vantage
  - Handle Alpha Vantage specific errors:
    - Rate limit: `{ "Note": "Thank you for using Alpha Vantage!..." }` → `rate_limit`
    - Invalid API key: `{ "Error Message": "...invalid API key..." }` → `unauthorized`
    - Invalid symbol: Empty or missing data → `invalid_symbol`
  - Map to existing `ApiErrorType` enum
  - Acceptance: All error types handled gracefully

### 3.2 Implement Alpha Vantage Endpoints
- [x] **TASK-AV-006**: Implement stock candle endpoint - Daily
  - Function: `getStockCandles(symbol, resolution, from, to)`
  - Use `TIME_SERIES_DAILY` for daily resolution
  - Parameters:
    - `function=TIME_SERIES_DAILY`
    - `symbol=AAPL`
    - `outputsize=full` (for 20+ years) or `compact` (last 100 days)
    - `apikey=YOUR_API_KEY`
  - Transform response to existing OHLCV format
  - Filter by from/to timestamps
  - Acceptance: Returns OHLCV[] matching existing interface

- [x] **TASK-AV-007**: Implement stock candle endpoint - Intraday
  - Use `TIME_SERIES_INTRADAY` for intraday resolutions
  - Parameters:
    - `function=TIME_SERIES_INTRADAY`
    - `symbol=AAPL`
    - `interval=5min` (1min, 5min, 15min, 30min, 60min)
    - `outputsize=full`
    - `apikey=YOUR_API_KEY`
  - Map app intervals to Alpha Vantage intervals:
    - `1` → `1min`, `5` → `5min`, `15` → `15min`, `30` → `30min`, `60` → `60min`
  - Acceptance: Intraday data returns correctly

- [x] **TASK-AV-008**: Implement stock candle endpoint - Weekly/Monthly
  - Use `TIME_SERIES_WEEKLY` for weekly resolution
  - Use `TIME_SERIES_MONTHLY` for monthly resolution
  - Acceptance: Weekly/Monthly data returns correctly

- [x] **TASK-AV-009**: Implement quote endpoint
  - Function: `getQuote(symbol)`
  - Use `GLOBAL_QUOTE` function
  - Parameters:
    - `function=GLOBAL_QUOTE`
    - `symbol=AAPL`
    - `apikey=YOUR_API_KEY`
  - Map response to existing Quote interface:
    - `'05. price'` → `price` (parse to number)
    - `'09. change'` → `change` (parse to number)
    - `'10. change percent'` → `changePercent` (parse, remove %)
    - `'03. high'` → `high`
    - `'04. low'` → `low`
    - `'02. open'` → `open`
    - `'08. previous close'` → `previousClose`
  - Acceptance: Returns Quote object matching existing interface

- [x] **TASK-AV-010**: Implement symbol search endpoint
  - Function: `searchSymbols(query)`
  - Use `SYMBOL_SEARCH` function
  - Parameters:
    - `function=SYMBOL_SEARCH`
    - `keywords=apple`
    - `apikey=YOUR_API_KEY`
  - Map response to existing SymbolSearchResult interface:
    - `'1. symbol'` → `symbol`
    - `'2. name'` → `description`
    - `'3. type'` → `type`
  - Filter to US equities (region = "United States")
  - Acceptance: Returns SymbolSearchResult[] for autocomplete

- [x] **TASK-AV-011**: Implement company profile endpoint
  - Function: `getCompanyProfile(symbol)`
  - Use `OVERVIEW` function
  - Parameters:
    - `function=OVERVIEW`
    - `symbol=AAPL`
    - `apikey=YOUR_API_KEY`
  - Map response to existing CompanyProfile interface:
    - `Symbol` → `symbol`
    - `Name` → `name`
    - `Industry` → `industry`
    - `Sector` → `sector`
    - `Country` → `country`
    - `Exchange` → `exchange`
    - `MarketCapitalization` → `marketCap` (parse to number)
    - `Currency` → `currency`
  - Note: Alpha Vantage doesn't provide logo URLs
  - Acceptance: Returns CompanyProfile object

---

## 4. Data Transformation

### 4.1 Update Transform Utilities
- [x] **TASK-AV-012**: Create Alpha Vantage response transformer
  - File: `api/transforms.ts`
  - Function: `transformAlphaVantageTimeSeries(response, timeSeriesKey)` → OHLCV[]
  - Handle the date-keyed object format:
    ```typescript
    // Alpha Vantage format (object with date keys)
    {
      "2026-01-12": { "1. open": "259.16", ... },
      "2026-01-09": { "1. open": "259.07", ... }
    }
    // Transform to OHLCV[] array
    [
      { time: 1736640000, open: 259.16, high: ..., low: ..., close: ..., volume: ... },
      ...
    ]
    ```
  - Parse string values to numbers
  - Convert date strings to UNIX timestamps
  - Sort by time ascending
  - Acceptance: Correctly transforms Alpha Vantage response to OHLCV[]

- [x] **TASK-AV-013**: Update interval mapping utility
  - File: `utils/intervals.ts`
  - Function: `getAlphaVantageFunction(interval)` - Get API function name
    - Intraday intervals → `TIME_SERIES_INTRADAY`
    - `D` → `TIME_SERIES_DAILY`
    - `W` → `TIME_SERIES_WEEKLY`
    - `M` → `TIME_SERIES_MONTHLY`
  - Function: `getAlphaVantageInterval(interval)` - Get interval param for intraday
    - `1` → `1min`, `5` → `5min`, `15` → `15min`, `30` → `30min`, `60` → `60min`
  - Function: `getTimeSeriesKey(interval)` - Get response object key
    - `1` → `Time Series (1min)`
    - `5` → `Time Series (5min)`
    - `D` → `Time Series (Daily)`
    - etc.
  - Acceptance: Correct Alpha Vantage parameters generated

---

## 5. API Index Update

### 5.1 Update Exports
- [x] **TASK-AV-014**: Update API index exports
  - File: `api/index.ts`
  - Replace Finnhub exports with Alpha Vantage exports
  - Maintain same function signatures for compatibility:
    - `getStockCandles(symbol, resolution, from, to)`
    - `getQuote(symbol)`
    - `searchSymbols(query)`
    - `getCompanyProfile(symbol)`
    - `getErrorMessage(error)`
  - Acceptance: Existing imports continue to work without changes

---

# P1 - Important (Feature Parity & Polish)

## 6. Rate Limiting & Caching

### 6.1 Handle Rate Limits
- [x] **TASK-AV-015**: Implement rate limit detection
  - Alpha Vantage returns a "Note" field when rate limited
  - Detect and throw appropriate error
  - Display user-friendly message about waiting
  - Acceptance: Rate limit errors handled gracefully

- [x] **TASK-AV-016**: Implement client-side request throttling
  - Limit to 5 requests per minute (free tier safe)
  - Queue requests if limit approached
  - Show "Loading..." indicator while queued
  - Acceptance: Requests throttled to avoid rate limits

### 6.2 Caching
- [x] **TASK-AV-017**: Implement response caching
  - Cache quote data for 60 seconds
  - Cache daily/weekly/monthly data for 1 hour
  - Cache intraday data for 1 minute
  - Use in-memory cache (Map or simple object)
  - Acceptance: Repeated requests use cache

---

## 7. Error Messages & UX

### 7.1 Update Error Messages
- [x] **TASK-AV-018**: Update error messages for Alpha Vantage context
  - File: `api/alphavantage.ts`
  - Update `getErrorMessage()` function:
    - `rate_limit`: "API rate limit reached (5 requests/minute). Please wait and try again."
    - `unauthorized`: "Invalid API key. Get a free key at alphavantage.co"
    - `invalid_symbol`: "Symbol not found. Please check the ticker and try again."
  - Remove Finnhub-specific messaging
  - Acceptance: User-friendly error messages

---

## 8. Outputsize Optimization

### 8.1 Smart Data Fetching
- [x] **TASK-AV-019**: Implement smart outputsize selection
  - Use `outputsize=compact` (100 data points) for short ranges (<=90 days)
  - Use `outputsize=full` for longer ranges (1Y, 5Y, MAX)
  - Reduces response size and improves performance
  - Acceptance: Appropriate outputsize used per time range

---

# P2 - Enhancement (Cleanup & Optimization)

## 9. Cleanup

### 9.1 Remove Finnhub Code
- [x] **TASK-AV-020**: Remove Finnhub API client
  - Delete `api/finnhub.ts`
  - Remove Finnhub-specific types from `types/stock.ts`
  - Update all imports if any direct references remain
  - Acceptance: No Finnhub references remain

- [x] **TASK-AV-021**: Clean up environment files
  - Remove old Finnhub API key from `.env`
  - Ensure `.env.example` only references Alpha Vantage
  - Acceptance: Clean environment configuration

---

## 10. Documentation

### 10.1 Update Documentation
- [ ] **TASK-AV-022**: Update README
  - Document Alpha Vantage API requirements
  - Add instructions for getting free API key
  - Document rate limits (5 req/min free tier)
  - Acceptance: README reflects new API

---

## 11. Testing

### 11.1 API Testing
- [ ] **TASK-AV-023**: Test all API endpoints
  - Test `getStockCandles()` with various symbols and ranges
  - Test `getQuote()` for real-time data
  - Test `searchSymbols()` for autocomplete
  - Test `getCompanyProfile()` for company data
  - Test all time intervals (1min, 5min, 15min, 30min, 60min, D, W, M)
  - Acceptance: All endpoints return expected data

- [ ] **TASK-AV-024**: Test error scenarios
  - Test invalid symbol handling
  - Test rate limit handling
  - Test network error handling
  - Acceptance: Errors handled gracefully

- [ ] **TASK-AV-025**: Test chart rendering with new data
  - Verify candlestick chart renders
  - Verify all chart types work
  - Verify indicators calculate correctly
  - Verify volume pane works
  - Acceptance: Full chart functionality preserved

---

## Quick Reference: Alpha Vantage API

### Base URL
```
https://www.alphavantage.co/query
```

### Common Parameters
| Parameter | Description |
|-----------|-------------|
| `function` | API function name (TIME_SERIES_DAILY, GLOBAL_QUOTE, etc.) |
| `symbol` | Stock ticker symbol (AAPL, MSFT, etc.) |
| `apikey` | Your API key |
| `outputsize` | `compact` (100 points) or `full` (20+ years) |
| `interval` | For intraday: 1min, 5min, 15min, 30min, 60min |

### Rate Limits
| Tier | Limit |
|------|-------|
| Free | 5 requests/minute, 500 requests/day |
| Premium | Higher limits (paid) |

### Example Requests
```
# Daily data
https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=PEXJZJLUFOB7CY06

# Quote
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=PEXJZJLUFOB7CY06

# Search
https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=apple&apikey=PEXJZJLUFOB7CY06

# Intraday (5 min)
https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=AAPL&interval=5min&apikey=PEXJZJLUFOB7CY06
```

---

## Architecture: No Backend Required! 🎉

Unlike Yahoo Finance, Alpha Vantage supports CORS, so the frontend can call the API directly:

```
[Browser] ──────→ [Alpha Vantage API]
     ↑                    ↓
     └────── JSON ────────┘
```

This simplifies the architecture significantly - no proxy server needed.

---

*Last Updated: January 13, 2026*
