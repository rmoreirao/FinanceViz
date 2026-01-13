/**
 * Symbol Search Component
 * Autocomplete search for stock symbols
 * 
 * TASK-009: Symbol Search Component
 * TASK-091: Symbol Search API Integration
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChart, useDataSource } from '../../context';
import { useDebounce } from '../../hooks';
import {
  searchSymbols,
  searchSymbolsAPI,
  transformSymbolSearchResponse,
  apiCache,
  CACHE_TTL,
  isOnline,
} from '../../api';
import type { SymbolSearchResult } from '../../types';

/**
 * Symbol search with autocomplete dropdown
 */
export function SymbolSearch() {
  const { state, setSymbol } = useChart();
  const { dataSource } = useDataSource();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  /**
   * Search for symbols using API with fallback to mock data
   */
  const searchWithAPI = useCallback(async (searchQuery: string): Promise<SymbolSearchResult[]> => {
    // Check cache first
    const cacheKey = apiCache.generateKey('symbolSearch', searchQuery.toLowerCase());
    const cachedResults = apiCache.get<SymbolSearchResult[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    // If offline, fall back to mock data
    if (!isOnline()) {
      return searchSymbols(searchQuery);
    }

    try {
      const response = await searchSymbolsAPI(searchQuery);
      const results = transformSymbolSearchResponse(response);
      
      // Cache the results
      apiCache.set(cacheKey, results, CACHE_TTL.SYMBOL_SEARCH);
      
      return results;
    } catch {
      // On API failure, fall back to mock data
      return searchSymbols(searchQuery);
    }
  }, []);

  // Search for symbols when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      
      try {
        let searchResults: SymbolSearchResult[];
        
        if (dataSource === 'alphavantage') {
          // Use API search
          searchResults = await searchWithAPI(debouncedQuery);
        } else {
          // Use mock data search
          searchResults = searchSymbols(debouncedQuery);
        }
        
        setResults(searchResults);
      } catch {
        // Fall back to mock data on any error
        setResults(searchSymbols(debouncedQuery));
      } finally {
        setIsLoading(false);
        setHighlightedIndex(0);
      }
    };

    performSearch();
  }, [debouncedQuery, dataSource, searchWithAPI]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelectSymbol = (result: SymbolSearchResult) => {
    setSymbol(result.symbol, result.name);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && query.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[highlightedIndex]) {
          handleSelectSymbol(results[highlightedIndex]);
        }
        break;
    }
  };

  const handleFocus = () => {
    if (query.length > 0 || results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" data-testid="symbol-search">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={state.symbol}
          className="w-32 sm:w-40 pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-700 dark:placeholder:text-gray-300 placeholder:font-semibold"
          aria-label="Search symbols"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg
              className="animate-spin w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {results.map((result, index) => (
            <div
              key={result.symbol}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelectSymbol(result)}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                index === highlightedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {result.symbol}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                  {result.name}
                </span>
              </div>
              <div className="flex flex-col items-end text-xs text-gray-400">
                <span>{result.type}</span>
                <span>{result.exchange}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length > 0 && results.length === 0 && !isLoading && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400"
        >
          No symbols found for "{query}"
        </div>
      )}
    </div>
  );
}

export default SymbolSearch;
