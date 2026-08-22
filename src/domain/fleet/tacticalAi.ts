import { distance } from '../combat/math';
import type { ShipState, Team } from '../combat/types';
import { nearestLane } from './lanes';
import type { FleetBattleState, LaneId } from './types';

function healthRatio(ship: ShipState): number {
  return (ship.hull + ship.shield) / Math.max(1, ship.maxHull + ship.maxShield);
}

export function chooseFleetTarget(state: FleetBattleState, ship: ShipState): ShipState | undefined {
  const directive = state.fleet.directives[ship.id];
  const focused = directive?.focusTargetId ? state.ships[directive.focusTargetId] : undefined;
  if (focused?.alive && focused.team !== ship.team) return focused;
  const shipLane = directive?.laneId ?? nearestLane(ship.position);
  const enemyCommandId = state.fleet.commandShipIds[ship.team === 'player' ? 'enemy' : 'player'];
  return Object.values(state.ships)
    .filter((candidate) => candidate.alive && candidate.team !== ship.team)
    .map((candidate) => {
      const candidateLane = state.fleet.directives[candidate.id]?.laneId ?? nearestLane(candidate.position);
      let score = distance(ship.position, candidate.position) / 45;
      if (candidateLane === shipLane) score -= 32;
      if (candidate.id === enemyCommandId) score -= 12;
      if (ship.class === 'frigate') score -= (1 - healthRatio(candidate)) * 28 + (candidate.class === 'frigate' ? 8 : 0);
      if (ship.class === 'destroyer' && candidate.class === 'cruiser') score -= 24;
      if (ship.class === 'cruiser' && candidate.class === 'cruiser') score -= 15;
      return { candidate, score };
    })
    .sort((left, right) => left.score - right.score)[0]?.candidate;
}

function laneCount(state: FleetBattleState, laneId: LaneId, team: Team): number {
  return Object.values(state.ships).filter((ship) => (
    ship.alive
    && ship.team === team
    && (state.fleet.directives[ship.id]?.laneId ?? nearestLane(ship.position)) === laneId
  )).length;
}

export function chooseStrategicLane(state: FleetBattleState, team: Team): LaneId {
  const enemy: Team = team === 'player' ? 'enemy' : 'player';
  if (state.fleet.objectives['upper-relay'].owner === enemy) return 'upper';
  if (state.fleet.objectives['lower-shipyard'].owner === enemy) return 'lower';
  const scored: readonly { laneId: LaneId; score: number }[] = (['upper', 'center', 'lower'] as const).map((laneId) => ({
    laneId,
    score: laneCount(state, laneId, enemy) - laneCount(state, laneId, team)
      + (laneId === 'center' ? 0.25 : 0)
      + (laneId === 'upper' && !state.fleet.objectives['upper-relay'].owner ? 0.4 : 0)
      + (laneId === 'lower' && !state.fleet.objectives['lower-shipyard'].owner ? 0.35 : 0),
  }));
  return [...scored].sort((left, right) => right.score - left.score)[0].laneId;
}

