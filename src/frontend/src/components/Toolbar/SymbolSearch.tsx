/**
 * SymbolSearch Component
 * Autocomplete search for stock symbols
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useChartContext } from '../../context';
import { useDebounce } from '../../hooks';
import { searchSymbols } from '../../api';
import { Spinner } from '../common';
import type { SymbolSearchResult } from '../../types';

export function SymbolSearch() {
  const { state, setSymbol } = useChartContext();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(inputValue, 300);

  // Search for symbols when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery || debouncedQuery.length < 1) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchSymbols(debouncedQuery);
        // Filter to show only common stocks
        const filtered = data
          .filter((item) => item.type === 'Common Stock')
          .slice(0, 8);
        setResults(filtered);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (result: SymbolSearchResult) => {
      setSymbol(result.symbol, result.description);
      setInputValue('');
      setIsOpen(false);
      setResults([]);
      inputRef.current?.blur();
    },
    [setSymbol]
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setInputValue('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={`Search symbols... (${state.symbol})`}
          className="
            w-full pl-9 pr-8 py-2 text-sm
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-md shadow-sm
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          "
          aria-label="Search for stock symbols"
          aria-autocomplete="list"
          aria-controls="symbol-search-results"
          aria-expanded={isOpen}
        />
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        ) : inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          id="symbol-search-results"
          role="listbox"
          className="
            absolute z-50 mt-1 w-full max-h-60
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-md shadow-lg
            overflow-auto
          "
        >
          {results.map((result, index) => (
            <li
              key={result.symbol}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                flex items-center justify-between
                px-3 py-2 cursor-pointer
                ${
                  index === highlightedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {result.symbol}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                  {result.description}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {result.type}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen && inputValue && !isLoading && results.length === 0 && (
        <div className="
          absolute z-50 mt-1 w-full
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-md shadow-lg
          px-3 py-2 text-sm text-gray-500 dark:text-gray-400
        ">
          No results found
        </div>
      )}
    </div>
  );
}
