/**
 * useIndicator Hook
 * Hook to calculate and manage indicator data
 *
 * TASK-064: useIndicator Hook
 *
 * Features:
 * - Takes OHLCV data and indicator config
 * - Returns calculated indicator data
 * - Memoized calculation
 * - Recalculates when data or params change
 */

import { useMemo } from 'react';
import type { OHLCV } from '../types';
import type { IndicatorType } from '../types/indicators';
import {
  getIndicatorCalculation,
  type IndicatorOutput,
  type BollingerBandsOutput,
  type IchimokuOutput,
  type MACDOutput,
  type StochasticOutput,
} from '../components/Indicators/calculations';

/**
 * Union type for all possible indicator outputs
 */
export type IndicatorResult =
  | IndicatorOutput
  | BollingerBandsOutput
  | IchimokuOutput
  | MACDOutput
  | StochasticOutput
  | { aroonUp: IndicatorOutput; aroonDown: IndicatorOutput }
  | { adx: IndicatorOutput; plusDI: IndicatorOutput; minusDI: IndicatorOutput }
  | { upper: IndicatorOutput; middle: IndicatorOutput; lower: IndicatorOutput }
  | null;

/**
 * Indicator configuration
 */
export interface IndicatorConfig {
  type: IndicatorType;
  params: Record<string, unknown>;
  enabled?: boolean;
}

/**
 * Options for the useIndicator hook
 */
export interface UseIndicatorOptions {
  /** Whether the indicator is enabled */
  enabled?: boolean;
}

/**
 * Return type for the useIndicator hook
 */
export interface UseIndicatorResult<T = IndicatorResult> {
  /** The calculated indicator data */
  data: T;
  /** Whether the calculation was successful */
  isSuccess: boolean;
  /** Error message if calculation failed */
  error: string | null;
  /** Indicator type */
  type: IndicatorType;
}

/**
 * Hook to calculate indicator data
 *
 * @param ohlcvData - OHLCV data array
 * @param config - Indicator configuration (type and params)
 * @param options - Additional options
 * @returns Calculated indicator data
 *
 * @example
 * const { data, isSuccess, error } = useIndicator(
 *   stockData,
 *   { type: 'sma', params: { period: 20 } }
 * );
 *
 * @example
 * // With Bollinger Bands
 * const { data } = useIndicator(
 *   stockData,
 *   { type: 'bollingerBands', params: { period: 20, stdDevMultiplier: 2 } }
 * );
 * // data = { upper: [...], middle: [...], lower: [...] }
 */
export function useIndicator<T extends IndicatorResult = IndicatorResult>(
  ohlcvData: OHLCV[],
  config: IndicatorConfig,
  options: UseIndicatorOptions = {}
): UseIndicatorResult<T> {
  const { enabled = true } = options;
  const { type, params } = config;

  return useMemo(() => {
    // Return early if disabled or no data
    if (!enabled || !ohlcvData || ohlcvData.length === 0) {
      return {
        data: null as T,
        isSuccess: false,
        error: !enabled ? 'Indicator disabled' : 'No data available',
        type,
      };
    }

    try {
      const calculate = getIndicatorCalculation(type);
      const result = calculate(ohlcvData, params);

      return {
        data: result as T,
        isSuccess: true,
        error: null,
        type,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Error calculating ${type} indicator:`, err);

      return {
        data: null as T,
        isSuccess: false,
        error: errorMessage,
        type,
      };
    }
  }, [ohlcvData, type, params, enabled]);
}

/**
 * Hook to calculate multiple indicators at once
 *
 * @param ohlcvData - OHLCV data array
 * @param configs - Array of indicator configurations
 * @returns Array of calculated indicator results
 *
 * @example
 * const indicators = useIndicators(stockData, [
 *   { type: 'sma', params: { period: 20 } },
 *   { type: 'ema', params: { period: 50 } },
 *   { type: 'rsi', params: { period: 14 } },
 * ]);
 */
export function useMultipleIndicators(
  ohlcvData: OHLCV[],
  configs: IndicatorConfig[]
): UseIndicatorResult[] {
  return useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) {
      return configs.map((config) => ({
        data: null,
        isSuccess: false,
        error: 'No data available',
        type: config.type,
      }));
    }

    return configs.map((config) => {
      const { type, params, enabled = true } = config;

      if (!enabled) {
        return {
          data: null,
          isSuccess: false,
          error: 'Indicator disabled',
          type,
        };
      }

      try {
        const calculate = getIndicatorCalculation(type);
        const result = calculate(ohlcvData, params);

        return {
          data: result,
          isSuccess: true,
          error: null,
          type,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error calculating ${type} indicator:`, err);

        return {
          data: null,
          isSuccess: false,
          error: errorMessage,
          type,
        };
      }
    });
  }, [ohlcvData, configs]);
}

/**
 * Type guard to check if result is a simple IndicatorOutput
 */
export function isSimpleOutput(result: IndicatorResult): result is IndicatorOutput {
  return Array.isArray(result);
}

/**
 * Type guard to check if result is BollingerBandsOutput
 */
export function isBollingerOutput(result: IndicatorResult): result is BollingerBandsOutput {
  return (
    result !== null &&
    !Array.isArray(result) &&
    'upper' in result &&
    'middle' in result &&
    'lower' in result
  );
}

/**
 * Type guard to check if result is IchimokuOutput
 */
export function isIchimokuOutput(result: IndicatorResult): result is IchimokuOutput {
  return (
    result !== null &&
    !Array.isArray(result) &&
    'tenkanSen' in result &&
    'kijunSen' in result
  );
}

/**
 * Type guard to check if result is MACDOutput
 */
export function isMACDOutput(result: IndicatorResult): result is MACDOutput {
  return (
    result !== null &&
    !Array.isArray(result) &&
    'macdLine' in result &&
    'signalLine' in result &&
    'histogram' in result
  );
}

/**
 * Type guard to check if result is StochasticOutput
 */
export function isStochasticOutput(result: IndicatorResult): result is StochasticOutput {
  return result !== null && !Array.isArray(result) && 'k' in result && 'd' in result;
}

export default useIndicator;
