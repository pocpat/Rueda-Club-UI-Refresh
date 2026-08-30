import { test, expect } from '@playwright/test';

test.describe('Rueda Club — E2E', () => {
  test('page loads with header and hero', async ({ page }) => {
    await page.goto('/');
    // Header should be visible
    await expect(page.locator('header')).toBeVisible();
    // Move of the Day label should appear
    await expect(page.getByText('Move of the Day')).toBeVisible();
  });

  test('sticky footer tab bar has 5 tabs', async ({ page }) => {
    await page.goto('/');
    const tabbar = page.locator('nav.tabbar');
    await expect(tabbar).toBeVisible();
    for (const label of ['Home', 'Classes', 'Playlist', 'Community', 'Favorites']) {
      await expect(tabbar.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('Classes tab shows all 4 style cards', async ({ page }) => {
    await page.goto('/?tab=classes');
    await expect(page.locator('#style-style-rueda-de-casino')).toBeVisible();
    await expect(page.locator('#style-style-son-cubano')).toBeVisible();
    await expect(page.locator('#style-style-documentary')).toBeVisible();
    await expect(page.locator('#style-style-musicality')).toBeVisible();
  });

  test('clicking a style card opens its class page', async ({ page }) => {
    await page.goto('/?tab=classes');
    const ruedaSection = page.locator('#style-style-rueda-de-casino');
    await ruedaSection.locator('button').first().click();
    await expect(page).toHaveURL(/\?style=style-rueda-de-casino/, { timeout: 5000 });
    // Class page header shows the style name
    await expect(page.getByRole('heading', { name: 'Rueda de Casino' })).toBeVisible();
  });

  test('class page expands a level accordion', async ({ page }) => {
    await page.goto('/?style=style-rueda-de-casino');
    const levelButton = page.locator('button', { hasText: 'Foundations' }).first();
    await levelButton.click();
    // Move cards should appear
    await expect(page.locator('.move-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('search bar finds a move (Classes tab)', async ({ page }) => {
    await page.goto('/?tab=classes');
    const searchInput = page.getByPlaceholder('Search moves...');
    await searchInput.fill('Dile');
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 5000 });
    const options = listbox.locator('[role="option"]');
    expect(await options.count()).toBeGreaterThan(0);
  });

  test('search shows no results message for nonsense', async ({ page }) => {
    await page.goto('/?tab=classes');
    const searchInput = page.getByPlaceholder('Search moves...');
    await searchInput.fill('zzzzzznotarealmove');
    await expect(page.getByText(/No moves found/)).toBeVisible({ timeout: 5000 });
  });

  test('clicking a search result navigates to move detail', async ({ page }) => {
    await page.goto('/?tab=classes');
    const searchInput = page.getByPlaceholder('Search moves...');
    await searchInput.fill('Dile');
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 5000 });
    await listbox.locator('[role="option"]').first().click();
    await expect(page).toHaveURL(/\?move=/, { timeout: 5000 });
  });

  test('move detail page renders with back button', async ({ page }) => {
    await page.goto('/?move=move-foundations-foundational-body-mechanics-and-rhythm');
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible({ timeout: 5000 });
  });

  test('Play music quick action opens Playlist tab with empty state', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Play music/i }).click();
    await expect(page).toHaveURL(/\?tab=playlist/, { timeout: 5000 });
    await expect(page.getByText('Songs coming soon')).toBeVisible();
  });

  test('Community tab shows venue placeholder', async ({ page }) => {
    await page.goto('/?tab=community');
    await expect(page.getByText('Training spot announced soon')).toBeVisible();
  });

  test('Favorites tab shows empty state, hearting a lesson adds it', async ({ page }) => {
    await page.goto('/?tab=favorites');
    await expect(page.getByText('No favorites yet')).toBeVisible();

    // Heart a lesson from a class page
    await page.goto('/?style=style-rueda-de-casino');
    const levelButton = page.locator('button', { hasText: 'Foundations' }).first();
    await levelButton.click();
    const heart = page.locator('.move-card .fav-btn').first();
    await heart.click();
    // Heart becomes active
    await expect(heart).toHaveClass(/is-fav/);
    // Favorites tab now shows the lesson
    await page.goto('/?tab=favorites');
    await expect(page.locator('.move-card').first()).toBeVisible();
  });

  test('Dance challenge opens a random Rueda/Son lesson', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Dance challenge/i }).click();
    await expect(page).toHaveURL(/\?move=/, { timeout: 5000 });
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

  test('hero style shortcut navigates to class page', async ({ page }) => {
    await page.goto('/');
    const docButton = page.getByRole('button', { name: /Documentary/i }).first();
    await docButton.click();
    await expect(page).toHaveURL(/\?style=style-documentary/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: 'Documentary' })).toBeVisible();
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