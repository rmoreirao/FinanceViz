/**
 * Finnhub API Client
 * Handles all API requests to Finnhub.io with comprehensive error handling
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  FinnhubCandleResponse,
  FinnhubQuoteResponse,
  FinnhubSearchResponse,
  FinnhubProfileResponse,
  OHLCV,
  Quote,
  CompanyProfile,
  SymbolSearchResult,
} from '../types';
import { transformCandleResponse } from './transforms';

const API_BASE_URL = 'https://finnhub.io/api/v1';

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
        return `API rate limit exceeded. Please wait ${apiError.retryAfter || 60} seconds before trying again.`;
      case 'invalid_symbol':
        return 'Invalid stock symbol. Please check the symbol and try again.';
      case 'unauthorized':
        return 'API authentication failed. Please check your API key configuration.';
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

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // Request interceptor - add API key to all requests
  client.interceptors.request.use((config) => {
    const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
    if (!apiKey) {
      console.warn('VITE_FINNHUB_API_KEY is not set');
    }
    config.params = {
      ...config.params,
      token: apiKey,
    };
    return config;
  });

  // Response interceptor - comprehensive error handling (TASK-089)
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      let apiError: ApiError;

      if (error.response) {
        const status = error.response.status;
        const retryAfter = error.response.headers['retry-after']
          ? parseInt(error.response.headers['retry-after'] as string, 10)
          : undefined;

        switch (status) {
          case 401:
            console.error('Invalid API key');
            apiError = createApiError(
              'Invalid API key',
              'unauthorized',
              status
            );
            break;
          case 403:
            console.error('Access forbidden');
            apiError = createApiError(
              'Access forbidden',
              'forbidden',
              status
            );
            break;
          case 404:
            console.error('Resource not found');
            apiError = createApiError(
              'Resource not found',
              'not_found',
              status
            );
            break;
          case 429:
            console.error('Rate limit exceeded');
            apiError = createApiError(
              'Rate limit exceeded',
              'rate_limit',
              status,
              retryAfter || 60
            );
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            console.error(`Server error: ${status}`);
            apiError = createApiError(
              'Server error',
              'server_error',
              status
            );
            break;
          default:
            console.error(`API Error: ${status}`);
            apiError = createApiError(
              `API Error: ${status}`,
              'unknown',
              status
            );
        }
      } else if (error.request) {
        console.error('Network error - no response received');
        apiError = createApiError(
          'Network error',
          'network'
        );
      } else {
        apiError = createApiError(
          error.message || 'Unknown error',
          'unknown'
        );
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

const apiClient = createApiClient();

/**
 * Fetch stock candle data (OHLCV)
 */
export async function getStockCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<OHLCV[]> {
  const response = await apiClient.get<FinnhubCandleResponse>('/stock/candle', {
    params: {
      symbol: symbol.toUpperCase(),
      resolution,
      from,
      to,
    },
  });

  if (response.data.s === 'no_data') {
    return [];
  }

  return transformCandleResponse(response.data);
}

/**
 * Fetch real-time quote
 */
export async function getQuote(symbol: string): Promise<Quote> {
  const response = await apiClient.get<FinnhubQuoteResponse>('/quote', {
    params: {
      symbol: symbol.toUpperCase(),
    },
  });

  const data = response.data;
  return {
    symbol: symbol.toUpperCase(),
    price: data.c,
    change: data.d,
    changePercent: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
    timestamp: data.t,
  };
}

/**
 * Search for symbols
 */
export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  const response = await apiClient.get<FinnhubSearchResponse>('/search', {
    params: {
      q: query,
    },
  });

  return response.data.result.map((item) => ({
    symbol: item.symbol,
    description: item.description,
    type: item.type,
    displaySymbol: item.displaySymbol,
  }));
}

/**
 * Fetch company profile
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile> {
  const response = await apiClient.get<FinnhubProfileResponse>('/stock/profile2', {
    params: {
      symbol: symbol.toUpperCase(),
    },
  });

  const data = response.data;
  return {
    symbol: data.ticker,
    name: data.name,
    logo: data.logo,
    industry: data.finnhubIndustry,
    country: data.country,
    exchange: data.exchange,
    marketCap: data.marketCapitalization,
    currency: data.currency,
    weburl: data.weburl,
  };
}

export { apiClient };
