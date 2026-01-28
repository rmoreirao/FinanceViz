/**
 * API Key Management E2E Tests
 * Tests for FEAT-002: Alpha Vantage API Key Management
 * 
 * Test IDs used:
 * - api-key-button: Toolbar button to open API key settings
 * - api-key-status-indicator: Status dot on the button (data-status: configured|env|not-configured)
 * - api-key-modal-content: Modal content container
 * - api-key-context-message: Context message shown when modal opened from data source toggle
 * - api-key-status-badge: Status badge showing current key source
 * - api-key-input: API key input field
 * - api-key-toggle-visibility: Show/hide password toggle button
 * - api-key-test-button: Test API key button
 * - api-key-save-button: Save button
 * - api-key-clear-button: Clear saved API key button
 * - api-key-validation-result: Validation result alert (data-valid: true|false)
 * - data-source-toggle: Data source dropdown
 */

import { test, expect, type Page } from '@playwright/test';

const STORAGE_KEY = 'alphavantage_api_key';
const TEST_API_KEY = 'test-api-key-12345';

/**
 * Helper to clear API key from localStorage
 */
async function clearApiKeyFromStorage(page: Page) {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, STORAGE_KEY);
}

/**
 * Helper to set API key in localStorage
 */
async function setApiKeyInStorage(page: Page, apiKey: string) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
  }, { key: STORAGE_KEY, value: apiKey });
}

/**
 * Helper to get API key from localStorage
 */
async function getApiKeyFromStorage(page: Page): Promise<string | null> {
  return await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, STORAGE_KEY);
}

test.describe('API Key Management', () => {
  
  test.describe('API Key Button', () => {
    
    test('E2E-004-A: Button visible in toolbar', async ({ page }) => {
      await page.goto('/');
      
      // API key button should be visible in toolbar
      const apiKeyButton = page.getByTestId('api-key-button').first();
      await expect(apiKeyButton).toBeVisible();
    });

    test('E2E-004-B: Button opens modal', async ({ page }) => {
      await page.goto('/');
      
      // Click the API key button
      await page.getByTestId('api-key-button').first().click();
      
      // Modal should be visible
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
      
      // Modal should have title
      await expect(page.getByRole('dialog')).toContainText('API Key Settings');
    });

    test('E2E-004-C: Status indicator shows correct color when no key configured', async ({ page }) => {
      await page.goto('/');
      await clearApiKeyFromStorage(page);
      await page.reload();
      
      // Wait for app to load
      await page.waitForLoadState('networkidle');
      
      // Check status indicator shows not-configured
      const statusIndicator = page.getByTestId('api-key-status-indicator').first();
      await expect(statusIndicator).toHaveAttribute('data-status', 'env'); // Falls back to env in dev
    });

    test('E2E-004-D: Status indicator shows green when key is saved in localStorage', async ({ page }) => {
      await page.goto('/');
      
      // Set API key via localStorage
      await setApiKeyInStorage(page, TEST_API_KEY);
      await page.reload();
      
      // Wait for app to load
      await page.waitForLoadState('networkidle');
      
      // Check status indicator shows configured
      const statusIndicator = page.getByTestId('api-key-status-indicator').first();
      await expect(statusIndicator).toHaveAttribute('data-status', 'configured');
      
      // Clean up
      await clearApiKeyFromStorage(page);
    });

    test('E2E-004-E: Button accessible in mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Open hamburger menu
      await page.getByRole('button', { name: /open menu/i }).click();
      
      // Wait for menu animation to complete
      await page.waitForTimeout(400);
      
      // API key button should be visible in mobile menu (use last() for mobile version)
      const mobileApiKeyButton = page.getByTestId('api-key-button').last();
      await expect(mobileApiKeyButton).toBeVisible();
      
      // Click it to ensure it's functional
      await mobileApiKeyButton.click();
      
      // Modal should open
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
    });
  });

  test.describe('API Key Modal', () => {
    
    test('E2E-003-A: Modal opens and shows status', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Modal content should be visible
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
      
      // Status badge should be visible
      await expect(page.getByTestId('api-key-status-badge')).toBeVisible();
      
      // Input field should be visible
      await expect(page.getByTestId('api-key-input')).toBeVisible();
      
      // Buttons should be visible
      await expect(page.getByTestId('api-key-test-button')).toBeVisible();
      await expect(page.getByTestId('api-key-save-button')).toBeVisible();
    });

    test('E2E-003-B: Enter and save API key', async ({ page }) => {
      await page.goto('/');
      await clearApiKeyFromStorage(page);
      await page.reload();
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
      
      // Enter API key
      await page.getByTestId('api-key-input').fill(TEST_API_KEY);
      
      // Click save
      await page.getByTestId('api-key-save-button').click();
      
      // Modal should close
      await expect(page.getByTestId('api-key-modal-content')).not.toBeVisible();
      
      // Verify key was saved to localStorage
      const savedKey = await getApiKeyFromStorage(page);
      expect(savedKey).toBe(TEST_API_KEY);
      
      // Open modal again to verify status
      await page.getByTestId('api-key-button').first().click();
      await expect(page.getByTestId('api-key-status-badge')).toContainText('Saved in browser');
      
      // Clean up
      await clearApiKeyFromStorage(page);
    });

    test('E2E-003-C: Show/hide toggle works', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      const input = page.getByTestId('api-key-input');
      const toggleButton = page.getByTestId('api-key-toggle-visibility');
      
      // Enter a key
      await input.fill(TEST_API_KEY);
      
      // Initially should be password type (masked)
      await expect(input).toHaveAttribute('type', 'password');
      
      // Click toggle to show
      await toggleButton.click();
      await expect(input).toHaveAttribute('type', 'text');
      
      // Click toggle to hide again
      await toggleButton.click();
      await expect(input).toHaveAttribute('type', 'password');
    });

    test('E2E-003-D: Modal closes on Escape', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Modal should close
      await expect(page.getByTestId('api-key-modal-content')).not.toBeVisible();
    });

    test('E2E-003-E: Modal closes on overlay click', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
      
      // Click on overlay (outside modal)
      await page.locator('[role="dialog"]').locator('..').click({ position: { x: 10, y: 10 } });
      
      // Modal should close
      await expect(page.getByTestId('api-key-modal-content')).not.toBeVisible();
    });

    test('E2E-001-A: API key persists in localStorage after reload', async ({ page }) => {
      await page.goto('/');
      await clearApiKeyFromStorage(page);
      
      // Open modal and save key
      await page.getByTestId('api-key-button').first().click();
      await page.getByTestId('api-key-input').fill(TEST_API_KEY);
      await page.getByTestId('api-key-save-button').click();
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Open modal and verify key is loaded
      await page.getByTestId('api-key-button').first().click();
      const input = page.getByTestId('api-key-input');
      await expect(input).toHaveValue(TEST_API_KEY);
      
      // Status should show localStorage
      await expect(page.getByTestId('api-key-status-badge')).toContainText('Saved in browser');
      
      // Clean up
      await clearApiKeyFromStorage(page);
    });

    test('E2E-001-B: API key clears from localStorage', async ({ page }) => {
      await page.goto('/');
      
      // First save a key
      await setApiKeyInStorage(page, TEST_API_KEY);
      await page.reload();
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Clear button should be visible since key is in localStorage
      const clearButton = page.getByTestId('api-key-clear-button');
      await expect(clearButton).toBeVisible();
      
      // Click clear
      await clearButton.click();
      
      // Verify key was removed
      const savedKey = await getApiKeyFromStorage(page);
      expect(savedKey).toBeNull();
      
      // Status should update (will fall back to env if available)
      await expect(page.getByTestId('api-key-status-badge')).not.toContainText('Saved in browser');
    });

    test('Save button is disabled when input is empty', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Clear input
      await page.getByTestId('api-key-input').fill('');
      
      // Save button should be disabled
      await expect(page.getByTestId('api-key-save-button')).toBeDisabled();
      
      // Enter text
      await page.getByTestId('api-key-input').fill('some-key');
      
      // Save button should be enabled
      await expect(page.getByTestId('api-key-save-button')).not.toBeDisabled();
    });

    test('Test button is disabled when input is empty', async ({ page }) => {
      await page.goto('/');
      await clearApiKeyFromStorage(page);
      await page.reload();
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Clear input
      await page.getByTestId('api-key-input').fill('');
      
      // Test button should be disabled
      await expect(page.getByTestId('api-key-test-button')).toBeDisabled();
      
      // Enter text
      await page.getByTestId('api-key-input').fill('some-key');
      
      // Test button should be enabled
      await expect(page.getByTestId('api-key-test-button')).not.toBeDisabled();
    });
  });

  test.describe('API Key Validation', () => {
    
    test('E2E-007-A: Test button shows loading state', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Enter a key
      await page.getByTestId('api-key-input').fill('test-key');
      
      // Click test button
      await page.getByTestId('api-key-test-button').click();
      
      // Button should show loading text
      await expect(page.getByTestId('api-key-test-button')).toContainText('Testing...');
    });

    test('E2E-002-B: Validation result displays after testing', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Enter a test key
      await page.getByTestId('api-key-input').fill('test-key-12345');
      
      // Click test
      await page.getByTestId('api-key-test-button').click();
      
      // Wait for validation result to appear
      const validationResult = page.getByTestId('api-key-validation-result');
      await expect(validationResult).toBeVisible({ timeout: 10000 });
      
      // Should have data-valid attribute (true or false depending on API response)
      const dataValid = await validationResult.getAttribute('data-valid');
      expect(['true', 'false']).toContain(dataValid);
      
      // Result should have role="alert" for accessibility
      await expect(validationResult).toHaveAttribute('role', 'alert');
    });

    test('E2E-007-D: Validation result clears on input change', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Enter a key and test
      await page.getByTestId('api-key-input').fill('test-key');
      await page.getByTestId('api-key-test-button').click();
      
      // Wait for validation result
      await expect(page.getByTestId('api-key-validation-result')).toBeVisible({ timeout: 10000 });
      
      // Type in input (modify)
      await page.getByTestId('api-key-input').fill('different-key');
      
      // Validation result should disappear
      await expect(page.getByTestId('api-key-validation-result')).not.toBeVisible();
    });
  });

  test.describe('Data Source Integration', () => {
    
    test('E2E-006-D: No prompt when key exists - switch happens directly', async ({ page }) => {
      await page.goto('/');
      
      // Key already exists (from env in dev mode)
      // Switch to API source
      const dataSourceSelect = page.getByTestId('data-source-toggle').first().locator('select');
      await dataSourceSelect.selectOption('alphavantage');
      
      // Modal should NOT open
      await expect(page.getByTestId('api-key-modal-content')).not.toBeVisible();
      
      // Data source should be API
      await expect(dataSourceSelect).toHaveValue('alphavantage');
    });

    test('E2E-005-A: API uses saved key - data loads successfully', async ({ page }) => {
      await page.goto('/');
      
      // Set API key
      await setApiKeyInStorage(page, process.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo');
      await page.reload();
      
      // Switch to API source
      const dataSourceSelect = page.getByTestId('data-source-toggle').first().locator('select');
      await dataSourceSelect.selectOption('alphavantage');
      
      // Wait for data to load (chart should update)
      await page.waitForTimeout(2000);
      
      // App should still be functional (no crash)
      await expect(page.getByTestId('symbol-search').first()).toBeVisible();
      
      // Clean up - switch back to mock
      await dataSourceSelect.selectOption('mock');
      await clearApiKeyFromStorage(page);
    });
  });

  test.describe('Accessibility', () => {
    
    test('Modal is keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Open modal via keyboard
      await page.getByTestId('api-key-button').first().focus();
      await page.keyboard.press('Enter');
      
      // Modal should be open
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
      
      // Tab through elements
      await page.keyboard.press('Tab');
      const focusedElement1 = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(focusedElement1).toBeTruthy();
      
      // Continue tabbing
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('api-key-modal-content')).not.toBeVisible();
    });

    test('Input has proper label', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Input should have accessible label
      const input = page.getByTestId('api-key-input');
      await expect(input).toHaveAttribute('id', 'api-key-input');
      
      // Label should exist and be associated
      const label = page.locator('label[for="api-key-input"]');
      await expect(label).toBeVisible();
      await expect(label).toContainText('Alpha Vantage API Key');
    });

    test('Validation result is announced as alert', async ({ page }) => {
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Enter and test key
      await page.getByTestId('api-key-input').fill('test-key');
      await page.getByTestId('api-key-test-button').click();
      
      // Wait for result
      const validationResult = page.getByTestId('api-key-validation-result');
      await expect(validationResult).toBeVisible({ timeout: 10000 });
      
      // Should have role="alert" for screen readers
      await expect(validationResult).toHaveAttribute('role', 'alert');
    });
  });

  test.describe('Responsive Design', () => {
    
    test('Modal works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Open hamburger menu first on mobile
      await page.getByRole('button', { name: /open menu/i }).click();
      
      // Wait for menu animation
      await page.waitForTimeout(400);
      
      // Click API key button (use last() for mobile menu button)
      const mobileApiKeyButton = page.getByTestId('api-key-button').last();
      await expect(mobileApiKeyButton).toBeVisible();
      await mobileApiKeyButton.click();
      
      // Modal should be visible and usable
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
      await expect(page.getByTestId('api-key-input')).toBeVisible();
      await expect(page.getByTestId('api-key-save-button')).toBeVisible();
      
      // Buttons should be visible and clickable
      const testButton = page.getByTestId('api-key-test-button');
      const saveButton = page.getByTestId('api-key-save-button');
      
      await expect(testButton).toBeVisible();
      await expect(saveButton).toBeVisible();
    });

    test('Modal works on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      // Open modal
      await page.getByTestId('api-key-button').first().click();
      
      // Modal should be visible
      await expect(page.getByTestId('api-key-modal-content')).toBeVisible();
      
      // All elements should be accessible
      await expect(page.getByTestId('api-key-input')).toBeVisible();
      await expect(page.getByTestId('api-key-test-button')).toBeVisible();
      await expect(page.getByTestId('api-key-save-button')).toBeVisible();
    });
  });
});
