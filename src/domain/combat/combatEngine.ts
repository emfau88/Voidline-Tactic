import {
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_MARGIN,
  BATTLEFIELD_WIDTH,
  MOVE_AP_COST,
  MOVE_ENERGY_COST,
  ROTATE_AP_COST,
  SHIELD_AP_COST,
  SHIELD_ENERGY_COST,
  SHIELD_RESTORE,
} from './constants';
import { SHIPS, WEAPONS } from './content';
import { angleBetween, angleDifference, clamp, distance, normalizeAngle } from './math';
import { nextRandom, normalizeSeed, randomInteger } from './rng';
import type {
  AttackPreview,
  CombatCommand,
  CombatEvent,
  CombatState,
  CommandResult,
  ShipState,
  Team,
  Vector2,
  WeaponDefinition,
  WeaponKind,
} from './types';

function createShipState(definition: (typeof SHIPS)[number], flagshipId?: string): ShipState {
  const isFlagship = definition.id === flagshipId;
  const maxShield = definition.maxShield + (isFlagship && definition.id === 'p-cruiser' ? 15 : 0);
  const maxEnergy = definition.maxEnergy + (isFlagship && definition.id === 'p-frigate' ? 12 : 0);
  const moveRange = definition.moveRange + (isFlagship && definition.id === 'p-frigate' ? 35 : 0);
  return {
    ...definition,
    maxShield,
    maxEnergy,
    moveRange,
    hull: definition.maxHull,
    shield: maxShield,
    energy: maxEnergy,
    ap: definition.maxAp,
    position: { ...definition.startPosition },
    facing: definition.startFacing,
    alive: true,
  };
}

export function createCombatState(seed = Date.now(), flagshipId?: string): CombatState {
  const ships = Object.fromEntries(SHIPS.map((definition) => [definition.id, createShipState(definition, flagshipId)]));
  return {
    turn: 1,
    phase: 'player',
    status: 'active',
    rngState: normalizeSeed(seed),
    ships,
  };
}

export function getLivingShips(state: CombatState, team?: Team): readonly ShipState[] {
  return Object.values(state.ships).filter((ship) => ship.alive && (!team || ship.team === team));
}

function invalidResult(state: CombatState, error: string): CommandResult {
  return { state, events: [], error };
}

function updateShip(state: CombatState, ship: ShipState): CombatState {
  return { ...state, ships: { ...state.ships, [ship.id]: ship } };
}

function isInsideBattlefield(position: Vector2, radius: number): boolean {
  return (
    position.x - radius >= BATTLEFIELD_MARGIN &&
    position.x + radius <= BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN &&
    position.y - radius >= BATTLEFIELD_MARGIN &&
    position.y + radius <= BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN
  );
}

function getActionShip(state: CombatState, shipId: string): ShipState | string {
  const ship = state.ships[shipId];
  if (!ship) return 'Unknown ship.';
  if (!ship.alive) return 'Destroyed ships cannot act.';
  if (ship.team !== state.phase) return 'That ship cannot act in the current phase.';
  return ship;
}

function getWeapon(ship: ShipState, kind: WeaponKind): WeaponDefinition | string {
  if (!ship.weapons.includes(kind)) return `${ship.name} does not carry that weapon.`;
  return WEAPONS[kind];
}

function isTargetInsideArc(attacker: ShipState, target: ShipState, weapon: WeaponDefinition): boolean {
  const targetAngle = angleBetween(attacker.position, target.position);
  if (weapon.arc === 'front') {
    return angleDifference(targetAngle, attacker.facing) <= weapon.halfAngle;
  }
  const port = attacker.facing - Math.PI / 2;
  const starboard = attacker.facing + Math.PI / 2;
  return (
    angleDifference(targetAngle, port) <= weapon.halfAngle ||
    angleDifference(targetAngle, starboard) <= weapon.halfAngle
  );
}

interface DamageSplit {
  readonly shieldDamage: number;
  readonly hullDamage: number;
}

function splitDamage(target: ShipState, rawDamage: number, weapon: WeaponDefinition): DamageSplit {
  const shieldDamage = Math.min(target.shield, Math.round(rawDamage * weapon.shieldMultiplier));
  const consumedRawDamage = shieldDamage / weapon.shieldMultiplier;
  const remainingRawDamage = Math.max(0, rawDamage - consumedRawDamage);
  const hullDamage = Math.max(0, Math.round(remainingRawDamage * (1 - target.armor)));
  return { shieldDamage, hullDamage };
}

function invalidPreview(weapon: WeaponDefinition, reason: string, measuredDistance = 0): AttackPreview {
  return {
    valid: false,
    reason,
    weapon,
    distance: measuredDistance,
    hitChance: 0,
    minShieldDamage: 0,
    maxShieldDamage: 0,
    minHullDamage: 0,
    maxHullDamage: 0,
  };
}

export function getAttackPreview(
  state: CombatState,
  attackerId: string,
  targetId: string,
  kind: WeaponKind,
): AttackPreview {
  const weapon = WEAPONS[kind];
  const attacker = state.ships[attackerId];
  const target = state.ships[targetId];
  if (!attacker) return invalidPreview(weapon, 'Unknown attacker.');
  if (!target) return invalidPreview(weapon, 'Unknown target.');
  if (!attacker.alive || !target.alive) return invalidPreview(weapon, 'Destroyed ships cannot attack or be targeted.');
  if (attacker.team === target.team) return invalidPreview(weapon, 'Friendly ships cannot be targeted.');
  if (!attacker.weapons.includes(kind)) return invalidPreview(weapon, `${attacker.name} does not carry that weapon.`);

  const measuredDistance = distance(attacker.position, target.position);
  if (measuredDistance > weapon.range) return invalidPreview(weapon, 'Target is outside weapon range.', measuredDistance);
  if (!isTargetInsideArc(attacker, target, weapon)) {
    return invalidPreview(weapon, 'Target is outside the weapon arc.', measuredDistance);
  }
  if (attacker.ap < weapon.apCost) return invalidPreview(weapon, 'Not enough AP.', measuredDistance);
  if (attacker.energy < weapon.energyCost) return invalidPreview(weapon, 'Not enough Energy.', measuredDistance);

  const rangePenalty = Math.floor((measuredDistance / weapon.range) * 18);
  const hitChance = clamp(weapon.accuracy - rangePenalty, 45, 97);
  const minimum = splitDamage(target, weapon.minDamage, weapon);
  const maximum = splitDamage(target, weapon.maxDamage, weapon);
  return {
    valid: true,
    weapon,
    distance: measuredDistance,
    hitChance,
    minShieldDamage: minimum.shieldDamage,
    maxShieldDamage: maximum.shieldDamage,
    minHullDamage: minimum.hullDamage,
    maxHullDamage: maximum.hullDamage,
  };
}

function resolveCombatStatus(state: CombatState, events: CombatEvent[]): CombatState {
  const playersAlive = getLivingShips(state, 'player').length > 0;
  const enemiesAlive = getLivingShips(state, 'enemy').length > 0;
  if (playersAlive && enemiesAlive) return state;
  const status = playersAlive ? 'player-won' : 'enemy-won';
  events.push({ type: 'combat-ended', status });
  return { ...state, status };
}

function executeMove(state: CombatState, command: Extract<CombatCommand, { type: 'move' }>): CommandResult {
  const actionShip = getActionShip(state, command.shipId);
  if (typeof actionShip === 'string') return invalidResult(state, actionShip);
  if (actionShip.ap < MOVE_AP_COST) return invalidResult(state, 'Not enough AP.');
  if (actionShip.energy < MOVE_ENERGY_COST) return invalidResult(state, 'Not enough Energy.');
  if (!isInsideBattlefield(command.destination, actionShip.radius)) return invalidResult(state, 'Destination is outside the battlefield.');
  if (distance(actionShip.position, command.destination) > actionShip.moveRange) {
    return invalidResult(state, 'Destination is outside movement range.');
  }

  const moved: ShipState = {
    ...actionShip,
    position: { ...command.destination },
    facing: normalizeAngle(command.facing),
    ap: actionShip.ap - MOVE_AP_COST,
    energy: actionShip.energy - MOVE_ENERGY_COST,
  };
  return {
    state: updateShip(state, moved),
    events: [
      {
        type: 'ship-moved',
        shipId: moved.id,
        from: actionShip.position,
        to: moved.position,
        facing: moved.facing,
      },
    ],
  };
}

function executeRotate(state: CombatState, command: Extract<CombatCommand, { type: 'rotate' }>): CommandResult {
  const actionShip = getActionShip(state, command.shipId);
  if (typeof actionShip === 'string') return invalidResult(state, actionShip);
  if (actionShip.ap < ROTATE_AP_COST) return invalidResult(state, 'Not enough AP.');
  const rotated: ShipState = {
    ...actionShip,
    facing: normalizeAngle(command.facing),
    ap: actionShip.ap - ROTATE_AP_COST,
  };
  return {
    state: updateShip(state, rotated),
    events: [{ type: 'ship-rotated', shipId: rotated.id, facing: rotated.facing }],
  };
}

function executeAttack(state: CombatState, command: Extract<CombatCommand, { type: 'attack' }>): CommandResult {
  const actionShip = getActionShip(state, command.shipId);
  if (typeof actionShip === 'string') return invalidResult(state, actionShip);
  const weaponResult = getWeapon(actionShip, command.weapon);
  if (typeof weaponResult === 'string') return invalidResult(state, weaponResult);
  const target = state.ships[command.targetId];
  if (!target) return invalidResult(state, 'Unknown target.');
  const preview = getAttackPreview(state, actionShip.id, target.id, command.weapon);
  if (!preview.valid) return invalidResult(state, preview.reason ?? 'Invalid attack.');

  const hitRoll = nextRandom(state.rngState);
  const hit = hitRoll.value * 100 < preview.hitChance;
  const interceptRoll = nextRandom(hitRoll.state);
  const intercepted = command.weapon === 'torpedo' && hit && interceptRoll.value < 0.18;
  const damageRoll = randomInteger(interceptRoll.state, weaponResult.minDamage, weaponResult.maxDamage);

  const attacker: ShipState = {
    ...actionShip,
    ap: actionShip.ap - weaponResult.apCost,
    energy: actionShip.energy - weaponResult.energyCost,
  };
  let nextState = updateShip({ ...state, rngState: damageRoll.state }, attacker);
  const events: CombatEvent[] = [];
  let shieldDamage = 0;
  let hullDamage = 0;

  if (hit && !intercepted) {
    const split = splitDamage(target, damageRoll.value, weaponResult);
    shieldDamage = split.shieldDamage;
    hullDamage = split.hullDamage;
    const remainingHull = Math.max(0, target.hull - hullDamage);
    const damagedTarget: ShipState = {
      ...target,
      shield: Math.max(0, target.shield - shieldDamage),
      hull: remainingHull,
      alive: remainingHull > 0,
    };
    nextState = updateShip(nextState, damagedTarget);
    if (!damagedTarget.alive) events.push({ type: 'ship-destroyed', shipId: damagedTarget.id });
  }

  events.unshift({
    type: 'attack-resolved',
    shipId: attacker.id,
    targetId: target.id,
    weapon: command.weapon,
    hit,
    intercepted,
    shieldDamage,
    hullDamage,
  });
  nextState = resolveCombatStatus(nextState, events);
  return { state: nextState, events };
}

function executeShield(state: CombatState, command: Extract<CombatCommand, { type: 'reinforce-shield' }>): CommandResult {
  const actionShip = getActionShip(state, command.shipId);
  if (typeof actionShip === 'string') return invalidResult(state, actionShip);
  if (actionShip.ap < SHIELD_AP_COST) return invalidResult(state, 'Not enough AP.');
  if (actionShip.energy < SHIELD_ENERGY_COST) return invalidResult(state, 'Not enough Energy.');
  if (actionShip.shield >= actionShip.maxShield) return invalidResult(state, 'Shield is already at maximum strength.');

  const amount = Math.min(SHIELD_RESTORE, actionShip.maxShield - actionShip.shield);
  const reinforced: ShipState = {
    ...actionShip,
    shield: actionShip.shield + amount,
    ap: actionShip.ap - SHIELD_AP_COST,
    energy: actionShip.energy - SHIELD_ENERGY_COST,
  };
  return {
    state: updateShip(state, reinforced),
    events: [{ type: 'shield-reinforced', shipId: reinforced.id, amount }],
  };
}

function beginPhase(state: CombatState, team: Team): CombatState {
  const ships = Object.fromEntries(
    Object.entries(state.ships).map(([id, ship]) => {
      if (!ship.alive || ship.team !== team) return [id, ship];
      return [
        id,
        {
          ...ship,
          ap: ship.maxAp,
          energy: Math.min(ship.maxEnergy, ship.energy + ship.energyRegen),
          shield: Math.min(ship.maxShield, ship.shield + ship.shieldRegen),
        },
      ];
    }),
  );
  return { ...state, ships };
}

function executeEndTurn(state: CombatState): CommandResult {
  if (state.status !== 'active') return invalidResult(state, 'Combat has already ended.');
  const nextPhase: Team = state.phase === 'player' ? 'enemy' : 'player';
  const nextTurn = nextPhase === 'player' ? state.turn + 1 : state.turn;
  const nextState = beginPhase({ ...state, phase: nextPhase, turn: nextTurn }, nextPhase);
  return {
    state: nextState,
    events: [{ type: 'phase-changed', phase: nextPhase, turn: nextTurn }],
  };
}

export function executeCommand(state: CombatState, command: CombatCommand): CommandResult {
  if (state.status !== 'active') return invalidResult(state, 'Combat has already ended.');
  switch (command.type) {
    case 'move':
      return executeMove(state, command);
    case 'rotate':
      return executeRotate(state, command);
    case 'attack':
      return executeAttack(state, command);
    case 'reinforce-shield':
      return executeShield(state, command);
    case 'end-turn':
      return executeEndTurn(state);
  }
}
