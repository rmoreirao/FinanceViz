/**
 * Stochastic RSI Indicator Calculation
 * 
 * Formula: Apply Stochastic formula to RSI values
 *   StochRSI = (RSI - Lowest RSI) / (Highest RSI - Lowest RSI) * 100
 * 
 * The Stochastic RSI combines two momentum indicators - RSI and Stochastic -
 * to create a more sensitive indicator.
 * 
 * Parameters:
 *   - RSI Period: 14 (default)
 *   - Stoch Period: 14 (default)
 *   - %K Smooth: 3 (default)
 *   - %D Period: 3 (default)
 * 
 * Range: 0-100
 *
 * TASK-044: Stochastic RSI Calculation
 */

import type { IndicatorInput, IndicatorOutput, StochasticOutput } from './types';
import { extractTimes } from './types';
import { calculateRSIFromValues } from './rsi';
import { calculateSMAFromValues } from './sma';

/**
 * Stochastic RSI parameters
 */
export interface StochasticRSIParams {
  rsiPeriod: number;
  stochPeriod: number;
  kSmooth: number;
  dPeriod: number;
}

/**
 * Default Stochastic RSI parameters
 */
export const DEFAULT_STOCH_RSI_PARAMS: StochasticRSIParams = {
  rsiPeriod: 14,
  stochPeriod: 14,
  kSmooth: 3,
  dPeriod: 3,
};

/**
 * Stochastic RSI reference levels
 */
export const STOCH_RSI_LEVELS = {
  OVERBOUGHT: 80,
  OVERSOLD: 20,
};

/**
 * Get the highest value in a range
 */
const getHighest = (values: number[], endIndex: number, period: number): number => {
  let highest = -Infinity;
  const startIndex = Math.max(0, endIndex - period + 1);
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (!isNaN(values[i]) && values[i] > highest) {
      highest = values[i];
    }
  }
  
  return highest === -Infinity ? NaN : highest;
};

/**
 * Get the lowest value in a range
 */
const getLowest = (values: number[], endIndex: number, period: number): number => {
  let lowest = Infinity;
  const startIndex = Math.max(0, endIndex - period + 1);
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (!isNaN(values[i]) && values[i] < lowest) {
      lowest = values[i];
    }
  }
  
  return lowest === Infinity ? NaN : lowest;
};

/**
 * Calculate Stochastic RSI
 * 
 * @param data - OHLCV data array
 * @param params - Stochastic RSI parameters
 * @returns Object containing %K and %D lines
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const stochRsi = calculateStochasticRSI(data, { rsiPeriod: 14, stochPeriod: 14 });
 * // Returns: { k: [...], d: [...] }
 */
export const calculateStochasticRSI = (
  data: IndicatorInput,
  params: Partial<StochasticRSIParams> = {}
): StochasticOutput => {
  const { rsiPeriod, stochPeriod, kSmooth, dPeriod } = { ...DEFAULT_STOCH_RSI_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return { k: [], d: [] };
  }

  if (rsiPeriod <= 0 || stochPeriod <= 0 || kSmooth <= 0 || dPeriod <= 0) {
    console.warn('Stochastic RSI periods must be positive');
    return { k: [], d: [] };
  }

  const times = extractTimes(data);
  const prices = data.map(d => d.close);

  // Step 1: Calculate RSI
  const rsiValues = calculateRSIFromValues(prices, rsiPeriod);

  // Step 2: Apply Stochastic formula to RSI values
  const rawStochRSI: number[] = [];
  
  for (let i = 0; i < rsiValues.length; i++) {
    if (i < rsiPeriod + stochPeriod - 1) {
      rawStochRSI.push(NaN);
    } else {
      const highestRSI = getHighest(rsiValues, i, stochPeriod);
      const lowestRSI = getLowest(rsiValues, i, stochPeriod);
      const range = highestRSI - lowestRSI;
      
      if (range === 0 || isNaN(range)) {
        rawStochRSI.push(50); // Midpoint when range is zero
      } else {
        const stochRSI = ((rsiValues[i] - lowestRSI) / range) * 100;
        rawStochRSI.push(stochRSI);
      }
    }
  }

  // Step 3: Apply smoothing to get %K
  const validStochRSI = rawStochRSI.filter(v => !isNaN(v));
  const smoothedK = kSmooth > 1 
    ? calculateSMAFromValues(validStochRSI, kSmooth)
    : validStochRSI;

  // Step 4: Calculate %D (SMA of %K)
  const dValues = calculateSMAFromValues(smoothedK, dPeriod);

  // Build output arrays
  const kOutput: IndicatorOutput = [];
  const dOutput: IndicatorOutput = [];

  // Find starting index for valid values
  const startIndex = rsiPeriod + stochPeriod - 1 + (kSmooth > 1 ? kSmooth - 1 : 0);
  
  let smoothedIdx = 0;
  for (let i = startIndex; i < data.length && smoothedIdx < smoothedK.length; i++) {
    const kValue = smoothedK[smoothedIdx];
    const dValue = dValues[smoothedIdx];
    
    if (!isNaN(kValue)) {
      kOutput.push({
        time: times[i],
        value: kValue,
      });
      
      if (!isNaN(dValue)) {
        dOutput.push({
          time: times[i],
          value: dValue,
        });
      }
    }
    
    smoothedIdx++;
  }

  return { k: kOutput, d: dOutput };
};

/**
 * Get Stochastic RSI signal
 * 
 * @param kValue - %K value
 * @returns 'overbought', 'oversold', or 'neutral'
 */
export const getStochasticRSISignal = (kValue: number): 'overbought' | 'oversold' | 'neutral' => {
  if (kValue >= STOCH_RSI_LEVELS.OVERBOUGHT) {
    return 'overbought';
  } else if (kValue <= STOCH_RSI_LEVELS.OVERSOLD) {
    return 'oversold';
  }
  return 'neutral';
};
