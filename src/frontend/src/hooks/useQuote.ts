/**
 * useQuote Hook
 * Fetches and manages stock quote data
 * 
 * TASK-014: Quote Header Component
 * TASK-090: API/Mock Data Switcher Logic
 * TASK-092: Real-time Quote Integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Quote } from '../types';
import { getMockQuote } from '../api/mockQuotes';
import {
  fetchGlobalQuote,
  transformGlobalQuoteResponse,
  apiCache,
  CACHE_TTL,
  withRetry,
  getUserFriendlyErrorMessage,
  isOnline,
  createOfflineError,
} from '../api';
import { useDataSource } from '../context';

interface UseQuoteResult {
  quote: Quote | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Auto-refresh interval in milliseconds */
const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

/**
 * Hook to fetch quote data for a symbol
 * Uses mock data or API based on data source context
 */
export function useQuote(symbol: string, autoRefresh: boolean = true): UseQuoteResult {
  const { dataSource } = useDataSource();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyNameRef = useRef<string>('');

  // Store company name when we get it from mock data
  useEffect(() => {
    if (quote?.companyName) {
      companyNameRef.current = quote.companyName;
    }
  }, [quote?.companyName]);

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
        // Check if offline
        if (!isOnline()) {
          throw createOfflineError();
        }

        // Generate cache key (include dataSource to separate mock and API caches)
        const cacheKey = apiCache.generateKey('quote', dataSource, symbol);
        
        // Check cache first
        const cachedQuote = apiCache.get<Quote>(cacheKey);
        if (cachedQuote) {
          setQuote(cachedQuote);
          setIsLoading(false);
          return;
        }

        // Fetch from API with retry logic
        const response = await withRetry(() => fetchGlobalQuote(symbol), 2, 1000);
        
        // Get company name from mock data if available, or use stored name
        let companyName = companyNameRef.current;
        if (!companyName) {
          try {
            const mockQuote = getMockQuote(symbol);
            companyName = mockQuote.companyName;
          } catch {
            companyName = symbol; // Use symbol as fallback
          }
        }
        
        const apiQuote = transformGlobalQuoteResponse(response, companyName);
        
        // Cache the result
        apiCache.set(cacheKey, apiQuote, CACHE_TTL.QUOTE);
        
        setQuote(apiQuote);
      }
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      
      // On API error, try to fall back to mock data
      if (dataSource === 'alphavantage') {
        try {
          const mockQuote = getMockQuote(symbol);
          setQuote(mockQuote);
          setError(`${errorMessage} Showing mock data.`);
        } catch {
          setQuote(null);
        }
      } else {
        setQuote(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, dataSource]);

  // Fetch quote on symbol or data source change
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Auto-refresh quote periodically
  useEffect(() => {
    if (!autoRefresh || !symbol) {
      return;
    }

    // Use different intervals based on data source
    const refreshInterval = dataSource === 'mock' ? 10000 : AUTO_REFRESH_INTERVAL;
    
    const interval = setInterval(() => {
      // Only refresh if online (for API mode)
      if (dataSource === 'alphavantage' && !isOnline()) {
        return;
      }
      fetchQuote();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchQuote, dataSource, autoRefresh, symbol]);

  return {
    quote,
    isLoading,
    error,
    refetch: fetchQuote,
  };
}

export default useQuote;
