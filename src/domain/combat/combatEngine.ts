import {
  AI_THINK_INTERVAL_MS,
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_MARGIN,
  BATTLEFIELD_WIDTH,
  COURSE_REACHED_DISTANCE,
  NEBULA_CENTER,
  NEBULA_DAMAGE_REDUCTION,
  NEBULA_RADIUS,
  SHIELD_BOOST_COOLDOWN_MS,
  SHIELD_BOOST_COST,
  SHIELD_BOOST_DAMAGE_REDUCTION,
  SHIELD_BOOST_DURATION_MS,
  SHIELD_BOOST_RESTORE,
} from './constants';
import { SHIPS, WEAPONS } from './content';
import { angleBetween, angleDifference, clamp, distance, normalizeAngle } from './math';
import type {
  AbilityPreview,
  CombatEvent,
  CombatState,
  CommandResult,
  EscortDirective,
  ManualAbility,
  ProjectileState,
  ShipDefinition,
  ShipState,
  StepResult,
  Team,
  Vector2,
  WeaponDefinition,
  WeaponKind,
} from './types';

const ZERO_COOLDOWNS = { broadside: 0, lance: 0, torpedo: 0, shield: 0 } as const;

function createShipState(definition: ShipDefinition, flagshipId: string): ShipState {
  const isFlagship = definition.id === flagshipId;
  const maxShield = definition.maxShield + (isFlagship && definition.id === 'p-cruiser' ? 15 : 0);
  const maxEnergy = definition.maxEnergy + (isFlagship && definition.id === 'p-frigate' ? 12 : 0);
  const maxSpeed = definition.maxSpeed + (isFlagship && definition.id === 'p-frigate' ? 8 : 0);
  const role = definition.team === 'enemy' ? 'hostile' : isFlagship ? 'flagship' : 'escort';
  return {
    ...definition,
    maxShield,
    maxEnergy,
    maxSpeed,
    hull: definition.maxHull,
    shield: maxShield,
    energy: maxEnergy,
    position: { ...definition.startPosition },
    facing: definition.startFacing,
    speed: maxSpeed * 0.7,
    alive: true,
    role,
    course: [],
    autoFire: true,
    cooldowns: {
      ...ZERO_COOLDOWNS,
      broadside: role === 'flagship' ? 1_200 : 2_000,
      lance: role === 'flagship' ? 0 : 2_600,
      torpedo: role === 'flagship' ? 0 : 4_500,
    },
    lanceChargeMs: 0,
    shieldBoostMs: 0,
    aiThinkMs: role === 'flagship' ? Number.POSITIVE_INFINITY : 50,
  };
}

export function createCombatState(flagshipId = 'p-cruiser'): CombatState {
  const resolvedFlagship = SHIPS.some((ship) => ship.id === flagshipId && ship.team === 'player')
    ? flagshipId
    : 'p-cruiser';
  return {
    elapsedMs: 0,
    status: 'active',
    ships: Object.fromEntries(SHIPS.map((definition) => [definition.id, createShipState(definition, resolvedFlagship)])),
    projectiles: {},
    nextProjectileId: 1,
    flagshipId: resolvedFlagship,
    escortDirective: 'follow',
  };
}

export function getLivingShips(state: CombatState, team?: Team): readonly ShipState[] {
  return Object.values(state.ships).filter((ship) => ship.alive && (!team || ship.team === team));
}

export function isInsideNebula(position: Vector2): boolean {
  return distance(position, NEBULA_CENTER) <= NEBULA_RADIUS;
}

function isInsideBattlefield(position: Vector2, radius: number): boolean {
  return (
    position.x >= BATTLEFIELD_MARGIN + radius &&
    position.x <= BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN - radius &&
    position.y >= BATTLEFIELD_MARGIN + radius &&
    position.y <= BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN - radius
  );
}

function isInsideArc(attacker: ShipState, target: ShipState, weapon: WeaponDefinition): boolean {
  const targetAngle = angleBetween(attacker.position, target.position);
  if (weapon.arc === 'front') return angleDifference(targetAngle, attacker.facing) <= weapon.halfAngle;
  return (
    angleDifference(targetAngle, attacker.facing - Math.PI / 2) <= weapon.halfAngle ||
    angleDifference(targetAngle, attacker.facing + Math.PI / 2) <= weapon.halfAngle
  );
}

interface DamageSplit {
  readonly shieldDamage: number;
  readonly hullDamage: number;
}

function splitDamage(target: ShipState, rawDamage: number, shieldMultiplier: number): DamageSplit {
  const nebulaMultiplier = isInsideNebula(target.position) ? 1 - NEBULA_DAMAGE_REDUCTION : 1;
  const boostMultiplier = target.shieldBoostMs > 0 ? 1 - SHIELD_BOOST_DAMAGE_REDUCTION : 1;
  const modifiedDamage = rawDamage * nebulaMultiplier * boostMultiplier;
  const shieldDamage = Math.min(target.shield, Math.round(modifiedDamage * shieldMultiplier));
  const consumedRawDamage = shieldDamage / shieldMultiplier;
  const hullDamage = Math.max(0, Math.round((modifiedDamage - consumedRawDamage) * (1 - target.armor)));
  return { shieldDamage, hullDamage };
}

function invalidPreview(ability: ManualAbility, reason: string, cooldownMs = 0): AbilityPreview {
  return {
    valid: false,
    reason,
    ability,
    distance: 0,
    damage: ability === 'shield' ? SHIELD_BOOST_RESTORE : WEAPONS[ability].damage,
    shieldDamage: 0,
    hullDamage: 0,
    coverReduction: 0,
    cooldownMs,
    chargeMs: ability === 'lance' ? (WEAPONS.lance.chargeMs ?? 0) : 0,
    etaMs: 0,
  };
}

export function getAbilityPreview(
  state: CombatState,
  shipId: string,
  ability: ManualAbility,
  targetId?: string,
): AbilityPreview {
  const ship = state.ships[shipId];
  if (!ship?.alive) return invalidPreview(ability, 'Ship is unavailable.');
  const cooldownMs = ship.cooldowns[ability];
  if (cooldownMs > 0) return invalidPreview(ability, 'Ability is cooling down.', cooldownMs);

  if (ability === 'shield') {
    if (ship.energy < SHIELD_BOOST_COST) return invalidPreview(ability, 'Not enough Energy.');
    if (ship.shield >= ship.maxShield && ship.shieldBoostMs > 0) return invalidPreview(ability, 'Shield boost is already active.');
    return {
      ...invalidPreview(ability, ''),
      valid: true,
      reason: undefined,
      damage: SHIELD_BOOST_RESTORE,
    };
  }

  const weapon = WEAPONS[ability];
  if (!ship.weapons.includes(ability)) return invalidPreview(ability, `${ship.name} does not carry that weapon.`);
  if (ship.energy < weapon.energyCost) return invalidPreview(ability, 'Not enough Energy.');
  const target = targetId ? state.ships[targetId] : undefined;
  if (!target?.alive || target.team === ship.team) return invalidPreview(ability, 'Designate an enemy target.');
  const measuredDistance = distance(ship.position, target.position);
  if (measuredDistance > weapon.range) return invalidPreview(ability, 'Target is outside weapon range.');
  if (!isInsideArc(ship, target, weapon)) return invalidPreview(ability, 'Target is outside the weapon arc.');
  const damage = splitDamage(target, weapon.damage, weapon.shieldMultiplier);
  return {
    valid: true,
    ability,
    distance: measuredDistance,
    damage: weapon.damage,
    shieldDamage: damage.shieldDamage,
    hullDamage: damage.hullDamage,
    coverReduction: isInsideNebula(target.position) ? Math.round(NEBULA_DAMAGE_REDUCTION * 100) : 0,
    cooldownMs: 0,
    chargeMs: weapon.chargeMs ?? 0,
    etaMs: ability === 'torpedo' ? Math.round((measuredDistance / (weapon.projectileSpeed ?? 1)) * 1_000) : weapon.chargeMs ?? 0,
  };
}

export function setCourse(state: CombatState, shipId: string, points: readonly Vector2[]): CommandResult {
  const ship = state.ships[shipId];
  if (!ship?.alive) return { state, events: [], error: 'Ship is unavailable.' };
  if (ship.role !== 'flagship') return { state, events: [], error: 'Only the flagship accepts a direct course.' };
  const course = points
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .map((point) => ({
      x: clamp(point.x, BATTLEFIELD_MARGIN + ship.radius, BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN - ship.radius),
      y: clamp(point.y, BATTLEFIELD_MARGIN + ship.radius, BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN - ship.radius),
    }))
    .filter((point) => distance(point, ship.position) > ship.radius * 0.5)
    .slice(0, 18);
  if (course.length === 0) return { state, events: [], error: 'Draw a longer course.' };
  const nextShip = { ...ship, course };
  return {
    state: { ...state, ships: { ...state.ships, [shipId]: nextShip } },
    events: [{ type: 'course-changed', shipId, points: course }],
  };
}

export function designateTarget(state: CombatState, shipId: string, targetId: string): CommandResult {
  const ship = state.ships[shipId];
  const target = state.ships[targetId];
  if (!ship?.alive || !target?.alive || ship.team === target.team) {
    return { state, events: [], error: 'Designate a living enemy target.' };
  }
  const ships = { ...state.ships, [shipId]: { ...ship, targetId } };
  const escort = Object.values(ships).find((candidate) => candidate.role === 'escort' && candidate.alive);
  if (escort) ships[escort.id] = { ...escort, targetId };
  return { state: { ...state, ships }, events: [{ type: 'target-designated', shipId, targetId }] };
}

export function setEscortDirective(state: CombatState, directive: EscortDirective): CommandResult {
  return {
    state: { ...state, escortDirective: directive },
    events: [{ type: 'escort-directive-changed', directive }],
  };
}

function launchTorpedo(
  state: CombatState,
  ship: ShipState,
  target: ShipState,
  events: CombatEvent[],
): CombatState {
  const weapon = WEAPONS.torpedo;
  const projectileId = `torpedo-${state.nextProjectileId}`;
  const projectile: ProjectileState = {
    id: projectileId,
    kind: 'torpedo',
    team: ship.team,
    ownerId: ship.id,
    targetId: target.id,
    position: {
      x: ship.position.x + Math.cos(ship.facing) * ship.radius * 1.35,
      y: ship.position.y + Math.sin(ship.facing) * ship.radius * 1.35,
    },
    facing: ship.facing,
    speed: weapon.projectileSpeed ?? 190,
    turnRate: weapon.projectileTurnRate ?? 1,
    damage: weapon.damage,
    shieldMultiplier: weapon.shieldMultiplier,
    ttlMs: 8_000,
    radius: 9,
  };
  events.push({ type: 'weapon-fired', shipId: ship.id, targetId: target.id, weapon: 'torpedo' });
  events.push({ type: 'projectile-launched', projectileId });
  return {
    ...state,
    nextProjectileId: state.nextProjectileId + 1,
    projectiles: { ...state.projectiles, [projectileId]: projectile },
  };
}

export function activateAbility(state: CombatState, shipId: string, ability: ManualAbility): CommandResult {
  const ship = state.ships[shipId];
  const target = ship?.targetId ? state.ships[ship.targetId] : undefined;
  const preview = getAbilityPreview(state, shipId, ability, target?.id);
  if (!preview.valid || !ship) return { state, events: [], error: preview.reason ?? 'Ability unavailable.' };
  const events: CombatEvent[] = [];

  if (ability === 'shield') {
    const restored = Math.min(SHIELD_BOOST_RESTORE, ship.maxShield - ship.shield);
    const boosted = {
      ...ship,
      energy: ship.energy - SHIELD_BOOST_COST,
      shield: ship.shield + restored,
      shieldBoostMs: SHIELD_BOOST_DURATION_MS,
      cooldowns: { ...ship.cooldowns, shield: SHIELD_BOOST_COOLDOWN_MS },
    };
    events.push({ type: 'shield-boosted', shipId, restored, durationMs: SHIELD_BOOST_DURATION_MS });
    return { state: { ...state, ships: { ...state.ships, [shipId]: boosted } }, events };
  }

  if (!target) return { state, events: [], error: 'Designate an enemy target.' };
  const weapon = WEAPONS[ability];
  const armed = {
    ...ship,
    energy: ship.energy - weapon.energyCost,
    cooldowns: { ...ship.cooldowns, [ability]: weapon.cooldownMs },
  };
  let nextState: CombatState = { ...state, ships: { ...state.ships, [shipId]: armed } };
  if (ability === 'lance') {
    const charging = { ...armed, lanceChargeMs: weapon.chargeMs ?? 0, lanceTargetId: target.id };
    events.push({ type: 'weapon-charging', shipId, targetId: target.id, weapon: 'lance', durationMs: weapon.chargeMs ?? 0 });
    nextState = { ...nextState, ships: { ...nextState.ships, [shipId]: charging } };
  } else {
    nextState = launchTorpedo(nextState, armed, target, events);
  }
  return { state: nextState, events };
}

function rotateToward(current: number, desired: number, maximumDelta: number): number {
  const delta = normalizeAngle(desired - current);
  return normalizeAngle(current + clamp(delta, -maximumDelta, maximumDelta));
}

function closestEnemy(ship: ShipState, ships: Readonly<Record<string, ShipState>>): ShipState | undefined {
  return Object.values(ships)
    .filter((candidate) => candidate.alive && candidate.team !== ship.team)
    .sort((a, b) => distance(ship.position, a.position) - distance(ship.position, b.position))[0];
}

function escortDestination(state: CombatState, escort: ShipState, flagship: ShipState, target?: ShipState): Vector2 {
  if ((state.escortDirective === 'flank-left' || state.escortDirective === 'flank-right') && target) {
    const approach = angleBetween(target.position, flagship.position);
    const side = state.escortDirective === 'flank-left' ? -1 : 1;
    const angle = approach + side * Math.PI / 2;
    return { x: target.position.x + Math.cos(angle) * 235, y: target.position.y + Math.sin(angle) * 235 };
  }
  const backDistance = state.escortDirective === 'protect' ? 92 : 145;
  const lateral = state.escortDirective === 'protect' ? 0 : escort.id.endsWith('frigate') ? 110 : -110;
  return {
    x: flagship.position.x - Math.cos(flagship.facing) * backDistance + Math.cos(flagship.facing + Math.PI / 2) * lateral,
    y: flagship.position.y - Math.sin(flagship.facing) * backDistance + Math.sin(flagship.facing + Math.PI / 2) * lateral,
  };
}

function hostileDestination(ship: ShipState, target: ShipState): Vector2 {
  const targetAngle = angleBetween(ship.position, target.position);
  const separation = distance(ship.position, target.position);
  if (separation > 430) return { ...target.position };
  if (separation < 175) {
    return {
      x: ship.position.x - Math.cos(targetAngle) * 260,
      y: ship.position.y - Math.sin(targetAngle) * 260,
    };
  }
  const broadsideShip = ship.weapons.includes('broadside');
  const orbitDirection = ship.id === 'e-cruiser' ? 1 : -1;
  const desiredAngle = targetAngle + (broadsideShip ? orbitDirection * Math.PI / 2 : orbitDirection * Math.PI / 3);
  return {
    x: ship.position.x + Math.cos(desiredAngle) * 330,
    y: ship.position.y + Math.sin(desiredAngle) * 330,
  };
}

function planAutonomousShip(state: CombatState, ship: ShipState): ShipState {
  const flagship = state.ships[state.flagshipId];
  const inheritedTarget = ship.role === 'escort' && flagship?.targetId ? state.ships[flagship.targetId] : undefined;
  const target = inheritedTarget?.alive ? inheritedTarget : closestEnemy(ship, state.ships);
  if (!target) return { ...ship, aiThinkMs: AI_THINK_INTERVAL_MS };
  const destination = ship.role === 'escort' && flagship?.alive
    ? escortDestination(state, ship, flagship, target)
    : hostileDestination(ship, target);
  return {
    ...ship,
    targetId: target.id,
    course: [{
      x: clamp(destination.x, BATTLEFIELD_MARGIN + ship.radius, BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN - ship.radius),
      y: clamp(destination.y, BATTLEFIELD_MARGIN + ship.radius, BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN - ship.radius),
    }],
    aiThinkMs: AI_THINK_INTERVAL_MS,
  };
}

function moveShip(ship: ShipState, deltaSeconds: number): ShipState {
  let course = [...ship.course];
  while (course[0] && distance(ship.position, course[0]) <= COURSE_REACHED_DISTANCE) course = course.slice(1);
  const waypoint = course[0];
  const desiredFacing = waypoint ? angleBetween(ship.position, waypoint) : ship.facing;
  const turnDelta = angleDifference(desiredFacing, ship.facing);
  const facing = rotateToward(ship.facing, desiredFacing, ship.turnRate * deltaSeconds);
  const desiredSpeed = ship.maxSpeed * (0.58 + 0.42 * (1 - Math.min(Math.PI, turnDelta) / Math.PI));
  const speed = ship.speed < desiredSpeed
    ? Math.min(desiredSpeed, ship.speed + ship.acceleration * deltaSeconds)
    : Math.max(desiredSpeed, ship.speed - ship.acceleration * 1.4 * deltaSeconds);
  const position = {
    x: clamp(ship.position.x + Math.cos(facing) * speed * deltaSeconds, BATTLEFIELD_MARGIN + ship.radius, BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN - ship.radius),
    y: clamp(ship.position.y + Math.sin(facing) * speed * deltaSeconds, BATTLEFIELD_MARGIN + ship.radius, BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN - ship.radius),
  };
  const blocked = position.x === ship.position.x && position.y === ship.position.y;
  return {
    ...ship,
    position,
    facing: blocked ? rotateToward(facing, angleBetween(position, { x: BATTLEFIELD_WIDTH / 2, y: BATTLEFIELD_HEIGHT / 2 }), ship.turnRate * deltaSeconds) : facing,
    speed,
    course,
  };
}

function applySeparation(ships: Record<string, ShipState>): void {
  const living = Object.values(ships).filter((ship) => ship.alive);
  for (let firstIndex = 0; firstIndex < living.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < living.length; secondIndex += 1) {
      const first = ships[living[firstIndex].id];
      const second = ships[living[secondIndex].id];
      const separation = distance(first.position, second.position);
      const minimum = first.radius + second.radius + 16;
      if (separation >= minimum || separation < 0.01) continue;
      const angle = angleBetween(second.position, first.position);
      const push = (minimum - separation) / 2;
      const firstPosition = {
        x: clamp(first.position.x + Math.cos(angle) * push, BATTLEFIELD_MARGIN + first.radius, BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN - first.radius),
        y: clamp(first.position.y + Math.sin(angle) * push, BATTLEFIELD_MARGIN + first.radius, BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN - first.radius),
      };
      const secondPosition = {
        x: clamp(second.position.x - Math.cos(angle) * push, BATTLEFIELD_MARGIN + second.radius, BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN - second.radius),
        y: clamp(second.position.y - Math.sin(angle) * push, BATTLEFIELD_MARGIN + second.radius, BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN - second.radius),
      };
      ships[first.id] = { ...first, position: firstPosition };
      ships[second.id] = { ...second, position: secondPosition };
    }
  }
}

function damageTarget(
  ships: Record<string, ShipState>,
  attackerId: string,
  targetId: string,
  weapon: WeaponKind,
  rawDamage: number,
  shieldMultiplier: number,
  events: CombatEvent[],
): void {
  const target = ships[targetId];
  if (!target?.alive) return;
  const damage = splitDamage(target, rawDamage, shieldMultiplier);
  const hull = Math.max(0, target.hull - damage.hullDamage);
  ships[targetId] = {
    ...target,
    shield: Math.max(0, target.shield - damage.shieldDamage),
    hull,
    alive: hull > 0,
  };
  events.push({ type: 'attack-resolved', shipId: attackerId, targetId, weapon, ...damage });
  if (hull === 0) events.push({ type: 'ship-destroyed', shipId: targetId });
}

function tickCooldowns(ship: ShipState, deltaMs: number): ShipState {
  return {
    ...ship,
    energy: Math.min(ship.maxEnergy, ship.energy + ship.energyRegenPerSecond * (deltaMs / 1_000)),
    cooldowns: {
      broadside: Math.max(0, ship.cooldowns.broadside - deltaMs),
      lance: Math.max(0, ship.cooldowns.lance - deltaMs),
      torpedo: Math.max(0, ship.cooldowns.torpedo - deltaMs),
      shield: Math.max(0, ship.cooldowns.shield - deltaMs),
    },
    shieldBoostMs: Math.max(0, ship.shieldBoostMs - deltaMs),
    aiThinkMs: Math.max(0, ship.aiThinkMs - deltaMs),
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

export function stepCombat(initialState: CombatState, deltaMs: number): StepResult {
  if (initialState.status !== 'active' || deltaMs <= 0) return { state: initialState, events: [] };
  const events: CombatEvent[] = [];
  const ships: Record<string, ShipState> = Object.fromEntries(
    Object.entries(initialState.ships).map(([id, ship]) => [id, ship.alive ? tickCooldowns(ship, deltaMs) : ship]),
  );
  let state: CombatState = { ...initialState, elapsedMs: initialState.elapsedMs + deltaMs, ships };

  for (const ship of Object.values(ships)) {
    if (!ship.alive || ship.role === 'flagship') continue;
    if (ship.aiThinkMs <= 0) ships[ship.id] = planAutonomousShip({ ...state, ships }, ship);
  }
  for (const ship of Object.values(ships)) {
    if (ship.alive) ships[ship.id] = moveShip(ship, deltaMs / 1_000);
  }
  applySeparation(ships);
  state = { ...state, ships };

  for (const ship of Object.values(ships)) {
    if (!ship.alive || ship.lanceChargeMs <= 0 || !ship.lanceTargetId) continue;
    const remaining = ship.lanceChargeMs - deltaMs;
    if (remaining > 0) {
      ships[ship.id] = { ...ship, lanceChargeMs: remaining };
      continue;
    }
    const target = ships[ship.lanceTargetId];
    const weapon = WEAPONS.lance;
    ships[ship.id] = { ...ship, lanceChargeMs: 0, lanceTargetId: undefined };
    if (target?.alive && distance(ship.position, target.position) <= weapon.range && isInsideArc(ship, target, weapon)) {
      events.push({ type: 'weapon-fired', shipId: ship.id, targetId: target.id, weapon: 'lance' });
      damageTarget(ships, ship.id, target.id, 'lance', weapon.damage, weapon.shieldMultiplier, events);
    } else {
      events.push({ type: 'ability-failed', shipId: ship.id, ability: 'lance', reason: 'Firing solution lost during charge.' });
    }
  }

  for (const original of Object.values(ships)) {
    const ship = ships[original.id];
    if (!ship.alive) continue;
    const target = ship.targetId ? ships[ship.targetId] : undefined;
    if (!target?.alive) continue;

    const broadside = WEAPONS.broadside;
    if (
      ship.autoFire &&
      ship.weapons.includes('broadside') &&
      ship.cooldowns.broadside <= 0 &&
      ship.energy >= broadside.energyCost &&
      distance(ship.position, target.position) <= broadside.range &&
      isInsideArc(ship, target, broadside)
    ) {
      ships[ship.id] = {
        ...ship,
        energy: ship.energy - broadside.energyCost,
        cooldowns: { ...ship.cooldowns, broadside: broadside.cooldownMs },
      };
      events.push({ type: 'weapon-fired', shipId: ship.id, targetId: target.id, weapon: 'broadside' });
      damageTarget(ships, ship.id, target.id, 'broadside', broadside.damage, broadside.shieldMultiplier, events);
    }
  }

  state = { ...state, ships };
  for (const ship of Object.values(ships)) {
    if (!ship.alive || ship.role === 'flagship' || ship.lanceChargeMs > 0 || ship.aiThinkMs > 80) continue;
    const target = ship.targetId ? ships[ship.targetId] : undefined;
    if (!target?.alive) continue;
    if (ship.shield < ship.maxShield * 0.2 && ship.cooldowns.shield <= 0 && ship.energy >= SHIELD_BOOST_COST) {
      const restored = Math.min(SHIELD_BOOST_RESTORE, ship.maxShield - ship.shield);
      ships[ship.id] = {
        ...ship,
        shield: ship.shield + restored,
        energy: ship.energy - SHIELD_BOOST_COST,
        shieldBoostMs: SHIELD_BOOST_DURATION_MS,
        cooldowns: { ...ship.cooldowns, shield: SHIELD_BOOST_COOLDOWN_MS },
        aiThinkMs: AI_THINK_INTERVAL_MS,
      };
      events.push({ type: 'shield-boosted', shipId: ship.id, restored, durationMs: SHIELD_BOOST_DURATION_MS });
      continue;
    }
    const special: ManualAbility | undefined = ship.weapons.includes('lance') && ship.cooldowns.lance <= 0 ? 'lance'
      : ship.weapons.includes('torpedo') && ship.cooldowns.torpedo <= 0 ? 'torpedo'
        : undefined;
    if (!special) continue;
    const preview = getAbilityPreview({ ...state, ships }, ship.id, special, target.id);
    if (!preview.valid) continue;
    const result = activateAbility({ ...state, ships }, ship.id, special);
    state = result.state;
    Object.assign(ships, state.ships);
    ships[ship.id] = { ...ships[ship.id], aiThinkMs: AI_THINK_INTERVAL_MS };
    events.push(...result.events);
  }

  const projectiles: Record<string, ProjectileState> = { ...state.projectiles };
  for (const projectile of Object.values(projectiles)) {
    const target = ships[projectile.targetId];
    if (!target?.alive || projectile.ttlMs <= deltaMs) {
      delete projectiles[projectile.id];
      events.push({ type: 'projectile-expired', projectileId: projectile.id });
      continue;
    }
    const desiredFacing = angleBetween(projectile.position, target.position);
    const facing = rotateToward(projectile.facing, desiredFacing, projectile.turnRate * (deltaMs / 1_000));
    const position = {
      x: projectile.position.x + Math.cos(facing) * projectile.speed * (deltaMs / 1_000),
      y: projectile.position.y + Math.sin(facing) * projectile.speed * (deltaMs / 1_000),
    };
    if (distance(position, target.position) <= target.radius + projectile.radius + 8) {
      damageTarget(ships, projectile.ownerId, target.id, 'torpedo', projectile.damage, projectile.shieldMultiplier, events);
      delete projectiles[projectile.id];
      continue;
    }
    if (!isInsideBattlefield(position, 0)) {
      delete projectiles[projectile.id];
      events.push({ type: 'projectile-expired', projectileId: projectile.id });
      continue;
    }
    projectiles[projectile.id] = { ...projectile, position, facing, ttlMs: projectile.ttlMs - deltaMs };
  }

  state = { ...state, ships, projectiles };
  state = resolveCombatStatus(state, events);
  return { state, events };
}
