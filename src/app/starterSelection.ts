import type { StarterModuleId } from '../domain/combat/types';

export type StarterShipId = 'p-cruiser' | 'p-frigate';

let starterShipId: StarterShipId = 'p-cruiser';
let starterModuleId: StarterModuleId | undefined;

export function setStarterShipId(value: StarterShipId): void {
  starterShipId = value;
}

export function getStarterShipId(): StarterShipId {
  return starterShipId;
}

export function setStarterModuleId(value: StarterModuleId): void {
  starterModuleId = value;
}

export function getStarterModuleId(): StarterModuleId | undefined {
  return starterModuleId;
}
