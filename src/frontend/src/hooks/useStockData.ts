/**
 * useStockData Hook
 * Fetches and caches stock candle data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getStockCandles } from '../api/finnhub';
import { getTimeRangeBounds, getResolutionFromInterval } from '../utils/intervals';
import type { OHLCV, TimeRange, Interval } from '../types';

interface UseStockDataResult {
  data: OHLCV[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: OHLCV[]; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

function getCacheKey(symbol: string, timeRange: TimeRange, interval: Interval): string {
  return `${symbol}-${timeRange}-${interval}`;
}

export function useStockData(
  symbol: string,
  timeRange: TimeRange,
  interval: Interval
): UseStockDataResult {
  const [data, setData] = useState<OHLCV[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setData([]);
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(symbol, timeRange, interval);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const { from, to } = getTimeRangeBounds(timeRange);
      const resolution = getResolutionFromInterval(interval);
      
      const candleData = await getStockCandles(symbol, resolution, from, to);
      
      // Update cache
      cache.set(cacheKey, { data: candleData, timestamp: Date.now() });
      setData(candleData);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      const message = err instanceof Error ? err.message : 'Failed to fetch stock data';
      setError(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeRange, interval]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Clear cache for a specific symbol or all
export function clearStockDataCache(symbol?: string): void {
  if (symbol) {
    for (const key of cache.keys()) {
      if (key.startsWith(symbol)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}
