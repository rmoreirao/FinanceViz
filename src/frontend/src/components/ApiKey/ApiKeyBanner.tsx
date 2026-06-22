/**
 * API Key Banner Component
 * Persistent banner shown when API key is not configured
 * 
 * TASK-004-006: Add Persistent Banner for Skipped Setup
 */

import { useState } from 'react';
import { Button } from '../common';

interface ApiKeyBannerProps {
  onConfigureClick: () => void;
}

const BANNER_DISMISSED_KEY = 'apiKeyBannerDismissed';

/**
 * Banner component that prompts user to configure API key
 * Dismissal persists only for current session (sessionStorage)
 */
export function ApiKeyBanner({ onConfigureClick }: ApiKeyBannerProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
  };

  const handleConfigure = () => {
    // Clear dismissal when user clicks configure
    sessionStorage.removeItem(BANNER_DISMISSED_KEY);
    onConfigureClick();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 
                 dark:border-yellow-800 px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Warning Icon */}
          <svg
            className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>

          {/* Message */}
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <span className="font-medium">Alpha Vantage API key not configured.</span>
            {' '}
            Set up your API key to access real-time market data, or continue using mock data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleConfigure}
            variant="primary"
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 
                       dark:hover:bg-yellow-600 text-white"
          >
            Configure Now
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/40
                       text-yellow-600 dark:text-yellow-400 transition-colors
                       focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="Dismiss banner"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyBanner;
