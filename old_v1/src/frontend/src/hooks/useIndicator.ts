/**
 * useIndicator Hook
 * Calculate indicator values from OHLCV data
 * Memoizes calculations and recalculates on data or params change
 */

import { useMemo } from 'react';
import type { OHLCV } from '../types';
import type { IndicatorCalculationFn } from '../components/Indicators/calculations/types';

/**
 * Hook to calculate indicator values with memoization
 * @param data - OHLCV data array
 * @param calculate - Indicator calculation function
 * @param params - Indicator parameters
 * @returns Memoized indicator values
 */
export function useIndicator<TParams, TOutput>(
  data: OHLCV[],
  calculate: IndicatorCalculationFn<TParams, TOutput>,
  params: TParams
): TOutput[] {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    try {
      return calculate(data, params);
    } catch (error) {
      console.error('Error calculating indicator:', error);
      return [];
    }
  }, [data, calculate, params]);
}

/**
 * Hook to calculate multiple indicators at once
 * @param data - OHLCV data array
 * @param indicators - Array of indicator configurations
 * @returns Map of indicator ID to calculated values
 */
export function useMultipleIndicators<TParams, TOutput>(
  data: OHLCV[],
  indicators: Array<{
    id: string;
    calculate: IndicatorCalculationFn<TParams, TOutput>;
    params: TParams;
  }>
): Map<string, TOutput[]> {
  return useMemo(() => {
    const results = new Map<string, TOutput[]>();
    
    if (!data || data.length === 0) {
      return results;
    }
    
    for (const indicator of indicators) {
      try {
        const values = indicator.calculate(data, indicator.params);
        results.set(indicator.id, values);
      } catch (error) {
        console.error(`Error calculating indicator ${indicator.id}:`, error);
        results.set(indicator.id, []);
      }
    }
    
    return results;
  }, [data, indicators]);
}
