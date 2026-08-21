import { describe, expect, it } from 'vitest';
import { executeEnemyPhase } from '../../src/domain/combat/ai';
import {
  createCombatState,
  executeCommand,
  getAttackPreview,
  resolveCommandBeat,
} from '../../src/domain/combat/combatEngine';
import { COMMAND_DRIFT_DISTANCE, NEBULA_CENTER } from '../../src/domain/combat/constants';
import type { CombatState, ShipState } from '../../src/domain/combat/types';

function replaceShip(state: CombatState, ship: ShipState): CombatState {
  return { ...state, ships: { ...state.ships, [ship.id]: ship } };
}

describe('combat engine', () => {
  it('applies the selected flagship doctrine without changing the escort', () => {
    const cruiserStart = createCombatState(1, 'p-cruiser');
    const frigateStart = createCombatState(1, 'p-frigate');

    expect(cruiserStart.ships['p-cruiser'].maxShield).toBe(83);
    expect(cruiserStart.ships['p-cruiser'].shield).toBe(83);
    expect(cruiserStart.ships['p-frigate'].moveRange).toBe(315);
    expect(frigateStart.ships['p-frigate'].moveRange).toBe(350);
    expect(frigateStart.ships['p-frigate'].maxEnergy).toBe(80);
    expect(frigateStart.ships['p-cruiser'].maxShield).toBe(68);
  });

  it('uses fixed world units for movement', () => {
    const state = createCombatState(1);
    const ship = state.ships['p-cruiser'];
    const valid = executeCommand(state, {
      type: 'move',
      shipId: ship.id,
      destination: { x: ship.position.x + ship.moveRange, y: ship.position.y },
      facing: 0,
    });
    const invalid = executeCommand(state, {
      type: 'move',
      shipId: ship.id,
      destination: { x: ship.position.x + ship.moveRange + 1, y: ship.position.y },
      facing: 0,
    });

    expect(valid.error).toBeUndefined();
    expect(valid.state.ships[ship.id].ap).toBe(ship.ap - 1);
    expect(invalid.error).toBe('Destination is outside movement range.');
    expect(invalid.state).toBe(state);
  });

  it('requires a target to be inside the weapon arc', () => {
    let state = createCombatState(2);
    const attacker = state.ships['p-cruiser'];
    const target = state.ships['e-cruiser'];
    state = replaceShip(state, {
      ...target,
      position: { x: attacker.position.x, y: attacker.position.y - 400 },
    });

    expect(getAttackPreview(state, attacker.id, target.id, 'lance').valid).toBe(true);
    expect(getAttackPreview(state, attacker.id, target.id, 'broadside').valid).toBe(false);
  });

  it('produces identical results for the same seed and command', () => {
    const prepare = (): CombatState => {
      let state = createCombatState(42);
      const attacker = state.ships['p-cruiser'];
      const target = state.ships['e-cruiser'];
      state = replaceShip(state, {
        ...target,
        position: { x: attacker.position.x, y: attacker.position.y - 400 },
      });
      return state;
    };
    const command = {
      type: 'attack' as const,
      shipId: 'p-cruiser',
      targetId: 'e-cruiser',
      weapon: 'lance' as const,
    };

    expect(executeCommand(prepare(), command)).toEqual(executeCommand(prepare(), command));
  });

  it('keeps resolved damage inside the previewed bounds', () => {
    let state = createCombatState(123);
    const attacker = state.ships['p-cruiser'];
    const target = state.ships['e-cruiser'];
    state = replaceShip(state, {
      ...target,
      position: { x: attacker.position.x, y: attacker.position.y - 300 },
    });
    const preview = getAttackPreview(state, attacker.id, target.id, 'lance');
    const result = executeCommand(state, {
      type: 'attack',
      shipId: attacker.id,
      targetId: target.id,
      weapon: 'lance',
    });
    const event = result.events.find((candidate) => candidate.type === 'attack-resolved');

    expect(preview.valid).toBe(true);
    expect(event?.type).toBe('attack-resolved');
    if (event?.type === 'attack-resolved' && event.hit) {
      expect(event.shieldDamage).toBeGreaterThanOrEqual(preview.minShieldDamage);
      expect(event.shieldDamage).toBeLessThanOrEqual(preview.maxShieldDamage);
      expect(event.hullDamage).toBeGreaterThanOrEqual(preview.minHullDamage);
      expect(event.hullDamage).toBeLessThanOrEqual(preview.maxHullDamage);
    }
  });

  it('rejects attacks without enough energy before mutating state', () => {
    let state = createCombatState(3);
    const attacker = state.ships['p-cruiser'];
    const target = state.ships['e-cruiser'];
    state = replaceShip(state, { ...attacker, energy: 0 });
    state = replaceShip(state, {
      ...target,
      position: { x: attacker.position.x, y: attacker.position.y - 300 },
    });
    const result = executeCommand(state, {
      type: 'attack',
      shipId: attacker.id,
      targetId: target.id,
      weapon: 'lance',
    });

    expect(result.error).toBe('Not enough Energy.');
    expect(result.state).toBe(state);
  });

  it('resets only the incoming team and increments the turn after the enemy phase', () => {
    let state = createCombatState(4);
    const player = state.ships['p-cruiser'];
    state = replaceShip(state, { ...player, ap: 0, energy: 10 });
    state = executeCommand(state, { type: 'end-turn' }).state;

    expect(state.phase).toBe('enemy');
    expect(state.turn).toBe(1);
    expect(state.ships[player.id].ap).toBe(0);

    state = executeCommand(state, { type: 'end-turn' }).state;
    expect(state.phase).toBe('player');
    expect(state.turn).toBe(2);
    expect(state.ships[player.id].ap).toBe(player.maxAp);
    expect(state.ships[player.id].energy).toBe(26);
  });

  it('runs enemy commands through the same validated engine', () => {
    const initial = executeCommand(createCombatState(9), { type: 'end-turn' }).state;
    const result = executeEnemyPhase(initial);

    expect(result.state.phase).toBe('player');
    expect(result.state.turn).toBe(2);
    expect(result.commands.at(-1)).toEqual({ type: 'end-turn' });
    for (const ship of Object.values(result.state.ships)) {
      expect(ship.energy).toBeGreaterThanOrEqual(0);
    }
  });

  it('resolves torpedoes without a hidden miss or interception roll', () => {
    let state = createCombatState(12);
    const attacker = state.ships['p-frigate'];
    state = replaceShip(state, {
      ...state.ships['e-destroyer'],
      position: { x: attacker.position.x, y: attacker.position.y - 360 },
    });
    const result = resolveCommandBeat(
      state,
      [{ type: 'attack', shipId: attacker.id, targetId: 'e-destroyer', weapon: 'torpedo' }],
      [],
    );
    const attack = result.events.find((event) => event.type === 'attack-resolved');

    expect(attack?.type).toBe('attack-resolved');
    if (attack?.type === 'attack-resolved') {
      expect(attack.hit).toBe(true);
      expect(attack.intercepted).toBe(false);
      expect(attack.shieldDamage + attack.hullDamage).toBeGreaterThan(0);
    }
  });

  it('advances a full formation with forced drift after every command beat', () => {
    const state = createCombatState(13);
    const before = state.ships['p-cruiser'].position;
    const result = resolveCommandBeat(state, [], []);
    const after = result.state.ships['p-cruiser'].position;

    expect(result.state.turn).toBe(2);
    expect(after.x).toBeCloseTo(before.x, 5);
    expect(after.y).toBeCloseTo(before.y - COMMAND_DRIFT_DISTANCE, 5);
    expect(result.events.filter((event) => event.type === 'ship-moved' && event.movementKind === 'drift')).toHaveLength(4);
  });

  it('lets a telegraphed shot fail when a maneuver breaks its firing arc', () => {
    let state = createCombatState(14, 'p-frigate');
    state = replaceShip(state, {
      ...state.ships['e-destroyer'],
      position: { x: 400, y: 400 },
      facing: Math.PI / 2,
    });
    state = replaceShip(state, {
      ...state.ships['p-frigate'],
      position: { x: 400, y: 700 },
    });
    const result = resolveCommandBeat(
      state,
      [{ type: 'move', shipId: 'p-frigate', destination: { x: 400, y: 385 }, facing: -Math.PI / 2 }],
      [{ type: 'attack', shipId: 'e-destroyer', targetId: 'p-frigate', weapon: 'torpedo' }],
    );

    expect(result.events.some((event) => event.type === 'order-failed' && event.shipId === 'e-destroyer')).toBe(true);
    expect(result.events.some((event) => event.type === 'attack-resolved' && event.shipId === 'e-destroyer')).toBe(false);
  });

  it('shows and applies the nebula damage reduction in the deterministic preview', () => {
    let state = createCombatState(15);
    const attacker = state.ships['p-cruiser'];
    state = replaceShip(state, { ...attacker, position: { x: NEBULA_CENTER.x, y: NEBULA_CENTER.y + 300 } });
    state = replaceShip(state, { ...state.ships['e-cruiser'], position: { ...NEBULA_CENTER } });
    const covered = getAttackPreview(state, 'p-cruiser', 'e-cruiser', 'lance');
    state = replaceShip(state, { ...state.ships['e-cruiser'], position: { x: NEBULA_CENTER.x, y: NEBULA_CENTER.y - 250 } });
    const exposed = getAttackPreview(state, 'p-cruiser', 'e-cruiser', 'lance');

    expect(covered.valid).toBe(true);
    expect(covered.coverReduction).toBe(25);
    expect(exposed.coverReduction).toBe(0);
    expect(covered.minShieldDamage).toBeLessThan(exposed.minShieldDamage);
  });
});
