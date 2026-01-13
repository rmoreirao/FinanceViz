/**
 * Stock data type definitions
 */

// OHLCV (Open, High, Low, Close, Volume) candle data
export interface OHLCV {
  time: number; // UNIX timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Real-time quote data
export interface Quote {
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

// Extended quote with additional market data
export interface ExtendedQuote extends Quote {
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume?: number;
  dividendYield?: number;
  beta?: number;
}

// Company profile information
export interface CompanyProfile {
  symbol: string;
  name: string;
  logo?: string;
  industry?: string;
  sector?: string;
  country?: string;
  exchange?: string;
  marketCap?: number;
  currency?: string;
  weburl?: string;
}

// Symbol search result
export interface SymbolSearchResult {
  symbol: string;
  description: string;
  type: string;
  displaySymbol?: string;
}

// Comparison symbol for overlay
export interface ComparisonSymbol {
  symbol: string;
  color: string;
  visible: boolean;
  data?: OHLCV[];
}

// Market event (earnings, dividends, splits)
export interface MarketEvent {
  type: 'earnings' | 'dividend' | 'split';
  date: number;
  symbol: string;
  data?: {
    actual?: number;
    estimate?: number;
    amount?: number;
    ratio?: string;
  };
}

// Alpha Vantage API response types
export interface AlphaVantageOHLCV {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface AlphaVantageQuoteResponse {
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
  'Note'?: string;
  'Error Message'?: string;
}

export interface AlphaVantageTimeSeriesMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Interval'?: string;
  '4. Output Size'?: string;
  '5. Time Zone': string;
}

export interface AlphaVantageTimeSeriesResponse {
  'Meta Data'?: AlphaVantageTimeSeriesMetaData;
  'Time Series (Daily)'?: Record<string, AlphaVantageOHLCV>;
  'Time Series (1min)'?: Record<string, AlphaVantageOHLCV>;
  'Time Series (5min)'?: Record<string, AlphaVantageOHLCV>;
  'Time Series (15min)'?: Record<string, AlphaVantageOHLCV>;
  'Time Series (30min)'?: Record<string, AlphaVantageOHLCV>;
  'Time Series (60min)'?: Record<string, AlphaVantageOHLCV>;
  'Weekly Time Series'?: Record<string, AlphaVantageOHLCV>;
  'Monthly Time Series'?: Record<string, AlphaVantageOHLCV>;
  'Note'?: string;
  'Error Message'?: string;
}

export interface AlphaVantageSearchMatch {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

export interface AlphaVantageSearchResponse {
  bestMatches?: AlphaVantageSearchMatch[];
  'Note'?: string;
  'Error Message'?: string;
}

export interface AlphaVantageOverviewResponse {
  Symbol?: string;
  Name?: string;
  Description?: string;
  Exchange?: string;
  Currency?: string;
  Country?: string;
  Sector?: string;
  Industry?: string;
  MarketCapitalization?: string;
  PERatio?: string;
  DividendYield?: string;
  EPS?: string;
  Beta?: string;
  '52WeekHigh'?: string;
  '52WeekLow'?: string;
  'Note'?: string;
  'Error Message'?: string;
}
