/**
 * API Key Settings Component
 * Modal for managing API key after initial setup
 * 
 * TASK-004-004: Create Settings Button and API Key Settings Component
 */

import { useState } from 'react';
import { Modal, Button, Spinner } from '../common';
import { useApiKey } from '../../context';

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Settings modal for API key management
 */
export function ApiKeySettings({ isOpen, onClose }: ApiKeySettingsProps) {
  const { apiKey, setApiKey, clearApiKey, testApiKey, isLoading, error, validationStatus } = useApiKey();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setInputValue(apiKey || '');
    setIsEditing(true);
    setLocalError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setInputValue('');
    setShowKey(false);
    setLocalError(null);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setLocalError('API key cannot be empty');
      return;
    }

    // Test the key first
    const isValid = await testApiKey(inputValue);
    if (!isValid) {
      return;
    }

    // Save the key
    setApiKey(inputValue);
    setIsEditing(false);
    setInputValue('');
    setShowKey(false);
    setLocalError(null);
  };

  const handleTestCurrent = async () => {
    if (!apiKey) {
      setLocalError('No API key configured');
      return;
    }
    setLocalError(null);
    await testApiKey(apiKey);
  };

  const handleClearKey = () => {
    clearApiKey();
    setShowClearConfirm(false);
    setIsEditing(false);
    setInputValue('');
    onClose();
  };

  const handleClose = () => {
    if (isEditing) {
      handleCancelEdit();
    }
    onClose();
  };

  const getMaskedKey = (key: string | null): string => {
    if (!key) return 'Not configured';
    if (key.length <= 4) return '****';
    return `${'*'.repeat(key.length - 4)}${key.slice(-4)}`;
  };

  const displayError = localError || error;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="API Key Settings"
      size="md"
    >
      <div className="space-y-4">
        {!isEditing ? (
          <>
            {/* Display Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current API Key
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 
                              dark:border-gray-600 rounded-md">
                <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                  {getMaskedKey(apiKey)}
                </code>
              </div>
            </div>

            {/* Validation Status */}
            {validationStatus === 'validating' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Spinner size="sm" />
                <span>Validating API key...</span>
              </div>
            )}

            {validationStatus === 'valid' && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>API key is valid!</span>
              </div>
            )}

            {validationStatus === 'invalid' && displayError && (
              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{displayError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {apiKey && (
                <Button
                  onClick={handleTestCurrent}
                  variant="secondary"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    'Test Key'
                  )}
                </Button>
              )}
              <Button
                onClick={handleStartEdit}
                variant="primary"
                className="flex-1"
              >
                {apiKey ? 'Change Key' : 'Add Key'}
              </Button>
            </div>

            {apiKey && !showClearConfirm && (
              <Button
                onClick={() => setShowClearConfirm(true)}
                variant="ghost"
                className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 
                           dark:hover:bg-red-900/20"
              >
                Clear API Key
              </Button>
            )}

            {/* Clear Confirmation */}
            {showClearConfirm && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                              dark:border-red-800 rounded-md space-y-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Are you sure you want to clear your API key? You'll need to re-enter it to use 
                  Alpha Vantage data.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClearKey}
                    variant="primary"
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 
                               dark:hover:bg-red-800"
                  >
                    Yes, Clear Key
                  </Button>
                  <Button
                    onClick={() => setShowClearConfirm(false)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <div>
              <label
                htmlFor="api-key-edit-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                API Key
              </label>
              <div className="relative">
                <input
                  id="api-key-edit-input"
                  type={showKey ? 'text' : 'password'}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setLocalError(null);
                  }}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 
                             rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                             placeholder-gray-400 dark:placeholder-gray-500"
                  disabled={isLoading}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue.trim() && !isLoading) {
                      handleSave();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs
                             text-gray-600 dark:text-gray-400 hover:text-gray-900 
                             dark:hover:text-gray-200 focus:outline-none"
                  disabled={isLoading}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Validation Status */}
            {validationStatus === 'validating' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Spinner size="sm" />
                <span>Validating API key...</span>
              </div>
            )}

            {validationStatus === 'valid' && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>API key is valid!</span>
              </div>
            )}

            {validationStatus === 'invalid' && displayError && (
              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{displayError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCancelEdit}
                variant="secondary"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                className="flex-1"
                disabled={!inputValue.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default ApiKeySettings;
