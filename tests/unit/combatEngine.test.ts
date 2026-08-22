import { describe, expect, it } from 'vitest';
import {
  activateAbility,
  createCombatState,
  designateTarget,
  getAbilityPreview,
  setCourse,
  setEscortDirective,
  steerShip,
  stepCombat,
} from '../../src/domain/combat/combatEngine';
import { NEBULA_CENTER, SHIELD_BOOST_DURATION_MS, SHIELD_BOOST_RESTORE } from '../../src/domain/combat/constants';
import type { CombatEvent, CombatState, ShipState } from '../../src/domain/combat/types';

function replaceShip(state: CombatState, ship: ShipState): CombatState {
  return { ...state, ships: { ...state.ships, [ship.id]: ship } };
}

function freeze(ship: ShipState): ShipState {
  return { ...ship, role: 'flagship', speed: 0, maxSpeed: 0, acceleration: 0, course: [] };
}

function placeFrontSolution(state: CombatState, attackerId: string, targetId: string, range = 320): CombatState {
  const attacker = freeze(state.ships[attackerId]);
  const target = freeze({
    ...state.ships[targetId],
    position: {
      x: attacker.position.x + Math.cos(attacker.facing) * range,
      y: attacker.position.y + Math.sin(attacker.facing) * range,
    },
  });
  return replaceShip(replaceShip(state, attacker), target);
}

function advance(state: CombatState, durationMs: number, stepMs = 100): { state: CombatState; events: CombatEvent[] } {
  const events: CombatEvent[] = [];
  let next = state;
  for (let elapsed = 0; elapsed < durationMs && next.status === 'active'; elapsed += stepMs) {
    const result = stepCombat(next, Math.min(stepMs, durationMs - elapsed));
    next = result.state;
    events.push(...result.events);
  }
  return { state: next, events };
}

describe('real-time combat engine', () => {
  it('applies the selected flagship doctrine without changing its escort', () => {
    const cruiserStart = createCombatState('p-cruiser');
    const frigateStart = createCombatState('p-frigate');

    expect(cruiserStart.flagshipId).toBe('p-cruiser');
    expect(cruiserStart.ships['p-cruiser'].maxShield).toBe(83);
    expect(cruiserStart.ships['p-frigate'].maxSpeed).toBe(82);
    expect(frigateStart.flagshipId).toBe('p-frigate');
    expect(frigateStart.ships['p-frigate'].maxSpeed).toBe(90);
    expect(frigateStart.ships['p-frigate'].maxEnergy).toBe(80);
    expect(frigateStart.ships['p-cruiser'].role).toBe('escort');
  });

  it('accepts a drawn flagship course and clamps it to the battlefield', () => {
    const state = createCombatState();
    const result = setCourse(state, state.flagshipId, [{ x: -500, y: 900 }, { x: 5_000, y: 300 }]);

    expect(result.error).toBeUndefined();
    expect(result.state.ships[state.flagshipId].course).toHaveLength(2);
    for (const point of result.state.ships[state.flagshipId].course) {
      expect(point.x).toBeGreaterThan(55);
      expect(point.x).toBeLessThan(945);
      expect(point.y).toBeGreaterThan(55);
      expect(point.y).toBeLessThan(1_445);
    }
  });

  it('moves continuously and respects the configured turn rate', () => {
    let state = createCombatState();
    const before = state.ships[state.flagshipId];
    state = setCourse(state, before.id, [{ x: before.position.x + 400, y: before.position.y }]).state;
    const result = stepCombat(state, 1_000);
    const after = result.state.ships[before.id];

    expect(after.position.y).toBeLessThan(before.position.y);
    expect(after.position.x).toBeGreaterThan(before.position.x);
    expect(Math.abs(after.facing - before.facing)).toBeLessThanOrEqual(before.turnRate + 0.0001);
  });

  it('turns toward a joystick heading and keeps it after input release', () => {
    const state = createCombatState();
    const flagship = state.ships[state.flagshipId];
    const steered = steerShip(state, flagship.id, 0);

    expect(steered.error).toBeUndefined();
    expect(steered.state.ships[flagship.id].desiredHeading).toBe(0);
    expect(steered.state.ships[flagship.id].course).toEqual([]);
    const firstStep = stepCombat(steered.state, 500).state;
    const secondStep = stepCombat(firstStep, 500).state;
    expect(firstStep.ships[flagship.id].facing).toBeGreaterThan(flagship.facing);
    expect(secondStep.ships[flagship.id].facing).toBeGreaterThan(firstStep.ships[flagship.id].facing);
    expect(secondStep.ships[flagship.id].desiredHeading).toBe(0);
  });

  it('is deterministic for identical fixed-step input', () => {
    const simulate = (): CombatState => advance(createCombatState(), 6_000, 1000 / 30).state;
    expect(simulate()).toEqual(simulate());
  });

  it('designates the same focus target for flagship and escort', () => {
    const state = createCombatState();
    const result = designateTarget(state, state.flagshipId, 'e-destroyer');

    expect(result.error).toBeUndefined();
    expect(result.state.ships[state.flagshipId].targetId).toBe('e-destroyer');
    expect(Object.values(result.state.ships).find((ship) => ship.role === 'escort')?.targetId).toBe('e-destroyer');
  });

  it('stores an explicit escort directive as stable combat state', () => {
    const state = createCombatState();
    const result = setEscortDirective(state, 'flank-left');
    expect(result.state.escortDirective).toBe('flank-left');
    expect(result.events).toContainEqual({ type: 'escort-directive-changed', directive: 'flank-left' });
  });

  it('charges a lance visibly and then applies its deterministic hit', () => {
    let state = placeFrontSolution(createCombatState(), 'p-cruiser', 'e-cruiser');
    state = designateTarget(state, 'p-cruiser', 'e-cruiser').state;
    const armed = activateAbility(state, 'p-cruiser', 'lance');
    const shieldBefore = armed.state.ships['e-cruiser'].shield;

    expect(armed.error).toBeUndefined();
    expect(armed.state.ships['p-cruiser'].lanceChargeMs).toBe(1_600);
    const resolved = stepCombat(armed.state, 1_600);
    expect(resolved.events.some((event) => event.type === 'weapon-fired' && event.weapon === 'lance')).toBe(true);
    expect(resolved.state.ships['e-cruiser'].shield).toBeLessThan(shieldBefore);
  });

  it('lets maneuvering break a telegraphed lance solution', () => {
    let state = placeFrontSolution(createCombatState(), 'p-cruiser', 'e-cruiser');
    state = designateTarget(state, 'p-cruiser', 'e-cruiser').state;
    state = activateAbility(state, 'p-cruiser', 'lance').state;
    const attacker = state.ships['p-cruiser'];
    const target = state.ships['e-cruiser'];
    state = replaceShip(state, { ...target, position: { x: attacker.position.x, y: attacker.position.y + 250 } });
    const result = stepCombat(state, 1_600);

    expect(result.events).toContainEqual(expect.objectContaining({ type: 'ability-failed', ability: 'lance' }));
    expect(result.state.ships[target.id].shield).toBe(target.shield);
  });

  it('launches a physical homing torpedo that resolves without a miss roll', () => {
    let state = placeFrontSolution(createCombatState('p-frigate'), 'p-frigate', 'e-destroyer', 280);
    state = designateTarget(state, 'p-frigate', 'e-destroyer').state;
    const launch = activateAbility(state, 'p-frigate', 'torpedo');

    expect(launch.error).toBeUndefined();
    expect(Object.values(launch.state.projectiles)).toHaveLength(1);
    const resolved = advance(launch.state, 4_000, 50);
    expect(resolved.events.some((event) => event.type === 'attack-resolved' && event.weapon === 'torpedo')).toBe(true);
    expect(Object.values(resolved.state.projectiles)).toHaveLength(0);
  });

  it('restores shields and starts a timed defensive boost immediately', () => {
    let state = createCombatState();
    const flagship = state.ships[state.flagshipId];
    state = replaceShip(state, { ...flagship, shield: flagship.maxShield - 30 });
    const result = activateAbility(state, flagship.id, 'shield');

    expect(result.error).toBeUndefined();
    expect(result.state.ships[flagship.id].shield).toBe(flagship.maxShield - 30 + SHIELD_BOOST_RESTORE);
    expect(result.state.ships[flagship.id].shieldBoostMs).toBe(SHIELD_BOOST_DURATION_MS);
  });

  it('shows the nebula reduction in the deterministic ability preview', () => {
    let state = createCombatState();
    const attacker = freeze({ ...state.ships['p-cruiser'], position: { x: NEBULA_CENTER.x, y: NEBULA_CENTER.y + 300 } });
    const coveredTarget = freeze({ ...state.ships['e-cruiser'], position: { ...NEBULA_CENTER } });
    state = replaceShip(replaceShip(state, attacker), coveredTarget);
    const covered = getAbilityPreview(state, attacker.id, 'lance', coveredTarget.id);
    state = replaceShip(state, { ...coveredTarget, position: { x: NEBULA_CENTER.x, y: NEBULA_CENTER.y - 250 } });
    const exposed = getAbilityPreview(state, attacker.id, 'lance', coveredTarget.id);

    expect(covered.valid).toBe(true);
    expect(covered.coverReduction).toBe(25);
    expect(exposed.valid).toBe(true);
    expect(exposed.coverReduction).toBe(0);
    expect(covered.shieldDamage).toBeLessThan(exposed.shieldDamage);
  });
});
