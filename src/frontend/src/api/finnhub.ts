/**
 * Finnhub API Client
 * Handles all API requests to Finnhub.io
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

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            console.error('Invalid API key');
            break;
          case 429:
            console.error('Rate limit exceeded');
            break;
          case 403:
            console.error('Access forbidden');
            break;
          default:
            console.error(`API Error: ${error.response.status}`);
        }
      } else if (error.request) {
        console.error('Network error - no response received');
      }
      return Promise.reject(error);
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
