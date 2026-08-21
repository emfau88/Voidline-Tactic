export type StarterShipId = 'p-cruiser' | 'p-frigate';

let starterShipId: StarterShipId = 'p-cruiser';

export function setStarterShipId(value: StarterShipId): void {
  starterShipId = value;
}

export function getStarterShipId(): StarterShipId {
  return starterShipId;
}
