/**
 * Chart Container Component
 * Orchestrates ChartCanvas, VolumePane, and IndicatorPanes
 * Manages layout, resizing, and loading/error states
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChartCanvas } from './ChartCanvas';
import { VolumePane } from './VolumePane';
import { Legend } from './Legend';
import { IndicatorPane, DEFAULT_INDICATOR_HEIGHT, MIN_INDICATOR_HEIGHT, MAX_INDICATOR_HEIGHT } from './IndicatorPane';
import { useChartContext, useIndicatorContext } from '../../context';
import { useStockData, useChartResize } from '../../hooks';
import { Spinner } from '../common';
import type { CrosshairData } from '../../types';

// Volume pane height in pixels
const VOLUME_PANE_HEIGHT = 100;

export function Chart() {
  const { state } = useChartContext();
  const { state: indicatorState, updateOscillatorHeight } = useIndicatorContext();
  const { data, isLoading, error } = useStockData(
    state.symbol,
    state.timeRange,
    state.interval
  );
  const { containerRef, dimensions } = useChartResize();
  const [crosshairData, setCrosshairData] = useState<CrosshairData | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const resizeStartY = useRef<number>(0);
  const resizeStartHeight = useRef<number>(0);

  // Get visible oscillators
  const visibleOscillators = useMemo(
    () => indicatorState.oscillators.filter((osc) => osc.visible),
    [indicatorState.oscillators]
  );

  // Calculate total indicator panes height
  const totalIndicatorHeight = useMemo(
    () => visibleOscillators.reduce((sum, osc) => sum + (osc.height || DEFAULT_INDICATOR_HEIGHT), 0),
    [visibleOscillators]
  );

  // Calculate dimensions for main chart and volume pane
  const mainChartHeight = useMemo(() => {
    const availableHeight = dimensions.height - VOLUME_PANE_HEIGHT - totalIndicatorHeight;
    return Math.max(availableHeight, 200); // Minimum 200px for main chart
  }, [dimensions.height, totalIndicatorHeight]);

  const volumePaneHeight = VOLUME_PANE_HEIGHT;

  // Handle resize start
  const handleResizeStart = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingId(id);
    resizeStartY.current = e.clientY;
    const oscillator = indicatorState.oscillators.find((osc) => osc.id === id);
    resizeStartHeight.current = oscillator?.height || DEFAULT_INDICATOR_HEIGHT;
  }, [indicatorState.oscillators]);

  // Handle resize move
  useEffect(() => {
    if (!resizingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizeStartY.current - e.clientY;
      const newHeight = Math.min(
        Math.max(resizeStartHeight.current + delta, MIN_INDICATOR_HEIGHT),
        MAX_INDICATOR_HEIGHT
      );
      updateOscillatorHeight(resizingId, newHeight);
    };

    const handleMouseUp = () => {
      setResizingId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingId, updateOscillatorHeight]);


  // Loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading chart data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Failed to load chart data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            No data available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No chart data available for {state.symbol} with the selected time range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
      {/* Legend - OHLCV values on hover */}
      <div className="absolute top-2 left-2 z-10">
        <Legend
          crosshairData={crosshairData}
          latestData={data.length > 0 ? data[data.length - 1] : null}
          symbol={state.symbol}
        />
      </div>

      {/* Loading overlay for data refresh */}
      {isLoading && data.length > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <Spinner size="sm" />
        </div>
      )}

      {/* Main Chart Container */}
      <div ref={containerRef} className="flex-1 min-h-0 flex flex-col">
        {dimensions.width > 0 && (
          <>
            {/* Main Price Chart */}
            <div style={{ height: mainChartHeight }}>
              <ChartCanvas
                data={data}
                chartType={state.chartType}
                dimensions={{ width: dimensions.width, height: mainChartHeight }}
                onCrosshairMove={setCrosshairData}
              />
            </div>

            {/* Volume Pane */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              <VolumePane
                data={data}
                dimensions={{ width: dimensions.width, height: volumePaneHeight }}
              />
            </div>

            {/* Oscillator Indicator Panes */}
            {visibleOscillators.map((oscillator) => (
              <IndicatorPane
                key={oscillator.id}
                indicator={oscillator}
                data={data}
                dimensions={{
                  width: dimensions.width,
                  height: oscillator.height || DEFAULT_INDICATOR_HEIGHT,
                }}
                onResizeStart={(e) => handleResizeStart(oscillator.id, e)}
              />
            ))}
          </>
        )}
      </div>

      {/* Resize cursor overlay */}
      {resizingId && (
        <div className="fixed inset-0 z-50 cursor-ns-resize" />
      )}
    </div>
  );
}
