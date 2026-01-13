/**
 * Mock Symbol Search
 * Provides symbol search functionality with mock data
 */

import type { SymbolSearchResult } from '../types/stock';
import { COMPANIES } from './mockData';

/**
 * Extended symbol database for search
 * Includes main symbols plus additional popular symbols
 */
const SYMBOL_DATABASE: SymbolSearchResult[] = [
  // Main supported symbols with full data
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  // Additional symbols for search variety
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'NFLX',
    name: 'Netflix, Inc.',
    type: 'Stock',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    type: 'Stock',
    exchange: 'NYSE',
    currency: 'USD',
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    type: 'Stock',
    exchange: 'NYSE',
    currency: 'USD',
  },
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    type: 'Stock',
    exchange: 'NYSE',
    currency: 'USD',
  },
  {
    symbol: 'WMT',
    name: 'Walmart Inc.',
    type: 'Stock',
    exchange: 'NYSE',
    currency: 'USD',
  },
  {
    symbol: 'PG',
    name: 'The Procter & Gamble Company',
    type: 'Stock',
    exchange: 'NYSE',
    currency: 'USD',
  },
  {
    symbol: 'DIS',
    name: 'The Walt Disney Company',
    type: 'Stock',
    exchange: 'NYSE',
    currency: 'USD',
  },
  // ETFs
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    type: 'ETF',
    exchange: 'NYSE',
    currency: 'USD',
  },
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    type: 'ETF',
    exchange: 'NASDAQ',
    currency: 'USD',
  },
  {
    symbol: 'IWM',
    name: 'iShares Russell 2000 ETF',
    type: 'ETF',
    exchange: 'NYSE',
    currency: 'USD',
  },
  {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    type: 'ETF',
    exchange: 'NYSE',
    currency: 'USD',
  },
  // Indices
  {
    symbol: '^GSPC',
    name: 'S&P 500',
    type: 'Index',
    exchange: 'INDEX',
    currency: 'USD',
  },
  {
    symbol: '^DJI',
    name: 'Dow Jones Industrial Average',
    type: 'Index',
    exchange: 'INDEX',
    currency: 'USD',
  },
  {
    symbol: '^IXIC',
    name: 'NASDAQ Composite',
    type: 'Index',
    exchange: 'INDEX',
    currency: 'USD',
  },
];

/**
 * Search for symbols matching a query
 * @param query - Search string (symbol or company name)
 * @param limit - Maximum number of results to return
 * @returns Array of matching symbols
 */
export function searchSymbols(query: string, limit: number = 10): SymbolSearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Score and sort results
  const scored = SYMBOL_DATABASE.map(item => {
    let score = 0;
    const symbolLower = item.symbol.toLowerCase();
    const nameLower = item.name.toLowerCase();
    
    // Exact symbol match (highest priority)
    if (symbolLower === normalizedQuery) {
      score = 100;
    }
    // Symbol starts with query
    else if (symbolLower.startsWith(normalizedQuery)) {
      score = 80;
    }
    // Symbol contains query
    else if (symbolLower.includes(normalizedQuery)) {
      score = 60;
    }
    // Name starts with query
    else if (nameLower.startsWith(normalizedQuery)) {
      score = 50;
    }
    // Name contains query
    else if (nameLower.includes(normalizedQuery)) {
      score = 40;
    }
    // Check individual words in name
    else {
      const words = nameLower.split(/\s+/);
      for (const word of words) {
        if (word.startsWith(normalizedQuery)) {
          score = 30;
          break;
        }
      }
    }
    
    // Boost supported symbols (those with full mock data)
    if (isSupportedSymbol(item.symbol)) {
      score += 10;
    }
    
    return { item, score };
  })
  .filter(({ score }) => score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);
  
  return scored.map(({ item }) => item);
}

/**
 * Check if a symbol has full mock data support
 */
export function isSupportedSymbol(symbol: string): boolean {
  return symbol.toUpperCase() in COMPANIES;
}

/**
 * Get all available symbols
 */
export function getAllSymbols(): SymbolSearchResult[] {
  return [...SYMBOL_DATABASE];
}

/**
 * Get symbols with full mock data support
 */
export function getSupportedSymbolsList(): SymbolSearchResult[] {
  return SYMBOL_DATABASE.filter(item => isSupportedSymbol(item.symbol));
}

/**
 * Get a specific symbol's details
 */
export function getSymbolDetails(symbol: string): SymbolSearchResult | undefined {
  return SYMBOL_DATABASE.find(
    item => item.symbol.toLowerCase() === symbol.toLowerCase()
  );
}
