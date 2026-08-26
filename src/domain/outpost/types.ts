import type { Cargo, ResourceKind } from '../exploration/types';
import type { ShipState } from '../ship/types';

export type FacilityId = 'hangar' | 'scanner' | 'labor' | 'navigation';

export interface FarhavenProfile {
  readonly version: 5;
  readonly resources: Cargo;
  readonly facilities: Readonly<Record<FacilityId, number>>;
  readonly expeditionCount: number;
  readonly story: { readonly routeTraceRecovered: boolean; readonly discoveries: readonly string[] };
  readonly ship?: ShipState;
}

export interface FacilityDefinition {
  readonly id: FacilityId;
  readonly name: string;
  readonly subtitle: string;
  readonly effect: string;
  readonly cost: Readonly<Partial<Record<ResourceKind, number>>>;
}

export const FACILITIES: Record<FacilityId, FacilityDefinition> = {
  hangar: { id: 'hangar', name: 'Hangar', subtitle: 'Schutz und Bergung', effect: '+2 Frachtraum in jeder Expedition', cost: { alloys: 4 } },
  scanner: { id: 'scanner', name: 'Scannerkapelle', subtitle: 'Fernsehen', effect: '+90 Scanreichweite', cost: { data: 3 } },
  labor: { id: 'labor', name: 'Reliktlabor', subtitle: 'Deutung', effect: '-3 Hüllenschaden durch Anomalien', cost: { relics: 2 } },
  navigation: { id: 'navigation', name: 'Sternenwerk', subtitle: 'Weiter hinaus', effect: 'Richtet das Xenogate nach Veloria aus', cost: { data: 2, alloys: 2 } },
};

export const DEFAULT_PROFILE: FarhavenProfile = {
  version: 5,
  resources: { alloys: 2, data: 1, relics: 0 },
  facilities: { hangar: 0, scanner: 0, labor: 0, navigation: 0 },
  expeditionCount: 0,
  story: { routeTraceRecovered: false, discoveries: [] },
  ship: undefined,
};
