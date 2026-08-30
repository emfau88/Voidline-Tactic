import './farhaven.css';
import Phaser from 'phaser';
import { createGame } from './app/createGame';
import { FLIGHT_KEYS, keyboardFlightVector } from './app/flightControls';
import { beginExpedition, canPurchaseFieldUpgrade, chooseStartingShip, clearSelectedHostile, consumeExpeditionDefeat, consumeReturnCargo, courseTo, enterAlienRift, fireWeapons, getExpedition, getProfile, getPrologueObjective, getSelectedTargetId, improveFacility, investigateSignal, isXenogateUnlocked, mineVeinSignal, purchaseFieldUpgrade, resetGameForDevelopment, returnHome, scanNearby, selectHostile, setFlightVector, subscribe } from './app/gameFlow';
import { canEnterWormhole, rewardForExpeditionSignal, WORMHOLE_POSITION, weaponReadiness, type WeaponReadiness } from './domain/exploration/expeditionEngine';
import type { Cargo, ExpeditionState, ResourceKind, WeaponMode } from './domain/exploration/types';
import { canUpgrade } from './domain/outpost/outpostEngine';
import { FACILITIES, type FacilityId } from './domain/outpost/types';
import { formatResourceCost, RESOURCE_ORDER, RESOURCE_PRESENTATION, resourceEntries, resourceSourceHint, type ResourceAmounts } from './domain/resources/presentation';
import { FIELD_UPGRADE_COSTS, FIRST_FIELD_UPGRADE_ID, isFieldUpgrade, SECOND_FIELD_UPGRADE_ID, SHIP_UPGRADES, SHIP_VARIANTS, type ShipUpgradeId, type ShipVariantId } from './domain/ship/types';

const ASTER_MODULE_PATHS: Partial<Record<ShipUpgradeId, string>> = {
  'broadband-array': 'assets/ships/aster-vale/broadband-array-v1.png',
  'cargo-spine': 'assets/ships/aster-vale/cargo-spine-v1.png',
  'vector-tail': 'assets/ships/aster-vale/vector-tail-v1.png',
  'salvage-claws': 'assets/ships/aster-vale/salvage-claws-v2.png',
  'mining-lasers': 'assets/ships/aster-vale/mining-lasers-v2.png',
  'rail-lance': 'assets/ships/aster-vale/rail-lance-v1.png',
  'torpedo-rack': 'assets/ships/aster-vale/torpedo-rack-v1.png',
  'relic-shrine': 'assets/ships/aster-vale/relic-shrine-v1.png',
  'side-turrets': 'assets/ships/aster-vale/side-turrets-v1.png',
};

const BRAMBLE_MODULE_PATHS: Partial<Record<ShipUpgradeId, string>> = {
  'broadband-array': 'assets/ships/bramble/broadband-array-v1.png',
  'cargo-spine': 'assets/ships/bramble/cargo-spine-v1.png',
  'salvage-claws': 'assets/ships/bramble/salvage-claws-v1.png',
  'mining-lasers': 'assets/ships/bramble/mining-lasers-v1.png',
  'rail-lance': 'assets/ships/bramble/rail-lance-v1.png',
  'torpedo-rack': 'assets/ships/bramble/torpedo-rack-v1.png',
};

const MODULE_PATHS_BY_HULL: Record<ShipVariantId, Partial<Record<ShipUpgradeId, string>>> = {
  'aster-vale': ASTER_MODULE_PATHS,
  bramble: BRAMBLE_MODULE_PATHS,
};

function publicAssetPath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

function resourceIconMarkup(kind: ResourceKind, className = ''): string {
  const resource = RESOURCE_PRESENTATION[kind];
  return `<img class="resource-icon${className ? ` ${className}` : ''}" src="${publicAssetPath(resource.iconPath)}" alt="" />`;
}

function resourceAmountMarkup(kind: ResourceKind, amount: number, compact = false): string {
  const resource = RESOURCE_PRESENTATION[kind];
  return `<span class="resource-token resource-${kind}" data-resource="${kind}" title="${resource.name} · Fundort: ${resource.source} · Verwendung: ${resource.use}">${resourceIconMarkup(kind)}<span>${compact ? '' : `<small>${resource.name.toUpperCase()}</small>`}<b>${amount}</b></span></span>`;
}

function resourceCostMarkup(cost: ResourceAmounts): string {
  return `<span class="resource-cost">${resourceEntries(cost).map(([kind, amount]) => resourceAmountMarkup(kind, amount, true)).join('')}</span>`;
}

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
let outpostTapShieldUntil = 0;
let outpostTapShieldTimer: number | undefined;
let constructionTimer: number | undefined;
let resettingForDevelopment = false;
let shipyardPreviewVariant: ShipVariantId | undefined;
let pendingShipUpgrade: ShipUpgradeId | undefined;
let pendingVisualCargo: Cargo | undefined;
let coreInfoOpen = false;

function shieldOutpostTaps(durationMs: number, persistForNextScene = false): void {
  outpostTapShieldUntil = Date.now() + durationMs;
  if (persistForNextScene) game.registry.set('farhaven-outpost-input-unlock-at', outpostTapShieldUntil);
  window.clearTimeout(outpostTapShieldTimer);
  game.events.emit('farhaven:outpost-interaction-lock', true);
  // Date comparisons inside a render are only a guard. This explicit release
  // is the authority, so a late render can never leave the station locked.
  outpostTapShieldTimer = window.setTimeout(() => {
    outpostTapShieldUntil = 0;
    if (shell.dataset.screen === 'outpost') updateOutpostChrome();
  }, durationMs + 48);
}

const DISCOVERY_NAMES: Readonly<Record<string, string>> = {
  'echo-wreck': 'Reliquie der Versorgungsroute',
  'first-skiff-cache': 'Glutkutter-Fracht',
  'raider-cipher': 'Geraubte Chiffre',
  'monk-lantern': 'Mönchslaterne',
  'cutting-liturgy': 'Schneideliturgie',
  'wayfarer-archive': 'Wandererarchiv',
  'black-vein': 'Routenader',
  'raider-cache': 'Plündererkiste',
  'drift-smelter': 'Treibende Schmelze',
  'cold-archive': 'Kaltes Archiv',
  'pilgrim-vigil': 'Pilgerwacht',
  'working-vein': 'Offene Eisenader',
  'skiff-cache': 'Glutkutter-Beute',
  'veloria-husk': 'Schalenbarke',
  'veloria-crystal': 'Resonanzader',
  'veloria-choir': 'Der leise Chor',
  'veloria-pilgrim': 'Schlafender Pilger',
  'veloria-observatory': 'Spiegelobservatorium',
  'veloria-cocoon': 'Versiegelter Kokon',
};

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
  return 'broadside';
}

function lanceWeaponMode(): WeaponMode | undefined {
  return getProfile().ship?.upgrades.includes('rail-lance') ? 'rail' : undefined;
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

function targetForWeapon(expedition: ExpeditionState, weapon: WeaponMode): string | undefined {
  const selected = getSelectedTargetId();
  return selected && weaponReadiness(expedition, selected, weapon).ready ? selected : undefined;
}

function readinessForWeapon(expedition: ExpeditionState, weapon: WeaponMode): WeaponReadiness {
  const selected = getSelectedTargetId();
  const targetId = targetForWeapon(expedition, weapon);
  const readiness = weaponReadiness(expedition, targetId, weapon);
  if (!targetId && selected && readiness.ready) return { ...readiness, reason: 'Bereit · freier Feuerbogen' };
  return readiness;
}

function renderWeaponReadiness(button: HTMLButtonElement, weapon: WeaponMode, readiness: WeaponReadiness): void {
  button.disabled = !readiness.ready;
  button.querySelector('span')!.textContent = weaponLabel(weapon);
  button.querySelector('small')!.textContent = readiness.reason;
  const cooling = Boolean(readiness.cooldownMs && readiness.cooldownTotalMs);
  button.dataset.cooling = String(cooling);
  const progress = cooling ? 1 - readiness.cooldownMs! / readiness.cooldownTotalMs! : 0;
  button.style.setProperty('--cooldown-progress', `${Math.max(0, Math.min(1, progress)) * 100}%`);
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
  required<HTMLElement>('resource-strip').innerHTML = RESOURCE_ORDER
    .map((kind) => resourceAmountMarkup(kind, resources[kind])).join('');
}

function renderObjective(): void {
  const objective = getPrologueObjective();
  required<HTMLElement>('objective-kicker').textContent = objective.kicker;
  required<HTMLElement>('objective-title').textContent = objective.title;
  required<HTMLElement>('objective-copy').textContent = objective.copy;
}

function upgradeCost(facilityId: FacilityId): string {
  return formatResourceCost(FACILITIES[facilityId].cost);
}

function openFacility(facilityId: FacilityId): void {
  coreInfoOpen = false;
  selectedFacility = facilityId;
  renderFacilityPanel();
  facilityPanel.hidden = false;
  updateOutpostChrome();
}

function openCoreInfo(): void {
  coreInfoOpen = true;
  selectedFacility = undefined;
  required<HTMLElement>('facility-kicker').textContent = 'FARHAVEN · KERNMODUL';
  required<HTMLElement>('facility-title').textContent = 'Der Warmkern';
  const stage = required<HTMLElement>('facility-stage-art');
  stage.className = 'facility-art-core is-online';
  required<HTMLElement>('facility-stage-badge').textContent = 'KERN ONLINE · 4 ANSCHLÜSSE';
  required<HTMLElement>('facility-copy').textContent = 'Farhavens warmer Reaktorkern hält die Zuflucht, dein Schiff und die ersten Andockplätze am Rand der Voidline zusammen.';
  required<HTMLElement>('facility-discovery').textContent = 'Jedes errichtete Modul dockt sichtbar an diesen Kern an. Der Hangar schützt dein Schiff; Scanner, Labor und Sternenwerk öffnen neue Wege nach draußen.';
  required<HTMLElement>('facility-level').textContent = 'STABIL · DER KERN WÄCHST MIT FARHAVEN';
  required<HTMLButtonElement>('open-shipyard-button').hidden = true;
  required<HTMLButtonElement>('facility-upgrade-button').hidden = true;
  facilityPanel.hidden = false;
  updateOutpostChrome();
}

function renderFacilityPanel(): void {
  if (!selectedFacility) return;
  const facility = FACILITIES[selectedFacility];
  const profile = getProfile();
  const level = Boolean(profile.facilities[selectedFacility]);
  const buildReady = !level && canUpgrade(profile, selectedFacility);
  required<HTMLElement>('facility-kicker').textContent = facility.subtitle.toUpperCase();
  required<HTMLElement>('facility-title').textContent = facility.name;
  const stage = required<HTMLElement>('facility-stage-art');
  stage.className = `facility-art-${selectedFacility} ${level ? 'is-online' : buildReady ? 'is-build-ready' : 'is-blueprint'}`;
  required<HTMLElement>('facility-stage-badge').textContent = level
    ? 'MODUL ONLINE'
    : buildReady ? `BAUBEREIT · ${upgradeCost(selectedFacility)}` : `BAUPLAN · ${upgradeCost(selectedFacility)}`;
  const isHangar = selectedFacility === 'hangar';
  required<HTMLElement>('facility-copy').textContent = selectedFacility === 'hangar'
    ? level
      ? `${SHIP_VARIANTS[getProfile().ship?.variant ?? 'aster-vale'].name} ist sicher angedockt. Verwalte hier die echten Einbauten.`
      : profile.expeditionCount === 0
        ? `${SHIP_VARIANTS[getProfile().ship?.variant ?? 'aster-vale'].name} liegt am provisorischen Notdock. Die Bergungsreserve reicht noch nicht für einen sicheren Hangar.`
        : 'Dein Schiff wartet noch am Notdock. Baue den Hangar mit den gesicherten Legierungen.'
    : selectedFacility === 'scanner'
      ? level ? 'Die Kapelle lauscht auf ferne Echos.' : 'Dein nächster Ausbau für besser lesbare Signale.'
      : selectedFacility === 'labor'
        ? level ? 'Die Deutungsschirme dämpfen gefährliche Anomalien um 3 Hüllenschaden.' : 'Ein Platz, um seltene Relikte sicherer zu verstehen.'
        : level ? 'Das Sternenwerk hält das Xenogate stabil nach Veloria ausgerichtet.' : 'Der Routenkern braucht dieses Modul, bevor sich das Xenogate öffnen kann.';
  required<HTMLElement>('facility-level').textContent = level
    ? `ONLINE · ${facility.effect}`
    : `FÜR DEN BAU · ${upgradeCost(selectedFacility)}`;
  required<HTMLElement>('facility-discovery').textContent = level
    ? selectedFacility === 'hangar'
      ? 'Dein Schiff und seine echten Einbauten sind hier sichtbar verankert.'
      : selectedFacility === 'navigation'
        ? profile.story.discoveries.length
          ? `FUNDPROTOKOLL · ${profile.story.discoveries.map((id) => DISCOVERY_NAMES[id] ?? id).join(' · ')}`
          : 'Das Fundprotokoll ist leer. Heimgebrachte Entdeckungen werden hier dauerhaft verzeichnet.'
        : `Dieser Raum ist verbunden. ${facility.effect}`
    : selectedFacility === 'hangar' && profile.expeditionCount === 0
      ? 'Farhaven hält 2 Legierungen als Bergungsreserve. Das nahe Routenwrack liefert die fehlenden Platten für den Hangar.'
      : `Dieser Anschluss gehört zu Farhaven. Baue ihn, sobald du ${upgradeCost(selectedFacility).toLowerCase()} gesichert hast.`;
  const openShipyard = required<HTMLButtonElement>('open-shipyard-button');
  openShipyard.hidden = !isHangar || !level || !getProfile().ship;
  openShipyard.textContent = '✧  WERKSTATT ÖFFNEN';
  const upgrade = required<HTMLButtonElement>('facility-upgrade-button');
  upgrade.hidden = level;
  upgrade.disabled = !buildReady;
  upgrade.innerHTML = buildReady
    ? `<span>RESSOURCEN GESICHERT</span><strong>${facility.name.toUpperCase()} ERRICHTEN</strong>${resourceCostMarkup(facility.cost)}`
    : `<span>NOCH NICHT BAUBEREIT</span><strong>${upgradeCost(selectedFacility)} SICHERN</strong>${resourceCostMarkup(facility.cost)}<small>${resourceSourceHint(facility.cost)}</small>`;
}

function shipAssetPath(variant: ShipVariantId): string {
  return publicAssetPath(variant === 'aster-vale'
    ? 'assets/ships/player-aster-vale-v1.png'
    : 'assets/ships/player-bramble-v1.png');
}

function renderShipyard(): void {
  const ship = getProfile().ship;
  if (!ship) return;
  const previewVariant = shipyardPreviewVariant ?? ship.variant;
  const variant = SHIP_VARIANTS[previewVariant];
  required<HTMLImageElement>('shipyard-ship-image').src = shipAssetPath(previewVariant);
  required<HTMLImageElement>('shipyard-ship-image').alt = `${variant.name}, Schiffsvorschau`;
  required<HTMLElement>('shipyard-ship-name').textContent = variant.name.toUpperCase();
  const parts = required<HTMLElement>('shipyard-parts');
  const previewUpgrades = pendingShipUpgrade && !ship.upgrades.includes(pendingShipUpgrade)
    ? [...ship.upgrades, pendingShipUpgrade]
    : ship.upgrades;
  parts.innerHTML = previewUpgrades.map((id) => {
    const path = MODULE_PATHS_BY_HULL[previewVariant][id];
    return path ? `<img class="shipyard-art-layer" data-upgrade="${id}" src="${publicAssetPath(path)}" alt="" />` : `<i class="part-${id}" data-upgrade="${id}"></i>`;
  }).join('');
  const moduleCard = (upgrade: (typeof SHIP_UPGRADES)[number]) => {
    const active = ship.upgrades.includes(upgrade.id);
    const pending = pendingShipUpgrade === upgrade.id && !active;
    const fieldUpgrade = isFieldUpgrade(upgrade.id);
    const available = fieldUpgrade && canPurchaseFieldUpgrade(upgrade.id);
    const cost = FIELD_UPGRADE_COSTS[upgrade.id];
    const costLabel = cost ? formatResourceCost(cost) : '';
    const status = active
      ? 'ECHTER EINBAU · ONLINE'
      : fieldUpgrade
        ? pending ? `VORMONTIERT · BESTÄTIGEN` : available ? `${costLabel} · VORSCHAU` : `HANGAR + ${costLabel} NÖTIG`
        : 'KOSTENLOSER PROTOTYP';
    const disabled = fieldUpgrade && !available;
    return `<button type="button" class="ship-module${active ? ' active' : ''}${pending ? ' selected' : ''}" data-ship-upgrade="${upgrade.id}" style="--module-accent:${upgrade.accent}"${disabled ? ' disabled' : ''}><span>${status}</span><strong>${upgrade.name}</strong><small>${upgrade.description}</small>${cost ? resourceCostMarkup(cost) : ''}</button>`;
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
      <div class="prototype-grid">${prototypes.map((upgrade) => `<article class="ship-module prototype" style="--module-accent:${upgrade.accent}"><span>VISUELLE STUDIE</span><strong>${upgrade.name}</strong><small>${upgrade.description}</small></article>`).join('')}</div>
    </details>`;
  const installConfirm = required<HTMLElement>('shipyard-install-confirm');
  if (pendingShipUpgrade) {
    const upgrade = SHIP_UPGRADES.find((entry) => entry.id === pendingShipUpgrade)!;
    const cost = FIELD_UPGRADE_COSTS[pendingShipUpgrade]!;
    required<HTMLElement>('shipyard-install-name').textContent = upgrade.name.toUpperCase();
    required<HTMLElement>('shipyard-install-copy').textContent = `${upgrade.description} Die Montage ist nur eine Vorschau, bis du den Einbau bestätigst.`;
    required<HTMLElement>('shipyard-install-cost').innerHTML = resourceCostMarkup(cost);
    required<HTMLButtonElement>('confirm-ship-upgrade-button').disabled = !canPurchaseFieldUpgrade(pendingShipUpgrade);
    installConfirm.hidden = false;
  } else {
    installConfirm.hidden = true;
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-ship-switch]')) {
    const active = button.dataset.shipSwitch === previewVariant;
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
  }, 1_850);
  window.setTimeout(() => { moment.hidden = true; }, 4_600);
}

function playReturnMoment(cargo: Cargo): void {
  const total = cargo.alloys + cargo.data + cargo.relics;
  if (!total) {
    pendingVisualCargo = undefined;
    toast('Farhaven empfängt dich. Keine Fracht im Laderaum.');
    return;
  }
  pendingVisualCargo = cargo;
  const hangarCost = FACILITIES.hangar.cost.alloys ?? Number.POSITIVE_INFINITY;
  const hangarReady = !getProfile().facilities.hangar && getProfile().resources.alloys >= hangarCost;
  required<HTMLElement>('return-title').textContent = 'FRACHT GESICHERT';
  required<HTMLElement>('return-resources').innerHTML = resourceEntries(cargo).map(([kind, amount]) => resourceAmountMarkup(kind, amount)).join('');
  required<HTMLElement>('return-copy').textContent = hangarReady ? 'Bergungsreserve und Routenwrack reichen jetzt für den Hangar. Öffne den leuchtenden Dockbereich und verbinde ihn.' : 'Die Dockkrallen lösen sich. Farhaven wächst mit jedem Fund.';
  required<HTMLElement>('return-moment').hidden = false;
}

function renderOutpost(): void {
  required<HTMLElement>('expedition-count').textContent = String(getProfile().expeditionCount);
  const launch = required<HTMLButtonElement>('launch-button');
  const next = !getProfile().facilities.hangar
    ? getProfile().expeditionCount === 0 ? ['ERSTER KONTAKT', 'WRACK UND GLUTKUTTER', 'Bergen · fliehen oder kämpfen'] : ['ERSTER KONTAKT', 'ZURÜCK ZUM WRACK', 'Hangarplatten sichern · Kampf freiwillig']
    : !getProfile().ship?.upgrades.includes(FIRST_FIELD_UPGRADE_ID)
      ? ['HANGARWERKSTATT', 'FRACHTRÜCKEN EINBAUEN', 'Erst den echten Einbau im Hangar wählen']
      : !getProfile().ship?.upgrades.includes(SECOND_FIELD_UPGRADE_ID)
        ? ['JAGD ODER UMWEG', 'DREI WEGE ZU DEN DATEN', 'Archiv · Anomalie · Räuber']
        : !getProfile().story.routeTraceRecovered
          ? ['DRITTE SCHICHT', 'SCHWARZE ADER ERSCHLIESSEN', 'Minenlaser · optionale Plündererkiste']
          : !getProfile().facilities.navigation
            ? ['FREIE BERGUNG', 'STERNENWERK VORBEREITEN', '2 Legierungen · 2 Daten']
            : ['FREIE EXPEDITION', 'EIGENEN KURS WÄHLEN', 'Bergen · ausbauen · Veloria'];
  // Farhaven itself is the menu. Keep this only as a compact departure control;
  // the current task lives on the station rather than covering it as a large HUD card.
  launch.querySelector('span')!.textContent = 'EXPEDITION';
  launch.querySelector('strong')!.textContent = 'ASCHSAUM STARTEN';
  launch.querySelector('small')!.textContent = `${next[0]} · ${next[1]}`;
  if (coreInfoOpen) openCoreInfo();
  else renderFacilityPanel();
}

function updateOutpostChrome(): void {
  const hasShip = Boolean(getProfile().ship);
  const isInspecting = !facilityPanel.hidden || !shipyardPanel.hidden;
  const isChoosingShip = !shipSelection.hidden;
  // A room dialog sits above the canvas. Lock its world targets so the same tap
  // cannot also select a second dock behind the HTML action button. The same
  // guard is needed during hull selection: its confirmation tap must not fall
  // through to a station room as the selection screen closes.
  game.events.emit('farhaven:outpost-interaction-lock', isInspecting || isChoosingShip || Date.now() < outpostTapShieldUntil);
  if (isInspecting) shell.dataset.outpostView = 'room'; else delete shell.dataset.outpostView;
  outpostHud.hidden = !hasShip || isInspecting;
  // Farhaven is the menu now. Every constructed room is touched directly on the
  // station, so the old duplicate navigation rail would only compete for space.
  required<HTMLElement>('outpost-nav').hidden = true;
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
  required<HTMLElement>('cargo-breakdown').innerHTML = RESOURCE_ORDER.map((kind) => resourceAmountMarkup(kind, expedition.cargo[kind], true)).join('');
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
    interact.querySelector('small')!.textContent = 'Routenkern aus dem Aschsaum fehlt';
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
  if (nearby && !nearbyGuard) {
    const reward = rewardForExpeditionSignal(expedition, nearby);
    interact.querySelector('small')!.innerHTML = `${resourceIconMarkup(reward.kind)} ${reward.amount} ${RESOURCE_PRESENTATION[reward.kind].name}`;
  }
  const targetId = getSelectedTargetId();
  const selectedTarget = expedition.hostiles.find((hostile) => hostile.id === targetId);
  const primary = primaryWeaponMode();
  const primaryReadiness = readinessForWeapon(expedition, primary);
  const fire = required<HTMLButtonElement>('fire-button');
  renderWeaponReadiness(fire, primary, primaryReadiness);
  const lance = required<HTMLButtonElement>('lance-button');
  const lanceMode = lanceWeaponMode();
  if (!lanceMode) {
    lance.disabled = true;
    lance.querySelector('span')!.textContent = 'LANZE';
    lance.querySelector('small')!.textContent = 'Rail-Lanze fehlt';
  } else {
    const lanceReadiness = readinessForWeapon(expedition, lanceMode);
    renderWeaponReadiness(lance, lanceMode, lanceReadiness);
  }
  const ordnance = required<HTMLButtonElement>('ordnance-button');
  const ordnanceMode = ordnanceWeaponMode();
  if (!ordnanceMode) {
    ordnance.disabled = true;
    ordnance.querySelector('span')!.textContent = 'ORDNANZ';
    ordnance.querySelector('small')!.textContent = 'Torpedorack oder Kern fehlt';
  } else {
    const ordnanceReadiness = readinessForWeapon(expedition, ordnanceMode);
    renderWeaponReadiness(ordnance, ordnanceMode, ordnanceReadiness);
  }
  required<HTMLElement>('expedition-status').textContent = expedition.status === 'returning'
    ? 'RÜCKKEHR LÄUFT'
    : expedition.sectorId === 'veloria-rift'
      ? 'VELORIA RIFT · KARTENSONDE'
      : selectedTarget ? `AUTOZIEL · ${selectedTarget.name.toUpperCase()} · ${selectedTarget.hull}/${selectedTarget.maxHull}` : 'WAFFEN BEREIT · FREIES FEUER';
  const list = required<HTMLElement>('signal-list');
  list.replaceChildren(...expedition.signals.filter((signal) => signal.knowledge === 'classified').map((signal) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.dataset.signalCourse = signal.id;
    const distance = Math.round(Math.hypot(signal.position.x - expedition.position.x, signal.position.y - expedition.position.y));
    item.className = 'signal';
    const reward = rewardForExpeditionSignal(expedition, signal);
    const risk = signal.risk === 'high' ? 'HOHES RISIKO' : signal.risk === 'medium' ? 'MITTLERES RISIKO' : 'SICHER';
    const requirement = signal.kind === 'vein' ? ' · MINENLASER' : signal.guardedBy ? ' · BEWACHT' : '';
    item.innerHTML = `<span><b>${signal.name.toUpperCase()}</b><small>${risk}${requirement} · ${signal.description ?? ''}</small></span><span class="signal-reward" data-resource="${reward.kind}">${resourceIconMarkup(reward.kind)}<b>${reward.amount}</b><small>${distance}u</small></span>`;
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
    renderOutpost();
    renderShipSelection();
    updateOutpostChrome();
    if (!shipyardPanel.hidden) renderShipyard();
  }
  renderObjective();
}

function startExpedition(): void {
  resetFlightControls();
  paused = false;
  selectedFacility = undefined;
  pendingShipUpgrade = undefined;
  coreInfoOpen = false;
  facilityPanel.hidden = true;
  shipyardPanel.hidden = true;
  required<HTMLButtonElement>('pause-button').setAttribute('aria-pressed', 'false');
  beginExpedition();
  game.scene.stop('outpost');
  game.scene.start('expedition');
  const scenario = getExpedition()?.scenario;
  toast(scenario === 'first-wreck'
    ? 'ERSTER KONTAKT · Das Wrack ist bergbar. Der Glutkutter kann umflogen, bekämpft oder durch Rückkehr verlassen werden.'
    : scenario === 'second-shift'
      ? 'JAGD ODER UMWEG · Daten warten im Archiv, in der Liturgie oder hinter einem Räuber.'
      : 'Aschsaum I erreicht. Suche die verlorene Versorgungsroute von Farhaven.');
}

required<HTMLButtonElement>('launch-button').addEventListener('click', startExpedition);
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-facility]')) {
  button.addEventListener('click', () => openFacility(button.dataset.facility as FacilityId));
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-ship-variant]')) {
  button.addEventListener('click', () => {
    const variant = button.dataset.shipVariant as ShipVariantId;
    // Phaser receives a pointer-up shortly after this DOM click on some browsers.
    // Keep the station targets closed for that short tail so choosing a hull never
    // accidentally opens the dock located behind the confirmation card.
    shieldOutpostTaps(220);
    if (chooseStartingShip(variant)) {
      toast(`${SHIP_VARIANTS[variant].name.toUpperCase()} LIEGT AM NOTDOCK · FARHAVEN BRAUCHT EINEN HANGAR.`);
      // The screen transition itself owns the next frame. Clear any room that
      // could have been selected by a stale canvas pointer before revealing the
      // Farhaven launch control.
      window.setTimeout(() => {
        facilityPanel.hidden = true;
        shipyardPanel.hidden = true;
        selectedFacility = undefined;
        updateOutpostChrome();
      }, 0);
      window.setTimeout(updateOutpostChrome, 240);
    }
  });
}
game.events.on('farhaven:facility-selected', (facilityId: FacilityId) => {
  // Canvas targets can receive the tail of the same touch that opened a DOM
  // room panel. Once a room is open, its action must stay bound to that room.
  if (!facilityPanel.hidden || !shipyardPanel.hidden) return;
  openFacility(facilityId);
});
game.events.on('farhaven:core-selected', () => {
  if (!facilityPanel.hidden || !shipyardPanel.hidden) return;
  openCoreInfo();
});
game.events.on('farhaven:target-selected', (targetId: string) => {
  if (!selectHostile(targetId)) return;
  const target = getExpedition()?.hostiles.find((hostile) => hostile.id === targetId);
  if (target) toast(`${target.name.toUpperCase()} MARKIERT · Positioniere dich für den Angriff.`);
});
game.events.on('farhaven:target-cleared', () => clearSelectedHostile());
game.events.on('farhaven:signal-selected', (signalId: string) => {
  const signal = getExpedition()?.signals.find((entry) => entry.id === signalId);
  if (!signal || signal.knowledge !== 'classified') return;
  courseTo(signal.position);
  toast(`KURS ZU ${signal.name.toUpperCase()} GESETZT.`);
});
function enterRiftIfReady(): void {
  if (!enterAlienRift()) return;
  resetFlightControls();
  game.scene.stop('expedition');
  game.scene.start('expedition');
  toast('Das Xenogate verschluckt die Aster Vale. Veloria Rift ist noch eine Kartensonde.');
}
game.events.on('farhaven:wormhole-selected', () => {
  const expedition = getExpedition();
  if (!expedition || expedition.sectorId !== 'ashenscar') return;
  if (!isXenogateUnlocked()) {
    toast('XENOGATE VERSIEGELT · Der Routenkern aus der versiegelten Ader fehlt noch.');
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
  coreInfoOpen = false;
  updateOutpostChrome();
});
required<HTMLButtonElement>('facility-upgrade-button').addEventListener('click', () => {
  if (!selectedFacility) return;
  const facilityId = selectedFacility;
  if (improveFacility(facilityId)) {
    facilityPanel.hidden = true;
    selectedFacility = undefined;
    updateOutpostChrome();
    game.events.emit('farhaven:facility-built', facilityId);
    playConstructionMoment(facilityId);
  }
  else toast('Dafür fehlen gesicherte Ressourcen.');
  if (selectedFacility) renderFacilityPanel();
});
required<HTMLButtonElement>('open-shipyard-button').addEventListener('click', () => {
  facilityPanel.hidden = true;
  selectedFacility = undefined;
  shipyardPanel.hidden = false;
  shipyardPreviewVariant = getProfile().ship?.variant;
  pendingShipUpgrade = undefined;
  updateOutpostChrome();
  renderShipyard();
});
required<HTMLButtonElement>('close-shipyard-button').addEventListener('click', () => {
  shipyardPanel.hidden = true;
  shipyardPreviewVariant = undefined;
  pendingShipUpgrade = undefined;
  updateOutpostChrome();
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-ship-switch]')) {
  button.addEventListener('click', () => {
    const variant = button.dataset.shipSwitch as ShipVariantId;
    shipyardPreviewVariant = variant;
    toast(`${SHIP_VARIANTS[variant].name.toUpperCase()} · RUMPFVORSCHAU. Dein gewähltes Schiff bleibt unverändert.`);
    renderShipyard();
  });
}
required<HTMLElement>('shipyard-module-list').addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-ship-upgrade]');
  if (!button) return;
  const upgradeId = button.dataset.shipUpgrade as ShipUpgradeId;
  if (isFieldUpgrade(upgradeId)) {
    if (!canPurchaseFieldUpgrade(upgradeId)) {
      toast('Für diesen Einbau fehlen Hangar oder gesicherte Ressourcen.');
      return;
    }
    pendingShipUpgrade = upgradeId;
    toast(`${SHIP_UPGRADES.find((entry) => entry.id === upgradeId)!.name.toUpperCase()} VORMONTIERT · EINBAU PRÜFEN.`);
  }
  renderShipyard();
});
required<HTMLButtonElement>('cancel-ship-upgrade-button').addEventListener('click', () => {
  pendingShipUpgrade = undefined;
  renderShipyard();
  toast('VORMONTAGE VERWORFEN · KEINE RESSOURCEN VERBRAUCHT.');
});
required<HTMLButtonElement>('confirm-ship-upgrade-button').addEventListener('click', () => {
  const upgradeId = pendingShipUpgrade;
  if (!upgradeId) return;
  if (!purchaseFieldUpgrade(upgradeId)) {
    renderShipyard();
    toast('Für diesen Einbau fehlen Hangar oder gesicherte Ressourcen.');
    return;
  }
  const message: Record<ShipUpgradeId, string> = {
    'broadband-array': 'BREITBANDARRAY EINGEBAUT · +160 SCANREICHWEITE', 'cargo-spine': 'FRACHTRÜCKEN EINGEBAUT · +2 FRACHTPLÄTZE', 'vector-tail': '', 'aegis-crown': '',
    'rail-lance': 'RAIL-LANZE EINGEBAUT · ZUSÄTZLICHE FRONTWAFFE BEREIT', 'torpedo-rack': 'TORPEDORACK EINGEBAUT · ORDNANZ BEREIT',
    'side-turrets': '', 'salvage-claws': 'BERGUNGSGREIFER EINGEBAUT · WRACKBONUS BEREIT', 'mining-lasers': 'MINENLASER EINGEBAUT · SCHWARZE ADERN ERSCHLIESSEN', 'relic-shrine': '', 'core-reactor': '',
  };
  pendingShipUpgrade = undefined;
  renderShipyard();
  toast(message[upgradeId]);
});
required<HTMLButtonElement>('scan-button').addEventListener('click', () => {
  scanNearby();
  game.events.emit('farhaven:scan-pulse');
  const range = getExpedition()?.scanRadius;
  if (range) toast(`SCAN ABGESCHLOSSEN · REICHWEITE ${range}u`);
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
    const before = getExpedition()?.cargo[rewardForExpeditionSignal(expedition, nearby).kind] ?? 0;
    if (mineVeinSignal(nearby.id)) {
      const reward = rewardForExpeditionSignal(expedition, nearby);
      game.events.emit('farhaven:mining-start', nearby.position);
      if ((getExpedition()?.cargo[reward.kind] ?? before) > before) game.events.emit('farhaven:resource-collected', { kind: reward.kind, amount: reward.amount, position: nearby.position });
    }
    return;
  }
  const reward = rewardForExpeditionSignal(expedition, nearby);
  const before = getExpedition()?.cargo[reward.kind] ?? 0;
  investigateSignal(nearby.id);
  game.events.emit('farhaven:signal-action', { kind: nearby.kind, position: nearby.position });
  if ((getExpedition()?.cargo[reward.kind] ?? before) > before) game.events.emit('farhaven:resource-collected', { kind: reward.kind, amount: reward.amount, position: nearby.position });
});
function fireSelectedWeapon(weapon: WeaponMode): void {
  const before = getExpedition();
  if (!before) return;
  const targetId = targetForWeapon(before, weapon);
  if (!fireWeapons(targetId, weapon)) toast(readinessForWeapon(before, weapon).reason);
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
bindFireControl(required<HTMLButtonElement>('lance-button'), lanceWeaponMode);
bindFireControl(required<HTMLButtonElement>('ordnance-button'), ordnanceWeaponMode);
window.addEventListener('keydown', (event) => {
  if (event.repeat || paused || isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey || shell.dataset.screen !== 'expedition') return;
  const weapon = event.code === 'Digit1' ? primaryWeaponMode() : event.code === 'Digit2' ? lanceWeaponMode() : event.code === 'Digit3' ? ordnanceWeaponMode() : undefined;
  if (!weapon) return;
  event.preventDefault();
  fireSelectedWeapon(weapon);
});
required<HTMLButtonElement>('return-button').addEventListener('click', () => { resetFlightControls(); returnHome(); });
required<HTMLButtonElement>('close-return-moment').addEventListener('click', () => {
  required<HTMLElement>('return-moment').hidden = true;
  if (pendingVisualCargo) game.events.emit('farhaven:cargo-unload', pendingVisualCargo);
  pendingVisualCargo = undefined;
});
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
  resetFlightControls();
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
const pressedFlightKeys = new Set<string>();
let stickVector = { x: 0, y: 0 };

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'));
}

function applyFlightControls(): void {
  setFlightVector(pressedFlightKeys.size > 0 ? keyboardFlightVector(pressedFlightKeys) : stickVector);
}

function resetFlightControls(): void {
  const hadInput = pressedFlightKeys.size > 0 || activePointer !== undefined;
  pressedFlightKeys.clear();
  const pointer = activePointer;
  activePointer = undefined;
  stickVector = { x: 0, y: 0 };
  knob.style.transform = 'translate(0, 0)';
  if (pointer !== undefined && stick.hasPointerCapture(pointer)) stick.releasePointerCapture(pointer);
  // Don't cancel an autopilot course merely because the user changes windows.
  if (hadInput) setFlightVector({ x: 0, y: 0 });
}

window.addEventListener('keydown', (event) => {
  if (!FLIGHT_KEYS.has(event.code) || paused || getExpedition()?.status !== 'active'
    || shell.dataset.screen !== 'expedition' || isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
  event.preventDefault();
  if (event.repeat) return;
  pressedFlightKeys.add(event.code);
  applyFlightControls();
});
window.addEventListener('keyup', (event) => {
  if (!pressedFlightKeys.delete(event.code)) return;
  event.preventDefault();
  applyFlightControls();
});
window.addEventListener('blur', resetFlightControls);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetFlightControls(); });

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
  stickVector = { x: moveX / limit, y: moveY / limit };
  applyFlightControls();
}
stick.addEventListener('pointerdown', (event) => {
  if (paused || getExpedition()?.status !== 'active' || activePointer !== undefined) return;
  activePointer = event.pointerId; stick.setPointerCapture(event.pointerId); updateFlight(event);
});
stick.addEventListener('pointermove', (event) => { if (event.pointerId === activePointer) updateFlight(event); });
function releaseFlight(event: PointerEvent): void {
  if (event.pointerId !== activePointer) return;
  activePointer = undefined;
  knob.style.transform = 'translate(0, 0)';
  stickVector = { x: 0, y: 0 };
  applyFlightControls();
}
stick.addEventListener('pointerup', releaseFlight);
stick.addEventListener('pointercancel', releaseFlight);
stick.addEventListener('lostpointercapture', releaseFlight);

subscribe(() => {
  if (!getExpedition() && shell.dataset.screen === 'expedition') {
    resetFlightControls();
    const returnedCargo = consumeReturnCargo();
    // A return always lands on the neutral Farhaven overview. Clear the last
    // room selection before the scene exists, then shield it from the trailing
    // touch that initiated the return.
    selectedFacility = undefined;
    coreInfoOpen = false;
    facilityPanel.hidden = true;
    shipyardPanel.hidden = true;
    // The return button's trailing pointer only lasts a few frames. Keep the
    // safety window below human perception; a full second made Farhaven feel
    // as though it required an extra tap after every expedition.
    shieldOutpostTaps(380, true);
    game.scene.stop('expedition');
    game.scene.start('outpost');
    if (resettingForDevelopment) {
      resettingForDevelopment = false;
      toast('TESTSTAND ZURÜCKGESETZT · WÄHLE EINEN RUMPF.');
    } else if (consumeExpeditionDefeat()) {
      toast('NOTRUF EMPFANGEN · Dein Schiff wurde geborgen. Die ungesicherte Fracht ging verloren.');
    } else if (returnedCargo) {
      playReturnMoment(returnedCargo);
    } else {
      toast('Farhaven empfängt dich.');
    }
  }
  render();
});

render();

// A browser reload resumes the actual flight, rather than silently replacing it
// with the outpost screen. The snapshot itself is written by gameFlow.
game.events.once(Phaser.Core.Events.READY, () => {
  if (!getExpedition()) return;
  game.scene.stop('outpost');
  game.scene.start('expedition');
  render();
  toast('EXPEDITION FORTGESETZT · Farhaven hält deine letzte Position bereit.');
});
