import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:4173';
const outputDirectory = path.resolve('docs/screenshots/farhaven');
const states = [
  ['core-locked', { resources: { alloys: 2, data: 1, relics: 0 }, facilities: { hangar: 0, scanner: 0, labor: 0, navigation: 0 } }],
  ['hangar-ready', { resources: { alloys: 4, data: 1, relics: 0 }, facilities: { hangar: 0, scanner: 0, labor: 0, navigation: 0 } }],
  ['hangar-built', { resources: { alloys: 0, data: 1, relics: 0 }, facilities: { hangar: 1, scanner: 0, labor: 0, navigation: 0 } }],
  ['first-ring', { resources: { alloys: 24, data: 12, relics: 8 }, facilities: { hangar: 1, scanner: 1, labor: 1, navigation: 1 } }],
];

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
  for (const [name, state] of states) {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.evaluate((nextState) => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
      version: 2,
      resources: nextState.resources,
      facilities: nextState.facilities,
      expeditionCount: 4,
      ship: { variant: 'aster-vale', upgrades: ['cargo-spine', 'mining-lasers'] },
    })), state);
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#game-root canvas').waitFor({ state: 'visible' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outputDirectory, `mobile-${name}.png`) });
  }

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 2,
    resources: { alloys: 4, data: 1, relics: 0 },
    facilities: { hangar: 0, scanner: 0, labor: 0, navigation: 0 },
    expeditionCount: 1,
    ship: { variant: 'aster-vale', upgrades: ['cargo-spine', 'mining-lasers'] },
  })));
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-facility="hangar"]').evaluate((button) => button.click());
  await page.locator('#facility-upgrade-button').click();
  await page.waitForTimeout(320);
  await page.screenshot({ path: path.join(outputDirectory, 'mobile-hangar-docking.png') });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await desktopPage.evaluate(() => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
    version: 2,
    resources: { alloys: 24, data: 12, relics: 8 },
    facilities: { hangar: 1, scanner: 1, labor: 1, navigation: 1 },
    expeditionCount: 4,
    ship: { variant: 'aster-vale', upgrades: ['cargo-spine', 'mining-lasers'] },
  })));
  await desktopPage.reload({ waitUntil: 'networkidle' });
  await desktopPage.locator('#game-root canvas').waitFor({ state: 'visible' });
  await desktopPage.screenshot({ path: path.join(outputDirectory, 'desktop-first-ring.png') });
  await desktopContext.close();
} finally {
  await browser.close();
}
