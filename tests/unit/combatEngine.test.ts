import { describe, expect, it } from 'vitest';
import { executeEnemyPhase } from '../../src/domain/combat/ai';
import { createCombatState, executeCommand, getAttackPreview } from '../../src/domain/combat/combatEngine';
import type { CombatState, ShipState } from '../../src/domain/combat/types';

function replaceShip(state: CombatState, ship: ShipState): CombatState {
  return { ...state, ships: { ...state.ships, [ship.id]: ship } };
}

describe('combat engine', () => {
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
});
