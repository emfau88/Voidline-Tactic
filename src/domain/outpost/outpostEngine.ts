import { FACILITIES, type FacilityId, type FarhavenProfile } from './types';
import type { Cargo } from '../exploration/types';

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
