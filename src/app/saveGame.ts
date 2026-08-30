import { DEFAULT_PROFILE, type FarhavenProfile } from '../domain/outpost/types';
import { isFieldUpgrade, isFoundationUpgrade, isShipUpgrade, isShipVariant, type ShipState } from '../domain/ship/types';
import type { ExpeditionState } from '../domain/exploration/types';
import { normalizeCombatState } from '../domain/exploration/projectiles';

const STORAGE_KEY = 'voidline-farhaven-save-v2';
const EXPEDITION_STORAGE_KEY = 'voidline-farhaven-expedition-v1';

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function shipOrUndefined(value: unknown, allowExpandedUpgrades: boolean): ShipState | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as { variant?: unknown; upgrades?: unknown };
  if (!isShipVariant(candidate.variant)) return undefined;
  // Version 2 briefly saved visual prototypes like real systems. Old saves retain
  // only the two upgrades that could genuinely be earned at that time.
  const upgrades = Array.isArray(candidate.upgrades)
    ? candidate.upgrades.filter(isShipUpgrade).filter(allowExpandedUpgrades ? isFieldUpgrade : isFoundationUpgrade)
    : [];
  return { variant: candidate.variant, upgrades: [...new Set(upgrades)] };
}

export function loadProfile(): FarhavenProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as (Omit<Partial<FarhavenProfile>, 'version'> & { version?: unknown }) | null;
    const storedVersion = parsed?.version;
    if (!parsed || (storedVersion !== 2 && storedVersion !== 3 && storedVersion !== 4 && storedVersion !== 5)) return DEFAULT_PROFILE;
    const expeditionCount = numberOr(parsed.expeditionCount, 0);
    const ship = shipOrUndefined(parsed.ship, storedVersion === 3 || storedVersion === 4 || storedVersion === 5);
    const legacyRouteTrace = expeditionCount >= 3 && Boolean(ship?.upgrades.includes('mining-lasers'));
    return {
      version: 5,
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
      expeditionCount,
      story: {
        routeTraceRecovered: storedVersion === 4 || storedVersion === 5 ? Boolean(parsed.story?.routeTraceRecovered) : legacyRouteTrace,
        discoveries: storedVersion === 5 && Array.isArray(parsed.story?.discoveries)
          ? [...new Set(parsed.story.discoveries.filter((entry): entry is string => typeof entry === 'string'))]
          : [],
      },
      ship,
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

export interface SavedExpedition {
  readonly expedition: ExpeditionState;
  readonly selectedTargetId?: string;
}

function isExpedition(value: unknown): value is ExpeditionState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ExpeditionState>;
  return candidate.status === 'active' || candidate.status === 'returning'
    ? typeof candidate.sectorId === 'string'
      && typeof candidate.sectorName === 'string'
      && typeof candidate.scenario === 'string'
      && typeof candidate.hull === 'number'
      && candidate.hull > 0
      && typeof candidate.maxHull === 'number'
      && Array.isArray(candidate.signals)
      && Array.isArray(candidate.hostiles)
      && Array.isArray(candidate.log)
    : false;
}

export function loadActiveExpedition(): SavedExpedition | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(EXPEDITION_STORAGE_KEY) ?? 'null') as Partial<SavedExpedition> | null;
    if (!parsed || !isExpedition(parsed.expedition)) return undefined;
    return {
      expedition: normalizeCombatState(parsed.expedition),
      selectedTargetId: typeof parsed.selectedTargetId === 'string' ? parsed.selectedTargetId : undefined,
    };
  } catch {
    return undefined;
  }
}

export function saveActiveExpedition(expedition: ExpeditionState, selectedTargetId?: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(EXPEDITION_STORAGE_KEY, JSON.stringify({ expedition: { ...expedition, combatEvents: [] }, selectedTargetId } satisfies SavedExpedition));
  }
}

export function clearActiveExpedition(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(EXPEDITION_STORAGE_KEY);
}
