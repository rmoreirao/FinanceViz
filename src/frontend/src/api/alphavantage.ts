/**
 * Alpha Vantage API Client
 * Handles all API calls to Alpha Vantage
 * 
 * TASK-088: Alpha Vantage API Client Setup
 */

import type {
  AlphaVantageRequestOptions,
  AVIntradayResponse,
  AVDailyResponse,
  AVWeeklyResponse,
  AVMonthlyResponse,
  AVSymbolSearchResponse,
  AVGlobalQuoteResponse,
  AVErrorResponse,
  IntradayInterval,
  APIError,
  APIErrorType,
} from './types';

/**
 * Alpha Vantage API configuration
 */
const API_CONFIG = {
  baseUrl: 'https://www.alphavantage.co/query',
  rateLimit: 5, // calls per minute for free tier
};

/**
 * Get API key from environment variable or provided key
 * @param providedKey - Optional API key to use instead of environment variable
 */
function getApiKey(providedKey?: string): string {
  // Use provided key if available
  if (providedKey) {
    return providedKey;
  }

  // Fallback to environment variable
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw createAPIError(
      'INVALID_API_KEY',
      'Alpha Vantage API key not configured. Please set your API key in settings.'
    );
  }
  return apiKey;
}

/**
 * Create a standardized API error
 */
function createAPIError(type: APIErrorType, message: string, retryAfter?: number): APIError {
  return { type, message, retryAfter };
}

/**
 * Parse error response from Alpha Vantage
 */
function parseErrorResponse(response: AVErrorResponse): APIError {
  if (response['Note']) {
    // Rate limit message
    return createAPIError(
      'RATE_LIMIT',
      'API rate limit reached. Please wait before making more requests.',
      60 // Retry after 60 seconds
    );
  }
  if (response['Error Message']) {
    const errorMsg = response['Error Message'];
    if (errorMsg.includes('Invalid API call')) {
      return createAPIError('INVALID_SYMBOL', 'Invalid symbol or API parameters.');
    }
    if (errorMsg.includes('apikey')) {
      return createAPIError('INVALID_API_KEY', 'Invalid API key.');
    }
    return createAPIError('UNKNOWN_ERROR', errorMsg);
  }
  if (response['Information']) {
    // Usually rate limit or demo key message
    return createAPIError('RATE_LIMIT', response['Information'], 60);
  }
  return createAPIError('UNKNOWN_ERROR', 'An unknown error occurred.');
}

/**
 * Check if response is an error
 */
function isErrorResponse(response: unknown): response is AVErrorResponse {
  const resp = response as AVErrorResponse;
  return !!(resp['Error Message'] || resp['Note'] || resp['Information']);
}

/**
 * Build URL with query parameters
 * @param options - Request options
 * @param apiKey - Optional API key to use
 */
function buildUrl(options: AlphaVantageRequestOptions, apiKey?: string): string {
  const key = getApiKey(apiKey);
  const params = new URLSearchParams({
    function: options.function,
    apikey: key,
  });

  if (options.symbol) {
    params.set('symbol', options.symbol);
  }
  if (options.interval) {
    params.set('interval', options.interval);
  }
  if (options.outputsize) {
    params.set('outputsize', options.outputsize);
  }
  if (options.keywords) {
    params.set('keywords', options.keywords);
  }

  return `${API_CONFIG.baseUrl}?${params.toString()}`;
}

/**
 * Make API request to Alpha Vantage
 * @param options - Request options
 * @param apiKey - Optional API key to use
 */
async function makeRequest<T>(options: AlphaVantageRequestOptions, apiKey?: string): Promise<T> {
  const url = buildUrl(options, apiKey);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw createAPIError(
        'NETWORK_ERROR',
        `HTTP error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Check for API error responses
    if (isErrorResponse(data)) {
      throw parseErrorResponse(data);
    }

    return data as T;
  } catch (error) {
    if ((error as APIError).type) {
      throw error;
    }
    throw createAPIError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

/**
 * Fetch intraday time series data
 * @param apiKey - Optional API key to use instead of environment variable
 */
export async function fetchIntradayTimeSeries(
  symbol: string,
  interval: IntradayInterval,
  outputsize: 'compact' | 'full' = 'compact',
  apiKey?: string
): Promise<AVIntradayResponse> {
  return makeRequest<AVIntradayResponse>({
    function: 'TIME_SERIES_INTRADAY',
    symbol,
    interval,
    outputsize,
  }, apiKey);
}

/**
 * Fetch daily time series data
 * @param apiKey - Optional API key to use instead of environment variable
 */
export async function fetchDailyTimeSeries(
  symbol: string,
  outputsize: 'compact' | 'full' = 'compact',
  apiKey?: string
): Promise<AVDailyResponse> {
  return makeRequest<AVDailyResponse>({
    function: 'TIME_SERIES_DAILY',
    symbol,
    outputsize,
  }, apiKey);
}

/**
 * Fetch weekly time series data
 * @param apiKey - Optional API key to use instead of environment variable
 */
export async function fetchWeeklyTimeSeries(
  symbol: string,
  apiKey?: string
): Promise<AVWeeklyResponse> {
  return makeRequest<AVWeeklyResponse>({
    function: 'TIME_SERIES_WEEKLY',
    symbol,
  }, apiKey);
}

/**
 * Fetch monthly time series data
 * @param apiKey - Optional API key to use instead of environment variable
 */
export async function fetchMonthlyTimeSeries(
  symbol: string,
  apiKey?: string
): Promise<AVMonthlyResponse> {
  return makeRequest<AVMonthlyResponse>({
    function: 'TIME_SERIES_MONTHLY',
    symbol,
  }, apiKey);
}

/**
 * Search for symbols
 * @param apiKey - Optional API key to use instead of environment variable
 */
export async function searchSymbolsAPI(
  keywords: string,
  apiKey?: string
): Promise<AVSymbolSearchResponse> {
  return makeRequest<AVSymbolSearchResponse>({
    function: 'SYMBOL_SEARCH',
    keywords,
  }, apiKey);
}

/**
 * Fetch global quote (real-time price data)
 * @param apiKey - Optional API key to use instead of environment variable
 */
export async function fetchGlobalQuote(
  symbol: string,
  apiKey?: string
): Promise<AVGlobalQuoteResponse> {
  return makeRequest<AVGlobalQuoteResponse>({
    function: 'GLOBAL_QUOTE',
    symbol,
  }, apiKey);
}

/**
 * Export API error utilities
 */
export { createAPIError, isErrorResponse };
export type { APIError };
