/**
 * Indicator Configuration Modal Component
 * Modal to edit indicator parameters with color picker and validation
 *
 * TASK-060: Indicator Configuration Modal
 */

import { useState, useCallback, useEffect, memo } from 'react';
import { Modal } from '../common';
import { useIndicators } from '../../context/IndicatorContext';
import type { OverlayIndicator, OscillatorIndicator } from '../../context/IndicatorContext';

/**
 * Get display name for indicator type
 */
function getIndicatorDisplayName(type: string): string {
  const names: Record<string, string> = {
    sma: 'Simple Moving Average (SMA)',
    ema: 'Exponential Moving Average (EMA)',
    wma: 'Weighted Moving Average (WMA)',
    dema: 'Double Exponential Moving Average (DEMA)',
    tema: 'Triple Exponential Moving Average (TEMA)',
    vwap: 'Volume Weighted Average Price (VWAP)',
    bollingerBands: 'Bollinger Bands',
    envelope: 'Moving Average Envelope',
    parabolicSar: 'Parabolic SAR',
    ichimoku: 'Ichimoku Cloud',
    rsi: 'Relative Strength Index (RSI)',
    macd: 'Moving Average Convergence Divergence (MACD)',
    stochastic: 'Stochastic Oscillator',
    stochasticRsi: 'Stochastic RSI',
    williamsR: 'Williams %R',
    cci: 'Commodity Channel Index (CCI)',
    atr: 'Average True Range (ATR)',
    adx: 'Average Directional Index (ADX)',
    roc: 'Rate of Change (ROC)',
    momentum: 'Momentum',
    obv: 'On-Balance Volume (OBV)',
    cmf: 'Chaikin Money Flow (CMF)',
    mfi: 'Money Flow Index (MFI)',
    aroon: 'Aroon',
    awesomeOscillator: 'Awesome Oscillator',
  };
  return names[type] || type.toUpperCase();
}

/**
 * Parameter field configuration
 */
interface ParameterFieldConfig {
  key: string;
  label: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
}

/**
 * Get parameter field configuration for indicator type
 */
function getParameterFields(type: string): ParameterFieldConfig[] {
  switch (type) {
    case 'sma':
    case 'ema':
    case 'wma':
    case 'dema':
    case 'tema':
      return [
        { key: 'period', label: 'Period', type: 'number', min: 1, max: 500, step: 1 },
        {
          key: 'source',
          label: 'Source',
          type: 'select',
          options: [
            { value: 'close', label: 'Close' },
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'hl2', label: 'HL2 (High+Low)/2' },
            { value: 'hlc3', label: 'HLC3 (High+Low+Close)/3' },
            { value: 'ohlc4', label: 'OHLC4 (Open+High+Low+Close)/4' },
          ],
        },
      ];
    case 'vwap':
      return [{ key: 'period', label: 'Period', type: 'number', min: 1, max: 100, step: 1 }];
    case 'bollingerBands':
      return [
        { key: 'period', label: 'Period', type: 'number', min: 1, max: 500, step: 1 },
        { key: 'stdDev', label: 'Standard Deviation', type: 'number', min: 0.1, max: 5, step: 0.1 },
      ];
    case 'envelope':
      return [
        { key: 'period', label: 'Period', type: 'number', min: 1, max: 500, step: 1 },
        { key: 'percentage', label: 'Percentage (%)', type: 'number', min: 0.1, max: 20, step: 0.1 },
      ];
    case 'parabolicSar':
      return [
        { key: 'step', label: 'Step (AF)', type: 'number', min: 0.001, max: 0.1, step: 0.001 },
        { key: 'max', label: 'Max (AF Max)', type: 'number', min: 0.1, max: 0.5, step: 0.01 },
      ];
    case 'ichimoku':
      return [
        { key: 'tenkanPeriod', label: 'Tenkan Period', type: 'number', min: 1, max: 100, step: 1 },
        { key: 'kijunPeriod', label: 'Kijun Period', type: 'number', min: 1, max: 100, step: 1 },
        { key: 'senkouPeriod', label: 'Senkou Period', type: 'number', min: 1, max: 200, step: 1 },
      ];
    case 'rsi':
      return [
        { key: 'period', label: 'Period', type: 'number', min: 1, max: 100, step: 1 },
        { key: 'overbought', label: 'Overbought Level', type: 'number', min: 50, max: 100, step: 1 },
        { key: 'oversold', label: 'Oversold Level', type: 'number', min: 0, max: 50, step: 1 },
      ];
    case 'macd':
      return [
        { key: 'fastPeriod', label: 'Fast Period', type: 'number', min: 1, max: 100, step: 1 },
        { key: 'slowPeriod', label: 'Slow Period', type: 'number', min: 1, max: 200, step: 1 },
        { key: 'signalPeriod', label: 'Signal Period', type: 'number', min: 1, max: 100, step: 1 },
      ];
    case 'stochastic':
    case 'stochasticRsi':
      return [
        { key: 'kPeriod', label: '%K Period', type: 'number', min: 1, max: 100, step: 1 },
        { key: 'dPeriod', label: '%D Period', type: 'number', min: 1, max: 100, step: 1 },
        { key: 'smooth', label: 'Smoothing', type: 'number', min: 1, max: 10, step: 1 },
        { key: 'overbought', label: 'Overbought Level', type: 'number', min: 50, max: 100, step: 1 },
        { key: 'oversold', label: 'Oversold Level', type: 'number', min: 0, max: 50, step: 1 },
      ];
    case 'williamsR':
      return [
        { key: 'period', label: 'Period', type: 'number', min: 1, max: 100, step: 1 },
        { key: 'overbought', label: 'Overbought Level', type: 'number', min: -50, max: 0, step: 1 },
        { key: 'oversold', label: 'Oversold Level', type: 'number', min: -100, max: -50, step: 1 },
      ];
    case 'cci':
    case 'atr':
    case 'adx':
    case 'roc':
    case 'momentum':
    case 'cmf':
    case 'mfi':
    case 'aroon':
      return [{ key: 'period', label: 'Period', type: 'number', min: 1, max: 100, step: 1 }];
    case 'awesomeOscillator':
      return [
        { key: 'fastPeriod', label: 'Fast Period', type: 'number', min: 1, max: 50, step: 1 },
        { key: 'slowPeriod', label: 'Slow Period', type: 'number', min: 1, max: 100, step: 1 },
      ];
    case 'obv':
      return []; // OBV has no parameters
    default:
      return [{ key: 'period', label: 'Period', type: 'number', min: 1, max: 100, step: 1 }];
  }
}

/**
 * Available colors for indicators
 */
const INDICATOR_COLORS = [
  { value: '#2196F3', label: 'Blue' },
  { value: '#FF9800', label: 'Orange' },
  { value: '#9C27B0', label: 'Purple' },
  { value: '#4CAF50', label: 'Green' },
  { value: '#E91E63', label: 'Pink' },
  { value: '#00BCD4', label: 'Cyan' },
  { value: '#FF5722', label: 'Deep Orange' },
  { value: '#673AB7', label: 'Deep Purple' },
  { value: '#F44336', label: 'Red' },
  { value: '#009688', label: 'Teal' },
  { value: '#795548', label: 'Brown' },
  { value: '#607D8B', label: 'Blue Grey' },
];

interface IndicatorConfigProps {
  isOpen: boolean;
  onClose: () => void;
  indicator: OverlayIndicator | OscillatorIndicator | null;
  isOverlay: boolean;
}

/**
 * Indicator Configuration Modal
 * Allows editing indicator parameters and appearance
 */
export const IndicatorConfig = memo(function IndicatorConfig({
  isOpen,
  onClose,
  indicator,
  isOverlay,
}: IndicatorConfigProps) {
  const { updateOverlay, updateOscillator } = useIndicators();

  // Local state for form values
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [color, setColor] = useState<string>('#2196F3');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form values when indicator changes
  useEffect(() => {
    if (indicator) {
      setFormValues({ ...indicator.params });
      setColor(indicator.color);
      setLineWidth(indicator.lineWidth);
      setErrors({});
    }
  }, [indicator]);

  // Handle parameter value change
  const handleParamChange = useCallback(
    (key: string, value: string, field: ParameterFieldConfig) => {
      if (field.type === 'number') {
        const numValue = parseFloat(value);
        
        // Validate numeric input
        if (isNaN(numValue)) {
          setErrors((prev) => ({ ...prev, [key]: 'Must be a number' }));
          return;
        }
        
        if (field.min !== undefined && numValue < field.min) {
          setErrors((prev) => ({ ...prev, [key]: `Minimum value is ${field.min}` }));
          return;
        }
        
        if (field.max !== undefined && numValue > field.max) {
          setErrors((prev) => ({ ...prev, [key]: `Maximum value is ${field.max}` }));
          return;
        }

        setErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setFormValues((prev) => ({ ...prev, [key]: numValue }));
      } else {
        setFormValues((prev) => ({ ...prev, [key]: value }));
      }
    },
    []
  );

  // Handle apply changes
  const handleApply = useCallback(() => {
    if (!indicator) return;

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (isOverlay) {
      updateOverlay(indicator.id, {
        params: formValues as unknown as OverlayIndicator['params'],
        color,
        lineWidth,
      });
    } else {
      updateOscillator(indicator.id, {
        params: formValues as unknown as OscillatorIndicator['params'],
        color,
        lineWidth,
      });
    }

    onClose();
  }, [indicator, formValues, color, lineWidth, errors, isOverlay, updateOverlay, updateOscillator, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!indicator) return null;

  const fields = getParameterFields(indicator.type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getIndicatorDisplayName(indicator.type)}
      size="md"
    >
      <div className="space-y-6" data-testid="indicator-config-modal">
        {/* Parameters Section */}
        {fields.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Parameters
            </h3>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label
                    htmlFor={`param-${field.key}`}
                    className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                  >
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      id={`param-${field.key}`}
                      value={String(formValues[field.key] || '')}
                      onChange={(e) => handleParamChange(field.key, e.target.value, field)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`param-${field.key}`}
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={formValues[field.key] as number || ''}
                      onChange={(e) => handleParamChange(field.key, e.target.value, field)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors[field.key]
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:border-transparent transition-colors`}
                      data-testid={`param-${field.key}`}
                    />
                  )}
                  {errors[field.key] && (
                    <p className="mt-1 text-sm text-red-500">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appearance Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Appearance
          </h3>
          <div className="space-y-4">
            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Line Color
              </label>
              <div className="flex flex-wrap gap-2">
                {INDICATOR_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c.value
                        ? 'border-gray-800 dark:border-white scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                    aria-label={`Select ${c.label} color`}
                  />
                ))}
              </div>
              {/* Custom color input */}
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="Custom color"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Line Width */}
            <div>
              <label
                htmlFor="lineWidth"
                className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
              >
                Line Width
              </label>
              <input
                id="lineWidth"
                type="range"
                min={1}
                max={5}
                step={1}
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Thin (1)</span>
                <span>{lineWidth}px</span>
                <span>Thick (5)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            data-testid="indicator-config-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={Object.keys(errors).length > 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            data-testid="indicator-config-apply"
          >
            Apply
          </button>
        </div>
      </div>
    </Modal>
  );
});

export default IndicatorConfig;
