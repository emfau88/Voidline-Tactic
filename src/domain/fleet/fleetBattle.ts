import { createCombatState, stepCombat } from '../combat/combatEngine';
import { distance } from '../combat/math';
import type { CombatEvent, ShipState, StarterModuleId, Team, UpgradeId } from '../combat/types';
import { assignFleetLane, deployFleetShip, setFleetStance } from './fleetCommands';
import { lanePointAt } from './lanes';
import { planFleetNavigation } from './navigation';
import { chooseStrategicLane } from './tacticalAi';
import type { DeployKind, FleetBattleState, FleetEvent, FleetObjectiveState, FleetStepResult, LaneId } from './types';

const NAVIGATION_THINK_MS = 520;
const STRATEGIC_THINK_MS = 1_600;
const MAX_SUPPLY = 100;
const BASE_SUPPLY_PER_SECOND = 1.8;

function positionShip(ship: ShipState, laneId: LaneId, progress: number, command = false): ShipState {
  const maxHull = command ? Math.round(ship.maxHull * 18) : ship.maxHull;
  const maxShield = command ? Math.round(ship.maxShield * 10) : ship.maxShield;
  return {
    ...ship,
    navigationZone: laneId,
    maxHull,
    hull: maxHull,
    maxShield,
    shield: maxShield,
    position: lanePointAt(laneId, progress),
    startPosition: lanePointAt(laneId, progress),
    facing: ship.team === 'player' ? 0 : Math.PI,
    startFacing: ship.team === 'player' ? 0 : Math.PI,
    desiredHeading: ship.team === 'player' ? 0 : Math.PI,
    speed: ship.maxSpeed * 0.55,
    course: [],
    targetId: undefined,
    aiThinkMs: 0,
  };
}

export function createFleetBattleState(
  commandShipId = 'p-cruiser',
  upgrades: readonly UpgradeId[] = [],
  starterModuleId?: StarterModuleId,
): FleetBattleState {
  const base = createCombatState(commandShipId, 'mission-2', upgrades, starterModuleId);
  const ships: Record<string, ShipState> = {
    'p-cruiser': positionShip(base.ships['p-cruiser'], 'center', 0.075, commandShipId === 'p-cruiser'),
    'p-frigate': positionShip(base.ships['p-frigate'], 'upper', 0.065, commandShipId === 'p-frigate'),
    'e-cruiser': positionShip(base.ships['e-cruiser'], 'center', 0.925, true),
    'e-destroyer': positionShip(base.ships['e-destroyer'], 'lower', 0.935),
  };
  const relayPosition = lanePointAt('upper', 0.5);
  const shipyardPosition = lanePointAt('lower', 0.62);
  return {
    ...base,
    controlMode: 'fleet',
    ships,
    objective: {
      kind: 'eliminate',
      label: 'Gegnerisches Command Ship zerstören',
      radius: 0,
      captureProgress: 0,
      spawnCooldownMs: 0,
    },
    fleet: {
      directives: {
        'p-cruiser': { laneId: 'center', stance: 'advance' },
        'p-frigate': { laneId: 'upper', stance: 'advance' },
        'e-cruiser': { laneId: 'center', stance: 'broadside' },
        'e-destroyer': { laneId: 'lower', stance: 'keep-range' },
      },
      objectives: {
        'upper-relay': {
          id: 'upper-relay', kind: 'relay', name: 'Aster Relay', laneId: 'upper', position: relayPosition,
          radius: 145, captureProgress: 0,
        },
        'lower-shipyard': {
          id: 'lower-shipyard', kind: 'shipyard', name: 'Drift Shipyard', laneId: 'lower', position: shipyardPosition,
          radius: 165, captureProgress: 0,
        },
      },
      supply: { player: 45, enemy: 45 },
      deploymentCooldownMs: { player: 0, enemy: 0 },
      nextDeploymentId: 1,
      navigationThinkMs: 0,
      strategicThinkMs: 900,
      commandShipIds: { player: commandShipId, enemy: 'e-cruiser' },
    },
  };
}

function teamSupplyRate(state: FleetBattleState, team: Team): number {
  const relay = state.fleet.objectives['upper-relay'].owner === team ? 0.75 : 0;
  const shipyard = state.fleet.objectives['lower-shipyard'].owner === team ? 0.55 : 0;
  return BASE_SUPPLY_PER_SECOND + relay + shipyard;
}

function tickFleetEconomy(state: FleetBattleState, deltaMs: number): FleetBattleState {
  const shipyardOwner = state.fleet.objectives['lower-shipyard'].owner;
  const cooldown = (team: Team): number => Math.max(
    0,
    state.fleet.deploymentCooldownMs[team] - deltaMs * (shipyardOwner === team ? 1.45 : 1),
  );
  return {
    ...state,
    fleet: {
      ...state.fleet,
      supply: {
        player: Math.min(MAX_SUPPLY, state.fleet.supply.player + teamSupplyRate(state, 'player') * deltaMs / 1_000),
        enemy: Math.min(MAX_SUPPLY, state.fleet.supply.enemy + teamSupplyRate(state, 'enemy') * deltaMs / 1_000),
      },
      deploymentCooldownMs: { player: cooldown('player'), enemy: cooldown('enemy') },
      navigationThinkMs: state.fleet.navigationThinkMs - deltaMs,
      strategicThinkMs: state.fleet.strategicThinkMs - deltaMs,
    },
  };
}

function tickFleetObjectives(state: FleetBattleState, deltaMs: number, events: FleetEvent[]): FleetBattleState {
  const objectives = { ...state.fleet.objectives };
  for (const objective of Object.values(objectives)) {
    const inside = Object.values(state.ships).filter((ship) => ship.alive && distance(ship.position, objective.position) <= objective.radius);
    const players = inside.filter((ship) => ship.team === 'player').length;
    const enemies = inside.filter((ship) => ship.team === 'enemy').length;
    let progress = objective.captureProgress;
    const delta = deltaMs / 8_000;
    if (players > 0 && enemies === 0) progress = Math.min(1, progress + delta * Math.min(2, players));
    if (enemies > 0 && players === 0) progress = Math.max(-1, progress - delta * Math.min(2, enemies));
    let owner = objective.owner;
    if (progress >= 1) owner = 'player';
    else if (progress <= -1) owner = 'enemy';
    else if (owner === 'player' && progress <= 0) owner = undefined;
    else if (owner === 'enemy' && progress >= 0) owner = undefined;
    if (owner && owner !== objective.owner) events.push({ type: 'fleet-objective-captured', objectiveId: objective.id, team: owner });
    objectives[objective.id] = { ...objective, captureProgress: progress, owner } as FleetObjectiveState;
  }
  return { ...state, fleet: { ...state.fleet, objectives } };
}

function applyEnemyStrategy(state: FleetBattleState, events: (CombatEvent | FleetEvent)[]): FleetBattleState {
  let next = state;
  const commandId = state.fleet.commandShipIds.enemy;
  const command = state.ships[commandId];
  if (command?.alive) {
    const damaged = command.hull / command.maxHull < 0.28;
    const stance = damaged ? 'retreat' : 'broadside';
    const result = setFleetStance(next, command.id, stance);
    next = result.state;
    events.push(...result.events);
  }
  const lane = chooseStrategicLane(next, 'enemy');
  for (const ship of Object.values(next.ships).filter((candidate) => candidate.alive && candidate.team === 'enemy' && candidate.id !== commandId)) {
    const laneResult = assignFleetLane(next, ship.id, lane);
    next = laneResult.state;
    events.push(...laneResult.events);
    const stanceResult = setFleetStance(next, ship.id, ship.hull / ship.maxHull < 0.24 ? 'retreat' : ship.class === 'destroyer' ? 'keep-range' : 'advance');
    next = stanceResult.state;
    events.push(...stanceResult.events);
  }
  const deployKind: DeployKind = next.fleet.supply.enemy >= 55 ? 'destroyer' : 'frigate';
  const deployment = deployFleetShip(next, 'enemy', deployKind, lane);
  if (!deployment.error) {
    next = deployment.state;
    events.push(...deployment.events);
  }
  return { ...next, fleet: { ...next.fleet, strategicThinkMs: STRATEGIC_THINK_MS } };
}

function resolveCommandShipVictory(state: FleetBattleState, events: CombatEvent[]): FleetBattleState {
  const playerCommand = state.ships[state.fleet.commandShipIds.player];
  const enemyCommand = state.ships[state.fleet.commandShipIds.enemy];
  if (playerCommand?.alive && enemyCommand?.alive) return state;
  const status = playerCommand?.alive ? 'player-won' : 'enemy-won';
  if (!events.some((event) => event.type === 'combat-ended')) events.push({ type: 'combat-ended', status });
  return { ...state, status };
}

export function stepFleetBattle(initialState: FleetBattleState, deltaMs: number): FleetStepResult {
  if (initialState.status !== 'active' || deltaMs <= 0) return { state: initialState, events: [] };
  const events: (CombatEvent | FleetEvent)[] = [];
  let state = tickFleetEconomy(initialState, deltaMs);
  if (state.fleet.strategicThinkMs <= 0) state = applyEnemyStrategy(state, events);
  if (state.fleet.navigationThinkMs <= 0) {
    state = planFleetNavigation(state);
    state = { ...state, fleet: { ...state.fleet, navigationThinkMs: NAVIGATION_THINK_MS } };
  }
  const combat = stepCombat(state, deltaMs);
  state = combat.state as FleetBattleState;
  events.push(...combat.events);
  state = tickFleetObjectives(state, deltaMs, events as FleetEvent[]);
  state = resolveCommandShipVictory(state, events as CombatEvent[]);
  return { state, events };
}
