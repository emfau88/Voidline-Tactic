import { expect, test } from '@playwright/test';
import { createExpedition } from '../../src/domain/exploration/expeditionEngine';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate((expedition) => {
    localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({ version: 5,
      resources: { alloys: 2, data: 1, relics: 0 }, facilities: { hangar: 0, scanner: 0, labor: 0, navigation: 0 },
      expeditionCount: 0, story: { discoveries: [], routeTraceRecovered: false }, ship: { variant: 'aster-vale', upgrades: [] } }));
    localStorage.setItem('voidline-farhaven-expedition-v1', JSON.stringify({ expedition }));
  }, { ...createExpedition(), hostiles: [] });
  await page.reload();
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-expedition-zoom', '1.260');
  await expect(page.locator('#startup-splash')).toBeHidden();
});

async function input(page: import('@playwright/test').Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('voidline-farhaven-expedition-v1')!).expedition.flightInput);
}

test('WASD/arrows fly, normalize diagonals and release safely', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-chrome', 'Keyboard on desktop');
  await page.keyboard.down('w');
  await expect.poll(() => input(page)).toEqual({ x: 0, y: -1 });
  await page.keyboard.down('d');
  await expect.poll(async () => { const v = await input(page); return Math.hypot(v.x, v.y); }).toBeCloseTo(1);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('voidline-farhaven-expedition-v1')!).expedition.position.x)).toBeGreaterThan(2100);
  await page.keyboard.up('w');
  await expect.poll(() => input(page)).toEqual({ x: 1, y: 0 });
  await page.keyboard.up('d');
  await expect.poll(() => input(page)).toEqual({ x: 0, y: 0 });
  await page.keyboard.down('ArrowLeft');
  await expect.poll(() => input(page)).toEqual({ x: -1, y: 0 });
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect.poll(() => input(page)).toEqual({ x: 0, y: 0 });
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.down('s');
  await page.locator('#pause-button').click();
  await expect.poll(() => input(page)).toEqual({ x: 0, y: 0 });
  await page.keyboard.up('s');
  await page.locator('#pause-button').click();
  await page.keyboard.down('a');
  await page.reload();
  await expect.poll(() => input(page)).toEqual({ x: 0, y: 0 });
  await page.keyboard.up('a');
});

test('keyboard flight does not consume text-entry keys or disable firing', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-chrome', 'Keyboard on desktop');
  await page.evaluate(() => { const box = document.createElement('input'); box.id = 'qa-input'; document.body.append(box); box.focus(); });
  await page.keyboard.type('wasd');
  await expect.poll(() => input(page)).toEqual({ x: 0, y: 0 });
  await expect(page.locator('#qa-input')).toHaveValue('wasd');
  await page.locator('#qa-input').evaluate((box) => box.remove());
  await page.keyboard.down('d');
  await page.keyboard.press('1');
  await expect(page.locator('#game-root canvas')).toHaveAttribute('data-projectile-count', '1');
  await expect.poll(() => input(page)).toEqual({ x: 1, y: 0 });
  await page.keyboard.up('d');
});

test('wheel zoom extends desktop overview without changing launch zoom or overlay behavior', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-chrome', 'Wheel on desktop');
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Missing canvas');
  await page.mouse.move(box.x + box.width * .45, box.y + box.height * .65);
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 600);
  await expect(canvas).toHaveAttribute('data-expedition-zoom', '0.550');
  await page.locator('#fire-button').hover();
  await page.mouse.wheel(0, -600);
  await expect(canvas).toHaveAttribute('data-expedition-zoom', '0.550');
  await page.mouse.move(box.x + box.width * .45, box.y + box.height * .65);
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, -600);
  await expect(canvas).toHaveAttribute('data-expedition-zoom', '1.850');
  await page.locator('#return-button').click();
  await expect(page.locator('#launch-button')).toBeVisible();
  await page.locator('#launch-button').click();
  await expect(canvas).toHaveAttribute('data-expedition-zoom', '1.260');
});

test('mobile keeps pinch zoom and its original lower limit', async ({ page }, info) => {
  test.skip(info.project.name === 'desktop-chrome', 'Touch on mobile');
  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Missing canvas');
  const touch = await page.context().newCDPSession(page);
  const x = box.x + box.width * .46; const y = box.y + box.height * .65;
  await expect.poll(() => page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, { x: x - 70, y })).toBe('CANVAS');
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: x - 70, y }] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: x - 70, y }, { id: 2, x: x + 70, y }] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x: x - 25, y }, { id: 2, x: x + 25, y }] });
  await expect(canvas).toHaveAttribute('data-expedition-zoom', '0.820');
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touch.detach();
  await expect(page.locator('#desktop-control-hint')).toBeHidden();
});
