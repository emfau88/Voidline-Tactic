import { expect, test } from '@playwright/test';

async function openFacility(page: import('@playwright/test').Page, facility: 'hangar' | 'scanner' | 'labor' | 'navigation'): Promise<void> {
  // The buttons remain as accessibility fallbacks; the visible interaction is the
  // corresponding direct station socket on the Phaser board.
  await page.locator(`[data-facility="${facility}"]`).evaluate((button: HTMLButtonElement) => button.click());
}

async function startExpedition(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('#launch-button').click();
}

async function tapHangarOnStation(page: import('@playwright/test').Page): Promise<void> {
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Expected the Farhaven canvas to be visible.');
  const unit = Math.min(Math.min(box.width / 1120, box.height / 600) * 1.12, 1.55);
  await canvas.click({ position: { x: box.width * .5 + 174 * unit, y: box.height * .51 } });
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
  await expect(page.locator('#resource-strip')).toContainText('LEGIERUNGEN');
  await expect(page.locator('#resource-strip')).toContainText('DATEN');
  await expect(page.locator('#resource-strip')).toContainText('RELIKTE');
  await expect(page.locator('#resource-strip img[src*="resource-alloys-v1.png"]')).toBeVisible();
  await expect(page.locator('#first-launch-guide')).toContainText('DEIN ERSTER SCHRITT');
  await expect(page.locator('#launch-button')).toContainText('JETZT AUSFLIEGEN');
  await expect(page.locator('#launch-button')).toContainText('Rückkehr jederzeit möglich');
  await openFacility(page, 'hangar');
  await expect(page.getByRole('heading', { name: 'Hangar' })).toBeVisible();
  await expect(page.locator('#facility-upgrade-button')).toBeVisible();
  await expect(page.locator('#facility-upgrade-button')).toContainText('4 Legierungen SICHERN');
  await expect(page.locator('#game-root canvas')).toBeVisible();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'outpost', { timeout: 12_000 });
});

test('lets the player inspect the Farhaven core as the station anchor', async ({ page }) => {
  const canvas = page.locator('#game-root canvas');
  // Phaser creates the station targets after its texture preload. On high-DPI
  // mobile emulation the canvas is visible a few frames before those targets.
  await page.waitForTimeout(1_500);
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Expected the Farhaven canvas to be visible.');
  await canvas.click({ position: { x: box.width / 2, y: box.height * .51 } });
  await expect(page.getByRole('heading', { name: 'Der Warmkern' })).toBeVisible();
  await expect(page.locator('#facility-stage-art')).toHaveClass(/facility-art-core/);
  await expect(page.locator('#facility-level')).toContainText('KERN WÄCHST');
  await expect(page.locator('#facility-upgrade-button')).toBeHidden();
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
    const panelHeight = panel.getBoundingClientRect().height;
    if (innerHeight <= 430 && innerWidth > innerHeight) {
      return panelHeight <= innerHeight * .62;
    }
    return panelHeight <= innerHeight - 28;
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
  // Exercise the actual Phaser target a player touches, not the hidden DOM fallback.
  await page.waitForTimeout(1_200);
  await tapHangarOnStation(page);
  await expect(page.locator('#facility-level')).toHaveText('FÜR DEN BAU · 4 Legierungen');
  await page.getByRole('button', { name: /HANGAR ERRICHTEN/ }).click();
  await expect(page.locator('#construction-moment')).toContainText('HANGAR WIRD VERBUNDEN');
  await expect(page.locator('#facility-panel')).toBeHidden();
  await openFacility(page, 'hangar');
  await expect(page.locator('#facility-level')).toHaveText('ONLINE · +2 Frachtraum in jeder Expedition');
  await expect(page.locator('#facility-stage-badge')).toHaveText('MODUL ONLINE');
  await expect(page.getByRole('button', { name: /WERKSTATT ÖFFNEN/ })).toBeVisible();
});

test('uses the Sternenwerk as the real gate to Veloria and shows the discovery log', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 5,
    resources: { alloys: 2, data: 2, relics: 0 },
    facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 3,
    story: { routeTraceRecovered: true, discoveries: ['echo-wreck', 'black-vein'] },
    ship: { variant: 'aster-vale', upgrades: ['cargo-spine', 'mining-lasers'] },
  })));
  await page.reload();
  await expect(page.locator('#objective-title')).toHaveText('DAS STERNENWERK ERRICHTEN');
  await openFacility(page, 'navigation');
  await page.getByRole('button', { name: /STERNENWERK ERRICHTEN/ }).click();
  await openFacility(page, 'navigation');
  await expect(page.locator('#facility-level')).toContainText('Richtet das Xenogate nach Veloria aus');
  await expect(page.locator('#facility-discovery')).toContainText('Reliquie der Versorgungsroute');
  await expect(page.locator('#objective-title')).toHaveText('DAS XENOGATE ÖFFNEN');
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
  await expect(page.locator('#shipyard-install-confirm')).toBeVisible();
  await expect(page.locator('#shipyard-install-confirm')).toContainText('NOCH NICHT GEKAUFT');
  await expect(page.locator('#resource-strip [data-resource="alloys"] b')).toHaveText('1');
  await page.getByRole('button', { name: 'ABBRECHEN' }).click();
  await expect(page.locator('#shipyard-install-confirm')).toBeHidden();
  await expect(page.locator('#resource-strip [data-resource="alloys"] b')).toHaveText('1');
  await page.getByRole('button', { name: /Minenlaser/ }).click();
  await expect(page.locator('#shipyard-preview img[data-upgrade="mining-lasers"]')).toBeVisible();
  await expect(page.locator('#shipyard-preview img[data-upgrade="mining-lasers"]')).toHaveJSProperty('naturalWidth', 1024);
});

test('only spends resources after confirming a selected hangar upgrade', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 5,
    resources: { alloys: 1, data: 1, relics: 0 },
    facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 2,
    story: { routeTraceRecovered: false, discoveries: [] },
    ship: { variant: 'bramble', upgrades: [] },
  })));
  await page.reload();
  await openFacility(page, 'hangar');
  await page.getByRole('button', { name: /WERKSTATT ÖFFNEN/ }).click();
  await page.getByRole('button', { name: /Frachtrücken/ }).click();
  await expect(page.locator('#resource-strip [data-resource="alloys"] b')).toHaveText('1');
  await page.getByRole('button', { name: 'EINBAU BESTÄTIGEN' }).click();
  await expect(page.locator('#resource-strip [data-resource="alloys"] b')).toHaveText('0');
  await expect(page.getByRole('button', { name: /Frachtrücken/ })).toContainText('ONLINE');
});

test('renders every earned field module as a real Bramble asset in the workshop', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 5,
    resources: { alloys: 0, data: 0, relics: 0 },
    facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 4,
    story: { routeTraceRecovered: false, discoveries: [] },
    ship: { variant: 'bramble', upgrades: ['broadband-array', 'cargo-spine', 'salvage-claws', 'mining-lasers', 'rail-lance', 'torpedo-rack'] },
  })));
  await page.reload();
  await openFacility(page, 'hangar');
  await page.getByRole('button', { name: /WERKSTATT ÖFFNEN/ }).click();
  await expect(page.locator('#shipyard-parts img.shipyard-art-layer')).toHaveCount(6);
  const sources = await page.locator('#shipyard-parts img.shipyard-art-layer').evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  expect(sources.every((source) => source?.includes('/assets/ships/bramble/'))).toBe(true);
});

test('scans a sector, classifies a signal and keeps the mobile HUD readable', async ({ page }) => {
  await startExpedition(page);
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'expedition');
  await page.getByRole('button', { name: /SCANNEN/ }).click();
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-scan-compass', 'visible');
  await expect(page.locator('#signal-list')).toContainText('RELIQUIE DER VERSORGUNGSROUTE');
  await expect(page.locator('#signal-list [data-resource="alloys"]')).toHaveCount(2);
  await expect(page.locator('#signal-list')).toContainText('GLUTKUTTER-FRACHT');
  await expect(page.locator('#signal-list')).toContainText('BEWACHT');
  await expect(page.locator('#cargo-breakdown [data-resource="alloys"]')).toHaveCount(1);
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

test('opens the data and relic mission after the hangar without requiring a cargo spine', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 5,
    resources: { alloys: 0, data: 0, relics: 0 },
    facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 1,
    story: { routeTraceRecovered: false, discoveries: ['echo-wreck'] },
    ship: { variant: 'aster-vale', upgrades: [] },
  })));
  await page.reload();
  await expect(page.locator('#launch-button')).toContainText('ZWEITE MISSION');
  await expect(page.locator('#launch-button')).toContainText('MÖNCHSLATERNE');
  await startExpedition(page);
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-navigation-target', 'monk-lantern');
  await page.getByRole('button', { name: /SCANNEN/ }).click();
  await expect(page.locator('#signal-list')).toContainText('MÖNCHSLATERNE');
  await expect(page.locator('#signal-list')).toContainText('SCHNEIDELITURGIE');
  await page.getByRole('button', { name: /KARTE/ }).click();
  await expect(page.locator('#sector-map')).toBeVisible();
  await expect(page.locator('#sector-map')).toHaveAttribute('data-mission-target', 'monk-lantern');
  await expect(page.locator('#sector-map .sector-map-point.weak')).toHaveCount(2);
  await expect(page.locator('#game-shell')).toHaveAttribute('data-game-paused', 'true');
  await page.getByRole('button', { name: 'Sektorkarte schließen' }).click();
  await expect(page.locator('#sector-map')).toBeHidden();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-game-paused', 'false');
});

test('mirrors built Farhaven modules at the expedition return point', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 5,
    resources: { alloys: 20, data: 20, relics: 20 },
    facilities: { hangar: 1, scanner: 1, labor: 1, navigation: 1 },
    expeditionCount: 4,
    story: { routeTraceRecovered: true, discoveries: [] },
    ship: { variant: 'bramble', upgrades: [] },
  })));
  await page.reload();
  await startExpedition(page);
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-expedition-farhaven', 'core,hangar,scanner,labor,navigation');
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-expedition-farhaven-scale', '2.75');
});

test('resumes an ongoing expedition after a browser reload', async ({ page }) => {
  await startExpedition(page);
  await page.getByRole('button', { name: /SCANNEN/ }).click();
  await page.reload();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'expedition');
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-expedition-scene-stack', 'exclusive');
  await expect(page.locator('#signal-list')).toContainText('RELIQUIE DER VERSORGUNGSROUTE');
});

test('introduces one real optional contact instead of combat dummies on the first expedition', async ({ page }) => {
  await startExpedition(page);
  await expect(page.locator('#combat-prompt')).toHaveCount(0);
  await expect(page.locator('#fire-button')).toContainText('SALVE');
  await expect(page.locator('#fire-button')).toBeEnabled();
  await expect(page.locator('#expedition-status')).toContainText('AUTOZIEL · GLUTKUTTER · 8/8');
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-expedition-contacts', 'first-cinder-skiff');
  await page.locator('#fire-button').click();
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-broadside-volley', '3-shell-stagger');
  await expect(page.locator('#fire-button')).toHaveAttribute('data-cooling', 'true');
  await expect(page.locator('#fire-button')).toContainText('Nachladen');
});

test('does not place practice dummies onto the story map', async ({ page }) => {
  await startExpedition(page);
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Expected the expedition canvas to be visible.');
  // The former nearby practice-dummy location is now empty in the story sector.
  await canvas.click({ position: { x: box.width / 2 - 220 * 1.1, y: box.height / 2 - 40 * 1.1 } });
  await expect(canvas).not.toHaveAttribute('data-expedition-contacts', /ash-patrol|cinder-escort|wreck-eater/);
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
  await expect(page.locator('#fire-button')).toContainText('SALVE');
  await expect(page.locator('#fire-button')).toBeEnabled();
  await expect(page.locator('#lance-button')).toBeDisabled();
  await expect(page.locator('#ordnance-button')).toBeDisabled();
});

test('keeps broadside, rail lance and torpedoes as separate expedition weapons', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 5,
    resources: { alloys: 0, data: 0, relics: 0 },
    facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 4,
    story: { routeTraceRecovered: true, discoveries: [] },
    ship: { variant: 'aster-vale', upgrades: ['cargo-spine', 'mining-lasers', 'rail-lance', 'torpedo-rack'] },
  })));
  await page.reload();
  await startExpedition(page);
  await expect(page.locator('#fire-button')).toContainText('SALVE');
  await expect(page.locator('#lance-button')).toContainText('LANZE');
  await expect(page.locator('#ordnance-button')).toContainText('TORPEDO');
  const controlsFit = await page.evaluate(() => {
    const actions = document.querySelector<HTMLElement>('#expedition-actions')!.getBoundingClientRect();
    const flight = document.querySelector<HTMLElement>('#flight-control')!.getBoundingClientRect();
    return actions.right <= innerWidth
      && actions.bottom <= innerHeight
      && actions.top >= 0
      && flight.right <= actions.left;
  });
  expect(controlsFit).toBe(true);
});

test('can pause and request a safe return', async ({ page }) => {
  await startExpedition(page);
  await page.locator('#pause-button').click();
  await expect(page.locator('#pause-button')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#pause-button').click();
  await page.getByRole('button', { name: /RÜCKKEHR/ }).click();
  await expect(page.locator('#expedition-status')).toHaveText('RÜCKKEHR LÄUFT');
});

test('returns to a neutral Farhaven overview without reopening a prior station room', async ({ page }) => {
  await openFacility(page, 'navigation');
  await expect(page.getByRole('heading', { name: 'Sternenwerk' })).toBeVisible();
  await page.getByRole('button', { name: 'Bereich schließen' }).click();
  await startExpedition(page);
  await page.getByRole('button', { name: /RÜCKKEHR/ }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-screen', 'outpost');
  await expect(page.locator('#facility-panel')).toBeHidden();
  await expect(page.locator('#shipyard-panel')).toBeHidden();
  // The short pointer-tail shield is present but should be imperceptible to a
  // player; after half a second Farhaven must be directly usable again.
  await page.waitForTimeout(550);
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-outpost-input', 'enabled');
  await tapHangarOnStation(page);
  await expect(page.getByRole('heading', { name: 'Hangar' })).toBeVisible();
});
