/**
 * ADX (Average Directional Index) Calculation
 * Measures trend strength regardless of direction
 * Output: ADX line, +DI (Plus Directional Indicator), -DI (Minus Directional Indicator)
 */

import type { OHLCV, ADXParams } from '../../../types';
import type { ADXValue, IndicatorDefinition } from './types';

/**
 * Calculate Average Directional Index with +DI and -DI
 * @param data - OHLCV data array
 * @param params - ADX parameters (period)
 * @returns Array of ADX values with adx, plusDI, minusDI
 */
export function calculateADX(data: OHLCV[], params: ADXParams): ADXValue[] {
  const { period } = params;
  const result: ADXValue[] = [];

  if (data.length < period * 2) {
    return result;
  }

  // Calculate True Range, +DM, and -DM
  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];

    // True Range
    const highLow = current.high - current.low;
    const highPrevClose = Math.abs(current.high - previous.close);
    const lowPrevClose = Math.abs(current.low - previous.close);
    tr.push(Math.max(highLow, highPrevClose, lowPrevClose));

    // Directional Movement
    const upMove = current.high - previous.high;
    const downMove = previous.low - current.low;

    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  // Calculate smoothed values using Wilder's smoothing
  let smoothedTR = 0;
  let smoothedPlusDM = 0;
  let smoothedMinusDM = 0;

  // Initial smoothed values (sum of first N periods)
  for (let i = 0; i < period; i++) {
    smoothedTR += tr[i];
    smoothedPlusDM += plusDM[i];
    smoothedMinusDM += minusDM[i];
  }

  // Calculate DI values and DX
  const dx: number[] = [];
  const diData: { plusDI: number; minusDI: number; time: number }[] = [];

  for (let i = period - 1; i < tr.length; i++) {
    if (i > period - 1) {
      // Wilder's smoothing for subsequent values
      smoothedTR = smoothedTR - smoothedTR / period + tr[i];
      smoothedPlusDM = smoothedPlusDM - smoothedPlusDM / period + plusDM[i];
      smoothedMinusDM = smoothedMinusDM - smoothedMinusDM / period + minusDM[i];
    }

    // Calculate +DI and -DI
    const plusDI = smoothedTR === 0 ? 0 : (smoothedPlusDM / smoothedTR) * 100;
    const minusDI = smoothedTR === 0 ? 0 : (smoothedMinusDM / smoothedTR) * 100;

    // Calculate DX
    const diSum = plusDI + minusDI;
    const diDiff = Math.abs(plusDI - minusDI);
    const dxValue = diSum === 0 ? 0 : (diDiff / diSum) * 100;

    dx.push(dxValue);
    diData.push({
      plusDI,
      minusDI,
      time: data[i + 1].time,
    });
  }

  // Calculate ADX as smoothed average of DX
  if (dx.length < period) {
    return result;
  }

  let adx = 0;
  for (let i = 0; i < period; i++) {
    adx += dx[i];
  }
  adx /= period;

  result.push({
    time: diData[period - 1].time,
    adx,
    plusDI: diData[period - 1].plusDI,
    minusDI: diData[period - 1].minusDI,
  });

  // Calculate remaining ADX values
  for (let i = period; i < dx.length; i++) {
    adx = (adx * (period - 1) + dx[i]) / period;
    result.push({
      time: diData[i].time,
      adx,
      plusDI: diData[i].plusDI,
      minusDI: diData[i].minusDI,
    });
  }

  return result;
}

/**
 * ADX indicator definition with metadata
 */
export const adxIndicator: IndicatorDefinition<ADXParams, ADXValue> = {
  meta: {
    type: 'ADX',
    name: 'Average Directional Index',
    shortName: 'ADX',
    category: 'oscillator',
    defaultParams: { period: 14 },
    defaultColor: '#607D8B',
    description: 'Measures trend strength with +DI and -DI lines',
    outputs: ['adx', 'plusDI', 'minusDI'],
  },
  calculate: calculateADX,
};
