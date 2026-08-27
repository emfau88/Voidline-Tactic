import { describe, expect, it } from 'vitest';
import { canPurchaseShipUpgrade, canUpgrade, purchaseShipUpgrade, secureCargo, upgradeFacility } from '../../src/domain/outpost/outpostEngine';
import { DEFAULT_PROFILE } from '../../src/domain/outpost/types';
import { FIRST_FIELD_UPGRADE_ID, newShip, SECOND_FIELD_UPGRADE_ID } from '../../src/domain/ship/types';

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

  it('closes the first loop: salvage funds the hangar and the first real ship part', () => {
    const withShip = { ...DEFAULT_PROFILE, ship: newShip('aster-vale') };
    const secured = secureCargo(withShip, { alloys: 3, data: 0, relics: 0 });
    const hangar = upgradeFacility(secured, 'hangar');
    expect(hangar.resources.alloys).toBe(1);
    expect(canPurchaseShipUpgrade(hangar, FIRST_FIELD_UPGRADE_ID)).toBe(true);
    const upgraded = purchaseShipUpgrade(hangar, FIRST_FIELD_UPGRADE_ID);
    expect(upgraded.resources.alloys).toBe(0);
    expect(upgraded.ship?.upgrades).toContain(FIRST_FIELD_UPGRADE_ID);
  });

  it('turns second-shift relics and data into the real mining laser', () => {
    const prepared = {
      ...DEFAULT_PROFILE,
      resources: { alloys: 0, data: 2, relics: 1 },
      facilities: { ...DEFAULT_PROFILE.facilities, hangar: 1 },
      ship: { ...newShip('bramble'), upgrades: [FIRST_FIELD_UPGRADE_ID] },
    };
    expect(canPurchaseShipUpgrade(prepared, SECOND_FIELD_UPGRADE_ID)).toBe(true);
    const upgraded = purchaseShipUpgrade(prepared, SECOND_FIELD_UPGRADE_ID);
    expect(upgraded.resources).toEqual({ alloys: 0, data: 0, relics: 0 });
    expect(upgraded.ship?.upgrades).toContain(SECOND_FIELD_UPGRADE_ID);
  });

  it('installs rail and torpedo systems as genuine later hangar upgrades', () => {
    const prepared = {
      ...DEFAULT_PROFILE,
      resources: { alloys: 7, data: 1, relics: 1 },
      facilities: { ...DEFAULT_PROFILE.facilities, hangar: 1 },
      ship: { ...newShip('aster-vale'), upgrades: [FIRST_FIELD_UPGRADE_ID, SECOND_FIELD_UPGRADE_ID] },
    };
    expect(canPurchaseShipUpgrade(prepared, 'rail-lance')).toBe(true);
    const lanced = purchaseShipUpgrade(prepared, 'rail-lance');
    expect(lanced.resources).toEqual({ alloys: 3, data: 0, relics: 1 });
    expect(canPurchaseShipUpgrade(lanced, 'torpedo-rack')).toBe(true);
    const armed = purchaseShipUpgrade(lanced, 'torpedo-rack');
    expect(armed.resources).toEqual({ alloys: 0, data: 0, relics: 0 });
    expect(armed.ship?.upgrades).toEqual(expect.arrayContaining(['rail-lance', 'torpedo-rack']));
  });

  it('treats the scanner array and salvage claws as regular paid ship systems', () => {
    const prepared = {
      ...DEFAULT_PROFILE,
      resources: { alloys: 4, data: 2, relics: 0 },
      facilities: { ...DEFAULT_PROFILE.facilities, hangar: 1 },
      ship: newShip('bramble'),
    };
    expect(canPurchaseShipUpgrade(prepared, 'broadband-array')).toBe(true);
    const scanned = purchaseShipUpgrade(prepared, 'broadband-array');
    expect(canPurchaseShipUpgrade(scanned, 'salvage-claws')).toBe(true);
    const clawed = purchaseShipUpgrade(scanned, 'salvage-claws');
    expect(clawed.resources).toEqual({ alloys: 0, data: 0, relics: 0 });
    expect(clawed.ship?.upgrades).toEqual(expect.arrayContaining(['broadband-array', 'salvage-claws']));
  });
});
