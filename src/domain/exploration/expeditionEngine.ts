import type { Cargo, ExpeditionResult, ExpeditionScenario, ExpeditionState, HostileState, ResourceKind, SignalKind, SignalState, Vector2, WeaponMode } from './types';

const ORIGIN: Vector2 = { x: 2_100, y: 1_500 };
const WORLD_WIDTH = 4_200;
const WORLD_HEIGHT = 2_600;
const MAX_LOG_ENTRIES = 4;
const DUMMY_RESPAWN_MS = 2_700;
const SYSTEM_RECHARGE_PER_MS = 0.012;
export const WORMHOLE_POSITION: Vector2 = { x: 1_360, y: 1_320 };
const WORMHOLE_ENTRY_RANGE = 170;

const TRAINING_DUMMIES: readonly HostileState[] = [
  { id: 'ash-patrol', name: 'Aschen-Attrappe', kind: 'patrol', passive: true, status: 'patrol', position: { x: 2_500, y: 1_580 }, patrolCenter: { x: 2_500, y: 1_580 }, patrolRadius: 0, patrolPhase: 0, heading: Math.PI, hull: 4, maxHull: 4 },
  { id: 'cinder-escort', name: 'Glut-Attrappe', kind: 'patrol', passive: true, status: 'patrol', position: { x: 2_510, y: 1_400 }, patrolCenter: { x: 2_510, y: 1_400 }, patrolRadius: 0, patrolPhase: 0, heading: Math.PI / 2, hull: 3, maxHull: 3 },
  { id: 'wreck-eater', name: 'Schrott-Attrappe', kind: 'raider', passive: true, status: 'patrol', position: { x: 2_400, y: 1_790 }, patrolCenter: { x: 2_400, y: 1_790 }, patrolRadius: 0, patrolPhase: 0, heading: Math.PI, hull: 6, maxHull: 6 },
];

const ASH_REAVER: HostileState = {
  id: 'ash-reaver', name: 'Aschenplünderer', kind: 'raider', passive: false, status: 'patrol',
  position: { x: 2_980, y: 1_470 }, patrolCenter: { x: 2_980, y: 1_470 }, patrolRadius: 76,
  patrolPhase: 0, heading: Math.PI / 2, hull: 4, maxHull: 4, attackCooldownMs: 0,
};

const SIGNAL_DETAILS: Record<SignalKind, Pick<SignalState, 'name' | 'risk' | 'description'>> = {
  wreck: { name: 'Gebrochene Reliquie', risk: 'low', description: 'Ein kleines Ordenswrack. Die Hülle ist offen, aber stabil.' },
  vein: { name: 'Schwarze Ader', risk: 'low', description: 'Verdichtete Legierungen liegen knapp unter einer ruhigen Staubwolke.' },
  anomaly: { name: 'Violette Liturgie', risk: 'high', description: 'Ein singendes Feld verzerrt die Scanner. Wertvolle Daten, aber hohe Belastung.' },
  distress: { name: 'Laterne im Staub', risk: 'medium', description: 'Ein schwaches Notsignal. Seine Quelle reagiert nicht auf Standardfunk.' },
};

function distance(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function addCargo(cargo: Cargo, kind: ResourceKind, amount: number): Cargo {
  return { ...cargo, [kind]: cargo[kind] + amount };
}

function cargoTotal(cargo: Cargo): number {
  return cargo.alloys + cargo.data + cargo.relics;
}

function appendLog(state: ExpeditionState, entry: string): ExpeditionState {
  return { ...state, log: [entry, ...state.log].slice(0, MAX_LOG_ENTRIES) };
}

function rechargeSystems(state: ExpeditionState, deltaMs: number): ExpeditionState {
  if (deltaMs <= 0 || state.energy >= state.maxEnergy) return state;
  return { ...state, energy: Math.min(state.maxEnergy, state.energy + deltaMs * SYSTEM_RECHARGE_PER_MS) };
}

function forwardVector(heading: number): Vector2 {
  return { x: Math.cos(heading - Math.PI / 2), y: Math.sin(heading - Math.PI / 2) };
}

function advanceHostiles(state: ExpeditionState, deltaMs: number): ExpeditionState {
  if (state.status !== 'active' || deltaMs <= 0) return state;
  const nextRespawns = (state.dummyRespawns ?? []).map((entry) => ({ ...entry, remainingMs: entry.remainingMs - deltaMs }));
  const respawnedIds = nextRespawns.filter((entry) => entry.remainingMs <= 0).map((entry) => entry.hostileId);
  const respawned = TRAINING_DUMMIES
    .filter((dummy) => respawnedIds.includes(dummy.id))
    .map((dummy) => ({ ...dummy, position: { ...dummy.position }, patrolCenter: { ...dummy.patrolCenter } }));
  const attackLogs: string[] = [];
  let playerHull = state.hull;
  const hostiles: HostileState[] = [...state.hostiles, ...respawned].map((hostile): HostileState => {
    if (hostile.passive) return hostile;
    const dx = state.position.x - hostile.position.x;
    const dy = state.position.y - hostile.position.y;
    const remaining = Math.hypot(dx, dy);
    const attackCooldownMs = Math.max(0, (hostile.attackCooldownMs ?? 0) - deltaMs);
    const alerted = hostile.status === 'alert' || remaining < 420;
    if (!alerted || remaining > 780) {
      const patrolPhase = hostile.patrolPhase + deltaMs * 0.00034;
      const position = {
        x: hostile.patrolCenter.x + Math.cos(patrolPhase) * hostile.patrolRadius,
        y: hostile.patrolCenter.y + Math.sin(patrolPhase) * hostile.patrolRadius,
      };
      return { ...hostile, status: 'patrol', position, patrolPhase, heading: patrolPhase + Math.PI, attackCooldownMs };
    }
    if (remaining <= 430 && attackCooldownMs <= 0) {
      playerHull = Math.max(0, playerHull - 4);
      attackLogs.push(`${hostile.name} feuert eine kurze Salve. Hülle -4.`);
      return { ...hostile, status: 'alert', heading: Math.atan2(dy, dx) + Math.PI / 2, attackCooldownMs: 2_900 };
    }
    if (remaining < 330) return { ...hostile, status: 'alert', heading: Math.atan2(dy, dx) + Math.PI / 2, attackCooldownMs };
    const travel = Math.min(remaining - 330, deltaMs * (hostile.kind === 'raider' ? 0.052 : 0.038));
    return {
      ...hostile,
      status: 'alert',
      position: { x: hostile.position.x + dx / remaining * travel, y: hostile.position.y + dy / remaining * travel },
      heading: Math.atan2(dy, dx) + Math.PI / 2,
      attackCooldownMs,
    };
  });
  return {
    ...state,
    hostiles,
    hull: playerHull,
    dummyRespawns: nextRespawns.filter((entry) => entry.remainingMs > 0),
    log: [...attackLogs, ...(respawned.length > 0 ? [`${respawned.map((dummy) => dummy.name).join(' und ')} erneut signalisiert.`] : []), ...state.log].slice(0, MAX_LOG_ENTRIES),
  };
}

function scenarioSignals(scenario: ExpeditionScenario): readonly SignalState[] {
  const firstWreck: SignalState = { id: 'echo-wreck', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Gebrochene Reliquie', classifiedDescription: 'Ein kleines Ordenswrack. Die Hülle ist offen, aber stabil.', position: { x: 2_520, y: 1_230 }, knowledge: 'echo', risk: 'low' };
  const blackVein: SignalState = { id: 'black-vein', kind: 'vein', name: 'Unbekanntes Echo', classifiedName: 'Schwarze Ader', classifiedDescription: 'Verdichtete Legierungen liegen knapp unter einer ruhigen Staubwolke.', position: { x: 2_520, y: 1_830 }, knowledge: 'echo', risk: 'low' };
  if (scenario === 'first-wreck') return [firstWreck];
  if (scenario === 'second-shift') return [
    { id: 'monk-lantern', kind: 'distress', name: 'Unbekanntes Echo', classifiedName: 'Mönchslaterne', classifiedDescription: 'Ein sanftes Notsignal. Seine kleine Reliquie liegt offen und wirkt sicher.', position: { x: 2_510, y: 1_235 }, knowledge: 'echo', risk: 'low', reward: { kind: 'relics', amount: 1, text: 'Die Mönchslaterne wird geborgen. Ein Reliktkern ist gesichert.' } },
    { id: 'cutting-liturgy', kind: 'anomaly', name: 'Unbekanntes Echo', classifiedName: 'Schneideliturgie', classifiedDescription: 'Fremde Routinen zeichnen eine Bauanleitung für präzise Abbauausleger. Ihre Nähe zerrt an der Hülle.', position: { x: 1_720, y: 1_240 }, knowledge: 'echo', risk: 'high', reward: { kind: 'data', amount: 2, hullCost: 6, text: 'Die Schneideliturgie wird entschlüsselt. Zwei Datensätze für einen Minenlaser sind gesichert. Hülle -6.' } },
    blackVein,
  ];
  if (scenario === 'mining-run') return [
    blackVein,
    { id: 'raider-cache', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Versiegelte Plündererkiste', classifiedDescription: 'Eine schwere Kiste mit Daten und Legierungen. Der Aschenplünderer patrouilliert direkt daneben.', position: { x: 2_920, y: 1_540 }, knowledge: 'echo', risk: 'high', guardedBy: 'ash-reaver', reward: { kind: 'alloys', amount: 3, text: 'Die Plündererkiste fällt auf. Drei Legierungen sind als Bonusbeute gesichert.' } },
  ];
  return [
    firstWreck,
    { id: 'echo-vein', kind: 'vein', name: 'Unbekanntes Echo', position: { x: 3_340, y: 680 }, knowledge: 'echo', risk: 'low' },
    { id: 'echo-anomaly', kind: 'anomaly', name: 'Unbekanntes Echo', position: { x: 1_180, y: 540 }, knowledge: 'echo', risk: 'high' },
    { id: 'echo-distress', kind: 'distress', name: 'Unbekanntes Echo', position: { x: 1_360, y: 2_120 }, knowledge: 'echo', risk: 'medium' },
  ];
}

function scenarioHostiles(scenario: ExpeditionScenario): readonly HostileState[] {
  if (scenario === 'mining-run') return [{ ...ASH_REAVER, position: { ...ASH_REAVER.position }, patrolCenter: { ...ASH_REAVER.patrolCenter } }];
  return TRAINING_DUMMIES.map((dummy): HostileState => ({ ...dummy, position: { ...dummy.position }, patrolCenter: { ...dummy.patrolCenter } }));
}

export function createExpedition(scanBonus = 0, cargoBonus = 0, scenario: ExpeditionScenario = 'free'): ExpeditionState {
  return {
    sectorId: 'ashenscar',
    sectorName: 'Aschsaum I',
    scenario,
    status: 'active',
    position: ORIGIN,
    heading: 0,
    flightInput: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    origin: ORIGIN,
    energy: 100,
    maxEnergy: 100,
    hull: 100,
    maxHull: 100,
    cargo: { alloys: 0, data: 0, relics: 0 },
    cargoCapacity: 6 + cargoBonus,
    scanRadius: 560 + scanBonus,
    signals: scenarioSignals(scenario),
    hostiles: scenarioHostiles(scenario),
    dummyRespawns: [],
    log: ['Die Schleuse von Farhaven schließt sich hinter dir.'],
  };
}

export function canEnterWormhole(state: ExpeditionState): boolean {
  return state.sectorId === 'ashenscar'
    && state.status === 'active'
    && distance(state.position, WORMHOLE_POSITION) <= WORMHOLE_ENTRY_RANGE;
}

export function enterWormhole(state: ExpeditionState): ExpeditionState {
  if (!canEnterWormhole(state)) return appendLog(state, 'Das Xenogate ist noch außer Reichweite.');
  return {
    ...state,
    sectorId: 'veloria-rift',
    sectorName: 'Veloria Rift',
    scenario: 'free',
    position: { x: 2_100, y: 1_500 },
    origin: { x: 2_100, y: 1_500 },
    flightInput: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    course: undefined,
    signals: [
      { id: 'veloria-husk', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Schalenbarke', classifiedDescription: 'Eine stumme, organische Barke treibt unter den Lichtern der Rift.', position: { x: 2_470, y: 1_180 }, knowledge: 'echo', risk: 'medium' },
      { id: 'veloria-crystal', kind: 'vein', name: 'Unbekanntes Echo', classifiedName: 'Resonanzader', classifiedDescription: 'Kristallines Erz singt in einem fremden Takt.', position: { x: 1_500, y: 1_030 }, knowledge: 'echo', risk: 'low' },
      { id: 'veloria-choir', kind: 'anomaly', name: 'Unbekanntes Echo', classifiedName: 'Der leise Chor', classifiedDescription: 'Ein Chor aus Lichtmustern erwartet eine Deutung.', position: { x: 1_680, y: 2_060 }, knowledge: 'echo', risk: 'high' },
    ],
    hostiles: [],
    dummyRespawns: [],
    log: ['Veloria Rift · Platzhalterkarte betreten. Scanne die fremden Echos und kehre mit deinen Funden zurück.'],
  };
}

export function setCourse(state: ExpeditionState, destination: Vector2): ExpeditionState {
  if (state.status !== 'active') return state;
  return appendLog({ ...state, course: destination }, 'Kurs gesetzt. Antrieb auf leise Reisegeschwindigkeit.');
}

export function setFlightInput(state: ExpeditionState, input: Vector2): ExpeditionState {
  if (state.status !== 'active') return state;
  const length = Math.hypot(input.x, input.y);
  const limited = length > 1 ? { x: input.x / length, y: input.y / length } : input;
  return { ...state, flightInput: limited, course: undefined };
}

export function stepExpedition(state: ExpeditionState, deltaMs: number): ExpeditionState {
  if (state.status === 'active' && Math.hypot(state.flightInput.x, state.flightInput.y) > 0.05) {
    const desiredSpeed = 0.23;
    const desired = { x: state.flightInput.x * desiredSpeed, y: state.flightInput.y * desiredSpeed };
    const acceleration = deltaMs * 0.00042;
    const velocity = {
      x: state.velocity.x + Math.max(-acceleration, Math.min(acceleration, desired.x - state.velocity.x)),
      y: state.velocity.y + Math.max(-acceleration, Math.min(acceleration, desired.y - state.velocity.y)),
    };
    const position = {
      x: Math.max(55, Math.min(WORLD_WIDTH - 55, state.position.x + velocity.x * deltaMs)),
      y: Math.max(55, Math.min(WORLD_HEIGHT - 55, state.position.y + velocity.y * deltaMs)),
    };
    return advanceHostiles(rechargeSystems({
      ...state,
      position,
      velocity,
      heading: Math.atan2(velocity.y, velocity.x) + Math.PI / 2,
    }, deltaMs), deltaMs);
  }
  if (state.status === 'active' && Math.hypot(state.velocity.x, state.velocity.y) > 0.001) {
    const drag = Math.pow(0.9975, deltaMs);
    const velocity = { x: state.velocity.x * drag, y: state.velocity.y * drag };
    return advanceHostiles(rechargeSystems({
      ...state,
      velocity,
      position: {
        x: Math.max(55, Math.min(WORLD_WIDTH - 55, state.position.x + velocity.x * deltaMs)),
        y: Math.max(55, Math.min(WORLD_HEIGHT - 55, state.position.y + velocity.y * deltaMs)),
      },
      heading: Math.atan2(velocity.y, velocity.x) + Math.PI / 2,
    }, deltaMs), deltaMs);
  }
  const target = state.status === 'returning' ? state.origin : state.course;
  if (!target || deltaMs <= 0) return advanceHostiles(rechargeSystems(state, deltaMs), deltaMs);
  const remaining = distance(state.position, target);
  if (remaining < 3) {
    return advanceHostiles(rechargeSystems(state.status === 'returning'
      ? { ...state, position: target, course: undefined }
      : { ...state, position: target, course: undefined }, deltaMs), deltaMs);
  }
  const travel = Math.min(remaining, deltaMs * 0.085);
  const ratio = travel / remaining;
  const nextPosition = {
    x: state.position.x + (target.x - state.position.x) * ratio,
    y: state.position.y + (target.y - state.position.y) * ratio,
  };
  return advanceHostiles(rechargeSystems({
    ...state,
    position: nextPosition,
    velocity: { x: 0, y: 0 },
    course: remaining - travel < 3 ? undefined : state.course,
  }, deltaMs), deltaMs);
}

export function scan(state: ExpeditionState): ExpeditionState {
  if (state.status !== 'active' || state.energy < 8) return appendLog(state, 'Scanner nicht bereit: mindestens 8 Systemladung erforderlich.');
  let found = 0;
  const signals = state.signals.map((signal) => {
    if (signal.knowledge !== 'echo' || distance(signal.position, state.position) > state.scanRadius) return signal;
    found += 1;
    const detail = SIGNAL_DETAILS[signal.kind];
    return {
      ...signal,
      name: signal.classifiedName ?? detail.name,
      risk: detail.risk,
      description: signal.classifiedDescription ?? detail.description,
      knowledge: 'classified' as const,
    };
  });
  return appendLog({ ...state, signals, energy: state.energy - 8 }, found > 0 ? `${found} Signal${found === 1 ? '' : 'e'} klassifiziert.` : 'Scan beendet. Nur Stille antwortet.');
}

export function investigate(state: ExpeditionState, signalId: string): ExpeditionState {
  const signal = state.signals.find((candidate) => candidate.id === signalId);
  if (!signal || signal.knowledge !== 'classified') return appendLog(state, 'Dieses Signal kann noch nicht untersucht werden.');
  if (distance(state.position, signal.position) > 112) return appendLog(state, 'Für eine Untersuchung musst du näher heranfliegen.');
  const guard = signal.guardedBy ? state.hostiles.find((hostile) => hostile.id === signal.guardedBy) : undefined;
  if (guard) return appendLog(state, `${signal.name} ist durch ${guard.name} bewacht. Du kannst umkehren oder den Plünderer vertreiben.`);
  if (cargoTotal(state.cargo) >= state.cargoCapacity) return appendLog(state, 'Der Frachtraum ist voll. Sichere die Fracht in Farhaven.');

  const rewards: Record<SignalKind, { kind: ResourceKind; amount: number; hullCost?: number; text: string }> = {
    wreck: { kind: 'alloys', amount: 3, text: 'Bergung abgeschlossen: alte Platten und ein intakter Kreiselkern.' },
    vein: { kind: 'alloys', amount: 2, text: 'Die Greifer lösen dunkle Legierungen aus der Ader.' },
    anomaly: { kind: 'data', amount: 2, text: 'Die Liturgie zerfällt in verwertbare Sternendaten.' },
    distress: { kind: 'relics', amount: 1, text: 'Die Laterne erlischt. In ihrem Gehäuse liegt eine kleine Reliquie.' },
  };
  const reward = signal.reward ?? rewards[signal.kind];
  const signals = state.signals.map((candidate) => candidate.id === signalId ? { ...candidate, knowledge: 'resolved' as const } : candidate);
  return appendLog({
    ...state,
    signals,
    hull: Math.max(0, state.hull - (reward.hullCost ?? 0)),
    cargo: addCargo(state.cargo, reward.kind, reward.amount),
  }, reward.text);
}

export function mineVein(state: ExpeditionState, signalId: string): ExpeditionState {
  const signal = state.signals.find((candidate) => candidate.id === signalId);
  if (!signal || signal.kind !== 'vein' || signal.knowledge !== 'classified') return appendLog(state, 'Diese Ader kann nicht abgebaut werden.');
  if (distance(state.position, signal.position) > 128) return appendLog(state, 'Für den Abbau musst du näher an die Ader heranfliegen.');
  if (state.energy < 10) return appendLog(state, 'Minenlaser nicht bereit: mindestens 10 Systemladung erforderlich.');
  if (cargoTotal(state.cargo) + 3 > state.cargoCapacity) return appendLog(state, 'Zu wenig Frachtraum für die geborgenen Legierungen.');
  const signals = state.signals.map((candidate) => candidate.id === signalId ? { ...candidate, knowledge: 'resolved' as const } : candidate);
  return appendLog({
    ...state,
    signals,
    energy: state.energy - 10,
    cargo: addCargo(state.cargo, 'alloys', 3),
  }, 'Minenlaser schneiden die Schwarze Ader auf. Drei Legierungen sind gesichert.');
}

export function returnToFarhaven(state: ExpeditionState): ExpeditionState {
  if (state.status === 'returning') return state;
  return appendLog({ ...state, status: 'returning', flightInput: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, course: state.origin }, 'Rücksprung nach Farhaven berechnet. Fracht wird gesichert, wenn du anlegst.');
}

export interface WeaponReadiness {
  readonly ready: boolean;
  readonly reason: string;
}

const WEAPON_RULES: Record<WeaponMode, { energy: number; range: number; damage: number; name: string }> = {
  broadside: { energy: 4, range: 430, damage: 1, name: 'Breitseite' },
  rail: { energy: 10, range: 620, damage: 2, name: 'Rail-Lanze' },
  torpedo: { energy: 13, range: 700, damage: 3, name: 'Torpedo' },
  orb: { energy: 15, range: 500, damage: 2, name: 'Energiekugel' },
};

export function weaponReadiness(state: ExpeditionState, targetId: string | undefined, weapon: WeaponMode): WeaponReadiness {
  const target = state.hostiles.find((hostile) => hostile.id === targetId);
  if (state.status !== 'active') return { ready: false, reason: 'Rückkehr aktiv' };
  if (!target) return { ready: false, reason: 'Ziel auf Karte antippen' };
  const rules = WEAPON_RULES[weapon];
  const targetDistance = distance(target.position, state.position);
  if (targetDistance > rules.range) return { ready: false, reason: `Außer Reichweite · ${Math.round(targetDistance)}u` };
  if (state.energy < rules.energy) return { ready: false, reason: `Zu wenig Systemladung · ${rules.energy} nötig` };
  const forward = forwardVector(state.heading);
  const toTarget = { x: (target.position.x - state.position.x) / targetDistance, y: (target.position.y - state.position.y) / targetDistance };
  const forwardDot = forward.x * toTarget.x + forward.y * toTarget.y;
  if (weapon === 'broadside' && Math.abs(forwardDot) > 0.78) return { ready: false, reason: 'Für Breitseite seitlich ausrichten' };
  if (weapon === 'rail' && forwardDot < 0.74) return { ready: false, reason: 'Lanze nach vorn ausrichten' };
  if (weapon === 'torpedo' && forwardDot < 0.15) return { ready: false, reason: 'Torpedo braucht Frontkorridor' };
  return { ready: true, reason: `Feuer frei · ${target.name}` };
}

export function fireWeapon(state: ExpeditionState, targetId: string | undefined, weapon: WeaponMode): ExpeditionState {
  const readiness = weaponReadiness(state, targetId, weapon);
  if (!readiness.ready) return appendLog(state, readiness.reason);
  const target = state.hostiles.find((hostile) => hostile.id === targetId)!;
  const rules = WEAPON_RULES[weapon];
  const hostiles = state.hostiles
    .map((hostile): HostileState => hostile.id !== target.id ? hostile : { ...hostile, status: hostile.passive ? 'patrol' : 'alert', hull: hostile.hull - rules.damage })
    .filter((hostile) => hostile.hull > 0);
  const ending = target.hull <= rules.damage;
  const dummyRespawns = target.passive && ending ? [...(state.dummyRespawns ?? []), { hostileId: target.id, remainingMs: DUMMY_RESPAWN_MS }] : (state.dummyRespawns ?? []);
  const result = ending
    ? target.passive ? `${target.name} zerfällt. Ein neues Prüfsignal wird vorbereitet.` : `${target.name} bricht in glühende Trümmer.`
    : target.passive ? `${rules.name} trifft ${target.name}. Keine Gegenwehr.` : `${rules.name} trifft ${target.name}. Alarmlichter erwachen.`;
  return appendLog({ ...state, hostiles, dummyRespawns, energy: state.energy - rules.energy }, result);
}

export function firePrimary(state: ExpeditionState, targetId?: string): ExpeditionState {
  const nearest = [...state.hostiles].sort((first, second) => distance(first.position, state.position) - distance(second.position, state.position))[0];
  return fireWeapon(state, targetId ?? nearest?.id, 'broadside');
}

export function isHome(state: ExpeditionState): boolean {
  return state.status === 'returning' && distance(state.position, state.origin) < 4;
}

export function finishExpedition(state: ExpeditionState): ExpeditionResult {
  return { cargo: state.cargo, log: state.log };
}
