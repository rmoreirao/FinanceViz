/**
 * Toolbar Component
 * Main toolbar containing all chart controls
 */

import { useState } from 'react';
import { SymbolSearch } from './SymbolSearch';
import { ChartTypeSelect } from './ChartTypeSelect';
import { TimeRangeButtons } from './TimeRangeButtons';
import { IntervalSelect } from './IntervalSelect';
import { IndicatorsButton } from './IndicatorsButton';
import { FullscreenButton } from './FullscreenButton';
import { Modal } from '../common';

export function Toolbar() {
  const [isIndicatorsPanelOpen, setIndicatorsPanelOpen] = useState(false);

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Symbol Search */}
        <div className="w-64">
          <SymbolSearch />
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Chart Type */}
        <ChartTypeSelect />

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Time Range Buttons */}
        <TimeRangeButtons />

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Interval Select */}
        <IntervalSelect />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <IndicatorsButton onClick={() => setIndicatorsPanelOpen(true)} />
          <FullscreenButton />
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:flex lg:hidden flex-wrap items-center gap-3">
        {/* Row 1: Search and basic controls */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 max-w-xs">
            <SymbolSearch />
          </div>
          <ChartTypeSelect />
          <IntervalSelect />
          <div className="flex items-center gap-2 ml-auto">
            <IndicatorsButton onClick={() => setIndicatorsPanelOpen(true)} />
            <FullscreenButton />
          </div>
        </div>
        {/* Row 2: Time ranges */}
        <div className="w-full overflow-x-auto">
          <TimeRangeButtons />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SymbolSearch />
          </div>
          <IndicatorsButton onClick={() => setIndicatorsPanelOpen(true)} />
          <FullscreenButton />
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-2">
          <ChartTypeSelect />
          <IntervalSelect />
        </div>

        {/* Time Ranges - scrollable */}
        <div className="overflow-x-auto -mx-4 px-4">
          <TimeRangeButtons />
        </div>
      </div>

      {/* Indicators Panel Modal - Placeholder for future implementation */}
      <Modal
        isOpen={isIndicatorsPanelOpen}
        onClose={() => setIndicatorsPanelOpen(false)}
        title="Technical Indicators"
      >
        <div className="p-4 text-gray-600 dark:text-gray-400">
          <p>Indicators panel will be implemented in a future task.</p>
          <p className="mt-2 text-sm">
            Available indicators: SMA, EMA, RSI, MACD, Bollinger Bands, and more.
          </p>
        </div>
      </Modal>
    </div>
  );
}
