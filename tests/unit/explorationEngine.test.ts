import { describe, expect, it } from 'vitest';
import { createExpedition, firePrimary, fireWeapon, investigate, mineVein, returnToFarhaven, scan, setCourse, setFlightInput, stepExpedition, weaponReadiness } from '../../src/domain/exploration/expeditionEngine';

describe('exploration engine', () => {
  it('classifies nearby echoes while spending scan energy', () => {
    const start = createExpedition();
    const scanned = scan(start);
    expect(scanned.energy).toBe(92);
    expect(scanned.signals.find((signal) => signal.id === 'echo-wreck')?.knowledge).toBe('classified');
    expect(scanned.signals.find((signal) => signal.id === 'echo-anomaly')?.knowledge).toBe('echo');
  });

  it('moves deterministically toward a chosen signal', () => {
    const start = createExpedition();
    const course = setCourse(start, { x: 2_520, y: 1_230 });
    const first = stepExpedition(course, 1_000);
    const second = stepExpedition(course, 1_000);
    expect(first.position.x).toBeGreaterThan(start.position.x);
    expect(first.position.y).toBeLessThan(start.position.y);
    expect(first).toEqual(second);
  });

  it('moves the ship directly from a normalized flight-stick input', () => {
    const start = createExpedition();
    const steering = setFlightInput(start, { x: 1, y: 0 });
    const moved = stepExpedition(steering, 1_000);
    expect(moved.position.x).toBeGreaterThan(start.position.x);
    expect(moved.position.y).toBe(start.position.y);
    expect(moved.heading).toBeCloseTo(Math.PI / 2);
    expect(moved.course).toBeUndefined();
  });

  it('secures a classified wreck only when the ship is nearby', () => {
    const scanned = scan(createExpedition());
    const tooFar = investigate(scanned, 'echo-wreck');
    expect(tooFar.cargo.alloys).toBe(0);
    const nearWreck = { ...scanned, position: { x: 2_520, y: 1_230 } };
    const salvaged = investigate(nearWreck, 'echo-wreck');
    expect(salvaged.cargo.alloys).toBe(2);
    expect(salvaged.signals.find((signal) => signal.id === 'echo-wreck')?.knowledge).toBe('resolved');
  });

  it('sets a return route to Farhaven', () => {
    const outbound = { ...createExpedition(), position: { x: 2_520, y: 1_230 } };
    const returning = returnToFarhaven(outbound);
    expect(returning.status).toBe('returning');
    expect(returning.course).toEqual(returning.origin);
  });

  it('mines a classified vein only when the ship is close and has room', () => {
    const scanned = scan({ ...createExpedition(), position: { x: 3_340, y: 680 } });
    const mined = mineVein(scanned, 'echo-vein');
    expect(mined.cargo.alloys).toBe(3);
    expect(mined.energy).toBe(82);
    expect(mined.signals.find((signal) => signal.id === 'echo-vein')?.knowledge).toBe('resolved');
  });

  it('fires only when a hostile contact is in range', () => {
    const start = createExpedition();
    expect(firePrimary(start).hostiles[0]?.hull).toBe(3);
    const tooFar = { ...start, position: { x: 1_700, y: 1_500 } };
    expect(firePrimary(tooFar).hostiles[0]?.hull).toBe(4);
    const closeContact = { ...start, position: { x: 2_700, y: 1_560 } };
    expect(firePrimary(closeContact).hostiles[0]?.hull).toBe(3);
  });

  it('requires manual target selection and uses ship positioning as the aim model', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    expect(weaponReadiness(start, undefined, 'broadside').ready).toBe(false);
    const sideOn = { ...start, position: { x: 2_300, y: 1_500 }, heading: 0 };
    expect(weaponReadiness(sideOn, target.id, 'broadside').ready).toBe(true);
    const fired = fireWeapon(sideOn, target.id, 'broadside');
    expect(fired.hostiles[0]?.hull).toBe(3);
    expect(fired.hostiles[0]?.status).toBe('patrol');
    expect(fired.hostiles[0]?.passive).toBe(true);
    const angleToTarget = Math.atan2(target.position.y - sideOn.position.y, target.position.x - sideOn.position.x);
    const forwardOn = { ...sideOn, heading: angleToTarget + Math.PI / 2 };
    expect(weaponReadiness(forwardOn, target.id, 'rail').ready).toBe(true);
    expect(weaponReadiness(forwardOn, target.id, 'torpedo').ready).toBe(true);
  });

  it('respawns passive combat dummies after they are destroyed', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    const fragileDummy = { ...start, hostiles: [{ ...target, hull: 1 }] };
    const destroyed = fireWeapon(fragileDummy, target.id, 'broadside');
    expect(destroyed.hostiles).toHaveLength(0);
    expect(destroyed.dummyRespawns[0]?.hostileId).toBe(target.id);
    const respawned = stepExpedition(destroyed, 3_000);
    expect(respawned.hostiles[0]).toMatchObject({ id: target.id, hull: target.maxHull, passive: true });
    expect(respawned.dummyRespawns).toHaveLength(0);
  });
});
