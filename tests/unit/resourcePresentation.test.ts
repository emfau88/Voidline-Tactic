import { describe, expect, it } from 'vitest';
import { createExpedition, rewardForSignal } from '../../src/domain/exploration/expeditionEngine';
import { formatResourceCost, RESOURCE_PRESENTATION, resourceEntries, resourceSourceHint } from '../../src/domain/resources/presentation';

describe('shared resource presentation', () => {
  it('uses complete German names and generated PNG icons for every resource', () => {
    expect(RESOURCE_PRESENTATION.alloys.name).toBe('Legierungen');
    expect(RESOURCE_PRESENTATION.data.name).toBe('Daten');
    expect(RESOURCE_PRESENTATION.relics.name).toBe('Relikte');
    expect(Object.values(RESOURCE_PRESENTATION).every((resource) => resource.iconPath.endsWith('.png'))).toBe(true);
  });

  it('formats costs in a stable order and explains their sources', () => {
    const cost = { relics: 1, data: 2 };
    expect(formatResourceCost(cost)).toBe('2 Daten · 1 Relikt');
    expect(resourceEntries(cost)).toEqual([['data', 2], ['relics', 1]]);
    expect(resourceSourceHint(cost)).toContain('Anomalien und Datenspeicher');
    expect(resourceSourceHint(cost)).toContain('Notsignale und seltene Bergungen');
  });

  it('exposes the same reward metadata used by expedition interactions', () => {
    const expedition = createExpedition();
    expect(rewardForSignal(expedition.signals.find((signal) => signal.id === 'echo-wreck')!)).toMatchObject({ kind: 'alloys', amount: 3 });
    expect(rewardForSignal(expedition.signals.find((signal) => signal.id === 'echo-anomaly')!)).toMatchObject({ kind: 'data', amount: 2 });
    expect(rewardForSignal(expedition.signals.find((signal) => signal.id === 'echo-distress')!)).toMatchObject({ kind: 'relics', amount: 1 });
  });
});
