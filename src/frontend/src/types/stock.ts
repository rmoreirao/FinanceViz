/**
 * Stock Data Types
 * Core interfaces for stock market data
 */

/**
 * OHLCV (Open, High, Low, Close, Volume) data point
 * Represents a single candlestick/bar in a chart
 */
export interface OHLCV {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Stock quote information
 * Real-time or delayed price data for a symbol
 */
export interface Quote {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume?: number;
  timestamp: number;
}

/**
 * Symbol search result
 * Used in autocomplete/search functionality
 */
export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: 'Stock' | 'ETF' | 'Index' | 'Crypto';
  exchange: string;
  currency: string;
}

/**
 * Stock data response from API
 */
export interface StockDataResponse {
  symbol: string;
  data: OHLCV[];
  interval: string;
  timeRange: string;
}

/**
 * Supported stock symbols for mock data
 */
export type SupportedSymbol = 'AAPL' | 'MSFT' | 'GOOGL' | 'AMZN' | 'TSLA';

/**
 * Company info mapping
 */
export interface CompanyInfo {
  symbol: SupportedSymbol;
  name: string;
  exchange: string;
  sector: string;
  basePrice: number;
  volatility: number;
}
