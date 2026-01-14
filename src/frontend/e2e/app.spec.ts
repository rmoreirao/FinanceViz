import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test('should load and display chart', async ({ page }) => {
    await page.goto('/');

    // Verify symbol search is present (use first() for responsive duplicates)
    await expect(page.getByTestId('symbol-search').first()).toBeVisible();

    // Verify chart type selector is present
    await expect(page.getByTestId('chart-type-select').first()).toBeVisible();

    // Verify time range buttons are available
    await expect(page.getByTestId('time-range-buttons').first()).toBeVisible();
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');

    // Use first() to handle multiple theme toggles (desktop/mobile)
    const themeToggle = page.getByTestId('theme-toggle').first();
    await expect(themeToggle).toBeVisible();

    // Click to toggle theme
    await themeToggle.click();

    // Verify the html element has dark class toggled
    const html = page.locator('html');
    const hasDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Toggle back
    await themeToggle.click();
    const hasDarkAfter = await html.evaluate((el) => el.classList.contains('dark'));

    // Theme should have changed
    expect(hasDark).not.toBe(hasDarkAfter);
  });
});
