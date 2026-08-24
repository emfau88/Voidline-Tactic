import Phaser from 'phaser';
import { getExpedition, getProfile, getSelectedTargetId, tickExpedition } from '../../app/gameFlow';
import { WORMHOLE_POSITION } from '../../domain/exploration/expeditionEngine';
import type { ExpeditionState, SignalKind, Vector2, WeaponMode } from '../../domain/exploration/types';
import { SHIP_VARIANTS, type ShipUpgradeId } from '../../domain/ship/types';

const ASTER_MODULE_ART: Partial<Record<ShipUpgradeId, string>> = {
  'broadband-array': 'aster-module-broadband-array-v1',
  'cargo-spine': 'aster-module-cargo-spine-v1',
  'vector-tail': 'aster-module-vector-tail-v1',
  'salvage-claws': 'aster-module-salvage-claws-v2',
  'mining-lasers': 'aster-module-mining-lasers-v2',
  'rail-lance': 'aster-module-rail-lance-v1',
  'relic-shrine': 'aster-module-relic-shrine-v1',
  'side-turrets': 'aster-module-side-turrets-v1',
};

const DEFAULT_EXPEDITION_ZOOM = 1.1;
const MIN_EXPEDITION_ZOOM = 0.82;
const MAX_EXPEDITION_ZOOM = 1.7;

interface WeaponFireEvent {
  readonly weapon: WeaponMode;
  readonly target: {
    readonly id: string;
    readonly name: string;
    readonly position: Vector2;
    readonly destroyed: boolean;
  };
}

export class ExpeditionScene extends Phaser.Scene {
  private ship?: Phaser.GameObjects.Image;
  private shipRig?: Phaser.GameObjects.Container;
  private playerLabel?: Phaser.GameObjects.Text;
  private homeLabel?: Phaser.GameObjects.Text;
  private engineFlame?: Phaser.GameObjects.Graphics;
  private signalLayer?: Phaser.GameObjects.Container;
  private knownHostileIds = new Set<string>();
  private contactsInitialized = false;
  private expeditionZoom = DEFAULT_EXPEDITION_ZOOM;
  private readonly touchPointers = new Map<number, { x: number; y: number }>();
  private pinchStartDistance = 0;
  private pinchStartZoom = DEFAULT_EXPEDITION_ZOOM;
  private removePinchListeners?: () => void;

  public constructor() { super('expedition'); }

  public create(): void {
    const expedition = getExpedition();
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
      const home = this.add.graphics();
      home.fillStyle(0x111d29, 0.92); home.fillRoundedRect(2_068, 1_478, 64, 44, 9);
      home.lineStyle(2, 0xe0b567, 0.92); home.strokeRoundedRect(2_068, 1_478, 64, 44, 9);
      home.lineStyle(2, 0x94e2ef, 0.8); home.lineBetween(2_078, 1_500, 2_122, 1_500); home.lineBetween(2_100, 1_486, 2_100, 1_514);
      this.homeLabel = this.add.text(2_100, 1_540, 'FARHAVEN · DOCK', { fontFamily: 'Arial', fontSize: 9, color: '#ebcf91', fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(2);
      this.addWormholeGate();
    } else {
      const riftTag = this.add.text(2_100, 1_410, 'VELORIA RIFT · KARTENSONDE 01', { fontFamily: 'Arial', fontSize: 10, color: '#d4b8fa', fontStyle: 'bold', letterSpacing: 1.2 }).setOrigin(0.5).setDepth(2);
      this.tweens.add({ targets: riftTag, alpha: { from: 0.56, to: 0.95 }, duration: 1_900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
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
    this.events.on('wake', () => this.refresh());
    this.game.events.on('farhaven:weapon-fired', this.showWeaponFire, this);
    this.game.events.on('farhaven:mining-start', this.showMining, this);
    this.game.events.on('farhaven:signal-action', this.showSignalAction, this);
    this.game.events.on('farhaven:scan-pulse', this.showScanPulse, this);
    this.input.on('pointerdown', this.selectHostileAtPointer, this);
    this.bindPinchZoom();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('farhaven:weapon-fired', this.showWeaponFire, this);
      this.game.events.off('farhaven:mining-start', this.showMining, this);
      this.game.events.off('farhaven:signal-action', this.showSignalAction, this);
      this.game.events.off('farhaven:scan-pulse', this.showScanPulse, this);
      this.input.off('pointerdown', this.selectHostileAtPointer, this);
      this.removePinchListeners?.();
    });
    this.refresh();
  }

  private addWormholeGate(): void {
    const x = WORMHOLE_POSITION.x;
    const y = WORMHOLE_POSITION.y;
    const glow = this.add.image(x, y, 'wormhole-gate-v3').setDisplaySize(254, 254).setAlpha(0.24).setBlendMode(Phaser.BlendModes.ADD).setDepth(2);
    const gate = this.add.image(x, y, 'wormhole-gate-v3').setDisplaySize(236, 236).setDepth(3).setInteractive({ useHandCursor: true });
    const portalMaskSource = this.make.graphics({ x: 0, y: 0 });
    portalMaskSource.fillStyle(0xffffff); portalMaskSource.fillCircle(x, y, 119);
    const portalMask = portalMaskSource.createGeometryMask();
    glow.setMask(portalMask);
    gate.setMask(portalMask);
    gate.on('pointerdown', () => this.game.events.emit('farhaven:wormhole-selected'));
    this.tweens.add({ targets: glow, angle: 360, duration: 12_000, repeat: -1, ease: 'Linear' });
    this.tweens.add({ targets: gate, scaleX: gate.scaleX * 1.035, scaleY: gate.scaleY * 1.035, duration: 1_650, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: glow, scaleX: glow.scaleX * 1.06, scaleY: glow.scaleY * 1.06, duration: 1_650, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const frame = this.add.graphics().setDepth(4);
    this.drawCornerFrame(frame, WORMHOLE_POSITION, 137, 19, 0xb881f4, 0.9);
    const labelBack = this.add.graphics().setDepth(4);
    labelBack.fillStyle(0x0c101d, 0.88); labelBack.fillRoundedRect(x - 74, y + 136, 148, 32, 8);
    labelBack.lineStyle(1, 0xa879e4, 0.78); labelBack.strokeRoundedRect(x - 74, y + 136, 148, 32, 8);
    this.add.text(x, y + 141, 'XENOGATE · VELORIA', { fontFamily: 'Arial', fontSize: 9, color: '#eee0ff', fontStyle: 'bold', letterSpacing: 0.65 }).setOrigin(0.5, 0).setDepth(5);
    this.add.text(x, y + 153, 'TIPPE FÜR KURS · AM TOR DURCHQUEREN', { fontFamily: 'Arial', fontSize: 6, color: '#b9d9dc', letterSpacing: 0.25 }).setOrigin(0.5, 0).setDepth(5);
  }

  public update(_time: number, delta: number): void {
    tickExpedition(delta);
    this.refresh();
  }

  private refresh(): void {
    const expedition = getExpedition();
    if (!expedition || !this.shipRig || !this.signalLayer || !this.playerLabel || !this.engineFlame) return;
    const engineFlame = this.engineFlame;
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
    this.renderSignals(expedition);
  }

  private renderSignals(expedition: ExpeditionState): void {
    this.signalLayer?.removeAll(true);
    for (const signal of expedition.signals) {
      if (signal.knowledge === 'resolved') continue;
      if (signal.knowledge === 'echo') this.addFaintEcho(signal.position);
      else this.addSignalMarker(signal);
    }
    for (const hostile of expedition.hostiles) {
      const selected = getSelectedTargetId() === hostile.id;
      const hostileArt = this.add.image(hostile.position.x, hostile.position.y, hostile.kind === 'raider' ? 'ship-enemy-destroyer-v1' : 'ship-enemy-patrol-v1');
      const hostileHeight = hostile.kind === 'raider' ? 118 : 96;
      hostileArt.setDisplaySize(hostileArt.width / hostileArt.height * hostileHeight, hostileHeight)
        .setRotation(hostile.heading);
      if (!this.contactsInitialized || !this.knownHostileIds.has(hostile.id)) {
        if (this.contactsInitialized) this.showDummyRespawn(hostile.position);
      }
      if (selected) {
        const bracket = this.add.graphics();
        bracket.lineStyle(2, 0xffd98e, 0.94);
        const radius = hostile.kind === 'raider' ? 56 : 50;
        this.drawCornerFrame(bracket, hostile.position, radius, 13, 0xffd98e, 0.94);
        bracket.lineStyle(1, 0xf8f0ca, 0.72);
        bracket.strokeRect(hostile.position.x - radius + 7, hostile.position.y - radius + 7, (radius - 7) * 2, (radius - 7) * 2);
        this.signalLayer?.add(bracket);
      }
      if (!hostile.passive && hostile.status === 'alert') {
        const warning = this.add.graphics();
        warning.lineStyle(2, 0xf1796c, 0.78); warning.strokeCircle(hostile.position.x, hostile.position.y, hostile.kind === 'raider' ? 71 : 58);
        warning.lineStyle(1, 0xffd3b5, 0.46); warning.strokeCircle(hostile.position.x, hostile.position.y, hostile.kind === 'raider' ? 82 : 69);
        this.signalLayer?.add(warning);
      }
      const state = hostile.passive
        ? selected ? 'ZIEL MARKIERT · KEINE GEGENWEHR' : 'TIPPE ZUM ZIELEN · KEINE GEGENWEHR'
        : hostile.status === 'alert' ? 'ALARM' : 'PATROUILLE';
      const label = this.add.text(hostile.position.x, hostile.position.y + 62, `${hostile.name.toUpperCase()} · ${hostile.hull}/${hostile.maxHull}\n${state}`, { fontFamily: 'Arial', fontSize: 10, color: selected ? '#ffe1a3' : hostile.passive ? '#bfeef4' : '#ffc1c7', align: 'center', lineSpacing: 2 }).setOrigin(0.5);
      this.signalLayer?.add(hostileArt);
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
    if (!nearest) return;
    const hitRadius = nearest.hostile.kind === 'raider' ? 94 : 82;
    if (nearest.distance <= hitRadius) this.game.events.emit('farhaven:target-selected', nearest.hostile.id);
  }

  private setExpeditionZoom(zoom: number): void {
    this.expeditionZoom = Phaser.Math.Clamp(zoom, MIN_EXPEDITION_ZOOM, MAX_EXPEDITION_ZOOM);
    this.cameras.main.setZoom(this.expeditionZoom);
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
    canvas.addEventListener('pointerdown', down, { passive: true });
    canvas.addEventListener('pointermove', move, { passive: false });
    canvas.addEventListener('pointerup', up, { passive: true });
    canvas.addEventListener('pointercancel', up, { passive: true });
    this.removePinchListeners = () => {
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
    const guarded = Boolean(signal.guardedBy);
    const color = guarded ? 0xef7869 : signal.kind === 'anomaly' ? 0xca84ec : signal.kind === 'distress' ? 0xf0bd74 : signal.kind === 'vein' ? 0xdfa85b : 0x71dbe4;
    const action = guarded ? 'BEUTE GESCHÜTZT' : signal.kind === 'wreck' ? 'BERGEN' : signal.kind === 'vein' ? 'ABBAU' : signal.kind === 'anomaly' ? 'DEUTEN' : 'ANTWORTEN';
    const marker = this.add.container(signal.position.x, signal.position.y).setSize(120, 120).setInteractive({ useHandCursor: true });
    const art = this.add.graphics();
    art.fillStyle(0x07121c, 0.9); art.fillRoundedRect(-26, -30, 52, 52, 9);
    art.lineStyle(2, color, 0.94); art.strokeRoundedRect(-26, -30, 52, 52, 9);
    this.drawCornerFrame(art, { x: 0, y: -4 }, 33, 10, color, 0.76);
    if (signal.kind === 'wreck') {
      art.fillStyle(color, 0.82); art.fillTriangle(-12, -14, 0, -24, 5, -8); art.fillTriangle(-3, 2, 13, -12, 16, 10);
      art.lineStyle(2, 0xdaf6f7, 0.86); art.lineBetween(-15, 8, -4, -1); art.lineBetween(-4, -1, 6, 9);
    } else if (signal.kind === 'vein') {
      art.fillStyle(color, 0.88); art.fillTriangle(-14, 11, -8, -19, -1, 11); art.fillTriangle(-2, 11, 5, -25, 14, 11);
      art.lineStyle(1, 0xffe2a1, 0.9); art.lineBetween(-17, 14, 17, 14);
    } else if (signal.kind === 'anomaly') {
      art.lineStyle(3, color, 0.96); art.strokeTriangle(0, -24, 16, -4, 0, 16); art.strokeTriangle(0, -16, -16, 4, 0, 24);
      art.fillStyle(0xf0d0ff, 0.85); art.fillRect(-2, -4, 4, 8);
    } else {
      art.fillStyle(color, 0.92); art.fillTriangle(0, -24, -11, 10, 11, 10);
      art.lineStyle(2, 0xffecbc, 0.94); art.lineBetween(-16, 15, 16, 15); art.lineBetween(-10, 21, 10, 21);
    }
    const labelBack = this.add.graphics();
    labelBack.fillStyle(0x07131d, 0.88); labelBack.fillRoundedRect(-60, 30, 120, 40, 7);
    labelBack.lineStyle(1, color, 0.62); labelBack.strokeRoundedRect(-60, 30, 120, 40, 7);
    const label = this.add.text(0, 34, signal.name.toUpperCase(), { fontFamily: 'Arial', fontSize: 9, color: '#e6f4f3', align: 'center', fontStyle: 'bold', wordWrap: { width: 112 } }).setOrigin(0.5, 0);
    const actionLabel = this.add.text(0, 59, `⌁ ${action} · TIPPE FÜR KURS`, { fontFamily: 'Arial', fontSize: 6, color: '#b9d9dc', align: 'center', letterSpacing: 0.3 }).setOrigin(0.5, 0);
    marker.add([art, labelBack, label, actionLabel]);
    marker.on('pointerdown', () => this.game.events.emit('farhaven:signal-selected', signal.id));
    this.signalLayer?.add(marker);
  }

  private drawCornerFrame(graphics: Phaser.GameObjects.Graphics, center: Vector2, radius: number, arm: number, color: number, alpha: number): void {
    graphics.lineStyle(2, color, alpha);
    const left = center.x - radius; const right = center.x + radius; const top = center.y - radius; const bottom = center.y + radius;
    graphics.lineBetween(left, top + arm, left, top); graphics.lineBetween(left, top, left + arm, top);
    graphics.lineBetween(right - arm, top, right, top); graphics.lineBetween(right, top, right, top + arm);
    graphics.lineBetween(left, bottom - arm, left, bottom); graphics.lineBetween(left, bottom, left + arm, bottom);
    graphics.lineBetween(right - arm, bottom, right, bottom); graphics.lineBetween(right, bottom - arm, right, bottom);
  }

  private showWeaponFire(event: WeaponFireEvent): void {
    if (!this.shipRig) return;
    const target = event.target.position;
    if (event.weapon === 'broadside') {
      const forward = { x: Math.cos(this.shipRig.rotation - Math.PI / 2), y: Math.sin(this.shipRig.rotation - Math.PI / 2) };
      const toTarget = { x: target.x - this.shipRig.x, y: target.y - this.shipRig.y };
      const side = forward.x * toTarget.y - forward.y * toTarget.x > 0 ? 1 : -1;
      [-15, 0, 15].forEach((offset, index) => this.time.delayedCall(index * 68, () => {
        const muzzle = this.worldFromShip(side * 43, offset);
        this.spawnMuzzle(muzzle, 0xffb26f, 9);
        this.launchBolt(muzzle, target, 0xffb26f, 255, 4, index === 2, event.target.destroyed);
      }));
      return;
    }
    if (event.weapon === 'rail') {
      const muzzle = this.worldFromShip(0, -70);
      this.spawnCharge(muzzle, 0x8eeeff);
      this.time.delayedCall(155, () => this.launchBolt(muzzle, target, 0x8eeeff, 330, 8, true, event.target.destroyed));
      return;
    }
    if (event.weapon === 'torpedo') {
      const muzzle = this.worldFromShip(0, -47);
      this.launchTorpedo(muzzle, target, event.target.destroyed);
      return;
    }
    const muzzle = this.worldFromShip(0, -26);
    this.launchOrb(muzzle, target, event.target.destroyed);
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

  private spawnCharge(position: Vector2, color: number): void {
    const charge = this.add.graphics().setDepth(11);
    charge.lineStyle(3, color, 0.9); charge.strokeCircle(position.x, position.y, 12);
    charge.lineStyle(1, 0xf9f6d3, 0.92); charge.strokeCircle(position.x, position.y, 5);
    this.tweens.add({ targets: charge, scale: 2.1, alpha: 0, duration: 150, ease: 'Cubic.In', onComplete: () => charge.destroy() });
  }

  private launchBolt(from: Vector2, to: Vector2, color: number, duration: number, radius: number, impact: boolean, destroyed: boolean): void {
    const core = this.add.circle(from.x, from.y, radius, 0xfbf4d5, 1).setDepth(12);
    const glow = this.add.circle(from.x, from.y, radius * 2.8, color, 0.36).setDepth(11);
    const trail = this.add.graphics().setDepth(10);
    this.tweens.add({
      targets: [core, glow], x: to.x, y: to.y, duration, ease: 'Quad.In',
      onUpdate: () => {
        const dx = to.x - core.x;
        const dy = to.y - core.y;
        trail.clear(); trail.lineStyle(radius * 0.82, color, 0.68); trail.lineBetween(core.x, core.y, core.x - dx * 0.16, core.y - dy * 0.16);
      },
      onComplete: () => { trail.destroy(); core.destroy(); glow.destroy(); if (impact) this.spawnImpact(to, color, destroyed); },
    });
  }

  private launchTorpedo(from: Vector2, to: Vector2, destroyed: boolean): void {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const body = this.add.triangle(from.x, from.y, 0, -9, 7, 9, -7, 9, 0xe4ece8, 0.98).setDepth(12).setRotation(angle + Math.PI / 2);
    const ember = this.add.circle(from.x, from.y + 9, 7, 0xf19a61, 0.76).setDepth(11);
    const trail = this.add.graphics().setDepth(10);
    this.spawnMuzzle(from, 0x72dce9, 11);
    this.tweens.add({
      targets: [body, ember], x: to.x, y: to.y, duration: 560, ease: 'Cubic.InOut',
      onUpdate: () => { trail.clear(); trail.lineStyle(5, 0x72dce9, 0.52); trail.lineBetween(body.x, body.y, body.x - Math.cos(angle) * 52, body.y - Math.sin(angle) * 52); ember.setPosition(body.x - Math.cos(angle) * 11, body.y - Math.sin(angle) * 11); },
      onComplete: () => { trail.destroy(); body.destroy(); ember.destroy(); this.spawnImpact(to, 0x72dce9, destroyed); },
    });
  }

  private launchOrb(from: Vector2, to: Vector2, destroyed: boolean): void {
    const orb = this.add.circle(from.x, from.y, 11, 0xd8b0ff, 0.96).setDepth(12);
    const halo = this.add.circle(from.x, from.y, 26, 0x8557d8, 0.36).setDepth(11);
    const rings = this.add.graphics().setDepth(10);
    this.tweens.add({
      targets: [orb, halo], x: to.x, y: to.y, duration: 480, ease: 'Sine.InOut',
      onUpdate: () => { rings.clear(); rings.lineStyle(2, 0xeccfff, 0.66); rings.strokeCircle(orb.x, orb.y, 16); rings.lineStyle(1, 0x9a63e8, 0.7); rings.strokeCircle(orb.x, orb.y, 25); },
      onComplete: () => { rings.destroy(); orb.destroy(); halo.destroy(); this.spawnImpact(to, 0xd8b0ff, destroyed); },
    });
  }

  private spawnImpact(position: Vector2, color: number, destroyed: boolean): void {
    const burst = this.add.graphics().setDepth(12);
    burst.fillStyle(color, 0.72); burst.fillCircle(position.x, position.y, destroyed ? 34 : 20);
    burst.fillStyle(0xfff1cb, 0.94); burst.fillCircle(position.x, position.y, destroyed ? 15 : 8);
    burst.lineStyle(2, color, 0.9);
    const count = destroyed ? 16 : 9;
    for (let index = 0; index < count; index += 1) {
      const angle = index / count * Math.PI * 2 + Math.PI / 8;
      const spark = this.add.circle(position.x, position.y, destroyed ? 3 : 2, index % 2 ? 0xffd58b : color, 0.95).setDepth(13);
      this.tweens.add({ targets: spark, x: position.x + Math.cos(angle) * (destroyed ? 78 : 38), y: position.y + Math.sin(angle) * (destroyed ? 78 : 38), alpha: 0, scale: 0.2, duration: destroyed ? 620 : 340, ease: 'Cubic.Out', onComplete: () => spark.destroy() });
    }
    this.tweens.add({ targets: burst, alpha: 0, scale: destroyed ? 1.8 : 1.35, duration: destroyed ? 510 : 260, ease: 'Quad.Out', onComplete: () => burst.destroy() });
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

  private addShipUpgradeArt(upgrades: readonly ShipUpgradeId[]): void {
    if (!this.shipRig) return;
    for (const upgrade of upgrades) {
      if (upgrade === 'torpedo-rack') {
        this.addTorpedoRackArt();
        continue;
      }
      const asterArt = getProfile().ship?.variant === 'aster-vale' ? ASTER_MODULE_ART[upgrade] : undefined;
      if (asterArt) {
        const layer = this.add.image(0, 0, asterArt).setDisplaySize(96, 144);
        if (upgrade === 'vector-tail') this.shipRig.addAt(layer, 0); else this.shipRig.add(layer);
        continue;
      }
      const art = this.add.graphics();
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
    const rack = this.add.graphics();
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
