/**
 * useStockData Hook
 * Fetches and manages OHLCV stock data
 * 
 * TASK-016: Chart Container Component
 */

import { useState, useEffect, useCallback } from 'react';
import type { OHLCV, SupportedSymbol } from '../types';
import type { TimeRange, Interval } from '../types';
import { getMockStockData } from '../api/mockData';
import { useDataSource } from '../context';

interface UseStockDataResult {
  data: OHLCV[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
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
        // TODO: Implement Alpha Vantage API call
        // For now, fall back to mock data
        const supportedSymbol = symbol.toUpperCase() as SupportedSymbol;
        const mockData = getMockStockData(supportedSymbol, timeRange, interval);
        setData(mockData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stock data';
      setError(errorMessage);
      setData([]);
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
