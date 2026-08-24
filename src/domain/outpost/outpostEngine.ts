import { FACILITIES, type FacilityId, type FarhavenProfile } from './types';
import type { Cargo } from '../exploration/types';
import { FIELD_UPGRADE_COSTS, type ShipUpgradeId } from '../ship/types';

function hasCost(resources: Cargo, cost: Readonly<Partial<Cargo>>): boolean {
  return Object.entries(cost).every(([kind, amount]) => resources[kind as keyof Cargo] >= (amount ?? 0));
}

export function canUpgrade(profile: FarhavenProfile, facilityId: FacilityId): boolean {
  return profile.facilities[facilityId] < 1 && hasCost(profile.resources, FACILITIES[facilityId].cost);
}

export function upgradeFacility(profile: FarhavenProfile, facilityId: FacilityId): FarhavenProfile {
  const facility = FACILITIES[facilityId];
  if (!canUpgrade(profile, facilityId)) return profile;
  const resources = { ...profile.resources };
  for (const [kind, amount] of Object.entries(facility.cost)) resources[kind as keyof Cargo] -= amount ?? 0;
  return { ...profile, resources, facilities: { ...profile.facilities, [facilityId]: profile.facilities[facilityId] + 1 } };
}

export function secureCargo(profile: FarhavenProfile, cargo: Cargo): FarhavenProfile {
  return {
    ...profile,
    resources: {
      alloys: profile.resources.alloys + cargo.alloys,
      data: profile.resources.data + cargo.data,
      relics: profile.resources.relics + cargo.relics,
    },
    expeditionCount: profile.expeditionCount + 1,
  };
}

export function canPurchaseShipUpgrade(profile: FarhavenProfile, upgradeId: ShipUpgradeId): boolean {
  const cost = FIELD_UPGRADE_COSTS[upgradeId];
  return Boolean(
    cost
    && profile.ship
    && !profile.ship.upgrades.includes(upgradeId)
    && profile.facilities.hangar > 0
    && hasCost(profile.resources, cost),
  );
}

export function purchaseShipUpgrade(profile: FarhavenProfile, upgradeId: ShipUpgradeId): FarhavenProfile {
  if (!canPurchaseShipUpgrade(profile, upgradeId) || !profile.ship) return profile;
  const cost = FIELD_UPGRADE_COSTS[upgradeId]!;
  const resources = { ...profile.resources };
  for (const [kind, amount] of Object.entries(cost)) resources[kind as keyof Cargo] -= amount ?? 0;
  return {
    ...profile,
    resources,
    ship: { ...profile.ship, upgrades: [...profile.ship.upgrades, upgradeId] },
  };
}
