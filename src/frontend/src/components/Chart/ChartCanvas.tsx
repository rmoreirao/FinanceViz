/**
 * Chart Canvas Component
 * Renders charts using TradingView Lightweight Charts
 * 
 * TASK-017: Candlestick Chart
 * TASK-018: Line Chart
 * TASK-019: Bar (OHLC) Chart
 * TASK-020: Area Chart
 */

import { useEffect, useRef, useMemo } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type BarData,
  type AreaData,
  type Time,
  type SeriesType,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';
import type { OHLCV } from '../../types';
import type { ChartType } from '../../types';
import { useTheme } from '../../context';

interface ChartCanvasProps {
  data: OHLCV[];
  chartType: ChartType;
  width: number;
  height: number;
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
 * ChartCanvas component renders the actual chart
 */
export function ChartCanvas({ data, chartType, width, height }: ChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const { theme } = useTheme();

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

    // Cleanup on unmount
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [width, height, chartColors]);

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

    // Create new series based on chart type
    let series: ISeriesApi<SeriesType>;

    switch (chartType) {
      case 'candlestick':
      case 'hollowCandle':
      case 'heikinAshi':
        // All these use candlestick series (hollow and heikin-ashi will be enhanced later)
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
        // Baseline will be implemented in TASK-023
        series = chart.addSeries(AreaSeries, {
          lineColor: LINE_COLOR,
          topColor: AREA_TOP_COLOR,
          bottomColor: AREA_BOTTOM_COLOR,
          lineWidth: 2,
        });
        series.setData(toAreaData(data));
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

    // Fit content to view
    chart.timeScale().fitContent();
  }, [chartType, data]);

  // Resize chart when dimensions change
  useEffect(() => {
    if (!chartRef.current || width === 0 || height === 0) return;
    chartRef.current.resize(width, height);
  }, [width, height]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
      style={{ minHeight: height > 0 ? height : 400 }}
    />
  );
}

export default ChartCanvas;
