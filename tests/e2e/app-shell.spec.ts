import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'WÄHLE DEIN STARTSCHIFF' })).toBeVisible();
});

async function startBattle(
  page: import('@playwright/test').Page,
  starter?: 'p-cruiser' | 'p-frigate',
  module: 'aegis-emitter' | 'vector-drive' = 'aegis-emitter',
): Promise<void> {
  if (starter) await page.locator(`[data-starter="${starter}"]`).click();
  await page.locator(`button[data-starter-module="${module}"]`).click();
  await page.locator('#start-button').click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-game-ready', 'true', { timeout: 10_000 });
  await expect(page.locator('#game-shell')).toHaveAttribute('aria-busy', 'false');
}

async function pauseBattle(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Taktische Pause' }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-time-scale', '0');
}

async function clickShip(
  page: import('@playwright/test').Page,
  shipId: string,
  offset: { x: number; y: number } = { x: 0, y: 0 },
): Promise<void> {
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no layout box.');
  const serialized = await page.locator('#game-shell').getAttribute('data-ship-screens');
  const screens = JSON.parse(serialized ?? '{}') as Record<string, { x: number; y: number }>;
  const position = screens[shipId];
  if (!position) throw new Error(`No screen position exposed for ${shipId}.`);
  await canvas.click({ position: { x: box.width * position.x + offset.x, y: box.height * position.y + offset.y } });
}

test('loads the sharp mobile-first real-time shell', async ({ page }) => {
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
  await expect(page.locator('[data-mission="mission-1"]')).toBeEnabled();
  await expect(page.locator('[data-mission="mission-2"]')).toBeDisabled();
  await expect(page.locator('[data-mission="mission-3"]')).toBeDisabled();
  await expect(page.locator('#start-button')).toBeDisabled();
  await page.locator('button[data-starter-module="vector-drive"]').click();
  await expect(page.locator('#start-button')).toBeEnabled();
  await expect(page.locator('button[data-starter-module="vector-drive"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.starter-card.selected [data-mounted-module="vector-drive"]')).toHaveCSS('opacity', '1');
  await startBattle(page, 'p-frigate', 'vector-drive');
  await expect(page).toHaveTitle('Voidline Tactics');
  await expect(page.locator('#game-root canvas')).toBeVisible();
  await expect(page.locator('#ship-name')).toHaveText('Aster Vale');
  await expect(page.locator('#ship-class')).toContainText('VECTOR-DRIVE');
  await expect(page.locator('#ship-energy-text')).toHaveText('80/80');
  await expect(page.locator('#game-shell')).toHaveAttribute('data-starter-module', 'vector-drive');
  await expect(page.locator('#game-shell')).toHaveAttribute('data-ship-count', '2');
  await expect(page.locator('[data-action="escort"]')).toBeHidden();
  await expect(page.getByRole('button', { name: /Steuerjoystick/ })).toBeVisible();
  await expect(page.locator('[data-action="course"]')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Taktische Pause' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Vollbild umschalten' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('125%');
  await page.getByRole('button', { name: 'Hineinzoomen' }).click();
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('135%');

  const shellWidth = await page.locator('#game-shell').evaluate((element) => element.getBoundingClientRect().width);
  const innerWidth = await page.evaluate(() => window.innerWidth);
  expect(Math.abs(shellWidth - innerWidth)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true);
  const density = await page.locator('#game-root canvas').evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const bounds = canvas.getBoundingClientRect();
    return canvas.width / bounds.width;
  });
  const expectedDensity = await page.evaluate(() => Math.min(window.devicePixelRatio, 2));
  expect(Math.abs(density - expectedDensity)).toBeLessThan(0.08);

  const compactLayout = await page.evaluate(() => window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches);
  if (compactLayout) {
    const layout = await page.evaluate(() => {
      const rect = (id: string): DOMRect => document.getElementById(id)!.getBoundingClientRect();
      const topEdge = Math.max(rect('topbar').bottom, rect('time-controls').bottom, rect('view-controls').bottom);
      const bottomEdge = Math.min(rect('flight-control').top, rect('action-grid').top);
      const actionRects = [...document.querySelectorAll<HTMLElement>('#action-grid button:not([hidden])')]
        .map((button) => button.getBoundingClientRect())
        .filter((button) => button.width > 0 && button.height > 0)
        .sort((left, right) => left.left - right.left);
      return {
        freeRatio: (bottomEdge - topEdge) / window.innerHeight,
        telemetryHeight: rect('ship-card').height,
        telemetryTop: rect('ship-card').top,
        stick: { width: rect('flight-stick').width, height: rect('flight-stick').height },
        primaryAbility: {
          width: document.querySelector<HTMLElement>('[data-action="torpedo"]')!.getBoundingClientRect().width,
          height: document.querySelector<HTMLElement>('[data-action="torpedo"]')!.getBoundingClientRect().height,
          radius: Number.parseFloat(getComputedStyle(document.querySelector<HTMLElement>('[data-action="torpedo"]')!).borderRadius),
        },
        actions: actionRects.map((button) => ({ left: button.left, right: button.right, width: button.width, height: button.height })),
      };
    });
    expect(layout.freeRatio).toBeGreaterThanOrEqual(0.68);
    expect(layout.telemetryHeight).toBeLessThanOrEqual(50);
    expect(layout.telemetryTop).toBeLessThanOrEqual(48);
    expect(layout.stick.width).toBeGreaterThanOrEqual(64);
    expect(layout.stick.height).toBeGreaterThanOrEqual(64);
    expect(layout.primaryAbility.width).toBeGreaterThanOrEqual(64);
    expect(layout.primaryAbility.height).toBeGreaterThanOrEqual(64);
    expect(layout.primaryAbility.radius).toBeGreaterThanOrEqual(30);
    expect(Math.min(...layout.actions.map((action) => action.width))).toBeGreaterThanOrEqual(44);
    expect(Math.min(...layout.actions.map((action) => action.height))).toBeGreaterThanOrEqual(44);
    for (let index = 1; index < layout.actions.length; index += 1) {
      expect(layout.actions[index].left - layout.actions[index - 1].right).toBeGreaterThanOrEqual(4);
    }
  }
});

test('loads an unlocked relay mission with its persistent campaign setup', async ({ page }) => {
  await page.evaluate(() => window.localStorage.setItem('voidline-campaign-v1', JSON.stringify({
    version: 1,
    selectedMissionId: 'mission-1',
    unlockedMission: 2,
    completedMissions: ['mission-1'],
    salvage: 120,
    upgrades: ['vector-thrusters'],
  })));
  await page.reload();
  await page.locator('[data-mission="mission-2"]').click();
  await startBattle(page);
  await expect(page.locator('#game-shell')).toHaveAttribute('data-mission', 'mission-2');
  await expect(page.locator('#objective-label')).toContainText('Relais sichern');
  await expect(page.locator('#ship-ap')).toContainText('/70');
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

test('sets and holds a joystick heading while route drawing stays dormant', async ({ page }) => {
  await startBattle(page);
  await pauseBattle(page);
  const stick = page.getByRole('button', { name: /Steuerjoystick/ });
  const box = await stick.boundingBox();
  if (!box) throw new Error('Flight stick has no layout box.');

  await expect(page.locator('#game-shell')).toHaveAttribute('data-desired-heading', '0.0000');
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.18);
  await page.mouse.down();
  await page.mouse.up();

  await expect(page.locator('#game-shell')).toHaveAttribute('data-desired-heading', '-1.5708');
  await expect(page.locator('#game-shell')).toHaveAttribute('data-course-points', '0');
  await expect(page.locator('#flight-stick-readout')).toHaveText('SOLLKURS N');
  await expect(page.locator('[data-action="course"]')).toContainText('INAKTIV');
});

test('marks a focus target and arms the telegraphed lance', async ({ page }) => {
  await startBattle(page, 'p-cruiser');
  await pauseBattle(page);
  await clickShip(page, 'e-destroyer', { x: 24, y: 0 });
  await expect(page.locator('#target-card')).toBeVisible();
  await expect(page.locator('#target-name')).toHaveText('Cinder Scout');
  await page.getByRole('button', { name: /ZIEL/ }).click();
  await expect(page.locator('#target-name')).toHaveText('Cinder Scout');
  await page.getByRole('button', { name: /LANZE/ }).click();
  await expect(page.locator('#ship-status')).toContainText('LANZE');
  await expect(page.locator('#toast')).toContainText('RIFT LANCE LÄDT');
});

test('launches a physical torpedo and changes escort doctrine', async ({ page }) => {
  await page.evaluate(() => window.localStorage.setItem('voidline-campaign-v1', JSON.stringify({
    version: 1,
    selectedMissionId: 'mission-1',
    unlockedMission: 2,
    completedMissions: ['mission-1'],
    salvage: 120,
    upgrades: [],
  })));
  await page.reload();
  await page.locator('[data-mission="mission-2"]').click();
  await startBattle(page, 'p-frigate');
  await pauseBattle(page);
  await page.getByRole('button', { name: /ZIEL/ }).click();
  await clickShip(page, 'e-destroyer');
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
  await expect(page.getByRole('dialog')).toContainText('Steuerstick');
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
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('240%');
});
