/**
 * Toolbar Component
 * Main toolbar containing all chart controls
 * 
 * Responsive Layouts:
 * - Desktop (≥1024px): Full toolbar visible with all controls in a single row
 * - Tablet (768-1023px): Two-row layout with collapsible sections
 * - Mobile (<768px): Stacked layout with hamburger menu concept, scrollable time ranges
 */

import { useState } from 'react';
import { SymbolSearch } from './SymbolSearch';
import { ChartTypeSelect } from './ChartTypeSelect';
import { TimeRangeButtons } from './TimeRangeButtons';
import { IntervalSelect } from './IntervalSelect';
import { IndicatorsButton } from './IndicatorsButton';
import { FullscreenButton } from './FullscreenButton';
import { IndicatorsPanel } from '../Indicators/IndicatorsPanel';

export function Toolbar() {
  const [isIndicatorsPanelOpen, setIndicatorsPanelOpen] = useState(false);

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Desktop Layout (≥1024px) - TASK-084 */}
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

      {/* Tablet Layout (768-1023px) - TASK-085 */}
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
        {/* Row 2: Time ranges - collapsible/scrollable */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <TimeRangeButtons />
        </div>
      </div>

      {/* Mobile Layout (<768px) - TASK-086 */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Search row with action buttons */}
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

        {/* Time Ranges - bottom sheet style, scrollable */}
        <div className="overflow-x-auto -mx-4 px-4 pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <TimeRangeButtons />
        </div>
      </div>

      {/* Indicators Panel Modal - Opens on all breakpoints */}
      <IndicatorsPanel
        isOpen={isIndicatorsPanelOpen}
        onClose={() => setIndicatorsPanelOpen(false)}
      />
    </div>
  );
}
