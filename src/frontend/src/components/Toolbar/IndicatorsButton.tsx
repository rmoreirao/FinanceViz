/**
 * Indicators Button Component
 * Toolbar button to open indicators panel
 *
 * TASK-058: Indicators Button
 */

import { useState } from 'react';
import { Button } from '../common';
import { useIndicators } from '../../context/IndicatorContext';
import { IndicatorsPanel } from '../Indicators';

/**
 * Chart/indicator icon
 */
function IndicatorIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

/**
 * Indicators Button with badge showing active indicator count
 */
export function IndicatorsButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { state } = useIndicators();

  // Calculate total active indicators
  const activeCount = state.overlays.length + state.oscillators.length;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPanelOpen(true)}
        title="Add Indicator"
        data-testid="indicators-button"
        className="relative"
      >
        <IndicatorIcon />
        <span className="ml-1 hidden sm:inline">Indicators</span>
        {activeCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                       flex items-center justify-center
                       bg-blue-500 text-white text-xs font-medium rounded-full"
            data-testid="indicators-badge"
          >
            {activeCount}
          </span>
        )}
      </Button>

      <IndicatorsPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
}

export default IndicatorsButton;
