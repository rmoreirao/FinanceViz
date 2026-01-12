/**
 * ChartCanvas Component
 * Main chart component using Lightweight Charts library v5
 * Supports multiple chart types: candlestick, line, bar, area, hollow candle, heikin-ashi, baseline
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BaselineSeries,
  BarSeries,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  type CandlestickData,
  type LineData,
  type AreaData,
  type BaselineData,
  type BarData,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts';
import type { OHLCV, ChartType, ChartDimensions, CrosshairData } from '../../types';
import { useThemeContext } from '../../context';
import { CHART_COLORS } from '../../utils';
import { calculateHeikinAshi } from '../../utils/heikinAshi';

interface ChartCanvasProps {
  data: OHLCV[];
  chartType: ChartType;
  dimensions: ChartDimensions;
  onCrosshairMove?: (data: CrosshairData | null) => void;
}

// Type for any series
type AnySeries = ISeriesApi<SeriesType>;

export function ChartCanvas({
  data,
  chartType,
  dimensions,
  onCrosshairMove,
}: ChartCanvasProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<AnySeries | null>(null);
  const { isDark } = useThemeContext();

  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

  // Transform OHLCV to chart data format
  const transformData = useCallback(
    (ohlcv: OHLCV[], type: ChartType) => {
      let sourceData = ohlcv;
      
      // Apply Heikin-Ashi transformation if needed
      if (type === 'heikinAshi') {
        sourceData = calculateHeikinAshi(ohlcv);
      }

      switch (type) {
        case 'candlestick':
        case 'hollowCandle':
        case 'heikinAshi':
          return sourceData.map((d) => ({
            time: d.time as number,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          })) as CandlestickData[];
        
        case 'bar':
          return sourceData.map((d) => ({
            time: d.time as number,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          })) as BarData[];

        case 'line':
          return sourceData.map((d) => ({
            time: d.time as number,
            value: d.close,
          })) as LineData[];

        case 'area':
          return sourceData.map((d) => ({
            time: d.time as number,
            value: d.close,
          })) as AreaData[];

        case 'baseline':
          return sourceData.map((d) => ({
            time: d.time as number,
            value: d.close,
          })) as BaselineData[];

        default:
          return sourceData.map((d) => ({
            time: d.time as number,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          })) as CandlestickData[];
      }
    },
    []
  );

  // Create series based on chart type (v5 API)
  const createSeries = useCallback(
    (chart: IChartApi, type: ChartType, baselineValue?: number): AnySeries => {
      switch (type) {
        case 'candlestick':
          return chart.addSeries(CandlestickSeries, {
            upColor: colors.bullish,
            downColor: colors.bearish,
            borderUpColor: colors.bullish,
            borderDownColor: colors.bearish,
            wickUpColor: colors.bullish,
            wickDownColor: colors.bearish,
          });

        case 'hollowCandle':
          return chart.addSeries(CandlestickSeries, {
            upColor: 'transparent',
            downColor: colors.bearish,
            borderUpColor: colors.bullish,
            borderDownColor: colors.bearish,
            wickUpColor: colors.bullish,
            wickDownColor: colors.bearish,
          });

        case 'heikinAshi':
          return chart.addSeries(CandlestickSeries, {
            upColor: colors.bullish,
            downColor: colors.bearish,
            borderUpColor: colors.bullish,
            borderDownColor: colors.bearish,
            wickUpColor: colors.bullish,
            wickDownColor: colors.bearish,
          });

        case 'bar':
          return chart.addSeries(BarSeries, {
            upColor: colors.bullish,
            downColor: colors.bearish,
          });

        case 'line':
          return chart.addSeries(LineSeries, {
            color: '#2962FF',
            lineWidth: 2,
          });

        case 'area':
          return chart.addSeries(AreaSeries, {
            topColor: 'rgba(41, 98, 255, 0.4)',
            bottomColor: 'rgba(41, 98, 255, 0.0)',
            lineColor: '#2962FF',
            lineWidth: 2,
          });

        case 'baseline':
          return chart.addSeries(BaselineSeries, {
            baseValue: { type: 'price', price: baselineValue || 0 },
            topLineColor: colors.bullish,
            topFillColor1: 'rgba(34, 197, 94, 0.2)',
            topFillColor2: 'rgba(34, 197, 94, 0.0)',
            bottomLineColor: colors.bearish,
            bottomFillColor1: 'rgba(239, 68, 68, 0.0)',
            bottomFillColor2: 'rgba(239, 68, 68, 0.2)',
            lineWidth: 2,
          });

        default:
          return chart.addSeries(CandlestickSeries, {
            upColor: colors.bullish,
            downColor: colors.bearish,
            borderUpColor: colors.bullish,
            borderDownColor: colors.bearish,
            wickUpColor: colors.bullish,
            wickDownColor: colors.bearish,
          });
      }
    },
    [colors]
  );

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || dimensions.width === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
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
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Subscribe to crosshair move for legend
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData.size) {
          onCrosshairMove(null);
          return;
        }

        const seriesData = param.seriesData.get(seriesRef.current!);
        if (seriesData) {
          // Handle different data types
          if ('open' in seriesData) {
            const ohlc = seriesData as CandlestickData;
            const matchingData = data.find((d) => d.time === param.time);
            onCrosshairMove({
              time: param.time as number,
              open: ohlc.open as number,
              high: ohlc.high as number,
              low: ohlc.low as number,
              close: ohlc.close as number,
              volume: matchingData?.volume || 0,
            });
          } else if ('value' in seriesData) {
            const line = seriesData as LineData;
            const matchingData = data.find((d) => d.time === param.time);
            if (matchingData) {
              onCrosshairMove({
                time: param.time as number,
                open: matchingData.open,
                high: matchingData.high,
                low: matchingData.low,
                close: line.value as number,
                volume: matchingData.volume,
              });
            }
          }
        }
      });
    }

    // Double-click to reset zoom
    const handleDoubleClick = () => {
      chart.timeScale().fitContent();
    };
    chartContainerRef.current.addEventListener('dblclick', handleDoubleClick);

    return () => {
      chartContainerRef.current?.removeEventListener('dblclick', handleDoubleClick);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [dimensions.width, dimensions.height, colors, onCrosshairMove, data]);

  // Update series when chart type or data changes
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Remove existing series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    // Calculate baseline value for baseline chart
    const baselineValue = data.length > 0 ? data[0].close : 0;

    // Create new series
    const series = createSeries(chartRef.current, chartType, baselineValue);
    seriesRef.current = series;

    // Set data
    const transformedData = transformData(data, chartType);
    series.setData(transformedData);

    // Fit content
    chartRef.current.timeScale().fitContent();
  }, [chartType, data, createSeries, transformData]);

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
    chartRef.current.resize(dimensions.width, dimensions.height);
  }, [dimensions.width, dimensions.height]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
      style={{ minHeight: 300 }}
    />
  );
}
