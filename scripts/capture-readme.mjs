import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:4173';
const outputDirectory = path.resolve('docs/screenshots');

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 844, height: 390 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  colorScheme: 'dark',
  reducedMotion: 'reduce',
});
const page = await context.newPage();

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('#main-menu').waitFor({ state: 'visible' });
  await page.locator('button[data-starter-module="aegis-emitter"]').click();
  await page.waitForTimeout(180);
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outputDirectory, 'mobile-fleet-selection.png'),
    fullPage: true,
  });

  await page.locator('#start-button').click();
  await page.waitForFunction(
    () => document.querySelector('#game-shell')?.getAttribute('data-game-ready') === 'true',
  );
  await page.waitForTimeout(1_000);

  await page.screenshot({
    path: path.join(outputDirectory, 'mobile-combat-overview.png'),
    fullPage: true,
  });

  const canvas = page.locator('#game-root canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no layout box.');

  await page.getByRole('button', { name: 'Taktische Pause' }).click();
  const stick = page.getByRole('button', { name: /Steuerjoystick/ });
  const stickBox = await stick.boundingBox();
  if (!stickBox) throw new Error('Flight stick has no layout box.');
  await page.mouse.move(stickBox.x + stickBox.width * 0.68, stickBox.y + stickBox.height * 0.18);
  await page.mouse.down();
  await page.mouse.up();
  await page.getByRole('button', { name: /ZIEL/ }).click();
  const screens = JSON.parse(await page.locator('#game-shell').getAttribute('data-ship-screens') ?? '{}');
  const target = screens['e-destroyer'];
  if (!target) throw new Error('Calibration enemy has no exposed screen position.');
  await canvas.click({ position: { x: box.width * target.x, y: box.height * target.y } });
  await page.locator('#target-card').waitFor({ state: 'visible', timeout: 5_000 });
  await page.getByRole('button', { name: /LANZE/ }).click();
  await page.waitForTimeout(180);
  await page.screenshot({
    path: path.join(outputDirectory, 'mobile-target-preview.png'),
    fullPage: true,
  });
} finally {
  await browser.close();
}
