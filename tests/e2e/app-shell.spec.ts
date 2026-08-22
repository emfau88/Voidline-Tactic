import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'WÄHLE DEIN STARTSCHIFF' })).toBeVisible();
});

async function startBattle(
  page: import('@playwright/test').Page,
  starter: 'p-cruiser' | 'p-frigate' = 'p-cruiser',
  module: 'aegis-emitter' | 'vector-drive' = 'aegis-emitter',
): Promise<void> {
  await page.locator(`[data-starter="${starter}"]`).click();
  await page.locator(`[data-starter-module="${module}"]`).click();
  await page.locator('#start-button').click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-game-ready', 'true', { timeout: 10_000 });
}

test('presents the fleet PoC and requires a visible module', async ({ page }) => {
  await expect(page.getByText('FLEET CORRIDORS', { exact: true }).first()).toBeVisible();
  await expect(page.locator('#start-button')).toBeDisabled();
  await page.locator('[data-starter-module="vector-drive"]').click();
  await expect(page.locator('#start-loadout-status')).toContainText('2 Schiffe · 3 Korridore');
  await expect(page.locator('.starter-card.selected [data-mounted-module="vector-drive"]')).toHaveCSS('opacity', '1');
  await expect(page.locator('#start-button')).toBeEnabled();
});

test('loads a full-bleed compact mobile command HUD', async ({ page }) => {
  await startBattle(page, 'p-frigate', 'vector-drive');
  await expect(page.locator('#game-shell')).toHaveAttribute('data-control-mode', 'fleet');
  await expect(page.locator('#ship-name')).toHaveText('Aster Vale');
  await expect(page.locator('#command-group-count')).toContainText('AUTONOM');
  await expect(page.locator('#command-guide')).toContainText('Gib einer ganzen Routengruppe');
  await expect(page.locator('#fleet-command-panel')).toBeHidden();
  await expect(page.locator('#ship-card')).toBeHidden();
  await expect(page.locator('#action-grid')).toBeHidden();

  const layout = await page.evaluate(() => {
    const rect = (selector: string): DOMRect => document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
    const canvas = rect('#game-root canvas');
    const persistent = ['#topbar', '#time-controls', '#command-guide'].map(rect);
    const persistentArea = persistent.reduce((sum, item) => sum + item.width * item.height, 0);
    return {
      canvas: { width: canvas.width, height: canvas.height }, viewport: { width: innerWidth, height: innerHeight },
      persistentRatio: persistentArea / (innerWidth * innerHeight),
      visibleControls: [...document.querySelectorAll<HTMLElement>('.battle-ui button')].filter((button) => {
        const style = getComputedStyle(button); const bounds = button.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0;
      }).length,
      bodyFits: document.body.scrollWidth <= innerWidth,
    };
  });
  expect(Math.abs(layout.canvas.width - layout.viewport.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.canvas.height - layout.viewport.height)).toBeLessThanOrEqual(1);
  expect(layout.persistentRatio).toBeLessThan(0.15);
  expect(layout.visibleControls).toBeLessThanOrEqual(5);
  expect(layout.bodyFits).toBe(true);

  const selected = await page.locator('#game-shell').getAttribute('data-selected-ship');
  const screens = JSON.parse(await page.locator('#game-shell').getAttribute('data-ship-screens') ?? '{}') as Record<string, { x: number; y: number }>;
  const selectedScreen = selected ? screens[selected] : undefined;
  const canvasBox = await page.locator('#game-root canvas').boundingBox();
  if (!selectedScreen || !canvasBox) throw new Error('Selected ship screen position missing');
  await page.locator('#game-root canvas').click({ position: { x: selectedScreen.x * canvasBox.width, y: selectedScreen.y * canvasBox.height } });
  await expect(page.locator('#ship-card')).toBeVisible();
  await expect(page.locator('#action-grid')).toBeVisible();
});

test('issues one stance to an autonomous route group', async ({ page }) => {
  await startBattle(page);
  const canvas = page.locator('#game-root canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Battlefield canvas missing');
  await canvas.click({ position: { x: bounds.width * 0.5, y: bounds.height * 0.27 } });
  const panel = page.locator('#fleet-command-panel');
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: /ABSTAND/ }).click();
  await expect(page.locator('#command-group-title')).toHaveText('OBEN · ROUTENGRUPPE');
  await expect(page.locator('#command-group-count')).toHaveText('1 SCHIFF · AUTONOM');
  await expect(panel).toHaveClass(/collapsed/);
  await expect(panel.locator('[data-stance="keep-range"]')).toHaveClass(/active/);
  await expect(page.locator('#toast')).toContainText('ROUTENBEFEHL ÜBERNOMMEN');
});

test('deploys a reinforcement into a chosen route', async ({ page }) => {
  await startBattle(page);
  await page.getByRole('button', { name: 'Taktische Pause' }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-time-scale', '0');
  await page.getByRole('button', { name: 'Verstärkungen öffnen' }).click();
  const deployment = page.locator('#deployment-panel');
  await expect(deployment).toBeVisible();
  await deployment.getByRole('button', { name: 'OBEN', exact: true }).click();
  const before = Number(await page.locator('#game-shell').getAttribute('data-ship-count'));
  await deployment.getByRole('button', { name: /FREGATTE/ }).click();
  await expect.poll(async () => Number(await page.locator('#game-shell').getAttribute('data-ship-count'))).toBe(before + 1);
  await expect(page.locator('#toast')).toContainText('FREGATTE');
  await expect(page.locator('#command-guide')).toContainText('Tippe Schiffe');
  await expect(deployment).toBeHidden();
});

test('keeps special weapons optional and supports pinch zoom', async ({ page }) => {
  await startBattle(page);
  await expect(page.locator('#action-grid')).toBeHidden();
  await page.getByRole('button', { name: 'Ansichtsmenü öffnen' }).click();
  await page.getByRole('button', { name: 'Hineinzoomen' }).click();
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('120%');
  await page.locator('#game-root canvas').evaluate((canvas) => {
    const bounds = canvas.getBoundingClientRect();
    const emit = (type: string, pointerId: number, x: number): void => {
      canvas.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerType: 'touch', pointerId, clientX: bounds.left + x, clientY: bounds.top + bounds.height * 0.45,
      }));
    };
    emit('pointerdown', 41, bounds.width * 0.42); emit('pointerdown', 42, bounds.width * 0.58);
    emit('pointermove', 41, bounds.width * 0.30); emit('pointermove', 42, bounds.width * 0.70);
    emit('pointerup', 41, bounds.width * 0.30); emit('pointerup', 42, bounds.width * 0.70);
  });
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('270%');
});

test('explains the macro loop in plain language', async ({ page }) => {
  await startBattle(page);
  await page.getByRole('button', { name: 'Ansichtsmenü öffnen' }).click();
  await page.getByRole('button', { name: 'Spielhilfe öffnen' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Haltung');
  await expect(dialog).toContainText('Standardwaffen feuern automatisch');
  await expect(dialog).not.toContainText('Steuerstick');
});
