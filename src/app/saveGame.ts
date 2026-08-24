import { DEFAULT_PROFILE, type FarhavenProfile } from '../domain/outpost/types';
import { isShipUpgrade, isShipVariant, type ShipState } from '../domain/ship/types';

const STORAGE_KEY = 'voidline-farhaven-save-v2';

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function shipOrUndefined(value: unknown): ShipState | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as { variant?: unknown; upgrades?: unknown };
  if (!isShipVariant(candidate.variant)) return undefined;
  const upgrades = Array.isArray(candidate.upgrades) ? candidate.upgrades.filter(isShipUpgrade) : [];
  return { variant: candidate.variant, upgrades: [...new Set(upgrades)] };
}

export function loadProfile(): FarhavenProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<FarhavenProfile> | null;
    if (!parsed || parsed.version !== 2) return DEFAULT_PROFILE;
    return {
      version: 2,
      resources: {
        alloys: numberOr(parsed.resources?.alloys, DEFAULT_PROFILE.resources.alloys),
        data: numberOr(parsed.resources?.data, DEFAULT_PROFILE.resources.data),
        relics: numberOr(parsed.resources?.relics, DEFAULT_PROFILE.resources.relics),
      },
      facilities: {
        hangar: Math.min(1, numberOr(parsed.facilities?.hangar, 0)),
        scanner: Math.min(1, numberOr(parsed.facilities?.scanner, 0)),
        labor: Math.min(1, numberOr(parsed.facilities?.labor, 0)),
        navigation: Math.min(1, numberOr(parsed.facilities?.navigation, 0)),
      },
      expeditionCount: numberOr(parsed.expeditionCount, 0),
      ship: shipOrUndefined(parsed.ship),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: FarhavenProfile): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
}
