import type { CombatEvent, ExpeditionState, ProjectileState, Vector2, WeaponMode } from './types';

const BALLISTICS: Record<WeaponMode, { speed: number; radius: number }> = {
  broadside: { speed: 0.72, radius: 4 },
  rail: { speed: 1.35, radius: 5 },
  torpedo: { speed: 0.4, radius: 7 },
  orb: { speed: 0.28, radius: 12 },
};
export const PLAYER_HIT_RADIUS = 29;
export function hostileHitRadius(kind: string): number {
  return kind === 'guardian' ? 49 : kind === 'sentinel' ? 38 : 27;
}

/** Earliest swept circle contact, including a moving target and initial overlap. */
export function contactTime(from: Vector2, to: Vector2, targetFrom: Vector2, targetTo: Vector2, radius: number): number | undefined {
  const x = from.x - targetFrom.x; const y = from.y - targetFrom.y;
  const dx = to.x - from.x - (targetTo.x - targetFrom.x);
  const dy = to.y - from.y - (targetTo.y - targetFrom.y);
  const c = x * x + y * y - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a < 1e-12) return undefined;
  const b = 2 * (x * dx + y * dy);
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return undefined;
  const t = (-b - Math.sqrt(discriminant)) / (2 * a);
  return t >= 0 && t <= 1 ? t : undefined;
}

function withEvent(state: ExpeditionState, event: Omit<CombatEvent, 'id'>): ExpeditionState {
  return { ...state, nextCombatId: state.nextCombatId + 1,
    combatEvents: [...state.combatEvents, { ...event, id: state.nextCombatId }].slice(-64) };
}

export function launchProjectile(state: ExpeditionState, ownerId: string, side: ProjectileState['side'], weapon: WeaponMode,
  position: Vector2, direction: Vector2, damage: number, range: number): ExpeditionState {
  const length = Math.hypot(direction.x, direction.y);
  const unit = length > 1e-9 ? { x: direction.x / length, y: direction.y / length } : { x: 0, y: -1 };
  const ballistic = BALLISTICS[weapon];
  const shot: ProjectileState = { id: state.nextCombatId, ownerId, side, weapon, position,
    velocity: { x: unit.x * ballistic.speed, y: unit.y * ballistic.speed },
    radius: ballistic.radius, damage, remainingMs: range / ballistic.speed };
  return withEvent({ ...state, nextCombatId: state.nextCombatId + 1, projectiles: [...state.projectiles, shot] },
    { kind: 'shot', side, weapon, position, damage: 0, hull: 0, maxHull: 0, destroyed: false });
}

/** Presentation consumes these positions/events; it never predicts damage. */
export function advanceProjectiles(state: ExpeditionState, previous: ExpeditionState, deltaMs: number): ExpeditionState {
  if (state.status !== 'active') return { ...state, projectiles: [], combatEvents: [] };
  let result = state;
  const remaining: ProjectileState[] = [];
  const existing = new Set(previous.projectiles.map((shot) => shot.id));
  for (const shot of state.projectiles) {
    // Enemy shots born at the end of this tick start moving on the next tick.
    if (!existing.has(shot.id)) { remaining.push(shot); continue; }
    const elapsed = Math.min(deltaMs, shot.remainingMs);
    const to = { x: shot.position.x + shot.velocity.x * elapsed, y: shot.position.y + shot.velocity.y * elapsed };
    const targets = shot.side === 'player'
      ? result.hostiles.map((h) => ({ id: h.id, position: h.position,
        old: previous.hostiles.find((old) => old.id === h.id)?.position ?? h.position,
        radius: hostileHitRadius(h.kind), hull: h.hull, maxHull: h.maxHull,
        blocked: h.kind === 'guardian' && h.status === 'alert' && (h.attackCooldownMs ?? 0) > 2600 }))
      : result.hull > 0 ? [{ id: 'player', position: result.position, old: previous.position,
        radius: PLAYER_HIT_RADIUS, hull: result.hull, maxHull: result.maxHull, blocked: false }] : [];
    const ratio = deltaMs > 0 ? elapsed / deltaMs : 0;
    const hit = targets.map((target) => {
      const end = { x: target.old.x + (target.position.x - target.old.x) * ratio,
        y: target.old.y + (target.position.y - target.old.y) * ratio };
      return { target, t: contactTime(shot.position, to, target.old, end, target.radius + shot.radius) };
    }).filter((candidate): candidate is typeof candidate & { t: number } => candidate.t !== undefined)
      .sort((a, b) => a.t - b.t || a.target.id.localeCompare(b.target.id))[0];
    if (!hit) {
      if (shot.remainingMs > deltaMs) remaining.push({ ...shot, position: to, remainingMs: shot.remainingMs - deltaMs });
      continue;
    }
    const { target, t } = hit;
    const damage = target.blocked ? 0 : Math.min(target.hull, shot.damage);
    const hull = target.hull - damage;
    const destroyed = hull <= 0;
    const position = { x: shot.position.x + (to.x - shot.position.x) * t, y: shot.position.y + (to.y - shot.position.y) * t };
    if (shot.side === 'player') {
      const hostile = result.hostiles.find((h) => h.id === target.id)!;
      result = { ...result,
        hostiles: result.hostiles.map((h) => h.id === target.id ? { ...h, hull, status: h.passive ? 'patrol' as const : 'alert' as const } : h).filter((h) => h.hull > 0),
        dummyRespawns: destroyed && hostile.passive
          ? [...result.dummyRespawns, { hostileId: hostile.id, remainingMs: 2700 }] : result.dummyRespawns };
    } else result = { ...result, hull };
    result = withEvent(result, { kind: target.blocked ? 'blocked' : 'hit', side: shot.side,
      weapon: shot.weapon, position, damage, hull, maxHull: target.maxHull, destroyed });
    result = { ...result, log: [target.blocked ? 'Chorschild fängt den Schuss ab.' :
      shot.side === 'hostile' ? `Einschlag · Hülle -${damage}.` : destroyed ? 'Ziel zerstört.' : `Treffer · Hülle ${hull}/${target.maxHull}.`, ...result.log].slice(0, 4) };
  }
  return { ...result, projectiles: remaining };
}

/** Older saves predate physical shots. Never replay historical VFX after loading. */
export function normalizeCombatState(state: ExpeditionState): ExpeditionState {
  const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
  const point = (v: Vector2 | undefined): boolean => Boolean(v && finite(v.x) && finite(v.y));
  const seen = new Set<number>();
  const projectiles = (Array.isArray(state.projectiles) ? state.projectiles : []).filter((p) => {
    if (!p || !Number.isSafeInteger(p.id) || p.id < 1 || seen.has(p.id) || typeof p.ownerId !== 'string'
      || !['player', 'hostile'].includes(p.side) || !Object.hasOwn(BALLISTICS, p.weapon)
      || !point(p.position) || !point(p.velocity) || !finite(p.radius) || p.radius <= 0 || p.radius > 50
      || !finite(p.damage) || p.damage <= 0 || !finite(p.remainingMs) || p.remainingMs <= 0 || p.remainingMs > 10000) return false;
    seen.add(p.id); return true;
  });
  const maxId = Math.max(0, ...projectiles.map((p) => p.id));
  return { ...state, projectiles: state.status === 'active' ? projectiles : [], combatEvents: [],
    nextCombatId: Math.max(maxId + 1, Number.isSafeInteger(state.nextCombatId) ? state.nextCombatId : 1),
    freeBroadsideSide: state.freeBroadsideSide === -1 ? -1 : 1 };
}
