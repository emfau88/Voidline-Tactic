import { createExpedition, enterWormhole, finishExpedition, fireWeapon, investigate, isHome, mineVein, returnToFarhaven, scan, setCourse, setFlightInput, stepExpedition } from '../domain/exploration/expeditionEngine';
import type { ExpeditionState, Vector2, WeaponMode } from '../domain/exploration/types';
import { canUpgrade, secureCargo, upgradeFacility } from '../domain/outpost/outpostEngine';
import type { FacilityId, FarhavenProfile } from '../domain/outpost/types';
import { isShipUpgrade, newShip, type ShipUpgradeId, type ShipVariantId } from '../domain/ship/types';
import { loadProfile, saveProfile } from './saveGame';

type Listener = () => void;

let profile = loadProfile();
let expedition: ExpeditionState | undefined;
let selectedTargetId: string | undefined;
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

export function beginExpedition(): ExpeditionState {
  expedition = createExpedition(profile.facilities.scanner ? 90 : 0, profile.facilities.hangar ? 2 : 0);
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
  profile = secureCargo(profile, finishExpedition(expedition).cargo);
  saveProfile(profile);
  expedition = undefined;
  selectedTargetId = undefined;
  emit();
}

export function improveFacility(facilityId: FacilityId): boolean {
  if (!canUpgrade(profile, facilityId)) return false;
  profile = upgradeFacility(profile, facilityId);
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
  if (!profile.ship || !isShipUpgrade(upgradeId)) return false;
  const installed = new Set(profile.ship.upgrades);
  if (installed.has(upgradeId)) installed.delete(upgradeId); else installed.add(upgradeId);
  profile = { ...profile, ship: { ...profile.ship, upgrades: [...installed] } };
  saveProfile(profile);
  emit();
  return true;
}
