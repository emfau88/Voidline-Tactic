import {
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_MARGIN,
  BATTLEFIELD_WIDTH,
  COMMAND_DRIFT_DISTANCE,
  MOVE_AP_COST,
  MOVE_ENERGY_COST,
  NEBULA_CENTER,
  NEBULA_DAMAGE_REDUCTION,
  NEBULA_RADIUS,
  ROTATE_AP_COST,
  SHIELD_AP_COST,
  SHIELD_ENERGY_COST,
  SHIELD_RESTORE,
} from './constants';
import { SHIPS, WEAPONS } from './content';
import { angleBetween, angleDifference, clamp, distance, normalizeAngle } from './math';
import { normalizeSeed } from './rng';
import type {
  AttackPreview,
  CommandBeatResult,
  CombatCommand,
  CombatEvent,
  CombatState,
  CommandResult,
  ShipState,
  ShipOrder,
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

export function isInsideNebula(position: Vector2): boolean {
  return distance(position, NEBULA_CENTER) <= NEBULA_RADIUS;
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
  const coverMultiplier = isInsideNebula(target.position) ? 1 - NEBULA_DAMAGE_REDUCTION : 1;
  const coveredDamage = rawDamage * coverMultiplier;
  const shieldDamage = Math.min(target.shield, Math.round(coveredDamage * weapon.shieldMultiplier));
  const consumedRawDamage = shieldDamage / weapon.shieldMultiplier;
  const remainingRawDamage = Math.max(0, coveredDamage - consumedRawDamage);
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
    coverReduction: 0,
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

  const rangeFactor = clamp(measuredDistance / weapon.range, 0, 1);
  const resolvedDamage = Math.round(weapon.maxDamage - (weapon.maxDamage - weapon.minDamage) * rangeFactor);
  const resolved = splitDamage(target, resolvedDamage, weapon);
  return {
    valid: true,
    weapon,
    distance: measuredDistance,
    hitChance: 100,
    coverReduction: isInsideNebula(target.position) ? Math.round(NEBULA_DAMAGE_REDUCTION * 100) : 0,
    minShieldDamage: resolved.shieldDamage,
    maxShieldDamage: resolved.shieldDamage,
    minHullDamage: resolved.hullDamage,
    maxHullDamage: resolved.hullDamage,
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

  const attacker: ShipState = {
    ...actionShip,
    ap: actionShip.ap - weaponResult.apCost,
    energy: actionShip.energy - weaponResult.energyCost,
  };
  let nextState = updateShip(state, attacker);
  const events: CombatEvent[] = [];
  const split = {
    shieldDamage: preview.minShieldDamage,
    hullDamage: preview.minHullDamage,
  };
  const remainingHull = Math.max(0, target.hull - split.hullDamage);
  const damagedTarget: ShipState = {
    ...target,
    shield: Math.max(0, target.shield - split.shieldDamage),
    hull: remainingHull,
    alive: remainingHull > 0,
  };
  nextState = updateShip(nextState, damagedTarget);
  if (!damagedTarget.alive) events.push({ type: 'ship-destroyed', shipId: damagedTarget.id });

  events.unshift({
    type: 'attack-resolved',
    shipId: attacker.id,
    targetId: target.id,
    weapon: command.weapon,
    hit: true,
    intercepted: false,
    shieldDamage: split.shieldDamage,
    hullDamage: split.hullDamage,
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

function resetForNextBeat(state: CombatState): CombatState {
  const ships = Object.fromEntries(
    Object.entries(state.ships).map(([id, ship]) => [
      id,
      ship.alive
        ? {
            ...ship,
            ap: ship.maxAp,
            energy: Math.min(ship.maxEnergy, ship.energy + ship.energyRegen),
          }
        : ship,
    ]),
  );
  return { ...state, phase: 'player', turn: state.turn + 1, ships };
}

function driftLivingShips(state: CombatState, events: CombatEvent[]): CombatState {
  let nextState = state;
  for (const ship of getLivingShips(state)) {
    const destination = {
      x: clamp(
        ship.position.x + Math.cos(ship.facing) * COMMAND_DRIFT_DISTANCE,
        BATTLEFIELD_MARGIN + ship.radius,
        BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN - ship.radius,
      ),
      y: clamp(
        ship.position.y + Math.sin(ship.facing) * COMMAND_DRIFT_DISTANCE,
        BATTLEFIELD_MARGIN + ship.radius,
        BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN - ship.radius,
      ),
    };
    if (distance(ship.position, destination) < 0.5) continue;
    nextState = updateShip(nextState, { ...ship, position: destination });
    events.push({
      type: 'ship-moved',
      shipId: ship.id,
      from: ship.position,
      to: destination,
      facing: ship.facing,
      movementKind: 'drift',
    });
  }
  return nextState;
}

/**
 * Resolves one short command beat. Every living ship may contribute at most one
 * order. Maneuvers happen first, attacks use that projected board, damage is
 * applied for every valid firing solution, and the whole formation then drifts.
 */
export function resolveCommandBeat(
  initialState: CombatState,
  playerOrders: readonly ShipOrder[],
  enemyOrders: readonly ShipOrder[],
): CommandBeatResult {
  if (initialState.status !== 'active') {
    return { state: initialState, events: [], resolvedOrders: [], error: 'Combat has already ended.' };
  }

  const events: CombatEvent[] = [];
  const resolvedOrders: ShipOrder[] = [];
  const seenShips = new Set<string>();
  const orders = [...playerOrders, ...enemyOrders];
  const validOrders: ShipOrder[] = [];

  for (const order of orders) {
    const ship = initialState.ships[order.shipId];
    const expectedTeam: Team = playerOrders.includes(order) ? 'player' : 'enemy';
    const reason = !ship
      ? 'Unknown ship.'
      : !ship.alive
        ? 'Destroyed ships cannot act.'
        : ship.team !== expectedTeam
          ? 'Order assigned to the wrong team.'
          : seenShips.has(ship.id)
            ? 'Only one order per ship is allowed in a command beat.'
            : undefined;
    if (reason) {
      events.push({ type: 'order-failed', shipId: order.shipId, order: order.type, reason });
      continue;
    }
    seenShips.add(ship.id);
    validOrders.push(order);
  }

  let state = initialState;
  const maneuverOrders = validOrders.filter((order) => order.type !== 'attack');
  const attackOrders = validOrders.filter(
    (order): order is Extract<ShipOrder, { type: 'attack' }> => order.type === 'attack',
  );

  for (const order of maneuverOrders) {
    const team = state.ships[order.shipId]?.team;
    if (!team) continue;
    const phasedState = { ...state, phase: team };
    const result =
      order.type === 'move'
        ? executeMove(phasedState, order)
        : order.type === 'rotate'
          ? executeRotate(phasedState, order)
          : executeShield(phasedState, order);
    if (result.error) {
      events.push({ type: 'order-failed', shipId: order.shipId, order: order.type, reason: result.error });
      continue;
    }
    state = result.state;
    for (const event of result.events) {
      events.push(event.type === 'ship-moved' ? { ...event, movementKind: 'order' } : event);
    }
    resolvedOrders.push(order);
  }

  const attackSnapshot: CombatState = { ...state, phase: 'player' };
  for (const order of attackOrders) {
    const attackerSnapshot = attackSnapshot.ships[order.shipId];
    const targetSnapshot = attackSnapshot.ships[order.targetId];
    if (!attackerSnapshot || !targetSnapshot) {
      events.push({ type: 'order-failed', shipId: order.shipId, order: order.type, reason: 'Unknown ship.' });
      continue;
    }
    const preview = getAttackPreview(attackSnapshot, order.shipId, order.targetId, order.weapon);
    if (!preview.valid) {
      events.push({
        type: 'order-failed',
        shipId: order.shipId,
        order: order.type,
        reason: preview.reason ?? 'Firing solution was broken.',
      });
      continue;
    }

    const weapon = WEAPONS[order.weapon];
    const currentAttacker = state.ships[order.shipId];
    const currentTarget = state.ships[order.targetId];
    state = updateShip(state, {
      ...currentAttacker,
      ap: Math.max(0, attackerSnapshot.ap - weapon.apCost),
      energy: Math.max(0, attackerSnapshot.energy - weapon.energyCost),
    });
    const damage = splitDamage(currentTarget, weapon.maxDamage - (weapon.maxDamage - weapon.minDamage) * clamp(preview.distance / weapon.range, 0, 1), weapon);
    const remainingHull = Math.max(0, currentTarget.hull - damage.hullDamage);
    const wasAlive = currentTarget.alive;
    state = updateShip(state, {
      ...currentTarget,
      shield: Math.max(0, currentTarget.shield - damage.shieldDamage),
      hull: remainingHull,
      alive: remainingHull > 0,
    });
    events.push({
      type: 'attack-resolved',
      shipId: order.shipId,
      targetId: order.targetId,
      weapon: order.weapon,
      hit: true,
      intercepted: false,
      shieldDamage: damage.shieldDamage,
      hullDamage: damage.hullDamage,
    });
    if (wasAlive && remainingHull === 0) events.push({ type: 'ship-destroyed', shipId: order.targetId });
    resolvedOrders.push(order);
  }

  state = resolveCombatStatus({ ...state, phase: 'player' }, events);
  if (state.status === 'active') {
    state = driftLivingShips(state, events);
    state = resetForNextBeat(state);
    events.push({ type: 'phase-changed', phase: 'player', turn: state.turn });
  }
  return { state, events, resolvedOrders };
}
