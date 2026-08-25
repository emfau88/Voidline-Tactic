import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:4173';
const outputDirectory = path.resolve('docs/screenshots/farhaven');
const states = [
  ['core', { hangar: 0, scanner: 0, labor: 0, navigation: 0 }],
  ['hangar', { hangar: 1, scanner: 0, labor: 0, navigation: 0 }],
  ['first-ring', { hangar: 1, scanner: 1, labor: 1, navigation: 1 }],
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
  for (const [name, facilities] of states) {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.evaluate((nextFacilities) => localStorage.setItem('voidline-farhaven-save-v2', JSON.stringify({
      version: 2,
      resources: { alloys: 24, data: 12, relics: 8 },
      facilities: nextFacilities,
      expeditionCount: 4,
      ship: { variant: 'aster-vale', upgrades: ['cargo-spine', 'mining-lasers'] },
    })), facilities);
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#game-root canvas').waitFor({ state: 'visible' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outputDirectory, `mobile-${name}.png`) });
  }
} finally {
  await browser.close();
}
