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

// API response types
export interface FinnhubCandleResponse {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  t: number[]; // Timestamps
  v: number[]; // Volume
  s: 'ok' | 'no_data';
}

export interface FinnhubQuoteResponse {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export interface FinnhubSearchResponse {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

export interface FinnhubProfileResponse {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}
