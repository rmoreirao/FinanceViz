/**
 * Data Transformation Layer
 * Transforms Alpha Vantage API responses to chart-compatible formats
 * 
 * TASK-089: Data Transformation Layer
 */

import type { OHLCV, Quote, SymbolSearchResult } from '../types';
import type {
  AVIntradayResponse,
  AVDailyResponse,
  AVWeeklyResponse,
  AVMonthlyResponse,
  AVTimeSeriesDataPoint,
  AVSymbolSearchResponse,
  AVGlobalQuoteResponse,
  IntradayInterval,
} from './types';

/**
 * Parse date string to Unix timestamp (seconds)
 */
function parseTimestamp(dateString: string): number {
  const date = new Date(dateString);
  return Math.floor(date.getTime() / 1000);
}

/**
 * Transform a single time series data point to OHLCV
 */
function transformDataPoint(dateString: string, data: AVTimeSeriesDataPoint): OHLCV {
  return {
    time: parseTimestamp(dateString),
    open: parseFloat(data['1. open']),
    high: parseFloat(data['2. high']),
    low: parseFloat(data['3. low']),
    close: parseFloat(data['4. close']),
    volume: parseInt(data['5. volume'], 10),
  };
}

/**
 * Sort OHLCV data chronologically (oldest first)
 */
function sortChronologically(data: OHLCV[]): OHLCV[] {
  return [...data].sort((a, b) => a.time - b.time);
}

/**
 * Validate OHLCV data integrity
 */
function validateOHLCV(data: OHLCV): boolean {
  return (
    !isNaN(data.time) &&
    !isNaN(data.open) &&
    !isNaN(data.high) &&
    !isNaN(data.low) &&
    !isNaN(data.close) &&
    !isNaN(data.volume) &&
    data.high >= data.low &&
    data.high >= data.open &&
    data.high >= data.close &&
    data.low <= data.open &&
    data.low <= data.close &&
    data.volume >= 0
  );
}

/**
 * Get time series key for intraday response
 */
function getIntradayTimeSeriesKey(interval: IntradayInterval): string {
  return `Time Series (${interval})`;
}

/**
 * Transform intraday response to OHLCV array
 */
export function transformIntradayResponse(
  response: AVIntradayResponse,
  interval: IntradayInterval
): OHLCV[] {
  const timeSeriesKey = getIntradayTimeSeriesKey(interval);
  const timeSeries = response[timeSeriesKey as keyof AVIntradayResponse] as
    | Record<string, AVTimeSeriesDataPoint>
    | undefined;

  if (!timeSeries) {
    return [];
  }

  const data: OHLCV[] = [];
  for (const [dateString, dataPoint] of Object.entries(timeSeries)) {
    const ohlcv = transformDataPoint(dateString, dataPoint);
    if (validateOHLCV(ohlcv)) {
      data.push(ohlcv);
    }
  }

  return sortChronologically(data);
}

/**
 * Transform daily response to OHLCV array
 */
export function transformDailyResponse(response: AVDailyResponse): OHLCV[] {
  const timeSeries = response['Time Series (Daily)'];

  if (!timeSeries) {
    return [];
  }

  const data: OHLCV[] = [];
  for (const [dateString, dataPoint] of Object.entries(timeSeries)) {
    const ohlcv = transformDataPoint(dateString, dataPoint);
    if (validateOHLCV(ohlcv)) {
      data.push(ohlcv);
    }
  }

  return sortChronologically(data);
}

/**
 * Transform weekly response to OHLCV array
 */
export function transformWeeklyResponse(response: AVWeeklyResponse): OHLCV[] {
  const timeSeries = response['Weekly Time Series'];

  if (!timeSeries) {
    return [];
  }

  const data: OHLCV[] = [];
  for (const [dateString, dataPoint] of Object.entries(timeSeries)) {
    const ohlcv = transformDataPoint(dateString, dataPoint);
    if (validateOHLCV(ohlcv)) {
      data.push(ohlcv);
    }
  }

  return sortChronologically(data);
}

/**
 * Transform monthly response to OHLCV array
 */
export function transformMonthlyResponse(response: AVMonthlyResponse): OHLCV[] {
  const timeSeries = response['Monthly Time Series'];

  if (!timeSeries) {
    return [];
  }

  const data: OHLCV[] = [];
  for (const [dateString, dataPoint] of Object.entries(timeSeries)) {
    const ohlcv = transformDataPoint(dateString, dataPoint);
    if (validateOHLCV(ohlcv)) {
      data.push(ohlcv);
    }
  }

  return sortChronologically(data);
}

/**
 * Transform symbol search response to SymbolSearchResult array
 */
export function transformSymbolSearchResponse(
  response: AVSymbolSearchResponse
): SymbolSearchResult[] {
  if (!response.bestMatches) {
    return [];
  }

  return response.bestMatches.map((match) => {
    // Map type to our supported types
    const type = match['3. type'];
    let mappedType: 'Stock' | 'ETF' | 'Index' | 'Crypto' = 'Stock';
    if (type.toLowerCase().includes('etf')) {
      mappedType = 'ETF';
    } else if (type.toLowerCase().includes('index')) {
      mappedType = 'Index';
    } else if (type.toLowerCase().includes('crypto') || type.toLowerCase().includes('digital')) {
      mappedType = 'Crypto';
    }

    return {
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: mappedType,
      exchange: match['4. region'],
      currency: match['8. currency'],
    };
  });
}

/**
 * Transform global quote response to Quote
 */
export function transformGlobalQuoteResponse(
  response: AVGlobalQuoteResponse,
  companyName: string = ''
): Quote {
  const quote = response['Global Quote'];

  // Parse change percent (remove % sign)
  const changePercentStr = quote['10. change percent'].replace('%', '');

  return {
    symbol: quote['01. symbol'],
    companyName: companyName,
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(changePercentStr),
    open: parseFloat(quote['02. open']),
    high: parseFloat(quote['03. high']),
    low: parseFloat(quote['04. low']),
    previousClose: parseFloat(quote['08. previous close']),
    volume: parseInt(quote['06. volume'], 10),
    timestamp: parseTimestamp(quote['07. latest trading day']),
  };
}

/**
 * Filter OHLCV data by date range
 */
export function filterByDateRange(
  data: OHLCV[],
  startDate: Date,
  endDate: Date
): OHLCV[] {
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  return data.filter(
    (point) => point.time >= startTimestamp && point.time <= endTimestamp
  );
}

/**
 * Get the appropriate number of data points for a time range
 */
export function limitDataPoints(data: OHLCV[], maxPoints: number): OHLCV[] {
  if (data.length <= maxPoints) {
    return data;
  }
  // Return the most recent data points
  return data.slice(-maxPoints);
}
