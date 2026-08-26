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
export function getSelectedTargetId(): string | undefined { return selectedTargetId; }

export interface PrologueObjective {
  readonly kicker: string;
  readonly title: string;
  readonly copy: string;
}

function scenarioForProfile(): ExpeditionScenario {
  const upgrades = profile.ship?.upgrades ?? [];
  if (profile.expeditionCount === 0 || !upgrades.includes(FIRST_FIELD_UPGRADE_ID)) return 'first-wreck';
  if (!upgrades.includes(SECOND_FIELD_UPGRADE_ID)) return 'second-shift';
  return 'mining-run';
}

export function isXenogateUnlocked(): boolean {
  return profile.story.routeTraceRecovered && (profile.ship?.upgrades.includes(SECOND_FIELD_UPGRADE_ID) ?? false);
}

export function getPrologueObjective(): PrologueObjective {
  if (!profile.ship) return { kicker: 'ERSTE SCHICHT', title: 'RUMPF WÄHLEN', copy: 'Rufe die Aster Vale oder die Bramble nach Farhaven.' };
  if (expedition) {
    if (expedition.scenario === 'first-wreck') {
      const firstWreck = expedition.signals.find((signal) => signal.id === 'echo-wreck');
      if (firstWreck?.knowledge === 'echo') return { kicker: 'VERLORENE ROUTE · 1/5', title: 'DAS NAHE ECHO SCANNEN', copy: 'Ein Signal trägt Farhavens alte Versorgungskennung. Scanne es nordöstlich der Station.' };
      if (firstWreck?.knowledge === 'classified') return { kicker: 'VERLORENE ROUTE · 2/5', title: 'DIE ROUTENRELIQUIE BERGEN', copy: 'Tippe den Fund an, fliege heran und sichere seine Platten und den Kreiselkern.' };
      return { kicker: 'VERLORENE ROUTE · 3/5', title: 'DEN ERSTEN HINWEIS HEIMBRINGEN', copy: 'Die Bergung nennt das Xenogate. Kehre nach Farhaven zurück und sichere die Fracht.' };
    }
    if (expedition.scenario === 'second-shift') {
      const lantern = expedition.signals.find((signal) => signal.id === 'monk-lantern');
      const liturgy = expedition.signals.find((signal) => signal.id === 'cutting-liturgy');
      if (lantern?.knowledge === 'echo' && liturgy?.knowledge === 'echo') return { kicker: 'VERLORENE ROUTE · 3/5', title: 'ZWEI HÄLFTEN DER LITANEI', copy: 'Scanne die sichere Mönchslaterne und die riskante Schneideliturgie. Beide antworten auf die alte Route.' };
      if (lantern?.knowledge !== 'resolved' || liturgy?.knowledge !== 'resolved') return { kicker: 'VERLORENE ROUTE · 3/5', title: 'SICHER ODER RISKANT', copy: 'Die Laterne gibt ein Relikt sicher frei. Die Liturgie gibt Routendaten, kostet aber 6 Hülle.' };
      return { kicker: 'VERLORENE ROUTE · 4/5', title: 'DEN ROUTENBRECHER BAUEN', copy: 'Reliktkern und Datensätze reichen für einen Minenlaser. Er kann die versiegelte Routenader freilegen.' };
    }
    if (expedition.scenario === 'mining-run') {
      const vein = expedition.signals.find((signal) => signal.id === 'black-vein');
      const cache = expedition.signals.find((signal) => signal.id === 'raider-cache');
      if (vein?.knowledge === 'echo') return { kicker: 'VERLORENE ROUTE · 4/5', title: 'DIE ROUTENADER SCANNEN', copy: 'Der Minenlaser kann einen Routenverstärker unter einer versiegelten Ader freilegen.' };
      if (vein?.knowledge !== 'resolved') return { kicker: 'VERLORENE ROUTE · 4/5', title: 'DEN ROUTENKERN FREILEGEN', copy: 'Fliege zur Routenader und setze den Minenlaser ein. Der Verstärker ist der letzte Hinweis.' };
      if (cache?.knowledge !== 'resolved') return { kicker: 'OPTIONALE KONFRONTATION', title: 'PLÜNDERER ODER HEIMKEHR', copy: 'Der Routenverstärker ist gesichert. Die gestohlenen Platten hinter dem Aschenplünderer sind Bonusbeute, kein Zwang.' };
      return { kicker: 'VERLORENE ROUTE · 5/5', title: 'MIT DER GANZEN SPUR HEIMKEHREN', copy: 'Der Routenkern und die Plündererplatten sind gesichert. Farhaven kann das Xenogate lesen.' };
    }
    return { kicker: 'EXPEDITION', title: 'EIN SIGNAL UNTERSUCHEN', copy: 'Scanne, positioniere dich und sichere einen Fund.' };
  }
  if (!profile.facilities.hangar) {
    return canUpgrade(profile, 'hangar')
      ? { kicker: 'ERSTE HEIMKEHR · 4/4', title: 'DEN HANGAR ERRICHTEN', copy: 'Die geborgenen Legierungen reichen. Öffne rechts den Hangar und verbinde das Dock.' }
      : { kicker: 'ERSTE HEIMKEHR', title: 'EINE BERGUNG SICHERN', copy: 'Der Hangar braucht vier Legierungen. Starte eine Expedition und untersuche das nahe Wrack.' };
  }
  if (!profile.ship.upgrades.includes(FIRST_FIELD_UPGRADE_ID)) {
    return canPurchaseShipUpgrade(profile, FIRST_FIELD_UPGRADE_ID)
      ? { kicker: 'ERSTER SCHIFFSBAUTEIL', title: 'FRACHTRÜCKEN EINBAUEN', copy: 'Im Hangar wartet ein verfügbarer Frachtrücken. Er erweitert jede Expedition um zwei Frachtplätze.' }
      : { kicker: 'HANGAR ONLINE', title: 'WERKSTATT PRÜFEN', copy: 'Öffne die Werkstatt im Hangar, um den nächsten verfügbaren Bauteil zu sehen.' };
  }
  if (!profile.ship.upgrades.includes(SECOND_FIELD_UPGRADE_ID)) {
    return canPurchaseShipUpgrade(profile, SECOND_FIELD_UPGRADE_ID)
      ? { kicker: 'ZWEITE SCHICHT · 4/4', title: 'MINENLASER EINBAUEN', copy: 'Reliktkern und Datensätze reichen. Öffne die Werkstatt im Hangar und rüste den echten Minenlaser aus.' }
      : { kicker: 'ZWEITE SCHICHT', title: 'BAUPLAN FINDEN', copy: 'Mönchslaterne und Schneideliturgie liefern zusammen genau das Material für einen Minenlaser.' };
  }
  if (!isXenogateUnlocked()) return { kicker: 'VERLORENE ROUTE · 4/5', title: 'DEN ROUTENKERN HEIMBRINGEN', copy: 'Der Minenlaser ist bereit. Sichere die Routenader im Aschsaum und kehre mit dem Verstärker zurück.' };
  return { kicker: 'VERLORENE ROUTE · ABSCHLUSS', title: 'DAS XENOGATE ÖFFNEN', copy: 'Farhaven hat die verlorene Versorgungslinie rekonstruiert. Ihre Spur führt nach Veloria Rift.' };
}

export function beginExpedition(): ExpeditionState {
  const variant = profile.ship?.variant;
  const scanBonus = (profile.facilities.scanner ? 90 : 0) + (variant === 'aster-vale' ? 60 : 0);
  const cargoBonus = (profile.facilities.hangar ? 2 : 0)
    + (variant === 'bramble' ? 1 : 0)
    + (profile.ship?.upgrades.includes('cargo-spine') ? 2 : 0);
  expedition = createExpedition(scanBonus, cargoBonus, scenarioForProfile());
  // A soft lock makes the first combat contact legible on mouse and touch alike.
  // It never fires for the player and can be overridden by tapping another ship.
  selectedTargetId = expedition.hostiles
    .map((hostile) => ({ hostile, distance: Math.hypot(hostile.position.x - expedition!.position.x, hostile.position.y - expedition!.position.y) }))
    .sort((first, second) => first.distance - second.distance)[0]?.hostile.id;
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

export function fireWeapons(targetId: string | undefined, weapon: WeaponMode): boolean {
  if (!expedition) return false;
  const before = expedition;
  expedition = fireWeapon(expedition, targetId, weapon);
  if (!expedition.hostiles.some((hostile) => hostile.id === selectedTargetId)) selectedTargetId = undefined;
  persistExpedition();
  emit();
  return expedition.energy < before.energy;
}

export function completeReturn(): void {
  if (!expedition) return;
  const recoveredRouteTrace = expedition.scenario === 'mining-run'
    && expedition.signals.some((signal) => signal.id === 'black-vein' && signal.knowledge === 'resolved');
  pendingReturnCargo = finishExpedition(expedition).cargo;
  profile = {
    ...secureCargo(profile, pendingReturnCargo),
    story: { routeTraceRecovered: profile.story.routeTraceRecovered || recoveredRouteTrace },
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
