/**
 * API Key Button Component
 * Toolbar button to open API Key Settings modal with status indicator
 * 
 * TASK-002-004: Add API Key Button to Toolbar
 */

import { useState, useCallback } from 'react';
import { useApiKey } from '../../context';
import { ApiKeyModal } from '../Settings';

/**
 * Key icon for the button
 */
function KeyIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

/**
 * Get status indicator color based on API key configuration
 */
function getStatusColor(isConfigured: boolean, source: 'localStorage' | 'env' | 'none'): string {
  if (!isConfigured) {
    return 'bg-red-500'; // Not configured - red
  }
  if (source === 'env') {
    return 'bg-blue-500'; // From environment - blue
  }
  return 'bg-green-500'; // Configured in localStorage - green
}

/**
 * Get tooltip text based on API key status
 */
function getTooltipText(isConfigured: boolean, source: 'localStorage' | 'env' | 'none'): string {
  if (!isConfigured) {
    return 'API Key: Not configured';
  }
  if (source === 'env') {
    return 'API Key: From environment';
  }
  return 'API Key: Configured';
}

/**
 * API Key Button
 * Displays in toolbar with status indicator, opens settings modal on click
 */
export function ApiKeyButton() {
  const { isConfigured, apiKeySource } = useApiKey();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const statusColor = getStatusColor(isConfigured, apiKeySource);
  const tooltipText = getTooltipText(isConfigured, apiKeySource);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="relative p-2 rounded-lg
                   text-gray-600 dark:text-gray-300
                   hover:bg-gray-100 dark:hover:bg-gray-700
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   transition-colors duration-200"
        title={tooltipText}
        aria-label="API Key Settings"
        data-testid="api-key-button"
      >
        <KeyIcon className="w-5 h-5" />
        {/* Status indicator dot */}
        <span
          className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${statusColor} ring-2 ring-white dark:ring-gray-800`}
          aria-hidden="true"
          data-testid="api-key-status-indicator"
          data-status={isConfigured ? (apiKeySource === 'env' ? 'env' : 'configured') : 'not-configured'}
        />
      </button>

      <ApiKeyModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}

export default ApiKeyButton;
