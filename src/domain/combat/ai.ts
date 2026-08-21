import { WEAPONS } from './content';
import { angleBetween, distance } from './math';
import { executeCommand, getAttackPreview, getLivingShips } from './combatEngine';
import type { CombatCommand, CombatState, ShipState, WeaponKind } from './types';

const WEAPON_PRIORITY: readonly WeaponKind[] = ['broadside', 'lance', 'torpedo'];

function expectedDamage(state: CombatState, attacker: ShipState, target: ShipState, kind: WeaponKind): number {
  const preview = getAttackPreview(state, attacker.id, target.id, kind);
  if (!preview.valid) return -1;
  const averageDamage =
    (preview.minShieldDamage + preview.maxShieldDamage + preview.minHullDamage + preview.maxHullDamage) / 2;
  return averageDamage * (preview.hitChance / 100);
}

export function chooseEnemyCommand(state: CombatState, shipId: string): CombatCommand | undefined {
  const ship = state.ships[shipId];
  if (!ship?.alive || ship.team !== 'enemy' || state.phase !== 'enemy') return undefined;
  const targets = [...getLivingShips(state, 'player')].sort(
    (a, b) => distance(ship.position, a.position) - distance(ship.position, b.position),
  );
  const target = targets[0];
  if (!target) return undefined;

  const usableWeapons = WEAPON_PRIORITY.filter((kind) => ship.weapons.includes(kind))
    .map((kind) => ({ kind, score: expectedDamage(state, ship, target, kind) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score);
  if (usableWeapons[0]) {
    return { type: 'attack', shipId, targetId: target.id, weapon: usableWeapons[0].kind };
  }

  if (ship.ap < 1 || ship.energy < 4) return undefined;
  const angle = angleBetween(ship.position, target.position);
  const preferredWeapon = ship.weapons.includes('broadside') ? WEAPONS.broadside : WEAPONS[ship.weapons[0]];
  const desiredDistance = preferredWeapon.range * 0.68;
  const currentDistance = distance(ship.position, target.position);
  const travel = Math.min(ship.moveRange * 0.72, Math.max(0, currentDistance - desiredDistance));
  const destination = {
    x: ship.position.x + Math.cos(angle) * travel,
    y: ship.position.y + Math.sin(angle) * travel,
  };
  const facing = preferredWeapon.arc === 'broadside' ? angle - Math.PI / 2 : angle;
  return { type: 'move', shipId, destination, facing };
}

export function executeEnemyPhase(initialState: CombatState): {
  readonly state: CombatState;
  readonly commands: readonly CombatCommand[];
} {
  let state = initialState;
  const commands: CombatCommand[] = [];
  for (const enemy of getLivingShips(state, 'enemy')) {
    for (let step = 0; step < 2; step += 1) {
      const command = chooseEnemyCommand(state, enemy.id);
      if (!command) break;
      const result = executeCommand(state, command);
      if (result.error) break;
      state = result.state;
      commands.push(command);
      if (state.status !== 'active') return { state, commands };
    }
  }
  if (state.status === 'active') {
    const result = executeCommand(state, { type: 'end-turn' });
    state = result.state;
    commands.push({ type: 'end-turn' });
  }
  return { state, commands };
}
