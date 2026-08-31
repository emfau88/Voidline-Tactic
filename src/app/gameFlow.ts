import { createExpedition, enterWormhole, finishExpedition, fireWeapon, investigate, isHome, mineVein, returnToFarhaven, scan, setCourse, setFlightInput, stepExpedition } from '../domain/exploration/expeditionEngine';
import type { Cargo, ExpeditionScenario, ExpeditionState, Vector2, WeaponMode } from '../domain/exploration/types';
import { canPurchaseShipUpgrade, canUpgrade, purchaseShipUpgrade, secureCargo, upgradeFacility } from '../domain/outpost/outpostEngine';
import type { FacilityId, FarhavenProfile } from '../domain/outpost/types';
import { FIRST_FIELD_UPGRADE_ID, isFieldUpgrade, newShip, SECOND_FIELD_UPGRADE_ID, type ShipUpgradeId, type ShipVariantId } from '../domain/ship/types';
import { clearActiveExpedition, clearProfile, loadActiveExpedition, loadProfile, saveActiveExpedition, saveProfile } from './saveGame';

type Listener = () => void;

let profile = loadProfile();
const resumedExpedition = loadActiveExpedition();
let expedition: ExpeditionState | undefined = resumedExpedition?.expedition;
let selectedTargetId: string | undefined = resumedExpedition?.selectedTargetId;
let pendingReturnCargo: Cargo | undefined;
let pendingDefeat = false;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function persistExpedition(): void {
  if (expedition) saveActiveExpedition(expedition, selectedTargetId);
  else clearActiveExpedition();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProfile(): FarhavenProfile { return profile; }
export function getExpedition(): ExpeditionState | undefined { return expedition; }
function nearestHostileId(state: ExpeditionState | undefined): string | undefined {
  if (!state) return undefined;
  return [...state.hostiles]
    .map((hostile) => ({ id: hostile.id, distance: Math.hypot(hostile.position.x - state.position.x, hostile.position.y - state.position.y) }))
    .sort((first, second) => first.distance - second.distance)[0]?.id;
}

/** A manual tap may override the lock, but combat never requires target marking. */
export function getSelectedTargetId(): string | undefined {
  if (expedition?.hostiles.some((hostile) => hostile.id === selectedTargetId)) return selectedTargetId;
  return nearestHostileId(expedition);
}

export interface PrologueObjective {
  readonly kicker: string;
  readonly title: string;
  readonly copy: string;
}

function scenarioForProfile(): ExpeditionScenario {
  const upgrades = profile.ship?.upgrades ?? [];
  // The first wreck is the material run for Farhaven's hangar. The cargo spine
  // is useful, but it must never be a hidden story gate: once the hangar exists,
  // the Mönchslaterne route and its data/relic rewards are available.
  if (profile.expeditionCount === 0 || !profile.facilities.hangar) return 'first-wreck';
  if (!upgrades.includes(SECOND_FIELD_UPGRADE_ID)) return 'second-shift';
  if (!profile.story.routeTraceRecovered) return 'mining-run';
  return 'recovery-run';
}

export function isXenogateUnlocked(): boolean {
  return profile.story.routeTraceRecovered
    && (profile.ship?.upgrades.includes(SECOND_FIELD_UPGRADE_ID) ?? false)
    && profile.facilities.navigation > 0;
}

export function getPrologueObjective(): PrologueObjective {
  if (!profile.ship) return { kicker: 'ERSTE SCHICHT', title: 'RUMPF WÄHLEN', copy: 'Rufe die Aster Vale oder die Bramble nach Farhaven.' };
  if (expedition) {
    if (expedition.sectorId === 'veloria-rift') {
      const unresolved = expedition.signals.filter((signal) => signal.knowledge !== 'resolved');
      const pilgrim = expedition.signals.find((signal) => signal.id === 'veloria-pilgrim');
      if (unresolved.every((signal) => signal.knowledge === 'echo')) return { kicker: 'VELORIA RIFT', title: 'FREMDE ECHOS SCANNEN', copy: 'Diese Region folgt anderen Regeln. Scanne, bevor du dich einem Wesen, Wrack oder Feld näherst.' };
      if (pilgrim?.knowledge === 'classified') return { kicker: 'ERSTER KONTAKT', title: 'DEM PILGER ANTWORTEN', copy: 'Der schlafende Pilger ist friedlich. Fliege heran und antworte, ohne die Wächterzone zu berühren.' };
      return { kicker: 'VELORIA RIFT', title: 'EIGENEN KURS WÄHLEN', copy: `${unresolved.length} fremde Kontakte bleiben. Berge, deute oder meide sie und kehre durch das Xenogate nach Farhaven zurück.` };
    }
    if (expedition.scenario === 'first-wreck') {
      const firstWreck = expedition.signals.find((signal) => signal.id === 'echo-wreck');
      const skiffCache = expedition.signals.find((signal) => signal.id === 'first-skiff-cache');
      const skiffAlive = expedition.hostiles.some((hostile) => hostile.id === 'first-cinder-skiff');
      if (firstWreck?.knowledge === 'echo') return { kicker: 'ERSTER KONTAKT · 1/4', title: 'DAS WRACK UND DEN KONTAKT SCANNEN', copy: 'Farhavens Kennung liegt nordöstlich. Ein fremdes Schiff kreist bereits um das Signal.' };
      if (firstWreck?.knowledge === 'classified') return { kicker: 'ERSTER KONTAKT · 2/4', title: 'PLATTEN SICHERN ODER STELLUNG BEZIEHEN', copy: 'Die äußeren Platten sind unbewacht. Sichere sie und fliehe – oder nähere dich dem automatisch erfassten Glutkutter und kämpfe um seine Zusatzfracht.' };
      if (skiffAlive) return { kicker: 'FREIWILLIGE KONFRONTATION', title: 'GLUTKUTTER ODER HEIMKEHR', copy: 'Der Hangar ist bereits finanzierbar. Kehre sicher heim oder bring den Gegner in den seitlichen Feuerbogen und löse eine Breitseite aus.' };
      if (skiffCache?.knowledge !== 'resolved') return { kicker: 'ERSTER KONTAKT · 3/4', title: 'DIE GLUTKUTTER-FRACHT SICHERN', copy: 'Der Weg ist frei. Fliege an die markierte Fracht und birg die zusätzlichen Platten.' };
      return { kicker: 'ERSTER KONTAKT · 4/4', title: 'MIT DER BEUTE HEIMKEHREN', copy: 'Wrackplatten und Waffenkern sind gesichert. Farhaven kann den Hangar verbinden.' };
    }
    if (expedition.scenario === 'second-shift') {
      const lantern = expedition.signals.find((signal) => signal.id === 'monk-lantern');
      const liturgy = expedition.signals.find((signal) => signal.id === 'cutting-liturgy');
      const archive = expedition.signals.find((signal) => signal.id === 'wayfarer-archive');
      const cipher = expedition.signals.find((signal) => signal.id === 'raider-cipher');
      if (lantern?.knowledge === 'echo' && liturgy?.knowledge === 'echo' && archive?.knowledge === 'echo' && cipher?.knowledge === 'echo') return { kicker: 'JAGD ODER UMWEG', title: 'DREI WEGE ZU DEN DATEN SCANNEN', copy: 'Archiv: sicher und langsam. Liturgie: schnell, aber schmerzhaft. Räuberchiffre: freiwilliger Kampf mit voller Datenausbeute.' };
      const dataSecured = liturgy?.knowledge === 'resolved' || cipher?.knowledge === 'resolved' || archive?.knowledge === 'resolved';
      if (lantern?.knowledge !== 'resolved' || !dataSecured) return { kicker: 'JAGD ODER UMWEG', title: 'DEINEN WEG ZUM MINENLASER WÄHLEN', copy: 'Laterne: 1 Relikt. Liturgie: 2 Daten gegen Hüllenschaden. Räuber: 2 Daten nach einem Gefecht. Das entfernte Archiv bleibt der sichere, langsamere Weg.' };
      if (archive?.knowledge === 'resolved' && liturgy?.knowledge !== 'resolved') return { kicker: 'SICHERER WEG', title: 'DIE FUNDE HEIMBRINGEN', copy: 'Reliktkern und sicherer Datensatz ergänzen Farhavens Reserve. Kehre zurück; die riskante Liturgie darf unberührt bleiben.' };
      return { kicker: cipher?.knowledge === 'resolved' ? 'KAMPFBEUTE GESICHERT' : 'VERLORENE ROUTE · 4/5', title: 'DEN ROUTENBRECHER BAUEN', copy: 'Reliktkern und Datensätze reichen für einen Minenlaser. Kehre nach Farhaven zurück und montiere ihn.' };
    }
    if (expedition.scenario === 'mining-run') {
      const vein = expedition.signals.find((signal) => signal.id === 'black-vein');
      const cache = expedition.signals.find((signal) => signal.id === 'raider-cache');
      if (vein?.knowledge === 'echo') return { kicker: 'VERLORENE ROUTE · 4/5', title: 'DIE ROUTENADER SCANNEN', copy: 'Der Minenlaser kann einen Routenverstärker unter einer versiegelten Ader freilegen.' };
      if (vein?.knowledge !== 'resolved') return { kicker: 'VERLORENE ROUTE · 4/5', title: 'DEN ROUTENKERN FREILEGEN', copy: 'Fliege zur Routenader und setze den Minenlaser ein. Der Verstärker ist der letzte Hinweis.' };
      if (cache?.knowledge !== 'resolved') return { kicker: 'OPTIONALE KONFRONTATION', title: 'PLÜNDERER ODER HEIMKEHR', copy: 'Der Routenverstärker ist gesichert. Die gestohlenen Platten hinter dem Aschenplünderer sind Bonusbeute, kein Zwang.' };
      return { kicker: 'VERLORENE ROUTE · 5/5', title: 'MIT DER GANZEN SPUR HEIMKEHREN', copy: 'Der Routenkern und die Plündererplatten sind gesichert. Farhaven kann das Xenogate lesen.' };
    }
    if (expedition.scenario === 'recovery-run') {
      return { kicker: 'FREIE BERGUNG', title: 'WÄHLE DEINEN KURS', copy: 'Scanne nach Legierungen, Daten und Relikten. Sichere nur, was Farhaven für deinen nächsten Ausbau braucht.' };
    }
    return { kicker: 'EXPEDITION', title: 'EIN SIGNAL UNTERSUCHEN', copy: 'Scanne, positioniere dich und sichere einen Fund.' };
  }
  if (!profile.facilities.hangar) {
    return canUpgrade(profile, 'hangar')
      ? { kicker: 'ERSTE HEIMKEHR · 4/4', title: 'DEN HANGAR ERRICHTEN', copy: 'Die geborgenen Legierungen reichen. Öffne rechts den Hangar und verbinde das Dock.' }
      : { kicker: 'ERSTE HEIMKEHR', title: 'EINE BERGUNG SICHERN', copy: 'Der Hangar braucht vier Legierungen. Starte eine Expedition und untersuche das nahe Wrack.' };
  }
  if (!profile.ship.upgrades.includes(SECOND_FIELD_UPGRADE_ID)) {
    if (canPurchaseShipUpgrade(profile, SECOND_FIELD_UPGRADE_ID)) return { kicker: 'ZWEITE SCHICHT · 4/4', title: 'MINENLASER EINBAUEN', copy: 'Reliktkern und Datensätze reichen. Öffne die Werkstatt im Hangar und rüste den echten Minenlaser aus.' };
    if (!profile.ship.upgrades.includes(FIRST_FIELD_UPGRADE_ID)) return canPurchaseShipUpgrade(profile, FIRST_FIELD_UPGRADE_ID)
      ? { kicker: 'OPTIONALER SCHIFFSBAUTEIL', title: 'FRACHTRÜCKEN ODER NEUE SPUR', copy: 'Der Frachtrücken erweitert Expeditionen um zwei Plätze. Die neue Mission zur Mönchslaterne ist bereits verfügbar.' }
      : { kicker: 'NEUE SPUR IM ASCHSAUM', title: 'DIE MÖNCHSLATERNE SUCHEN', copy: 'Starte die zweite Mission. Dort findest du erstmals Relikte und verschiedene Wege zu Datensätzen.' };
    return { kicker: 'JAGD ODER UMWEG', title: 'DEN MINENLASER VORBEREITEN', copy: 'Mönchslaterne plus Liturgie oder Räuberchiffre liefern das Material. Das entfernte Archiv bietet eine langsamere sichere Route.' };
  }
  if (!profile.story.routeTraceRecovered) return { kicker: 'VERLORENE ROUTE · 4/5', title: 'DEN ROUTENKERN HEIMBRINGEN', copy: 'Der Minenlaser ist bereit. Sichere die Routenader im Aschsaum und kehre mit dem Verstärker zurück.' };
  if (!profile.facilities.navigation) return canUpgrade(profile, 'navigation')
    ? { kicker: 'VERLORENE ROUTE · 5/5', title: 'DAS STERNENWERK ERRICHTEN', copy: 'Farhaven besitzt Routenkern und Baumaterial. Baue das Sternenwerk und richte das Xenogate aus.' }
    : { kicker: 'VERLORENE ROUTE · 5/5', title: 'MATERIAL FÜR DAS STERNENWERK', copy: 'Sichere zwei Legierungen und zwei Datensätze. Freie Bergungsflüge liefern beides.' };
  return { kicker: 'VERLORENE ROUTE · ABSCHLUSS', title: 'DAS XENOGATE ÖFFNEN', copy: 'Farhaven hat die verlorene Versorgungslinie rekonstruiert. Ihre Spur führt nach Veloria Rift.' };
}

export function beginExpedition(): ExpeditionState {
  const variant = profile.ship?.variant;
  const scanBonus = (profile.facilities.scanner ? 90 : 0)
    + (variant === 'aster-vale' ? 60 : 0)
    + (profile.ship?.upgrades.includes('broadband-array') ? 160 : 0);
  const cargoBonus = (profile.facilities.hangar ? 2 : 0)
    + (variant === 'bramble' ? 1 : 0)
    + (profile.ship?.upgrades.includes('cargo-spine') ? 2 : 0);
  const hullRiskReduction = profile.facilities.labor ? 3 : 0;
  const salvageBonus = profile.ship?.upgrades.includes('salvage-claws') ? 1 : 0;
  const cantorBypass = profile.ship?.upgrades.includes('broadband-array') ?? false;
  expedition = createExpedition(scanBonus, cargoBonus, scenarioForProfile(), hullRiskReduction, salvageBonus, cantorBypass);
  selectedTargetId = nearestHostileId(expedition);
  persistExpedition();
  emit();
  return expedition;
}

export function courseTo(point: Vector2): void {
  if (!expedition) return;
  expedition = setCourse(expedition, point);
  persistExpedition();
  emit();
}

export function setFlightVector(vector: Vector2): void {
  if (!expedition) return;
  expedition = setFlightInput(expedition, vector);
  persistExpedition();
}

export function tickExpedition(deltaMs: number): void {
  if (!expedition) return;
  expedition = stepExpedition(expedition, Math.min(deltaMs, 40));
  if (!expedition.hostiles.some((hostile) => hostile.id === selectedTargetId)) selectedTargetId = nearestHostileId(expedition);
  if (expedition.hull <= 0) completeDefeat();
  else if (isHome(expedition)) completeReturn();
  else persistExpedition();
  emit();
}

export function scanNearby(): void {
  if (!expedition) return;
  expedition = scan(expedition);
  persistExpedition();
  emit();
}

export function enterAlienRift(): boolean {
  if (!expedition) return false;
  if (!isXenogateUnlocked()) {
    emit();
    return false;
  }
  const previousSector = expedition.sectorId;
  expedition = enterWormhole(expedition);
  if (expedition.sectorId === previousSector) {
    emit();
    return false;
  }
  selectedTargetId = undefined;
  persistExpedition();
  emit();
  return true;
}

export function investigateSignal(signalId: string): void {
  if (!expedition) return;
  expedition = investigate(expedition, signalId);
  persistExpedition();
  emit();
}

export function mineVeinSignal(signalId: string): boolean {
  if (!expedition || !profile.ship?.upgrades.includes('mining-lasers')) return false;
  expedition = mineVein(expedition, signalId);
  const mined = expedition.signals.find((signal) => signal.id === signalId)?.knowledge === 'resolved';
  persistExpedition();
  emit();
  return mined;
}

export function returnHome(): void {
  if (!expedition) return;
  expedition = returnToFarhaven(expedition);
  persistExpedition();
  emit();
}

export function selectHostile(targetId: string): boolean {
  if (!expedition?.hostiles.some((hostile) => hostile.id === targetId)) return false;
  selectedTargetId = targetId;
  persistExpedition();
  emit();
  return true;
}

export function clearSelectedHostile(): void {
  if (!selectedTargetId) return;
  selectedTargetId = undefined;
  persistExpedition();
  emit();
}

export function fireWeapons(targetId: string | undefined, weapon: WeaponMode): boolean {
  if (!expedition) return false;
  const before = expedition;
  expedition = fireWeapon(expedition, targetId, weapon);
  if (!expedition.hostiles.some((hostile) => hostile.id === selectedTargetId)) selectedTargetId = nearestHostileId(expedition);
  persistExpedition();
  emit();
  return expedition.energy < before.energy;
}

export function completeReturn(): void {
  if (!expedition) return;
  const recoveredRouteTrace = expedition.scenario === 'mining-run'
    && expedition.signals.some((signal) => signal.id === 'black-vein' && signal.knowledge === 'resolved');
  pendingReturnCargo = finishExpedition(expedition).cargo;
  const discoveries = expedition.signals.filter((signal) => signal.knowledge === 'resolved').map((signal) => signal.id);
  profile = {
    ...secureCargo(profile, pendingReturnCargo),
    story: {
      routeTraceRecovered: profile.story.routeTraceRecovered || recoveredRouteTrace,
      discoveries: [...new Set([...profile.story.discoveries, ...discoveries])],
    },
  };
  saveProfile(profile);
  expedition = undefined;
  selectedTargetId = undefined;
  persistExpedition();
  emit();
}

export function completeDefeat(): void {
  if (!expedition) return;
  pendingReturnCargo = undefined;
  pendingDefeat = true;
  expedition = undefined;
  selectedTargetId = undefined;
  persistExpedition();
  emit();
}

export function consumeReturnCargo(): Cargo | undefined {
  const cargo = pendingReturnCargo;
  pendingReturnCargo = undefined;
  return cargo;
}

export function consumeExpeditionDefeat(): boolean {
  const defeated = pendingDefeat;
  pendingDefeat = false;
  return defeated;
}

export function improveFacility(facilityId: FacilityId): boolean {
  if (!canUpgrade(profile, facilityId)) return false;
  profile = upgradeFacility(profile, facilityId);
  saveProfile(profile);
  emit();
  return true;
}

export function canPurchaseFieldUpgrade(upgradeId: ShipUpgradeId): boolean {
  return canPurchaseShipUpgrade(profile, upgradeId);
}

export function purchaseFieldUpgrade(upgradeId: ShipUpgradeId): boolean {
  if (!canPurchaseShipUpgrade(profile, upgradeId)) return false;
  profile = purchaseShipUpgrade(profile, upgradeId);
  saveProfile(profile);
  emit();
  return true;
}

export function chooseStartingShip(variant: ShipVariantId): boolean {
  if (profile.ship) return false;
  profile = { ...profile, ship: newShip(variant) };
  saveProfile(profile);
  emit();
  return true;
}

export function resetGameForDevelopment(): void {
  clearProfile();
  clearActiveExpedition();
  profile = loadProfile();
  expedition = undefined;
  selectedTargetId = undefined;
  pendingReturnCargo = undefined;
  pendingDefeat = false;
  emit();
}
