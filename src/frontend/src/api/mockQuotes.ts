/**
 * Mock Quote Data
 * Generates realistic stock quote information
 */

import type { Quote, SupportedSymbol } from '../types/stock';
import { COMPANIES, getMockStockData } from './mockData';

/**
 * Generate a mock quote for a symbol based on recent price data
 */
export function getMockQuote(symbol: string): Quote {
  const supportedSymbol = symbol.toUpperCase() as SupportedSymbol;
  const company = COMPANIES[supportedSymbol];
  
  if (!company) {
    // Return a default quote for unknown symbols
    return getDefaultQuote(symbol);
  }
  
  // Get recent data to calculate current price
  const recentData = getMockStockData(supportedSymbol, '1D', '5min');
  const latestBar = recentData[recentData.length - 1];
  
  // Get daily data for open/high/low
  const dailyData = getMockStockData(supportedSymbol, '1D', '5min');
  const dayOpen = dailyData[0]?.open || latestBar.open;
  const dayHigh = Math.max(...dailyData.map(d => d.high));
  const dayLow = Math.min(...dailyData.map(d => d.low));
  const totalVolume = dailyData.reduce((sum, d) => sum + d.volume, 0);
  
  // Calculate change from previous close
  const previousClose = company.basePrice * (0.98 + Math.random() * 0.04);
  const currentPrice = latestBar.close;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  // Get 52-week data for high/low
  const yearData = getMockStockData(supportedSymbol, '1Y', 'daily');
  const week52High = Math.max(...yearData.map(d => d.high));
  const week52Low = Math.min(...yearData.map(d => d.low));
  const avgVolume = Math.floor(yearData.reduce((sum, d) => sum + d.volume, 0) / yearData.length);
  
  // Generate market cap based on price
  const sharesOutstanding = getSharesOutstanding(supportedSymbol);
  const marketCap = currentPrice * sharesOutstanding;
  
  return {
    symbol: supportedSymbol,
    companyName: company.name,
    price: parseFloat(currentPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    open: parseFloat(dayOpen.toFixed(2)),
    high: parseFloat(dayHigh.toFixed(2)),
    low: parseFloat(dayLow.toFixed(2)),
    previousClose: parseFloat(previousClose.toFixed(2)),
    volume: totalVolume,
    marketCap,
    peRatio: getPERatio(supportedSymbol),
    week52High: parseFloat(week52High.toFixed(2)),
    week52Low: parseFloat(week52Low.toFixed(2)),
    avgVolume,
    timestamp: Date.now(),
  };
}

/**
 * Get default quote for unknown symbols
 */
function getDefaultQuote(symbol: string): Quote {
  return {
    symbol: symbol.toUpperCase(),
    companyName: 'Unknown Company',
    price: 100.00,
    change: 0,
    changePercent: 0,
    open: 100.00,
    high: 100.00,
    low: 100.00,
    previousClose: 100.00,
    volume: 0,
    timestamp: Date.now(),
  };
}

/**
 * Approximate shares outstanding for market cap calculation
 */
function getSharesOutstanding(symbol: SupportedSymbol): number {
  const shares: Record<SupportedSymbol, number> = {
    AAPL: 15500000000, // 15.5B
    MSFT: 7430000000,  // 7.43B
    GOOGL: 5890000000, // 5.89B
    AMZN: 10350000000, // 10.35B
    TSLA: 3180000000,  // 3.18B
  };
  return shares[symbol] || 1000000000;
}

/**
 * Approximate P/E ratio for symbols
 */
function getPERatio(symbol: SupportedSymbol): number {
  const peRatios: Record<SupportedSymbol, number> = {
    AAPL: 29.5,
    MSFT: 35.2,
    GOOGL: 25.8,
    AMZN: 42.3,
    TSLA: 65.4,
  };
  return peRatios[symbol] || 20;
}

/**
 * Get quotes for multiple symbols
 */
export function getMockQuotes(symbols: string[]): Quote[] {
  return symbols.map(symbol => getMockQuote(symbol));
}

/**
 * Get all available quotes
 */
export function getAllMockQuotes(): Quote[] {
  return Object.keys(COMPANIES).map(symbol => getMockQuote(symbol));
}
