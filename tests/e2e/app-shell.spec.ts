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
  await expect(page.locator('#command-guide')).toContainText('Eine Haltung gilt für alle Schiffe');

  const layout = await page.evaluate(() => {
    const rect = (selector: string): DOMRect => document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
    const command = rect('#fleet-command-panel');
    const actions = rect('#action-grid');
    const canvas = rect('#game-root canvas');
    const abilityButtons = [...document.querySelectorAll<HTMLElement>('#action-grid button')].map((button) => button.getBoundingClientRect());
    const stanceButtons = [...document.querySelectorAll<HTMLElement>('.stance-grid button')].map((button) => button.getBoundingClientRect());
    return {
      canvas: { width: canvas.width, height: canvas.height }, viewport: { width: innerWidth, height: innerHeight },
      commandActionGap: actions.left - command.right, commandHeightRatio: command.height / innerHeight,
      abilityButtons: abilityButtons.map(({ width, height }) => ({ width, height })),
      stanceWidths: stanceButtons.map(({ width }) => width), bodyFits: document.body.scrollWidth <= innerWidth,
    };
  });
  expect(Math.abs(layout.canvas.width - layout.viewport.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.canvas.height - layout.viewport.height)).toBeLessThanOrEqual(1);
  expect(layout.commandActionGap).toBeGreaterThanOrEqual(8);
  expect(layout.commandHeightRatio).toBeLessThan(0.35);
  expect(Math.min(...layout.abilityButtons.map(({ width }) => width))).toBeGreaterThanOrEqual(44);
  expect(Math.min(...layout.abilityButtons.map(({ height }) => height))).toBeGreaterThanOrEqual(44);
  expect(Math.min(...layout.stanceWidths)).toBeGreaterThanOrEqual(48);
  expect(layout.bodyFits).toBe(true);
});

test('issues one stance to an autonomous route group', async ({ page }) => {
  await startBattle(page);
  const panel = page.locator('#fleet-command-panel');
  await panel.getByRole('button', { name: 'OBERE ROUTE', exact: true }).click();
  await panel.getByRole('button', { name: /ABSTAND/ }).click();
  await expect(page.locator('#command-group-title')).toHaveText('OBEN · ROUTENGRUPPE');
  await expect(page.locator('#command-group-count')).toHaveText('1 SCHIFF · AUTONOM');
  await expect(panel.getByRole('button', { name: /ABSTAND/ })).toHaveClass(/active/);
  await expect(page.locator('#toast')).toContainText('ROUTENBEFEHL ÜBERNOMMEN');
  await expect(page.locator('#transfer-selected-button')).toBeVisible();
});

test('deploys a reinforcement into a chosen route', async ({ page }) => {
  await startBattle(page);
  await page.getByRole('button', { name: 'Taktische Pause' }).click();
  await expect(page.locator('#game-shell')).toHaveAttribute('data-time-scale', '0');
  const deployment = page.locator('#deployment-panel');
  await deployment.getByRole('button', { name: 'OBEN', exact: true }).click();
  const before = Number(await page.locator('#game-shell').getAttribute('data-ship-count'));
  await deployment.getByRole('button', { name: /FREGATTE/ }).click();
  await expect.poll(async () => Number(await page.locator('#game-shell').getAttribute('data-ship-count'))).toBe(before + 1);
  await expect(page.locator('#toast')).toContainText('FREGATTE');
  await expect(page.locator('#command-guide')).toContainText('Wechsle Schiffe');
});

test('keeps special weapons optional and supports pinch zoom', async ({ page }) => {
  await startBattle(page);
  await expect(page.locator('#optional-systems-label')).toHaveText('OPTIONAL · EINZELSCHIFF');
  await page.getByRole('button', { name: 'Hineinzoomen' }).click();
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('120%');
  await page.locator('#game-root canvas').evaluate((canvas) => {
    const bounds = canvas.getBoundingClientRect();
    const emit = (type: string, pointerId: number, x: number): void => canvas.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerType: 'touch', pointerId, clientX: bounds.left + x, clientY: bounds.top + bounds.height * 0.45,
    }));
    emit('pointerdown', 41, bounds.width * 0.42); emit('pointerdown', 42, bounds.width * 0.58);
    emit('pointermove', 41, bounds.width * 0.30); emit('pointermove', 42, bounds.width * 0.70);
    emit('pointerup', 41, bounds.width * 0.30); emit('pointerup', 42, bounds.width * 0.70);
  });
  await expect(page.getByRole('button', { name: 'Zoom zurücksetzen' })).toHaveText('270%');
});

test('explains the macro loop in plain language', async ({ page }) => {
  await startBattle(page);
  await page.getByRole('button', { name: 'Spielhilfe öffnen' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Haltung');
  await expect(dialog).toContainText('Standardwaffen feuern automatisch');
  await expect(dialog).not.toContainText('Steuerstick');
});
