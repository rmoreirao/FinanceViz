/**
 * Relative Strength Index (RSI) Calculation
 * RSI measures the speed and change of price movements
 * Formula: RSI = 100 - (100 / (1 + RS)), where RS = Average Gain / Average Loss
 */

import type { OHLCV, RSIParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Relative Strength Index
 * @param data - OHLCV data array
 * @param params - RSI parameters (period)
 * @returns Array of RSI values (0-100)
 */
export function calculateRSI(data: OHLCV[], params: RSIParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];

  if (data.length < period + 1) {
    return result;
  }

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  // Separate gains and losses
  const gains: number[] = changes.map(c => (c > 0 ? c : 0));
  const losses: number[] = changes.map(c => (c < 0 ? Math.abs(c) : 0));

  // Calculate initial average gain and loss (SMA)
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // Calculate first RSI
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  result.push({
    time: data[period].time,
    value: rsi,
  });

  // Calculate remaining RSI values using smoothed averages (Wilder's smoothing)
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);

    result.push({
      time: data[i + 1].time,
      value: rsi,
    });
  }

  return result;
}

/**
 * RSI indicator definition with metadata
 */
export const rsiIndicator: IndicatorDefinition<RSIParams, IndicatorValue> = {
  meta: {
    type: 'RSI',
    name: 'Relative Strength Index',
    shortName: 'RSI',
    category: 'oscillator',
    defaultParams: { period: 14 },
    defaultColor: '#7B1FA2',
    description: 'Momentum oscillator measuring speed and change of price movements (0-100)',
  },
  calculate: calculateRSI,
};
