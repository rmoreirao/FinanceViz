/**
 * Average Directional Index (ADX) Indicator Calculation
 * 
 * Components:
 *   - +DI (Positive Directional Indicator)
 *   - -DI (Negative Directional Indicator)
 *   - ADX (Average of DX - Directional Movement Index)
 * 
 * ADX measures trend strength without regard to trend direction.
 * +DI and -DI indicate trend direction.
 * 
 * Parameters:
 *   - Period: 14 (default)
 * 
 * Range: 0-100
 *   - 0-25: Absent or weak trend
 *   - 25-50: Strong trend
 *   - 50-75: Very strong trend
 *   - 75-100: Extremely strong trend
 *
 * TASK-048: ADX Indicator Calculation
 */

import type { IndicatorInput, ADXCalculationParams, ADXOutput, IndicatorOutput } from './types';
import { calculateTrueRange } from './atr';

/**
 * Default ADX parameters
 */
export const DEFAULT_ADX_PARAMS: ADXCalculationParams = {
  period: 14,
};

/**
 * ADX trend strength levels
 */
export const ADX_LEVELS = {
  WEAK: 25,
  STRONG: 50,
  VERY_STRONG: 75,
};

/**
 * Calculate Average Directional Index
 * 
 * @param data - OHLCV data array
 * @param params - ADX parameters (period)
 * @returns Object containing adx, plusDI, and minusDI arrays
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const adx = calculateADX(data, { period: 14 });
 * // Returns: { adx: [...], plusDI: [...], minusDI: [...] }
 */
export const calculateADX = (
  data: IndicatorInput,
  params: Partial<ADXCalculationParams> = {}
): ADXOutput => {
  const { period } = { ...DEFAULT_ADX_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return { adx: [], plusDI: [], minusDI: [] };
  }

  if (period <= 0) {
    console.warn('ADX period must be positive');
    return { adx: [], plusDI: [], minusDI: [] };
  }

  // Need at least 2 * period data points for meaningful ADX
  if (data.length < 2 * period) {
    return { adx: [], plusDI: [], minusDI: [] };
  }

  // Step 1: Calculate True Range and Directional Movement for each bar
  const trueRanges: number[] = [];
  const plusDM: number[] = []; // +DM (Plus Directional Movement)
  const minusDM: number[] = []; // -DM (Minus Directional Movement)

  // First bar has no previous data
  trueRanges.push(data[0].high - data[0].low);
  plusDM.push(0);
  minusDM.push(0);

  for (let i = 1; i < data.length; i++) {
    // True Range
    const tr = calculateTrueRange(data[i].high, data[i].low, data[i - 1].close);
    trueRanges.push(tr);

    // Directional Movement
    const upMove = data[i].high - data[i - 1].high;
    const downMove = data[i - 1].low - data[i].low;

    let pDM = 0;
    let mDM = 0;

    if (upMove > downMove && upMove > 0) {
      pDM = upMove;
    }
    if (downMove > upMove && downMove > 0) {
      mDM = downMove;
    }

    plusDM.push(pDM);
    minusDM.push(mDM);
  }

  // Step 2: Calculate smoothed values using Wilder's smoothing
  const smoothedTR: number[] = [];
  const smoothedPlusDM: number[] = [];
  const smoothedMinusDM: number[] = [];

  // Initial smoothed values (sum of first 'period' values)
  let sumTR = 0;
  let sumPlusDM = 0;
  let sumMinusDM = 0;

  for (let i = 0; i < period; i++) {
    sumTR += trueRanges[i];
    sumPlusDM += plusDM[i];
    sumMinusDM += minusDM[i];
  }

  smoothedTR.push(sumTR);
  smoothedPlusDM.push(sumPlusDM);
  smoothedMinusDM.push(sumMinusDM);

  // Subsequent smoothed values using Wilder's method
  for (let i = period; i < data.length; i++) {
    const sTR = smoothedTR[smoothedTR.length - 1] - (smoothedTR[smoothedTR.length - 1] / period) + trueRanges[i];
    const sPDM = smoothedPlusDM[smoothedPlusDM.length - 1] - (smoothedPlusDM[smoothedPlusDM.length - 1] / period) + plusDM[i];
    const sMDM = smoothedMinusDM[smoothedMinusDM.length - 1] - (smoothedMinusDM[smoothedMinusDM.length - 1] / period) + minusDM[i];

    smoothedTR.push(sTR);
    smoothedPlusDM.push(sPDM);
    smoothedMinusDM.push(sMDM);
  }

  // Step 3: Calculate +DI and -DI
  const plusDIValues: number[] = [];
  const minusDIValues: number[] = [];
  const dxValues: number[] = [];

  for (let i = 0; i < smoothedTR.length; i++) {
    const pDI = smoothedTR[i] === 0 ? 0 : (smoothedPlusDM[i] / smoothedTR[i]) * 100;
    const mDI = smoothedTR[i] === 0 ? 0 : (smoothedMinusDM[i] / smoothedTR[i]) * 100;
    
    plusDIValues.push(pDI);
    minusDIValues.push(mDI);

    // Calculate DX
    const diSum = pDI + mDI;
    const dx = diSum === 0 ? 0 : (Math.abs(pDI - mDI) / diSum) * 100;
    dxValues.push(dx);
  }

  // Step 4: Calculate ADX (smoothed DX)
  const adxValues: number[] = [];

  // Initial ADX is average of first 'period' DX values
  if (dxValues.length >= period) {
    let sumDX = 0;
    for (let i = 0; i < period; i++) {
      sumDX += dxValues[i];
    }
    adxValues.push(sumDX / period);

    // Subsequent ADX values using Wilder's smoothing
    for (let i = period; i < dxValues.length; i++) {
      const adx = ((adxValues[adxValues.length - 1] * (period - 1)) + dxValues[i]) / period;
      adxValues.push(adx);
    }
  }

  // Build output arrays
  const adxOutput: IndicatorOutput = [];
  const plusDIOutput: IndicatorOutput = [];
  const minusDIOutput: IndicatorOutput = [];

  // +DI and -DI start at period - 1
  for (let i = 0; i < plusDIValues.length; i++) {
    const dataIndex = period - 1 + i;
    if (dataIndex < data.length) {
      plusDIOutput.push({
        time: data[dataIndex].time,
        value: plusDIValues[i],
      });
      minusDIOutput.push({
        time: data[dataIndex].time,
        value: minusDIValues[i],
      });
    }
  }

  // ADX starts at 2 * period - 2
  for (let i = 0; i < adxValues.length; i++) {
    const dataIndex = 2 * period - 2 + i;
    if (dataIndex < data.length) {
      adxOutput.push({
        time: data[dataIndex].time,
        value: adxValues[i],
      });
    }
  }

  return {
    adx: adxOutput,
    plusDI: plusDIOutput,
    minusDI: minusDIOutput,
  };
};

/**
 * Get ADX trend strength signal
 * 
 * @param adxValue - ADX value
 * @returns 'weak', 'strong', 'very_strong', or 'extreme'
 */
export const getADXStrength = (adxValue: number): 'weak' | 'strong' | 'very_strong' | 'extreme' => {
  if (adxValue >= ADX_LEVELS.VERY_STRONG) {
    return 'extreme';
  } else if (adxValue >= ADX_LEVELS.STRONG) {
    return 'very_strong';
  } else if (adxValue >= ADX_LEVELS.WEAK) {
    return 'strong';
  }
  return 'weak';
};

/**
 * Get trend direction based on +DI and -DI
 * 
 * @param plusDI - +DI value
 * @param minusDI - -DI value
 * @returns 'bullish', 'bearish', or 'neutral'
 */
export const getADXDirection = (plusDI: number, minusDI: number): 'bullish' | 'bearish' | 'neutral' => {
  const diff = plusDI - minusDI;
  if (Math.abs(diff) < 5) {
    return 'neutral';
  }
  return diff > 0 ? 'bullish' : 'bearish';
};
