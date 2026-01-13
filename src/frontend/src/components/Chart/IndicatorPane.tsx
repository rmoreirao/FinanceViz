/**
 * Indicator Pane Component
 * Renders oscillator indicators in separate panes below the main chart
 *
 * TASK-062: Oscillator Indicator Pane
 *
 * Features:
 * - Separate panel below main chart
 * - Own price scale (0-100 for RSI, etc.)
 * - Reference lines (overbought/oversold)
 * - Synchronized time scale
 */

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import {
  createChart,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type HistogramData,
  type Time,
  type SeriesType,
  type MouseEventParams,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';
import type { OHLCV } from '../../types';
import { useTheme } from '../../context';
import type { OscillatorIndicator } from '../../context/IndicatorContext';
import {
  getIndicatorCalculation,
  type IndicatorOutput,
  type MACDOutput,
  type StochasticOutput,
} from '../Indicators/calculations';

interface IndicatorPaneProps {
  data: OHLCV[];
  indicator: OscillatorIndicator;
  width: number;
  height: number;
  onCrosshairMove?: (time: Time | null) => void;
}

// LineWidth type from lightweight-charts expects 1, 2, 3, or 4
type ValidLineWidth = 1 | 2 | 3 | 4;
const toValidLineWidth = (width: number): ValidLineWidth => {
  if (width <= 1) return 1;
  if (width === 2) return 2;
  if (width === 3) return 3;
  return 4;
};

/**
 * Convert indicator output to line data format
 */
function toIndicatorLineData(indicatorData: IndicatorOutput): LineData[] {
  return indicatorData.map((point) => ({
    time: point.time as Time,
    value: point.value,
  }));
}

/**
 * Convert histogram data with colors
 */
function toHistogramData(
  indicatorData: IndicatorOutput,
  positiveColor: string,
  negativeColor: string
): HistogramData[] {
  return indicatorData.map((point) => ({
    time: point.time as Time,
    value: point.value,
    color: point.value >= 0 ? positiveColor : negativeColor,
  }));
}

/**
 * Get display name for indicator type
 */
function getIndicatorDisplayName(type: string): string {
  const names: Record<string, string> = {
    rsi: 'RSI',
    macd: 'MACD',
    stochastic: 'Stochastic',
    stochasticRsi: 'Stoch RSI',
    williamsR: 'Williams %R',
    cci: 'CCI',
    atr: 'ATR',
    adx: 'ADX',
    roc: 'ROC',
    momentum: 'Momentum',
    obv: 'OBV',
    cmf: 'CMF',
    mfi: 'MFI',
    aroon: 'Aroon',
    awesomeOscillator: 'AO',
  };
  return names[type] || type.toUpperCase();
}

/**
 * Get the scale range for an indicator
 */
function getIndicatorScale(type: string): { min?: number; max?: number } {
  switch (type) {
    case 'rsi':
    case 'mfi':
    case 'stochastic':
    case 'stochasticRsi':
    case 'aroon':
      return { min: 0, max: 100 };
    case 'williamsR':
      return { min: -100, max: 0 };
    case 'cmf':
      return { min: -1, max: 1 };
    default:
      return {};
  }
}

/**
 * Get reference lines for an indicator
 */
function getReferenceLines(
  indicator: OscillatorIndicator
): { value: number; color: string; label: string }[] {
  const params = indicator.params as unknown as Record<string, number>;
  
  switch (indicator.type) {
    case 'rsi':
    case 'mfi':
      return [
        { value: params.overbought ?? 70, color: '#ef4444', label: 'Overbought' },
        { value: params.oversold ?? 30, color: '#22c55e', label: 'Oversold' },
        { value: 50, color: '#6b7280', label: 'Midline' },
      ];
    case 'stochastic':
    case 'stochasticRsi':
      return [
        { value: params.overbought ?? 80, color: '#ef4444', label: 'Overbought' },
        { value: params.oversold ?? 20, color: '#22c55e', label: 'Oversold' },
      ];
    case 'williamsR':
      return [
        { value: params.overbought ?? -20, color: '#ef4444', label: 'Overbought' },
        { value: params.oversold ?? -80, color: '#22c55e', label: 'Oversold' },
      ];
    case 'cci':
      return [
        { value: 100, color: '#ef4444', label: '+100' },
        { value: -100, color: '#22c55e', label: '-100' },
        { value: 0, color: '#6b7280', label: 'Zero' },
      ];
    case 'macd':
    case 'roc':
    case 'momentum':
    case 'awesomeOscillator':
      return [{ value: 0, color: '#6b7280', label: 'Zero' }];
    case 'cmf':
      return [{ value: 0, color: '#6b7280', label: 'Zero' }];
    default:
      return [];
  }
}

/**
 * IndicatorPane Component
 * Renders a single oscillator indicator in its own pane
 */
export function IndicatorPane({
  data,
  indicator,
  width,
  height,
  onCrosshairMove,
}: IndicatorPaneProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<SeriesType>[]>([]);
  const { theme } = useTheme();
  const [currentValue, setCurrentValue] = useState<number | null>(null);

  // Chart theme colors based on light/dark mode
  const chartColors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      background: isDark ? '#1f2937' : '#ffffff',
      textColor: isDark ? '#9ca3af' : '#374151',
      gridColor: isDark ? '#374151' : '#e5e7eb',
      borderColor: isDark ? '#4b5563' : '#d1d5db',
    };
  }, [theme]);

  // Handle crosshair move
  const handleCrosshairMove = useCallback(
    (param: MouseEventParams) => {
      if (onCrosshairMove) {
        onCrosshairMove(param.time ?? null);
      }
      
      // Update current value display
      if (param.time && seriesRefs.current.length > 0) {
        const mainSeries = seriesRefs.current[0];
        const data = param.seriesData.get(mainSeries);
        if (data && 'value' in data) {
          setCurrentValue(data.value as number);
        }
      } else {
        setCurrentValue(null);
      }
    },
    [onCrosshairMove]
  );

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || width === 0 || height === 0) return;

    const scale = getIndicatorScale(indicator.type);

    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: chartColors.background },
        textColor: chartColors.textColor,
      },
      grid: {
        vertLines: { color: chartColors.gridColor },
        horzLines: { color: chartColors.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: 'rgba(107, 114, 128, 0.5)',
          style: 0,
          labelBackgroundColor: '#374151',
        },
        horzLine: {
          width: 1,
          color: 'rgba(107, 114, 128, 0.5)',
          style: 0,
          labelBackgroundColor: '#374151',
        },
      },
      rightPriceScale: {
        borderColor: chartColors.borderColor,
        autoScale: scale.min === undefined,
        ...(scale.min !== undefined && { scaleMargins: { top: 0.1, bottom: 0.1 } }),
      },
      timeScale: {
        borderColor: chartColors.borderColor,
        visible: false, // Hide time scale as it syncs with main chart
      },
      handleScale: {
        mouseWheel: false,
        pinch: false,
      },
      handleScroll: {
        mouseWheel: false,
        pressedMouseMove: false,
      },
    });

    chartRef.current = chart;
    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Apply fixed scale if defined
    if (scale.min !== undefined && scale.max !== undefined) {
      chart.priceScale('right').applyOptions({
        autoScale: false,
        scaleMargins: { top: 0.05, bottom: 0.05 },
      });
    }

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      chartRef.current = null;
      seriesRefs.current = [];
    };
  }, [width, height, chartColors, indicator.type, handleCrosshairMove]);

  // Update chart colors when theme changes
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: chartColors.background },
        textColor: chartColors.textColor,
      },
      grid: {
        vertLines: { color: chartColors.gridColor },
        horzLines: { color: chartColors.gridColor },
      },
      rightPriceScale: {
        borderColor: chartColors.borderColor,
      },
    });
  }, [chartColors]);

  // Calculate and render indicator data
  useEffect(() => {
    if (!chartRef.current || data.length === 0 || !indicator.visible) return;

    const chart = chartRef.current;
    const lineWidth = toValidLineWidth(indicator.lineWidth);

    // Remove existing series
    seriesRefs.current.forEach((series) => {
      try {
        chart.removeSeries(series);
      } catch {
        // Series already removed
      }
    });
    seriesRefs.current = [];

    const calculate = getIndicatorCalculation(indicator.type);

    try {
      switch (indicator.type) {
        case 'rsi':
        case 'cci':
        case 'atr':
        case 'roc':
        case 'momentum':
        case 'obv':
        case 'cmf':
        case 'mfi':
        case 'williamsR': {
          const indicatorData = calculate(data, indicator.params) as IndicatorOutput;
          if (indicatorData.length > 0) {
            const series = chart.addSeries(LineSeries, {
              color: indicator.color,
              lineWidth,
              priceLineVisible: false,
              lastValueVisible: true,
            });
            series.setData(toIndicatorLineData(indicatorData));
            seriesRefs.current.push(series);

            // Add reference lines
            const refLines = getReferenceLines(indicator);
            refLines.forEach((refLine) => {
              series.createPriceLine({
                price: refLine.value,
                color: refLine.color,
                lineWidth: 1,
                lineStyle: 2, // Dashed
                axisLabelVisible: false,
              });
            });
          }
          break;
        }

        case 'macd': {
          const macdData = calculate(data, indicator.params) as MACDOutput;
          if (macdData.macdLine.length > 0) {
            // MACD Line
            const macdSeries = chart.addSeries(LineSeries, {
              color: indicator.color,
              lineWidth,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            macdSeries.setData(toIndicatorLineData(macdData.macdLine));
            seriesRefs.current.push(macdSeries);

            // Signal Line
            const signalSeries = chart.addSeries(LineSeries, {
              color: '#FF9800',
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            signalSeries.setData(toIndicatorLineData(macdData.signalLine));
            seriesRefs.current.push(signalSeries);

            // Histogram
            const histogramSeries = chart.addSeries(HistogramSeries, {
              priceLineVisible: false,
              lastValueVisible: false,
            });
            histogramSeries.setData(
              toHistogramData(macdData.histogram, '#22c55e', '#ef4444')
            );
            seriesRefs.current.push(histogramSeries);

            // Zero line
            macdSeries.createPriceLine({
              price: 0,
              color: '#6b7280',
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: false,
            });
          }
          break;
        }

        case 'stochastic':
        case 'stochasticRsi': {
          const stochData = calculate(data, indicator.params) as StochasticOutput;
          if (stochData.k.length > 0) {
            // %K line
            const kSeries = chart.addSeries(LineSeries, {
              color: indicator.color,
              lineWidth,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            kSeries.setData(toIndicatorLineData(stochData.k));
            seriesRefs.current.push(kSeries);

            // %D line
            const dSeries = chart.addSeries(LineSeries, {
              color: '#FF9800',
              lineWidth: 1,
              lineStyle: 2,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            dSeries.setData(toIndicatorLineData(stochData.d));
            seriesRefs.current.push(dSeries);

            // Reference lines
            const refLines = getReferenceLines(indicator);
            refLines.forEach((refLine) => {
              kSeries.createPriceLine({
                price: refLine.value,
                color: refLine.color,
                lineWidth: 1,
                lineStyle: 2,
                axisLabelVisible: false,
              });
            });
          }
          break;
        }

        case 'adx': {
          const adxData = calculate(data, indicator.params) as {
            adx: IndicatorOutput;
            plusDI: IndicatorOutput;
            minusDI: IndicatorOutput;
          };
          if (adxData.adx.length > 0) {
            // ADX line
            const adxSeries = chart.addSeries(LineSeries, {
              color: indicator.color,
              lineWidth,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            adxSeries.setData(toIndicatorLineData(adxData.adx));
            seriesRefs.current.push(adxSeries);

            // +DI line
            const plusDISeries = chart.addSeries(LineSeries, {
              color: '#22c55e',
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            plusDISeries.setData(toIndicatorLineData(adxData.plusDI));
            seriesRefs.current.push(plusDISeries);

            // -DI line
            const minusDISeries = chart.addSeries(LineSeries, {
              color: '#ef4444',
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            minusDISeries.setData(toIndicatorLineData(adxData.minusDI));
            seriesRefs.current.push(minusDISeries);

            // ADX levels
            adxSeries.createPriceLine({
              price: 25,
              color: '#6b7280',
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: false,
            });
          }
          break;
        }

        case 'aroon': {
          const aroonData = calculate(data, indicator.params) as {
            aroonUp: IndicatorOutput;
            aroonDown: IndicatorOutput;
          };
          if (aroonData.aroonUp.length > 0) {
            // Aroon Up
            const aroonUpSeries = chart.addSeries(LineSeries, {
              color: '#22c55e',
              lineWidth,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            aroonUpSeries.setData(toIndicatorLineData(aroonData.aroonUp));
            seriesRefs.current.push(aroonUpSeries);

            // Aroon Down
            const aroonDownSeries = chart.addSeries(LineSeries, {
              color: '#ef4444',
              lineWidth,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            aroonDownSeries.setData(toIndicatorLineData(aroonData.aroonDown));
            seriesRefs.current.push(aroonDownSeries);

            // Reference lines
            aroonUpSeries.createPriceLine({
              price: 70,
              color: '#6b7280',
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: false,
            });
            aroonUpSeries.createPriceLine({
              price: 30,
              color: '#6b7280',
              lineWidth: 1,
              lineStyle: 2,
              axisLabelVisible: false,
            });
          }
          break;
        }

        case 'awesomeOscillator': {
          const aoData = calculate(data, indicator.params) as IndicatorOutput;
          if (aoData.length > 0) {
            const aoSeries = chart.addSeries(HistogramSeries, {
              priceLineVisible: false,
              lastValueVisible: false,
            });
            aoSeries.setData(toHistogramData(aoData, '#22c55e', '#ef4444'));
            seriesRefs.current.push(aoSeries);

            // Zero line (create via a line series)
            const zeroLineSeries = chart.addSeries(LineSeries, {
              color: '#6b7280',
              lineWidth: 1,
              lineStyle: 2,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            zeroLineSeries.setData(
              aoData.map((point) => ({ time: point.time as Time, value: 0 }))
            );
            seriesRefs.current.push(zeroLineSeries);
          }
          break;
        }

        default:
          console.warn(`Unknown oscillator type: ${indicator.type}`);
      }

      // Fit content
      chart.timeScale().fitContent();
    } catch (error) {
      console.error(`Error calculating indicator ${indicator.type}:`, error);
    }
  }, [data, indicator]);

  // Resize chart when dimensions change
  useEffect(() => {
    if (!chartRef.current || width === 0 || height === 0) return;
    chartRef.current.resize(width, height);
  }, [width, height]);

  if (!indicator.visible) {
    return null;
  }

  return (
    <div className="relative border-t border-gray-200 dark:border-gray-700">
      {/* Pane header with indicator name and current value */}
      <div className="absolute top-1 left-2 z-10 flex items-center gap-2 text-xs font-mono">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/90 dark:bg-gray-800/90"
          style={{ color: indicator.color }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: indicator.color }}
          />
          {getIndicatorDisplayName(indicator.type)}
          {currentValue !== null && (
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              {currentValue.toFixed(2)}
            </span>
          )}
        </span>
      </div>

      {/* Chart container */}
      <div
        ref={chartContainerRef}
        className="w-full"
        style={{ height: height > 0 ? height : 100 }}
        data-testid={`indicator-pane-${indicator.type}`}
      />
    </div>
  );
}

export default IndicatorPane;
