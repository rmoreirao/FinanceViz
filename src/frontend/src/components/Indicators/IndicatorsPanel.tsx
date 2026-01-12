/**
 * IndicatorsPanel Component
 * Searchable panel showing all available indicators grouped by category
 * Click to add indicator to chart
 */

import { useState, useMemo, useCallback } from 'react';
import { Search, TrendingUp, Activity, BarChart3, X } from 'lucide-react';
import { useIndicatorContext } from '../../context';
import {
  overlayIndicators,
  oscillatorIndicators,
  indicatorCategories,
  getIndicatorMeta,
} from './calculations';
import type { OverlayIndicator, OscillatorIndicator, IndicatorType } from '../../types';
import { DEFAULT_INDICATOR_HEIGHT } from '../Chart/IndicatorPane';

interface IndicatorsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Color palette for indicators
const INDICATOR_COLORS = [
  '#2962FF', '#FF6D00', '#AB47BC', '#26A69A', '#EF5350',
  '#42A5F5', '#66BB6A', '#FFA726', '#EC407A', '#7E57C2',
];

// Get a random color from the palette
function getRandomColor(): string {
  return INDICATOR_COLORS[Math.floor(Math.random() * INDICATOR_COLORS.length)];
}

// Generate unique ID
function generateId(): string {
  return `ind_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
  Trend: <TrendingUp className="w-4 h-4" />,
  Momentum: <Activity className="w-4 h-4" />,
  Volatility: <Activity className="w-4 h-4" />,
  Volume: <BarChart3 className="w-4 h-4" />,
};

export function IndicatorsPanel({ isOpen, onClose }: IndicatorsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { addOverlay, addOscillator, state } = useIndicatorContext();

  // Get all indicators with their metadata
  const allIndicators = useMemo(() => {
    const overlays = overlayIndicators.map((ind) => ({
      ...ind.meta,
      isOverlay: true,
    }));
    const oscillators = oscillatorIndicators.map((ind) => ({
      ...ind.meta,
      isOverlay: false,
    }));
    return [...overlays, ...oscillators];
  }, []);

  // Filter indicators by search query
  const filteredIndicators = useMemo(() => {
    if (!searchQuery.trim()) {
      return allIndicators;
    }
    const query = searchQuery.toLowerCase();
    return allIndicators.filter(
      (ind) =>
        ind.name.toLowerCase().includes(query) ||
        ind.shortName.toLowerCase().includes(query) ||
        ind.type.toLowerCase().includes(query)
    );
  }, [allIndicators, searchQuery]);

  // Group indicators by category
  const groupedIndicators = useMemo(() => {
    const groups: Record<string, typeof filteredIndicators> = {};

    indicatorCategories.forEach((category) => {
      const categoryIndicators = filteredIndicators.filter((ind) =>
        (category.types as readonly string[]).includes(ind.type)
      );
      if (categoryIndicators.length > 0) {
        groups[category.name] = categoryIndicators;
      }
    });

    return groups;
  }, [filteredIndicators]);

  // Check if indicator is already active
  const isIndicatorActive = useCallback(
    (type: string) => {
      return (
        state.overlays.some((ind) => ind.type === type) ||
        state.oscillators.some((ind) => ind.type === type)
      );
    },
    [state.overlays, state.oscillators]
  );

  // Add indicator
  const handleAddIndicator = useCallback(
    (type: string, isOverlay: boolean) => {
      const meta = getIndicatorMeta(type);
      if (!meta) return;

      const baseIndicator = {
        id: generateId(),
        type: type as IndicatorType,
        visible: true,
        color: meta.defaultColor || getRandomColor(),
        params: { ...(meta.defaultParams as Record<string, number>) },
      };

      if (isOverlay) {
        const indicator: OverlayIndicator = {
          ...baseIndicator,
          type: type as OverlayIndicator['type'],
          category: 'overlay',
        };
        addOverlay(indicator);
      } else {
        const indicator: OscillatorIndicator = {
          ...baseIndicator,
          type: type as OscillatorIndicator['type'],
          category: 'oscillator',
          height: DEFAULT_INDICATOR_HEIGHT,
        };
        addOscillator(indicator);
      }

      // Close panel after adding
      onClose();
    },
    [addOverlay, addOscillator, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Add Indicator
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search indicators..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Indicator List */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.entries(groupedIndicators).map(([category, indicators]) => (
            <div key={category} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {categoryIcons[category]}
                </span>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {category}
                </h3>
              </div>
              <div className="space-y-1">
                {indicators.map((indicator) => {
                  const isActive = isIndicatorActive(indicator.type);
                  return (
                    <button
                      key={indicator.type}
                      onClick={() => handleAddIndicator(indicator.type, indicator.isOverlay)}
                      disabled={isActive}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: indicator.defaultColor }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {indicator.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {indicator.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {indicator.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredIndicators.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No indicators found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
