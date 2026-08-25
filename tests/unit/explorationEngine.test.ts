import { describe, expect, it } from 'vitest';
import { canEnterWormhole, createExpedition, enterWormhole, firePrimary, fireWeapon, investigate, mineVein, returnToFarhaven, rewardForSignal, scan, setCourse, setFlightInput, stepExpedition, weaponReadiness, WORMHOLE_POSITION } from '../../src/domain/exploration/expeditionEngine';

describe('exploration engine', () => {
  it('classifies nearby echoes while consuming rechargeable system charge', () => {
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
    expect(moved.energy).toBe(start.energy);
  });

  it('secures a classified wreck only when the ship is nearby', () => {
    const scanned = scan(createExpedition());
    const tooFar = investigate(scanned, 'echo-wreck');
    expect(tooFar.cargo.alloys).toBe(0);
    const nearWreck = { ...scanned, position: { x: 2_520, y: 1_230 } };
    const salvaged = investigate(nearWreck, 'echo-wreck');
    expect(salvaged.cargo.alloys).toBe(3);
    expect(salvaged.signals.find((signal) => signal.id === 'echo-wreck')?.knowledge).toBe('resolved');
  });

  it('offers the second-shift choice and makes the risky data source cost hull instead of fuel', () => {
    const scanned = scan(createExpedition(0, 4, 'second-shift'));
    const lantern = scanned.signals.find((signal) => signal.id === 'monk-lantern')!;
    const liturgy = scanned.signals.find((signal) => signal.id === 'cutting-liturgy')!;
    expect(lantern.knowledge).toBe('classified');
    expect(liturgy.knowledge).toBe('classified');
    const safe = investigate({ ...scanned, position: lantern.position }, lantern.id);
    expect(safe.cargo.relics).toBe(1);
    expect(safe.hull).toBe(100);
    const risky = investigate({ ...safe, position: liturgy.position }, liturgy.id);
    expect(risky.cargo.data).toBe(2);
    expect(risky.hull).toBe(94);
  });

  it('reveals one relic and two data after scanning the second expedition', () => {
    const scanned = scan(createExpedition(0, 4, 'second-shift'));
    const rewards = scanned.signals
      .filter((signal) => signal.knowledge === 'classified')
      .map((signal) => rewardForSignal(signal));
    expect(rewards).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'relics', amount: 1 }),
      expect.objectContaining({ kind: 'data', amount: 2 }),
    ]));
  });

  it('never lets a multi-slot discovery exceed cargo capacity', () => {
    const scanned = scan({ ...createExpedition(-0, -4, 'second-shift'), position: { x: 1_720, y: 1_240 } });
    const almostFull = { ...scanned, cargo: { alloys: 1, data: 0, relics: 0 } };
    const blocked = investigate(almostFull, 'cutting-liturgy');
    expect(blocked.cargo).toEqual(almostFull.cargo);
    expect(blocked.signals.find((signal) => signal.id === 'cutting-liturgy')?.knowledge).toBe('classified');
    expect(blocked.log[0]).toContain('Zu wenig Frachtraum');
  });

  it('sets a return route to Farhaven', () => {
    const outbound = { ...createExpedition(), position: { x: 2_520, y: 1_230 } };
    const returning = returnToFarhaven(outbound);
    expect(returning.status).toBe('returning');
    expect(returning.course).toEqual(returning.origin);
    expect(returning.heading).toBeCloseTo(Math.atan2(returning.origin.y - outbound.position.y, returning.origin.x - outbound.position.x) + Math.PI / 2);
    const advanced = stepExpedition(returning, 1_000);
    expect(Math.hypot(advanced.position.x - returning.origin.x, advanced.position.y - returning.origin.y)).toBeLessThan(
      Math.hypot(returning.position.x - returning.origin.x, returning.position.y - returning.origin.y),
    );
    expect(advanced.heading).toBeCloseTo(returning.heading);
  });

  it('keeps a manual flight course intact when scanning', () => {
    const steering = setFlightInput(createExpedition(), { x: 1, y: 0 });
    const scanned = scan(steering);
    expect(scanned.flightInput).toEqual(steering.flightInput);
    const moved = stepExpedition(scanned, 1_000);
    expect(moved.position.x).toBeGreaterThan(scanned.position.x);
    expect(moved.position.y).toBe(scanned.position.y);
  });

  it('restores system charge while travelling instead of spending fuel', () => {
    const drained = { ...createExpedition(), energy: 50 };
    const travelling = setCourse(drained, { x: 2_520, y: 1_230 });
    const advanced = stepExpedition(travelling, 1_000);
    expect(advanced.energy).toBeGreaterThan(drained.energy);
    expect(advanced.energy).toBeLessThanOrEqual(advanced.maxEnergy);
  });

  it('enters the optional alien-realm map only at the Xenogate', () => {
    const start = createExpedition();
    expect(canEnterWormhole(start)).toBe(false);
    const atGate = { ...start, position: WORMHOLE_POSITION };
    expect(canEnterWormhole(atGate)).toBe(true);
    const rift = enterWormhole(atGate);
    expect(rift.sectorId).toBe('veloria-rift');
    expect(rift.sectorName).toBe('Veloria Rift');
    expect(rift.signals).toHaveLength(3);
    expect(rift.hostiles).toHaveLength(0);
  });

  it('mines a classified vein only when the ship is close and has room', () => {
    const scanned = scan({ ...createExpedition(), position: { x: 3_340, y: 680 } });
    const mined = mineVein(scanned, 'echo-vein');
    expect(mined.cargo.alloys).toBe(3);
    expect(mined.energy).toBe(82);
    expect(mined.signals.find((signal) => signal.id === 'echo-vein')?.knowledge).toBe('resolved');
  });

  it('keeps a guarded bonus cache optional until the real raider is defeated', () => {
    const scanned = scan(createExpedition(0, 4, 'mining-run'));
    const vein = scanned.signals.find((signal) => signal.id === 'black-vein')!;
    const cache = scanned.signals.find((signal) => signal.id === 'raider-cache')!;
    const mined = mineVein({ ...scanned, position: vein.position }, vein.id);
    expect(mined.cargo.alloys).toBe(3);
    const cacheScanned = scan({ ...mined, position: cache.position });
    const blocked = investigate({ ...cacheScanned, position: cache.position }, cache.id);
    expect(blocked.cargo.alloys).toBe(3);
    expect(blocked.log[0]).toContain('bewacht');
    const raider = blocked.hostiles[0]!;
    const sideOn = {
      ...blocked,
      position: { x: raider.position.x - 300, y: raider.position.y },
      heading: 0,
      hostiles: [{ ...raider, hull: 1 }],
    };
    const cleared = fireWeapon(sideOn, raider.id, 'broadside');
    expect(cleared.hostiles).toHaveLength(0);
    const looted = investigate({ ...cleared, position: cache.position }, cache.id);
    expect(looted.cargo.alloys).toBe(6);
  });

  it('lets the telegraphed raider fire only after the player enters its guarded space', () => {
    const run = createExpedition(0, 4, 'mining-run');
    const threatened = stepExpedition({ ...run, position: { x: 2_570, y: 1_470 } }, 40);
    expect(threatened.hostiles[0]?.status).toBe('alert');
    expect(threatened.hull).toBeLessThan(run.hull);
    expect(threatened.log[0]).toContain('feuert');
  });

  it('can reduce the hull to zero, allowing the flow layer to resolve a real defeat', () => {
    const run = createExpedition(0, 4, 'mining-run');
    const exposed = { ...run, hull: 4, position: { x: 2_570, y: 1_470 } };
    expect(stepExpedition(exposed, 40).hull).toBe(0);
  });

  it('fires only when a hostile contact is in range', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    expect(firePrimary(start).hostiles.find((hostile) => hostile.id === target.id)?.hull).toBe(3);
    const tooFar = { ...start, position: { x: 0, y: 0 } };
    expect(firePrimary(tooFar).hostiles).toEqual(start.hostiles);
    const closeContact = { ...start, position: { x: target.position.x - 300, y: target.position.y } };
    expect(firePrimary(closeContact).hostiles.find((hostile) => hostile.id === target.id)?.hull).toBe(3);
  });

  it('requires manual target selection and uses ship positioning as the aim model', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    expect(weaponReadiness(start, undefined, 'broadside').ready).toBe(false);
    const sideOn = { ...start, position: { x: target.position.x - 220, y: target.position.y }, heading: 0 };
    expect(weaponReadiness(sideOn, target.id, 'broadside').ready).toBe(true);
    const fired = fireWeapon(sideOn, target.id, 'broadside');
    expect(fired.hostiles[0]?.hull).toBe(3);
    const runningBroadside = { ...sideOn, velocity: { x: 0.2, y: 0 }, flightInput: { x: 1, y: 0 } };
    expect(weaponReadiness(runningBroadside, target.id, 'broadside').ready).toBe(true);
    expect(fireWeapon(runningBroadside, target.id, 'broadside').hostiles[0]?.hull).toBe(3);
    expect(fired.hostiles[0]?.status).toBe('patrol');
    expect(fired.hostiles[0]?.passive).toBe(true);
    const angleToTarget = Math.atan2(target.position.y - sideOn.position.y, target.position.x - sideOn.position.x);
    const forwardOn = { ...sideOn, heading: angleToTarget + Math.PI / 2 };
    expect(weaponReadiness(forwardOn, target.id, 'rail').ready).toBe(true);
    expect(weaponReadiness(forwardOn, target.id, 'torpedo').ready).toBe(true);
  });

  it('keeps passive practice dummies immediately fireable for weapon testing', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    const misaligned = { ...start, heading: Math.PI / 2 };
    expect(weaponReadiness(misaligned, target.id, 'rail').ready).toBe(true);
    expect(weaponReadiness(misaligned, target.id, 'broadside').ready).toBe(true);
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
