import { BATTLEFIELD_HEIGHT, BATTLEFIELD_WIDTH } from './constants';
import { SHIPS } from './content';
import type { MissionId, ObjectiveKind, ShipDefinition, UpgradeId } from './types';

export interface UpgradeDefinition {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
}

export interface MissionDefinition {
  readonly id: MissionId;
  readonly number: number;
  readonly name: string;
  readonly subtitle: string;
  readonly briefing: string;
  readonly objectiveKind: ObjectiveKind;
  readonly objectiveLabel: string;
  readonly salvage: number;
  readonly upgradeChoices: readonly UpgradeId[];
}

export const MISSION_ORDER: readonly MissionId[] = ['mission-1', 'mission-2', 'mission-3'];

export const UPGRADES: Readonly<Record<UpgradeId, UpgradeDefinition>> = {
  'reinforced-hull': {
    id: 'reinforced-hull',
    name: 'Verstärkte Zitadelle',
    description: '+18 Hülle und +10 Schild am Flaggschiff',
  },
  'vector-thrusters': {
    id: 'vector-thrusters',
    name: 'Vector-Thruster',
    description: '+12 Tempo und 15 % bessere Drehrate',
  },
  'escort-plating': {
    id: 'escort-plating',
    name: 'Eskort-Panzerung',
    description: '+14 Hülle und +8 Schild für Begleitschiffe',
  },
  'flux-capacitor': {
    id: 'flux-capacitor',
    name: 'Flux-Kondensator',
    description: '+20 Energie und schnellere Regeneration',
  },
};

export const MISSIONS: Readonly<Record<MissionId, MissionDefinition>> = {
  'mission-1': {
    id: 'mission-1',
    number: 1,
    name: 'Erster Kontakt',
    subtitle: 'Abfanggefecht',
    briefing: 'Zwei Vorpostenschiffe blockieren die Voidline. Breche den Verband und sichere erste Bergungsgüter.',
    objectiveKind: 'eliminate',
    objectiveLabel: 'Feindverband ausschalten',
    salvage: 120,
    upgradeChoices: ['reinforced-hull', 'vector-thrusters'],
  },
  'mission-2': {
    id: 'mission-2',
    number: 2,
    name: 'Relaisknoten',
    subtitle: 'Kontrollpunkt',
    briefing: 'Halte den zentralen Relaisring, während eine verstärkte Feindgruppe anrückt.',
    objectiveKind: 'relay',
    objectiveLabel: 'Relais sichern · Feinde ausschalten',
    salvage: 180,
    upgradeChoices: ['escort-plating', 'flux-capacitor'],
  },
  'mission-3': {
    id: 'mission-3',
    number: 3,
    name: 'Gebrochene Werft',
    subtitle: 'Flottenkeim',
    briefing: 'Erobere die autonome Werft. Kontrollierte Werften bauen begrenzte schwache Verstärkungen für ihren Besitzer.',
    objectiveKind: 'shipyard',
    objectiveLabel: 'Werft erobern · Eliteverband brechen',
    salvage: 260,
    upgradeChoices: [],
  },
};

function cloneShip(ship: ShipDefinition, overrides: Partial<ShipDefinition> = {}): ShipDefinition {
  return { ...ship, ...overrides, startPosition: { ...(overrides.startPosition ?? ship.startPosition) } };
}

function raider(id: string, name: string, x: number, y: number): ShipDefinition {
  const base = SHIPS.find((ship) => ship.id === 'e-destroyer')!;
  return cloneShip(base, {
    id,
    name,
    presentationId: 'e-destroyer',
    maxHull: 46,
    maxShield: 22,
    radius: 30,
    maxSpeed: 88,
    weapons: ['torpedo'],
    startPosition: { x, y },
  });
}

export function createMissionFleet(missionId: MissionId): readonly ShipDefinition[] {
  const fleet = SHIPS.map((ship) => cloneShip(ship));
  if (missionId === 'mission-1') return fleet;
  fleet.push(raider('e-raider-1', 'Sable Knife', 2_060, 1_090));
  if (missionId === 'mission-3') {
    fleet.push(raider('e-raider-2', 'Cinder Fang', 2_110, 310));
    const eliteIndex = fleet.findIndex((ship) => ship.id === 'e-cruiser');
    fleet[eliteIndex] = cloneShip(fleet[eliteIndex], {
      name: 'Ashen Crown · Elite',
      maxHull: 132,
      maxShield: 78,
      maxEnergy: 90,
    });
  }
  return fleet;
}

export function objectivePosition(missionId: MissionId): { x: number; y: number } | undefined {
  if (missionId === 'mission-1') return undefined;
  return { x: BATTLEFIELD_WIDTH / 2, y: BATTLEFIELD_HEIGHT / 2 };
}
