export type ShipVariantId = 'aster-vale' | 'bramble';

export type ShipUpgradeId =
  | 'broadband-array'
  | 'cargo-spine'
  | 'vector-tail'
  | 'aegis-crown'
  | 'rail-lance'
  | 'torpedo-rack'
  | 'side-turrets'
  | 'salvage-claws'
  | 'mining-lasers'
  | 'relic-shrine'
  | 'core-reactor';

export interface ShipState {
  readonly variant: ShipVariantId;
  readonly upgrades: readonly ShipUpgradeId[];
}

export interface ShipVariantDefinition {
  readonly id: ShipVariantId;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly assetKey: string;
  readonly accent: string;
}

export interface ShipUpgradeDefinition {
  readonly id: ShipUpgradeId;
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly slot: 'nose' | 'dorsal' | 'flank' | 'core' | 'stern';
  readonly accent: string;
}

export const SHIP_VARIANTS: Record<ShipVariantId, ShipVariantDefinition> = {
  'aster-vale': {
    id: 'aster-vale', name: 'Aster Vale', subtitle: 'Erkundungskutter',
    description: 'Ein schlanker Kutter mit freien Sensorrails. Gebaut, um zuerst zu sehen und erst später zu urteilen.',
    assetKey: 'ship-player-aster-vale-v1', accent: '#8ee8fa',
  },
  bramble: {
    id: 'bramble', name: 'Bramble', subtitle: 'Bergungsschlepper',
    description: 'Ein breiter Arbeitsrumpf mit viel Platz für Fracht, Greifer und robuste Improvisationen.',
    assetKey: 'ship-player-bramble-v1', accent: '#d9b76e',
  },
};

export const SHIP_UPGRADES: readonly ShipUpgradeDefinition[] = [
  { id: 'broadband-array', name: 'Breitbandarray', shortName: 'ARRAY', description: 'Cyanfarbene Sensorzinken am Rücken.', slot: 'dorsal', accent: '#7ee8f3' },
  { id: 'cargo-spine', name: 'Frachtrücken', shortName: 'FRACHT', description: 'Ein breiter, warmer Container am Rumpf.', slot: 'dorsal', accent: '#d6a45e' },
  { id: 'vector-tail', name: 'Vector-Heck', shortName: 'VECTOR', description: 'Zusätzliche violette Schubdüsen.', slot: 'stern', accent: '#ba86ef' },
  { id: 'aegis-crown', name: 'Aegis-Kranz', shortName: 'AEGIS', description: 'Ein sanft leuchtender Schutzkranz.', slot: 'core', accent: '#77dbe9' },
  { id: 'rail-lance', name: 'Rail-Lanze', shortName: 'LANZE', description: 'Eine lange präzise Schienenwaffe.', slot: 'nose', accent: '#f1d08a' },
  { id: 'torpedo-rack', name: 'Torpedorack', shortName: 'TORPEDO', description: 'Zwei versiegelte Schachtröhren für gezielte Ordnanz.', slot: 'flank', accent: '#72dce9' },
  { id: 'side-turrets', name: 'Seitengeschütze', shortName: 'TÜRME', description: 'Zwei kompakte Flankentürme.', slot: 'flank', accent: '#ea966f' },
  { id: 'salvage-claws', name: 'Bergungsgreifer', shortName: 'GREIFER', description: 'Goldene Gelenkarme für Wracks.', slot: 'flank', accent: '#e1b267' },
  { id: 'mining-lasers', name: 'Minenlaser', shortName: 'LASER', description: 'Amberfarbene Abbauausleger.', slot: 'nose', accent: '#f0bf6d' },
  { id: 'relic-shrine', name: 'Reliktschrein', shortName: 'RELIKT', description: 'Ein kleines gotisches Reliquiar.', slot: 'dorsal', accent: '#d5b7f6' },
  { id: 'core-reactor', name: 'Kernreaktor', shortName: 'KERN', description: 'Ein violetter Kern für Sonderlasten.', slot: 'core', accent: '#c37cf0' },
];

export function isShipVariant(value: unknown): value is ShipVariantId {
  return value === 'aster-vale' || value === 'bramble';
}

export function isShipUpgrade(value: unknown): value is ShipUpgradeId {
  return SHIP_UPGRADES.some((upgrade) => upgrade.id === value);
}

export function newShip(variant: ShipVariantId): ShipState {
  return { variant, upgrades: [] };
}
