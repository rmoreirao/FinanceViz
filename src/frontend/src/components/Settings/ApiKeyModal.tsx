/**
 * API Key Modal Component
 * Modal for managing Alpha Vantage API key configuration
 * 
 * TASK-002-003: Create API Key Settings Modal Component
 */

import { useState, useEffect, useCallback } from 'react';
import { Modal, Spinner } from '../common';
import { useApiKey } from '../../context';
import { validateApiKey, type ApiKeyValidationResult } from '../../api/alphavantage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional message to display at the top of the modal */
  contextMessage?: string;
  /** Callback when API key is successfully saved */
  onSave?: () => void;
}

/**
 * Eye icon for showing password
 */
function EyeIcon({ className = '' }: { className?: string }) {
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
 * Eye off icon for hiding password
 */
function EyeOffIcon({ className = '' }: { className?: string }) {
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
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

/**
 * Check icon for success state
 */
function CheckIcon({ className = '' }: { className?: string }) {
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

/**
 * X icon for error state
 */
function XIcon({ className = '' }: { className?: string }) {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

/**
 * Get status badge color and text based on API key source
 */
function getStatusDisplay(source: 'localStorage' | 'env' | 'none'): { color: string; text: string } {
  switch (source) {
    case 'localStorage':
      return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', text: 'Saved in browser' };
    case 'env':
      return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', text: 'From environment' };
    case 'none':
      return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', text: 'Not configured' };
  }
}

/**
 * API Key Settings Modal
 * Allows users to view, enter, test, and save their Alpha Vantage API key
 */
export function ApiKeyModal({ isOpen, onClose, contextMessage, onSave }: ApiKeyModalProps) {
  const { apiKey, apiKeySource, setApiKey, clearApiKey } = useApiKey();
  
  const [inputValue, setInputValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ApiKeyValidationResult | null>(null);

  // Initialize input with current key when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue(apiKey || '');
      setValidationResult(null);
      setShowPassword(false);
    }
  }, [isOpen, apiKey]);

  // Clear validation result when input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setValidationResult(null);
  }, []);

  // Toggle password visibility
  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Test API key
  const handleTestKey = useCallback(async () => {
    if (!inputValue.trim()) {
      setValidationResult({ valid: false, error: 'Please enter an API key' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateApiKey(inputValue);
      setValidationResult(result);
    } catch {
      setValidationResult({ valid: false, error: 'Failed to validate API key' });
    } finally {
      setIsValidating(false);
    }
  }, [inputValue]);

  // Save API key
  const handleSave = useCallback(() => {
    if (inputValue.trim()) {
      setApiKey(inputValue.trim());
      onSave?.();
      onClose();
    }
  }, [inputValue, setApiKey, onSave, onClose]);

  // Clear API key
  const handleClear = useCallback(() => {
    clearApiKey();
    setInputValue('');
    setValidationResult(null);
  }, [clearApiKey]);

  const status = getStatusDisplay(apiKeySource);
  const canSave = inputValue.trim().length > 0;
  const canTest = inputValue.trim().length > 0 && !isValidating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="API Key Settings"
      size="md"
    >
      <div className="space-y-4" data-testid="api-key-modal-content">
        {/* Context message (when opened from data source toggle) */}
        {contextMessage && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm" data-testid="api-key-context-message">
            {contextMessage}
          </div>
        )}

        {/* Current status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`} data-testid="api-key-status-badge">
            {status.text}
          </span>
        </div>

        {/* API Key input */}
        <div>
          <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alpha Vantage API Key
          </label>
          <div className="relative">
            <input
              id="api-key-input"
              type={showPassword ? 'text' : 'password'}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         placeholder-gray-400 dark:placeholder-gray-500"
              aria-describedby={validationResult ? 'validation-result' : undefined}
              data-testid="api-key-input"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={showPassword ? 'Hide API key' : 'Show API key'}
              data-testid="api-key-toggle-visibility"
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Get your free API key at{' '}
            <a
              href="https://www.alphavantage.co/support/#api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              alphavantage.co
            </a>
          </p>
        </div>

        {/* Validation result */}
        {validationResult && (
          <div
            id="validation-result"
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              validationResult.valid
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}
            role="alert"
            data-testid="api-key-validation-result"
            data-valid={validationResult.valid}
          >
            {validationResult.valid ? (
              <>
                <CheckIcon className="w-5 h-5 flex-shrink-0" />
                <span>API key is valid!</span>
              </>
            ) : (
              <>
                <XIcon className="w-5 h-5 flex-shrink-0" />
                <span>{validationResult.error}</span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={!canTest}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                       rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            data-testid="api-key-test-button"
          >
            {isValidating ? (
              <>
                <Spinner size="sm" />
                <span>Testing...</span>
              </>
            ) : (
              'Test API Key'
            )}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 px-4 py-2 text-sm font-medium text-white
                       bg-blue-600 hover:bg-blue-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="api-key-save-button"
          >
            Save
          </button>
        </div>

        {/* Clear button (only show if key is configured) */}
        {apiKeySource === 'localStorage' && (
          <button
            type="button"
            onClick={handleClear}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400
                       hover:text-red-700 dark:hover:text-red-300
                       hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-red-500"
            data-testid="api-key-clear-button"
          >
            Clear Saved API Key
          </button>
        )}
      </div>
    </Modal>
  );
}

export default ApiKeyModal;
