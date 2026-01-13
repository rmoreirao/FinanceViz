/**
 * Alpha Vantage API Types
 * Type definitions for Alpha Vantage API responses
 * 
 * TASK-088: Alpha Vantage API Client Setup
 */

/**
 * Alpha Vantage API function types
 */
export type AlphaVantageFunction =
  | 'TIME_SERIES_INTRADAY'
  | 'TIME_SERIES_DAILY'
  | 'TIME_SERIES_WEEKLY'
  | 'TIME_SERIES_MONTHLY'
  | 'SYMBOL_SEARCH'
  | 'GLOBAL_QUOTE';

/**
 * Intraday interval options
 */
export type IntradayInterval = '1min' | '5min' | '15min' | '30min' | '60min';

/**
 * Common metadata structure for time series responses
 */
export interface TimeSeriesMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Interval'?: string;
  '4. Output Size'?: string;
  '5. Output Size'?: string;
  '4. Time Zone'?: string;
  '5. Time Zone'?: string;
  '6. Time Zone'?: string;
}

/**
 * Individual time series data point from Alpha Vantage
 */
export interface AVTimeSeriesDataPoint {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

/**
 * Intraday time series response
 */
export interface AVIntradayResponse {
  'Meta Data': TimeSeriesMetaData;
  'Time Series (1min)'?: Record<string, AVTimeSeriesDataPoint>;
  'Time Series (5min)'?: Record<string, AVTimeSeriesDataPoint>;
  'Time Series (15min)'?: Record<string, AVTimeSeriesDataPoint>;
  'Time Series (30min)'?: Record<string, AVTimeSeriesDataPoint>;
  'Time Series (60min)'?: Record<string, AVTimeSeriesDataPoint>;
}

/**
 * Daily time series response
 */
export interface AVDailyResponse {
  'Meta Data': TimeSeriesMetaData;
  'Time Series (Daily)': Record<string, AVTimeSeriesDataPoint>;
}

/**
 * Weekly time series response
 */
export interface AVWeeklyResponse {
  'Meta Data': TimeSeriesMetaData;
  'Weekly Time Series': Record<string, AVTimeSeriesDataPoint>;
}

/**
 * Monthly time series response
 */
export interface AVMonthlyResponse {
  'Meta Data': TimeSeriesMetaData;
  'Monthly Time Series': Record<string, AVTimeSeriesDataPoint>;
}

/**
 * Union type for all time series responses
 */
export type AVTimeSeriesResponse =
  | AVIntradayResponse
  | AVDailyResponse
  | AVWeeklyResponse
  | AVMonthlyResponse;

/**
 * Symbol search match result
 */
export interface AVSymbolSearchMatch {
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

/**
 * Symbol search response
 */
export interface AVSymbolSearchResponse {
  bestMatches: AVSymbolSearchMatch[];
}

/**
 * Global quote data
 */
export interface AVGlobalQuoteData {
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
}

/**
 * Global quote response
 */
export interface AVGlobalQuoteResponse {
  'Global Quote': AVGlobalQuoteData;
}

/**
 * Error response from Alpha Vantage
 */
export interface AVErrorResponse {
  'Error Message'?: string;
  'Note'?: string; // Rate limit message
  'Information'?: string;
}

/**
 * API request options
 */
export interface AlphaVantageRequestOptions {
  function: AlphaVantageFunction;
  symbol?: string;
  interval?: IntradayInterval;
  outputsize?: 'compact' | 'full';
  keywords?: string;
}

/**
 * API configuration
 */
export interface AlphaVantageConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit: number; // calls per minute
}

/**
 * API error types
 */
export type APIErrorType = 
  | 'RATE_LIMIT'
  | 'INVALID_API_KEY'
  | 'INVALID_SYMBOL'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Custom API error
 */
export interface APIError {
  type: APIErrorType;
  message: string;
  retryAfter?: number; // seconds until retry
}
