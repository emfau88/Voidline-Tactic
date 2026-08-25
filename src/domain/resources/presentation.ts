import type { Cargo, ResourceKind } from '../exploration/types';

export type ResourceAmounts = Readonly<Partial<Record<ResourceKind, number>>>;

export interface ResourcePresentation {
  readonly name: string;
  readonly singular: string;
  readonly iconPath: string;
  readonly textureKey: string;
  readonly color: string;
  readonly source: string;
  readonly use: string;
}

export const RESOURCE_ORDER: readonly ResourceKind[] = ['alloys', 'data', 'relics'];

export const RESOURCE_PRESENTATION: Readonly<Record<ResourceKind, ResourcePresentation>> = {
  alloys: {
    name: 'Legierungen', singular: 'Legierung', iconPath: 'assets/ui/resource-alloys-v1.png',
    textureKey: 'resource-alloys-v1', color: '#e3a861', source: 'Wracks und Erzadern',
    use: 'Hangar, Rumpf und Maschinen',
  },
  data: {
    name: 'Daten', singular: 'Datensatz', iconPath: 'assets/ui/resource-data-v1.png',
    textureKey: 'resource-data-v1', color: '#79e4f2', source: 'Anomalien und Datenspeicher',
    use: 'Scanner, Systeme und Routen',
  },
  relics: {
    name: 'Relikte', singular: 'Relikt', iconPath: 'assets/ui/resource-relics-v1.png',
    textureKey: 'resource-relics-v1', color: '#d1a0eb', source: 'Notsignale und seltene Bergungen',
    use: 'Labor und fremde Systeme',
  },
};

export function resourceName(kind: ResourceKind, amount: number): string {
  const resource = RESOURCE_PRESENTATION[kind];
  return amount === 1 ? resource.singular : resource.name;
}

export function formatResourceAmount(kind: ResourceKind, amount: number): string {
  return `${amount} ${resourceName(kind, amount)}`;
}

export function resourceEntries(amounts: ResourceAmounts | Cargo): readonly [ResourceKind, number][] {
  return RESOURCE_ORDER
    .map((kind): [ResourceKind, number] => [kind, amounts[kind] ?? 0])
    .filter((entry) => entry[1] > 0);
}

export function formatResourceCost(cost: ResourceAmounts): string {
  return resourceEntries(cost).map(([kind, amount]) => formatResourceAmount(kind, amount)).join(' · ');
}

export function resourceSourceHint(cost: ResourceAmounts): string {
  return resourceEntries(cost)
    .map(([kind]) => `${RESOURCE_PRESENTATION[kind].name}: ${RESOURCE_PRESENTATION[kind].source}`)
    .join(' · ');
}
