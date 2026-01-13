/**
 * IndicatorConfig Component
 * Modal for editing indicator parameters
 * Features: Input fields for parameters, color picker, save/cancel
 */

import { useState, useCallback, useEffect } from 'react';
import { useIndicatorContext } from '../../context';
import { getIndicatorMeta } from './calculations';
import type { Indicator, IndicatorParams } from '../../types';
import { Button, Modal } from '../common';

interface IndicatorConfigProps {
  indicator: Indicator | null;
  isOpen: boolean;
  onClose: () => void;
}

// Parameter labels and descriptions
const parameterLabels: Record<string, { label: string; min: number; max: number; step: number }> = {
  period: { label: 'Period', min: 1, max: 500, step: 1 },
  stdDev: { label: 'Standard Deviation', min: 0.5, max: 5, step: 0.5 },
  percentage: { label: 'Percentage', min: 0.1, max: 10, step: 0.1 },
  step: { label: 'Step', min: 0.01, max: 0.1, step: 0.01 },
  max: { label: 'Max', min: 0.1, max: 0.5, step: 0.05 },
  tenkan: { label: 'Tenkan Period', min: 1, max: 100, step: 1 },
  kijun: { label: 'Kijun Period', min: 1, max: 100, step: 1 },
  senkou: { label: 'Senkou Period', min: 1, max: 200, step: 1 },
  fastPeriod: { label: 'Fast Period', min: 1, max: 100, step: 1 },
  slowPeriod: { label: 'Slow Period', min: 1, max: 200, step: 1 },
  signalPeriod: { label: 'Signal Period', min: 1, max: 50, step: 1 },
  kPeriod: { label: '%K Period', min: 1, max: 100, step: 1 },
  dPeriod: { label: '%D Period', min: 1, max: 50, step: 1 },
  smooth: { label: 'Smoothing', min: 1, max: 10, step: 1 },
  rsiPeriod: { label: 'RSI Period', min: 1, max: 100, step: 1 },
  stochPeriod: { label: 'Stoch Period', min: 1, max: 100, step: 1 },
};

export function IndicatorConfig({ indicator, isOpen, onClose }: IndicatorConfigProps) {
  const { updateIndicatorParams } = useIndicatorContext();
  const [params, setParams] = useState<Record<string, number>>({});
  const [color, setColor] = useState('#2962FF');

  // Get indicator metadata
  const meta = indicator ? getIndicatorMeta(indicator.type) : null;

  // Initialize params when indicator changes
  useEffect(() => {
    if (indicator) {
      setParams({ ...(indicator.params as Record<string, number>) });
      setColor(indicator.color);
    }
  }, [indicator]);

  // Handle parameter change
  const handleParamChange = useCallback((key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    if (!indicator) return;
    updateIndicatorParams(indicator.id, params as IndicatorParams);
    onClose();
  }, [indicator, params, updateIndicatorParams, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (indicator) {
      setParams({ ...(indicator.params as Record<string, number>) });
      setColor(indicator.color);
    }
    onClose();
  }, [indicator, onClose]);

  if (!indicator || !meta) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${meta.name} Settings`}>
      <div className="space-y-6">
        {/* Parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Parameters
          </h3>
          {Object.entries(params).map(([key, value]) => {
            const paramConfig = parameterLabels[key] || {
              label: key.charAt(0).toUpperCase() + key.slice(1),
              min: 1,
              max: 500,
              step: 1,
            };
            return (
              <div key={key} className="flex items-center gap-4">
                <label className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                  {paramConfig.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={paramConfig.min}
                    max={paramConfig.max}
                    step={paramConfig.step}
                    value={value}
                    onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <input
                    type="number"
                    min={paramConfig.min}
                    max={paramConfig.max}
                    step={paramConfig.step}
                    value={value}
                    onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Color
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
