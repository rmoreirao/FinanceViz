/**
 * VolumePane Component
 * Displays volume histogram below the main chart
 * Colors bars based on price direction (green up, red down)
 * Synchronized time scale with main chart
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type HistogramData,
  ColorType,
} from 'lightweight-charts';
import type { OHLCV, ChartDimensions } from '../../types';
import { useThemeContext } from '../../context';
import { CHART_COLORS } from '../../utils';

interface VolumePaneProps {
  data: OHLCV[];
  dimensions: ChartDimensions;
  mainChart?: IChartApi | null;
}

export function VolumePane({ data, dimensions, mainChart }: VolumePaneProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const { isDark } = useThemeContext();

  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

  // Transform OHLCV data to volume histogram data with colors
  const transformVolumeData = useCallback(
    (ohlcv: OHLCV[]): HistogramData[] => {
      return ohlcv.map((d, index) => {
        // Determine color based on price direction
        const prevClose = index > 0 ? ohlcv[index - 1].close : d.open;
        const isUp = d.close >= prevClose;

        return {
          time: d.time as number as HistogramData['time'],
          value: d.volume,
          color: isUp ? colors.bullish + 'B3' : colors.bearish + 'B3', // 70% opacity
        };
      });
    },
    [colors.bullish, colors.bearish]
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
          bottom: 0,
        },
      },
      timeScale: {
        borderColor: colors.grid,
        visible: false, // Hide time scale on volume pane (synced with main)
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

    // Create histogram series
    const series = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'right',
    });
    seriesRef.current = series;

    // Sync time scale with main chart if provided
    if (mainChart) {
      const mainTimeScale = mainChart.timeScale();
      const volumeTimeScale = chart.timeScale();

      // Subscribe to main chart time scale changes
      mainTimeScale.subscribeVisibleLogicalRangeChange((range) => {
        if (range) {
          volumeTimeScale.setVisibleLogicalRange(range);
        }
      });

      // Subscribe to volume chart time scale changes and update main
      volumeTimeScale.subscribeVisibleLogicalRangeChange((range) => {
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
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [dimensions.width, dimensions.height, colors, mainChart]);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return;

    const volumeData = transformVolumeData(data);
    seriesRef.current.setData(volumeData);

    // Fit content
    chartRef.current?.timeScale().fitContent();
  }, [data, transformVolumeData]);

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

    // Update volume bar colors
    if (seriesRef.current && data.length > 0) {
      const volumeData = transformVolumeData(data);
      seriesRef.current.setData(volumeData);
    }
  }, [colors, data, transformVolumeData]);

  // Resize chart when dimensions change
  useEffect(() => {
    if (!chartRef.current || dimensions.width === 0) return;
    chartRef.current.resize(dimensions.width, dimensions.height);
  }, [dimensions.width, dimensions.height]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full"
      style={{ height: dimensions.height }}
    />
  );
}
