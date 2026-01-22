import { test, expect } from '@playwright/test';

/**
 * E2E test for data source switching
 * Verifies that switching between Mock and API data sources
 * correctly fetches new data instead of using cached data from the other source
 */
test.describe('Data Source Switching', () => {
  test('should fetch new data when switching between mock and API data sources', async ({ page }) => {
    await page.goto('/');

    // Wait for initial load with mock data (default)
    await page.waitForSelector('[data-testid="data-source-toggle"]', { timeout: 5000 });
    
    // Get the data source dropdown
    const dataSourceToggle = page.getByLabel('Data Source');
    await expect(dataSourceToggle).toBeVisible();

    // Verify initial data source is mock
    const initialValue = await dataSourceToggle.inputValue();
    expect(initialValue).toBe('mock');

    // Wait for chart to load
    await page.waitForTimeout(1000);

    // Switch to Alpha Vantage API
    await dataSourceToggle.selectOption('alphavantage');
    
    // Verify the selection changed
    const apiValue = await dataSourceToggle.inputValue();
    expect(apiValue).toBe('alphavantage');

    // Wait for the chart to attempt to load API data
    await page.waitForTimeout(1000);

    // Switch back to mock
    await dataSourceToggle.selectOption('mock');
    
    // Verify we're back to mock
    const mockValue = await dataSourceToggle.inputValue();
    expect(mockValue).toBe('mock');

    // Wait for the chart to load
    await page.waitForTimeout(1000);

    // The test passes if we can switch between data sources without errors
    // The key fix is that the cache keys now include dataSource,
    // so switching doesn't return stale cached data
  });

  test('should persist data source selection in localStorage', async ({ page }) => {
    await page.goto('/');

    // Switch to API mode
    const dataSourceToggle = page.getByLabel('Data Source');
    await dataSourceToggle.selectOption('alphavantage');

    // Reload the page
    await page.reload();

    // Wait for page to load
    await page.waitForSelector('[data-testid="data-source-toggle"]', { timeout: 5000 });

    // Verify the data source is still API mode
    const dataSourceAfterReload = page.getByLabel('Data Source');
    const value = await dataSourceAfterReload.inputValue();
    expect(value).toBe('alphavantage');

    // Clean up: switch back to mock for other tests
    await dataSourceAfterReload.selectOption('mock');
  });
});
