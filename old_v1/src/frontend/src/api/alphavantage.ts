/**
 * Alpha Vantage API Client
 * Handles all API requests to Alpha Vantage with comprehensive error handling
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  AlphaVantageTimeSeriesResponse,
  AlphaVantageQuoteResponse,
  AlphaVantageSearchResponse,
  AlphaVantageOverviewResponse,
  OHLCV,
  Quote,
  CompanyProfile,
  SymbolSearchResult,
} from '../types';
import { transformAlphaVantageTimeSeries } from './transforms';
import { getAlphaVantageFunction, getAlphaVantageInterval, getTimeSeriesKey } from '../utils/intervals';

const API_BASE_URL = 'https://www.alphavantage.co/query';

// Rate limiting configuration (5 requests per minute for free tier)
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Request tracking for rate limiting
const requestTimestamps: number[] = [];

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

// Cache TTLs in milliseconds
const CACHE_TTL = {
  quote: 60 * 1000,         // 60 seconds for quotes
  intraday: 60 * 1000,      // 1 minute for intraday data
  daily: 60 * 60 * 1000,    // 1 hour for daily data
  weekly: 60 * 60 * 1000,   // 1 hour for weekly data
  monthly: 60 * 60 * 1000,  // 1 hour for monthly data
  search: 5 * 60 * 1000,    // 5 minutes for search results
  profile: 60 * 60 * 1000,  // 1 hour for company profiles
};

/**
 * Get cached data if available and not expired
 */
function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.data as T;
  }
  if (entry) {
    cache.delete(key);
  }
  return null;
}

/**
 * Set cache entry
 */
function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

/**
 * Check if we can make a request without hitting rate limit
 */
function canMakeRequest(): boolean {
  const now = Date.now();
  // Remove timestamps older than the rate limit window
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length < RATE_LIMIT_REQUESTS;
}

/**
 * Record a request timestamp for rate limiting
 */
function recordRequest(): void {
  requestTimestamps.push(Date.now());
}

/**
 * Wait until we can make a request (for throttling)
 */
async function waitForRateLimit(): Promise<void> {
  if (canMakeRequest()) {
    return;
  }
  
  const now = Date.now();
  const oldestRequest = requestTimestamps[0];
  const waitTime = RATE_LIMIT_WINDOW_MS - (now - oldestRequest) + 100; // Add 100ms buffer
  
  if (waitTime > 0) {
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

// Error types for user-friendly messages
export type ApiErrorType = 
  | 'network'
  | 'rate_limit'
  | 'invalid_symbol'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'server_error'
  | 'unknown';

export interface ApiError extends Error {
  type: ApiErrorType;
  statusCode?: number;
  retryAfter?: number;
}

// Create a custom API error
function createApiError(
  message: string,
  type: ApiErrorType,
  statusCode?: number,
  retryAfter?: number
): ApiError {
  const error = new Error(message) as ApiError;
  error.type = type;
  error.statusCode = statusCode;
  error.retryAfter = retryAfter;
  return error;
}

// Get user-friendly error message based on error type
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    switch (apiError.type) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case 'rate_limit':
        return 'API rate limit reached (5 requests/minute). Please wait a moment and try again.';
      case 'invalid_symbol':
        return 'Symbol not found. Please check the ticker and try again.';
      case 'unauthorized':
        return 'Invalid API key. Get a free key at alphavantage.co';
      case 'forbidden':
        return 'Access denied. Your API plan may not include this data.';
      case 'not_found':
        return 'The requested data was not found.';
      case 'server_error':
        return 'The server encountered an error. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

// Check for Alpha Vantage specific error responses
function checkAlphaVantageError(data: Record<string, unknown>): void {
  // Rate limit error
  if (data['Note'] && typeof data['Note'] === 'string' && data['Note'].includes('Thank you for using Alpha Vantage')) {
    throw createApiError('Rate limit exceeded', 'rate_limit', 429, 60);
  }
  
  // Invalid API key or other error message
  if (data['Error Message']) {
    const errorMsg = data['Error Message'] as string;
    if (errorMsg.toLowerCase().includes('invalid api key')) {
      throw createApiError('Invalid API key', 'unauthorized', 401);
    }
    if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('not found')) {
      throw createApiError('Invalid symbol', 'invalid_symbol', 404);
    }
    throw createApiError(errorMsg, 'unknown');
  }
}

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });

  // Request interceptor - add API key to all requests
  client.interceptors.request.use((config) => {
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.warn('VITE_ALPHA_VANTAGE_API_KEY is not set');
    }
    config.params = {
      ...config.params,
      apikey: apiKey,
    };
    return config;
  });

  // Response interceptor - comprehensive error handling
  client.interceptors.response.use(
    (response) => {
      // Check for Alpha Vantage error responses (they return 200 with error in body)
      if (response.data && typeof response.data === 'object') {
        checkAlphaVantageError(response.data);
      }
      return response;
    },
    (error: AxiosError) => {
      let apiError: ApiError;

      if (error.response) {
        const status = error.response.status;

        switch (status) {
          case 401:
            apiError = createApiError('Invalid API key', 'unauthorized', status);
            break;
          case 403:
            apiError = createApiError('Access forbidden', 'forbidden', status);
            break;
          case 404:
            apiError = createApiError('Resource not found', 'not_found', status);
            break;
          case 429:
            apiError = createApiError('Rate limit exceeded', 'rate_limit', status, 60);
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            apiError = createApiError('Server error', 'server_error', status);
            break;
          default:
            apiError = createApiError(`API Error: ${status}`, 'unknown', status);
        }
      } else if (error.request) {
        apiError = createApiError('Network error', 'network');
      } else {
        apiError = createApiError(error.message || 'Unknown error', 'unknown');
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

const apiClient = createApiClient();

/**
 * Fetch stock candle data (OHLCV) with caching and rate limiting
 */
export async function getStockCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<OHLCV[]> {
  const functionName = getAlphaVantageFunction(resolution);
  const timeSeriesKey = getTimeSeriesKey(resolution);
  
  // Determine output size based on time range (TASK-AV-019: Smart outputsize)
  const timeRangeSeconds = to - from;
  const ninetyDaysSeconds = 90 * 24 * 60 * 60;
  const outputsize = timeRangeSeconds <= ninetyDaysSeconds ? 'compact' : 'full';
  
  // Create cache key
  const cacheKey = `candles:${symbol}:${resolution}:${outputsize}`;
  
  // Check cache first
  const cached = getCached<OHLCV[]>(cacheKey);
  if (cached) {
    // Filter cached data within the requested time range
    return cached.filter(candle => candle.time >= from && candle.time <= to);
  }
  
  // Wait for rate limit if needed (TASK-AV-016: Request throttling)
  await waitForRateLimit();
  
  const params: Record<string, string> = {
    function: functionName,
    symbol: symbol.toUpperCase(),
    outputsize,
  };
  
  // Add interval parameter for intraday
  if (functionName === 'TIME_SERIES_INTRADAY') {
    params.interval = getAlphaVantageInterval(resolution);
  }

  // Record request for rate limiting
  recordRequest();
  
  const response = await apiClient.get<AlphaVantageTimeSeriesResponse>('', { params });
  
  // Check if we have valid data
  const timeSeriesData = response.data[timeSeriesKey as keyof AlphaVantageTimeSeriesResponse];
  if (!timeSeriesData || typeof timeSeriesData !== 'object') {
    return [];
  }

  // Transform and filter by date range
  const allData = transformAlphaVantageTimeSeries(
    timeSeriesData as Record<string, { '1. open': string; '2. high': string; '3. low': string; '4. close': string; '5. volume': string }>,
    resolution
  );
  
  // Cache the data (TASK-AV-017: Response caching)
  const ttl = ['1', '5', '15', '30', '60'].includes(resolution) 
    ? CACHE_TTL.intraday 
    : resolution === 'W' 
      ? CACHE_TTL.weekly 
      : resolution === 'M' 
        ? CACHE_TTL.monthly 
        : CACHE_TTL.daily;
  setCache(cacheKey, allData, ttl);
  
  // Filter data within the requested time range
  return allData.filter(candle => candle.time >= from && candle.time <= to);
}

/**
 * Fetch real-time quote with caching and rate limiting
 */
export async function getQuote(symbol: string): Promise<Quote> {
  const cacheKey = `quote:${symbol.toUpperCase()}`;
  
  // Check cache first
  const cached = getCached<Quote>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Wait for rate limit if needed
  await waitForRateLimit();
  recordRequest();
  
  const response = await apiClient.get<AlphaVantageQuoteResponse>('', {
    params: {
      function: 'GLOBAL_QUOTE',
      symbol: symbol.toUpperCase(),
    },
  });

  const data = response.data['Global Quote'];
  
  if (!data || !data['05. price']) {
    throw createApiError('Symbol not found', 'invalid_symbol', 404);
  }

  // Parse change percent (remove % sign)
  const changePercentStr = data['10. change percent'] || '0%';
  const changePercent = parseFloat(changePercentStr.replace('%', ''));

  const quote: Quote = {
    symbol: data['01. symbol'] || symbol.toUpperCase(),
    price: parseFloat(data['05. price']) || 0,
    change: parseFloat(data['09. change']) || 0,
    changePercent: changePercent,
    high: parseFloat(data['03. high']) || 0,
    low: parseFloat(data['04. low']) || 0,
    open: parseFloat(data['02. open']) || 0,
    previousClose: parseFloat(data['08. previous close']) || 0,
    timestamp: new Date(data['07. latest trading day']).getTime() / 1000,
  };
  
  // Cache the quote
  setCache(cacheKey, quote, CACHE_TTL.quote);
  
  return quote;
}

/**
 * Search for symbols with caching and rate limiting
 */
export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  if (!query || query.length < 1) {
    return [];
  }
  
  const normalizedQuery = query.trim().toUpperCase();
  const cacheKey = `search:${normalizedQuery}`;
  
  // Check cache first
  const cached = getCached<SymbolSearchResult[]>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Wait for rate limit if needed
  await waitForRateLimit();
  recordRequest();

  const response = await apiClient.get<AlphaVantageSearchResponse>('', {
    params: {
      function: 'SYMBOL_SEARCH',
      keywords: query,
    },
  });

  const matches = response.data.bestMatches;
  if (!matches || !Array.isArray(matches)) {
    return [];
  }

  // Filter to US equities and map to our interface
  const results = matches
    .filter(item => item['4. region'] === 'United States')
    .map((item) => ({
      symbol: item['1. symbol'],
      description: item['2. name'],
      type: item['3. type'],
      displaySymbol: item['1. symbol'],
    }));
  
  // Cache search results for 5 minutes (search results don't change often)
  setCache(cacheKey, results, 5 * 60 * 1000);
  
  return results;
}

/**
 * Fetch company profile with caching and rate limiting
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const cacheKey = `profile:${symbol.toUpperCase()}`;
  
  // Check cache first - profiles don't change often
  const cached = getCached<CompanyProfile>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Wait for rate limit if needed
  await waitForRateLimit();
  recordRequest();
  
  const response = await apiClient.get<AlphaVantageOverviewResponse>('', {
    params: {
      function: 'OVERVIEW',
      symbol: symbol.toUpperCase(),
    },
  });

  const data = response.data;
  
  if (!data || !data.Symbol) {
    throw createApiError('Symbol not found', 'invalid_symbol', 404);
  }

  const profile: CompanyProfile = {
    symbol: data.Symbol,
    name: data.Name || symbol,
    industry: data.Industry,
    sector: data.Sector,
    country: data.Country,
    exchange: data.Exchange,
    marketCap: data.MarketCapitalization ? parseFloat(data.MarketCapitalization) : undefined,
    currency: data.Currency,
    // Alpha Vantage doesn't provide logo URLs
    logo: undefined,
    weburl: undefined,
  };
  
  // Cache profile for 1 hour (company info doesn't change often)
  setCache(cacheKey, profile, 60 * 60 * 1000);
  
  return profile;
}

export { apiClient };
