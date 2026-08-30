import type { Cargo, ExpeditionResult, ExpeditionScenario, ExpeditionState, HostileState, ResourceKind, SignalKind, SignalState, Vector2, WeaponMode } from './types';
import { advanceProjectiles, hostileHitRadius, launchProjectile } from './projectiles';

const ORIGIN: Vector2 = { x: 2_100, y: 1_500 };
const WORLD_WIDTH = 4_200;
const WORLD_HEIGHT = 2_600;
const MAX_LOG_ENTRIES = 4;
const SYSTEM_RECHARGE_PER_MS = 0.012;
const RETURN_TRAVEL_SPEED = 0.3;
const WATCH_RADIUS = 560;
const ALERT_RADIUS = 420;
const ESCAPE_RADIUS = 780;
export const WORMHOLE_POSITION: Vector2 = { x: 1_360, y: 1_320 };
const WORMHOLE_ENTRY_RANGE = 170;

const TRAINING_DUMMIES: readonly HostileState[] = [
  // The practice ring surrounds the player but deliberately avoids the top status strip,
  // lower combat prompt and right-side action cluster on a landscape phone.
  { id: 'ash-patrol', name: 'Aschen-Attrappe', kind: 'patrol', passive: true, status: 'patrol', position: { x: 1_880, y: 1_460 }, patrolCenter: { x: 1_880, y: 1_460 }, patrolRadius: 0, patrolPhase: 0, heading: Math.PI, hull: 4, maxHull: 4 },
  { id: 'cinder-escort', name: 'Glut-Attrappe', kind: 'patrol', passive: true, status: 'patrol', position: { x: 2_390, y: 1_460 }, patrolCenter: { x: 2_390, y: 1_460 }, patrolRadius: 0, patrolPhase: 0, heading: Math.PI / 2, hull: 3, maxHull: 3 },
  { id: 'wreck-eater', name: 'Schrott-Attrappe', kind: 'raider', passive: true, status: 'patrol', position: { x: 1_870, y: 1_610 }, patrolCenter: { x: 1_870, y: 1_610 }, patrolRadius: 0, patrolPhase: 0, heading: Math.PI, hull: 6, maxHull: 6 },
];

const ASH_REAVER: HostileState = {
  id: 'ash-reaver', name: 'Aschenplünderer', kind: 'raider', passive: false, status: 'patrol',
  position: { x: 2_980, y: 1_470 }, patrolCenter: { x: 2_980, y: 1_470 }, patrolRadius: 76,
  patrolPhase: 0, heading: Math.PI / 2, hull: 4, maxHull: 4, attackCooldownMs: 0,
};

const FIRST_CINDER_SKIF: HostileState = {
  id: 'first-cinder-skiff', name: 'Glutkutter', kind: 'patrol', passive: false, status: 'patrol',
  position: { x: 2_650, y: 1_160 }, patrolCenter: { x: 2_650, y: 1_160 }, patrolRadius: 82,
  patrolPhase: Math.PI, heading: Math.PI / 2, hull: 8, maxHull: 8, attackCooldownMs: 0,
};

const SECOND_SHIFT_REAVER: HostileState = {
  ...ASH_REAVER,
  id: 'cipher-reaver',
  name: 'Liturgie-Räuber',
  position: { x: 2_980, y: 1_820 },
  patrolCenter: { x: 2_980, y: 1_820 },
  hull: 10,
  maxHull: 10,
};

const RECOVERY_HOSTILES: readonly HostileState[] = [
  {
    id: 'cinder-skiff', name: 'Glutkutter', kind: 'patrol', passive: false, status: 'patrol',
    position: { x: 2_980, y: 1_030 }, patrolCenter: { x: 2_980, y: 1_030 }, patrolRadius: 112,
    patrolPhase: 0, heading: Math.PI / 2, hull: 3, maxHull: 3, attackCooldownMs: 0,
  },
  {
    id: 'vault-sentinel', name: 'Reliquienwächter', kind: 'sentinel', passive: false, status: 'patrol',
    position: { x: 1_210, y: 1_900 }, patrolCenter: { x: 1_210, y: 1_900 }, patrolRadius: 34,
    patrolPhase: Math.PI, heading: 0, hull: 7, maxHull: 7, attackCooldownMs: 0,
  },
  {
    id: 'ash-cantor', name: 'Aschenkantor', kind: 'guardian', passive: false, status: 'patrol',
    position: { x: 1_055, y: 1_335 }, patrolCenter: { x: 1_055, y: 1_335 }, patrolRadius: 0,
    patrolPhase: 0, heading: Math.PI / 2, hull: 14, maxHull: 14, attackCooldownMs: 0,
  },
];

const SIGNAL_DETAILS: Record<SignalKind, Pick<SignalState, 'name' | 'risk' | 'description'>> = {
  wreck: { name: 'Gebrochene Reliquie', risk: 'low', description: 'Ein Ordenswrack der verlorenen Farhaven-Versorgungsroute. Die Hülle ist offen, aber stabil.' },
  vein: { name: 'Schwarze Ader', risk: 'low', description: 'Unter der Staubwolke liegt ein eingekapselter Routenverstärker neben verdichteten Legierungen.' },
  anomaly: { name: 'Violette Liturgie', risk: 'high', description: 'Ein singendes Feld hält verschlüsselte Routendaten fest. Seine Nähe zerrt an der Hülle.' },
  distress: { name: 'Laterne im Staub', risk: 'medium', description: 'Ein Pilgersignal der verlorenen Route. Seine Quelle reagiert nicht auf Standardfunk.' },
};

function distance(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function headingToward(from: Vector2, to: Vector2): number {
  return Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
}

function addCargo(cargo: Cargo, kind: ResourceKind, amount: number): Cargo {
  return { ...cargo, [kind]: cargo[kind] + amount };
}

function cargoTotal(cargo: Cargo): number {
  return cargo.alloys + cargo.data + cargo.relics;
}

const SIGNAL_REWARDS: Readonly<Record<SignalKind, NonNullable<SignalState['reward']>>> = {
  wreck: { kind: 'alloys', amount: 3, text: 'Bergung abgeschlossen: Farhaven-Platten und ein Kreiselkern tragen dieselbe Routenkennung wie das Xenogate.' },
  vein: { kind: 'alloys', amount: 3, text: 'Die Minenlaser lösen Legierungen aus der Ader. Der freigelegte Routenverstärker antwortet auf Farhavens Kennung.' },
  anomaly: { kind: 'data', amount: 2, text: 'Die Liturgie zerfällt in Routendaten: Die Versorgungslinie wurde in Richtung Xenogate umgeleitet. Hülle -6.' },
  distress: { kind: 'relics', amount: 1, text: 'Die Mönchslaterne erlischt. Ihr Reliktkern enthält die erste Hälfte einer alten Navigationslitanei.' },
};

export function rewardForSignal(signal: SignalState): NonNullable<SignalState['reward']> {
  return signal.reward ?? SIGNAL_REWARDS[signal.kind];
}

/** The claw bonus is kept with the expedition so every presentation surface shows the real haul. */
export function rewardForExpeditionSignal(state: ExpeditionState | undefined, signal: SignalState): NonNullable<SignalState['reward']> {
  const reward = rewardForSignal(signal);
  return signal.kind === 'wreck' && (state?.salvageBonus ?? 0) > 0
    ? { ...reward, amount: reward.amount + (state?.salvageBonus ?? 0) }
    : reward;
}

function appendLog(state: ExpeditionState, entry: string): ExpeditionState {
  return { ...state, log: [entry, ...state.log].slice(0, MAX_LOG_ENTRIES) };
}

function rechargeSystems(state: ExpeditionState, deltaMs: number): ExpeditionState {
  if (deltaMs <= 0) return state;
  const current = state.weaponCooldowns ?? { broadside: 0, rail: 0, torpedo: 0, orb: 0 };
  return {
    ...state,
    energy: Math.min(state.maxEnergy, state.energy + deltaMs * SYSTEM_RECHARGE_PER_MS),
    weaponCooldowns: {
      broadside: Math.max(0, current.broadside - deltaMs),
      rail: Math.max(0, current.rail - deltaMs),
      torpedo: Math.max(0, current.torpedo - deltaMs),
      orb: Math.max(0, current.orb - deltaMs),
    },
  };
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
  let shots = state;
  const hostiles: HostileState[] = [...state.hostiles, ...respawned].map((hostile): HostileState => {
    if (hostile.passive) return hostile;
    const dx = state.position.x - hostile.position.x;
    const dy = state.position.y - hostile.position.y;
    const remaining = Math.hypot(dx, dy);
    const attackCooldownMs = Math.max(0, (hostile.attackCooldownMs ?? 0) - deltaMs);
    const alertRadius = hostile.kind === 'guardian' ? 500 : ALERT_RADIUS;
    const escapeRadius = hostile.kind === 'guardian' ? 860 : ESCAPE_RADIUS;
    const alerted = hostile.status === 'alert' || remaining < alertRadius;
    if (!alerted || remaining > escapeRadius) {
      if (hostile.status === 'alert' && remaining > escapeRadius) attackLogs.push(`${hostile.name} bricht die Verfolgung ab.`);
      const patrolPhase = hostile.patrolPhase + deltaMs * 0.00034;
      const position = {
        x: hostile.patrolCenter.x + Math.cos(patrolPhase) * hostile.patrolRadius,
        y: hostile.patrolCenter.y + Math.sin(patrolPhase) * hostile.patrolRadius,
      };
      const status = remaining < WATCH_RADIUS ? 'watchful' as const : 'patrol' as const;
      return { ...hostile, status, position, patrolPhase, heading: patrolPhase + Math.PI, attackCooldownMs };
    }
    if (hostile.status !== 'alert' && remaining < alertRadius) {
      const warningMs = hostile.kind === 'guardian' ? 2_600 : hostile.kind === 'sentinel' ? 2_100 : hostile.kind === 'patrol' ? 1_050 : 1_350;
      return { ...hostile, status: 'alert', heading: Math.atan2(dy, dx) + Math.PI / 2, attackCooldownMs: warningMs };
    }
    if (remaining <= (hostile.kind === 'guardian' ? 500 : 430) && attackCooldownMs <= 0) {
      const damage = hostile.kind === 'guardian' ? 11 : hostile.kind === 'sentinel' ? 8 : hostile.kind === 'patrol' ? 3 : 4;
      const weapon = hostile.kind === 'guardian' || hostile.kind === 'sentinel' ? 'orb' : 'broadside';
      shots = launchProjectile(shots, hostile.id, 'hostile', weapon, hostile.position, { x: dx, y: dy }, damage, 750);
      attackLogs.push(`${hostile.name} feuert – Einschlag durch Ausweichen vermeiden.`);
      return { ...hostile, status: 'alert', heading: Math.atan2(dy, dx) + Math.PI / 2, attackCooldownMs: hostile.kind === 'guardian' ? 6_200 : hostile.kind === 'sentinel' ? 4_800 : hostile.kind === 'patrol' ? 2_250 : 2_900 };
    }
    if (hostile.kind === 'sentinel' || hostile.kind === 'guardian') return { ...hostile, status: 'alert', heading: Math.atan2(dy, dx) + Math.PI / 2, attackCooldownMs };
    const desiredRange = hostile.kind === 'patrol' ? 285 : 330;
    const approach = remaining > desiredRange ? Math.min(remaining - desiredRange, deltaMs * (hostile.kind === 'raider' ? 0.052 : 0.044)) : 0;
    const orbit = hostile.kind === 'patrol' ? deltaMs * 0.025 : 0;
    const side = hostile.id.length % 2 === 0 ? 1 : -1;
    return {
      ...hostile,
      status: 'alert',
      position: {
        x: hostile.position.x + dx / remaining * approach - dy / remaining * orbit * side,
        y: hostile.position.y + dy / remaining * approach + dx / remaining * orbit * side,
      },
      heading: Math.atan2(dy, dx) + Math.PI / 2,
      attackCooldownMs,
    };
  });
  return {
    ...shots,
    hostiles,
    dummyRespawns: nextRespawns.filter((entry) => entry.remainingMs > 0),
    log: [...attackLogs, ...(respawned.length > 0 ? [`${respawned.map((dummy) => dummy.name).join(' und ')} erneut signalisiert.`] : []), ...state.log].slice(0, MAX_LOG_ENTRIES),
  };
}

function scenarioSignals(scenario: ExpeditionScenario): readonly SignalState[] {
  const firstWreck: SignalState = { id: 'echo-wreck', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Reliquie der Versorgungsroute', classifiedDescription: 'Ein Ordenswrack mit Farhaven-Kennung. Seine Platten zeigen auf eine verlorene Route zum Xenogate.', position: { x: 2_520, y: 1_230 }, knowledge: 'echo', risk: 'low' };
  const blackVein: SignalState = { id: 'black-vein', kind: 'vein', name: 'Unbekanntes Echo', classifiedName: 'Routenader', classifiedDescription: 'Legierungen kapseln einen alten Routenverstärker ein. Der Minenlaser kann ihn freilegen.', position: { x: 2_520, y: 1_830 }, knowledge: 'echo', risk: 'low' };
  if (scenario === 'first-wreck') return [
    {
      ...firstWreck,
      classifiedDescription: 'Die äußeren Platten reichen für Farhavens Hangar. Du kannst sie schnell sichern und dem Glutkutter entkommen.',
      reward: { kind: 'alloys', amount: 3, text: 'Die äußeren Routenplatten sind gesichert. Farhaven kann damit den Hangar verbinden.' },
    },
    {
      id: 'first-skiff-cache', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Glutkutter-Fracht',
      classifiedDescription: 'Zusätzliche Platten und ein fremder Waffenkern. Der Glutkutter gibt seine Beute nur frei, wenn du ihn vertreibst.',
      position: { x: 2_465, y: 1_110 }, knowledge: 'echo', risk: 'high', guardedBy: 'first-cinder-skiff',
      reward: { kind: 'alloys', amount: 2, text: 'Die Glutkutter-Fracht ist gesichert. Zwei zusätzliche Legierungen und Fragmente eines Waffenkerns kehren nach Farhaven zurück.' },
    },
  ];
  if (scenario === 'second-shift') return [
    { id: 'monk-lantern', kind: 'distress', name: 'Unbekanntes Echo', classifiedName: 'Mönchslaterne', classifiedDescription: 'Ein sanftes Pilgersignal. Der Reliktkern bewahrt die erste Hälfte einer Navigationslitanei — sicher zu bergen.', position: { x: 2_510, y: 1_235 }, knowledge: 'echo', risk: 'low', reward: { kind: 'relics', amount: 1, text: 'Die Mönchslaterne wird geborgen. Ihr Reliktkern bewahrt die erste Hälfte der Routenlitanei.' } },
    { id: 'cutting-liturgy', kind: 'anomaly', name: 'Unbekanntes Echo', classifiedName: 'Schneideliturgie', classifiedDescription: 'Fremde Routinen halten die zweite Hälfte der Route fest. Ihre Nähe zerrt an der Hülle.', position: { x: 1_720, y: 1_240 }, knowledge: 'echo', risk: 'high', reward: { kind: 'data', amount: 2, hullCost: 6, text: 'Die Schneideliturgie wird entschlüsselt. Die zweite Routenhälfte nennt eine versiegelte Ader. Hülle -6.' } },
    { id: 'wayfarer-archive', kind: 'anomaly', name: 'Unbekanntes Echo', classifiedName: 'Wandererarchiv', classifiedDescription: 'Ein beschädigtes, aber ungefährliches Archiv. Kleine Datenpakete können ohne Hüllenrisiko geborgen werden.', position: { x: 3_340, y: 2_080 }, knowledge: 'echo', risk: 'low', reward: { kind: 'data', amount: 1, text: 'Das Wandererarchiv gibt einen Datensatz frei. Der sichere Weg dauert länger, beschädigt aber die Hülle nicht.' } },
    { id: 'raider-cipher', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Geraubte Chiffre', classifiedDescription: 'Zwei Datensätze liegen im Griff eines Liturgie-Räubers. Kampf ist eine schnelle, freiwillige Alternative zur gefährlichen Anomalie.', position: { x: 2_950, y: 1_800 }, knowledge: 'echo', risk: 'high', guardedBy: 'cipher-reaver', reward: { kind: 'data', amount: 2, text: 'Die geraubte Chiffre ist gesichert. Zwei Datensätze reichen für die nächste Waffenmontage.' } },
    blackVein,
  ];
  if (scenario === 'mining-run') return [
    blackVein,
    { id: 'raider-cache', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Plündererkiste der Route', classifiedDescription: 'Der Aschenplünderer bewacht eine Kiste mit gestohlenen Routenplatten. Du darfst ihn meiden oder vertreiben.', position: { x: 2_920, y: 1_540 }, knowledge: 'echo', risk: 'high', guardedBy: 'ash-reaver', reward: { kind: 'alloys', amount: 3, text: 'Die Plündererkiste fällt auf. Gestohlene Routenplatten und drei Legierungen sind gesichert.' } },
  ];
  if (scenario === 'recovery-run') return [
    { id: 'drift-smelter', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Treibende Schmelze', classifiedDescription: 'Ein aufgebrochener Lastkahn trägt noch verwertbare Legierungsplatten.', position: { x: 2_620, y: 970 }, knowledge: 'echo', risk: 'low', reward: { kind: 'alloys', amount: 2, text: 'Zwei Legierungen wandern aus der treibenden Schmelze in den Frachtraum.' } },
    { id: 'cold-archive', kind: 'anomaly', name: 'Unbekanntes Echo', classifiedName: 'Kaltes Archiv', classifiedDescription: 'Ein stiller Datenspeicher mit geringer Feldspannung. Die Deutung kostet etwas Hülle.', position: { x: 1_460, y: 870 }, knowledge: 'echo', risk: 'medium', reward: { kind: 'data', amount: 2, hullCost: 2, text: 'Das kalte Archiv gibt zwei Datensätze frei. Hülle -2.' } },
    { id: 'pilgrim-vigil', kind: 'distress', name: 'Unbekanntes Echo', classifiedName: 'Pilgerwacht', classifiedDescription: 'Eine verlassene Gebetskapsel bewahrt einen kleinen Reliktkern. Der ortsfeste Reliquienwächter kontrolliert nur ihren direkten Raum.', position: { x: 1_330, y: 1_900 }, knowledge: 'echo', risk: 'medium', guardedBy: 'vault-sentinel', reward: { kind: 'relics', amount: 1, text: 'Der Reliktkern der Pilgerwacht ist gesichert.' } },
    { id: 'working-vein', kind: 'vein', name: 'Unbekanntes Echo', classifiedName: 'Offene Eisenader', classifiedDescription: 'Eine wiederkehrende Abbaustelle für Farhavens Maschinen.', position: { x: 3_320, y: 2_020 }, knowledge: 'echo', risk: 'low', reward: { kind: 'alloys', amount: 3, text: 'Drei Legierungen werden aus der offenen Ader geschnitten.' } },
    { id: 'skiff-cache', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Glutkutter-Beute', classifiedDescription: 'Gestohlene Platten hinter einer schnellen Flankenpatrouille. Kampf ist optional; außerhalb ihrer Zone verliert sie das Interesse.', position: { x: 3_050, y: 1_090 }, knowledge: 'echo', risk: 'high', guardedBy: 'cinder-skiff', reward: { kind: 'alloys', amount: 3, text: 'Die Beute des Glutkutters ist gesichert: drei Legierungen.' } },
    { id: 'cantor-reliquary', kind: 'distress', name: 'Unbekanntes Echo', classifiedName: 'Kantorenherz', classifiedDescription: 'Ein einzigartiger Reliktkern hinter dem Aschenkantor. Bekämpfe ihn – oder beruhige seine Liturgie mit der Breitbandarray aus kurzer Distanz.', position: { x: 905, y: 1_335 }, knowledge: 'echo', risk: 'high', guardedBy: 'ash-cantor', reward: { kind: 'relics', amount: 2, text: 'Das Kantorenherz ist gesichert. Farhaven archiviert seinen Bauplan als einzigartiges Wächterrelikt.' } },
  ];
  return [
    firstWreck,
    { id: 'echo-vein', kind: 'vein', name: 'Unbekanntes Echo', position: { x: 3_340, y: 680 }, knowledge: 'echo', risk: 'low' },
    { id: 'echo-anomaly', kind: 'anomaly', name: 'Unbekanntes Echo', position: { x: 1_180, y: 540 }, knowledge: 'echo', risk: 'high' },
    { id: 'echo-distress', kind: 'distress', name: 'Unbekanntes Echo', position: { x: 1_360, y: 2_120 }, knowledge: 'echo', risk: 'medium' },
  ];
}

function scenarioHostiles(scenario: ExpeditionScenario): readonly HostileState[] {
  if (scenario === 'first-wreck') return [{ ...FIRST_CINDER_SKIF, position: { ...FIRST_CINDER_SKIF.position }, patrolCenter: { ...FIRST_CINDER_SKIF.patrolCenter } }];
  if (scenario === 'second-shift') return [{ ...SECOND_SHIFT_REAVER, position: { ...SECOND_SHIFT_REAVER.position }, patrolCenter: { ...SECOND_SHIFT_REAVER.patrolCenter } }];
  if (scenario === 'mining-run') return [{ ...ASH_REAVER, position: { ...ASH_REAVER.position }, patrolCenter: { ...ASH_REAVER.patrolCenter } }];
  if (scenario === 'recovery-run') return RECOVERY_HOSTILES.map((hostile) => ({ ...hostile, position: { ...hostile.position }, patrolCenter: { ...hostile.patrolCenter } }));
  // Practice drones are kept for the separate free/test scenario, never mixed into the story sector.
  return scenario === 'free' ? TRAINING_DUMMIES.map((dummy): HostileState => ({ ...dummy, position: { ...dummy.position }, patrolCenter: { ...dummy.patrolCenter } })) : [];
}

export function createExpedition(scanBonus = 0, cargoBonus = 0, scenario: ExpeditionScenario = 'free', hullRiskReduction = 0, salvageBonus = 0, cantorBypass = false): ExpeditionState {
  return {
    projectiles: [], combatEvents: [], nextCombatId: 1, freeBroadsideSide: 1,
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
    hullRiskReduction,
    salvageBonus,
    cantorBypass,
    signals: scenarioSignals(scenario),
    hostiles: scenarioHostiles(scenario),
    dummyRespawns: [],
    weaponCooldowns: { broadside: 0, rail: 0, torpedo: 0, orb: 0 },
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
    projectiles: [], combatEvents: [],
    sectorName: 'Veloria Rift',
    scenario: 'free',
    position: { x: 2_100, y: 1_500 },
    origin: { x: 2_100, y: 1_500 },
    flightInput: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    course: undefined,
    signals: [
      { id: 'veloria-husk', kind: 'wreck', name: 'Unbekanntes Echo', classifiedName: 'Schalenbarke', classifiedDescription: 'Eine stumme organische Barke trägt fremde, aber formbare Panzerplatten.', position: { x: 2_470, y: 1_180 }, knowledge: 'echo', risk: 'medium', reward: { kind: 'alloys', amount: 2, text: 'Zwei singende Legierungen lösen sich aus der Schalenbarke.' } },
      { id: 'veloria-crystal', kind: 'vein', name: 'Unbekanntes Echo', classifiedName: 'Resonanzader', classifiedDescription: 'Kristallines Erz singt in einem fremden Takt.', position: { x: 1_500, y: 1_030 }, knowledge: 'echo', risk: 'low', reward: { kind: 'alloys', amount: 3, text: 'Die Resonanzader gibt drei leichte Legierungen frei.' } },
      { id: 'veloria-choir', kind: 'anomaly', name: 'Unbekanntes Echo', classifiedName: 'Der leise Chor', classifiedDescription: 'Ein Chor aus Lichtmustern bietet Wissen gegen eine schmerzhafte Resonanz.', position: { x: 1_680, y: 2_060 }, knowledge: 'echo', risk: 'high', reward: { kind: 'data', amount: 2, hullCost: 4, text: 'Der Chor hinterlässt zwei fremde Datensätze. Hülle -4.' } },
      { id: 'veloria-pilgrim', kind: 'distress', name: 'Unbekanntes Echo', classifiedName: 'Schlafender Pilger', classifiedDescription: 'Ein friedliches Wesen trägt einen abgestoßenen Reliktsplitter und reagiert auf sanften Funk.', position: { x: 2_860, y: 2_020 }, knowledge: 'echo', risk: 'low', reward: { kind: 'relics', amount: 1, text: 'Der Pilger antwortet mit Licht und überlässt Farhaven einen Reliktsplitter.' } },
      { id: 'veloria-observatory', kind: 'anomaly', name: 'Unbekanntes Echo', classifiedName: 'Spiegelobservatorium', classifiedDescription: 'Eine tote Beobachtungsblüte speichert Kartenbilder der Rift.', position: { x: 3_300, y: 760 }, knowledge: 'echo', risk: 'medium', reward: { kind: 'data', amount: 1, text: 'Das Spiegelobservatorium gibt einen Datensatz mit fremden Sternkarten frei.' } },
      { id: 'veloria-cocoon', kind: 'distress', name: 'Unbekanntes Echo', classifiedName: 'Versiegelter Kokon', classifiedDescription: 'Ein Wächter kreist um einen seltenen Reliktkern. Die Begegnung kann umflogen werden.', position: { x: 1_040, y: 1_780 }, knowledge: 'echo', risk: 'high', guardedBy: 'rift-sentinel', reward: { kind: 'relics', amount: 1, text: 'Der Kokon öffnet sich. Ein resonanter Reliktkern ist gesichert.' } },
    ],
    hostiles: [
      { id: 'rift-skimmer', name: 'Riftschimmer', kind: 'patrol', passive: false, status: 'patrol', position: { x: 3_180, y: 1_540 }, patrolCenter: { x: 3_180, y: 1_540 }, patrolRadius: 130, patrolPhase: 0, heading: Math.PI, hull: 3, maxHull: 3, attackCooldownMs: 0 },
      { id: 'rift-sentinel', name: 'Kokonwächter', kind: 'sentinel', passive: false, status: 'patrol', position: { x: 1_090, y: 1_720 }, patrolCenter: { x: 1_090, y: 1_720 }, patrolRadius: 42, patrolPhase: Math.PI, heading: 0, hull: 8, maxHull: 8, attackCooldownMs: 0 },
    ],
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
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return state;
  if (state.hull <= 0) return { ...state, projectiles: [] };
  // Fixed bounded slices keep collision and moving-target tests independent of frame length.
  let next = state;
  for (let remaining = deltaMs; remaining > 0; remaining -= 20) {
    const dt = Math.min(20, remaining);
    next = advanceProjectiles(stepMovement(next, dt), next, dt);
    if (next.hull <= 0) return { ...next, projectiles: [] };
  }
  return next;
}

function stepMovement(state: ExpeditionState, deltaMs: number): ExpeditionState {
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
  const travel = Math.min(remaining, deltaMs * (state.status === 'returning' ? RETURN_TRAVEL_SPEED : 0.085));
  const ratio = travel / remaining;
  const nextPosition = {
    x: state.position.x + (target.x - state.position.x) * ratio,
    y: state.position.y + (target.y - state.position.y) * ratio,
  };
  return advanceHostiles(rechargeSystems({
    ...state,
    position: nextPosition,
    velocity: { x: 0, y: 0 },
    heading: headingToward(state.position, target),
    course: remaining - travel < 3 ? undefined : state.course,
  }, deltaMs), deltaMs);
}

export function scan(state: ExpeditionState): ExpeditionState {
  if (state.status !== 'active' || state.energy < 8) return appendLog(state, 'Scanner nicht bereit: mindestens 8 Systemladung erforderlich.');
  let found = 0;
  const cantor = state.hostiles.find((hostile) => hostile.id === 'ash-cantor');
  const cantorPacified = Boolean(state.cantorBypass && cantor && distance(cantor.position, state.position) <= 470);
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
  return appendLog({ ...state, signals, hostiles: cantorPacified ? state.hostiles.filter((hostile) => hostile.id !== 'ash-cantor') : state.hostiles, energy: state.energy - 8 }, cantorPacified
    ? 'Die Breitbandarray antwortet auf den Aschenchor. Der Kantor senkt seine Waffen und gleitet aus dem Kampfgebiet.'
    : found > 0 ? `${found} Signal${found === 1 ? '' : 'e'} klassifiziert.` : 'Scan beendet. Nur Stille antwortet.');
}

export function investigate(state: ExpeditionState, signalId: string): ExpeditionState {
  const signal = state.signals.find((candidate) => candidate.id === signalId);
  if (!signal || signal.knowledge !== 'classified') return appendLog(state, 'Dieses Signal kann noch nicht untersucht werden.');
  if (distance(state.position, signal.position) > 112) return appendLog(state, 'Für eine Untersuchung musst du näher heranfliegen.');
  const guard = signal.guardedBy ? state.hostiles.find((hostile) => hostile.id === signal.guardedBy) : undefined;
  if (guard) return appendLog(state, `${signal.name} ist durch ${guard.name} bewacht. Du kannst umkehren oder den Plünderer vertreiben.`);
  if (cargoTotal(state.cargo) >= state.cargoCapacity) return appendLog(state, 'Der Frachtraum ist voll. Sichere die Fracht in Farhaven.');

  const reward = rewardForExpeditionSignal(state, signal);
  if (cargoTotal(state.cargo) + reward.amount > state.cargoCapacity) {
    return appendLog(state, `Zu wenig Frachtraum für diesen Fund (${reward.amount} Plätze nötig). Sichere erst deine Fracht in Farhaven.`);
  }
  const signals = state.signals.map((candidate) => candidate.id === signalId ? { ...candidate, knowledge: 'resolved' as const } : candidate);
  const hullCost = Math.max(0, (reward.hullCost ?? 0) - (state.hullRiskReduction ?? 0));
  const resultText = reward.hullCost
    ? `${reward.text.replace(/\s*Hülle -\d+\.$/, '')} ${hullCost > 0 ? `Hülle -${hullCost}.` : 'Das Reliktlabor stabilisiert das Feld vollständig.'}`
    : reward.text;
  return appendLog({
    ...state,
    signals,
    hull: Math.max(0, state.hull - hullCost),
    cargo: addCargo(state.cargo, reward.kind, reward.amount),
  }, signal.kind === 'wreck' && (state.salvageBonus ?? 0) > 0
    ? `${resultText} Die Bergungsgreifer sichern zusätzlich eine Legierung.`
    : resultText);
}

export function mineVein(state: ExpeditionState, signalId: string): ExpeditionState {
  const signal = state.signals.find((candidate) => candidate.id === signalId);
  if (!signal || signal.kind !== 'vein' || signal.knowledge !== 'classified') return appendLog(state, 'Diese Ader kann nicht abgebaut werden.');
  if (distance(state.position, signal.position) > 128) return appendLog(state, 'Für den Abbau musst du näher an die Ader heranfliegen.');
  if (state.energy < 10) return appendLog(state, 'Minenlaser nicht bereit: mindestens 10 Systemladung erforderlich.');
  const reward = rewardForSignal(signal);
  if (cargoTotal(state.cargo) + reward.amount > state.cargoCapacity) return appendLog(state, 'Zu wenig Frachtraum für die geborgenen Legierungen.');
  const signals = state.signals.map((candidate) => candidate.id === signalId ? { ...candidate, knowledge: 'resolved' as const } : candidate);
  return appendLog({
    ...state,
    signals,
    energy: state.energy - 10,
    cargo: addCargo(state.cargo, reward.kind, reward.amount),
  }, reward.text);
}

export function returnToFarhaven(state: ExpeditionState): ExpeditionState {
  if (state.status === 'returning') return state;
  return appendLog({
    ...state,
    status: 'returning',
    projectiles: [], combatEvents: [],
    flightInput: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    heading: headingToward(state.position, state.origin),
    course: state.origin,
  }, 'Rückkehrkurs bestätigt. Bug voraus – Farhaven wird schnell angeflogen.');
}

export interface WeaponReadiness {
  readonly ready: boolean;
  readonly reason: string;
  readonly cooldownMs?: number;
  readonly cooldownTotalMs?: number;
}

const WEAPON_RULES: Record<WeaponMode, { energy: number; range: number; damage: number; cooldownMs: number; name: string }> = {
  broadside: { energy: 4, range: 430, damage: 1, cooldownMs: 760, name: 'Breitseite' },
  rail: { energy: 12, range: 620, damage: 2, cooldownMs: 2_350, name: 'Rail-Lanze' },
  torpedo: { energy: 15, range: 700, damage: 3, cooldownMs: 3_100, name: 'Torpedo' },
  orb: { energy: 16, range: 500, damage: 2, cooldownMs: 2_700, name: 'Energiekugel' },
};

export function weaponReadiness(state: ExpeditionState, targetId: string | undefined, weapon: WeaponMode): WeaponReadiness {
  const target = state.hostiles.find((hostile) => hostile.id === targetId);
  if (state.status !== 'active') return { ready: false, reason: 'Rückkehr aktiv' };
  if (state.hull <= 0) return { ready: false, reason: 'Schiff kampfunfähig' };
  const rules = WEAPON_RULES[weapon];
  const cooldown = state.weaponCooldowns?.[weapon] ?? 0;
  if (cooldown > 0) return { ready: false, reason: `Nachladen · ${(cooldown / 1000).toFixed(1)}s`, cooldownMs: cooldown, cooldownTotalMs: rules.cooldownMs };
  if (state.energy < rules.energy) return { ready: false, reason: `Zu wenig Systeme · ${rules.energy} nötig` };
  if (!target) return { ready: true, reason: `Bereit · ${(rules.cooldownMs / 1000).toFixed(1)}s Takt` };
  const targetDistance = distance(target.position, state.position);
  if (targetDistance > rules.range) return { ready: false, reason: `Außer Reichweite · ${Math.round(targetDistance)}u` };
  if (target.kind === 'guardian' && target.status === 'alert' && (target.attackCooldownMs ?? 0) > 2_600) return { ready: false, reason: `Chorschild aktiv · öffnet in ${(((target.attackCooldownMs ?? 0) - 2_600) / 1000).toFixed(1)}s` };
  // Practice contacts are there to test visible weapons, not to require a precise
  // maneuver before the first shot. Real opponents still demand positioning.
  if (target.passive) return { ready: true, reason: `Feuer frei · ${target.name}` };
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
  const rules = WEAPON_RULES[weapon];
  const target = state.hostiles.find((hostile) => hostile.id === targetId);
  const forward = forwardVector(state.heading);
  const toTarget = target ? { x: target.position.x - state.position.x, y: target.position.y - state.position.y } : undefined;
  const side = toTarget ? (forward.x * toTarget.y - forward.y * toTarget.x > 0 ? 1 : -1) : state.freeBroadsideSide;
  const localX = weapon === 'broadside' ? side * 43 : 0;
  const localY = weapon === 'rail' ? -70 : weapon === 'torpedo' ? -47 : weapon === 'orb' ? -26 : 0;
  // At point-blank range a long barrel must not spawn the shot beyond its target.
  const muzzleScale = target ? Math.min(1, Math.max(0, distance(state.position, target.position) - hostileHitRadius(target.kind) - 12)
    / Math.max(1, Math.hypot(localX, localY))) : 1;
  const muzzle = {
    x: state.position.x + (localX * Math.cos(state.heading) - localY * Math.sin(state.heading)) * muzzleScale,
    y: state.position.y + (localX * Math.sin(state.heading) + localY * Math.cos(state.heading)) * muzzleScale,
  };
  const direction = target ? { x: target.position.x - muzzle.x, y: target.position.y - muzzle.y }
    : weapon === 'broadside' ? { x: -forward.y * side, y: forward.x * side } : forward;
  // One broadside packet represents its three closely grouped shells and preserves
  // the existing salvo damage budget. Collision consumes the packet exactly once.
  const fired = launchProjectile({
    ...state, energy: state.energy - rules.energy,
    freeBroadsideSide: !target && weapon === 'broadside' ? -side : state.freeBroadsideSide,
    weaponCooldowns: { ...state.weaponCooldowns, [weapon]: rules.cooldownMs } as Record<WeaponMode, number>,
  }, 'player', 'player', weapon, muzzle, direction, rules.damage, rules.range);
  return appendLog(fired, target ? `${rules.name} abgefeuert – Treffer beim Einschlag.` : `${rules.name} feuert in den leeren Raum.`);
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
