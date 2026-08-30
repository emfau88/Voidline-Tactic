import { afterEach, describe, expect, it, vi } from 'vitest';
import { createExpedition, enterWormhole, fireWeapon, returnToFarhaven, stepExpedition, WORMHOLE_POSITION } from '../../src/domain/exploration/expeditionEngine';
import { advanceProjectiles, contactTime, launchProjectile, normalizeCombatState } from '../../src/domain/exploration/projectiles';
import type { ExpeditionState, WeaponMode } from '../../src/domain/exploration/types';
import { loadActiveExpedition, saveActiveExpedition } from '../../src/app/saveGame';

function arena(): ExpeditionState {
  const state = createExpedition();
  return { ...state, position: { x: 1000, y: 1000 }, heading: Math.PI / 2,
    hostiles: [{ ...state.hostiles[0]!, position: { x: 1300, y: 1000 }, patrolRadius: 0 }] };
}

describe('physical projectiles', () => {
  it.each<WeaponMode>(['broadside', 'rail', 'torpedo', 'orb'])('%s waits for contact, hits once and expires', (weapon) => {
    const state = arena();
    const fired = fireWeapon(state, state.hostiles[0]!.id, weapon);
    expect(fired.hostiles[0]!.hull).toBe(4);
    expect(fired.projectiles).toHaveLength(1);
    const beforeContact = stepExpedition(fired, 20);
    expect(beforeContact.hostiles[0]!.hull).toBe(4);
    const after = stepExpedition(beforeContact, 1000);
    expect(after.hostiles[0]!.hull).toBeLessThan(4);
    expect(after.combatEvents.filter((e) => e.kind === 'hit')).toHaveLength(1);
    expect(stepExpedition(after, 1000).hostiles[0]!.hull).toBe(after.hostiles[0]!.hull);
    expect(after.projectiles).toHaveLength(0);
  });

  it('hits without a selected target', () => {
    const state = arena();
    const fired = fireWeapon(state, undefined, 'rail');
    expect(stepExpedition(fired, 500).hostiles[0]!.hull).toBe(2);
  });

  it('does not spawn a long barrel shot beyond a point-blank target', () => {
    const state = arena();
    const close = { ...state, hostiles: [{ ...state.hostiles[0]!, position: { x: 1050, y: 1000 } }] };
    const fired = fireWeapon(close, close.hostiles[0]!.id, 'rail');
    expect(stepExpedition(fired, 100).hostiles[0]!.hull).toBe(2);
  });

  it('clears remaining projectiles on defeat and cannot fire a dead ship', () => {
    const state = { ...arena(), hull: 1 };
    const fired = launchProjectile(state, 'enemy', 'hostile', 'rail', { x: 1100, y: 1000 }, { x: -1, y: 0 }, 3, 600);
    const defeated = stepExpedition(fired, 500);
    expect(defeated.hull).toBe(0);
    expect(defeated.projectiles).toHaveLength(0);
    expect(fireWeapon(defeated, undefined, 'rail').energy).toBe(defeated.energy);
  });

  it('misses when the previously acquired target leaves the flight path', () => {
    const state = arena();
    const fired = fireWeapon(state, state.hostiles[0]!.id, 'rail');
    const dodged = { ...fired, hostiles: [{ ...fired.hostiles[0]!, position: { x: 1300, y: 1100 } }] };
    const result = stepExpedition(dodged, 1000);
    expect(result.hostiles[0]!.hull).toBe(4);
    expect(result.combatEvents.some((e) => e.kind === 'hit')).toBe(false);
  });

  it('allows an unmarked target to move into a free shot', () => {
    const state = arena();
    const fired = fireWeapon({ ...state, hostiles: [] }, undefined, 'rail');
    const entered = { ...fired, hostiles: state.hostiles };
    expect(stepExpedition(entered, 500).hostiles[0]!.hull).toBe(2);
  });

  it('hits the nearest intersection, not the selected or first array target', () => {
    const state = arena();
    const farther = { ...state.hostiles[0]!, id: 'farther', position: { x: 1400, y: 1000 } };
    const near = { ...farther, id: 'nearer', position: { x: 1200, y: 1000 } };
    const fired = fireWeapon({ ...state, hostiles: [farther, near] }, farther.id, 'rail');
    const result = stepExpedition(fired, 1000);
    expect(result.hostiles.find((h) => h.id === 'nearer')!.hull).toBe(2);
    expect(result.hostiles.find((h) => h.id === 'farther')!.hull).toBe(4);
  });

  it('sweeps fast projectiles and moving targets rather than only their end positions', () => {
    expect(contactTime({ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 0 }, 10)).toBeCloseTo(0.49);
    expect(contactTime({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: -100 }, { x: 50, y: 100 }, 5)).toBeDefined();
    expect(contactTime({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 10 }, { x: 50, y: 10 }, 10)).toBeCloseTo(0.5);
    expect(contactTime({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 }, 5)).toBe(0);
    expect(contactTime({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 0 }, 5)).toBeUndefined();
  });

  it('produces the same result with one long tick and many short ticks', () => {
    const state = arena();
    const fired = fireWeapon(state, state.hostiles[0]!.id, 'rail');
    let short = fired;
    for (let i = 0; i < 50; i += 1) short = stepExpedition(short, 20);
    expect(stepExpedition(fired, 1000)).toEqual(short);
  });

  it('does not collide beyond the projectile lifetime during a long frame', () => {
    const state = arena();
    const fired = launchProjectile(state, 'player', 'player', 'rail', state.position, { x: 1, y: 0 }, 2, 100);
    const result = advanceProjectiles(fired, fired, 1000);
    expect(result.hostiles[0]!.hull).toBe(4);
    expect(result.projectiles).toHaveLength(0);
  });

  it('lets hostile rounds miss a moving player, with no friendly fire', () => {
    const state = arena();
    const enemy = { ...state.hostiles[0]!, position: { x: 1400, y: 1000 } };
    const fired = launchProjectile({ ...state, hostiles: [enemy] }, enemy.id, 'hostile', 'broadside', enemy.position, { x: -1, y: 0 }, 4, 600);
    expect(stepExpedition(fired, 800).hull).toBe(96);
    const dodged = stepExpedition({ ...fired, flightInput: { x: 0, y: 1 } }, 800);
    expect(dodged.hull).toBe(100);
    expect(dodged.hostiles[0]!.hull).toBe(4);
    const playerShot = launchProjectile(state, 'player', 'player', 'rail', state.position, { x: -1, y: 0 }, 2, 600);
    expect(stepExpedition(playerShot, 500).hull).toBe(100);
  });

  it('does not generate duplicate hits from two rounds against an already destroyed ship', () => {
    let state = arena();
    state = { ...state, hostiles: [{ ...state.hostiles[0]!, hull: 1 }] };
    const first = launchProjectile(state, 'player', 'player', 'rail', state.position, { x: 1, y: 0 }, 2, 600);
    const second = launchProjectile(first, 'player', 'player', 'rail', state.position, { x: 1, y: 0 }, 2, 600);
    const result = stepExpedition(second, 600);
    expect(result.combatEvents.filter((e) => e.destroyed)).toHaveLength(1);
    expect(result.dummyRespawns).toHaveLength(1);
  });

  it('evaluates the guardian shield at impact and consumes the blocked round', () => {
    const state = arena();
    const shielded = { ...state, hostiles: [{ ...state.hostiles[0]!, passive: false, kind: 'guardian' as const, status: 'alert' as const, attackCooldownMs: 4000 }] };
    const fired = launchProjectile(shielded, 'player', 'player', 'rail', state.position, { x: 1, y: 0 }, 2, 600);
    const result = stepExpedition(fired, 400);
    expect(result.hostiles[0]!.hull).toBe(4);
    expect(result.combatEvents.filter((e) => e.kind === 'blocked')).toHaveLength(1);
    expect(result.projectiles).toHaveLength(0);
  });

  it('freezes at zero elapsed time and clears projectiles on return and sector change', () => {
    const fired = fireWeapon(arena(), undefined, 'rail');
    expect(stepExpedition(fired, 0)).toBe(fired);
    expect(returnToFarhaven(fired).projectiles).toHaveLength(0);
    const inRift = enterWormhole({ ...fired, position: WORMHOLE_POSITION });
    expect(inRift.sectorId).toBe('veloria-rift');
    expect(inRift.projectiles).toHaveLength(0);
    expect(inRift.combatEvents).toHaveLength(0);
  });
});

describe('projectile save compatibility', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('normalizes old saves and rejects invalid or duplicate projectile entries', () => {
    const old = arena();
    const legacy = { ...old, projectiles: undefined, nextCombatId: undefined, combatEvents: undefined } as unknown as ExpeditionState;
    expect(normalizeCombatState(legacy)).toMatchObject({ projectiles: [], combatEvents: [], nextCombatId: 1 });
    const fired = fireWeapon(old, undefined, 'rail');
    const shot = fired.projectiles[0]!;
    const bad = { ...fired, nextCombatId: 1, projectiles: [shot, shot, { ...shot, id: 900, remainingMs: Infinity }] };
    const restored = normalizeCombatState(bad);
    expect(restored.projectiles).toEqual([shot]);
    expect(restored.nextCombatId).toBeGreaterThan(shot.id);
    expect(restored.combatEvents).toHaveLength(0);
  });

  it('resumes a shot without replaying muzzle events or duplicating its later hit', () => {
    const entries = new Map<string, string>();
    vi.stubGlobal('window', { localStorage: { getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value) } });
    const fired = fireWeapon(arena(), undefined, 'rail');
    saveActiveExpedition(fired);
    const restored = loadActiveExpedition()!.expedition;
    expect(restored.projectiles).toEqual(fired.projectiles);
    expect(restored.combatEvents).toHaveLength(0);
    const hit = stepExpedition(restored, 500);
    expect(hit.hostiles[0]!.hull).toBe(2);
    saveActiveExpedition(hit);
    const afterReload = stepExpedition(loadActiveExpedition()!.expedition, 500);
    expect(afterReload.hostiles[0]!.hull).toBe(2);
    expect(afterReload.combatEvents).toHaveLength(0);
  });
});
