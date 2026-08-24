import { describe, expect, it } from 'vitest';
import { canUpgrade, secureCargo, upgradeFacility } from '../../src/domain/outpost/outpostEngine';
import { DEFAULT_PROFILE } from '../../src/domain/outpost/types';

describe('outpost progression', () => {
  it('secures expedition cargo before it can fund an upgrade', () => {
    expect(canUpgrade(DEFAULT_PROFILE, 'hangar')).toBe(false);
    const funded = secureCargo(DEFAULT_PROFILE, { alloys: 2, data: 0, relics: 0 });
    expect(canUpgrade(funded, 'hangar')).toBe(true);
    const upgraded = upgradeFacility(funded, 'hangar');
    expect(upgraded.facilities.hangar).toBe(1);
    expect(upgraded.resources.alloys).toBe(0);
  });

  it('does not charge an already upgraded facility twice', () => {
    const funded = secureCargo(DEFAULT_PROFILE, { alloys: 2, data: 0, relics: 0 });
    const upgraded = upgradeFacility(funded, 'hangar');
    expect(upgradeFacility(upgraded, 'hangar')).toEqual(upgraded);
  });
});
