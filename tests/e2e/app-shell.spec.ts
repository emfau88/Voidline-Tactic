import { expect, test } from '@playwright/test';

test('loads the mobile-first Phaser shell', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Voidline Tactics');
  await expect(page.locator('#game-root canvas')).toBeVisible();
});
