import { BATTLEFIELD_HEIGHT, BATTLEFIELD_MARGIN, BATTLEFIELD_WIDTH } from '../combat/constants';
import { angleBetween, clamp, distance } from '../combat/math';
import type { ShipState, Vector2 } from '../combat/types';
import { laneChangeRoute, laneDistance, laneOffsetForShip, lanePointAt, lanePointWithOffset, laneProgressAt, nearestLane } from './lanes';
import { chooseFleetTarget } from './tacticalAi';
import type { FleetBattleState, FleetDirective } from './types';

function optimalRange(ship: ShipState): number {
  if (ship.class === 'destroyer') return 1_020;
  if (ship.class === 'frigate') return 860;
  return 610;
}

function clampDestination(point: Vector2, ship: ShipState): Vector2 {
  return {
    x: clamp(point.x, BATTLEFIELD_MARGIN + ship.radius, BATTLEFIELD_WIDTH - BATTLEFIELD_MARGIN - ship.radius),
    y: clamp(point.y, BATTLEFIELD_MARGIN + ship.radius, BATTLEFIELD_HEIGHT - BATTLEFIELD_MARGIN - ship.radius),
  };
}

function rangedDestination(ship: ShipState, target: ShipState, desiredRange: number): Vector2 {
  const separation = distance(ship.position, target.position);
  const away = angleBetween(target.position, ship.position);
  if (separation < desiredRange * 0.82) {
    return { x: target.position.x + Math.cos(away) * desiredRange, y: target.position.y + Math.sin(away) * desiredRange };
  }
  if (separation > desiredRange * 1.18) return { ...target.position };
  return { ...ship.position };
}

function broadsideDestination(ship: ShipState, target: ShipState): Vector2 {
  const targetAngle = angleBetween(ship.position, target.position);
  const orbitDirection = [...ship.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 2 === 0 ? 1 : -1;
  const tangent = targetAngle + orbitDirection * Math.PI / 2;
  return {
    x: ship.position.x + Math.cos(tangent) * 250,
    y: ship.position.y + Math.sin(tangent) * 250,
  };
}

function destinationForDirective(state: FleetBattleState, ship: ShipState, directive: FleetDirective, target?: ShipState): Vector2 {
  const direction: 1 | -1 = ship.team === 'player' ? 1 : -1;
  const progress = laneProgressAt(ship.position);
  if (directive.stance === 'retreat') return lanePointWithOffset(directive.laneId, ship.team === 'player' ? 0.045 : 0.955, laneOffsetForShip(ship.id, 44));
  if (directive.stance === 'hold') {
    if (target && distance(ship.position, target.position) < optimalRange(ship) * 0.88 && ship.weapons.includes('broadside')) {
      return broadsideDestination(ship, target);
    }
    return directive.holdPosition ?? lanePointWithOffset(directive.laneId, progress, laneOffsetForShip(ship.id));
  }
  if (target && directive.stance === 'broadside') return broadsideDestination(ship, target);
  if (target && directive.stance === 'keep-range') return rangedDestination(ship, target, optimalRange(ship));
  if (target && distance(ship.position, target.position) < optimalRange(ship) * 1.08) {
    return ship.weapons.includes('broadside') ? broadsideDestination(ship, target) : rangedDestination(ship, target, optimalRange(ship));
  }
  const advance = clamp(progress + direction * (target ? 0.075 : 0.13), 0.04, 0.96);
  return lanePointWithOffset(directive.laneId, advance, laneOffsetForShip(ship.id));
}

export function planFleetNavigation(state: FleetBattleState): FleetBattleState {
  const ships = { ...state.ships };
  for (const ship of Object.values(ships)) {
    if (!ship.alive) continue;
    const directive = state.fleet.directives[ship.id] ?? {
      laneId: nearestLane(ship.position),
      stance: 'advance' as const,
    };
    const direction: 1 | -1 = ship.team === 'player' ? 1 : -1;
    const currentLane = directive.previousLaneId && laneDistance(ship.position, directive.laneId) > 80
      ? directive.previousLaneId
      : nearestLane(ship.position);
    const transfer = laneChangeRoute(ship.position, currentLane, directive.laneId, direction);
    const target = chooseFleetTarget(state, ship);
    const destination = destinationForDirective(state, ship, directive, target);
    const course = [...transfer, clampDestination(destination, ship)].filter((point, index, points) => (
      index === 0 || distance(point, points[index - 1]) > 20
    ));
    ships[ship.id] = {
      ...ship,
      navigationZone: directive.laneId,
      targetId: target?.id,
      course,
      desiredHeading: course[0] ? angleBetween(ship.position, course[0]) : ship.desiredHeading,
      aiThinkMs: 0,
    };
  }
  const directives = { ...state.fleet.directives };
  for (const ship of Object.values(ships)) {
    const directive = directives[ship.id];
    if (directive?.previousLaneId && laneDistance(ship.position, directive.laneId) <= 80) {
      directives[ship.id] = { ...directive, previousLaneId: undefined };
    }
  }
  return { ...state, ships, fleet: { ...state.fleet, directives } };
}
