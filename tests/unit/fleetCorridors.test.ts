import { describe, expect, it } from 'vitest';
import { angleBetween, angleDifference, distance } from '../../src/domain/combat/math';
import { assignFleetLane, deployFleetShip, setFleetFocus, setFleetStance } from '../../src/domain/fleet/fleetCommands';
import { createFleetBattleState, stepFleetBattle } from '../../src/domain/fleet/fleetBattle';
import { laneDistance, lanePointAt } from '../../src/domain/fleet/lanes';
import { planFleetNavigation } from '../../src/domain/fleet/navigation';
import { chooseFleetTarget } from '../../src/domain/fleet/tacticalAi';
import type { FleetBattleState } from '../../src/domain/fleet/types';

function advance(state: FleetBattleState, durationMs: number, stepMs = 100): FleetBattleState {
  let next = state;
  for (let elapsed = 0; elapsed < durationMs && next.status === 'active'; elapsed += stepMs) {
    next = stepFleetBattle(next, Math.min(stepMs, durationMs - elapsed)).state;
  }
  return next;
}

describe('Fleet Corridors domain', () => {
  it('creates the focused two-versus-two proof-of-concept fleet', () => {
    const state = createFleetBattleState();
    expect(Object.values(state.ships).filter((ship) => ship.team === 'player')).toHaveLength(2);
    expect(Object.values(state.ships).filter((ship) => ship.team === 'enemy')).toHaveLength(2);
    expect(state.fleet.commandShipIds).toEqual({ player: 'p-cruiser', enemy: 'e-cruiser' });
    expect(state.fleet.directives['p-frigate'].laneId).toBe('upper');
    expect(state.fleet.objectives['upper-relay'].laneId).toBe('upper');
    expect(state.fleet.objectives['lower-shipyard'].laneId).toBe('lower');
  });

  it('routes a lane switch through a junction instead of snapping across corridors', () => {
    let state = createFleetBattleState();
    state = assignFleetLane(state, 'p-frigate', 'lower').state;
    state = planFleetNavigation(state);
    const course = state.ships['p-frigate'].course;
    expect(course.length).toBeGreaterThanOrEqual(3);
    expect(laneDistance(course[0], 'upper')).toBeLessThan(5);
    expect(laneDistance(course[1], 'lower')).toBeLessThan(5);
    expect(state.fleet.directives['p-frigate'].previousLaneId).toBe('upper');
  });

  it('implements advance, hold and retreat as materially different intentions', () => {
    const initial = createFleetBattleState();
    const cruiser = initial.ships['p-cruiser'];
    const advanceState = planFleetNavigation(initial);
    expect(advanceState.ships[cruiser.id].course.at(-1)!.x).toBeGreaterThan(cruiser.position.x);

    let held = setFleetStance(initial, cruiser.id, 'hold').state;
    held = planFleetNavigation(held);
    expect(distance(held.ships[cruiser.id].course.at(-1)!, cruiser.position)).toBeLessThan(2);

    let retreat = setFleetStance(initial, cruiser.id, 'retreat').state;
    retreat = planFleetNavigation(retreat);
    expect(retreat.ships[cruiser.id].course.at(-1)!.x).toBeLessThan(cruiser.position.x);
  });

  it('creates a broadside tangent instead of steering directly at the focus target', () => {
    let state = createFleetBattleState();
    state = setFleetFocus(state, 'p-cruiser', 'e-cruiser').state;
    state = setFleetStance(state, 'p-cruiser', 'broadside').state;
    state = planFleetNavigation(state);
    const ship = state.ships['p-cruiser'];
    const target = state.ships['e-cruiser'];
    const travelAngle = angleBetween(ship.position, ship.course.at(-1)!);
    const targetAngle = angleBetween(ship.position, target.position);
    expect(angleDifference(travelAngle, targetAngle)).toBeCloseTo(Math.PI / 2, 3);
  });

  it('lets keep-range back away from a target that is too close', () => {
    let state = createFleetBattleState();
    const ship = state.ships['p-frigate'];
    const target = state.ships['e-destroyer'];
    state = {
      ...state,
      ships: {
        ...state.ships,
        [ship.id]: { ...ship, position: { x: 1_100, y: 1_030 } },
        [target.id]: { ...target, position: { x: 1_300, y: 1_040 } },
      },
    };
    state = setFleetFocus(state, ship.id, target.id).state;
    state = setFleetStance(state, ship.id, 'keep-range').state;
    state = planFleetNavigation(state);
    const destination = state.ships[ship.id].course.at(-1)!;
    expect(distance(destination, state.ships[target.id].position)).toBeGreaterThan(800);
  });

  it('captures the upper relay and increases supply regeneration', () => {
    let state = createFleetBattleState();
    const relay = state.fleet.objectives['upper-relay'];
    const frigate = state.ships['p-frigate'];
    state = {
      ...state,
      ships: { ...state.ships, [frigate.id]: { ...frigate, position: relay.position, speed: 0, maxSpeed: 0 } },
      fleet: {
        ...state.fleet,
        strategicThinkMs: 99_000,
        directives: {
          ...state.fleet.directives,
          [frigate.id]: { laneId: 'upper', stance: 'hold', holdPosition: relay.position },
        },
      },
    };
    state = advance(state, 8_200);
    expect(state.fleet.objectives['upper-relay'].owner).toBe('player');
    const supplyBefore = state.fleet.supply.player;
    state = advance(state, 4_000);
    expect(state.fleet.supply.player - supplyBefore).toBeGreaterThan(9);
  });

  it('spends one supply resource to deploy a lane-assigned reinforcement', () => {
    const initial = createFleetBattleState();
    const result = deployFleetShip(initial, 'player', 'frigate', 'lower');
    expect(result.error).toBeUndefined();
    expect(result.state.fleet.supply.player).toBe(15);
    expect(Object.values(result.state.ships).filter((ship) => ship.team === 'player')).toHaveLength(3);
    const deployed = Object.values(result.state.ships).find((ship) => ship.id.startsWith('p-frigate-'))!;
    expect(result.state.fleet.directives[deployed.id].laneId).toBe('lower');
  });

  it('uses class-aware target priority for destroyers', () => {
    const state = createFleetBattleState();
    expect(chooseFleetTarget(state, state.ships['e-destroyer'])?.id).toBe('p-cruiser');
  });

  it('responds to a lost relay by redirecting enemy pressure to upper', () => {
    let state = createFleetBattleState();
    state = {
      ...state,
      fleet: {
        ...state.fleet,
        strategicThinkMs: 0,
        objectives: {
          ...state.fleet.objectives,
          'upper-relay': { ...state.fleet.objectives['upper-relay'], owner: 'player', captureProgress: 1 },
        },
      },
    };
    state = stepFleetBattle(state, 100).state;
    expect(state.fleet.directives['e-destroyer'].laneId).toBe('upper');
  });

  it('ends the match when a command ship is destroyed even if escorts survive', () => {
    let state = createFleetBattleState();
    state = {
      ...state,
      ships: { ...state.ships, 'e-cruiser': { ...state.ships['e-cruiser'], alive: false, hull: 0 } },
    };
    state = stepFleetBattle(state, 100).state;
    expect(state.status).toBe('player-won');
    expect(state.ships['e-destroyer'].alive).toBe(true);
  });

  it('keeps corridor-local positions inside the battlefield', () => {
    const state = advance(createFleetBattleState(), 30_000);
    for (const ship of Object.values(state.ships).filter((candidate) => candidate.alive)) {
      expect(ship.position.x).toBeGreaterThan(70);
      expect(ship.position.x).toBeLessThan(3_530);
      expect(ship.position.y).toBeGreaterThan(70);
      expect(ship.position.y).toBeLessThan(1_930);
      const directive = state.fleet.directives[ship.id];
      if (directive) {
        const corridorDistance = Math.min(
          laneDistance(ship.position, directive.laneId),
          directive.previousLaneId ? laneDistance(ship.position, directive.previousLaneId) : Number.POSITIVE_INFINITY,
        );
        expect(corridorDistance, `${ship.id} assigned ${directive.laneId} at ${JSON.stringify(ship.position)}`).toBeLessThan(520);
      }
    }
  });
});
