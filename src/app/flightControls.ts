import type { Vector2 } from '../domain/exploration/types';

export const FLIGHT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);

export function keyboardFlightVector(keys: ReadonlySet<string>): Vector2 {
  const x = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
  const y = Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp'));
  const length = Math.max(1, Math.hypot(x, y));
  return { x: x / length, y: y / length };
}

/** Wheel units differ between mice (lines) and trackpads (pixels). */
export function wheelZoom(current: number, deltaY: number, deltaMode: number, height: number): number {
  const pixels = deltaY * (deltaMode === 1 ? 16 : deltaMode === 2 ? height : 1);
  return Math.max(0.55, Math.min(1.85, current * Math.exp(-Math.max(-600, Math.min(600, pixels)) * 0.0015)));
}
