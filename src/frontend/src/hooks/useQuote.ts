/**
 * useQuote Hook
 * Fetches and auto-refreshes quote data for a symbol
 */

import { useState, useEffect, useCallback } from 'react';
import { getQuote } from '../api/finnhub';
import type { Quote } from '../types';

interface UseQuoteResult {
  quote: Quote | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useQuote(symbol: string, autoRefresh: boolean = true): UseQuoteResult {
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
      const data = await getQuote(symbol);
      setQuote(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch quote';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // Initial fetch
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Auto-refresh every 15 seconds when market is open
  useEffect(() => {
    if (!autoRefresh || !symbol) return;

    const interval = setInterval(() => {
      fetchQuote();
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, symbol, fetchQuote]);

  return {
    quote,
    isLoading,
    error,
    refetch: fetchQuote,
  };
}
