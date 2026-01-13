/**
 * Main Toolbar Component
 * Container for all chart controls
 * 
 * TASK-008: Main Toolbar Container
 */

import { DataSourceToggle } from '../common';
import { ThemeToggle } from '../../context';
import { SymbolSearch } from './SymbolSearch';
import { ChartTypeSelect } from './ChartTypeSelect';
import { TimeRangeButtons } from './TimeRangeButtons';
import { IntervalSelect } from './IntervalSelect';
import { FullscreenButton } from './FullscreenButton';

/**
 * Main toolbar containing all chart controls
 * Layout: [Symbol Search] | [Chart Type ▼] | [Time Range Buttons] | [Interval ▼] | [Data Source ▼]
 */
export function Toolbar() {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Symbol Search */}
        <div className="flex-shrink-0">
          <SymbolSearch />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />

        {/* Chart Type Selector */}
        <div className="flex-shrink-0">
          <ChartTypeSelect />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />

        {/* Time Range Buttons */}
        <div className="flex-shrink-0">
          <TimeRangeButtons />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />

        {/* Interval Selector */}
        <div className="flex-shrink-0">
          <IntervalSelect />
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Data Source Toggle */}
          <DataSourceToggle />

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Fullscreen Button */}
          <FullscreenButton />

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
