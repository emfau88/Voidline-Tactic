import './farhaven.css';
import { createGame } from './app/createGame';
import { beginExpedition, canPurchaseFieldUpgrade, changeShipVariantForTest, chooseStartingShip, consumeReturnCargo, courseTo, enterAlienRift, fireWeapons, getExpedition, getProfile, getPrologueObjective, getSelectedTargetId, improveFacility, investigateSignal, isXenogateUnlocked, mineVeinSignal, purchaseFieldUpgrade, resetGameForDevelopment, returnHome, scanNearby, selectHostile, setFlightVector, subscribe, toggleShipTestUpgrade } from './app/gameFlow';
import { canEnterWormhole, WORMHOLE_POSITION, weaponReadiness } from './domain/exploration/expeditionEngine';
import type { Cargo, WeaponMode } from './domain/exploration/types';
import { FACILITIES, type FacilityId } from './domain/outpost/types';
import { FIELD_UPGRADE_COSTS, FIRST_FIELD_UPGRADE_ID, isFieldUpgrade, SECOND_FIELD_UPGRADE_ID, SHIP_UPGRADES, SHIP_VARIANTS, type ShipUpgradeId, type ShipVariantId } from './domain/ship/types';

const ASTER_MODULE_PATHS: Partial<Record<ShipUpgradeId, string>> = {
  'broadband-array': '/assets/ships/aster-vale/broadband-array-v1.png',
  'cargo-spine': '/assets/ships/aster-vale/cargo-spine-v1.png',
  'vector-tail': '/assets/ships/aster-vale/vector-tail-v1.png',
  'salvage-claws': '/assets/ships/aster-vale/salvage-claws-v2.png',
  'mining-lasers': '/assets/ships/aster-vale/mining-lasers-v2.png',
  'rail-lance': '/assets/ships/aster-vale/rail-lance-v1.png',
  'relic-shrine': '/assets/ships/aster-vale/relic-shrine-v1.png',
  'side-turrets': '/assets/ships/aster-vale/side-turrets-v1.png',
};

const shell = document.getElementById('game-shell')!;
const outpostHud = document.getElementById('outpost-hud')!;
const expeditionHud = document.getElementById('expedition-hud')!;
const flightControl = document.getElementById('flight-control')!;
const expeditionActions = document.getElementById('expedition-actions')!;
const facilityPanel = document.getElementById('facility-panel')!;
const shipSelection = document.getElementById('ship-selection')!;
const shipyardPanel = document.getElementById('shipyard-panel')!;
const game = createGame('game-root');
let paused = false;
let toastTimer: number | undefined;
let selectedFacility: FacilityId | undefined;
let constructionTimer: number | undefined;
let resettingForDevelopment = false;

function required<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
}

function cargoTotal(): number {
  const cargo = getExpedition()?.cargo;
  return cargo ? cargo.alloys + cargo.data + cargo.relics : 0;
}

function primaryWeaponMode(): WeaponMode {
  const upgrades = getProfile().ship?.upgrades ?? [];
  return upgrades.includes('rail-lance') && !upgrades.includes('side-turrets') ? 'rail' : 'broadside';
}

function ordnanceWeaponMode(): WeaponMode | undefined {
  const upgrades = getProfile().ship?.upgrades ?? [];
  if (upgrades.includes('torpedo-rack')) return 'torpedo';
  if (upgrades.includes('relic-shrine') && upgrades.includes('core-reactor')) return 'orb';
  return undefined;
}

function weaponLabel(weapon: WeaponMode): string {
  return weapon === 'broadside' ? 'SALVE' : weapon === 'rail' ? 'LANZE' : weapon === 'torpedo' ? 'TORPEDO' : 'ORB';
}

function toast(message: string): void {
  const element = required<HTMLElement>('toast');
  window.clearTimeout(toastTimer);
  element.textContent = message;
  element.classList.add('visible');
  toastTimer = window.setTimeout(() => element.classList.remove('visible'), 2600);
}

function renderResources(): void {
  const resources = getProfile().resources;
  required<HTMLElement>('resource-strip').innerHTML = [['LEG', resources.alloys], ['DAT', resources.data], ['REL', resources.relics]]
    .map(([label, value]) => `<span class="resource">${label}<b>${value}</b></span>`).join('');
}

function renderObjective(): void {
  const objective = getPrologueObjective();
  required<HTMLElement>('objective-kicker').textContent = objective.kicker;
  required<HTMLElement>('objective-title').textContent = objective.title;
  required<HTMLElement>('objective-copy').textContent = objective.copy;
}

function upgradeCost(facilityId: FacilityId): string {
  return Object.entries(FACILITIES[facilityId].cost)
    .map(([kind, amount]) => `${amount} ${kind === 'alloys' ? 'LEGIERUNGEN' : kind === 'data' ? 'DATEN' : 'RELIKTE'}`).join(' · ');
}

function openFacility(facilityId: FacilityId): void {
  selectedFacility = facilityId;
  renderFacilityPanel();
  facilityPanel.hidden = false;
  updateOutpostChrome();
}

function renderFacilityPanel(): void {
  if (!selectedFacility) return;
  const facility = FACILITIES[selectedFacility];
  const level = Boolean(getProfile().facilities[selectedFacility]);
  required<HTMLElement>('facility-kicker').textContent = facility.subtitle.toUpperCase();
  required<HTMLElement>('facility-title').textContent = facility.name;
  const isHangar = selectedFacility === 'hangar';
  required<HTMLElement>('facility-copy').textContent = selectedFacility === 'hangar'
    ? level
      ? 'Die Aster Vale ist sicher angedockt. Verwalte hier ihre echten Einbauten.'
      : 'Ein freier Dockplatz für dein Schiff. Baue ihn mit gesicherten Legierungen.'
    : selectedFacility === 'scanner'
      ? level ? 'Die Kapelle lauscht auf ferne Echos.' : 'Dein nächster Ausbau für besser lesbare Signale.'
      : selectedFacility === 'labor'
        ? level ? 'Relikte können hier künftig zu neuen Systemen werden.' : 'Ein Platz, um seltene Relikte später zu verstehen.'
        : level ? 'Die Routen nach draußen sind verzeichnet.' : 'Ein Ausbau für die späteren äußeren Sektoren.';
  required<HTMLElement>('facility-level').textContent = level
    ? `ONLINE · ${facility.effect}`
    : `FÜR DEN BAU · ${upgradeCost(selectedFacility)}`;
  const openShipyard = required<HTMLButtonElement>('open-shipyard-button');
  openShipyard.hidden = !isHangar || !level || !getProfile().ship;
  openShipyard.textContent = '✧  WERKSTATT ÖFFNEN';
  const upgrade = required<HTMLButtonElement>('facility-upgrade-button');
  upgrade.hidden = level;
  upgrade.disabled = level;
  upgrade.innerHTML = `<span>NÄCHSTER SCHRITT</span><strong>${facility.name.toUpperCase()} ERRICHTEN</strong><small>${upgradeCost(selectedFacility)}</small>`;
}

function shipAssetPath(variant: ShipVariantId): string {
  return variant === 'aster-vale' ? '/assets/ships/player-aster-vale-v1.png' : '/assets/ships/player-bramble-v1.png';
}

function renderShipyard(): void {
  const ship = getProfile().ship;
  if (!ship) return;
  const variant = SHIP_VARIANTS[ship.variant];
  required<HTMLImageElement>('shipyard-ship-image').src = shipAssetPath(ship.variant);
  required<HTMLImageElement>('shipyard-ship-image').alt = `${variant.name}, Schiffsvorschau`;
  required<HTMLElement>('shipyard-ship-name').textContent = variant.name.toUpperCase();
  const parts = required<HTMLElement>('shipyard-parts');
  parts.innerHTML = ship.upgrades.map((id) => {
    const path = ship.variant === 'aster-vale' ? ASTER_MODULE_PATHS[id] : undefined;
    return path ? `<img class="shipyard-art-layer" data-upgrade="${id}" src="${path}" alt="" />` : `<i class="part-${id}"></i>`;
  }).join('');
  const moduleCard = (upgrade: (typeof SHIP_UPGRADES)[number]) => {
    const active = ship.upgrades.includes(upgrade.id);
    const fieldUpgrade = isFieldUpgrade(upgrade.id);
    const available = fieldUpgrade && canPurchaseFieldUpgrade(upgrade.id);
    const cost = FIELD_UPGRADE_COSTS[upgrade.id];
    const costLabel = cost
      ? Object.entries(cost).map(([kind, amount]) => `${amount} ${kind === 'alloys' ? 'LEG' : kind === 'data' ? 'DAT' : 'REL'}`).join(' · ')
      : '';
    const status = active
      ? 'ECHTER EINBAU · ONLINE'
      : fieldUpgrade
        ? available ? `${costLabel} · EINBAUEN` : `HANGAR + ${costLabel} NÖTIG`
        : 'KOSTENLOSER PROTOTYP';
    const disabled = fieldUpgrade && !available;
    return `<button type="button" class="ship-module${active ? ' active' : ''}" data-ship-upgrade="${upgrade.id}" style="--module-accent:${upgrade.accent}"${disabled ? ' disabled' : ''}><span>${status}</span><strong>${upgrade.name}</strong><small>${upgrade.description}</small></button>`;
  };
  const fieldUpgrades = SHIP_UPGRADES.filter((upgrade) => isFieldUpgrade(upgrade.id));
  const prototypes = SHIP_UPGRADES.filter((upgrade) => !isFieldUpgrade(upgrade.id));
  required<HTMLElement>('shipyard-module-list').innerHTML = `
    <section class="shipyard-module-section" aria-label="Echte Einbauten">
      <div class="shipyard-section-heading"><span>ECHTE EINBAUTEN</span><small>Sie verändern deinen nächsten Flug.</small></div>
      <div class="shipyard-field-grid">${fieldUpgrades.map(moduleCard).join('')}</div>
    </section>
    <details class="prototype-drawer">
      <summary><span>RUMPFIDEEN ANSEHEN</span><small>${prototypes.length} visuelle Prototypen</small></summary>
      <div class="prototype-grid">${prototypes.map(moduleCard).join('')}</div>
    </details>`;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-ship-switch]')) {
    const active = button.dataset.shipSwitch === ship.variant;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
}

function renderShipSelection(): void {
  const needsChoice = !getProfile().ship;
  shipSelection.hidden = !needsChoice;
  if (needsChoice) {
    outpostHud.hidden = true;
    required<HTMLElement>('outpost-nav').hidden = true;
  }
}

function playConstructionMoment(facilityId: FacilityId): void {
  const facility = FACILITIES[facilityId];
  const moment = required<HTMLElement>('construction-moment');
  window.clearTimeout(constructionTimer);
  required<HTMLElement>('construction-title').textContent = `${facility.name.toUpperCase()} WIRD VERBUNDEN`;
  required<HTMLElement>('construction-copy').textContent = 'Dockklammern schließen · Werklichter erwachen';
  moment.hidden = false;
  moment.classList.remove('complete');
  constructionTimer = window.setTimeout(() => {
    required<HTMLElement>('construction-title').textContent = `${facility.name.toUpperCase()} IST ONLINE`;
    required<HTMLElement>('construction-copy').textContent = facility.effect;
    moment.classList.add('complete');
  }, 760);
  window.setTimeout(() => { moment.hidden = true; }, 2100);
}

function formatCargo(cargo: Cargo): string {
  return [
    cargo.alloys ? `+${cargo.alloys} Legierungen` : '',
    cargo.data ? `+${cargo.data} Daten` : '',
    cargo.relics ? `+${cargo.relics} Relikte` : '',
  ].filter(Boolean).join(' · ');
}

function playReturnMoment(cargo: Cargo): void {
  const total = cargo.alloys + cargo.data + cargo.relics;
  if (!total) { toast('Farhaven empfängt dich. Keine Fracht im Laderaum.'); return; }
  const hangarCost = FACILITIES.hangar.cost.alloys ?? Number.POSITIVE_INFINITY;
  const hangarReady = !getProfile().facilities.hangar && getProfile().resources.alloys >= hangarCost;
  required<HTMLElement>('return-title').textContent = 'FRACHT GESICHERT';
  required<HTMLElement>('return-copy').textContent = `${formatCargo(cargo)} wurden in Farhaven verladen. ${hangarReady ? 'Die Legierungen reichen jetzt für den Hangar – öffne den Dockbereich rechts.' : 'Die Dockkrallen lösen sich. Farhaven wächst mit jedem Fund.'}`;
  required<HTMLElement>('return-moment').hidden = false;
}

function renderOutpost(): void {
  required<HTMLElement>('expedition-count').textContent = String(getProfile().expeditionCount);
  renderFacilityPanel();
}

function updateOutpostChrome(): void {
  const hasShip = Boolean(getProfile().ship);
  const isInspecting = !facilityPanel.hidden || !shipyardPanel.hidden;
  // A room dialog sits above the canvas. Lock its world targets so the same tap
  // cannot also select a second dock behind the HTML action button.
  game.events.emit('farhaven:outpost-interaction-lock', isInspecting);
  if (isInspecting) shell.dataset.outpostView = 'room'; else delete shell.dataset.outpostView;
  outpostHud.hidden = !hasShip || isInspecting;
  required<HTMLElement>('outpost-nav').hidden = !hasShip || isInspecting;
  required<HTMLElement>('objective-tracker').hidden = !hasShip || isInspecting;
}

function renderExpedition(): void {
  const expedition = getExpedition();
  if (!expedition) return;
  const meter = (id: string, current: number, max: number) => {
    required<HTMLElement>(id).style.width = `${Math.max(0, Math.min(100, current / max * 100))}%`;
  };
  required<HTMLElement>('energy-value').textContent = `${Math.ceil(expedition.energy)} / ${expedition.maxEnergy}`;
  required<HTMLElement>('hull-value').textContent = `${Math.ceil(expedition.hull)} / ${expedition.maxHull}`;
  required<HTMLElement>('cargo-value').textContent = `${cargoTotal()} / ${expedition.cargoCapacity}`;
  required<HTMLElement>('sector-title').textContent = expedition.sectorName.toUpperCase();
  meter('energy-bar', expedition.energy, expedition.maxEnergy);
  meter('hull-bar', expedition.hull, expedition.maxHull);
  meter('cargo-bar', cargoTotal(), expedition.cargoCapacity);
  required<HTMLElement>('expedition-status').textContent = expedition.status === 'returning' ? 'RÜCKKEHR LÄUFT' : 'DIREKTSTEUERUNG';
  required<HTMLElement>('expedition-log').textContent = expedition.log[0] ?? '';
  const nearby = expedition.signals.find((signal) => signal.knowledge === 'classified' && Math.hypot(signal.position.x - expedition.position.x, signal.position.y - expedition.position.y) <= 112);
  const atWormhole = canEnterWormhole(expedition);
  const xenogateUnlocked = isXenogateUnlocked();
  const interact = required<HTMLButtonElement>('interact-button');
  const interactLabel = interact.querySelector('span')!;
  const hasMiningLasers = getProfile().ship?.upgrades.includes('mining-lasers') ?? false;
  const nearbyGuard = nearby?.guardedBy && expedition.hostiles.some((hostile) => hostile.id === nearby.guardedBy);
  if (atWormhole && xenogateUnlocked) {
    interactLabel.textContent = 'DURCHQUEREN';
    interact.querySelector('small')!.textContent = 'Xenogate · Veloria Rift';
    interact.disabled = false;
  } else if (atWormhole) {
    interactLabel.textContent = 'VERSIEGELT';
    interact.querySelector('small')!.textContent = 'Noch 3 Rückkehrer + Minenlaser';
    interact.disabled = true;
  } else if (nearbyGuard) {
    interactLabel.textContent = 'BEUTE GESCHÜTZT';
    interact.querySelector('small')!.textContent = 'Plünderer vertreiben oder umkehren';
    interact.disabled = true;
  } else if (nearby?.kind === 'vein') {
    interactLabel.textContent = 'ABBAUEN';
    interact.querySelector('small')!.textContent = hasMiningLasers ? 'Minenlaser · 10 Systeme' : 'Minenlaser fehlt';
    interact.disabled = !hasMiningLasers;
  } else {
    interactLabel.textContent = 'INTERAGIEREN';
    interact.querySelector('small')!.textContent = nearby ? nearby.name : 'An Signal heranfliegen';
    interact.disabled = !nearby;
  }
  const targetId = getSelectedTargetId();
  const selectedTarget = expedition.hostiles.find((hostile) => hostile.id === targetId);
  const primary = primaryWeaponMode();
  const primaryReadiness = weaponReadiness(expedition, targetId, primary);
  const fire = required<HTMLButtonElement>('fire-button');
  fire.disabled = !primaryReadiness.ready;
  fire.querySelector('span')!.textContent = weaponLabel(primary);
  fire.querySelector('small')!.textContent = primaryReadiness.reason;
  const combatPrompt = required<HTMLElement>('combat-prompt');
  const combatPromptFire = required<HTMLButtonElement>('combat-prompt-fire');
  combatPrompt.hidden = !selectedTarget || expedition.status !== 'active';
  if (selectedTarget) {
    required<HTMLElement>('combat-prompt-target').textContent = selectedTarget.name.toUpperCase();
    required<HTMLElement>('combat-prompt-kicker').textContent = primaryReadiness.ready ? 'ZIEL ERFASST · FEUER FREI' : 'ZIEL ERFASST · MANÖVER NÖTIG';
    combatPromptFire.disabled = !primaryReadiness.ready;
    combatPromptFire.querySelector('b')!.textContent = weaponLabel(primary);
    combatPromptFire.querySelector('small')!.textContent = primaryReadiness.reason;
  }
  const ordnance = required<HTMLButtonElement>('ordnance-button');
  const ordnanceMode = ordnanceWeaponMode();
  if (!ordnanceMode) {
    ordnance.disabled = true;
    ordnance.querySelector('span')!.textContent = 'ORDNANZ';
    ordnance.querySelector('small')!.textContent = 'Torpedorack oder Kern fehlt';
  } else {
    const ordnanceReadiness = weaponReadiness(expedition, targetId, ordnanceMode);
    ordnance.disabled = !ordnanceReadiness.ready;
    ordnance.querySelector('span')!.textContent = weaponLabel(ordnanceMode);
    ordnance.querySelector('small')!.textContent = ordnanceReadiness.reason;
  }
  required<HTMLElement>('expedition-status').textContent = expedition.status === 'returning'
    ? 'RÜCKKEHR LÄUFT'
    : expedition.sectorId === 'veloria-rift'
      ? 'VELORIA RIFT · KARTENSONDE'
      : selectedTarget ? `ZIEL · ${selectedTarget.name.toUpperCase()}` : 'ZIEL AUF KARTE WÄHLEN';
  const list = required<HTMLElement>('signal-list');
  list.replaceChildren(...expedition.signals.filter((signal) => signal.knowledge === 'classified').map((signal) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.dataset.signalCourse = signal.id;
    const distance = Math.round(Math.hypot(signal.position.x - expedition.position.x, signal.position.y - expedition.position.y));
    item.className = 'signal';
    item.innerHTML = `<span><b>${signal.name.toUpperCase()}</b><small>${signal.description ?? ''}</small></span><span>${distance}u</span>`;
    return item;
  }));
}

function render(): void {
  const expedition = getExpedition();
  renderResources();
  if (expedition) {
    shell.dataset.screen = 'expedition';
    outpostHud.hidden = true;
    expeditionHud.hidden = false;
    flightControl.hidden = false;
    expeditionActions.hidden = false;
    required<HTMLElement>('outpost-nav').hidden = true;
    facilityPanel.hidden = true;
    renderExpedition();
  } else {
    shell.dataset.screen = 'outpost';
    expeditionHud.hidden = true;
    flightControl.hidden = true;
    expeditionActions.hidden = true;
    required<HTMLElement>('combat-prompt').hidden = true;
    renderOutpost();
    renderShipSelection();
    updateOutpostChrome();
    if (!shipyardPanel.hidden) renderShipyard();
  }
  renderObjective();
}

function startExpedition(): void {
  paused = false;
  required<HTMLButtonElement>('pause-button').setAttribute('aria-pressed', 'false');
  beginExpedition();
  game.scene.stop('outpost');
  game.scene.start('expedition');
  toast('Aschsaum I erreicht. Steuere die Aster Vale mit dem Flugstick.');
}

required<HTMLButtonElement>('launch-button').addEventListener('click', startExpedition);
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-facility]')) {
  button.addEventListener('click', () => openFacility(button.dataset.facility as FacilityId));
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-ship-variant]')) {
  button.addEventListener('click', () => {
    const variant = button.dataset.shipVariant as ShipVariantId;
    if (chooseStartingShip(variant)) toast(`${SHIP_VARIANTS[variant].name.toUpperCase()} IST NUN DEIN SCHIFF.`);
  });
}
game.events.on('farhaven:facility-selected', (facilityId: FacilityId) => {
  // Canvas targets can receive the tail of the same touch that opened a DOM
  // room panel. Once a room is open, its action must stay bound to that room.
  if (!facilityPanel.hidden || !shipyardPanel.hidden) return;
  openFacility(facilityId);
});
game.events.on('farhaven:target-selected', (targetId: string) => {
  if (!selectHostile(targetId)) return;
  const target = getExpedition()?.hostiles.find((hostile) => hostile.id === targetId);
  if (target) toast(`${target.name.toUpperCase()} MARKIERT · Positioniere dich für den Angriff.`);
});
game.events.on('farhaven:signal-selected', (signalId: string) => {
  const signal = getExpedition()?.signals.find((entry) => entry.id === signalId);
  if (!signal || signal.knowledge !== 'classified') return;
  courseTo(signal.position);
  toast(`KURS ZU ${signal.name.toUpperCase()} GESETZT.`);
});
function enterRiftIfReady(): void {
  if (!enterAlienRift()) return;
  game.scene.stop('expedition');
  game.scene.start('expedition');
  toast('Das Xenogate verschluckt die Aster Vale. Veloria Rift ist noch eine Kartensonde.');
}
game.events.on('farhaven:wormhole-selected', () => {
  const expedition = getExpedition();
  if (!expedition || expedition.sectorId !== 'ashenscar') return;
  if (!isXenogateUnlocked()) {
    toast('XENOGATE VERSIEGELT · Minenlaser einbauen und drei Expeditionen sicher zurückbringen.');
    return;
  }
  if (canEnterWormhole(expedition)) {
    enterRiftIfReady();
    return;
  }
  courseTo(WORMHOLE_POSITION);
  toast('KURS ZUM XENOGATE GESETZT · Am Tor „DURCHQUEREN“ wählen.');
});
required<HTMLButtonElement>('close-facility-button').addEventListener('click', () => {
  facilityPanel.hidden = true;
  selectedFacility = undefined;
  updateOutpostChrome();
});
required<HTMLButtonElement>('facility-upgrade-button').addEventListener('click', () => {
  if (!selectedFacility) return;
  const facilityId = selectedFacility;
  if (improveFacility(facilityId)) {
    selectedFacility = facilityId;
    playConstructionMoment(facilityId);
    toast(`${FACILITIES[facilityId].name.toUpperCase()} IST JETZT TEIL VON FARHAVEN`);
  }
  else toast('Dafür fehlen gesicherte Ressourcen.');
  renderFacilityPanel();
});
required<HTMLButtonElement>('open-shipyard-button').addEventListener('click', () => {
  facilityPanel.hidden = true;
  selectedFacility = undefined;
  shipyardPanel.hidden = false;
  updateOutpostChrome();
  renderShipyard();
});
required<HTMLButtonElement>('close-shipyard-button').addEventListener('click', () => {
  shipyardPanel.hidden = true;
  updateOutpostChrome();
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-ship-switch]')) {
  button.addEventListener('click', () => {
    const variant = button.dataset.shipSwitch as ShipVariantId;
    if (changeShipVariantForTest(variant)) toast(`${SHIP_VARIANTS[variant].name.toUpperCase()} IST JETZT IN DER TESTWERFT.`);
    renderShipyard();
  });
}
required<HTMLElement>('shipyard-module-list').addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-ship-upgrade]');
  if (!button) return;
  const upgradeId = button.dataset.shipUpgrade as ShipUpgradeId;
  if (isFieldUpgrade(upgradeId)) {
    if (purchaseFieldUpgrade(upgradeId)) toast(upgradeId === FIRST_FIELD_UPGRADE_ID ? 'FRACHTRÜCKEN EINGEBAUT · +2 FRACHTPLÄTZE' : 'MINENLASER EINGEBAUT · SCHWARZE ADERN ERSCHLIESSEN');
    else toast('Für diesen Einbau fehlen Hangar oder gesicherte Ressourcen.');
  } else {
    toggleShipTestUpgrade(upgradeId);
  }
  renderShipyard();
});
required<HTMLButtonElement>('scan-button').addEventListener('click', () => {
  scanNearby();
  game.events.emit('farhaven:scan-pulse');
});
required<HTMLElement>('signal-list').addEventListener('click', (event) => {
  const signalId = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-signal-course]')?.dataset.signalCourse;
  if (signalId) game.events.emit('farhaven:signal-selected', signalId);
});
required<HTMLButtonElement>('interact-button').addEventListener('click', () => {
  const expedition = getExpedition();
  if (expedition && canEnterWormhole(expedition)) {
    enterRiftIfReady();
    return;
  }
  const nearby = expedition?.signals.find((signal) => signal.knowledge === 'classified' && Math.hypot(signal.position.x - expedition.position.x, signal.position.y - expedition.position.y) <= 112);
  if (!nearby) return;
  if (nearby.kind === 'vein') {
    if (mineVeinSignal(nearby.id)) game.events.emit('farhaven:mining-start', nearby.position);
    return;
  }
  investigateSignal(nearby.id);
  game.events.emit('farhaven:signal-action', { kind: nearby.kind, position: nearby.position });
});
function fireSelectedWeapon(weapon: WeaponMode): void {
  const before = getExpedition();
  const targetId = getSelectedTargetId();
  const target = before?.hostiles.find((hostile) => hostile.id === targetId);
  if (!before || !target) { toast('Wähle erst einen Kontakt direkt auf der Karte.'); return; }
  if (!fireWeapons(target.id, weapon)) { toast(weaponReadiness(before, target.id, weapon).reason); return; }
  const destroyed = !getExpedition()?.hostiles.some((hostile) => hostile.id === target.id);
  game.events.emit('farhaven:weapon-fired', { weapon, target: { id: target.id, name: target.name, position: target.position, destroyed } });
}
function bindFireControl(button: HTMLButtonElement, resolveWeapon: () => WeaponMode | undefined): void {
  // Fire on press, not release. A second mobile thumb can shoot while the first
  // still holds the flight stick; keyboard activation remains available too.
  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const weapon = resolveWeapon();
    if (weapon) fireSelectedWeapon(weapon);
  });
  button.addEventListener('click', (event) => {
    if (event.detail !== 0) return;
    const weapon = resolveWeapon();
    if (weapon) fireSelectedWeapon(weapon);
  });
}
bindFireControl(required<HTMLButtonElement>('fire-button'), () => primaryWeaponMode());
bindFireControl(required<HTMLButtonElement>('combat-prompt-fire'), () => primaryWeaponMode());
bindFireControl(required<HTMLButtonElement>('ordnance-button'), ordnanceWeaponMode);
required<HTMLButtonElement>('return-button').addEventListener('click', () => returnHome());
required<HTMLButtonElement>('close-return-moment').addEventListener('click', () => { required<HTMLElement>('return-moment').hidden = true; });
required<HTMLButtonElement>('reset-button').addEventListener('click', () => {
  if (!window.confirm('Entwickler-Reset: Schiff, Ressourcen, Ausbauten und laufende Expedition wirklich zurücksetzen?')) return;
  const wasExpedition = shell.dataset.screen === 'expedition';
  resettingForDevelopment = true;
  shipyardPanel.hidden = true;
  facilityPanel.hidden = true;
  required<HTMLElement>('return-moment').hidden = true;
  resetGameForDevelopment();
  if (!wasExpedition) {
    resettingForDevelopment = false;
    toast('TESTSTAND ZURÜCKGESETZT · WÄHLE EINEN RUMPF.');
  }
});
required<HTMLButtonElement>('pause-button').addEventListener('click', () => {
  paused = !paused;
  if (paused) game.loop.sleep(); else game.loop.wake();
  required<HTMLButtonElement>('pause-button').setAttribute('aria-pressed', String(paused));
});
required<HTMLButtonElement>('fullscreen-button').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen(); else await shell.requestFullscreen({ navigationUI: 'hide' });
  } catch { toast('Vollbild ist in diesem Browser nicht verfügbar.'); }
});

const stick = required<HTMLElement>('flight-stick');
const knob = stick.querySelector<HTMLElement>('i')!;
let activePointer: number | undefined;
function updateFlight(pointer: PointerEvent): void {
  const bounds = stick.getBoundingClientRect();
  const x = pointer.clientX - bounds.left - bounds.width / 2;
  const y = pointer.clientY - bounds.top - bounds.height / 2;
  const limit = bounds.width * 0.28;
  const length = Math.hypot(x, y);
  const factor = length > limit ? limit / length : 1;
  const moveX = x * factor;
  const moveY = y * factor;
  knob.style.transform = `translate(${moveX}px, ${moveY}px)`;
  setFlightVector({ x: moveX / limit, y: moveY / limit });
}
stick.addEventListener('pointerdown', (event) => { activePointer = event.pointerId; stick.setPointerCapture(event.pointerId); updateFlight(event); });
stick.addEventListener('pointermove', (event) => { if (event.pointerId === activePointer) updateFlight(event); });
function releaseFlight(event: PointerEvent): void {
  if (event.pointerId !== activePointer) return;
  activePointer = undefined;
  knob.style.transform = 'translate(0, 0)';
  setFlightVector({ x: 0, y: 0 });
}
stick.addEventListener('pointerup', releaseFlight);
stick.addEventListener('pointercancel', releaseFlight);

subscribe(() => {
  if (!getExpedition() && shell.dataset.screen === 'expedition') {
    const returnedCargo = consumeReturnCargo();
    game.scene.stop('expedition');
    game.scene.start('outpost');
    if (resettingForDevelopment) {
      resettingForDevelopment = false;
      toast('TESTSTAND ZURÜCKGESETZT · WÄHLE EINEN RUMPF.');
    } else if (returnedCargo) {
      playReturnMoment(returnedCargo);
    } else {
      toast('Farhaven empfängt dich.');
    }
  }
  render();
});

render();
