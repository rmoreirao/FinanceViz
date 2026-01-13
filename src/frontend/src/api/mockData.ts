/**
 * Mock OHLCV Data Generator
 * Generates realistic candlestick patterns for testing
 */

import type { OHLCV, CompanyInfo, SupportedSymbol } from '../types/stock';
import type { TimeRange, Interval } from '../types/chart';
import { DEFAULT_INTERVALS } from '../types/chart';

/**
 * Company information with base prices and volatility
 */
export const COMPANIES: Record<SupportedSymbol, CompanyInfo> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    sector: 'Technology',
    basePrice: 185.50,
    volatility: 0.02,
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    sector: 'Technology',
    basePrice: 378.25,
    volatility: 0.018,
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    exchange: 'NASDAQ',
    sector: 'Technology',
    basePrice: 141.80,
    volatility: 0.022,
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    exchange: 'NASDAQ',
    sector: 'Consumer Discretionary',
    basePrice: 178.50,
    volatility: 0.025,
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    exchange: 'NASDAQ',
    sector: 'Consumer Discretionary',
    basePrice: 248.75,
    volatility: 0.035,
  },
};

/**
 * Seeded random number generator for consistent data
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * Generate a hash from a string for seeding
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Calculate the number of data points needed for a time range and interval
 */
function getDataPointCount(timeRange: TimeRange, interval: Interval): number {
  const now = new Date();
  
  // Approximate trading hours per day
  const tradingMinutesPerDay = 390; // 6.5 hours
  
  let days: number;
  switch (timeRange) {
    case '1D':
      days = 1;
      break;
    case '5D':
      days = 5;
      break;
    case '1M':
      days = 22; // Trading days
      break;
    case '6M':
      days = 130;
      break;
    case 'YTD':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      days = Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) * 0.7;
      break;
    case '1Y':
      days = 252; // Trading days
      break;
    case '5Y':
      days = 1260;
      break;
    case 'MAX':
      days = 2520; // ~10 years
      break;
    default:
      days = 252;
  }
  
  let intervalMinutes: number;
  switch (interval) {
    case '1min':
      intervalMinutes = 1;
      break;
    case '5min':
      intervalMinutes = 5;
      break;
    case '15min':
      intervalMinutes = 15;
      break;
    case '30min':
      intervalMinutes = 30;
      break;
    case '60min':
      intervalMinutes = 60;
      break;
    case 'daily':
      return days;
    case 'weekly':
      return Math.ceil(days / 5);
    case 'monthly':
      return Math.ceil(days / 22);
    default:
      return days;
  }
  
  // For intraday intervals
  const pointsPerDay = Math.floor(tradingMinutesPerDay / intervalMinutes);
  return Math.min(days * pointsPerDay, 5000); // Cap at 5000 points
}

/**
 * Get interval duration in milliseconds
 */
function getIntervalMs(interval: Interval): number {
  switch (interval) {
    case '1min':
      return 60 * 1000;
    case '5min':
      return 5 * 60 * 1000;
    case '15min':
      return 15 * 60 * 1000;
    case '30min':
      return 30 * 60 * 1000;
    case '60min':
      return 60 * 60 * 1000;
    case 'daily':
      return 24 * 60 * 60 * 1000;
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000;
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

/**
 * Check if a timestamp falls within trading hours (9:30 AM - 4:00 PM ET)
 */
function isWithinTradingHours(timestamp: number): boolean {
  const date = new Date(timestamp);
  const hours = date.getUTCHours() - 5; // Approximate ET offset
  const minutes = date.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  // Trading hours: 9:30 AM (570 min) to 4:00 PM (960 min)
  return timeInMinutes >= 570 && timeInMinutes <= 960;
}

/**
 * Check if a date is a weekday
 */
function isWeekday(timestamp: number): boolean {
  const day = new Date(timestamp).getDay();
  return day !== 0 && day !== 6;
}

/**
 * Generate realistic OHLCV data for a symbol
 */
export function generateMockOHLCV(
  symbol: SupportedSymbol,
  timeRange: TimeRange,
  interval: Interval = DEFAULT_INTERVALS[timeRange]
): OHLCV[] {
  const company = COMPANIES[symbol];
  if (!company) {
    throw new Error(`Unknown symbol: ${symbol}`);
  }

  const dataPoints = getDataPointCount(timeRange, interval);
  const intervalMs = getIntervalMs(interval);
  const isIntraday = ['1min', '5min', '15min', '30min', '60min'].includes(interval);
  
  // Create a seeded random generator for consistent data
  const seed = hashString(`${symbol}-${timeRange}-${interval}`);
  const random = seededRandom(seed);
  
  const data: OHLCV[] = [];
  let currentPrice = company.basePrice;
  const volatility = company.volatility;
  
  // Calculate start time
  const now = Date.now();
  let currentTime = now - dataPoints * intervalMs;
  
  // Add some trend bias based on symbol
  const trendBias = (random() - 0.48) * 0.001;
  
  for (let i = 0; i < dataPoints; i++) {
    // Skip non-trading times for intraday data
    if (isIntraday) {
      while (!isWeekday(currentTime) || !isWithinTradingHours(currentTime)) {
        currentTime += intervalMs;
      }
    } else {
      // Skip weekends for daily+ data
      while (!isWeekday(currentTime)) {
        currentTime += 24 * 60 * 60 * 1000;
      }
    }
    
    // Generate realistic price movement
    const volatilityMultiplier = isIntraday ? volatility * 0.3 : volatility;
    const priceChange = (random() - 0.5 + trendBias) * volatilityMultiplier * currentPrice;
    
    // Generate OHLC values
    const open = currentPrice;
    const close = currentPrice + priceChange;
    
    // High is above both open and close
    const highExtra = random() * volatilityMultiplier * 0.5 * currentPrice;
    const high = Math.max(open, close) + highExtra;
    
    // Low is below both open and close
    const lowExtra = random() * volatilityMultiplier * 0.5 * currentPrice;
    const low = Math.min(open, close) - lowExtra;
    
    // Generate volume with some variability
    const avgVolume = 50000000; // 50M shares
    const volumeMultiplier = 0.5 + random() * 1.5;
    // Higher volume on larger price moves
    const moveSize = Math.abs(close - open) / open;
    const volumeBoost = 1 + moveSize * 10;
    const volume = Math.floor(avgVolume * volumeMultiplier * volumeBoost / dataPoints * 100);
    
    data.push({
      time: Math.floor(currentTime / 1000), // Convert to seconds
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    
    currentPrice = close;
    currentTime += intervalMs;
  }
  
  return data;
}

/**
 * Get mock data for a symbol with specific parameters
 */
export function getMockStockData(
  symbol: string,
  timeRange: TimeRange,
  interval?: Interval
): OHLCV[] {
  const supportedSymbol = symbol.toUpperCase() as SupportedSymbol;
  
  if (!COMPANIES[supportedSymbol]) {
    // Return AAPL data if symbol not found
    return generateMockOHLCV('AAPL', timeRange, interval);
  }
  
  return generateMockOHLCV(supportedSymbol, timeRange, interval);
}

/**
 * Get company info for a symbol
 */
export function getCompanyInfo(symbol: string): CompanyInfo | undefined {
  return COMPANIES[symbol.toUpperCase() as SupportedSymbol];
}

/**
 * Get all supported symbols
 */
export function getSupportedSymbols(): SupportedSymbol[] {
  return Object.keys(COMPANIES) as SupportedSymbol[];
}
