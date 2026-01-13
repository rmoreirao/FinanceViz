/**
 * useStockData Hook
 * Fetches and manages OHLCV stock data
 * 
 * TASK-016: Chart Container Component
 * TASK-090: API/Mock Data Switcher Logic
 * TASK-093: Historical Data Integration
 */

import { useState, useEffect, useCallback } from 'react';
import type { OHLCV, SupportedSymbol } from '../types';
import type { TimeRange, Interval } from '../types';
import { getMockStockData } from '../api/mockData';
import {
  fetchIntradayTimeSeries,
  fetchDailyTimeSeries,
  fetchWeeklyTimeSeries,
  fetchMonthlyTimeSeries,
  transformIntradayResponse,
  transformDailyResponse,
  transformWeeklyResponse,
  transformMonthlyResponse,
  apiCache,
  CACHE_TTL,
  withRetry,
  getUserFriendlyErrorMessage,
  isOnline,
  createOfflineError,
} from '../api';
import type { IntradayInterval } from '../api';
import { useDataSource } from '../context';

interface UseStockDataResult {
  data: OHLCV[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Determine if interval is intraday
 */
function isIntradayInterval(interval: Interval): interval is IntradayInterval {
  return ['1min', '5min', '15min', '30min', '60min'].includes(interval);
}

/**
 * Get cache TTL based on interval
 */
function getCacheTTL(interval: Interval): number {
  if (isIntradayInterval(interval)) {
    return CACHE_TTL.INTRADAY;
  }
  if (interval === 'daily') {
    return CACHE_TTL.DAILY;
  }
  return CACHE_TTL.HISTORICAL;
}

/**
 * Fetch stock data from Alpha Vantage API
 */
async function fetchFromAPI(
  symbol: string,
  interval: Interval,
  timeRange: TimeRange
): Promise<OHLCV[]> {
  // Determine output size based on time range
  const outputSize = ['5Y', 'MAX'].includes(timeRange) ? 'full' : 'compact';

  if (isIntradayInterval(interval)) {
    const response = await fetchIntradayTimeSeries(symbol, interval, outputSize);
    return transformIntradayResponse(response, interval);
  }

  if (interval === 'daily') {
    const response = await fetchDailyTimeSeries(symbol, outputSize);
    return transformDailyResponse(response);
  }

  if (interval === 'weekly') {
    const response = await fetchWeeklyTimeSeries(symbol);
    return transformWeeklyResponse(response);
  }

  if (interval === 'monthly') {
    const response = await fetchMonthlyTimeSeries(symbol);
    return transformMonthlyResponse(response);
  }

  // Fallback to daily
  const response = await fetchDailyTimeSeries(symbol, outputSize);
  return transformDailyResponse(response);
}

/**
 * Hook to fetch OHLCV stock data for charting
 * Uses mock data or API based on data source context
 */
export function useStockData(
  symbol: string,
  timeRange: TimeRange,
  interval: Interval
): UseStockDataResult {
  const { dataSource } = useDataSource();
  const [data, setData] = useState<OHLCV[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (dataSource === 'mock') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Get mock data
        const supportedSymbol = symbol.toUpperCase() as SupportedSymbol;
        const mockData = getMockStockData(supportedSymbol, timeRange, interval);
        setData(mockData);
      } else {
        // Check if offline
        if (!isOnline()) {
          throw createOfflineError();
        }

        // Generate cache key
        const cacheKey = apiCache.generateKey('stockData', symbol, interval, timeRange);
        
        // Check cache first
        const cachedData = apiCache.get<OHLCV[]>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          return;
        }

        // Fetch from API with retry logic
        const apiData = await withRetry(() => fetchFromAPI(symbol, interval, timeRange), 2, 1000);
        
        // Cache the result
        const ttl = getCacheTTL(interval);
        apiCache.set(cacheKey, apiData, ttl);
        
        setData(apiData);
      }
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      
      // On API error, try to fall back to mock data
      if (dataSource === 'alphavantage') {
        try {
          const supportedSymbol = symbol.toUpperCase() as SupportedSymbol;
          const mockData = getMockStockData(supportedSymbol, timeRange, interval);
          if (mockData.length > 0) {
            setData(mockData);
            setError(`${errorMessage} Showing mock data.`);
          }
        } catch {
          // Mock data not available for this symbol
          setData([]);
        }
      } else {
        setData([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeRange, interval, dataSource]);

  // Fetch data when parameters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export default useStockData;
