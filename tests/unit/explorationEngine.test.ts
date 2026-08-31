import { describe, expect, it } from 'vitest';
import { canEnterWormhole, createExpedition, enterWormhole, firePrimary, fireWeapon, investigate, mineVein, returnToFarhaven, rewardForExpeditionSignal, rewardForSignal, scan, setCourse, setFlightInput, stepExpedition, weaponReadiness, WORMHOLE_POSITION } from '../../src/domain/exploration/expeditionEngine';
import { isSignalNavigable, primaryNavigationSignal } from '../../src/domain/exploration/navigation';

describe('exploration engine', () => {
  it('classifies nearby echoes while consuming rechargeable system charge', () => {
    const start = createExpedition();
    const scanned = scan(start);
    expect(scanned.energy).toBe(92);
    expect(scanned.signals.find((signal) => signal.id === 'echo-wreck')?.knowledge).toBe('classified');
    expect(scanned.signals.find((signal) => signal.id === 'echo-anomaly')?.knowledge).toBe('echo');
    expect(scanned.scanPerformed).toBe(true);
  });

  it('keeps the authored mission visible before scanning and reveals weak contacts after a pulse', () => {
    const start = createExpedition(0, 2, 'second-shift');
    const mission = primaryNavigationSignal(start)!;
    const distantArchive = start.signals.find((signal) => signal.id === 'wayfarer-archive')!;
    expect(mission.id).toBe('monk-lantern');
    expect(isSignalNavigable(start, mission)).toBe(true);
    expect(isSignalNavigable(start, distantArchive)).toBe(false);
    expect(isSignalNavigable(scan(start), distantArchive)).toBe(true);
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

  it('opens with a quick safe salvage and an optional guarded Glutkutter reward', () => {
    const start = createExpedition(0, 0, 'first-wreck');
    expect(start.hostiles).toHaveLength(1);
    expect(start.hostiles[0]).toMatchObject({ id: 'first-cinder-skiff', passive: false, hull: 8 });
    const scanned = scan(start);
    const wreck = scanned.signals.find((signal) => signal.id === 'echo-wreck')!;
    const cache = scanned.signals.find((signal) => signal.id === 'first-skiff-cache')!;
    const quickSalvage = investigate({ ...scanned, position: wreck.position }, wreck.id);
    expect(quickSalvage.cargo.alloys).toBe(3);
    const guarded = investigate({ ...quickSalvage, position: cache.position }, cache.id);
    expect(guarded.cargo.alloys).toBe(3);
    expect(guarded.log[0]).toContain('bewacht');
    const skiff = guarded.hostiles[0]!;
    let combat = { ...guarded, position: { x: skiff.position.x - 280, y: skiff.position.y }, heading: 0 };
    for (let shot = 0; shot < 8; shot += 1) {
      combat = fireWeapon({ ...combat, weaponCooldowns: { broadside: 0, rail: 0, torpedo: 0, orb: 0 } }, skiff.id, 'broadside');
      combat = stepExpedition(combat, 500);
    }
    expect(combat.hostiles).toHaveLength(0);
    const fullSalvage = investigate({ ...combat, position: cache.position }, cache.id);
    expect(fullSalvage.cargo.alloys).toBe(5);
  });

  it('offers combat as a full-data alternative during the second expedition', () => {
    const run = createExpedition(0, 4, 'second-shift');
    const cipher = run.signals.find((signal) => signal.id === 'raider-cipher');
    expect(cipher).toMatchObject({ guardedBy: 'cipher-reaver', reward: { kind: 'data', amount: 2 } });
    expect(run.hostiles).toEqual([expect.objectContaining({ id: 'cipher-reaver', passive: false })]);
  });

  it('makes installed salvage claws visible as a real extra wreck reward', () => {
    const scanned = scan(createExpedition(0, 2, 'first-wreck', 0, 1));
    const wreck = scanned.signals.find((signal) => signal.id === 'echo-wreck')!;
    expect(rewardForExpeditionSignal(scanned, wreck).amount).toBe(4);
    const salvaged = investigate({ ...scanned, position: wreck.position }, wreck.id);
    expect(salvaged.cargo.alloys).toBe(4);
    expect(salvaged.log[0]).toContain('Bergungsgreifer');
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
    expect(rift.signals).toHaveLength(6);
    expect(rift.signals.some((signal) => signal.reward?.kind === 'relics')).toBe(true);
    expect(rift.hostiles).toHaveLength(2);
  });

  it('offers repeatable post-story sources for every core resource', () => {
    const recovery = createExpedition(0, 4, 'recovery-run');
    const rewards = recovery.signals.map(rewardForSignal);
    expect(new Set(rewards.map((reward) => reward.kind))).toEqual(new Set(['alloys', 'data', 'relics']));
    expect(recovery.hostiles.map((hostile) => hostile.kind)).toEqual(expect.arrayContaining(['patrol', 'sentinel']));
  });

  it('supports a safe slower data route and lets the Reliktlabor damp anomaly damage', () => {
    const secondShift = createExpedition(0, 4, 'second-shift');
    const archive = secondShift.signals.find((signal) => signal.id === 'wayfarer-archive')!;
    const safe = investigate(scan({ ...secondShift, position: archive.position }), archive.id);
    expect(safe.cargo.data).toBe(1);
    expect(safe.hull).toBe(100);

    const protectedRun = createExpedition(0, 4, 'second-shift', 3);
    const liturgy = protectedRun.signals.find((signal) => signal.id === 'cutting-liturgy')!;
    const protectedResult = investigate(scan({ ...protectedRun, position: liturgy.position }), liturgy.id);
    expect(protectedResult.cargo.data).toBe(2);
    expect(protectedResult.hull).toBe(97);
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
    const cleared = stepExpedition(fireWeapon(sideOn, raider.id, 'broadside'), 500);
    expect(cleared.hostiles).toHaveLength(0);
    const looted = investigate({ ...cleared, position: cache.position }, cache.id);
    expect(looted.cargo.alloys).toBe(6);
  });

  it('lets the telegraphed raider fire only after the player enters its guarded space', () => {
    const run = createExpedition(0, 4, 'mining-run');
    const warned = stepExpedition({ ...run, position: { x: 2_570, y: 1_470 } }, 40);
    expect(warned.hostiles[0]?.status).toBe('alert');
    expect(warned.hull).toBe(run.hull);
    const threatened = stepExpedition(warned, 1_400);
    expect(threatened.hostiles[0]?.status).toBe('alert');
    expect(threatened.hull).toBe(run.hull);
    expect(threatened.log[0]).toContain('feuert');
    expect(stepExpedition(threatened, 600).hull).toBeLessThan(run.hull);
  });

  it('can reduce the hull to zero, allowing the flow layer to resolve a real defeat', () => {
    const run = createExpedition(0, 4, 'mining-run');
    const exposed = { ...run, hull: 4, position: { x: 2_570, y: 1_470 } };
    const warned = stepExpedition(exposed, 40);
    expect(stepExpedition(warned, 2_000).hull).toBe(0);
  });

  it('gives the recovery contacts distinct, avoidable combat roles', () => {
    const run = createExpedition(0, 4, 'recovery-run');
    const skiff = run.hostiles.find((hostile) => hostile.id === 'cinder-skiff')!;
    const sentinel = run.hostiles.find((hostile) => hostile.id === 'vault-sentinel')!;
    const skiffAlert = stepExpedition({ ...run, position: { x: skiff.position.x - 400, y: skiff.position.y } }, 40);
    expect(skiffAlert.hostiles.find((hostile) => hostile.id === skiff.id)?.status).toBe('alert');
    const sentinelAlert = stepExpedition({ ...run, position: { x: sentinel.position.x - 400, y: sentinel.position.y } }, 40);
    const sentinelAfter = sentinelAlert.hostiles.find((hostile) => hostile.id === sentinel.id)!;
    expect(sentinelAfter.status).toBe('alert');
    expect(sentinelAfter.position).toEqual(sentinel.position);
    const escaped = stepExpedition({ ...skiffAlert, position: { x: skiff.position.x - 900, y: skiff.position.y } }, 40);
    expect(escaped.hostiles.find((hostile) => hostile.id === skiff.id)?.status).toBe('patrol');
    expect(escaped.log[0]).toContain('bricht die Verfolgung ab');
  });

  it('offers combat or a broadband scan as alternatives at the Aschenkantor', () => {
    const combatRun = createExpedition(0, 8, 'recovery-run');
    expect(combatRun.hostiles.find((hostile) => hostile.id === 'ash-cantor')).toMatchObject({ kind: 'guardian', hull: 14 });
    const cantor = combatRun.hostiles.find((hostile) => hostile.id === 'ash-cantor')!;
    const bypassRun = createExpedition(0, 8, 'recovery-run', 0, 0, true);
    const pacified = scan({ ...bypassRun, position: { x: cantor.position.x + 300, y: cantor.position.y } });
    expect(pacified.hostiles.some((hostile) => hostile.id === 'ash-cantor')).toBe(false);
    expect(pacified.log[0]).toContain('Breitbandarray');
    const reward = pacified.signals.find((signal) => signal.id === 'cantor-reliquary');
    expect(reward?.reward).toMatchObject({ kind: 'relics', amount: 2 });
  });

  it('fires only when a hostile contact is in range', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    expect(firePrimary(start).hostiles.find((hostile) => hostile.id === target.id)?.hull).toBe(4);
    expect(stepExpedition(firePrimary(start), 400).hostiles.find((hostile) => hostile.id === target.id)?.hull).toBe(3);
    const tooFar = { ...start, position: { x: 0, y: 0 } };
    expect(firePrimary(tooFar).hostiles).toEqual(start.hostiles);
    const closeContact = { ...start, position: { x: target.position.x - 300, y: target.position.y } };
    expect(stepExpedition(firePrimary(closeContact), 500).hostiles.find((hostile) => hostile.id === target.id)?.hull).toBe(3);
  });

  it('allows free fire without a target and uses ship positioning for automatic hits', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    expect(weaponReadiness(start, undefined, 'broadside').ready).toBe(true);
    const freeFire = fireWeapon(start, undefined, 'broadside');
    expect(freeFire.hostiles).toEqual(start.hostiles);
    expect(freeFire.energy).toBeLessThan(start.energy);
    expect(weaponReadiness(freeFire, undefined, 'broadside')).toMatchObject({ ready: false, cooldownMs: 760 });
    const sideOn = { ...start, position: { x: target.position.x - 220, y: target.position.y }, heading: 0 };
    expect(weaponReadiness(sideOn, target.id, 'broadside').ready).toBe(true);
    const fired = fireWeapon(sideOn, target.id, 'broadside');
    expect(fired.hostiles[0]?.hull).toBe(4);
    expect(stepExpedition(fired, 400).hostiles[0]?.hull).toBe(3);
    const runningBroadside = { ...sideOn, velocity: { x: 0.2, y: 0 }, flightInput: { x: 1, y: 0 } };
    expect(weaponReadiness(runningBroadside, target.id, 'broadside').ready).toBe(true);
    expect(stepExpedition(fireWeapon(runningBroadside, target.id, 'broadside'), 400).hostiles[0]?.hull).toBe(3);
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

  it('fires a misaligned rail lance only forward into space instead of bending it toward a side target', () => {
    const start = createExpedition(0, 0, 'first-wreck');
    const target = start.hostiles[0]!;
    const sideTarget = { ...start, position: { x: target.position.x - 240, y: target.position.y }, heading: 0 };
    expect(weaponReadiness(sideTarget, target.id, 'rail')).toMatchObject({ ready: false, reason: 'Lanze nach vorn ausrichten' });
    const freeShot = fireWeapon(sideTarget, undefined, 'rail');
    expect(freeShot.hostiles[0]?.hull).toBe(target.hull);
    expect(freeShot.energy).toBe(sideTarget.energy - 12);
  });

  it('enforces an individual cooldown and recharges it while the ship keeps moving', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    const fired = fireWeapon(start, target.id, 'broadside');
    expect(weaponReadiness(fired, target.id, 'broadside')).toMatchObject({ ready: false });
    expect(weaponReadiness(fired, target.id, 'rail')).toMatchObject({ ready: true });
    const recharged = stepExpedition({ ...fired, flightInput: { x: 1, y: 0 } }, 800);
    expect(weaponReadiness(recharged, target.id, 'broadside')).toMatchObject({ ready: true });
  });

  it('respawns passive combat dummies after they are destroyed', () => {
    const start = createExpedition();
    const target = start.hostiles[0]!;
    const fragileDummy = { ...start, hostiles: [{ ...target, hull: 1 }] };
    const destroyed = stepExpedition(fireWeapon(fragileDummy, target.id, 'broadside'), 400);
    expect(destroyed.hostiles).toHaveLength(0);
    expect(destroyed.dummyRespawns[0]?.hostileId).toBe(target.id);
    const respawned = stepExpedition(destroyed, 3_000);
    expect(respawned.hostiles[0]).toMatchObject({ id: target.id, hull: target.maxHull, passive: true });
    expect(respawned.dummyRespawns).toHaveLength(0);
  });
});
