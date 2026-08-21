import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#game-shell')).toHaveAttribute('data-game-ready', 'true', { timeout: 10_000 });
  await expect(page.locator('#game-shell')).toHaveAttribute('aria-busy', 'false');
});

test('loads the mobile-first Phaser shell', async ({ page }) => {
  await expect(page).toHaveTitle('Voidline Tactics');
  await expect(page.locator('#game-root canvas')).toBeVisible();
  await expect(page.getByRole('button', { name: /BEWEGEN/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /RUNDE beenden/ })).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true);
});

test('opens the concise mobile help', async ({ page }) => {
  await page.getByRole('button', { name: 'Spielhilfe öffnen' }).click();
  await expect(page.getByRole('heading', { name: 'SO SPIELST DU' })).toBeVisible();
  await page.getByRole('button', { name: 'ZURÜCK ZUM GEFECHT' }).click();
  await expect(page.getByRole('heading', { name: 'SO SPIELST DU' })).toBeHidden();
});

test('plans and confirms a touch movement', async ({ page }) => {
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no layout box.');

  await page.getByRole('button', { name: /BEWEGEN/ }).click();
  await canvas.click({ position: { x: box.width * 0.5, y: box.height * 0.56 } });
  await expect(page.locator('#confirm-bar')).toBeVisible();
  await page.locator('#confirm-button').click();

  await expect(page.locator('#ship-ap')).toHaveText('2/3');
  await expect(page.locator('#ship-energy-text')).toHaveText('76/80');
});

test('completes an animated enemy phase and returns control', async ({ page }) => {
  await page.getByRole('button', { name: /RUNDE beenden/ }).click();
  await expect(page.locator('#turn-number')).toHaveText('2', { timeout: 7_000 });
  await expect(page.locator('#phase-label')).toHaveText('SPIELERPHASE');
  await expect(page.getByRole('button', { name: /BEWEGEN/ })).toBeEnabled();
});
