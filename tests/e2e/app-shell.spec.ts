import { expect, test } from '@playwright/test';

async function openFacility(page: import('@playwright/test').Page, facility: 'hangar' | 'scanner' | 'labor' | 'navigation'): Promise<void> {
  // The buttons remain as accessibility fallbacks; the visible interaction is the
  // corresponding direct station socket on the Phaser board.
  await page.locator(`[data-facility="${facility}"]`).evaluate((button: HTMLButtonElement) => button.click());
}

async function startExpedition(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('#launch-button').click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('voidline-farhaven-expedition-v1');
    localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 2,
    resources: { alloys: 2, data: 1, relics: 0 },
    facilities: { hangar: 0, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 0,
    ship: { variant: 'bramble', upgrades: [] },
    }));
  });
  await page.reload();
  await expect(page.getByRole('region', { name: 'FARHAVEN' })).toBeVisible();
});

test('asks a new player to select a starting hull', async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem('voidline-farhaven-save-v2'));
  await page.reload();
  await expect(page.getByRole('heading', { name: /WELCHES SCHIFF/ })).toBeVisible();
  await page.locator('[data-ship-variant="aster-vale"]').click();
  await expect(page.locator('#launch-button')).toBeVisible();
  await expect(page.locator('#facility-panel')).toBeHidden();
});

test('offers a confirmed developer reset back to the ship choice', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Entwicklerstand zurücksetzen' }).click();
  await expect(page.getByRole('heading', { name: /WELCHES SCHIFF/ })).toBeVisible();
});

test('presents the Farhaven outpost and a compact launch flow', async ({ page }) => {
  await expect(page.locator('#launch-button')).toContainText('NAHES WRACK SICHERN');
  await openFacility(page, 'hangar');
  await expect(page.getByRole('heading', { name: 'Hangar' })).toBeVisible();
  await expect(page.locator('#facility-upgrade-button')).toBeVisible();
  await expect(page.locator('#facility-upgrade-button')).toContainText('4 LEGIERUNGEN SICHERN');
  await expect(page.locator('#game-root canvas')).toBeVisible();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'outpost');
});

test('keeps a Farhaven room focused on one readable mobile decision', async ({ page }) => {
  await openFacility(page, 'hangar');
  await expect(page.locator('#outpost-hud')).toBeHidden();
  await expect(page.locator('#outpost-nav')).toBeHidden();
  await expect(page.locator('#facility-upgrade-button')).toBeVisible();
  await expect(page.locator('#facility-upgrade-button')).toBeDisabled();
  await expect(page.locator('#open-shipyard-button')).toBeHidden();
  await expect(page.locator('#facility-stage-art')).toHaveClass(/facility-art-hangar/);
  await expect(page.locator('#facility-stage-badge')).toContainText('BAUPLAN');
  const compactRoom = await page.locator('#facility-panel').evaluate((panel) => {
    const limit = innerHeight <= 430 ? .62 : .76;
    return panel.getBoundingClientRect().height <= innerHeight * limit;
  });
  expect(compactRoom).toBe(true);
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
  await openFacility(page, 'hangar');
  await expect(page.locator('#facility-level')).toHaveText('FÜR DEN BAU · 4 LEGIERUNGEN');
  await page.getByRole('button', { name: /HANGAR ERRICHTEN/ }).click();
  await expect(page.locator('#construction-moment')).toContainText('HANGAR WIRD VERBUNDEN');
  await expect(page.locator('#facility-panel')).toBeHidden();
  await openFacility(page, 'hangar');
  await expect(page.locator('#facility-level')).toHaveText('ONLINE · +2 Frachtraum in jeder Expedition');
  await expect(page.locator('#facility-stage-badge')).toHaveText('MODUL ONLINE');
  await expect(page.getByRole('button', { name: /WERKSTATT ÖFFNEN/ })).toBeVisible();
});

test('keeps visual hull ideas as previews and only installs real earned modules', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 2,
    resources: { alloys: 1, data: 2, relics: 1 },
    facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 2,
    ship: { variant: 'bramble', upgrades: [] },
  })));
  await page.reload();
  await openFacility(page, 'hangar');
  await page.getByRole('button', { name: /WERKSTATT ÖFFNEN/ }).click();
  await expect(page.getByRole('heading', { name: 'WERKSTATT' })).toBeVisible();
  await expect(page.locator('#shipyard-ship-image')).toHaveJSProperty('complete', true);
  await expect(page.locator('#shipyard-ship-image')).toHaveJSProperty('naturalWidth', 1145);
  await page.getByRole('button', { name: 'ASTER VALE' }).click();
  await expect(page.locator('#shipyard-ship-name')).toHaveText('ASTER VALE');
  await expect(page.locator('#shipyard-ship-image')).toHaveJSProperty('naturalWidth', 1024);
  await page.getByText('RUMPFIDEEN ANSEHEN').click();
  await expect(page.getByText('VISUELLE STUDIE').first()).toBeVisible();
  await page.getByRole('button', { name: /Frachtrücken/ }).click();
  await expect(page.locator('#shipyard-preview img[data-upgrade="cargo-spine"]')).toBeVisible();
  await page.getByRole('button', { name: /Minenlaser/ }).click();
  await expect(page.locator('#shipyard-preview img[data-upgrade="mining-lasers"]')).toBeVisible();
  await expect(page.locator('#shipyard-preview img[data-upgrade="mining-lasers"]')).toHaveJSProperty('naturalWidth', 1024);
});

test('scans a sector, classifies a signal and keeps the mobile HUD readable', async ({ page }) => {
  await startExpedition(page);
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'expedition');
  await page.getByRole('button', { name: /SCANNEN/ }).click();
  await expect(page.locator('#signal-list')).toContainText('GEBROCHENE RELIQUIE');
  await expect(page.locator('#expedition-log')).toContainText('klassifiziert');

  const layout = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-root canvas')!;
    const hud = document.querySelector<HTMLElement>('#expedition-hud')!;
    const rect = hud.getBoundingClientRect();
    const objectiveRect = document.querySelector<HTMLElement>('#objective-tracker')!.getBoundingClientRect();
    const compactLandscape = innerHeight <= 430 && innerWidth > innerHeight;
    return {
      canvasFits: Math.abs(canvas.getBoundingClientRect().width - innerWidth) <= 1,
      hudFits: rect.left >= 0 && rect.bottom <= innerHeight,
      bodyFits: document.body.scrollWidth <= innerWidth,
      hudLeavesCenter: !compactLandscape || rect.right < innerWidth / 2,
      objectiveLeavesCenter: !compactLandscape || objectiveRect.left > innerWidth / 2,
      overlaysDoNotOverlap: !compactLandscape || rect.right <= objectiveRect.left,
    };
  });
  expect(layout.canvasFits).toBe(true);
  expect(layout.hudFits).toBe(true);
  expect(layout.bodyFits).toBe(true);
  expect(layout.hudLeavesCenter).toBe(true);
  expect(layout.objectiveLeavesCenter).toBe(true);
  expect(layout.overlaysDoNotOverlap).toBe(true);
});

test('resumes an ongoing expedition after a browser reload', async ({ page }) => {
  await startExpedition(page);
  await page.getByRole('button', { name: /SCANNEN/ }).click();
  await page.reload();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'expedition');
  await expect(page.locator('#signal-list')).toContainText('GEBROCHENE RELIQUIE');
});

test('offers an enabled manual broadside on mobile and desktop', async ({ page }) => {
  await startExpedition(page);
  await expect(page.locator('#combat-prompt')).toBeVisible();
  await expect(page.locator('#combat-prompt-fire')).toContainText('SALVE');
  await expect(page.locator('#combat-prompt-fire')).toBeEnabled();
  await page.locator('#combat-prompt-fire').click();
  await expect(page.locator('#expedition-log')).toContainText('Breitseite trifft');
});

test('lets the player select a practice dummy directly on the open map', async ({ page }) => {
  await startExpedition(page);
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Expected the expedition canvas to be visible.');
  // Aschen-Attrappe: world (-220, -40) from the start, camera zoom 1.1.
  await canvas.click({ position: { x: box.width / 2 - 220 * 1.1, y: box.height / 2 - 40 * 1.1 } });
  await expect(page.locator('#combat-prompt-target')).toHaveText('ASCHEN-ATTRAPPE');
  await expect(page.locator('#combat-prompt-kicker')).toContainText('ZIEL ERFASST');
});

test('removes legacy prototype weapons from an old save instead of activating them', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 2,
    resources: { alloys: 0, data: 0, relics: 0 },
    facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 1,
    ship: { variant: 'aster-vale', upgrades: ['rail-lance'] },
  })));
  await page.reload();
  await startExpedition(page);
  await expect(page.locator('#combat-prompt-fire')).toContainText('SALVE');
  await expect(page.locator('#combat-prompt-fire')).toBeEnabled();
  await page.locator('#combat-prompt-fire').click();
  await expect(page.locator('#expedition-log')).toContainText('Breitseite trifft');
});

test('can pause and request a safe return', async ({ page }) => {
  await startExpedition(page);
  await page.locator('#pause-button').click();
  await expect(page.locator('#pause-button')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#pause-button').click();
  await page.getByRole('button', { name: /RÜCKKEHR/ }).click();
  await expect(page.locator('#expedition-status')).toHaveText('RÜCKKEHR LÄUFT');
});
