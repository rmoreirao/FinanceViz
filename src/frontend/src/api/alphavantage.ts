/**
 * Alpha Vantage API Client
 * Handles all API calls to Alpha Vantage
 * 
 * TASK-088: Alpha Vantage API Client Setup
 * TASK-002-002: API Key Validation Service
 * TASK-002-005: Integrate API Key Context with Alpha Vantage Client
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
  validationTimeout: 5000, // 5 seconds timeout for validation
};

/**
 * Module-level API key resolver function
 * Set by ApiKeyContext to provide dynamic key resolution
 */
let apiKeyResolver: (() => string | null) | null = null;

/**
 * Set the API key resolver function
 * Called by ApiKeyContext to enable dynamic key lookup
 */
export function setApiKeyResolver(resolver: () => string | null): void {
  apiKeyResolver = resolver;
}

/**
 * Get API key with fallback chain: resolver → env → error
 */
function getApiKey(): string {
  // Try resolver first (set by context)
  if (apiKeyResolver) {
    const key = apiKeyResolver();
    if (key) {
      return key;
    }
  }

  // Fall back to environment variable
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
  if (apiKey) {
    return apiKey;
  }

  throw createAPIError(
    'INVALID_API_KEY',
    'Alpha Vantage API key not configured. Please configure your API key in settings.'
  );
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
 */
function buildUrl(options: AlphaVantageRequestOptions): string {
  const apiKey = getApiKey();
  const params = new URLSearchParams({
    function: options.function,
    apikey: apiKey,
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
 */
async function makeRequest<T>(options: AlphaVantageRequestOptions): Promise<T> {
  const url = buildUrl(options);

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
 */
export async function fetchIntradayTimeSeries(
  symbol: string,
  interval: IntradayInterval,
  outputsize: 'compact' | 'full' = 'compact'
): Promise<AVIntradayResponse> {
  return makeRequest<AVIntradayResponse>({
    function: 'TIME_SERIES_INTRADAY',
    symbol,
    interval,
    outputsize,
  });
}

/**
 * Fetch daily time series data
 */
export async function fetchDailyTimeSeries(
  symbol: string,
  outputsize: 'compact' | 'full' = 'compact'
): Promise<AVDailyResponse> {
  return makeRequest<AVDailyResponse>({
    function: 'TIME_SERIES_DAILY',
    symbol,
    outputsize,
  });
}

/**
 * Fetch weekly time series data
 */
export async function fetchWeeklyTimeSeries(
  symbol: string
): Promise<AVWeeklyResponse> {
  return makeRequest<AVWeeklyResponse>({
    function: 'TIME_SERIES_WEEKLY',
    symbol,
  });
}

/**
 * Fetch monthly time series data
 */
export async function fetchMonthlyTimeSeries(
  symbol: string
): Promise<AVMonthlyResponse> {
  return makeRequest<AVMonthlyResponse>({
    function: 'TIME_SERIES_MONTHLY',
    symbol,
  });
}

/**
 * Search for symbols
 */
export async function searchSymbolsAPI(
  keywords: string
): Promise<AVSymbolSearchResponse> {
  return makeRequest<AVSymbolSearchResponse>({
    function: 'SYMBOL_SEARCH',
    keywords,
  });
}

/**
 * Fetch global quote (real-time price data)
 */
export async function fetchGlobalQuote(
  symbol: string
): Promise<AVGlobalQuoteResponse> {
  return makeRequest<AVGlobalQuoteResponse>({
    function: 'GLOBAL_QUOTE',
    symbol,
  });
}

/**
 * Export API error utilities
 */
export { createAPIError, isErrorResponse };
export type { APIError };

/**
 * API Key validation result
 */
export interface ApiKeyValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an API key by making a test request to Alpha Vantage
 * Uses GLOBAL_QUOTE endpoint with IBM as a reliable test symbol
 * 
 * TASK-002-002: API Key Validation Service
 * 
 * @param apiKey - The API key to validate
 * @returns Validation result with valid flag and optional error message
 */
export async function validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  const trimmedKey = apiKey.trim();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.validationTimeout);

  try {
    const params = new URLSearchParams({
      function: 'GLOBAL_QUOTE',
      symbol: 'IBM',
      apikey: trimmedKey,
    });

    const response = await fetch(`${API_CONFIG.baseUrl}?${params.toString()}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { valid: false, error: `Network error: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();

    // Check for error responses
    if (data['Error Message']) {
      const errorMsg = data['Error Message'] as string;
      if (errorMsg.toLowerCase().includes('apikey') || errorMsg.toLowerCase().includes('invalid')) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: false, error: errorMsg };
    }

    if (data['Note']) {
      // Rate limit message - key might be valid but rate limited
      return { valid: false, error: 'Rate limit exceeded. Please wait before testing again.' };
    }

    if (data['Information']) {
      // Demo key or rate limit info
      const info = data['Information'] as string;
      if (info.toLowerCase().includes('premium') || info.toLowerCase().includes('rate')) {
        return { valid: false, error: 'Rate limit exceeded. Please wait before testing again.' };
      }
      return { valid: false, error: info };
    }

    // Check for valid response structure
    if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
      return { valid: true };
    }

    // Empty response could indicate invalid key or symbol issue
    if (data['Global Quote'] && Object.keys(data['Global Quote']).length === 0) {
      // This can happen with valid keys when market data is unavailable
      // Consider it valid since we got a proper response structure
      return { valid: true };
    }

    return { valid: false, error: 'Unexpected response from API' };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { valid: false, error: 'Request timed out. Please try again.' };
      }
      return { valid: false, error: `Network error: ${error.message}` };
    }

    return { valid: false, error: 'An unknown error occurred' };
  }
}
