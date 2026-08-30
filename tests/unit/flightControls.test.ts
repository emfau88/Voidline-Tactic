import { describe, expect, it } from 'vitest';
import { keyboardFlightVector, wheelZoom } from '../../src/app/flightControls';

describe('desktop flight controls', () => {
  it('maps WASD and arrows to world directions', () => {
    expect(keyboardFlightVector(new Set(['KeyW']))).toEqual({ x: 0, y: -1 });
    expect(keyboardFlightVector(new Set(['ArrowRight']))).toEqual({ x: 1, y: 0 });
    const diagonal = keyboardFlightVector(new Set(['KeyA', 'KeyS']));
    expect(diagonal.x).toBeCloseTo(-Math.SQRT1_2);
    expect(diagonal.y).toBeCloseTo(Math.SQRT1_2);
  });
  it('cancels opposite keys and does not double-count aliases', () => {
    expect(keyboardFlightVector(new Set(['KeyA', 'KeyD', 'ArrowUp', 'KeyS']))).toEqual({ x: 0, y: 0 });
    expect(keyboardFlightVector(new Set(['KeyW', 'ArrowUp']))).toEqual({ x: 0, y: -1 });
    expect(keyboardFlightVector(new Set())).toEqual({ x: 0, y: 0 });
  });
  it('normalizes diagonal speed', () => {
    const vector = keyboardFlightVector(new Set(['KeyW', 'KeyD']));
    expect(Math.hypot(vector.x, vector.y)).toBeCloseTo(1);
  });
  it('normalizes wheel units and bounds the extended desktop zoom', () => {
    expect(wheelZoom(1.26, 120, 0, 390)).toBeLessThan(1.26);
    expect(wheelZoom(1.26, -120, 0, 390)).toBeGreaterThan(1.26);
    expect(wheelZoom(1.26, 3, 1, 390)).toBe(wheelZoom(1.26, 48, 0, 390));
    expect(wheelZoom(0.6, 9999, 0, 390)).toBe(0.55);
    expect(wheelZoom(1.7, -9999, 0, 390)).toBe(1.85);
  });
});
