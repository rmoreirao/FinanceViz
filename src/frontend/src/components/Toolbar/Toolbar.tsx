/**
 * Main Toolbar Component
 * Container for all chart controls
 * 
 * TASK-008: Main Toolbar Container
 * TASK-065: Desktop Layout (≥1024px) - Full toolbar visible
 * TASK-066: Tablet Layout (768-1023px) - Collapsible toolbar sections
 * TASK-067: Mobile Layout (<768px) - Hamburger menu for toolbar
 */

import { useState } from 'react';
import { DataSourceToggle } from '../common';
import { ThemeToggle } from '../../context';
import { SymbolSearch } from './SymbolSearch';
import { ChartTypeSelect } from './ChartTypeSelect';
import { TimeRangeButtons } from './TimeRangeButtons';
import { IntervalSelect } from './IntervalSelect';
import { FullscreenButton } from './FullscreenButton';
import { IndicatorsButton } from './IndicatorsButton';

/**
 * Hamburger menu icon for mobile
 */
function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5">
      <span
        className={`block h-0.5 w-5 bg-gray-600 dark:bg-gray-300 transition-transform duration-300 ${
          isOpen ? 'rotate-45 translate-y-2' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-5 bg-gray-600 dark:bg-gray-300 transition-opacity duration-300 ${
          isOpen ? 'opacity-0' : ''
        }`}
      />
      <span
        className={`block h-0.5 w-5 bg-gray-600 dark:bg-gray-300 transition-transform duration-300 ${
          isOpen ? '-rotate-45 -translate-y-2' : ''
        }`}
      />
    </div>
  );
}

/**
 * Divider component for toolbar sections
 */
function ToolbarDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`h-6 w-px bg-gray-300 dark:bg-gray-600 ${className}`} />
  );
}

/**
 * Main toolbar containing all chart controls
 * 
 * Desktop (≥1024px): Full toolbar visible with all controls in a single row
 * Tablet (768-1023px): Collapsible sections, controls grouped
 * Mobile (<768px): Hamburger menu, bottom sheet for controls
 */
export function Toolbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Main toolbar row */}
      <div className="px-2 sm:px-4 py-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile: Hamburger menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <HamburgerIcon isOpen={isMobileMenuOpen} />
          </button>

          {/* Symbol Search - Always visible */}
          <div className="flex-1 sm:flex-initial">
            <SymbolSearch />
          </div>

          {/* Desktop: All controls visible inline */}
          <div className="hidden lg:flex items-center gap-3">
            <ToolbarDivider />
            <ChartTypeSelect />
            <ToolbarDivider />
            <TimeRangeButtons />
            <ToolbarDivider />
            <IntervalSelect />
            <ToolbarDivider />
            <IndicatorsButton />
          </div>

          {/* Tablet: Grouped controls */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            <ToolbarDivider />
            <ChartTypeSelect />
            <ToolbarDivider />
            <IntervalSelect />
            <ToolbarDivider />
            <IndicatorsButton />
          </div>

          {/* Spacer */}
          <div className="flex-grow hidden sm:block" />

          {/* Right side controls - Desktop & Tablet */}
          <div className="hidden sm:flex items-center gap-2">
            <DataSourceToggle />
            <ToolbarDivider />
            <FullscreenButton />
            <ToolbarDivider />
            <ThemeToggle />
          </div>

          {/* Mobile: Only theme toggle visible in header */}
          <div className="flex sm:hidden items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Tablet: Time Range as secondary row */}
      <div className="hidden md:block lg:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-center">
          <TimeRangeButtons />
        </div>
      </div>

      {/* Mobile: Expandable bottom sheet menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-4 py-3">
          {/* Chart Controls Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Chart Type */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Chart Type
              </span>
              <ChartTypeSelect />
            </div>

            {/* Interval */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Interval
              </span>
              <IntervalSelect />
            </div>
          </div>

          {/* Time Range - Full width */}
          <div className="mb-4">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
              Time Range
            </span>
            <TimeRangeButtons />
          </div>

          {/* Indicators */}
          <div className="mb-4">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
              Indicators
            </span>
            <IndicatorsButton />
          </div>

          {/* Bottom controls row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <DataSourceToggle />
            <FullscreenButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
