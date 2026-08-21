import type { Vector2 } from './types';

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function distance(a: Vector2, b: Vector2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function angleBetween(a: Vector2, b: Vector2): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function normalizeAngle(angle: number): number {
  let normalized = angle % (Math.PI * 2);
  if (normalized <= -Math.PI) normalized += Math.PI * 2;
  if (normalized > Math.PI) normalized -= Math.PI * 2;
  return normalized;
}

export function angleDifference(a: number, b: number): number {
  return Math.abs(normalizeAngle(a - b));
}
