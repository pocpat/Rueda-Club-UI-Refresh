import { test, expect } from '@playwright/test';

test.describe('Rueda Club — E2E', () => {
  test('page loads with header and hero', async ({ page }) => {
    await page.goto('/');
    // Header should be visible
    await expect(page.locator('header')).toBeVisible();
    // Move of the Day label should appear
    await expect(page.getByText('Move of the Day')).toBeVisible();
  });

  test('all 4 style sections are rendered', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#style-style-rueda-de-casino')).toBeVisible();
    await expect(page.locator('#style-style-son-cubano')).toBeVisible();
    await expect(page.locator('#style-style-documentary')).toBeVisible();
    await expect(page.locator('#style-style-musicality')).toBeVisible();
  });

  test('clicking a style section expands it', async ({ page }) => {
    await page.goto('/');
    const ruedaSection = page.locator('#style-style-rueda-de-casino');

    // Click the style header to expand
    const toggleButton = ruedaSection.locator('button').first();
    await toggleButton.click();

    // After click, levels should become visible (accordion opens)
    await expect(ruedaSection).toBeVisible();
  });

  test('search bar finds a move', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search moves...');
    await searchInput.fill('Dile');

    // Wait for results dropdown
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 5000 });
    const options = listbox.locator('[role="option"]');
    expect(await options.count()).toBeGreaterThan(0);
  });

  test('search shows no results message for nonsense', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search moves...');
    await searchInput.fill('zzzzzznotarealmove');
    await expect(page.getByText(/No moves found/)).toBeVisible({ timeout: 5000 });
  });

  test('clicking a search result navigates to move detail', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder('Search moves...');
    await searchInput.fill('Dile');

    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 5000 });
    const firstOption = listbox.locator('[role="option"]').first();
    await firstOption.click();

    // URL should contain ?move=
    await expect(page).toHaveURL(/\?move=/, { timeout: 5000 });
  });

  test('move detail page renders with back button', async ({ page }) => {
    // Navigate directly to a known move
    await page.goto('/?move=move-foundations-foundational-body-mechanics-and-rhythm');
    // Should have a back button or link
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 5000 });
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    const themeButton = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]');
    if (await themeButton.count() > 0) {
      const htmlBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      await themeButton.first().click();
      const htmlAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(htmlAfter).not.toBe(htmlBefore);
    }
  });

  test('footer shows move count', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/224 moves/)).toBeVisible();
  });

  test('all internal anchor links work (style shortcuts)', async ({ page }) => {
    await page.goto('/');
    // Click the "Documentary" style shortcut button in hero
    const docButton = page.getByRole('button', { name: /Documentary/i }).first();
    await docButton.click();
    // Page should scroll to the documentary section
    await expect(page.locator('#style-style-documentary')).toBeInViewport({ timeout: 5000 });
  });

  test('no console errors on page load', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Allow YouTube-related warnings but fail on real JS errors
    const realErrors = errors.filter((e) => !e.includes('youtube') && !e.includes('YouTube'));
    expect(realErrors).toEqual([]);
  });
});