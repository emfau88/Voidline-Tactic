import Phaser from 'phaser';
import { playWeaponSound } from '../../app/combatAudio';
import { wheelZoom } from '../../app/flightControls';
import { rewardForExpeditionSignal, weaponReadiness } from '../../domain/exploration/expeditionEngine';
import { RESOURCE_PRESENTATION } from '../../domain/resources/presentation';
import { getExpedition, getProfile, getSelectedTargetId, isXenogateUnlocked, tickExpedition } from '../../app/gameFlow';
import { WORMHOLE_POSITION } from '../../domain/exploration/expeditionEngine';
import type { ExpeditionState, SignalKind, Vector2, WeaponMode } from '../../domain/exploration/types';
import { SHIP_VARIANTS, type ShipUpgradeId, type ShipVariantId } from '../../domain/ship/types';

const ASTER_MODULE_ART: Partial<Record<ShipUpgradeId, string>> = {
  'broadband-array': 'aster-module-broadband-array-v1',
  'cargo-spine': 'aster-module-cargo-spine-v1',
  'vector-tail': 'aster-module-vector-tail-v1',
  'salvage-claws': 'aster-module-salvage-claws-v2',
  'mining-lasers': 'aster-module-mining-lasers-v2',
  'rail-lance': 'aster-module-rail-lance-v1',
  'torpedo-rack': 'aster-module-torpedo-rack-v1',
  'relic-shrine': 'aster-module-relic-shrine-v1',
  'side-turrets': 'aster-module-side-turrets-v1',
};

const BRAMBLE_MODULE_ART: Partial<Record<ShipUpgradeId, string>> = {
  'broadband-array': 'bramble-module-broadband-array-v1',
  'cargo-spine': 'bramble-module-cargo-spine-v1',
  'salvage-claws': 'bramble-module-salvage-claws-v1',
  'mining-lasers': 'bramble-module-mining-lasers-v1',
  'rail-lance': 'bramble-module-rail-lance-v1',
  'torpedo-rack': 'bramble-module-torpedo-rack-v1',
};

const MODULE_ART_BY_HULL: Record<ShipVariantId, Partial<Record<ShipUpgradeId, string>>> = {
  'aster-vale': ASTER_MODULE_ART,
  bramble: BRAMBLE_MODULE_ART,
};

const DEFAULT_EXPEDITION_ZOOM = 1.26;
const MIN_EXPEDITION_ZOOM = 0.82;
const MAX_EXPEDITION_ZOOM = 1.85;
const STORY_SIGNAL_ART: Readonly<Partial<Record<string, string>>> = {
  'echo-wreck': 'route-reliquary-v1',
  'first-skiff-cache': 'route-reliquary-v1',
  'raider-cipher': 'route-reliquary-v1',
  'raider-cache': 'route-reliquary-v1',
  'monk-lantern': 'monk-lantern-v1',
  'cutting-liturgy': 'cutting-liturgy-v1',
  'black-vein': 'route-vein-v1',
  'veloria-husk': 'veloria-shell-barge-v1',
  'veloria-observatory': 'veloria-shell-barge-v1',
  'veloria-pilgrim': 'veloria-pilgrim-v2',
  'veloria-cocoon': 'veloria-pilgrim-v2',
};


interface ResourceCollectedEvent {
  readonly kind: keyof typeof RESOURCE_PRESENTATION;
  readonly amount: number;
  readonly position: Vector2;
}

export class ExpeditionScene extends Phaser.Scene {
  private ship?: Phaser.GameObjects.Image;
  private shipRig?: Phaser.GameObjects.Container;
  private playerLabel?: Phaser.GameObjects.Text;
  private homeLabel?: Phaser.GameObjects.Text;
  private engineFlame?: Phaser.GameObjects.Graphics;
  private signalLayer?: Phaser.GameObjects.Container;
  private scanCompass?: Phaser.GameObjects.Container;
  private scanCompassArrow?: Phaser.GameObjects.Graphics;
  private scanCompassIcon?: Phaser.GameObjects.Image;
  private scanCompassName?: Phaser.GameObjects.Text;
  private scanCompassDistance?: Phaser.GameObjects.Text;
  private scanCompassTargetId?: string;
  private scanCompassAngle = 0;
  private lastScanCompassUpdateAt = 0;
  private knownHostileIds = new Set<string>();
  private contactsInitialized = false;
  private expeditionZoom = DEFAULT_EXPEDITION_ZOOM;
  private wheelZoomTarget?: number;
  private readonly touchPointers = new Map<number, { x: number; y: number }>();
  private pinchStartDistance = 0;
  private pinchStartZoom = DEFAULT_EXPEDITION_ZOOM;
  private removePinchListeners?: () => void;
  private readonly projectileArt = new Map<number, Phaser.GameObjects.Graphics>();
  private lastCombatEventId = 0;
  private lastSignalRenderAt = 0;
  private lastSignalState = '';

  public constructor() { super('expedition'); }

  /** Campaign art stays out of the initial Farhaven boot path. */
  public preload(): void {
    this.load.image('ship-player-frigate-v1', 'assets/ships/player-frigate-v1.png');
    this.load.image('aster-module-broadband-array-v1', 'assets/ships/aster-vale/broadband-array-v1.png');
    this.load.image('aster-module-cargo-spine-v1', 'assets/ships/aster-vale/cargo-spine-v1.png');
    this.load.image('aster-module-vector-tail-v1', 'assets/ships/aster-vale/vector-tail-v1.png');
    this.load.image('aster-module-salvage-claws-v2', 'assets/ships/aster-vale/salvage-claws-v2.png');
    this.load.image('aster-module-mining-lasers-v2', 'assets/ships/aster-vale/mining-lasers-v2.png');
    this.load.image('aster-module-rail-lance-v1', 'assets/ships/aster-vale/rail-lance-v1.png');
    this.load.image('aster-module-torpedo-rack-v1', 'assets/ships/aster-vale/torpedo-rack-v1.png');
    this.load.image('aster-module-relic-shrine-v1', 'assets/ships/aster-vale/relic-shrine-v1.png');
    this.load.image('aster-module-side-turrets-v1', 'assets/ships/aster-vale/side-turrets-v1.png');
    this.load.image('bramble-module-broadband-array-v1', 'assets/ships/bramble/broadband-array-v1.png');
    this.load.image('bramble-module-cargo-spine-v1', 'assets/ships/bramble/cargo-spine-v1.png');
    this.load.image('bramble-module-salvage-claws-v1', 'assets/ships/bramble/salvage-claws-v1.png');
    this.load.image('bramble-module-mining-lasers-v1', 'assets/ships/bramble/mining-lasers-v1.png');
    this.load.image('bramble-module-rail-lance-v1', 'assets/ships/bramble/rail-lance-v1.png');
    this.load.image('bramble-module-torpedo-rack-v1', 'assets/ships/bramble/torpedo-rack-v1.png');
    this.load.image('ship-enemy-patrol-v1', 'assets/ships/enemy-patrol-v1.png');
    this.load.image('ashen-fringe-v1', 'assets/backgrounds/ashen-fringe-v1.png');
    this.load.image('veloria-rift-v1', 'assets/backgrounds/veloria-rift-v1.webp');
    this.load.image('wormhole-gate-sealed-v4', 'assets/objects/wormhole-gate-sealed-v4.png');
    this.load.image('wormhole-gate-active-v4', 'assets/objects/wormhole-gate-active-v4.png');
    this.load.image('ash-reaver-v2', 'assets/story/ash-reaver-v2.png');
    this.load.image('ash-cantor-v1', 'assets/story/ash-cantor-v1.png');
    this.load.image('route-reliquary-v1', 'assets/story/route-reliquary-v1.png');
    this.load.image('monk-lantern-v1', 'assets/story/monk-lantern-v1.png');
    this.load.image('cutting-liturgy-v1', 'assets/story/cutting-liturgy-v1.png');
    this.load.image('route-vein-v1', 'assets/story/route-vein-v1.png');
    this.load.image('veloria-shell-barge-v1', 'assets/veloria/veloria-shell-barge-v1.png');
    this.load.image('veloria-sentinel-v2', 'assets/veloria/veloria-sentinel-v2.png');
    this.load.image('veloria-pilgrim-v2', 'assets/veloria/veloria-pilgrim-v2.png');
  }

  public create(): void {
    this.wheelZoomTarget = undefined;
    this.touchPointers.clear();
    this.pinchStartDistance = 0;
    const expedition = getExpedition();
    this.projectileArt.clear();
    this.lastCombatEventId = (expedition?.nextCombatId ?? 1) - 1;
    const isAlienRealm = expedition?.sectorId === 'veloria-rift';
    this.cameras.main.setBounds(0, 0, 4200, 2600);
    this.setExpeditionZoom(DEFAULT_EXPEDITION_ZOOM);
    const backdrop = this.add.image(2100, 1300, isAlienRealm ? 'veloria-rift-v1' : 'ashen-fringe-v1');
    const backdropScale = Math.max(4400 / backdrop.width, 2700 / backdrop.height);
    backdrop.setDisplaySize(backdrop.width * backdropScale, backdrop.height * backdropScale).setAlpha(isAlienRealm ? 0.94 : 0.92);
    const field = this.add.graphics();
    field.fillStyle(isAlienRealm ? 0x10091a : 0x040812, isAlienRealm ? 0.26 : 0.34);
    field.fillRect(0, 0, 4200, 2600);
    if (!isAlienRealm) {
      this.addFarhavenHome();
      this.addWormholeGate();
    } else {
      const returnGlow = this.add.image(2_100, 1_570, 'wormhole-gate-active-v4').setDisplaySize(112, 112).setAlpha(0.3).setDepth(1).setBlendMode(Phaser.BlendModes.ADD);
      this.add.image(2_100, 1_570, 'wormhole-gate-active-v4').setDisplaySize(96, 96).setAlpha(0.9).setDepth(2);
      this.add.text(2_100, 1_635, 'XENOGATE · RÜCKWEG NACH FARHAVEN', { fontFamily: 'Arial', fontSize: 8, color: '#e7cef8', fontStyle: 'bold', letterSpacing: 0.7 }).setOrigin(0.5).setDepth(3);
      this.tweens.add({ targets: returnGlow, angle: 360, duration: 12_000, repeat: -1, ease: 'Linear' });
    }
    const playerShip = getProfile().ship;
    const shipKey = playerShip ? SHIP_VARIANTS[playerShip.variant].assetKey : 'ship-player-frigate-v1';
    this.ship = this.add.image(0, 0, shipKey);
    this.ship.setDisplaySize(this.ship.width / this.ship.height * 144, 144);
    if (!playerShip) this.ship.setTint(0xf3eadb);
    this.shipRig = this.add.container(2_100, 1_500, [this.ship]).setDepth(5);
    if (playerShip) this.addShipUpgradeArt(playerShip.upgrades);
    this.engineFlame = this.add.graphics().setDepth(6);
    this.playerLabel = this.add.text(2_100, 1_538, 'ASTER VALE', { fontFamily: 'Arial', fontSize: 12, color: '#d9f6fb', fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(7);
    this.signalLayer = this.add.container(0, 0).setDepth(4);
    this.createScanCompass();
    this.events.on('wake', () => this.refresh());
    this.game.events.on('farhaven:mining-start', this.showMining, this);
    this.game.events.on('farhaven:signal-action', this.showSignalAction, this);
    this.game.events.on('farhaven:resource-collected', this.showResourceCollected, this);
    this.game.events.on('farhaven:scan-pulse', this.showScanPulse, this);
    this.input.on('pointerdown', this.selectHostileAtPointer, this);
    this.bindPinchZoom();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.projectileArt.clear();
      this.game.events.off('farhaven:mining-start', this.showMining, this);
      this.game.events.off('farhaven:signal-action', this.showSignalAction, this);
      this.game.events.off('farhaven:resource-collected', this.showResourceCollected, this);
      this.game.events.off('farhaven:scan-pulse', this.showScanPulse, this);
      this.input.off('pointerdown', this.selectHostileAtPointer, this);
      this.removePinchListeners?.();
    });
    this.refresh();
  }

  /**
   * The return landmark mirrors the persistent outpost instead of showing a
   * generic core. Modules use the same artwork and cardinal docking layout as
   * Farhaven, only reduced to an unobtrusive navigation-scale silhouette.
   */
  private addFarhavenHome(): void {
    const profile = getProfile();
    const builtFacilities = Object.entries(profile.facilities)
      .filter(([, level]) => level > 0)
      .map(([id]) => id);
    this.game.canvas.dataset.expeditionFarhaven = builtFacilities.length > 0 ? `core,${builtFacilities.join(',')}` : 'core';
    this.game.canvas.dataset.expeditionFarhavenScale = '1.55';
    // The old return landmark was smaller than the player's hull. Keep it a
    // navigational miniature, but large enough to read as the station it mirrors.
    // The ship begins just outside the northern collar, so the station reads
    // immediately on a short landscape phone rather than sitting below camera.
    const center = { x: 2_100, y: 1_650 };
    const homeGlow = this.add.circle(center.x, center.y, 142, 0xe7b96e, 0.08).setDepth(1);
    this.tweens.add({ targets: homeGlow, alpha: { from: 0.055, to: 0.1 }, duration: 4_800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    const dock = this.add.graphics().setDepth(2);
    dock.lineStyle(2, 0x91e4eb, 0.52);
    dock.lineBetween(2_100, 1_510, 2_100, 1_584);
    dock.fillStyle(0xf2cb79, 0.82);
    dock.fillCircle(2_100, 1_584, 3.5);

    const addAtlasModule = (x: number, y: number, frame: number | string, rotation = 0): void => {
      this.add.image(x, y, 'farhaven-module-kit-v2', frame)
        .setDisplaySize(82, 82)
        .setRotation(rotation)
        .setDepth(2)
        .setAlpha(0.96);
    };
    if (profile.facilities.scanner > 0) addAtlasModule(center.x, center.y - 84, 'scanner-clean');
    if (profile.facilities.labor > 0) addAtlasModule(center.x - 84, center.y, 2);
    if (profile.facilities.navigation > 0) addAtlasModule(center.x, center.y + 84, 3);
    if (profile.facilities.hangar > 0) {
      this.add.image(center.x + 90, center.y, 'farhaven-hangar-module-v1')
        .setDisplaySize(68, 94)
        .setRotation(-Math.PI / 2)
        .setDepth(2)
        .setAlpha(0.98);
    }
    this.add.image(center.x, center.y, 'farhaven-core-v2').setDisplaySize(112, 112).setDepth(3).setAlpha(0.98);
    this.homeLabel = this.add.text(center.x, center.y + 138, 'FARHAVEN · HEIMATHAFEN', {
      fontFamily: 'Arial', fontSize: 10, color: '#ebcf91', fontStyle: 'bold', letterSpacing: 0.75,
    }).setOrigin(0.5).setDepth(3);
  }

  private addWormholeGate(): void {
    const x = WORMHOLE_POSITION.x;
    const y = WORMHOLE_POSITION.y;
    const active = isXenogateUnlocked();
    const key = active ? 'wormhole-gate-active-v4' : 'wormhole-gate-sealed-v4';
    const glow = this.add.image(x, y, key).setDisplaySize(270, 270).setAlpha(active ? 0.3 : 0.11).setBlendMode(Phaser.BlendModes.ADD).setDepth(2);
    const gate = this.add.image(x, y, key).setDisplaySize(252, 252).setDepth(3).setInteractive({ useHandCursor: true });
    gate.on('pointerdown', () => this.game.events.emit('farhaven:wormhole-selected'));
    this.tweens.add({ targets: glow, angle: active ? 360 : -180, duration: active ? 12_000 : 22_000, repeat: -1, ease: 'Linear' });
    this.tweens.add({ targets: gate, scaleX: gate.scaleX * (active ? 1.035 : 1.012), scaleY: gate.scaleY * (active ? 1.035 : 1.012), duration: active ? 1_650 : 3_200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: glow, scaleX: glow.scaleX * (active ? 1.06 : 1.025), scaleY: glow.scaleY * (active ? 1.06 : 1.025), duration: active ? 1_650 : 3_200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const frame = this.add.graphics().setDepth(4);
    this.drawCornerFrame(frame, WORMHOLE_POSITION, 137, 19, 0xb881f4, 0.9);
    const labelBack = this.add.graphics().setDepth(4);
    labelBack.fillStyle(0x0c101d, 0.88); labelBack.fillRoundedRect(x - 74, y + 136, 148, 32, 8);
    labelBack.lineStyle(1, 0xa879e4, 0.78); labelBack.strokeRoundedRect(x - 74, y + 136, 148, 32, 8);
    this.add.text(x, y + 141, active ? 'XENOGATE · VELORIA' : 'XENOGATE · VERSIEGELT', { fontFamily: 'Arial', fontSize: 9, color: '#eee0ff', fontStyle: 'bold', letterSpacing: 0.65 }).setOrigin(0.5, 0).setDepth(5);
    this.add.text(x, y + 153, active ? 'TIPPE FÜR KURS · AM TOR DURCHQUEREN' : 'DIE VERLORENE ROUTE KÖNNTE ES ÖFFNEN', { fontFamily: 'Arial', fontSize: 6, color: '#b9d9dc', letterSpacing: 0.25 }).setOrigin(0.5, 0).setDepth(5);
  }

  public update(_time: number, delta: number): void {
    if (this.wheelZoomTarget !== undefined) {
      const next = Phaser.Math.Linear(this.expeditionZoom, this.wheelZoomTarget, 1 - Math.exp(-delta / 90));
      if (Math.abs(next - this.wheelZoomTarget) < 0.001) {
        this.setExpeditionZoom(this.wheelZoomTarget, 0.55);
        this.wheelZoomTarget = undefined;
      } else this.setExpeditionZoom(next, 0.55);
    }
    tickExpedition(delta);
    this.refresh();
  }

  private refresh(): void {
    const expedition = getExpedition();
    if (!expedition || !this.shipRig || !this.signalLayer || !this.playerLabel || !this.engineFlame) return;
    const engineFlame = this.engineFlame;
    this.syncCombat(expedition);
    this.shipRig.setPosition(expedition.position.x, expedition.position.y).setRotation(expedition.heading);
    this.playerLabel.setPosition(expedition.position.x, expedition.position.y + 48);
    this.homeLabel?.setVisible(Math.hypot(expedition.position.x - 2_100, expedition.position.y - 1_500) > 105);
    const speed = Math.hypot(expedition.velocity.x, expedition.velocity.y);
    const travelAngle = expedition.heading - Math.PI / 2;
    const forward = { x: Math.cos(travelAngle), y: Math.sin(travelAngle) };
    const side = { x: -forward.y, y: forward.x };
    const beamLength = 10 + speed * 188;
    const pulse = 0.86 + Math.sin(this.time.now * 0.024) * 0.12;
    engineFlame.clear();
    // Flat 2D exhaust ribbons: no rotating cone silhouette, only three nozzle-aligned beams.
    [-12, 0, 12].forEach((offset, index) => {
      const nozzle = {
        x: expedition.position.x - forward.x * 39 + side.x * offset,
        y: expedition.position.y - forward.y * 39 + side.y * offset,
      };
      const end = {
        x: nozzle.x - forward.x * (beamLength * (index === 1 ? 1 : 0.76)),
        y: nozzle.y - forward.y * (beamLength * (index === 1 ? 1 : 0.76)),
      };
      engineFlame.lineStyle(index === 1 ? 5 : 3, 0x55d9ed, speed > 0.008 ? 0.42 * pulse : 0.12);
      engineFlame.lineBetween(nozzle.x, nozzle.y, end.x, end.y);
      engineFlame.lineStyle(index === 1 ? 2 : 1.4, 0xd4fbff, speed > 0.008 ? 0.88 * pulse : 0.3);
      engineFlame.lineBetween(nozzle.x, nozzle.y, end.x, end.y);
      engineFlame.fillStyle(0x8eeeff, speed > 0.008 ? 0.86 : 0.38);
      engineFlame.fillCircle(nozzle.x, nozzle.y, index === 1 ? 3.2 : 2.2);
    });
    this.cameras.main.centerOn(expedition.position.x, expedition.position.y);
    this.updateScanCompass(expedition);
    // Signal markers are rich scene objects. Rebuilding them on every physics
    // tick is wasteful on a phone; a scan still forces an immediate refresh
    // through its changed state signature.
    const signalState = `${expedition.signals.map((signal) => `${signal.id}:${signal.knowledge}`).join(',')}|${expedition.hostiles.map((hostile) => `${hostile.id}:${hostile.hull}:${hostile.status}`).join(',')}|${getSelectedTargetId() ?? ''}`;
    if (signalState !== this.lastSignalState || this.time.now - this.lastSignalRenderAt >= 90) {
      this.lastSignalState = signalState;
      this.lastSignalRenderAt = this.time.now;
      this.renderSignals(expedition);
    }
  }

  private renderSignals(expedition: ExpeditionState): void {
    this.signalLayer?.removeAll(true);
    this.game.canvas.dataset.expeditionContacts = expedition.hostiles.map((hostile) => hostile.id).join(',');
    for (const signal of expedition.signals) {
      if (signal.knowledge === 'resolved') continue;
      if (signal.knowledge === 'echo') this.addFaintEcho(signal.position);
      else this.addSignalMarker(signal);
    }
    for (const hostile of expedition.hostiles) {
      const selected = getSelectedTargetId() === hostile.id;
      const hostileKey = hostile.kind === 'guardian'
        ? 'ash-cantor-v1'
        : hostile.kind === 'sentinel'
          ? 'veloria-sentinel-v2'
          : hostile.kind === 'raider' || hostile.id === 'first-cinder-skiff' || hostile.id === 'cinder-skiff'
            ? 'ash-reaver-v2'
            : 'ship-enemy-patrol-v1';
      const hostileArt = this.add.image(hostile.position.x, hostile.position.y, hostileKey);
      const hostileHeight = hostile.kind === 'guardian' ? 184 : hostile.kind === 'sentinel' ? 126 : hostile.kind === 'raider' ? 118 : 96;
      hostileArt.setDisplaySize(hostileArt.width / hostileArt.height * hostileHeight, hostileHeight)
        .setRotation(hostile.heading);
      if (!this.contactsInitialized || !this.knownHostileIds.has(hostile.id)) {
        if (this.contactsInitialized) this.showDummyRespawn(hostile.position);
      }
      if (selected) {
        const bracket = this.add.graphics();
        const radius = hostile.kind === 'guardian' ? 82 : hostile.kind === 'raider' ? 56 : 50;
        this.drawCornerFrame(bracket, hostile.position, radius, 8, 0xe8c27d, 0.72);
        this.signalLayer?.add(bracket);
      }
      if (!hostile.passive && hostile.status === 'alert') {
        const warning = this.add.graphics();
        const chargeWindow = hostile.kind === 'guardian' ? 2_600 : hostile.kind === 'sentinel' ? 2_100 : hostile.kind === 'patrol' ? 1_050 : 1_350;
        const charging = (hostile.attackCooldownMs ?? Number.POSITIVE_INFINITY) <= chargeWindow;
        warning.lineStyle(charging ? 3 : 2, charging ? 0xffc36f : 0xf1796c, charging ? 0.94 : 0.66);
        warning.strokeCircle(hostile.position.x, hostile.position.y, hostile.kind === 'guardian' ? 112 : hostile.kind === 'sentinel' ? 82 : hostile.kind === 'raider' ? 71 : 58);
        warning.lineStyle(1, 0xffd3b5, 0.46); warning.strokeCircle(hostile.position.x, hostile.position.y, hostile.kind === 'raider' ? 82 : 69);
        this.signalLayer?.add(warning);
      }
      const state = selected
        ? `AUTOZIEL · ${weaponReadiness(expedition, hostile.id, 'broadside').reason.toUpperCase()}`
        : hostile.passive
        ? 'TESTKONTAKT · AUTOMATISCH ERFASST'
        : hostile.status === 'alert'
          ? (hostile.attackCooldownMs ?? 9_999) <= (hostile.kind === 'guardian' ? 2_600 : hostile.kind === 'sentinel' ? 2_100 : hostile.kind === 'patrol' ? 1_050 : 1_350)
            ? `${hostile.kind === 'guardian' ? 'ASCHENCHOR' : hostile.kind === 'sentinel' ? 'ENERGIEKUGEL' : hostile.kind === 'patrol' ? 'STREUSALVE' : 'SALVE'} LÄDT · ${Math.max(0.1, (hostile.attackCooldownMs ?? 0) / 1000).toFixed(1)}s`
            : 'ALARM · FLUCHT MÖGLICH'
          : hostile.status === 'watchful' ? 'BEOBACHTET DICH · NOCH FRIEDLICH' : 'PATROUILLE · UMGEHBAR';
      const hullWidth = hostile.kind === 'guardian' ? 116 : hostile.kind === 'raider' ? 94 : 82;
      const hullBar = this.add.graphics();
      hullBar.fillStyle(0x220f14, 0.9); hullBar.fillRoundedRect(hostile.position.x - hullWidth / 2, hostile.position.y + 51, hullWidth, 7, 3);
      hullBar.fillStyle(hostile.hull / hostile.maxHull < 0.35 ? 0xff816d : 0xe9a46f, 0.96);
      hullBar.fillRoundedRect(hostile.position.x - hullWidth / 2 + 1, hostile.position.y + 52, Math.max(2, (hullWidth - 2) * hostile.hull / hostile.maxHull), 5, 2);
      const label = this.add.text(hostile.position.x, hostile.position.y + 63, `${hostile.name.toUpperCase()} · HÜLLE ${hostile.hull}/${hostile.maxHull}\n${state}`, { fontFamily: 'Arial', fontSize: 10, color: selected ? '#ffe1a3' : hostile.passive ? '#bfeef4' : '#ffc1c7', align: 'center', lineSpacing: 2 }).setOrigin(0.5);
      this.signalLayer?.add(hostileArt);
      this.signalLayer?.add(hullBar);
      this.signalLayer?.add(label);
    }
    this.knownHostileIds = new Set(expedition.hostiles.map((hostile) => hostile.id));
    this.contactsInitialized = true;
  }

  private selectHostileAtPointer(pointer: Phaser.Input.Pointer): void {
    const expedition = getExpedition();
    if (!expedition) return;
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const nearest = expedition.hostiles
      .map((hostile) => ({ hostile, distance: Math.hypot(hostile.position.x - world.x, hostile.position.y - world.y) }))
      .sort((first, second) => first.distance - second.distance)[0];
    if (!nearest) { this.game.events.emit('farhaven:target-cleared'); return; }
    const hitRadius = nearest.hostile.kind === 'guardian' ? 132 : nearest.hostile.kind === 'raider' ? 94 : 82;
    if (nearest.distance <= hitRadius) this.game.events.emit('farhaven:target-selected', nearest.hostile.id);
    else this.game.events.emit('farhaven:target-cleared');
  }

  private setExpeditionZoom(zoom: number, minimum = MIN_EXPEDITION_ZOOM): void {
    this.expeditionZoom = Phaser.Math.Clamp(zoom, minimum, MAX_EXPEDITION_ZOOM);
    this.cameras.main.setZoom(this.expeditionZoom);
    this.game.canvas.dataset.expeditionZoom = this.expeditionZoom.toFixed(3);
  }

  private bindPinchZoom(): void {
    const canvas = this.game.canvas;
    const point = (event: PointerEvent): { x: number; y: number } => {
      const bounds = canvas.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    const gap = (): number => {
      const [first, second] = [...this.touchPointers.values()];
      return first && second ? Math.hypot(second.x - first.x, second.y - first.y) : 0;
    };
    const down = (event: PointerEvent): void => {
      if (event.pointerType !== 'touch') return;
      this.touchPointers.set(event.pointerId, point(event));
      if (this.touchPointers.size === 2) {
        this.wheelZoomTarget = undefined;
        this.pinchStartDistance = Math.max(1, gap());
        this.pinchStartZoom = this.expeditionZoom;
      }
    };
    const move = (event: PointerEvent): void => {
      if (!this.touchPointers.has(event.pointerId)) return;
      this.touchPointers.set(event.pointerId, point(event));
      if (this.touchPointers.size !== 2 || this.pinchStartDistance <= 0) return;
      event.preventDefault();
      this.setExpeditionZoom(this.pinchStartZoom * gap() / this.pinchStartDistance);
    };
    const up = (event: PointerEvent): void => {
      this.touchPointers.delete(event.pointerId);
      if (this.touchPointers.size < 2) this.pinchStartDistance = 0;
    };
    const wheel = (event: WheelEvent): void => {
      // Only the world canvas consumes wheel input. Preserve browser Ctrl/Cmd zoom
      // and scrolling in every HTML overlay; pinch retains its existing bounds.
      if (event.ctrlKey || event.metaKey || !this.scene.isActive()) return;
      event.preventDefault();
      this.wheelZoomTarget = wheelZoom(this.wheelZoomTarget ?? this.expeditionZoom, event.deltaY, event.deltaMode, this.scale.height);
    };
    canvas.addEventListener('wheel', wheel, { passive: false });
    canvas.addEventListener('pointerdown', down, { passive: true });
    canvas.addEventListener('pointermove', move, { passive: false });
    canvas.addEventListener('pointerup', up, { passive: true });
    canvas.addEventListener('pointercancel', up, { passive: true });
    this.removePinchListeners = () => {
      canvas.removeEventListener('wheel', wheel);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }

  private addFaintEcho(position: Vector2): void {
    const echo = this.add.graphics();
    echo.lineStyle(1, 0x6e8592, 0.3);
    echo.lineBetween(position.x - 5, position.y, position.x + 5, position.y);
    echo.lineBetween(position.x, position.y - 5, position.x, position.y + 5);
    echo.fillStyle(0x8fa3ad, 0.28); echo.fillRect(position.x - 1, position.y - 1, 2, 2);
    this.signalLayer?.add(echo);
  }

  private addSignalMarker(signal: ExpeditionState['signals'][number]): void {
    const prominentWreck = signal.id === 'echo-wreck';
    const guarded = Boolean(signal.guardedBy);
    const color = guarded ? 0xd3a166 : signal.kind === 'anomaly' ? 0xca84ec : signal.kind === 'distress' ? 0xf0bd74 : signal.kind === 'vein' ? 0xdfa85b : 0x71dbe4;
    const action = guarded ? 'BEUTE GESCHÜTZT' : signal.kind === 'wreck' ? 'BERGEN' : signal.kind === 'vein' ? 'ABBAU' : signal.kind === 'anomaly' ? 'DEUTEN' : 'ANTWORTEN';
    const marker = this.add.container(signal.position.x, signal.position.y).setSize(prominentWreck ? 156 : 120, prominentWreck ? 172 : 120).setInteractive({ useHandCursor: true });
    const art = this.add.graphics();
    const storyArt = STORY_SIGNAL_ART[signal.id];
    if (storyArt) {
      art.fillStyle(color, 0.12); art.fillCircle(0, -3, 38);
      art.lineStyle(1, color, 0.55); art.strokeCircle(0, -3, 34);
    } else {
      art.fillStyle(0x07121c, 0.9); art.fillRoundedRect(-26, -30, 52, 52, 9);
      art.lineStyle(2, color, 0.94); art.strokeRoundedRect(-26, -30, 52, 52, 9);
      this.drawCornerFrame(art, { x: 0, y: -4 }, 33, 10, color, 0.76);
    }
    if (!storyArt && signal.kind === 'wreck') {
      art.fillStyle(color, 0.82); art.fillTriangle(-12, -14, 0, -24, 5, -8); art.fillTriangle(-3, 2, 13, -12, 16, 10);
      art.lineStyle(2, 0xdaf6f7, 0.86); art.lineBetween(-15, 8, -4, -1); art.lineBetween(-4, -1, 6, 9);
    } else if (!storyArt && signal.kind === 'vein') {
      art.fillStyle(color, 0.88); art.fillTriangle(-14, 11, -8, -19, -1, 11); art.fillTriangle(-2, 11, 5, -25, 14, 11);
      art.lineStyle(1, 0xffe2a1, 0.9); art.lineBetween(-17, 14, 17, 14);
    } else if (!storyArt && signal.kind === 'anomaly') {
      art.lineStyle(3, color, 0.96); art.strokeTriangle(0, -24, 16, -4, 0, 16); art.strokeTriangle(0, -16, -16, 4, 0, 24);
      art.fillStyle(0xf0d0ff, 0.85); art.fillRect(-2, -4, 4, 8);
    } else if (!storyArt) {
      art.fillStyle(color, 0.92); art.fillTriangle(0, -24, -11, 10, 11, 10);
      art.lineStyle(2, 0xffecbc, 0.94); art.lineBetween(-16, 15, 16, 15); art.lineBetween(-10, 21, 10, 21);
    }
    const labelY = prominentWreck ? 66 : storyArt ? 42 : 30;
    const labelBack = this.add.graphics();
    labelBack.fillStyle(0x07131d, 0.88); labelBack.fillRoundedRect(-60, labelY, 120, 40, 7);
    labelBack.lineStyle(1, color, 0.62); labelBack.strokeRoundedRect(-60, labelY, 120, 40, 7);
    const label = this.add.text(0, labelY + 4, signal.name.toUpperCase(), { fontFamily: 'Arial', fontSize: 9, color: '#e6f4f3', align: 'center', fontStyle: 'bold', wordWrap: { width: 112 } }).setOrigin(0.5, 0);
    const reward = rewardForExpeditionSignal(getExpedition(), signal);
    const resource = RESOURCE_PRESENTATION[reward.kind];
    const rewardIcon = this.add.image(-42, labelY + 29, resource.textureKey).setDisplaySize(12, 12);
    const actionLabel = this.add.text(-33, labelY + 28, `${reward.amount} ${resource.name.toUpperCase()} · ${action}`, { fontFamily: 'Arial', fontSize: 6, color: resource.color, align: 'left', fontStyle: 'bold', letterSpacing: 0.2 }).setOrigin(0, 0);
    const compactDebris = signal.id === 'first-skiff-cache' || signal.id === 'raider-cipher';
    const storySize = prominentWreck ? 124 : compactDebris ? 62 : signal.kind === 'anomaly' ? 84 : 76;
    const image = storyArt ? this.add.image(0, -3, storyArt).setDisplaySize(storySize, storySize) : undefined;
    marker.add(image ? [art, image, labelBack, label, rewardIcon, actionLabel] : [art, labelBack, label, rewardIcon, actionLabel]);
    marker.on('pointerdown', () => this.game.events.emit('farhaven:signal-selected', signal.id));
    this.signalLayer?.add(marker);
  }

  /** Build the scan navigator once. It must never live in signalLayer, whose
   * contents are intentionally rebuilt as contacts change. */
  private createScanCompass(): void {
    const back = this.add.graphics();
    back.fillStyle(0x07151f, 0.74); back.fillRoundedRect(-42, -17, 84, 34, 9);
    back.lineStyle(1, 0x80cbd2, 0.46); back.strokeRoundedRect(-42, -17, 84, 34, 9);
    this.scanCompassArrow = this.add.graphics().setPosition(-29, 0);
    this.scanCompassArrow.lineStyle(2, 0x94e7e8, 0.74);
    this.scanCompassArrow.lineBetween(-5, 4, 0, -4);
    this.scanCompassArrow.lineBetween(0, -4, 5, 4);
    this.scanCompassIcon = this.add.image(-12, 0, 'resource-alloys-v1').setDisplaySize(13, 13);
    this.scanCompassName = this.add.text(-2, -11, '', {
      fontFamily: 'Arial', fontSize: 7, color: '#d9f3f2', fontStyle: 'bold',
    }).setOrigin(0, 0);
    this.scanCompassDistance = this.add.text(-2, 1, '', {
      fontFamily: 'Arial', fontSize: 6.5, color: '#9fbabe', fontStyle: 'bold',
    }).setOrigin(0, 0);
    this.scanCompass = this.add.container(0, 0, [back, this.scanCompassArrow, this.scanCompassIcon, this.scanCompassName, this.scanCompassDistance])
      .setDepth(20)
      .setScrollFactor(0)
      .setSize(84, 34)
      .setInteractive({ useHandCursor: true })
      .setVisible(false)
      .setAlpha(0.9);
    this.scanCompass.on('pointerdown', () => {
      if (this.scanCompassTargetId) this.game.events.emit('farhaven:signal-selected', this.scanCompassTargetId);
    });
  }

  /**
   * One quiet screen-edge guide replaces the old group of world-space arrows.
   * Its angle is interpolated across the wrap boundary, so ship motion cannot
   * make it flicker, jump or leave graphics along the travelled path.
   */
  private updateScanCompass(expedition: ExpeditionState): void {
    if (!this.scanCompass || !this.scanCompassArrow || !this.scanCompassIcon || !this.scanCompassName || !this.scanCompassDistance) return;
    const candidate = expedition.signals
      .filter((signal) => signal.knowledge === 'classified')
      .map((signal) => ({ signal, distance: Math.hypot(signal.position.x - expedition.position.x, signal.position.y - expedition.position.y) }))
      .filter(({ distance }) => distance >= 190)
      .sort((first, second) => {
        const firstOnCourse = expedition.course && Math.hypot(first.signal.position.x - expedition.course.x, first.signal.position.y - expedition.course.y) < 4;
        const secondOnCourse = expedition.course && Math.hypot(second.signal.position.x - expedition.course.x, second.signal.position.y - expedition.course.y) < 4;
        if (firstOnCourse !== secondOnCourse) return firstOnCourse ? -1 : 1;
        return first.distance - second.distance;
      })[0];
    if (!candidate) {
      this.scanCompass.setVisible(false);
      this.scanCompassTargetId = undefined;
      this.game.canvas.dataset.scanCompass = 'hidden';
      return;
    }

    const reward = rewardForExpeditionSignal(expedition, candidate.signal);
    const resource = RESOURCE_PRESENTATION[reward.kind];
    const desiredAngle = Math.atan2(candidate.signal.position.y - expedition.position.y, candidate.signal.position.x - expedition.position.x) + Math.PI / 2;
    const now = this.time.now;
    if (this.scanCompassTargetId !== candidate.signal.id) {
      this.scanCompassAngle = desiredAngle;
    } else {
      const elapsed = Phaser.Math.Clamp(now - this.lastScanCompassUpdateAt, 0, 50);
      const blend = 1 - Math.exp(-elapsed / 105);
      this.scanCompassAngle += Phaser.Math.Angle.Wrap(desiredAngle - this.scanCompassAngle) * blend;
    }
    this.lastScanCompassUpdateAt = now;
    this.scanCompassTargetId = candidate.signal.id;
    this.scanCompassArrow.setRotation(this.scanCompassAngle);
    this.scanCompassIcon.setTexture(resource.textureKey);
    this.scanCompassName.setText(resource.name.toUpperCase()).setColor(resource.color);
    this.scanCompassDistance.setText(`${Math.round(candidate.distance)}u · SCAN ${expedition.scanRadius}u`);
    // scrollFactor(0) still participates in the camera zoom transform. Place
    // and counter-scale around the viewport centre so the guide remains a
    // crisp 84x34 px and cannot drift beyond the edge at higher map zooms.
    const zoom = this.cameras.main.zoom;
    const desiredX = this.scale.width - 96;
    const desiredY = Math.max(88, this.scale.height * 0.38);
    const screenX = this.scale.width * 0.5 + (desiredX - this.scale.width * 0.5) / zoom;
    const screenY = this.scale.height * 0.5 + (desiredY - this.scale.height * 0.5) / zoom;
    this.scanCompass
      .setPosition(screenX, screenY)
      .setScale(1 / zoom)
      .setVisible(true);
    this.game.canvas.dataset.scanCompass = 'visible';
    this.game.canvas.dataset.scanCompassTarget = candidate.signal.id;
  }


  private drawCornerFrame(graphics: Phaser.GameObjects.Graphics, center: Vector2, radius: number, arm: number, color: number, alpha: number): void {
    graphics.lineStyle(2, color, alpha);
    const left = center.x - radius; const right = center.x + radius; const top = center.y - radius; const bottom = center.y + radius;
    graphics.lineBetween(left, top + arm, left, top); graphics.lineBetween(left, top, left + arm, top);
    graphics.lineBetween(right - arm, top, right, top); graphics.lineBetween(right, top, right, top + arm);
    graphics.lineBetween(left, bottom - arm, left, bottom); graphics.lineBetween(left, bottom, left + arm, bottom);
    graphics.lineBetween(right - arm, bottom, right, bottom); graphics.lineBetween(right, bottom - arm, right, bottom);
  }

  private syncCombat(expedition: ExpeditionState): void {
    const active = new Set(expedition.projectiles.map((shot) => shot.id));
    for (const [id, art] of this.projectileArt) {
      if (!active.has(id)) { art.destroy(); this.projectileArt.delete(id); }
    }
    for (const shot of expedition.projectiles) {
      let art = this.projectileArt.get(shot.id);
      if (!art) {
        art = this.add.graphics().setDepth(12);
        const color = this.projectileColor(shot.weapon, shot.side);
        // All geometry is local to the simulated projectile; no target tweens.
        art.fillStyle(color, 0.18); art.fillEllipse(-8, 0, shot.weapon === 'rail' ? 70 : 35, shot.radius * 5);
        if (shot.weapon === 'broadside') {
          // One physical damage packet, presented as three cannon rounds
          // chasing one another rather than a simultaneous laser-like fan.
          for (const [i, x] of [0, -16, -32].entries()) {
            art.lineStyle(2, color, 0.55 + i * .08); art.lineBetween(x - 17, 0, x - 4, 0);
            art.fillStyle(0xffebcb, 1); art.fillCircle(x, 0, 2.7);
          }
        } else if (shot.weapon === 'rail') {
          art.lineStyle(8, color, 0.28); art.lineBetween(-48, 0, 0, 0);
          art.lineStyle(3, 0xe9ffff, 1); art.lineBetween(-40, 0, 0, 0);
        } else if (shot.weapon === 'torpedo') {
          art.lineStyle(4, 0x77dde7, 0.5); art.lineBetween(-36, 0, -7, 0);
          art.fillStyle(0xf6bc76, 1); art.fillEllipse(-11, 0, 14, 5);
          art.fillStyle(0xe2f1ee, 1); art.fillRoundedRect(-7, -3, 17, 6, 3);
        } else {
          art.fillStyle(color, 0.24); art.fillCircle(0, 0, 23);
          art.lineStyle(1.5, color, 0.8); art.strokeCircle(0, 0, 16);
          art.fillStyle(0xecd9ff, 0.95); art.fillCircle(0, 0, 9);
        }
        this.projectileArt.set(shot.id, art);
      }
      art.setPosition(shot.position.x, shot.position.y).setRotation(Math.atan2(shot.velocity.y, shot.velocity.x));
    }
    for (const event of expedition.combatEvents) {
      if (event.id <= this.lastCombatEventId) continue;
      this.lastCombatEventId = event.id;
      const color = this.projectileColor(event.weapon, event.side);
      if (event.kind === 'shot') {
        if (event.side === 'player' && event.weapon === 'broadside') this.showBroadsideVolley(event.position, color);
        else this.spawnMuzzle(event.position, color, event.weapon === 'rail' ? 12 : 8);
        if (event.side === 'player') {
          playWeaponSound(event.weapon);
          this.cameras.main.shake(event.weapon === 'torpedo' ? 140 : 65, 0.0013);
        }
      } else {
        this.spawnImpact(event.position, color, event.destroyed);
        const text = event.kind === 'blocked' ? 'CHORSCHILD'
          : event.side === 'hostile' ? `HÜLLE −${event.damage}`
          : event.destroyed ? 'ZIEL ZERSTÖRT' : `−${event.damage} · HÜLLE ${event.hull}/${event.maxHull}`;
        this.showDamageReadout(event.position, text, event.side === 'hostile' ? '#ff9b88' : '#ffddaa');
        if (event.side === 'hostile') {
          this.ship?.setTint(0xff9b88);
          this.time.delayedCall(120, () => this.ship?.clearTint());
        }
      }
    }
    this.game.canvas.dataset.projectileCount = String(expedition.projectiles.length);
    this.game.canvas.dataset.combatEventId = String(this.lastCombatEventId);
  }

  private projectileColor(weapon: WeaponMode, side: 'player' | 'hostile'): number {
    return weapon === 'orb' ? 0xcba4ff : side === 'hostile' ? 0xf49b7b
      : weapon === 'rail' || weapon === 'torpedo' ? 0x8eeeff : 0xffb26f;
  }

  private showDamageReadout(position: Vector2, text: string, color: string): void {
    const readout = this.add.text(position.x, position.y - 68, text, {
      fontFamily: 'Arial', fontSize: 12, color, fontStyle: 'bold', stroke: '#071019', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(15);
    this.tweens.add({ targets: readout, y: readout.y - 24, alpha: 0, duration: 850, ease: 'Cubic.Out', onComplete: () => readout.destroy() });
  }

  private worldFromShip(localX: number, localY: number): Vector2 {
    const rig = this.shipRig!;
    const cos = Math.cos(rig.rotation);
    const sin = Math.sin(rig.rotation);
    return { x: rig.x + localX * cos - localY * sin, y: rig.y + localX * sin + localY * cos };
  }

  private spawnMuzzle(position: Vector2, color: number, radius: number): void {
    const flash = this.add.circle(position.x, position.y, radius, color, 0.92).setDepth(11);
    const halo = this.add.circle(position.x, position.y, radius * 2.4, color, 0.24).setDepth(10);
    this.tweens.add({ targets: [flash, halo], scale: 0.18, alpha: 0, duration: 130, ease: 'Quad.Out', onComplete: () => { flash.destroy(); halo.destroy(); } });
  }

  private showBroadsideVolley(eventPosition: Vector2, color: number): void {
    if (!this.shipRig) return;
    const left = this.worldFromShip(-43, 0);
    const right = this.worldFromShip(43, 0);
    const side = Phaser.Math.Distance.Between(eventPosition.x, eventPosition.y, left.x, left.y)
      < Phaser.Math.Distance.Between(eventPosition.x, eventPosition.y, right.x, right.y) ? -43 : 43;
    [18, 0, -18].forEach((localY, index) => {
      this.time.delayedCall(index * 78, () => {
        if (!this.shipRig?.active) return;
        this.spawnMuzzle(this.worldFromShip(side, localY), color, 8 - index * .6);
      });
    });
    this.game.canvas.dataset.broadsideVolley = '3-shell-stagger';
  }


  private spawnImpact(position: Vector2, color: number, destroyed: boolean): void {
    // Keep the whole hit effect anchored to the target. The previous sparks
    // travelled away from the contact and read like ricocheting projectiles.
    const impact = this.add.container(position.x, position.y).setDepth(12).setScale(0.68);
    const burst = this.add.graphics();
    burst.fillStyle(color, 0.58); burst.fillCircle(0, 0, destroyed ? 32 : 19);
    burst.fillStyle(0xfff1cb, 0.96); burst.fillCircle(0, 0, destroyed ? 13 : 7);
    burst.lineStyle(destroyed ? 3 : 2, color, 0.88);
    burst.strokeCircle(0, 0, destroyed ? 44 : 27);
    const count = destroyed ? 16 : 9;
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2 + Math.PI / 8;
      const inner = destroyed ? 28 : 17;
      const outer = inner + (index % 3 === 0 ? 16 : 9);
      burst.lineStyle(index % 2 ? 2 : 1, index % 2 ? 0xffd58b : color, 0.86);
      burst.lineBetween(Math.cos(angle) * inner, Math.sin(angle) * inner, Math.cos(angle) * outer, Math.sin(angle) * outer);
    }
    impact.add(burst);
    this.tweens.add({
      targets: impact,
      alpha: 0,
      scale: destroyed ? 1.65 : 1.22,
      duration: destroyed ? 500 : 240,
      ease: 'Quad.Out',
      onComplete: () => impact.destroy(),
    });
  }

  private spawnContactFlash(position: Vector2, color: number): void {
    const contact = this.add.container(position.x, position.y).setDepth(12).setScale(0.7);
    const core = this.add.circle(0, 0, 5, 0xfff1cb, 0.96);
    const ring = this.add.graphics();
    ring.lineStyle(2, color, 0.82); ring.strokeCircle(0, 0, 10);
    contact.add([ring, core]);
    this.tweens.add({
      targets: contact,
      alpha: 0,
      scale: 1.45,
      duration: 125,
      ease: 'Quad.Out',
      onComplete: () => contact.destroy(),
    });
  }

  private showDummyRespawn(position: Vector2): void {
    const beacon = this.add.container(position.x, position.y).setDepth(10);
    const art = this.add.graphics();
    art.lineStyle(2, 0x88e9f2, 0.92); art.strokeRect(-18, -18, 36, 36);
    art.lineStyle(1, 0xf6e6b8, 0.9); art.strokeRect(-32, -32, 64, 64);
    beacon.add(art);
    this.tweens.add({ targets: beacon, alpha: 0, scale: 2.2, duration: 560, ease: 'Cubic.Out', onComplete: () => beacon.destroy() });
  }

  private showScanPulse(): void {
    const expedition = getExpedition();
    if (!expedition) return;
    const pulse = this.add.container(expedition.position.x, expedition.position.y).setDepth(8);
    const art = this.add.graphics();
    art.lineStyle(2, 0x71dbe4, 0.82); art.strokeRect(-28, -28, 56, 56);
    art.lineStyle(1, 0xe2f7f4, 0.66); art.strokeRect(-16, -16, 32, 32);
    pulse.add(art);
    this.tweens.add({
      targets: pulse,
      scale: expedition.scanRadius / 28,
      alpha: 0,
      duration: 580,
      ease: 'Cubic.Out',
      onComplete: () => pulse.destroy(),
    });
    const rangeReadout = this.add.text(this.scale.width * .5, 108, `SCANBEREICH · ${expedition.scanRadius}u`, {
      fontFamily: 'Arial', fontSize: 9, color: '#a8f0f5', fontStyle: 'bold', letterSpacing: 0.65,
    }).setOrigin(.5).setDepth(21).setScrollFactor(0).setAlpha(.1);
    this.tweens.add({ targets: rangeReadout, alpha: { from: .1, to: 1 }, y: 98, duration: 190, yoyo: true, hold: 780, ease: 'Sine.Out', onComplete: () => rangeReadout.destroy() });
  }

  private showMining(target: Vector2): void {
    if (!this.shipRig) return;
    const beam = this.add.graphics().setDepth(9);
    const spark = () => {
      beam.clear();
      const from = this.shipRig!;
      beam.lineStyle(3, 0xf6bb54, 0.94);
      beam.lineBetween(from.x - 18, from.y - 31, target.x - 8, target.y);
      beam.lineBetween(from.x + 18, from.y - 31, target.x + 8, target.y);
      beam.fillStyle(0xffdd94, 0.9);
      for (let index = 0; index < 8; index += 1) beam.fillCircle(target.x + (index % 4 - 1.5) * 9, target.y + (Math.floor(index / 4) - 0.5) * 12, 2 + index % 2);
      const shard = this.add.circle(target.x + 4, target.y - 4, 4, 0xd9c6aa, 0.95).setDepth(10);
      this.tweens.add({ targets: shard, x: from.x, y: from.y, scale: 0.2, alpha: 0, duration: 430, ease: 'Quad.In', onComplete: () => shard.destroy() });
    };
    spark();
    this.time.addEvent({ delay: 130, repeat: 5, callback: spark });
    this.time.delayedCall(870, () => beam.destroy());
  }

  private showSignalAction(action: { kind: SignalKind; position: Vector2 }): void {
    if (!this.shipRig) return;
    const upgrades = getProfile().ship?.upgrades ?? [];
    if (action.kind === 'wreck' && upgrades.includes('salvage-claws')) {
      const tether = this.add.graphics().setDepth(9);
      tether.lineStyle(3, 0xe3b36b, 0.9);
      tether.lineBetween(this.shipRig.x - 28, this.shipRig.y + 4, action.position.x - 8, action.position.y);
      tether.lineBetween(this.shipRig.x + 28, this.shipRig.y + 4, action.position.x + 8, action.position.y);
      tether.fillStyle(0xffdc8c, 0.85); tether.fillCircle(action.position.x, action.position.y, 13);
      this.time.delayedCall(520, () => tether.destroy());
    }
    if (action.kind === 'anomaly' && upgrades.includes('relic-shrine')) {
      const rite = this.add.graphics().setDepth(9);
      rite.lineStyle(2, 0xd4a4ff, 0.9);
      rite.strokeCircle(this.shipRig.x, this.shipRig.y, 47);
      rite.strokeCircle(action.position.x, action.position.y, 28);
      rite.lineStyle(1, 0xf0d6ff, 0.72); rite.lineBetween(this.shipRig.x, this.shipRig.y, action.position.x, action.position.y);
      this.tweens.add({ targets: rite, alpha: 0, duration: 750, ease: 'Quad.Out', onComplete: () => rite.destroy() });
    }
  }

  private showResourceCollected(event: ResourceCollectedEvent): void {
    if (!this.shipRig) return;
    const resource = RESOURCE_PRESENTATION[event.kind];
    const token = this.add.container(event.position.x, event.position.y).setDepth(14);
    const halo = this.add.circle(0, 0, 24, Phaser.Display.Color.HexStringToColor(resource.color).color, 0.24);
    const icon = this.add.image(0, 0, resource.textureKey).setDisplaySize(24, 24);
    const amount = this.add.text(0, 27, `+${event.amount} ${resource.name.toUpperCase()}`, { fontFamily: 'Arial', fontSize: 8, color: resource.color, fontStyle: 'bold' }).setOrigin(0.5);
    token.add([halo, icon, amount]);
    this.tweens.add({
      targets: token,
      x: this.shipRig.x,
      y: this.shipRig.y,
      scale: 0.55,
      alpha: 0,
      duration: 620,
      ease: 'Cubic.In',
      onComplete: () => token.destroy(),
    });
  }

  private addShipUpgradeArt(upgrades: readonly ShipUpgradeId[]): void {
    if (!this.shipRig) return;
    for (const upgrade of upgrades) {
      const moduleArt = getProfile().ship ? MODULE_ART_BY_HULL[getProfile().ship!.variant][upgrade] : undefined;
      if (moduleArt) {
        const layer = this.add.image(0, 0, moduleArt).setName(`ship-upgrade-${upgrade}`).setDisplaySize(96, 144);
        if (upgrade === 'vector-tail') this.shipRig.addAt(layer, 0); else this.shipRig.add(layer);
        continue;
      }
      const art = this.add.graphics().setName(`ship-upgrade-${upgrade}`);
      if (upgrade === 'broadband-array') {
        art.lineStyle(3, 0x7ee8f3, 0.95);
        art.lineBetween(-22, -42, -38, -63); art.lineBetween(22, -42, 38, -63);
        art.fillStyle(0x9cf5ff, 0.9); art.fillCircle(-38, -63, 4); art.fillCircle(38, -63, 4);
      } else if (upgrade === 'cargo-spine') {
        art.fillStyle(0x9d663b, 0.96); art.fillRoundedRect(-22, 13, 44, 34, 5);
        art.lineStyle(2, 0xf0c078, 0.9); art.strokeRoundedRect(-22, 13, 44, 34, 5);
      } else if (upgrade === 'vector-tail') {
        art.fillStyle(0x9b6fe0, 0.86); art.fillCircle(-27, 54, 9); art.fillCircle(27, 54, 9);
        art.fillStyle(0xd0a6ff, 0.84); art.fillTriangle(-33, 58, -21, 58, -27, 76); art.fillTriangle(21, 58, 33, 58, 27, 76);
      } else if (upgrade === 'aegis-crown') {
        art.lineStyle(3, 0x77dbe9, 0.78); art.strokeCircle(0, 0, 58);
      } else if (upgrade === 'rail-lance') {
        art.lineStyle(5, 0xf1d08a, 0.96); art.lineBetween(0, -42, 0, -92);
        art.fillStyle(0xffefbd, 0.9); art.fillCircle(0, -92, 3);
      } else if (upgrade === 'side-turrets') {
        art.fillStyle(0xbf5e58, 0.95); art.fillCircle(-53, -4, 11); art.fillCircle(53, -4, 11);
        art.lineStyle(3, 0xffaa88, 0.95); art.lineBetween(-53, -4, -69, -18); art.lineBetween(53, -4, 69, -18);
      } else if (upgrade === 'salvage-claws') {
        art.lineStyle(5, 0xe1b267, 0.95);
        art.lineBetween(-38, 8, -67, 28); art.lineBetween(-67, 28, -77, 18);
        art.lineBetween(38, 8, 67, 28); art.lineBetween(67, 28, 77, 18);
      } else if (upgrade === 'mining-lasers') {
        art.lineStyle(4, 0xf0bf6d, 0.95); art.lineBetween(-28, -28, -58, -47); art.lineBetween(28, -28, 58, -47);
        art.fillStyle(0xffd88b, 0.95); art.fillCircle(-58, -47, 4); art.fillCircle(58, -47, 4);
      } else if (upgrade === 'relic-shrine') {
        art.fillStyle(0xb193dd, 0.95); art.fillTriangle(0, -51, -12, -26, 12, -26);
        art.lineStyle(2, 0xf0dafb, 0.8); art.strokeTriangle(0, -51, -12, -26, 12, -26);
      } else if (upgrade === 'core-reactor') {
        art.fillStyle(0x9d55d9, 0.88); art.fillCircle(0, 6, 16);
        art.lineStyle(2, 0xebc7ff, 0.9); art.strokeCircle(0, 6, 20);
      }
      this.shipRig.add(art);
    }
  }

  private addTorpedoRackArt(): void {
    if (!this.shipRig) return;
    const rack = this.add.graphics().setName('ship-upgrade-torpedo-rack');
    [-38, 38].forEach((x) => {
      rack.fillStyle(0x172531, 0.98); rack.fillRoundedRect(x - 10, 7, 20, 36, 6);
      rack.lineStyle(2, 0xc99a55, 0.94); rack.strokeRoundedRect(x - 10, 7, 20, 36, 6);
      rack.fillStyle(0x5d6c72, 1); rack.fillRoundedRect(x - 6, 11, 12, 18, 5);
      rack.fillStyle(0x97edf4, 0.95); rack.fillCircle(x, 33, 3);
      rack.lineStyle(1, 0x72dce9, 0.72); rack.lineBetween(x - 7, 37, x + 7, 37);
    });
    this.shipRig.add(rack);
  }
}
