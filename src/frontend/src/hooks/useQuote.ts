/**
 * useQuote Hook
 * Fetches and manages stock quote data
 * 
 * TASK-014: Quote Header Component
 */

import { useState, useEffect, useCallback } from 'react';
import type { Quote } from '../types';
import { getMockQuote } from '../api/mockQuotes';
import { useDataSource } from '../context';

interface UseQuoteResult {
  quote: Quote | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch quote data for a symbol
 * Uses mock data or API based on data source context
 */
export function useQuote(symbol: string): UseQuoteResult {
  const { dataSource } = useDataSource();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!symbol) {
      setQuote(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (dataSource === 'mock') {
        // Use mock data
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        const mockQuote = getMockQuote(symbol);
        setQuote(mockQuote);
      } else {
        // TODO: Implement Alpha Vantage API call
        // For now, fall back to mock data with a note
        const mockQuote = getMockQuote(symbol);
        setQuote(mockQuote);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quote';
      setError(errorMessage);
      setQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, dataSource]);

  // Fetch quote on symbol or data source change
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Refresh quote periodically (every 10 seconds for mock data)
  useEffect(() => {
    if (dataSource === 'mock') {
      const interval = setInterval(fetchQuote, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchQuote, dataSource]);

  return {
    quote,
    isLoading,
    error,
    refetch: fetchQuote,
  };
}

export default useQuote;
