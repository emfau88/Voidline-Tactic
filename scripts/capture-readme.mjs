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

  await page.getByRole('button', { name: 'Taktische Pause' }).click();
  const commandPanel = page.locator('#fleet-command-panel');
  await commandPanel.getByRole('button', { name: 'OBERE ROUTE', exact: true }).click();
  await commandPanel.getByRole('button', { name: /ABSTAND/ }).click();
  const deploymentPanel = page.locator('#deployment-panel');
  await deploymentPanel.getByRole('button', { name: 'OBEN', exact: true }).click();
  await deploymentPanel.getByRole('button', { name: /FREGATTE/ }).click();
  await page.locator('#close-command-guide').click();
  await page.waitForTimeout(180);
  await page.screenshot({
    path: path.join(outputDirectory, 'mobile-target-preview.png'),
    fullPage: true,
  });
} finally {
  await browser.close();
}
