import Phaser from 'phaser';
import { getCampaignState } from '../../app/campaign';
import { RENDER_DENSITY } from '../../app/display';
import { getStarterModuleId, getStarterShipId } from '../../app/starterSelection';
import { activateAbility, getAbilityPreview } from '../../domain/combat/combatEngine';
import { BATTLEFIELD_HEIGHT, BATTLEFIELD_WIDTH, FIXED_STEP_MS } from '../../domain/combat/constants';
import { distance } from '../../domain/combat/math';
import type { CombatEvent, ManualAbility, ShipState, TimeScale, Vector2 } from '../../domain/combat/types';
import { createFleetBattleState, stepFleetBattle } from '../../domain/fleet/fleetBattle';
import { assignFleetLane, deployFleetShip, setFleetFocus, setFleetStance } from '../../domain/fleet/fleetCommands';
import type { DeployKind, FleetBattleState, FleetCommandResult, FleetEvent, FleetStance, LaneId } from '../../domain/fleet/types';
import { FleetCommandHud, type FleetHudAction } from '../../ui/FleetCommandHud';
import { StrategicCameraController } from '../controllers/StrategicCameraController';
import { FleetLaneView } from '../presentation/FleetLaneView';
import { ShipView } from '../presentation/ShipView';
import { weaponOrigins } from '../presentation/shipPresentation';

type RuntimeEvent = CombatEvent | FleetEvent;

const DEFAULT_CAMERA_ZOOM = 1.08;
const CAMERA_OVERSCAN = 180;

export class FleetCombatScene extends Phaser.Scene {
  private state!: FleetBattleState;
  private selectedShipId = 'p-cruiser';
  private commandLane: LaneId = 'center';
  private timeScale: TimeScale = 1;
  private accumulatorMs = 0;
  private hudRefreshMs = 0;
  private baseCameraZoom = 0.35;
  private cameraZoomFactor = DEFAULT_CAMERA_ZOOM;
  private hud!: FleetCommandHud;
  private overlay!: Phaser.GameObjects.Graphics;
  private laneView!: FleetLaneView;
  private cameraController!: StrategicCameraController;
  private readonly shipViews = new Map<string, ShipView>();
  private readonly projectileViews = new Map<string, Phaser.GameObjects.Container>();
  private readonly touchPointers = new Map<number, { x: number; y: number }>();
  private pinchStartDistance = 0;
  private pinchStartZoom = DEFAULT_CAMERA_ZOOM;
  private lastGestureMidpoint?: { x: number; y: number };
  private gestureActive = false;
  private resultShown = false;
  private removePinchListeners?: () => void;
  private resizeObserver?: ResizeObserver;

  public constructor() { super('combat'); }

  public create(): void {
    this.cameras.main.setBackgroundColor('#040810');
    this.createBattlefield();
    this.state = createFleetBattleState(getStarterShipId(), getCampaignState().upgrades, getStarterModuleId());
    this.selectedShipId = this.state.fleet.commandShipIds.player;
    this.laneView = new FleetLaneView(this, this.state);
    this.overlay = this.add.graphics().setDepth(13);
    this.cameras.main.setBounds(-CAMERA_OVERSCAN, -CAMERA_OVERSCAN, BATTLEFIELD_WIDTH + CAMERA_OVERSCAN * 2, BATTLEFIELD_HEIGHT + CAMERA_OVERSCAN * 2);
    this.cameraController = new StrategicCameraController(this, this.cameras.main);
    this.layoutCamera();
    this.syncPresentation();
    this.hud = new FleetCommandHud({
      onAction: (action) => this.handleAction(action),
      onStance: (stance) => this.applyGroupStance(stance),
      onCommandLane: (lane) => { this.commandLane = lane; this.refreshHud(); },
      onTransferSelected: () => this.applyFleetCommand(assignFleetLane(this.state, this.selectedShipId, this.commandLane)),
      onDeploy: (kind, lane) => this.deploy(kind, lane),
      onTimeScale: (scale) => this.setTimeScale(scale),
      onRestart: () => this.restartBattle(),
      onZoom: (direction) => this.applyCameraZoom(this.cameraZoomFactor + direction * 0.12),
      onZoomReset: () => this.resetCamera(),
      onFocusFleet: () => this.focusFleet(),
    });
    this.hud.setZoom(this.cameraZoomFactor);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.touchPointers.size < 2) this.cameraController.begin(pointer);
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.gestureActive) this.cameraController.move(pointer);
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dragged = this.cameraController.end(pointer);
      if (!dragged && !this.gestureActive) this.selectAt(pointer.worldX, pointer.worldY);
    });
    this.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => this.cameraController.end(pointer));
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _objects: unknown, _dx: number, dy: number) => {
      this.applyCameraZoom(this.cameraZoomFactor + (dy > 0 ? -0.12 : 0.12), { x: pointer.x, y: pointer.y });
    });
    this.bindPinchZoom();
    this.bindHiDpiResize();
    this.scale.on('resize', this.layoutCamera, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layoutCamera, this);
      this.removePinchListeners?.();
      this.resizeObserver?.disconnect();
    });
    this.refreshHud();
    this.hud.toast('SCHIFF WÄHLEN · Verhalten und Route befehlen · Karte frei wischen');
    const shell = document.getElementById('game-shell');
    shell?.setAttribute('aria-busy', 'false');
    if (shell) shell.dataset.gameReady = 'true';
  }

  public update(_time: number, delta: number): void {
    if (!this.state) return;
    const bounded = Math.min(delta, 100);
    if (this.state.status === 'active') {
      this.accumulatorMs += bounded * this.timeScale;
      while (this.accumulatorMs >= FIXED_STEP_MS) {
        const result = stepFleetBattle(this.state, FIXED_STEP_MS);
        this.state = result.state;
        this.handleEvents(result.events);
        this.accumulatorMs -= FIXED_STEP_MS;
      }
    }
    this.ensureSelection();
    this.syncPresentation();
    this.laneView.sync(this.state);
    this.drawOverlays();
    this.hudRefreshMs += bounded;
    if (this.hudRefreshMs > 90) { this.hudRefreshMs = 0; this.refreshHud(); }
  }

  private createBattlefield(): void {
    const background = this.add.image(BATTLEFIELD_WIDTH / 2, BATTLEFIELD_HEIGHT / 2, 'battlefield-nebula-v1')
      .setDisplaySize(BATTLEFIELD_WIDTH + CAMERA_OVERSCAN * 2, BATTLEFIELD_HEIGHT + CAMERA_OVERSCAN * 2)
      .setDepth(-30).setAlpha(0.92);
    this.add.rectangle(BATTLEFIELD_WIDTH / 2, BATTLEFIELD_HEIGHT / 2, BATTLEFIELD_WIDTH, BATTLEFIELD_HEIGHT, 0x123252, 0.12).setDepth(-29);
    const stars = this.add.graphics().setDepth(-20);
    for (let index = 0; index < 190; index += 1) {
      const x = (index * 347.13 + 71) % BATTLEFIELD_WIDTH;
      const y = (index * 211.73 + 113) % BATTLEFIELD_HEIGHT;
      stars.fillStyle(index % 13 === 0 ? 0xa8ddff : 0xffffff, index % 13 === 0 ? 0.56 : 0.24);
      stars.fillCircle(x, y, index % 17 === 0 ? 2.2 : 0.9);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.tweens.add({ targets: background, alpha: { from: 0.86, to: 0.96 }, duration: 9_000, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: stars, x: 7, y: 4, duration: 24_000, yoyo: true, repeat: -1 });
    }
  }

  private layoutCamera(): void {
    const width = this.scale.width || 844;
    const height = this.scale.height || 390;
    this.cameras.main.setViewport(0, 0, width, height);
    this.baseCameraZoom = Math.min(width / BATTLEFIELD_WIDTH, height / BATTLEFIELD_HEIGHT);
    this.cameras.main.setZoom(this.baseCameraZoom * this.cameraZoomFactor);
    if (this.state) this.cameras.main.centerOn(BATTLEFIELD_WIDTH / 2, BATTLEFIELD_HEIGHT / 2);
    this.hud?.setZoom(this.cameraZoomFactor);
  }

  private applyCameraZoom(factor: number, focus?: { x: number; y: number }): void {
    const camera = this.cameras.main;
    const next = Phaser.Math.Clamp(factor, 0.72, 2.7);
    const before = focus ? camera.getWorldPoint(focus.x, focus.y) : undefined;
    this.cameraZoomFactor = next;
    camera.setZoom(this.baseCameraZoom * next);
    if (focus && before) {
      const after = camera.getWorldPoint(focus.x, focus.y);
      camera.scrollX += before.x - after.x;
      camera.scrollY += before.y - after.y;
    }
    this.hud?.setZoom(next);
  }

  private resetCamera(): void {
    this.cameraZoomFactor = DEFAULT_CAMERA_ZOOM;
    this.cameras.main.setZoom(this.baseCameraZoom * DEFAULT_CAMERA_ZOOM);
    this.cameras.main.centerOn(BATTLEFIELD_WIDTH / 2, BATTLEFIELD_HEIGHT / 2);
    this.hud.setZoom(DEFAULT_CAMERA_ZOOM);
  }

  private focusFleet(): void { this.cameraController.focusFleet(Object.values(this.state.ships)); }

  private selectAt(x: number, y: number): void {
    const hitRadius = 62 / Math.max(0.25, this.cameras.main.zoom);
    const ships = Object.values(this.state.ships).filter((ship) => ship.alive && distance(ship.position, { x, y }) <= Math.max(hitRadius, ship.radius * 1.7));
    const friendly = ships.filter((ship) => ship.team === 'player').sort((a, b) => distance(a.position, { x, y }) - distance(b.position, { x, y }))[0];
    if (friendly) {
      this.selectedShipId = friendly.id;
      this.commandLane = this.state.fleet.directives[friendly.id].laneId;
      this.hud.toast(`${friendly.name.toUpperCase()} · BEFEHLSBEREIT`);
      this.refreshHud();
      return;
    }
    const enemy = ships.filter((ship) => ship.team === 'enemy').sort((a, b) => distance(a.position, { x, y }) - distance(b.position, { x, y }))[0];
    if (enemy) this.applyFleetCommand(setFleetFocus(this.state, this.selectedShipId, enemy.id));
  }

  private handleAction(action: FleetHudAction): void {
    if (action === 'target') {
      const selected = this.state.ships[this.selectedShipId];
      const enemies = Object.values(this.state.ships).filter((ship) => ship.alive && ship.team === 'enemy')
        .sort((a, b) => distance(selected.position, a.position) - distance(selected.position, b.position));
      const current = enemies.findIndex((ship) => ship.id === selected.targetId);
      const next = enemies[(current + 1) % enemies.length];
      if (next) this.applyFleetCommand(setFleetFocus(this.state, selected.id, next.id));
      return;
    }
    const selected = this.state.ships[this.selectedShipId];
    const result = activateAbility(this.state, selected.id, action);
    this.state = result.state as FleetBattleState;
    this.handleEvents(result.events);
    if (result.error) this.hud.toast(this.translateError(result.error));
    this.refreshHud();
  }

  private deploy(kind: DeployKind, lane: LaneId): void {
    const result = deployFleetShip(this.state, 'player', kind, lane);
    this.applyFleetCommand(result);
    if (!result.error) this.hud.toast(`${kind === 'frigate' ? 'FREGATTE' : 'ZERSTÖRER'} · ${lane.toUpperCase()} EINGESETZT`);
  }

  private applyGroupStance(stance: FleetStance): void {
    const group = Object.values(this.state.ships).filter((ship) =>
      ship.alive && ship.team === 'player' && this.state.fleet.directives[ship.id]?.laneId === this.commandLane,
    );
    if (group.length === 0) {
      this.hud.toast('Auf dieser Route befindet sich noch kein eigenes Schiff.');
      return;
    }
    for (const ship of group) {
      const result = setFleetStance(this.state, ship.id, stance);
      this.state = result.state;
      this.handleEvents(result.events);
    }
    this.hud.toast(`${group.length} SCHIFF${group.length === 1 ? '' : 'E'} · ROUTENBEFEHL ÜBERNOMMEN`);
    this.refreshHud();
  }

  private applyFleetCommand(result: FleetCommandResult): void {
    this.state = result.state;
    this.handleEvents(result.events);
    if (result.error) this.hud.toast(this.translateError(result.error));
    this.refreshHud();
  }

  private setTimeScale(scale: TimeScale): void {
    this.timeScale = scale;
    this.hud.toast(scale === 0 ? 'TAKTISCHE PAUSE · BEFEHLE VERFÜGBAR' : scale === 0.25 ? 'PLANUNG · 0,25×' : 'LIVE · 1×');
    this.refreshHud();
  }

  private ensureSelection(): void {
    if (this.state.ships[this.selectedShipId]?.alive) return;
    this.selectedShipId = Object.values(this.state.ships).find((ship) => ship.alive && ship.team === 'player')?.id ?? this.state.fleet.commandShipIds.player;
  }

  private syncPresentation(): void {
    for (const ship of Object.values(this.state.ships)) {
      if (!this.shipViews.has(ship.id)) this.shipViews.set(ship.id, new ShipView(this, ship));
      const target = this.state.ships[this.selectedShipId]?.targetId;
      this.shipViews.get(ship.id)?.sync(ship, ship.id === this.selectedShipId, ship.id === target, true, ship.shieldBoostMs > 0);
    }
    for (const projectile of Object.values(this.state.projectiles)) {
      let view = this.projectileViews.get(projectile.id);
      if (!view) {
        const glow = this.add.circle(0, 0, 14, projectile.team === 'player' ? 0x69cfff : 0xff625f, 0.36).setBlendMode(Phaser.BlendModes.ADD);
        const core = this.add.circle(0, 0, 5, 0xffedc0, 1);
        const trail = this.add.rectangle(-18, 0, 32, 4, projectile.team === 'player' ? 0x5bc9ff : 0xff765f, 0.72).setOrigin(1, 0.5);
        view = this.add.container(projectile.position.x, projectile.position.y, [trail, glow, core]).setDepth(42);
        this.projectileViews.set(projectile.id, view);
      }
      view.setPosition(projectile.position.x, projectile.position.y).setRotation(projectile.facing);
    }
    for (const [id, view] of this.projectileViews) {
      if (!this.state.projectiles[id]) { view.destroy(true); this.projectileViews.delete(id); }
    }
  }

  private drawOverlays(): void {
    this.overlay.clear();
    const selected = this.state.ships[this.selectedShipId];
    if (!selected?.alive) return;
    const directive = this.state.fleet.directives[selected.id];
    this.overlay.lineStyle(5, 0x74dcff, 0.62);
    let last = selected.position;
    for (const point of selected.course) {
      this.overlay.lineBetween(last.x, last.y, point.x, point.y);
      this.overlay.fillStyle(0xd8f8ff, 0.72).fillCircle(point.x, point.y, 7);
      last = point;
    }
    const target = selected.targetId ? this.state.ships[selected.targetId] : undefined;
    if (target?.alive) {
      this.overlay.lineStyle(3, 0xff7c86, 0.46);
      this.overlay.lineBetween(selected.position.x, selected.position.y, target.position.x, target.position.y);
    }
    if (directive.stance === 'hold' && directive.holdPosition) {
      this.overlay.lineStyle(4, 0xf0ce78, 0.74).strokeCircle(directive.holdPosition.x, directive.holdPosition.y, 58);
    }
  }

  private handleEvents(events: readonly RuntimeEvent[]): void {
    for (const event of events) {
      if (event.type === 'fleet-objective-captured') {
        this.hud?.toast(`${event.team === 'player' ? 'VERBÜNDET' : 'FEINDLICH'} · ${event.objectiveId === 'upper-relay' ? 'ASTER RELAY' : 'DRIFT SHIPYARD'}`);
      } else if (event.type === 'fleet-focus-changed') {
        const target = this.state.ships[event.targetId];
        if (target) this.hud?.toast(`FOKUS · ${target.name.toUpperCase()}`);
      } else if (event.type === 'weapon-fired') {
        this.showWeaponFire(event.shipId, event.targetId, event.weapon);
      } else if (event.type === 'attack-resolved') {
        this.showImpact(event.targetId, event.shieldDamage, event.hullDamage, event.weapon);
      } else if (event.type === 'shield-boosted') {
        const ship = this.state.ships[event.shipId];
        if (ship) this.showRing(ship.position, 0x6fe5ff, ship.radius * 1.2, ship.radius * 3.2, 500);
      } else if (event.type === 'ship-destroyed') {
        const ship = this.state.ships[event.shipId];
        if (ship) this.showExplosion(ship.position, ship.team === 'player' ? 0x64cfff : 0xff6a55);
      } else if (event.type === 'ability-failed' && event.shipId === this.selectedShipId) {
        this.hud?.toast(this.translateError(event.reason));
      } else if (event.type === 'combat-ended' && !this.resultShown) {
        this.resultShown = true;
        this.time.delayedCall(650, () => this.hud.showResult(event.status === 'player-won', this.state.elapsedMs));
      }
    }
  }

  private showWeaponFire(shipId: string, targetId: string, weapon: 'broadside' | 'lance' | 'torpedo'): void {
    if (weapon === 'torpedo') return;
    const ship = this.state.ships[shipId];
    const target = this.state.ships[targetId];
    if (!ship || !target) return;
    const origins = weaponOrigins(ship, target.position, weapon);
    if (weapon === 'lance') {
      const beam = this.add.graphics().setDepth(45);
      for (const origin of origins) {
        beam.lineStyle(13, 0xb45fff, 0.25).lineBetween(origin.x, origin.y, target.position.x, target.position.y);
        beam.lineStyle(4, 0xffeaff, 0.96).lineBetween(origin.x, origin.y, target.position.x, target.position.y);
      }
      this.tweens.add({ targets: beam, alpha: 0, duration: 420, onComplete: () => beam.destroy() });
      return;
    }
    origins.forEach((origin, index) => this.time.delayedCall(index * 85, () => {
      const bolt = this.add.rectangle(origin.x, origin.y, 30, 7, ship.team === 'player' ? 0x9ae4ff : 0xff8a70, 1)
        .setRotation(Math.atan2(target.position.y - origin.y, target.position.x - origin.x)).setDepth(44);
      this.tweens.add({ targets: bolt, x: target.position.x, y: target.position.y, duration: 260, ease: 'Quad.In', onComplete: () => bolt.destroy() });
    }));
  }

  private showImpact(targetId: string, shieldDamage: number, hullDamage: number, weapon: string): void {
    const target = this.state.ships[targetId];
    if (!target) return;
    const color = shieldDamage > 0 ? 0x67cfff : 0xff855e;
    const radius = weapon === 'lance' ? 46 : weapon === 'torpedo' ? 38 : 24;
    this.showRing(target.position, color, radius, radius * 3.1, 430);
    if (hullDamage > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.cameras.main.shake(90, 0.0024);
  }

  private showRing(position: Vector2, color: number, start: number, end: number, duration: number): void {
    const flash = this.add.circle(position.x, position.y, start, color, 0.5).setBlendMode(Phaser.BlendModes.ADD).setDepth(46);
    const ring = this.add.circle(position.x, position.y, start, 0, 0).setStrokeStyle(5, color, 0.9).setDepth(47);
    this.tweens.add({ targets: flash, displayWidth: end * 2, displayHeight: end * 2, alpha: 0, duration, onComplete: () => flash.destroy() });
    this.tweens.add({ targets: ring, displayWidth: end * 2.3, displayHeight: end * 2.3, alpha: 0, duration: duration + 90, onComplete: () => ring.destroy() });
  }

  private showExplosion(position: Vector2, color: number): void {
    this.showRing(position, color, 34, 170, 560);
    for (let index = 0; index < 10; index += 1) {
      const angle = Math.PI * 2 * index / 10;
      const shard = this.add.circle(position.x, position.y, 6, index % 2 ? color : 0xffe2a5, 0.95).setDepth(48);
      this.tweens.add({ targets: shard, x: position.x + Math.cos(angle) * (100 + index * 6), y: position.y + Math.sin(angle) * (100 + index * 6), alpha: 0, duration: 420 + index * 24, onComplete: () => shard.destroy() });
    }
  }

  private refreshHud(): void {
    if (!this.hud || !this.state) return;
    this.ensureSelection();
    const selected = this.state.ships[this.selectedShipId];
    const target = selected.targetId ? this.state.ships[selected.targetId] : undefined;
    const shell = document.getElementById('game-shell');
    if (shell) {
      shell.dataset.simulationTime = String(Math.floor(this.state.elapsedMs));
      shell.dataset.timeScale = String(this.timeScale);
      shell.dataset.controlMode = 'fleet';
      shell.dataset.selectedShip = selected.id;
      shell.dataset.selectedLane = this.state.fleet.directives[selected.id].laneId;
      shell.dataset.selectedStance = this.state.fleet.directives[selected.id].stance;
      shell.dataset.supply = this.state.fleet.supply.player.toFixed(1);
      shell.dataset.shipCount = String(Object.values(this.state.ships).filter((ship) => ship.alive).length);
      shell.dataset.projectiles = String(Object.keys(this.state.projectiles).length);
      shell.dataset.shipScreens = JSON.stringify(Object.fromEntries(Object.values(this.state.ships).filter((ship) => ship.alive).map((ship) => [ship.id, {
        x: Number((((ship.position.x - this.cameras.main.worldView.x) * this.cameras.main.zoom) / this.scale.width).toFixed(4)),
        y: Number((((ship.position.y - this.cameras.main.worldView.y) * this.cameras.main.zoom) / this.scale.height).toFixed(4)),
      }])));
    }
    this.hud.update({
      state: this.state, selected, target: target?.alive ? target : undefined, timeScale: this.timeScale, commandLane: this.commandLane,
      lancePreview: getAbilityPreview(this.state, selected.id, 'lance', target?.id),
      torpedoPreview: getAbilityPreview(this.state, selected.id, 'torpedo', target?.id),
      shieldPreview: getAbilityPreview(this.state, selected.id, 'shield'),
    });
  }

  private restartBattle(): void {
    this.hud.closeResult();
    this.state = createFleetBattleState(getStarterShipId(), getCampaignState().upgrades, getStarterModuleId());
    this.selectedShipId = this.state.fleet.commandShipIds.player;
    this.commandLane = 'center';
    this.timeScale = 1;
    this.accumulatorMs = 0;
    this.resultShown = false;
    for (const view of this.shipViews.values()) view.destroy(true);
    this.shipViews.clear();
    for (const view of this.projectileViews.values()) view.destroy(true);
    this.projectileViews.clear();
    this.resetCamera();
    this.syncPresentation();
    this.refreshHud();
    this.hud.toast('FLEET CORRIDORS · NEUER EINSATZ');
  }

  private translateError(error: string): string {
    const messages: Record<string, string> = {
      'Not enough Supply.': 'Nicht genügend Supply.', 'Deployment is cooling down.': 'Verstärkung wird vorbereitet.',
      'Fleet capacity reached.': 'Flottenlimit von sieben Schiffen erreicht.', 'Ship is unavailable.': 'Schiff nicht verfügbar.',
      'Not enough Energy.': 'Nicht genügend Energie.', 'Ability is cooling down.': 'System lädt noch nach.',
      'Designate an enemy target.': 'Zuerst ein feindliches Ziel erfassen.', 'Target is outside weapon range.': 'Ziel außerhalb der Waffenreichweite.',
      'Target is outside the weapon arc.': 'Haltung oder Korridor liefert noch keine Schussbahn.',
    };
    return messages[error] ?? error;
  }

  private bindPinchZoom(): void {
    const canvas = this.game.canvas;
    const point = (event: PointerEvent): { x: number; y: number } => {
      const bounds = canvas.getBoundingClientRect();
      return { x: (event.clientX - bounds.left) / bounds.width * this.scale.width, y: (event.clientY - bounds.top) / bounds.height * this.scale.height };
    };
    const gap = (): number => { const [a, b] = [...this.touchPointers.values()]; return a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0; };
    const middle = (): { x: number; y: number } => { const [a, b] = [...this.touchPointers.values()]; return a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : { x: 0, y: 0 }; };
    const down = (event: PointerEvent): void => {
      if (event.pointerType !== 'touch') return;
      this.touchPointers.set(event.pointerId, point(event));
      if (this.touchPointers.size === 2) {
        this.gestureActive = true;
        this.cameraController.cancel();
        this.pinchStartDistance = Math.max(1, gap());
        this.pinchStartZoom = this.cameraZoomFactor;
        this.lastGestureMidpoint = middle();
      }
    };
    const move = (event: PointerEvent): void => {
      if (!this.touchPointers.has(event.pointerId)) return;
      this.touchPointers.set(event.pointerId, point(event));
      if (this.touchPointers.size !== 2) return;
      event.preventDefault();
      const current = middle();
      this.applyCameraZoom(this.pinchStartZoom * gap() / this.pinchStartDistance, current);
      if (this.lastGestureMidpoint) {
        this.cameras.main.scrollX -= (current.x - this.lastGestureMidpoint.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -= (current.y - this.lastGestureMidpoint.y) / this.cameras.main.zoom;
      }
      this.lastGestureMidpoint = current;
    };
    const up = (event: PointerEvent): void => {
      this.touchPointers.delete(event.pointerId);
      if (this.touchPointers.size < 2) { this.pinchStartDistance = 0; this.lastGestureMidpoint = undefined; }
      if (this.touchPointers.size === 0) window.setTimeout(() => { this.gestureActive = false; }, 90);
    };
    canvas.addEventListener('pointerdown', down, { passive: true });
    canvas.addEventListener('pointermove', move, { passive: false });
    canvas.addEventListener('pointerup', up, { passive: true });
    canvas.addEventListener('pointercancel', up, { passive: true });
    this.removePinchListeners = () => {
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up);
    };
  }

  private bindHiDpiResize(): void {
    const host = document.getElementById('game-root');
    if (!host || typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const width = Math.max(1, Math.round(entry.contentRect.width * RENDER_DENSITY));
      const height = Math.max(1, Math.round(entry.contentRect.height * RENDER_DENSITY));
      if (this.scale.width !== width || this.scale.height !== height) this.scale.resize(width, height);
    });
    this.resizeObserver.observe(host);
  }
}
