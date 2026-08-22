import { clamp, distance } from '../combat/math';
import type { Vector2 } from '../combat/types';
import type { LaneId } from './types';

export interface LaneDefinition {
  readonly id: LaneId;
  readonly name: string;
  readonly shortName: string;
  readonly color: number;
  readonly width: number;
  readonly points: readonly Vector2[];
}

export interface LaneJunction {
  readonly id: 'junction-west' | 'junction-east';
  readonly progress: number;
  readonly lanes: readonly LaneId[];
}

export const LANE_ORDER: readonly LaneId[] = ['upper', 'center', 'lower'];

export const LANES: Readonly<Record<LaneId, LaneDefinition>> = {
  upper: {
    id: 'upper', name: 'Upper Vector', shortName: 'UPPER', color: 0x58bfe8, width: 250,
    points: [
      { x: 190, y: 390 }, { x: 560, y: 285 }, { x: 1_030, y: 330 },
      { x: 1_470, y: 255 }, { x: 1_880, y: 310 }, { x: 2_210, y: 390 },
    ],
  },
  center: {
    id: 'center', name: 'Center Voidline', shortName: 'CENTER', color: 0xd3b66d, width: 285,
    points: [
      { x: 190, y: 700 }, { x: 590, y: 660 }, { x: 1_020, y: 710 },
      { x: 1_430, y: 675 }, { x: 1_840, y: 730 }, { x: 2_210, y: 700 },
    ],
  },
  lower: {
    id: 'lower', name: 'Lower Drift', shortName: 'LOWER', color: 0x7ca7d7, width: 270,
    points: [
      { x: 190, y: 1_010 }, { x: 540, y: 1_115 }, { x: 960, y: 1_055 },
      { x: 1_390, y: 1_135 }, { x: 1_850, y: 1_085 }, { x: 2_210, y: 1_010 },
    ],
  },
};

export const LANE_JUNCTIONS: readonly LaneJunction[] = [
  { id: 'junction-west', progress: 0.31, lanes: LANE_ORDER },
  { id: 'junction-east', progress: 0.72, lanes: LANE_ORDER },
];

export function lanePointAt(laneId: LaneId, progress: number): Vector2 {
  const points = LANES[laneId].points;
  const scaled = clamp(progress, 0, 1) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  const local = scaled - index;
  return {
    x: points[index].x + (points[index + 1].x - points[index].x) * local,
    y: points[index].y + (points[index + 1].y - points[index].y) * local,
  };
}

export function laneProgressAt(position: Vector2): number {
  return clamp((position.x - 190) / (2_210 - 190), 0, 1);
}

export function laneDistance(position: Vector2, laneId: LaneId): number {
  const points = LANES[laneId].points;
  let minimum = Number.POSITIVE_INFINITY;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const segmentX = end.x - start.x;
    const segmentY = end.y - start.y;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    const projection = lengthSquared > 0
      ? clamp(((position.x - start.x) * segmentX + (position.y - start.y) * segmentY) / lengthSquared, 0, 1)
      : 0;
    minimum = Math.min(minimum, distance(position, {
      x: start.x + segmentX * projection,
      y: start.y + segmentY * projection,
    }));
  }
  return minimum;
}

export function nearestLane(position: Vector2): LaneId {
  return [...LANE_ORDER].sort((left, right) => laneDistance(position, left) - laneDistance(position, right))[0];
}

export function laneOffsetForShip(shipId: string, magnitude = 52): number {
  const hash = [...shipId].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) | 0, 17);
  return ((Math.abs(hash) % 201) / 100 - 1) * magnitude;
}

export function lanePointWithOffset(laneId: LaneId, progress: number, offset: number): Vector2 {
  const before = lanePointAt(laneId, Math.max(0, progress - 0.01));
  const after = lanePointAt(laneId, Math.min(1, progress + 0.01));
  const angle = Math.atan2(after.y - before.y, after.x - before.x) + Math.PI / 2;
  const center = lanePointAt(laneId, progress);
  return { x: center.x + Math.cos(angle) * offset, y: center.y + Math.sin(angle) * offset };
}

export function laneChangeRoute(position: Vector2, fromLane: LaneId, toLane: LaneId, direction: 1 | -1): readonly Vector2[] {
  if (fromLane === toLane || laneDistance(position, toLane) <= LANES[toLane].width * 0.32) return [];
  const progress = laneProgressAt(position);
  const junction = [...LANE_JUNCTIONS].sort((left, right) => {
    const leftPenalty = Math.abs(left.progress - progress) + (direction > 0 && left.progress < progress - 0.04 ? 0.35 : 0);
    const rightPenalty = Math.abs(right.progress - progress) + (direction < 0 && right.progress > progress + 0.04 ? 0.35 : 0);
    return leftPenalty - rightPenalty;
  })[0];
  const exitProgress = clamp(junction.progress + direction * 0.055, 0.04, 0.96);
  return [
    lanePointAt(fromLane, junction.progress),
    lanePointAt(toLane, junction.progress),
    lanePointAt(toLane, exitProgress),
  ];
}

export function laneLabel(laneId: LaneId): string {
  return LANES[laneId].shortName;
}
