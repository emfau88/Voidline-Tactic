import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:4173';
const outputDirectory = path.resolve('docs/screenshots');

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
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
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(outputDirectory, 'mobile-fleet-selection.png'),
    fullPage: true,
  });

  await page.getByRole('button', { name: /ERSTEN KONTAKT STARTEN/ }).click();
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
  await page.getByRole('button', { name: /KURS/ }).click();
  await page.mouse.move(box.x + box.width * 0.42, box.y + box.height * 0.58);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 4 });
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.42, { steps: 5 });
  await page.mouse.up();
  await page.getByRole('button', { name: /ZIEL/ }).click();
  await canvas.click({ position: { x: box.width * 0.4, y: box.height * 0.31 } });
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
