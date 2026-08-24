import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 2,
    resources: { alloys: 2, data: 1, relics: 0 },
    facilities: { hangar: 0, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 0,
    ship: { variant: 'bramble', upgrades: [] },
  })));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'FARHAVEN' })).toBeVisible();
});

test('asks a new player to select a starting hull', async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem('voidline-farhaven-save-v2'));
  await page.reload();
  await expect(page.getByRole('heading', { name: /WELCHES SCHIFF/ })).toBeVisible();
  await page.getByRole('button', { name: /ASTER VALE/ }).click();
  await expect(page.getByRole('heading', { name: 'FARHAVEN' })).toBeVisible();
});

test('offers a confirmed developer reset back to the ship choice', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Entwicklerstand zurücksetzen' }).click();
  await expect(page.getByRole('heading', { name: /WELCHES SCHIFF/ })).toBeVisible();
});

test('presents the Farhaven outpost and a compact launch flow', async ({ page }) => {
  await expect(page.getByText('EXPEDITION STARTEN')).toBeVisible();
  await page.getByRole('button', { name: /hangar/i }).click();
  await expect(page.getByRole('heading', { name: 'Hangar' })).toBeVisible();
  await expect(page.getByRole('button', { name: /HANGAR ERRICHTEN/ })).toBeVisible();
  await expect(page.locator('#game-root canvas')).toBeVisible();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'outpost');
});

test('turns the hangar build into a visible Farhaven moment', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 2,
    resources: { alloys: 4, data: 1, relics: 0 },
    facilities: { hangar: 0, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 1,
    ship: { variant: 'aster-vale', upgrades: [] },
  })));
  await page.reload();
  await page.getByRole('button', { name: /hangar/i }).click();
  await expect(page.locator('#facility-stage-badge')).toHaveText('BAUPLATZ · VORBEREITET');
  await page.getByRole('button', { name: /HANGAR ERRICHTEN/ }).click();
  await expect(page.locator('#construction-moment')).toContainText('HANGAR WIRD VERBUNDEN');
  await expect(page.locator('#facility-stage-badge')).toHaveText('HANGARDECK · ONLINE');
  await expect(page.getByRole('button', { name: /ASTER VALE ANSEHEN/ })).toBeVisible();
});

test('uses the test shipyard to persist visible modules', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 2,
    resources: { alloys: 1, data: 1, relics: 0 },
    facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 2,
    ship: { variant: 'bramble', upgrades: [] },
  })));
  await page.reload();
  await page.getByRole('button', { name: /hangar/i }).click();
  await page.getByRole('button', { name: /TESTWERFT ÖFFNEN/ }).click();
  await expect(page.getByRole('heading', { name: 'TESTWERFT' })).toBeVisible();
  await page.getByRole('button', { name: 'ASTER VALE' }).click();
  await expect(page.locator('#shipyard-ship-name')).toHaveText('ASTER VALE');
  await page.getByRole('button', { name: /Breitbandarray/ }).click();
  await expect(page.locator('#shipyard-preview img[data-upgrade="broadband-array"]')).toBeVisible();
  await page.getByRole('button', { name: /Frachtrücken/ }).click();
  await expect(page.locator('#shipyard-preview img[data-upgrade="cargo-spine"]')).toBeVisible();
});

test('scans a sector, classifies a signal and keeps the mobile HUD readable', async ({ page }) => {
  await page.getByRole('button', { name: /EXPEDITION STARTEN/ }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'expedition');
  await page.getByRole('button', { name: /SCANNEN/ }).click();
  await expect(page.locator('#signal-list')).toContainText('GEBROCHENE RELIQUIE');
  await expect(page.locator('#expedition-log')).toContainText('klassifiziert');

  const layout = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-root canvas')!;
    const hud = document.querySelector<HTMLElement>('#expedition-hud')!;
    const rect = hud.getBoundingClientRect();
    return {
      canvasFits: Math.abs(canvas.getBoundingClientRect().width - innerWidth) <= 1,
      hudFits: rect.left >= 0 && rect.bottom <= innerHeight,
      bodyFits: document.body.scrollWidth <= innerWidth,
    };
  });
  expect(layout.canvasFits).toBe(true);
  expect(layout.hudFits).toBe(true);
  expect(layout.bodyFits).toBe(true);
});

test('offers an enabled manual broadside on mobile and desktop', async ({ page }) => {
  await page.getByRole('button', { name: /EXPEDITION STARTEN/ }).click();
  await expect(page.locator('#combat-prompt')).toBeVisible();
  await expect(page.locator('#combat-prompt-fire')).toContainText('SALVE');
  await expect(page.locator('#combat-prompt-fire')).toBeEnabled();
  await page.locator('#combat-prompt-fire').click();
  await expect(page.locator('#expedition-log')).toContainText('Breitseite trifft');
});

test('can pause and request a safe return', async ({ page }) => {
  await page.getByRole('button', { name: /EXPEDITION STARTEN/ }).click();
  await page.locator('#pause-button').click();
  await expect(page.locator('#pause-button')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#pause-button').click();
  await page.getByRole('button', { name: /RÜCKKEHR/ }).click();
  await expect(page.locator('#expedition-status')).toHaveText('RÜCKKEHR LÄUFT');
});
