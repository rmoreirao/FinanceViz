/**
 * Active Indicators List Component
 * Displays list of active indicators with controls to edit, toggle visibility, and remove
 *
 * TASK-059: Active Indicators List
 */

import { memo, useCallback } from 'react';
import { useIndicators } from '../../context/IndicatorContext';
import type { OverlayIndicator, OscillatorIndicator } from '../../context/IndicatorContext';

/**
 * Get display name for indicator type
 */
function getIndicatorDisplayName(type: string): string {
  const names: Record<string, string> = {
    sma: 'SMA',
    ema: 'EMA',
    wma: 'WMA',
    dema: 'DEMA',
    tema: 'TEMA',
    vwap: 'VWAP',
    bollingerBands: 'Bollinger Bands',
    envelope: 'Envelope',
    parabolicSar: 'Parabolic SAR',
    ichimoku: 'Ichimoku Cloud',
    rsi: 'RSI',
    macd: 'MACD',
    stochastic: 'Stochastic',
    stochasticRsi: 'Stochastic RSI',
    williamsR: 'Williams %R',
    cci: 'CCI',
    atr: 'ATR',
    adx: 'ADX',
    roc: 'ROC',
    momentum: 'Momentum',
    obv: 'OBV',
    cmf: 'CMF',
    mfi: 'MFI',
    aroon: 'Aroon',
    awesomeOscillator: 'Awesome Oscillator',
  };
  return names[type] || type.toUpperCase();
}

/**
 * Get short parameter summary for indicator
 */
function getParamsSummary(params: Record<string, unknown>): string {
  if ('period' in params) {
    return `(${params.period})`;
  }
  if ('fastPeriod' in params && 'slowPeriod' in params) {
    return `(${params.fastPeriod}/${params.slowPeriod})`;
  }
  if ('kPeriod' in params) {
    return `(${params.kPeriod})`;
  }
  return '';
}

/**
 * Settings (gear) icon
 */
function SettingsIcon() {
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
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

/**
 * Eye icon for visible state
 */
function EyeIcon() {
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

/**
 * Eye off icon for hidden state
 */
function EyeOffIcon() {
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
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

/**
 * Close (X) icon
 */
function CloseIcon() {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

interface IndicatorItemProps {
  id: string;
  type: string;
  params: Record<string, unknown>;
  color: string;
  visible: boolean;
  isOverlay: boolean;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onOpenSettings: () => void;
}

/**
 * Single indicator item in the list
 */
const IndicatorItem = memo(function IndicatorItem({
  type,
  params,
  color,
  visible,
  onToggleVisibility,
  onRemove,
  onOpenSettings,
}: IndicatorItemProps) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors ${
        visible
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60'
      }`}
      data-testid={`active-indicator-${type}`}
    >
      {/* Color indicator and name */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {getIndicatorDisplayName(type)}
          <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
            {getParamsSummary(params)}
          </span>
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Edit settings"
          aria-label="Edit indicator settings"
          data-testid="indicator-settings-btn"
        >
          <SettingsIcon />
        </button>

        {/* Visibility toggle */}
        <button
          onClick={onToggleVisibility}
          className={`p-1.5 rounded-md transition-colors ${
            visible
              ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700'
          }`}
          title={visible ? 'Hide indicator' : 'Show indicator'}
          aria-label={visible ? 'Hide indicator' : 'Show indicator'}
          data-testid="indicator-visibility-btn"
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
          title="Remove indicator"
          aria-label="Remove indicator"
          data-testid="indicator-remove-btn"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
});

interface ActiveIndicatorsListProps {
  onOpenSettings: (indicator: OverlayIndicator | OscillatorIndicator, isOverlay: boolean) => void;
}

/**
 * Active Indicators List component
 * Shows all active indicators with controls to manage them
 */
export const ActiveIndicatorsList = memo(function ActiveIndicatorsList({
  onOpenSettings,
}: ActiveIndicatorsListProps) {
  const {
    state,
    removeOverlay,
    removeOscillator,
    toggleOverlayVisibility,
    toggleOscillatorVisibility,
  } = useIndicators();

  const { overlays, oscillators } = state;
  const hasIndicators = overlays.length > 0 || oscillators.length > 0;

  // Handlers for overlay indicators
  const handleOverlayToggle = useCallback(
    (id: string) => toggleOverlayVisibility(id),
    [toggleOverlayVisibility]
  );

  const handleOverlayRemove = useCallback(
    (id: string) => removeOverlay(id),
    [removeOverlay]
  );

  const handleOverlaySettings = useCallback(
    (indicator: OverlayIndicator) => onOpenSettings(indicator, true),
    [onOpenSettings]
  );

  // Handlers for oscillator indicators
  const handleOscillatorToggle = useCallback(
    (id: string) => toggleOscillatorVisibility(id),
    [toggleOscillatorVisibility]
  );

  const handleOscillatorRemove = useCallback(
    (id: string) => removeOscillator(id),
    [removeOscillator]
  );

  const handleOscillatorSettings = useCallback(
    (indicator: OscillatorIndicator) => onOpenSettings(indicator, false),
    [onOpenSettings]
  );

  if (!hasIndicators) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        No active indicators. Click "Add Indicator" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="active-indicators-list">
      {/* Overlay Indicators Section */}
      {overlays.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Overlays
          </h4>
          <div className="space-y-2">
            {overlays.map((indicator) => (
              <IndicatorItem
                key={indicator.id}
                id={indicator.id}
                type={indicator.type}
                params={indicator.params as unknown as Record<string, unknown>}
                color={indicator.color}
                visible={indicator.visible}
                isOverlay={true}
                onToggleVisibility={() => handleOverlayToggle(indicator.id)}
                onRemove={() => handleOverlayRemove(indicator.id)}
                onOpenSettings={() => handleOverlaySettings(indicator)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Oscillator Indicators Section */}
      {oscillators.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Oscillators
          </h4>
          <div className="space-y-2">
            {oscillators.map((indicator) => (
              <IndicatorItem
                key={indicator.id}
                id={indicator.id}
                type={indicator.type}
                params={indicator.params as unknown as Record<string, unknown>}
                color={indicator.color}
                visible={indicator.visible}
                isOverlay={false}
                onToggleVisibility={() => handleOscillatorToggle(indicator.id)}
                onRemove={() => handleOscillatorRemove(indicator.id)}
                onOpenSettings={() => handleOscillatorSettings(indicator)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ActiveIndicatorsList;
