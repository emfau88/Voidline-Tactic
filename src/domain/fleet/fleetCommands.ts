import { createShipState } from '../combat/combatEngine';
import { SHIPS } from '../combat/content';
import type { ShipDefinition, Team } from '../combat/types';
import { lanePointWithOffset, nearestLane } from './lanes';
import type { DeployKind, FleetBattleState, FleetCommandResult, FleetStance, LaneId } from './types';

export const DEPLOY_COSTS: Readonly<Record<DeployKind, number>> = { frigate: 30, destroyer: 55 };
export const MAX_LIVING_SHIPS_PER_TEAM = 7;

export function setFleetStance(state: FleetBattleState, shipId: string, stance: FleetStance): FleetCommandResult {
  const ship = state.ships[shipId];
  const directive = state.fleet.directives[shipId];
  if (!ship?.alive || !directive) return { state, events: [], error: 'Ship is unavailable.' };
  const nextDirective = {
    ...directive,
    stance,
    holdPosition: stance === 'hold' ? { ...ship.position } : directive.holdPosition,
  };
  return {
    state: {
      ...state,
      fleet: { ...state.fleet, directives: { ...state.fleet.directives, [shipId]: nextDirective }, navigationThinkMs: 0 },
    },
    events: [{ type: 'fleet-stance-changed', shipId, stance }],
  };
}

export function assignFleetLane(state: FleetBattleState, shipId: string, laneId: LaneId): FleetCommandResult {
  const ship = state.ships[shipId];
  const directive = state.fleet.directives[shipId];
  if (!ship?.alive || !directive) return { state, events: [], error: 'Ship is unavailable.' };
  if (directive.laneId === laneId) return { state, events: [] };
  const previousLaneId = nearestLane(ship.position);
  return {
    state: {
      ...state,
      fleet: {
        ...state.fleet,
        directives: {
          ...state.fleet.directives,
          [shipId]: { ...directive, laneId, previousLaneId, holdPosition: undefined },
        },
        navigationThinkMs: 0,
      },
    },
    events: [{ type: 'fleet-lane-changed', shipId, laneId }],
  };
}

export function setFleetFocus(state: FleetBattleState, shipId: string, targetId: string): FleetCommandResult {
  const ship = state.ships[shipId];
  const target = state.ships[targetId];
  const directive = state.fleet.directives[shipId];
  if (!ship?.alive || !target?.alive || target.team === ship.team || !directive) {
    return { state, events: [], error: 'Designate a living enemy target.' };
  }
  return {
    state: {
      ...state,
      ships: { ...state.ships, [shipId]: { ...ship, targetId } },
      fleet: {
        ...state.fleet,
        directives: { ...state.fleet.directives, [shipId]: { ...directive, focusTargetId: targetId } },
        navigationThinkMs: 0,
      },
    },
    events: [{ type: 'fleet-focus-changed', shipId, targetId }],
  };
}

function deploymentDefinition(state: FleetBattleState, team: Team, kind: DeployKind, laneId: LaneId): ShipDefinition {
  const friendly = team === 'player';
  const base = SHIPS.find((ship) => ship.id === (friendly ? 'p-frigate' : 'e-destroyer'))!;
  const index = state.fleet.nextDeploymentId;
  const id = `${friendly ? 'p' : 'e'}-${kind}-${index}`;
  const startPosition = lanePointWithOffset(laneId, friendly ? 0.035 : 0.965, index % 2 === 0 ? -48 : 48);
  if (kind === 'frigate') {
    return {
      ...base,
      id,
      team,
      name: friendly ? `Voidwing ${index}` : `Cinder Wing ${index}`,
      presentationId: friendly ? 'p-frigate' : 'e-destroyer',
      class: 'frigate',
      maxHull: 56,
      maxShield: 28,
      maxEnergy: 58,
      maxSpeed: 90,
      acceleration: 42,
      radius: 30,
      weapons: ['lance', 'torpedo'],
      startPosition,
      startFacing: friendly ? 0 : Math.PI,
    };
  }
  return {
    ...base,
    id,
    team,
    name: friendly ? `Aegis Spear ${index}` : `Ash Spear ${index}`,
    presentationId: friendly ? 'p-frigate' : 'e-destroyer',
    class: 'destroyer',
    maxHull: 82,
    maxShield: 42,
    maxEnergy: 72,
    maxSpeed: 72,
    acceleration: 32,
    radius: 37,
    weapons: ['broadside', 'torpedo'],
    startPosition,
    startFacing: friendly ? 0 : Math.PI,
  };
}

export function deployFleetShip(state: FleetBattleState, team: Team, kind: DeployKind, laneId: LaneId): FleetCommandResult {
  const cost = DEPLOY_COSTS[kind];
  if (state.fleet.supply[team] < cost) return { state, events: [], error: 'Not enough Supply.' };
  if (state.fleet.deploymentCooldownMs[team] > 0) return { state, events: [], error: 'Deployment is cooling down.' };
  const living = Object.values(state.ships).filter((ship) => ship.alive && ship.team === team).length;
  if (living >= MAX_LIVING_SHIPS_PER_TEAM) return { state, events: [], error: 'Fleet capacity reached.' };
  const definition = deploymentDefinition(state, team, kind, laneId);
  const ship = { ...createShipState(definition, state.fleet.commandShipIds[team], state.upgrades), navigationZone: laneId };
  return {
    state: {
      ...state,
      ships: { ...state.ships, [ship.id]: ship },
      fleet: {
        ...state.fleet,
        supply: { ...state.fleet.supply, [team]: state.fleet.supply[team] - cost },
        deploymentCooldownMs: { ...state.fleet.deploymentCooldownMs, [team]: 4_500 },
        nextDeploymentId: state.fleet.nextDeploymentId + 1,
        navigationThinkMs: 0,
        directives: {
          ...state.fleet.directives,
          [ship.id]: { laneId, stance: kind === 'destroyer' ? 'keep-range' : 'advance' },
        },
      },
    },
    events: [{ type: 'fleet-deployed', shipId: ship.id, team, laneId, shipClass: ship.class }],
  };
}
