import type { ShipState, Vector2, WeaponKind } from '../../domain/combat/types';

export interface RelativeHardpoint {
  readonly x: number;
  readonly y: number;
}

export interface ShipHardpoints {
  readonly engines: readonly RelativeHardpoint[];
  readonly lance: readonly RelativeHardpoint[];
  readonly torpedo: readonly RelativeHardpoint[];
  readonly portBroadside: readonly RelativeHardpoint[];
  readonly starboardBroadside: readonly RelativeHardpoint[];
}

export interface ShipPresentationDefinition {
  readonly texture: string;
  readonly spriteWidthInRadii: number;
  readonly spriteLengthInRadii: number;
  readonly hardpoints: ShipHardpoints;
}

export const SHIP_PRESENTATIONS: Readonly<Partial<Record<string, ShipPresentationDefinition>>> = {
  'p-cruiser': {
    texture: 'ship-player-cruiser-v1',
    spriteWidthInRadii: 1.55,
    spriteLengthInRadii: 3.4,
    hardpoints: {
      engines: [
        { x: -1.28, y: -0.38 },
        { x: -1.4, y: 0 },
        { x: -1.28, y: 0.38 },
      ],
      lance: [{ x: 1.28, y: 0 }],
      torpedo: [
        { x: 0.73, y: -0.3 },
        { x: 0.73, y: 0.3 },
      ],
      portBroadside: [
        { x: 0.26, y: -0.62 },
        { x: -0.06, y: -0.66 },
        { x: -0.38, y: -0.61 },
      ],
      starboardBroadside: [
        { x: 0.26, y: 0.62 },
        { x: -0.06, y: 0.66 },
        { x: -0.38, y: 0.61 },
      ],
    },
  },
};

function toWorldPoint(ship: ShipState, hardpoint: RelativeHardpoint): Vector2 {
  const localX = hardpoint.x * ship.radius;
  const localY = hardpoint.y * ship.radius;
  const cosine = Math.cos(ship.facing);
  const sine = Math.sin(ship.facing);
  return {
    x: ship.position.x + localX * cosine - localY * sine,
    y: ship.position.y + localX * sine + localY * cosine,
  };
}

export function weaponOrigins(ship: ShipState, target: Vector2, weapon: WeaponKind): readonly Vector2[] {
  const presentation = SHIP_PRESENTATIONS[ship.id];
  if (!presentation) return [ship.position];
  if (weapon === 'lance') return presentation.hardpoints.lance.map((point) => toWorldPoint(ship, point));
  if (weapon === 'torpedo') return presentation.hardpoints.torpedo.map((point) => toWorldPoint(ship, point));

  const targetAngle = Math.atan2(target.y - ship.position.y, target.x - ship.position.x);
  const side = Math.sin(targetAngle - ship.facing);
  const hardpoints = side >= 0 ? presentation.hardpoints.starboardBroadside : presentation.hardpoints.portBroadside;
  return hardpoints.map((point) => toWorldPoint(ship, point));
}
