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
import { useTheme } from '../../context';
import { toHeikinAshi } from '../../utils/heikinAshi';
import { Legend } from './Legend';

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

/**
 * ChartCanvas component renders the actual chart
 */
export function ChartCanvas({ data, chartType, width, height, symbol = '' }: ChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const { theme } = useTheme();
  
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

  // Resize chart when dimensions change
  useEffect(() => {
    if (!chartRef.current || width === 0 || height === 0) return;
    chartRef.current.resize(width, height);
  }, [width, height]);

  return (
    <div className="relative w-full h-full">
      {/* Legend overlay at top-left */}
      <div className="absolute top-2 left-2 z-20 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded shadow-sm">
        <Legend data={legendData} symbol={symbol} />
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

export default ChartCanvas;
