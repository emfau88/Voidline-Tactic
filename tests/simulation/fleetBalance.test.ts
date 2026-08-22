import { describe, expect, it } from 'vitest';
import { activateAbility } from '../../src/domain/combat/combatEngine';
import { assignFleetLane, deployFleetShip, setFleetFocus, setFleetStance } from '../../src/domain/fleet/fleetCommands';
import { createFleetBattleState, stepFleetBattle } from '../../src/domain/fleet/fleetBattle';
import type { FleetBattleState, FleetEvent, FleetStance, LaneId } from '../../src/domain/fleet/types';

type Strategy = 'center-push' | 'upper-relay' | 'lower-shipyard';

interface MatchMetrics {
  readonly strategy: Strategy;
  readonly durationMs: number;
  readonly winner: FleetBattleState['status'];
  readonly firstDestructionMs?: number;
  readonly captures: number;
  readonly deployments: number;
  readonly abilities: number;
  readonly peakShips: number;
}

function configureStrategy(state: FleetBattleState, strategy: Strategy): FleetBattleState {
  const lane: LaneId = strategy === 'center-push' ? 'center' : strategy === 'upper-relay' ? 'upper' : 'lower';
  let next = state;
  for (const ship of Object.values(next.ships).filter((candidate) => candidate.team === 'player')) {
    next = assignFleetLane(next, ship.id, lane).state;
    const stance: FleetStance = strategy === 'center-push'
      ? (ship.class === 'cruiser' ? 'broadside' : 'advance')
      : ship.class === 'cruiser'
        ? 'keep-range'
        : 'advance';
    next = setFleetStance(next, ship.id, stance).state;
  }
  return next;
}

function drivePlayer(state: FleetBattleState, strategy: Strategy, elapsedMs: number): { state: FleetBattleState; abilities: number; deployments: number } {
  let next = state;
  let abilities = 0;
  let deployments = 0;
  const lane: LaneId = strategy === 'center-push' ? 'center' : strategy === 'upper-relay' ? 'upper' : 'lower';
  const activeLane: LaneId = elapsedMs >= 105_000 ? 'center' : lane;
  if (elapsedMs === 105_000) {
    for (const ship of Object.values(next.ships).filter((candidate) => candidate.alive && candidate.team === 'player')) {
      next = assignFleetLane(next, ship.id, 'center').state;
      next = setFleetStance(next, ship.id, ship.class === 'cruiser' ? 'broadside' : 'advance').state;
    }
  }
  const enemies = Object.values(next.ships).filter((ship) => ship.alive && ship.team === 'enemy');
  for (const ship of Object.values(next.ships).filter((candidate) => candidate.alive && candidate.team === 'player')) {
    const commandTarget = next.ships[next.fleet.commandShipIds.enemy];
    const target = commandTarget?.alive ? commandTarget : enemies[0];
    if (target && elapsedMs % 4_000 === 0) next = setFleetFocus(next, ship.id, target.id).state;
    if (ship.shield < ship.maxShield * 0.45) {
      const result = activateAbility(next, ship.id, 'shield');
      if (!result.error) {
        next = result.state as FleetBattleState;
        abilities += 1;
      }
    }
    for (const ability of ['torpedo', 'lance'] as const) {
      const result = activateAbility(next, ship.id, ability);
      if (!result.error) {
        next = result.state as FleetBattleState;
        abilities += 1;
        break;
      }
    }
  }
  if (elapsedMs >= 12_000 && next.fleet.deploymentCooldownMs.player <= 0) {
    const kind = next.fleet.supply.player >= 55 && elapsedMs % 24_000 === 0 ? 'destroyer' : 'frigate';
    const result = deployFleetShip(next, 'player', kind, activeLane);
    if (!result.error) {
      next = result.state;
      deployments += 1;
    }
  }
  return { state: next, abilities, deployments };
}

function runMatch(strategy: Strategy, variant: number): MatchMetrics {
  let state = configureStrategy(createFleetBattleState(variant % 2 === 0 ? 'p-cruiser' : 'p-frigate'), strategy);
  const stepMs = 200;
  const limitMs = 420_000;
  let firstDestructionMs: number | undefined;
  let captures = 0;
  let deployments = 0;
  let abilities = 0;
  let peakShips = 4;
  for (let elapsed = 0; elapsed < limitMs && state.status === 'active'; elapsed += stepMs) {
    if (elapsed % 1_000 === 0) {
      const driven = drivePlayer(state, strategy, elapsed);
      state = driven.state;
      abilities += driven.abilities;
      deployments += driven.deployments;
    }
    const result = stepFleetBattle(state, stepMs);
    state = result.state;
    if (!firstDestructionMs && result.events.some((event) => event.type === 'ship-destroyed')) firstDestructionMs = state.elapsedMs;
    captures += result.events.filter((event): event is FleetEvent => event.type === 'fleet-objective-captured').length;
    deployments += result.events.filter((event): event is FleetEvent => event.type === 'fleet-deployed' && event.team === 'enemy').length;
    peakShips = Math.max(peakShips, Object.values(state.ships).filter((ship) => ship.alive).length);
  }
  return {
    strategy,
    durationMs: Math.min(state.elapsedMs, limitMs),
    winner: state.status,
    firstDestructionMs,
    captures,
    deployments,
    abilities,
    peakShips,
  };
}

function percentile(values: readonly number[], ratio: number): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
}

describe('Fleet Corridors headless balance batch', () => {
  it('simulates 100 matches and keeps the prototype inside its guardrails', () => {
    const strategies: readonly Strategy[] = ['center-push', 'upper-relay', 'lower-shipyard'];
    const matches = Array.from({ length: 100 }, (_, index) => runMatch(strategies[index % strategies.length], index));
    const completed = matches.filter((match) => match.winner !== 'active');
    const durations = completed.map((match) => match.durationMs);
    const summary = {
      matches: matches.length,
      completionRate: completed.length / matches.length,
      medianDurationSeconds: Math.round(percentile(durations, 0.5) / 1_000),
      p90DurationSeconds: Math.round(percentile(durations, 0.9) / 1_000),
      medianFirstDestructionSeconds: Math.round(percentile(matches.map((match) => match.firstDestructionMs ?? 420_000), 0.5) / 1_000),
      playerWinRate: completed.filter((match) => match.winner === 'player-won').length / Math.max(1, completed.length),
      captures: matches.reduce((sum, match) => sum + match.captures, 0),
      deployments: matches.reduce((sum, match) => sum + match.deployments, 0),
      abilities: matches.reduce((sum, match) => sum + match.abilities, 0),
      peakShips: Math.max(...matches.map((match) => match.peakShips)),
      byStrategy: Object.fromEntries(strategies.map((strategy) => {
        const group = matches.filter((match) => match.strategy === strategy);
        return [strategy, {
          completed: group.filter((match) => match.winner !== 'active').length,
          medianSeconds: Math.round(percentile(group.map((match) => match.durationMs), 0.5) / 1_000),
        }];
      })),
    };
    console.log(`FLEET_SIM ${JSON.stringify(summary)}`);
    expect(summary.completionRate).toBeGreaterThanOrEqual(0.9);
    expect(summary.medianDurationSeconds).toBeGreaterThanOrEqual(180);
    expect(summary.medianDurationSeconds).toBeLessThanOrEqual(360);
    expect(summary.p90DurationSeconds).toBeLessThanOrEqual(420);
    expect(summary.captures).toBeGreaterThan(0);
    expect(summary.deployments).toBeGreaterThan(0);
    expect(summary.abilities).toBeGreaterThan(0);
    expect(summary.peakShips).toBeLessThanOrEqual(14);
  });
});
