import { expect, test } from '@playwright/test';
import { createExpedition } from '../../src/domain/exploration/expeditionEngine';

test.beforeEach(async ({ page }) => {
  const run = createExpedition();
  const targetPosition = { x: run.position.x + 390, y: run.position.y };
  const target = { ...run.hostiles[0]!, id: 'ballistics-target', name: 'Ballistik-Testziel',
    position: targetPosition, patrolCenter: targetPosition, patrolRadius: 0,
    passive: true, status: 'patrol' as const, hull: 20, maxHull: 20 };
  await page.goto('/');
  await page.evaluate(({ expedition }) => {
    localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({ version: 5,
      resources: { alloys: 2, data: 1, relics: 0 }, facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 },
      expeditionCount: 1, story: { discoveries: [], routeTraceRecovered: false },
      ship: { variant: 'aster-vale', upgrades: ['rail-lance', 'torpedo-rack'] } }));
    localStorage.setItem('voidline-farhaven-expedition-v1', JSON.stringify({ expedition }));
  }, { expedition: { ...run, hostiles: [target], heading: Math.PI / 2 } });
  await page.reload();
  await expect(page.locator('#expedition-status')).toContainText('20/20');
});

test('renders physical shots and applies each installed weapon at contact', async ({ page }) => {
  test.setTimeout(60_000);
  for (const [button, hull] of [['#fire-button', 19], ['#lance-button', 17], ['#ordnance-button', 14]] as const) {
    await page.locator(button).click();
    await expect(page.locator('#game-root canvas')).toHaveAttribute('data-projectile-count', '1');
    // CI runs multiple mobile canvases concurrently and can advance Phaser far
    // slower than wall-clock time. Observe the physical flight completing
    // before asserting damage instead of treating a round still in flight as a miss.
    await expect(page.locator('#game-root canvas')).toHaveAttribute('data-projectile-count', '0', { timeout: 15_000 });
    await expect(page.locator('#expedition-status')).toContainText(`${hull}/20`, { timeout: 15_000 });
  }
  await page.reload();
  await expect(page.locator('#expedition-status')).toContainText('14/20', { timeout: 15_000 });
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-projectile-count', '0', { timeout: 15_000 });
});

test('allows a second touch to fire while flying and prevents ghost shots on return', async ({ page }) => {
  // Real concurrent touch contacts also exercise pointer capture.
  const stick = page.locator('#flight-stick');
  const box = await stick.boundingBox();
  if (!box) throw new Error('Flight stick missing');
  const fireBox = await page.locator('#fire-button').boundingBox();
  if (!fireBox) throw new Error('Fire button missing');
  const touch = await page.context().newCDPSession(page);
  const pilot = { id: 71, x: box.x + box.width / 2, y: box.y + box.height / 2 - 26 };
  const gunner = { id: 72, x: fireBox.x + fireBox.width / 2, y: fireBox.y + fireBox.height / 2 };
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pilot] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pilot, gunner] });
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-projectile-count', '1');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('voidline-farhaven-expedition-v1')!).expedition.position.y)).toBeLessThan(1500);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [pilot] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touch.detach();
  await page.getByRole('button', { name: /RÜCKKEHR/ }).click();
  await expect(page.getByRole('region', { name: 'FARHAVEN', exact: true })).toBeVisible();
  await page.locator('#launch-button').click();
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-projectile-count', '0');
});
