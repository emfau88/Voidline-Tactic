import { createExpedition, enterWormhole, finishExpedition, fireWeapon, investigate, isHome, mineVein, returnToFarhaven, scan, setCourse, setFlightInput, stepExpedition } from '../domain/exploration/expeditionEngine';
import type { Cargo, ExpeditionState, Vector2, WeaponMode } from '../domain/exploration/types';
import { canPurchaseShipUpgrade, canUpgrade, purchaseShipUpgrade, secureCargo, upgradeFacility } from '../domain/outpost/outpostEngine';
import type { FacilityId, FarhavenProfile } from '../domain/outpost/types';
import { FIRST_FIELD_UPGRADE_ID, isShipUpgrade, newShip, type ShipUpgradeId, type ShipVariantId } from '../domain/ship/types';
import { clearProfile, loadProfile, saveProfile } from './saveGame';

type Listener = () => void;

let profile = loadProfile();
let expedition: ExpeditionState | undefined;
let selectedTargetId: string | undefined;
let pendingReturnCargo: Cargo | undefined;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener());
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

export function getPrologueObjective(): PrologueObjective {
  if (!profile.ship) return { kicker: 'ERSTE SCHICHT', title: 'RUMPF WÄHLEN', copy: 'Rufe die Aster Vale oder die Bramble nach Farhaven.' };
  if (expedition) {
    const firstWreck = expedition.signals.find((signal) => signal.id === 'echo-wreck');
    if (firstWreck?.knowledge === 'echo') return { kicker: 'ERSTE EXPEDITION · 1/4', title: 'DAS NAHE ECHO SCANNEN', copy: 'Der Scanner erreicht ein unbekanntes Signal direkt nordöstlich von Farhaven.' };
    if (firstWreck?.knowledge === 'classified') return { kicker: 'ERSTE EXPEDITION · 2/4', title: 'ZUR GEBROCHENEN RELIQUIE', copy: 'Tippe das Signal auf der Karte an, fliege heran und sichere die Bergung.' };
    if (firstWreck?.knowledge === 'resolved') return { kicker: 'ERSTE EXPEDITION · 3/4', title: 'FRACHT HEIMBRINGEN', copy: 'Die Legierungen sind im Frachtraum. Kehre jetzt nach Farhaven zurück.' };
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
      : { kicker: 'HANGAR ONLINE', title: 'WERKSTATT PRÜFEN', copy: 'Öffne die Testwerft im Hangar, um den nächsten verfügbaren Bauteil zu sehen.' };
  }
  return { kicker: 'ERSTE SCHICHT ABGESCHLOSSEN', title: 'WEITER HINAUS', copy: 'Dein Schiff trägt nun einen echten Ausbau. Die nächste Expedition darf riskanter werden.' };
}

export function beginExpedition(): ExpeditionState {
  const variant = profile.ship?.variant;
  const scanBonus = (profile.facilities.scanner ? 90 : 0) + (variant === 'aster-vale' ? 60 : 0);
  const cargoBonus = (profile.facilities.hangar ? 2 : 0)
    + (variant === 'bramble' ? 1 : 0)
    + (profile.ship?.upgrades.includes('cargo-spine') ? 2 : 0);
  expedition = createExpedition(scanBonus, cargoBonus);
  // A soft lock makes the first combat contact legible on mouse and touch alike.
  // It never fires for the player and can be overridden by tapping another ship.
  selectedTargetId = expedition.hostiles
    .map((hostile) => ({ hostile, distance: Math.hypot(hostile.position.x - expedition!.position.x, hostile.position.y - expedition!.position.y) }))
    .sort((first, second) => first.distance - second.distance)[0]?.hostile.id;
  emit();
  return expedition;
}

export function courseTo(point: Vector2): void {
  if (!expedition) return;
  expedition = setCourse(expedition, point);
  emit();
}

export function setFlightVector(vector: Vector2): void {
  if (!expedition) return;
  expedition = setFlightInput(expedition, vector);
}

export function tickExpedition(deltaMs: number): void {
  if (!expedition) return;
  expedition = stepExpedition(expedition, Math.min(deltaMs, 40));
  if (isHome(expedition)) completeReturn();
  emit();
}

export function scanNearby(): void {
  if (!expedition) return;
  expedition = scan(expedition);
  emit();
}

export function enterAlienRift(): boolean {
  if (!expedition) return false;
  const previousSector = expedition.sectorId;
  expedition = enterWormhole(expedition);
  if (expedition.sectorId === previousSector) {
    emit();
    return false;
  }
  selectedTargetId = undefined;
  emit();
  return true;
}

export function investigateSignal(signalId: string): void {
  if (!expedition) return;
  expedition = investigate(expedition, signalId);
  emit();
}

export function mineVeinSignal(signalId: string): boolean {
  if (!expedition || !profile.ship?.upgrades.includes('mining-lasers')) return false;
  expedition = mineVein(expedition, signalId);
  const mined = expedition.signals.find((signal) => signal.id === signalId)?.knowledge === 'resolved';
  emit();
  return mined;
}

export function returnHome(): void {
  if (!expedition) return;
  expedition = returnToFarhaven(expedition);
  emit();
}

export function selectHostile(targetId: string): boolean {
  if (!expedition?.hostiles.some((hostile) => hostile.id === targetId)) return false;
  selectedTargetId = targetId;
  emit();
  return true;
}

export function fireWeapons(targetId: string | undefined, weapon: WeaponMode): boolean {
  if (!expedition) return false;
  const before = expedition;
  expedition = fireWeapon(expedition, targetId, weapon);
  if (!expedition.hostiles.some((hostile) => hostile.id === selectedTargetId)) selectedTargetId = undefined;
  emit();
  return expedition.energy < before.energy;
}

export function completeReturn(): void {
  if (!expedition) return;
  pendingReturnCargo = finishExpedition(expedition).cargo;
  profile = secureCargo(profile, pendingReturnCargo);
  saveProfile(profile);
  expedition = undefined;
  selectedTargetId = undefined;
  emit();
}

export function consumeReturnCargo(): Cargo | undefined {
  const cargo = pendingReturnCargo;
  pendingReturnCargo = undefined;
  return cargo;
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

export function changeShipVariantForTest(variant: ShipVariantId): boolean {
  if (!profile.ship || profile.ship.variant === variant) return false;
  profile = { ...profile, ship: { ...profile.ship, variant } };
  saveProfile(profile);
  emit();
  return true;
}

export function toggleShipTestUpgrade(upgradeId: ShipUpgradeId): boolean {
  if (upgradeId === FIRST_FIELD_UPGRADE_ID) return false;
  if (!profile.ship || !isShipUpgrade(upgradeId)) return false;
  const installed = new Set(profile.ship.upgrades);
  if (installed.has(upgradeId)) installed.delete(upgradeId); else installed.add(upgradeId);
  profile = { ...profile, ship: { ...profile.ship, upgrades: [...installed] } };
  saveProfile(profile);
  emit();
  return true;
}

export function resetGameForDevelopment(): void {
  clearProfile();
  profile = loadProfile();
  expedition = undefined;
  selectedTargetId = undefined;
  pendingReturnCargo = undefined;
  emit();
}
