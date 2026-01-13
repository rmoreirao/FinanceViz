/**
 * IndicatorPane Component
 * Displays oscillator indicators in a separate chart pane below the main chart
 * Features: synchronized time scale, configurable height, remove button
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  createChart,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type HistogramData,
  ColorType,
} from 'lightweight-charts';
import { X, GripHorizontal } from 'lucide-react';
import type { ChartDimensions, OscillatorIndicator, OHLCV } from '../../types';
import { useThemeContext, useIndicatorContext } from '../../context';
import { CHART_COLORS } from '../../utils';
import {
  calculateRSI,
  calculateMACD,
  calculateStochastic,
  calculateStochasticRSI,
  calculateWilliamsR,
  calculateCCI,
  calculateATR,
  calculateADX,
  calculateROC,
  calculateMomentum,
  calculateOBV,
  calculateCMF,
  calculateMFI,
  calculateAroon,
  calculateAwesomeOscillator,
  getIndicatorMeta,
  type IndicatorValue,
  type MACDValue,
  type StochasticValue,
  type ADXValue,
  type AroonValue,
} from '../Indicators/calculations';

interface IndicatorPaneProps {
  indicator: OscillatorIndicator;
  data: OHLCV[];
  dimensions: ChartDimensions;
  mainChart?: IChartApi | null;
  onResizeStart?: (e: React.MouseEvent) => void;
}

// Default height for new indicator panes
export const DEFAULT_INDICATOR_HEIGHT = 120;
export const MIN_INDICATOR_HEIGHT = 80;
export const MAX_INDICATOR_HEIGHT = 300;

export function IndicatorPane({
  indicator,
  data,
  dimensions,
  mainChart,
  onResizeStart,
}: IndicatorPaneProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<Map<string, ISeriesApi<'Line' | 'Histogram'>>>(new Map());
  const { isDark } = useThemeContext();
  const { removeIndicator } = useIndicatorContext();
  const [isHovered, setIsHovered] = useState(false);

  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

  // Get indicator metadata
  const indicatorMeta = getIndicatorMeta(indicator.type);

  // Calculate indicator values based on type
  const calculateIndicatorValues = useCallback(() => {
    if (data.length === 0) return null;

    const params = indicator.params;

    switch (indicator.type) {
      case 'RSI':
        return { type: 'line', data: calculateRSI(data, params as { period: number }) };
      case 'MACD':
        return {
          type: 'macd',
          data: calculateMACD(data, params as { fastPeriod: number; slowPeriod: number; signalPeriod: number }),
        };
      case 'STOCH':
        return {
          type: 'stochastic',
          data: calculateStochastic(data, params as { kPeriod: number; dPeriod: number; smooth: number }),
        };
      case 'STOCHRSI':
        return {
          type: 'stochastic',
          data: calculateStochasticRSI(data, params as { rsiPeriod: number; stochPeriod: number }),
        };
      case 'WILLR':
        return { type: 'line', data: calculateWilliamsR(data, params as { period: number }) };
      case 'CCI':
        return { type: 'line', data: calculateCCI(data, params as { period: number }) };
      case 'ATR':
        return { type: 'line', data: calculateATR(data, params as { period: number }) };
      case 'ADX':
        return {
          type: 'adx',
          data: calculateADX(data, params as { period: number }),
        };
      case 'ROC':
        return { type: 'line', data: calculateROC(data, params as { period: number }) };
      case 'MOM':
        return { type: 'line', data: calculateMomentum(data, params as { period: number }) };
      case 'OBV':
        return { type: 'line', data: calculateOBV(data) };
      case 'CMF':
        return { type: 'line', data: calculateCMF(data, params as { period: number }) };
      case 'MFI':
        return { type: 'line', data: calculateMFI(data, params as { period: number }) };
      case 'AROON':
        return {
          type: 'aroon',
          data: calculateAroon(data, params as { period: number }),
        };
      case 'AO':
        return {
          type: 'histogram',
          data: calculateAwesomeOscillator(data, params as { fastPeriod: number; slowPeriod: number }),
        };
      default:
        return null;
    }
  }, [data, indicator.type, indicator.params]);

  // Get reference line levels based on indicator type
  const getReferenceLines = useCallback(() => {
    switch (indicator.type) {
      case 'RSI':
      case 'MFI':
        return [
          { value: 70, color: colors.bearish + '80', title: 'Overbought' },
          { value: 30, color: colors.bullish + '80', title: 'Oversold' },
          { value: 50, color: colors.grid, title: '' },
        ];
      case 'STOCH':
      case 'STOCHRSI':
        return [
          { value: 80, color: colors.bearish + '80', title: 'Overbought' },
          { value: 20, color: colors.bullish + '80', title: 'Oversold' },
        ];
      case 'WILLR':
        return [
          { value: -20, color: colors.bearish + '80', title: 'Overbought' },
          { value: -80, color: colors.bullish + '80', title: 'Oversold' },
        ];
      case 'CCI':
        return [
          { value: 100, color: colors.bearish + '80', title: '+100' },
          { value: -100, color: colors.bullish + '80', title: '-100' },
          { value: 0, color: colors.grid, title: '' },
        ];
      case 'CMF':
        return [{ value: 0, color: colors.grid, title: '' }];
      case 'ROC':
      case 'MOM':
      case 'AO':
        return [{ value: 0, color: colors.grid, title: '' }];
      default:
        return [];
    }
  }, [indicator.type, colors]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || dimensions.width === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: dimensions.width,
      height: indicator.height || DEFAULT_INDICATOR_HEIGHT,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        vertLine: {
          color: colors.crosshair,
          labelBackgroundColor: colors.crosshair,
        },
        horzLine: {
          color: colors.crosshair,
          labelBackgroundColor: colors.crosshair,
        },
      },
      rightPriceScale: {
        borderColor: colors.grid,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: colors.grid,
        visible: false, // Hide time scale (synced with main)
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Sync time scale with main chart if provided
    if (mainChart) {
      const mainTimeScale = mainChart.timeScale();
      const indicatorTimeScale = chart.timeScale();

      mainTimeScale.subscribeVisibleLogicalRangeChange((range) => {
        if (range) {
          indicatorTimeScale.setVisibleLogicalRange(range);
        }
      });

      indicatorTimeScale.subscribeVisibleLogicalRangeChange((range) => {
        if (range) {
          const mainRange = mainTimeScale.getVisibleLogicalRange();
          if (mainRange && (mainRange.from !== range.from || mainRange.to !== range.to)) {
            mainTimeScale.setVisibleLogicalRange(range);
          }
        }
      });
    }

    // Double-click to reset zoom
    const handleDoubleClick = () => {
      chart.timeScale().fitContent();
      if (mainChart) {
        mainChart.timeScale().fitContent();
      }
    };
    chartContainerRef.current.addEventListener('dblclick', handleDoubleClick);

    return () => {
      chartContainerRef.current?.removeEventListener('dblclick', handleDoubleClick);
      seriesRefs.current.clear();
      chart.remove();
      chartRef.current = null;
    };
  }, [dimensions.width, indicator.height, colors, mainChart]);

  // Update indicator data
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const result = calculateIndicatorValues();
    if (!result) return;

    const chart = chartRef.current;

    // Clear existing series
    seriesRefs.current.forEach((series) => {
      chart.removeSeries(series);
    });
    seriesRefs.current.clear();

    // Create series based on indicator type
    if (result.type === 'line') {
      const lineData = result.data as IndicatorValue[];
      const series = chart.addSeries(LineSeries, {
        color: indicator.color,
        lineWidth: 2,
        priceScaleId: 'right',
      });
      series.setData(
        lineData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.value,
        }))
      );
      seriesRefs.current.set('main', series);
    } else if (result.type === 'macd') {
      const macdData = result.data as MACDValue[];
      
      // MACD line
      const macdSeries = chart.addSeries(LineSeries, {
        color: '#2962FF',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      macdSeries.setData(
        macdData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.macd,
        }))
      );
      seriesRefs.current.set('macd', macdSeries);

      // Signal line
      const signalSeries = chart.addSeries(LineSeries, {
        color: '#FF6D00',
        lineWidth: 2,
        priceScaleId: 'right',
      });
      signalSeries.setData(
        macdData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.signal,
        }))
      );
      seriesRefs.current.set('signal', signalSeries);

      // Histogram
      const histogramSeries = chart.addSeries(HistogramSeries, {
        priceScaleId: 'right',
      });
      histogramSeries.setData(
        macdData.map((d) => ({
          time: d.time as HistogramData['time'],
          value: d.histogram,
          color: d.histogram >= 0 ? colors.bullish + 'B3' : colors.bearish + 'B3',
        }))
      );
      seriesRefs.current.set('histogram', histogramSeries);
    } else if (result.type === 'stochastic') {
      const stochData = result.data as StochasticValue[];

      // %K line
      const kSeries = chart.addSeries(LineSeries, {
        color: indicator.color,
        lineWidth: 2,
        priceScaleId: 'right',
      });
      kSeries.setData(
        stochData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.k,
        }))
      );
      seriesRefs.current.set('k', kSeries);

      // %D line
      const dSeries = chart.addSeries(LineSeries, {
        color: '#FF6D00',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        priceScaleId: 'right',
      });
      dSeries.setData(
        stochData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.d,
        }))
      );
      seriesRefs.current.set('d', dSeries);
    } else if (result.type === 'adx') {
      const adxData = result.data as ADXValue[];

      // ADX line
      const adxSeries = chart.addSeries(LineSeries, {
        color: indicator.color,
        lineWidth: 2,
        priceScaleId: 'right',
      });
      adxSeries.setData(
        adxData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.adx,
        }))
      );
      seriesRefs.current.set('adx', adxSeries);

      // +DI line
      const plusDISeries = chart.addSeries(LineSeries, {
        color: colors.bullish,
        lineWidth: 1,
        priceScaleId: 'right',
      });
      plusDISeries.setData(
        adxData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.plusDI,
        }))
      );
      seriesRefs.current.set('plusDI', plusDISeries);

      // -DI line
      const minusDISeries = chart.addSeries(LineSeries, {
        color: colors.bearish,
        lineWidth: 1,
        priceScaleId: 'right',
      });
      minusDISeries.setData(
        adxData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.minusDI,
        }))
      );
      seriesRefs.current.set('minusDI', minusDISeries);
    } else if (result.type === 'aroon') {
      const aroonData = result.data as AroonValue[];

      // Aroon Up
      const upSeries = chart.addSeries(LineSeries, {
        color: colors.bullish,
        lineWidth: 2,
        priceScaleId: 'right',
      });
      upSeries.setData(
        aroonData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.aroonUp,
        }))
      );
      seriesRefs.current.set('aroonUp', upSeries);

      // Aroon Down
      const downSeries = chart.addSeries(LineSeries, {
        color: colors.bearish,
        lineWidth: 2,
        priceScaleId: 'right',
      });
      downSeries.setData(
        aroonData.map((d) => ({
          time: d.time as LineData['time'],
          value: d.aroonDown,
        }))
      );
      seriesRefs.current.set('aroonDown', downSeries);
    } else if (result.type === 'histogram') {
      const histData = result.data as IndicatorValue[];
      const series = chart.addSeries(HistogramSeries, {
        priceScaleId: 'right',
      });
      series.setData(
        histData.map((d, i) => {
          const prevValue = i > 0 ? histData[i - 1].value : 0;
          const isRising = d.value > prevValue;
          return {
            time: d.time as HistogramData['time'],
            value: d.value,
            color: d.value >= 0
              ? (isRising ? colors.bullish : colors.bullish + '80')
              : (isRising ? colors.bearish + '80' : colors.bearish),
          };
        })
      );
      seriesRefs.current.set('histogram', series);
    }

    // Add reference lines (price lines)
    const mainSeries = seriesRefs.current.get('main') || 
                       seriesRefs.current.get('macd') || 
                       seriesRefs.current.get('k') ||
                       seriesRefs.current.get('adx') ||
                       seriesRefs.current.get('aroonUp') ||
                       seriesRefs.current.get('histogram');
    
    if (mainSeries && 'createPriceLine' in mainSeries) {
      getReferenceLines().forEach(({ value, color }) => {
        (mainSeries as ISeriesApi<'Line'>).createPriceLine({
          price: value,
          color,
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: false,
        });
      });
    }

    // Fit content
    chart.timeScale().fitContent();
  }, [data, calculateIndicatorValues, indicator.color, colors, getReferenceLines]);

  // Update chart colors when theme changes
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        vertLine: {
          color: colors.crosshair,
          labelBackgroundColor: colors.crosshair,
        },
        horzLine: {
          color: colors.crosshair,
          labelBackgroundColor: colors.crosshair,
        },
      },
      rightPriceScale: {
        borderColor: colors.grid,
      },
      timeScale: {
        borderColor: colors.grid,
      },
    });
  }, [colors]);

  // Resize chart when dimensions change
  useEffect(() => {
    if (!chartRef.current || dimensions.width === 0) return;
    chartRef.current.resize(dimensions.width, indicator.height || DEFAULT_INDICATOR_HEIGHT);
  }, [dimensions.width, indicator.height]);

  // Handle remove indicator
  const handleRemove = useCallback(() => {
    removeIndicator(indicator.id);
  }, [removeIndicator, indicator.id]);

  return (
    <div
      className="relative border-t border-gray-200 dark:border-gray-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Resize handle */}
      {onResizeStart && (
        <div
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-10 flex items-center justify-center hover:bg-blue-500/30 transition-colors"
          onMouseDown={onResizeStart}
        >
          {isHovered && (
            <GripHorizontal className="w-4 h-4 text-gray-400" />
          )}
        </div>
      )}

      {/* Indicator label and controls */}
      <div
        className={`absolute top-2 left-2 z-10 flex items-center gap-2 px-2 py-1 rounded bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-70'
        }`}
      >
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {indicatorMeta?.shortName || indicator.type}
        </span>
        <button
          onClick={handleRemove}
          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
          title="Remove indicator"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Chart container */}
      <div
        ref={chartContainerRef}
        className="w-full"
        style={{ height: indicator.height || DEFAULT_INDICATOR_HEIGHT }}
      />
    </div>
  );
}
