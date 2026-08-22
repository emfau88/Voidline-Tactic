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

async function pauseBattle(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Taktische Pause' }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-time-scale', '0');
}

test('loads the sharp mobile-first real-time shell', async ({ page }) => {
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
  await startBattle(page, 'p-frigate');
  await expect(page).toHaveTitle('Voidline Tactics');
  await expect(page.locator('#game-root canvas')).toBeVisible();
  await expect(page.locator('#ship-name')).toHaveText('Aster Vale');
  await expect(page.locator('#ship-energy-text')).toHaveText('80/80');
  await expect(page.getByRole('button', { name: /KURS/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Taktische Pause' })).toBeVisible();
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

test('freezes simulation in tactical pause and resumes at live speed', async ({ page }) => {
  await startBattle(page);
  await pauseBattle(page);
  await page.waitForTimeout(150);
  const frozenTime = await page.locator('#game-shell').getAttribute('data-simulation-time');
  await page.waitForTimeout(450);
  await expect(page.locator('#game-shell')).toHaveAttribute('data-simulation-time', frozenTime ?? '0');
  await page.getByRole('button', { name: 'Normale Geschwindigkeit' }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-time-scale', '1');
  await expect.poll(async () => Number(await page.locator('#game-shell').getAttribute('data-simulation-time'))).toBeGreaterThan(Number(frozenTime));
});

test('draws a direct flagship course while paused', async ({ page }) => {
  await startBattle(page);
  await pauseBattle(page);
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no layout box.');

  await page.getByRole('button', { name: /KURS/ }).click();
  await page.mouse.move(box.x + box.width * 0.42, box.y + box.height * 0.58);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 4 });
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.42, { steps: 5 });
  await page.mouse.up();

  await expect.poll(async () => Number(await page.locator('#game-shell').getAttribute('data-course-points'))).toBeGreaterThan(0);
  await expect(page.locator('#toast')).toContainText('KURS GESETZT');
});

test('marks a focus target and arms the telegraphed lance', async ({ page }) => {
  await startBattle(page, 'p-cruiser');
  await pauseBattle(page);
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no layout box.');

  await page.getByRole('button', { name: /ZIEL/ }).click();
  await canvas.click({ position: { x: box.width * 0.4, y: box.height * 0.31 } });
  await expect(page.locator('#target-card')).toBeVisible();
  await expect(page.locator('#target-name')).toHaveText('Ashen Crown');
  await page.getByRole('button', { name: /LANZE/ }).click();
  await expect(page.locator('#ship-status')).toContainText('LANZE');
  await expect(page.locator('#toast')).toContainText('RIFT LANCE LÄDT');
});

test('launches a physical torpedo and changes escort doctrine', async ({ page }) => {
  await startBattle(page, 'p-frigate');
  await pauseBattle(page);
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no layout box.');

  await page.getByRole('button', { name: /ZIEL/ }).click();
  await canvas.click({ position: { x: box.width * (box.width > 500 ? 0.6 : 0.7), y: box.height * 0.34 } });
  await expect(page.locator('#target-name')).toHaveText('Red Wake');
  await page.getByRole('button', { name: /TORPEDO/ }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-projectiles', '1');
  await expect(page.locator('#toast')).toContainText('VOID TORPEDO GESTARTET');

  const escortButton = page.getByRole('button', { name: /ESKORTE/ });
  await escortButton.click();
  await expect(escortButton).toContainText('FLANKE L');
});

test('opens the concise real-time help', async ({ page }) => {
  await startBattle(page);
  await page.getByRole('button', { name: 'Spielhilfe öffnen' }).click();
  await expect(page.getByRole('heading', { name: 'SO SPIELST DU' })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Standardbatterien feuern automatisch');
  await page.getByRole('button', { name: 'ZURÜCK ZUM GEFECHT' }).click();
  await expect(page.getByRole('heading', { name: 'SO SPIELST DU' })).toBeHidden();
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
