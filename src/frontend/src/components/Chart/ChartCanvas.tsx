/**
 * Chart Canvas Component
 * Renders charts using TradingView Lightweight Charts
 * 
 * TASK-017: Candlestick Chart
 * TASK-018: Line Chart
 * TASK-019: Bar (OHLC) Chart
 * TASK-020: Area Chart
 * TASK-021: Hollow Candlestick Chart
 * TASK-022: Heikin-Ashi Chart
 * TASK-023: Baseline Chart
 * TASK-061: Overlay Indicator Rendering
 */

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  BaselineSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type BarData,
  type AreaData,
  type BaselineData,
  type HistogramData,
  type Time,
  type SeriesType,
  type MouseEventParams,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';
import type { OHLCV } from '../../types';
import type { ChartType } from '../../types';
import { useTheme, useIndicators } from '../../context';
import { toHeikinAshi } from '../../utils/heikinAshi';
import { Legend } from './Legend';
import {
  getIndicatorCalculation,
  type IndicatorOutput,
  type BollingerBandsOutput,
  type IchimokuOutput,
} from '../Indicators/calculations';
import type { OverlayIndicator } from '../../context/IndicatorContext';

interface ChartCanvasProps {
  data: OHLCV[];
  chartType: ChartType;
  width: number;
  height: number;
  symbol?: string;
}

// Colors for bullish/bearish candles
const BULLISH_COLOR = '#22c55e'; // Green
const BEARISH_COLOR = '#ef4444'; // Red
const LINE_COLOR = '#3b82f6'; // Blue
const AREA_TOP_COLOR = 'rgba(59, 130, 246, 0.4)';
const AREA_BOTTOM_COLOR = 'rgba(59, 130, 246, 0.0)';

/**
 * Convert OHLCV data to Lightweight Charts format
 */
function toChartTime(timestamp: number): Time {
  return timestamp as Time;
}

/**
 * Convert data to candlestick format
 */
function toCandlestickData(data: OHLCV[]): CandlestickData[] {
  return data.map((bar) => ({
    time: toChartTime(bar.time),
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  }));
}

/**
 * Convert data to hollow candlestick format
 * Hollow body when close > open, filled when close < open
 * Color is determined by comparing to previous close
 */
function toHollowCandlestickData(data: OHLCV[]): CandlestickData[] {
  return data.map((bar, index) => {
    const prevClose = index > 0 ? data[index - 1].close : bar.open;
    const isBullish = bar.close >= prevClose; // Compare to previous close for color
    const isHollow = bar.close > bar.open; // Hollow when current close > current open
    
    return {
      time: toChartTime(bar.time),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      // Color based on comparison to previous close
      color: isHollow 
        ? (isBullish ? 'transparent' : 'transparent')
        : (isBullish ? BULLISH_COLOR : BEARISH_COLOR),
      borderColor: isBullish ? BULLISH_COLOR : BEARISH_COLOR,
      wickColor: isBullish ? BULLISH_COLOR : BEARISH_COLOR,
    };
  });
}

/**
 * Convert data to line format (closing prices)
 */
function toLineData(data: OHLCV[]): LineData[] {
  return data.map((bar) => ({
    time: toChartTime(bar.time),
    value: bar.close,
  }));
}

/**
 * Convert data to bar (OHLC) format
 */
function toBarData(data: OHLCV[]): BarData[] {
  return data.map((bar) => ({
    time: toChartTime(bar.time),
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  }));
}

/**
 * Convert data to area format
 */
function toAreaData(data: OHLCV[]): AreaData[] {
  return data.map((bar) => ({
    time: toChartTime(bar.time),
    value: bar.close,
  }));
}

/**
 * Convert data to baseline format
 */
function toBaselineData(data: OHLCV[]): BaselineData[] {
  return data.map((bar) => ({
    time: toChartTime(bar.time),
    value: bar.close,
  }));
}

/**
 * Get baseline value (first visible price)
 */
function getBaselineValue(data: OHLCV[]): number {
  if (data.length === 0) return 0;
  return data[0].close;
}

/**
 * Convert data to volume histogram format
 * Color matches price direction (green/red)
 */
function toVolumeData(data: OHLCV[]): HistogramData[] {
  return data.map((bar) => ({
    time: toChartTime(bar.time),
    value: bar.volume,
    color: bar.close >= bar.open ? BULLISH_COLOR_ALPHA : BEARISH_COLOR_ALPHA,
  }));
}

// Alpha versions of colors for volume bars
const BULLISH_COLOR_ALPHA = 'rgba(34, 197, 94, 0.5)';
const BEARISH_COLOR_ALPHA = 'rgba(239, 68, 68, 0.5)';

// Ichimoku cloud colors
const ICHIMOKU_CLOUD_BULLISH = 'rgba(76, 175, 80, 0.2)';
const ICHIMOKU_CLOUD_BEARISH = 'rgba(244, 67, 54, 0.2)';

/**
 * Convert indicator output to line data format
 */
function toIndicatorLineData(indicatorData: IndicatorOutput): LineData[] {
  return indicatorData.map((point) => ({
    time: toChartTime(point.time),
    value: point.value,
  }));
}

/**
 * ChartCanvas component renders the actual chart
 */
export function ChartCanvas({ data, chartType, width, height, symbol = '' }: ChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const overlaySeriesRef = useRef<Map<string, ISeriesApi<SeriesType>[]>>(new Map());
  const { theme } = useTheme();
  const { state: indicatorState } = useIndicators();
  
  // State for legend data (OHLCV values on crosshair hover)
  const [legendData, setLegendData] = useState<OHLCV | null>(null);
  
  // Create a map of time -> OHLCV for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<number, OHLCV>();
    data.forEach((bar) => {
      map.set(bar.time, bar);
    });
    return map;
  }, [data]);
  
  // Crosshair move handler
  const handleCrosshairMove = useCallback((param: MouseEventParams) => {
    if (!param.time) {
      setLegendData(null);
      return;
    }
    
    const bar = dataMap.get(param.time as number);
    if (bar) {
      setLegendData(bar);
    }
  }, [dataMap]);

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

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || width === 0 || height === 0) return;

    // Create chart instance
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
        // Vertical line (time crosshair)
        vertLine: {
          width: 1,
          color: 'rgba(107, 114, 128, 0.5)', // Gray with alpha
          style: 0, // Solid line
          labelBackgroundColor: '#374151',
        },
        // Horizontal line (price crosshair)
        horzLine: {
          width: 1,
          color: 'rgba(107, 114, 128, 0.5)', // Gray with alpha
          style: 0, // Solid line
          labelBackgroundColor: '#374151',
        },
      },
      rightPriceScale: {
        borderColor: chartColors.borderColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: chartColors.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;
    
    // Subscribe to crosshair move for legend updates
    chart.subscribeCrosshairMove(handleCrosshairMove);
    
    // Add double-click handler to reset view
    const handleDoubleClick = () => {
      chart.timeScale().fitContent();
    };
    
    const container = chartContainerRef.current;
    container.addEventListener('dblclick', handleDoubleClick);

    // Cleanup on unmount
    return () => {
      container.removeEventListener('dblclick', handleDoubleClick);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [width, height, chartColors, handleCrosshairMove]);

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
      timeScale: {
        borderColor: chartColors.borderColor,
      },
    });
  }, [chartColors]);

  // Update series when chartType or data changes
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const chart = chartRef.current;

    // Remove existing series
    if (seriesRef.current) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }
    
    // Remove existing volume series
    if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    // Create new series based on chart type
    let series: ISeriesApi<SeriesType>;

    switch (chartType) {
      case 'candlestick':
        series = chart.addSeries(CandlestickSeries, {
          upColor: BULLISH_COLOR,
          downColor: BEARISH_COLOR,
          borderUpColor: BULLISH_COLOR,
          borderDownColor: BEARISH_COLOR,
          wickUpColor: BULLISH_COLOR,
          wickDownColor: BEARISH_COLOR,
        });
        series.setData(toCandlestickData(data));
        break;

      case 'hollowCandle':
        // Hollow candlestick: hollow body when close > open, filled when close < open
        series = chart.addSeries(CandlestickSeries, {
          upColor: BULLISH_COLOR,
          downColor: BEARISH_COLOR,
          borderUpColor: BULLISH_COLOR,
          borderDownColor: BEARISH_COLOR,
          wickUpColor: BULLISH_COLOR,
          wickDownColor: BEARISH_COLOR,
        });
        series.setData(toHollowCandlestickData(data));
        break;

      case 'heikinAshi':
        // Heikin-Ashi: smoothed candlestick with calculated OHLC values
        series = chart.addSeries(CandlestickSeries, {
          upColor: BULLISH_COLOR,
          downColor: BEARISH_COLOR,
          borderUpColor: BULLISH_COLOR,
          borderDownColor: BEARISH_COLOR,
          wickUpColor: BULLISH_COLOR,
          wickDownColor: BEARISH_COLOR,
        });
        series.setData(toCandlestickData(toHeikinAshi(data)));
        break;

      case 'line':
        series = chart.addSeries(LineSeries, {
          color: LINE_COLOR,
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
        });
        series.setData(toLineData(data));
        break;

      case 'bar':
        series = chart.addSeries(BarSeries, {
          upColor: BULLISH_COLOR,
          downColor: BEARISH_COLOR,
        });
        series.setData(toBarData(data));
        break;

      case 'area':
        series = chart.addSeries(AreaSeries, {
          lineColor: LINE_COLOR,
          topColor: AREA_TOP_COLOR,
          bottomColor: AREA_BOTTOM_COLOR,
          lineWidth: 2,
        });
        series.setData(toAreaData(data));
        break;

      case 'baseline':
        // Baseline chart: price relative to configurable baseline
        // Area above baseline in green, area below baseline in red
        series = chart.addSeries(BaselineSeries, {
          baseValue: {
            type: 'price',
            price: getBaselineValue(data),
          },
          topLineColor: BULLISH_COLOR,
          topFillColor1: 'rgba(34, 197, 94, 0.4)',
          topFillColor2: 'rgba(34, 197, 94, 0.1)',
          bottomLineColor: BEARISH_COLOR,
          bottomFillColor1: 'rgba(239, 68, 68, 0.1)',
          bottomFillColor2: 'rgba(239, 68, 68, 0.4)',
          lineWidth: 2,
        });
        series.setData(toBaselineData(data));
        break;

      default:
        // Default to candlestick
        series = chart.addSeries(CandlestickSeries, {
          upColor: BULLISH_COLOR,
          downColor: BEARISH_COLOR,
          borderUpColor: BULLISH_COLOR,
          borderDownColor: BEARISH_COLOR,
          wickUpColor: BULLISH_COLOR,
          wickDownColor: BEARISH_COLOR,
        });
        series.setData(toCandlestickData(data));
    }

    seriesRef.current = series;

    // Add volume series (takes 20% of chart area at the bottom)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume', // Create separate scale for volume
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // Volume takes bottom 20% of chart
        bottom: 0,
      },
    });
    volumeSeries.setData(toVolumeData(data));
    volumeSeriesRef.current = volumeSeries;

    // Fit content to view
    chart.timeScale().fitContent();
  }, [chartType, data]);

  // Render overlay indicators (TASK-061)
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const chart = chartRef.current;
    const visibleOverlays = indicatorState.overlays.filter((o) => o.visible);

    // Remove old overlay series that are no longer needed
    const currentIds = new Set(visibleOverlays.map((o) => o.id));
    overlaySeriesRef.current.forEach((seriesList, id) => {
      if (!currentIds.has(id)) {
        seriesList.forEach((s) => {
          try {
            chart.removeSeries(s);
          } catch {
            // Series already removed
          }
        });
        overlaySeriesRef.current.delete(id);
      }
    });

    // Add or update overlay series
    visibleOverlays.forEach((indicator) => {
      const existingSeries = overlaySeriesRef.current.get(indicator.id);
      
      // If series already exists, update it
      if (existingSeries && existingSeries.length > 0) {
        // Just update the data, don't recreate the series
        updateOverlaySeries(chart, indicator, data, existingSeries);
      } else {
        // Create new series for this indicator
        const newSeries = createOverlaySeries(chart, indicator, data);
        if (newSeries.length > 0) {
          overlaySeriesRef.current.set(indicator.id, newSeries);
        }
      }
    });
  }, [indicatorState.overlays, data]);

  // Resize chart when dimensions change
  useEffect(() => {
    if (!chartRef.current || width === 0 || height === 0) return;
    chartRef.current.resize(width, height);
  }, [width, height]);

  return (
    <div className="relative w-full h-full">
      {/* Legend overlay at top-left */}
      <div className="absolute top-2 left-2 z-20 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm">
        <Legend data={legendData} symbol={symbol} overlays={indicatorState.overlays} />
      </div>
      
      {/* Chart container */}
      <div
        ref={chartContainerRef}
        className="w-full h-full"
        style={{ minHeight: height > 0 ? height : 400 }}
      />
    </div>
  );
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
 * Create overlay indicator series
 */
function createOverlaySeries(
  chart: IChartApi,
  indicator: OverlayIndicator,
  data: OHLCV[]
): ISeriesApi<SeriesType>[] {
  const seriesList: ISeriesApi<SeriesType>[] = [];
  const calculate = getIndicatorCalculation(indicator.type);
  const lineWidth = toValidLineWidth(indicator.lineWidth);

  try {
    switch (indicator.type) {
      case 'sma':
      case 'ema':
      case 'wma':
      case 'dema':
      case 'tema':
      case 'vwap': {
        const indicatorData = calculate(data, indicator.params) as IndicatorOutput;
        if (indicatorData.length > 0) {
          const lineSeries = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          lineSeries.setData(toIndicatorLineData(indicatorData));
          seriesList.push(lineSeries);
        }
        break;
      }

      case 'bollingerBands': {
        const bands = calculate(data, indicator.params) as BollingerBandsOutput;
        if (bands.upper.length > 0) {
          // Upper band
          const upperSeries = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth,
            lineStyle: 2, // Dashed
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          upperSeries.setData(toIndicatorLineData(bands.upper));
          seriesList.push(upperSeries);

          // Middle band (SMA)
          const middleSeries = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          middleSeries.setData(toIndicatorLineData(bands.middle));
          seriesList.push(middleSeries);

          // Lower band
          const lowerSeries = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth,
            lineStyle: 2, // Dashed
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          lowerSeries.setData(toIndicatorLineData(bands.lower));
          seriesList.push(lowerSeries);
        }
        break;
      }

      case 'envelope': {
        const envelope = calculate(data, indicator.params) as { upper: IndicatorOutput; middle: IndicatorOutput; lower: IndicatorOutput };
        if (envelope.upper.length > 0) {
          // Upper envelope
          const upperSeries = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          upperSeries.setData(toIndicatorLineData(envelope.upper));
          seriesList.push(upperSeries);

          // Middle (SMA)
          const middleSeries = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          middleSeries.setData(toIndicatorLineData(envelope.middle));
          seriesList.push(middleSeries);

          // Lower envelope
          const lowerSeries = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          lowerSeries.setData(toIndicatorLineData(envelope.lower));
          seriesList.push(lowerSeries);
        }
        break;
      }

      case 'parabolicSar': {
        const sarData = calculate(data, indicator.params) as IndicatorOutput;
        if (sarData.length > 0) {
          // Render SAR as dots using a line series with specific styling
          const sarSeries = chart.addSeries(LineSeries, {
            color: indicator.color,
            lineWidth: 1,
            pointMarkersVisible: true,
            pointMarkersRadius: 2,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          sarSeries.setData(toIndicatorLineData(sarData));
          seriesList.push(sarSeries);
        }
        break;
      }

      case 'ichimoku': {
        const ichimoku = calculate(data, indicator.params) as IchimokuOutput;
        
        // Tenkan-sen (Conversion Line) - typically blue
        if (ichimoku.tenkanSen.length > 0) {
          const tenkanSeries = chart.addSeries(LineSeries, {
            color: '#2196F3', // Blue
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          tenkanSeries.setData(toIndicatorLineData(ichimoku.tenkanSen));
          seriesList.push(tenkanSeries);
        }

        // Kijun-sen (Base Line) - typically red
        if (ichimoku.kijunSen.length > 0) {
          const kijunSeries = chart.addSeries(LineSeries, {
            color: '#F44336', // Red
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          kijunSeries.setData(toIndicatorLineData(ichimoku.kijunSen));
          seriesList.push(kijunSeries);
        }

        // Senkou Span A - part of cloud, typically green
        if (ichimoku.senkouSpanA.length > 0) {
          const spanASeries = chart.addSeries(LineSeries, {
            color: ICHIMOKU_CLOUD_BULLISH,
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          spanASeries.setData(toIndicatorLineData(ichimoku.senkouSpanA));
          seriesList.push(spanASeries);
        }

        // Senkou Span B - part of cloud, typically red
        if (ichimoku.senkouSpanB.length > 0) {
          const spanBSeries = chart.addSeries(LineSeries, {
            color: ICHIMOKU_CLOUD_BEARISH,
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          spanBSeries.setData(toIndicatorLineData(ichimoku.senkouSpanB));
          seriesList.push(spanBSeries);
        }

        // Chikou Span (Lagging Span) - typically green
        if (ichimoku.chikouSpan.length > 0) {
          const chikouSeries = chart.addSeries(LineSeries, {
            color: '#4CAF50', // Green
            lineWidth: 1,
            lineStyle: 2, // Dashed
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          chikouSeries.setData(toIndicatorLineData(ichimoku.chikouSpan));
          seriesList.push(chikouSeries);
        }
        break;
      }

      default:
        console.warn(`Unknown overlay indicator type: ${indicator.type}`);
    }
  } catch (error) {
    console.error(`Error calculating indicator ${indicator.type}:`, error);
  }

  return seriesList;
}

/**
 * Update existing overlay indicator series with new data
 */
function updateOverlaySeries(
  _chart: IChartApi,
  indicator: OverlayIndicator,
  data: OHLCV[],
  existingSeries: ISeriesApi<SeriesType>[]
): void {
  const calculate = getIndicatorCalculation(indicator.type);

  try {
    switch (indicator.type) {
      case 'sma':
      case 'ema':
      case 'wma':
      case 'dema':
      case 'tema':
      case 'vwap': {
        const indicatorData = calculate(data, indicator.params) as IndicatorOutput;
        if (existingSeries[0] && indicatorData.length > 0) {
          existingSeries[0].setData(toIndicatorLineData(indicatorData));
        }
        break;
      }

      case 'bollingerBands': {
        const bands = calculate(data, indicator.params) as BollingerBandsOutput;
        if (bands.upper.length > 0 && existingSeries.length >= 3) {
          existingSeries[0].setData(toIndicatorLineData(bands.upper));
          existingSeries[1].setData(toIndicatorLineData(bands.middle));
          existingSeries[2].setData(toIndicatorLineData(bands.lower));
        }
        break;
      }

      case 'envelope': {
        const envelope = calculate(data, indicator.params) as { upper: IndicatorOutput; middle: IndicatorOutput; lower: IndicatorOutput };
        if (envelope.upper.length > 0 && existingSeries.length >= 3) {
          existingSeries[0].setData(toIndicatorLineData(envelope.upper));
          existingSeries[1].setData(toIndicatorLineData(envelope.middle));
          existingSeries[2].setData(toIndicatorLineData(envelope.lower));
        }
        break;
      }

      case 'parabolicSar': {
        const sarData = calculate(data, indicator.params) as IndicatorOutput;
        if (existingSeries[0] && sarData.length > 0) {
          existingSeries[0].setData(toIndicatorLineData(sarData));
        }
        break;
      }

      case 'ichimoku': {
        const ichimoku = calculate(data, indicator.params) as IchimokuOutput;
        if (existingSeries.length >= 5) {
          if (ichimoku.tenkanSen.length > 0) existingSeries[0].setData(toIndicatorLineData(ichimoku.tenkanSen));
          if (ichimoku.kijunSen.length > 0) existingSeries[1].setData(toIndicatorLineData(ichimoku.kijunSen));
          if (ichimoku.senkouSpanA.length > 0) existingSeries[2].setData(toIndicatorLineData(ichimoku.senkouSpanA));
          if (ichimoku.senkouSpanB.length > 0) existingSeries[3].setData(toIndicatorLineData(ichimoku.senkouSpanB));
          if (ichimoku.chikouSpan.length > 0) existingSeries[4].setData(toIndicatorLineData(ichimoku.chikouSpan));
        }
        break;
      }
    }
  } catch (error) {
    console.error(`Error updating indicator ${indicator.type}:`, error);
  }
}

export default ChartCanvas;
