import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'WÄHLE DEIN STARTSCHIFF' })).toBeVisible();
});

async function startBattle(page: import('@playwright/test').Page, starter?: 'p-cruiser' | 'p-frigate'): Promise<void> {
  if (starter) await page.locator(`[data-starter="${starter}"]`).click();
  await page.getByRole('button', { name: /ERSTEN KONTAKT STARTEN/ }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-game-ready', 'true', { timeout: 10_000 });
  await expect(page.locator('#game-shell')).toHaveAttribute('aria-busy', 'false');
}

test('loads the mobile-first Phaser shell', async ({ page }) => {
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
  await startBattle(page, 'p-frigate');
  await expect(page).toHaveTitle('Voidline Tactics');
  await expect(page.locator('#game-root canvas')).toBeVisible();
  await expect(page.locator('#ship-name')).toHaveText('Aster Vale');
  await expect(page.locator('#ship-energy-text')).toHaveText('80/80');
  await expect(page.getByRole('button', { name: /BEWEGEN/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /BEAT 0\/2 Befehle/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Vollbild umschalten' })).toBeEnabled();
  await page.getByRole('button', { name: 'Hineinzoomen' }).click();
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('110%');
  const shellWidth = await page.locator('#game-shell').evaluate((element) => element.getBoundingClientRect().width);
  const innerWidth = await page.evaluate(() => window.innerWidth);
  expect(Math.abs(shellWidth - Math.min(innerWidth, 620))).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true);
  const density = await page.locator('#game-root canvas').evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const bounds = canvas.getBoundingClientRect();
    return canvas.width / bounds.width;
  });
  const expectedDensity = await page.evaluate(() => Math.min(window.devicePixelRatio, 2));
  expect(Math.abs(density - expectedDensity)).toBeLessThan(0.08);
});

test('opens the concise mobile help', async ({ page }) => {
  await startBattle(page);
  await page.getByRole('button', { name: 'Spielhilfe öffnen' }).click();
  await expect(page.getByRole('heading', { name: 'SO SPIELST DU' })).toBeVisible();
  await page.getByRole('button', { name: 'ZURÜCK ZUM GEFECHT' }).click();
  await expect(page.getByRole('heading', { name: 'SO SPIELST DU' })).toBeHidden();
});

test('plans and confirms a touch movement', async ({ page }) => {
  await startBattle(page);
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no layout box.');

  await page.getByRole('button', { name: /BEWEGEN/ }).click();
  await canvas.click({ position: { x: box.width * 0.5, y: box.height * 0.56 } });
  await expect(page.locator('#confirm-bar')).toBeVisible();
  await page.locator('#confirm-button').click();

  await expect(page.getByRole('button', { name: /BEAT 1\/2 Befehle/ })).toBeVisible();
  await page.getByRole('button', { name: /BEAT 1\/2 Befehle/ }).click();
  await expect(page.locator('#turn-number')).toHaveText('2', { timeout: 7_000 });
  await expect(page.locator('#phase-label')).toHaveText('BEFEHLE PLANEN');
});

test('executes a simultaneous command beat and returns to planning', async ({ page }) => {
  await startBattle(page);
  await page.getByRole('button', { name: /BEAT 0\/2 Befehle/ }).click();
  await expect(page.locator('#turn-number')).toHaveText('2', { timeout: 7_000 });
  await expect(page.locator('#phase-label')).toHaveText('BEFEHLE PLANEN');
  await expect(page.getByRole('button', { name: /BEWEGEN/ })).toBeEnabled();
});

test('supports two-finger pinch zoom around the touch midpoint', async ({ page }) => {
  await startBattle(page);
  await page.locator('#game-root canvas').evaluate((canvas) => {
    const bounds = canvas.getBoundingClientRect();
    const emit = (type: string, pointerId: number, x: number, y: number): void => {
      canvas.dispatchEvent(new PointerEvent(type, {
        bubbles: true,
        pointerType: 'touch',
        pointerId,
        clientX: bounds.left + x,
        clientY: bounds.top + y,
      }));
    };
    emit('pointerdown', 41, bounds.width * 0.4, bounds.height * 0.43);
    emit('pointerdown', 42, bounds.width * 0.6, bounds.height * 0.43);
    emit('pointermove', 41, bounds.width * 0.3, bounds.height * 0.43);
    emit('pointermove', 42, bounds.width * 0.7, bounds.height * 0.43);
    emit('pointerup', 41, bounds.width * 0.3, bounds.height * 0.43);
    emit('pointerup', 42, bounds.width * 0.7, bounds.height * 0.43);
  });
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('180%');
});
