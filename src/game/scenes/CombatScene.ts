import Phaser from 'phaser';
import { completeMission, getCampaignState, installUpgrade, selectNextMission } from '../../app/campaign';
import { RENDER_DENSITY } from '../../app/display';
import { getStarterShipId } from '../../app/starterSelection';
import {
  activateAbility,
  createCombatState,
  designateTarget,
  getAbilityPreview,
  setCourse,
  setEscortDirective,
  steerShip,
  stepCombat,
} from '../../domain/combat/combatEngine';
import {
  BATTLEFIELD_HEIGHT,
  BATTLEFIELD_WIDTH,
  FIXED_STEP_MS,
  NEBULA_CENTER,
  NEBULA_RADIUS,
} from '../../domain/combat/constants';
import { WEAPONS } from '../../domain/combat/content';
import { angleBetween, clamp, distance } from '../../domain/combat/math';
import { MISSIONS } from '../../domain/combat/missions';
import type {
  CombatEvent,
  CombatState,
  CommandResult,
  EscortDirective,
  ManualAbility,
  MissionId,
  ShipState,
  TimeScale,
  UpgradeId,
  Vector2,
} from '../../domain/combat/types';
import { CombatHud } from '../../ui/CombatHud';
import type { ActionMode, HudAction } from '../../ui/CombatHud';
import { ShipView } from '../presentation/ShipView';
import { weaponOrigins } from '../presentation/shipPresentation';

interface ProjectileView {
  readonly container: Phaser.GameObjects.Container;
}

const ESCORT_DIRECTIVES: readonly EscortDirective[] = ['follow', 'flank-left', 'flank-right', 'protect'];
const DEFAULT_CAMERA_ZOOM = 1.25;
const COURSE_DRAWING_ENABLED = false;

export class CombatScene extends Phaser.Scene {
  private combatState!: CombatState;
  private currentMissionId: MissionId = 'mission-1';
  private timeScale: TimeScale = 1;
  private accumulatorMs = 0;
  private hudRefreshMs = 0;
  private mode?: ActionMode;
  private pendingAbility?: ManualAbility;
  private routeDrawing = false;
  private routeSamples: Vector2[] = [];
  private hud!: CombatHud;
  private overlay!: Phaser.GameObjects.Graphics;
  private cameraAnchor!: Phaser.GameObjects.Zone;
  private baseCameraZoom = 0.39;
  private cameraZoomFactor = DEFAULT_CAMERA_ZOOM;
  private readonly shipViews = new Map<string, ShipView>();
  private readonly projectileViews = new Map<string, ProjectileView>();
  private readonly telegraphLabels = new Map<string, Phaser.GameObjects.Text>();
  private readonly pendingImpactDelays = new Map<string, number>();
  private readonly touchPointers = new Map<number, { x: number; y: number }>();
  private pinchStartDistance = 0;
  private pinchStartZoom = 1;
  private lastGestureMidpoint?: { x: number; y: number };
  private gestureActive = false;
  private cameraResumeTimer?: Phaser.Time.TimerEvent;
  private removePinchListeners?: () => void;
  private resizeObserver?: ResizeObserver;

  public constructor() {
    super('combat');
  }

  public create(): void {
    this.layoutCamera();
    this.cameras.main.setBackgroundColor('#05070c');
    this.createBattlefield();
    this.overlay = this.add.graphics().setDepth(12);
    const campaign = getCampaignState();
    this.currentMissionId = campaign.selectedMissionId;
    this.combatState = createCombatState(getStarterShipId(), this.currentMissionId, campaign.upgrades);
    this.createShipViews();
    const flagship = this.combatState.ships[this.combatState.flagshipId];
    this.cameraAnchor = this.add.zone(flagship.position.x, flagship.position.y, 1, 1).setVisible(false);
    this.cameras.main.setBounds(0, 0, BATTLEFIELD_WIDTH, BATTLEFIELD_HEIGHT);
    this.updateCameraAnchor(true);
    this.resumeCameraFollow();
    this.createTelegraphLabels();
    this.hud = new CombatHud({
      onAction: (action) => this.handleAction(action),
      onSteer: (heading) => this.steerFlagship(heading),
      onTimeScale: (scale) => this.setTimeScale(scale),
      onRestart: () => this.restartBattle(),
      onContinue: () => this.continueCampaign(),
      onZoom: (direction) => this.adjustCameraZoom(direction),
      onZoomReset: () => this.resetCameraZoom(),
    });
    this.hud.setZoom(this.cameraZoomFactor);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer));
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.handlePointerMove(pointer));
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.handlePointerUp(pointer));
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _objects: unknown, _deltaX: number, deltaY: number) => {
      this.adjustCameraZoom(deltaY > 0 ? -1 : 1);
    });
    this.bindPinchZoom();
    this.bindHiDpiResize();
    this.scale.on('resize', this.layoutCamera, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layoutCamera, this);
      this.removePinchListeners?.();
      this.resizeObserver?.disconnect();
    });

    this.syncPresentation();
    this.refreshHud();
    this.hud.toast('LIVE · Steuerstick links, Systeme rechts. Zwei Finger zoomen und verschieben die Karte.');
    const shell = document.getElementById('game-shell');
    shell?.setAttribute('aria-busy', 'false');
    if (shell) shell.dataset.gameReady = 'true';
  }

  public update(_time: number, delta: number): void {
    if (!this.combatState || this.combatState.status !== 'active') return;
    const boundedDelta = Math.min(delta, 100);
    this.accumulatorMs += boundedDelta * this.timeScale;
    while (this.accumulatorMs >= FIXED_STEP_MS) {
      const result = stepCombat(this.combatState, FIXED_STEP_MS);
      this.combatState = result.state;
      this.handleEvents(result.events);
      this.accumulatorMs -= FIXED_STEP_MS;
    }
    this.updateCameraAnchor();
    this.syncPresentation();
    this.drawOverlays();
    this.hudRefreshMs += boundedDelta;
    if (this.hudRefreshMs >= 90) {
      this.hudRefreshMs = 0;
      this.refreshHud();
    }
  }

  private createBattlefield(): void {
    const backgroundWidth = BATTLEFIELD_WIDTH / 2 + 4;
    for (let index = 0; index < 2; index += 1) {
      this.add
        .image(backgroundWidth * (index + 0.5) - index * 4, BATTLEFIELD_HEIGHT / 2, 'battlefield-nebula-v1')
        .setDisplaySize(backgroundWidth, BATTLEFIELD_HEIGHT * 1.34)
        .setFlipX(index === 1)
        .setAlpha(0.92)
        .setDepth(-30);
    }
    this.add
      .rectangle(BATTLEFIELD_WIDTH / 2, BATTLEFIELD_HEIGHT / 2, BATTLEFIELD_WIDTH, BATTLEFIELD_HEIGHT, 0x204469, 0.13)
      .setBlendMode(Phaser.BlendModes.SCREEN)
      .setDepth(-29);

    const farStars = this.add.graphics().setDepth(-22);
    for (let index = 0; index < 72; index += 1) {
      const x = (index * 347.13 + 71) % BATTLEFIELD_WIDTH;
      const y = (index * 211.73 + 113) % BATTLEFIELD_HEIGHT;
      farStars.fillStyle(index % 11 === 0 ? 0xbadfff : 0xffffff, index % 11 === 0 ? 0.45 : 0.2);
      farStars.fillCircle(x, y, index % 17 === 0 ? 2 : 0.9);
    }
    const nearStars = this.add.graphics().setDepth(-18);
    for (let index = 0; index < 22; index += 1) {
      const x = (index * 521.41 + 193) % BATTLEFIELD_WIDTH;
      const y = (index * 389.17 + 271) % BATTLEFIELD_HEIGHT;
      nearStars.fillStyle(index % 5 === 0 ? 0x9edcff : 0xfff6df, 0.48);
      nearStars.fillCircle(x, y, index % 7 === 0 ? 2.4 : 1.35);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.tweens.add({ targets: farStars, x: 8, y: 12, alpha: 0.78, duration: 28_000, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: nearStars, x: -7, y: 8, alpha: 0.84, duration: 19_000, yoyo: true, repeat: -1 });
    }
    const boundary = this.add.graphics().setDepth(-12);
    boundary.lineStyle(3, 0x826c45, 0.24);
    boundary.strokeRect(8, 8, BATTLEFIELD_WIDTH - 16, BATTLEFIELD_HEIGHT - 16);
  }

  private createShipViews(): void {
    for (const ship of Object.values(this.combatState.ships)) this.createShipView(ship);
  }

  private createShipView(ship: ShipState): void {
    this.shipViews.set(ship.id, new ShipView(this, ship));
  }

  private createTelegraphLabels(): void {
    for (const ship of Object.values(this.combatState.ships)) this.createTelegraphLabel(ship);
  }

  private createTelegraphLabel(ship: ShipState): void {
    const label = this.add
      .text(ship.position.x, ship.position.y, '', {
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: ship.team === 'enemy' ? '#ffd6d6' : '#d5f2ff',
        backgroundColor: ship.team === 'enemy' ? '#54131fe6' : '#12374fe6',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5, 1)
      .setDepth(34)
      .setVisible(false);
    this.telegraphLabels.set(ship.id, label);
  }

  private layoutCamera(): void {
    const width = this.scale.width || 844;
    const height = this.scale.height || 390;
    const landscape = width >= height;
    const topInset = (landscape ? 48 : 62) * RENDER_DENSITY;
    const hudHeight = landscape ? 0 : Math.max(214 * RENDER_DENSITY, Math.min(260 * RENDER_DENSITY, height * 0.26));
    const viewportHeight = Math.max((landscape ? 220 : 300) * RENDER_DENSITY, height - topInset - hudHeight);
    this.cameras.main.setViewport(0, topInset, width, viewportHeight);
    this.baseCameraZoom = Math.min(width / BATTLEFIELD_WIDTH, viewportHeight / BATTLEFIELD_HEIGHT);
    this.cameras.main.setZoom(this.baseCameraZoom * this.cameraZoomFactor);
    if (this.combatState && this.cameraAnchor) this.updateCameraAnchor(true);
    else this.cameras.main.centerOn(BATTLEFIELD_WIDTH / 2, BATTLEFIELD_HEIGHT / 2);
    this.hud?.setZoom(this.cameraZoomFactor);
  }

  private adjustCameraZoom(direction: number): void {
    this.applyCameraZoom(this.cameraZoomFactor + direction * 0.1);
  }

  private resetCameraZoom(): void {
    this.cameraZoomFactor = DEFAULT_CAMERA_ZOOM;
    this.layoutCamera();
  }

  private applyCameraZoom(factor: number, focus?: { x: number; y: number }): void {
    const camera = this.cameras.main;
    const nextFactor = Phaser.Math.Clamp(factor, 0.65, 2.4);
    const worldBefore = focus ? camera.getWorldPoint(focus.x, focus.y) : undefined;
    this.cameraZoomFactor = nextFactor;
    camera.setZoom(this.baseCameraZoom * nextFactor);
    if (focus && worldBefore) {
      const worldAfter = camera.getWorldPoint(focus.x, focus.y);
      camera.scrollX += worldBefore.x - worldAfter.x;
      camera.scrollY += worldBefore.y - worldAfter.y;
    }
    this.hud?.setZoom(nextFactor);
  }

  private setTimeScale(scale: TimeScale): void {
    this.timeScale = scale;
    this.refreshHud();
    this.hud.toast(scale === 0 ? 'TAKTISCHE PAUSE · Befehle bleiben vollständig verfügbar.' : scale === 0.25 ? 'SLOW TIME · 0,25×' : 'LIVE · 1×');
  }

  private handleAction(action: HudAction): void {
    if (this.combatState.status !== 'active') return;
    if (action === 'course') {
      this.hud.toast('Routenzeichnung bleibt für den Joystick-Test vorübergehend inaktiv.');
      return;
    }
    if (action === 'target') {
      this.mode = this.mode === action ? undefined : action;
      this.pendingAbility = undefined;
      this.routeSamples = [];
      this.routeDrawing = false;
      this.hud.toast('Gegner antippen, um ihn für Autofire und Spezialwaffen zu erfassen.');
      this.refreshHud();
      return;
    }
    if (action === 'escort') {
      const current = ESCORT_DIRECTIVES.indexOf(this.combatState.escortDirective);
      const directive = ESCORT_DIRECTIVES[(current + 1) % ESCORT_DIRECTIVES.length];
      this.applyCommandResult(setEscortDirective(this.combatState, directive));
      this.hud.toast(`Eskorte: ${this.directiveDescription(directive)}.`);
      return;
    }
    if (action === 'shield') {
      this.activateFlagshipAbility('shield');
      return;
    }
    const flagship = this.combatState.ships[this.combatState.flagshipId];
    if (!flagship.targetId || !this.combatState.ships[flagship.targetId]?.alive) {
      this.pendingAbility = action;
      this.mode = 'target';
      this.hud.toast(`Ziel für ${action === 'lance' ? 'Lanze' : 'Torpedo'} antippen.`);
      this.refreshHud();
      return;
    }
    this.activateFlagshipAbility(action);
  }

  private steerFlagship(heading: number): void {
    const result = steerShip(this.combatState, this.combatState.flagshipId, heading);
    if (result.error) {
      this.hud.toast(this.translateError(result.error));
      return;
    }
    this.combatState = result.state;
    this.mode = undefined;
    this.routeDrawing = false;
    this.routeSamples = [];
    this.handleEvents(result.events);
    this.updateCameraAnchor();
    this.drawOverlays();
    this.refreshHud();
  }

  private activateFlagshipAbility(ability: ManualAbility): void {
    const result = activateAbility(this.combatState, this.combatState.flagshipId, ability);
    if (result.error) {
      this.hud.toast(this.translateError(result.error));
      return;
    }
    this.applyCommandResult(result);
    this.hud.toast(ability === 'lance' ? 'RIFT LANCE LÄDT · Feuerlösung halten!' : ability === 'torpedo' ? 'VOID TORPEDO GESTARTET' : 'SCHILDMATRIX ÜBERLADEN');
  }

  private applyCommandResult(result: CommandResult): void {
    if (result.error) {
      this.hud.toast(this.translateError(result.error));
      return;
    }
    this.combatState = result.state;
    this.handleEvents(result.events);
    this.syncPresentation();
    this.drawOverlays();
    this.refreshHud();
  }

  private pointerWorld(pointer: Phaser.Input.Pointer): Vector2 {
    return { x: pointer.worldX, y: pointer.worldY };
  }

  private findShipAt(point: Vector2): ShipState | undefined {
    return Object.values(this.combatState.ships)
      .filter((ship) => ship.alive)
      .find((ship) => distance(point, ship.position) <= ship.radius * 2);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.gestureActive || this.combatState.status !== 'active') return;
    const point = this.pointerWorld(pointer);
    const hit = this.findShipAt(point);
    if (hit?.team === 'enemy' && this.mode !== 'course') {
      this.selectTarget(hit.id);
      return;
    }
    const flagship = this.combatState.ships[this.combatState.flagshipId];
    if (COURSE_DRAWING_ENABLED && hit?.id === flagship.id && !this.mode) this.mode = 'course';
    if (this.mode !== 'course') return;
    this.routeDrawing = true;
    this.routeSamples = [{ ...flagship.position }, point];
    this.drawOverlays();
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.gestureActive || !this.routeDrawing || !pointer.isDown) return;
    const point = this.pointerWorld(pointer);
    const last = this.routeSamples.at(-1);
    if (!last || distance(last, point) >= 28) {
      this.routeSamples.push(point);
      if (this.routeSamples.length > 12) this.routeSamples.splice(1, 1);
      this.drawOverlays();
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.gestureActive || !this.routeDrawing) return;
    const point = this.pointerWorld(pointer);
    if (distance(this.routeSamples.at(-1) ?? point, point) > 8) this.routeSamples.push(point);
    this.routeDrawing = false;
    const course = this.buildSmoothCourse(this.routeSamples);
    this.routeSamples = [];
    const result = setCourse(this.combatState, this.combatState.flagshipId, course);
    if (result.error) {
      this.hud.toast(this.translateError(result.error));
    } else {
      this.mode = undefined;
      this.applyCommandResult(result);
      this.hud.toast('KURS GESETZT · Wendung beginnt sofort.');
    }
  }

  private buildSmoothCourse(rawPoints: readonly Vector2[]): readonly Vector2[] {
    const flagship = this.combatState.ships[this.combatState.flagshipId];
    if (rawPoints.length < 2) return [];
    const points = rawPoints.map((point) => new Phaser.Math.Vector2(
      clamp(point.x, 70, BATTLEFIELD_WIDTH - 70),
      clamp(point.y, 70, BATTLEFIELD_HEIGHT - 70),
    ));
    if (points.length === 2) {
      points.splice(1, 0, new Phaser.Math.Vector2(
        flagship.position.x + Math.cos(flagship.facing) * 120,
        flagship.position.y + Math.sin(flagship.facing) * 120,
      ));
    }
    const spline = new Phaser.Curves.Spline(points);
    const count = Phaser.Math.Clamp(Math.ceil(spline.getLength() / 70), 5, 17);
    return spline.getSpacedPoints(count).slice(1).map((point) => ({ x: point.x, y: point.y }));
  }

  private selectTarget(targetId: string): void {
    const result = designateTarget(this.combatState, this.combatState.flagshipId, targetId);
    if (result.error) {
      this.hud.toast(this.translateError(result.error));
      return;
    }
    this.applyCommandResult(result);
    const target = this.combatState.ships[targetId];
    this.mode = undefined;
    this.hud.toast(`${target.name} erfasst · Breitseiten feuern im Seitenbogen automatisch.`);
    if (this.pendingAbility) {
      const ability = this.pendingAbility;
      this.pendingAbility = undefined;
      this.activateFlagshipAbility(ability);
    }
  }

  private syncPresentation(): void {
    for (const [id, view] of this.shipViews) {
      const ship = this.combatState.ships[id];
      const flagship = id === this.combatState.flagshipId;
      const target = id === this.combatState.ships[this.combatState.flagshipId]?.targetId;
      view.sync(ship, flagship, target, true, ship.shieldBoostMs > 0);
    }
    this.syncProjectiles();
  }

  private syncProjectiles(): void {
    for (const projectile of Object.values(this.combatState.projectiles)) {
      let view = this.projectileViews.get(projectile.id);
      if (!view) {
        const trail = this.add.rectangle(-22, 0, 45, 5, projectile.team === 'player' ? 0xffb45f : 0xff5a62, 0.5).setOrigin(1, 0.5);
        const glow = this.add.circle(0, 0, 14, projectile.team === 'player' ? 0xffa348 : 0xff4755, 0.25).setBlendMode(Phaser.BlendModes.ADD);
        const core = this.add.triangle(0, 0, 10, 0, -8, -6, -8, 6, 0xfff0c8, 1);
        const container = this.add.container(projectile.position.x, projectile.position.y, [trail, glow, core]).setDepth(42);
        view = { container };
        this.projectileViews.set(projectile.id, view);
      }
      view.container.setPosition(projectile.position.x, projectile.position.y).setRotation(projectile.facing);
    }
    for (const [id, view] of this.projectileViews) {
      if (this.combatState.projectiles[id]) continue;
      view.container.destroy(true);
      this.projectileViews.delete(id);
    }
  }

  private drawOverlays(): void {
    if (!this.overlay || !this.combatState) return;
    this.overlay.clear();
    this.overlay.fillStyle(0x73cbe8, 0.055);
    this.overlay.lineStyle(4, 0x78d5ef, 0.4);
    this.overlay.fillCircle(NEBULA_CENTER.x, NEBULA_CENTER.y, NEBULA_RADIUS);
    this.overlay.strokeCircle(NEBULA_CENTER.x, NEBULA_CENTER.y, NEBULA_RADIUS);

    const objective = this.combatState.objective;
    if (objective.position) {
      const ownerColor = objective.owner === 'player' ? 0x65d9ff : objective.owner === 'enemy' ? 0xff5e6f : 0xd7bd7a;
      this.overlay.fillStyle(ownerColor, objective.owner ? 0.1 : 0.045);
      this.overlay.lineStyle(6, ownerColor, objective.owner ? 0.78 : 0.44);
      this.overlay.fillCircle(objective.position.x, objective.position.y, objective.radius);
      this.overlay.strokeCircle(objective.position.x, objective.position.y, objective.radius);
      this.overlay.lineStyle(12, objective.captureProgress >= 0 ? 0x69d7ff : 0xff6674, 0.92);
      this.overlay.beginPath();
      this.overlay.arc(
        objective.position.x,
        objective.position.y,
        objective.radius + 14,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * Math.abs(objective.captureProgress),
        false,
      );
      this.overlay.strokePath();
      this.overlay.fillStyle(ownerColor, 0.82);
      this.overlay.fillTriangle(
        objective.position.x,
        objective.position.y - 34,
        objective.position.x - 24,
        objective.position.y + 18,
        objective.position.x + 24,
        objective.position.y + 18,
      );
    }

    const flagship = this.combatState.ships[this.combatState.flagshipId];
    const course = this.routeDrawing ? this.buildSmoothCourse(this.routeSamples) : flagship.course;
    if (course.length > 0) {
      const points = [flagship.position, ...course];
      this.overlay.lineStyle(7, 0x6bd4ff, 0.76);
      for (let index = 1; index < points.length; index += 1) {
        this.overlay.lineBetween(points[index - 1].x, points[index - 1].y, points[index].x, points[index].y);
      }
      for (let index = 2; index < points.length; index += 3) {
        this.overlay.fillStyle(0xb9efff, 0.85);
        this.overlay.fillCircle(points[index].x, points[index].y, 7);
      }
      const end = points.at(-1)!;
      const previous = points.at(-2) ?? flagship.position;
      const endFacing = angleBetween(previous, end);
      this.overlay.lineStyle(5, 0xb9efff, 0.94);
      this.overlay.strokeCircle(end.x, end.y, flagship.radius * 0.72);
      this.overlay.lineBetween(end.x, end.y, end.x + Math.cos(endFacing) * flagship.radius * 1.45, end.y + Math.sin(endFacing) * flagship.radius * 1.45);
    }

    if (flagship.alive) {
      const guideStart = {
        x: flagship.position.x + Math.cos(flagship.desiredHeading) * flagship.radius * 1.2,
        y: flagship.position.y + Math.sin(flagship.desiredHeading) * flagship.radius * 1.2,
      };
      const guideEnd = {
        x: flagship.position.x + Math.cos(flagship.desiredHeading) * (flagship.radius + 135),
        y: flagship.position.y + Math.sin(flagship.desiredHeading) * (flagship.radius + 135),
      };
      this.overlay.lineStyle(6, 0x7ad9ff, 0.72);
      this.overlay.lineBetween(guideStart.x, guideStart.y, guideEnd.x, guideEnd.y);
      this.overlay.fillStyle(0xc6f2ff, 0.92);
      this.overlay.fillTriangle(
        guideEnd.x + Math.cos(flagship.desiredHeading) * 18,
        guideEnd.y + Math.sin(flagship.desiredHeading) * 18,
        guideEnd.x + Math.cos(flagship.desiredHeading + 2.45) * 15,
        guideEnd.y + Math.sin(flagship.desiredHeading + 2.45) * 15,
        guideEnd.x + Math.cos(flagship.desiredHeading - 2.45) * 15,
        guideEnd.y + Math.sin(flagship.desiredHeading - 2.45) * 15,
      );
      this.drawArc(flagship.position, flagship.facing - Math.PI / 2, WEAPONS.broadside.range, WEAPONS.broadside.halfAngle, 0x4fbfff, 0.025);
      this.drawArc(flagship.position, flagship.facing + Math.PI / 2, WEAPONS.broadside.range, WEAPONS.broadside.halfAngle, 0x4fbfff, 0.025);
      const target = flagship.targetId ? this.combatState.ships[flagship.targetId] : undefined;
      if (target?.alive) {
        this.overlay.lineStyle(4, 0x69cfff, 0.5);
        this.overlay.lineBetween(flagship.position.x, flagship.position.y, target.position.x, target.position.y);
      }
    }

    for (const ship of Object.values(this.combatState.ships)) {
      const label = this.telegraphLabels.get(ship.id);
      if (!label || !ship.alive) {
        label?.setVisible(false);
        continue;
      }
      if (ship.lanceChargeMs > 0 && ship.lanceTargetId) {
        const target = this.combatState.ships[ship.lanceTargetId];
        if (target?.alive) {
          const hostile = ship.team === 'enemy';
          const progress = 1 - ship.lanceChargeMs / (WEAPONS.lance.chargeMs ?? 1);
          const color = hostile ? 0xf25bff : 0x9b72ff;
          this.overlay.lineStyle(5 + progress * 5, color, 0.24 + progress * 0.48);
          this.overlay.lineBetween(ship.position.x, ship.position.y, target.position.x, target.position.y);
          label
            .setText(`⚠ LANZE ${(ship.lanceChargeMs / 1_000).toFixed(1)}s`)
            .setPosition(ship.position.x, ship.position.y - ship.radius * 2.1)
            .setVisible(true);
          continue;
        }
      }
      if (ship.role === 'escort') {
        label
          .setText(`ESKORTE · ${this.directiveDescription(this.combatState.escortDirective).toUpperCase()}`)
          .setPosition(ship.position.x, ship.position.y - ship.radius * 2)
          .setVisible(true);
      } else {
        label.setVisible(false);
      }
    }
  }

  private drawArc(origin: Vector2, facing: number, range: number, halfAngle: number, color: number, alpha: number): void {
    this.overlay.fillStyle(color, alpha);
    this.overlay.lineStyle(2, color, 0.18);
    this.overlay.beginPath();
    this.overlay.moveTo(origin.x, origin.y);
    this.overlay.arc(origin.x, origin.y, range, facing - halfAngle, facing + halfAngle, false);
    this.overlay.closePath();
    this.overlay.fillPath();
    this.overlay.strokePath();
  }

  private handleEvents(events: readonly CombatEvent[]): void {
    for (const event of events) {
      switch (event.type) {
        case 'weapon-fired':
          this.pendingImpactDelays.set(
            this.impactKey(event.shipId, event.targetId, event.weapon),
            this.showWeaponFire(event.shipId, event.targetId, event.weapon),
          );
          break;
        case 'attack-resolved':
          this.showImpact(
            event.targetId,
            event.shieldDamage,
            event.hullDamage,
            event.weapon,
            this.pendingImpactDelays.get(this.impactKey(event.shipId, event.targetId, event.weapon)) ?? 0,
          );
          this.pendingImpactDelays.delete(this.impactKey(event.shipId, event.targetId, event.weapon));
          break;
        case 'shield-boosted':
          this.showShieldBoost(event.shipId);
          break;
        case 'ability-failed':
          if (event.shipId === this.combatState.flagshipId) this.hud?.toast(this.translateError(event.reason));
          break;
        case 'ship-destroyed':
          this.showExplosion(event.shipId);
          break;
        case 'combat-ended':
          this.timeScale = 0;
          this.refreshHud();
          this.showMissionResult(event.status);
          break;
        case 'objective-captured':
          this.hud.toast(event.team === 'player' ? 'KONTROLLPUNKT GESICHERT' : 'WARNUNG · FEIND KONTROLLIERT DEN PUNKT');
          break;
        case 'reinforcement-spawned': {
          const reinforcement = this.combatState.ships[event.shipId];
          if (reinforcement && !this.shipViews.has(event.shipId)) {
            this.createShipView(reinforcement);
            this.createTelegraphLabel(reinforcement);
          }
          this.hud.toast(event.team === 'player' ? 'WERFT · VOIDWING GESTARTET' : 'FEINDWERFT · DROHNE GESTARTET');
          break;
        }
        case 'course-changed':
        case 'heading-changed':
        case 'target-designated':
        case 'escort-directive-changed':
        case 'weapon-charging':
        case 'projectile-launched':
        case 'projectile-expired':
          break;
      }
    }
  }

  private showMissionResult(status: Exclude<CombatState['status'], 'active'>): void {
    const mission = MISSIONS[this.currentMissionId];
    const before = getCampaignState();
    const firstClear = status === 'player-won' && !before.completedMissions.includes(this.currentMissionId);
    const campaign = status === 'player-won' ? completeMission(this.currentMissionId) : before;
    this.hud.showResult({
      status,
      missionId: this.currentMissionId,
      missionName: mission.name,
      elapsedMs: this.combatState.elapsedMs,
      salvage: firstClear ? mission.salvage : 0,
      totalSalvage: campaign.salvage,
      upgradeChoices: firstClear ? mission.upgradeChoices : [],
      finalMission: mission.number === 3,
    }, (upgradeId) => this.installMissionUpgrade(upgradeId));
  }

  private installMissionUpgrade(upgradeId: UpgradeId): void {
    installUpgrade(upgradeId);
    const upgradeName = document.querySelector<HTMLButtonElement>(`[data-upgrade="${upgradeId}"] strong`)?.textContent ?? 'Upgrade';
    this.hud.toast(`${upgradeName.toUpperCase()} INSTALLIERT`);
  }

  private impactKey(shipId: string, targetId: string, weapon: 'broadside' | 'lance' | 'torpedo'): string {
    return `${shipId}:${targetId}:${weapon}`;
  }

  private showWeaponFire(shipId: string, targetId: string, weapon: 'broadside' | 'lance' | 'torpedo'): number {
    const ship = this.combatState.ships[shipId];
    const target = this.combatState.ships[targetId];
    if (!ship || !target) return 0;
    const origins = weaponOrigins(ship, target.position, weapon);
    if (weapon === 'torpedo') {
      const origin = origins[0] ?? ship.position;
      const flash = this.add.circle(origin.x, origin.y, 16, 0xffb464, 0.9).setBlendMode(Phaser.BlendModes.ADD).setDepth(44);
      this.tweens.add({ targets: flash, scale: 2.4, alpha: 0, duration: 180, onComplete: () => flash.destroy() });
      return 0;
    }

    if (weapon === 'broadside') {
      const travelMs = Phaser.Math.Clamp(distance(ship.position, target.position) * 0.42, 190, 390);
      const impactPoint = { ...target.position };
      const salvoDelay = 92;
      origins.forEach((origin, index) => {
        this.time.delayedCall(index * salvoDelay, () => this.emitBroadsideRound(origin, impactPoint, ship.team === 'player', travelMs, index));
      });
      const view = this.shipViews.get(shipId);
      if (view) {
        this.tweens.killTweensOf(view);
        this.tweens.add({
          targets: view,
          scaleX: { from: 0.96, to: 1 },
          scaleY: { from: 1.045, to: 1 },
          duration: Math.max(190, origins.length * salvoDelay + 90),
          ease: 'Back.Out',
        });
      }
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.cameras.main.shake(110, 0.0032);
      return Math.round(Math.max(0, origins.length - 1) * salvoDelay + travelMs);
    }

    const beam = this.add.graphics().setDepth(43);
    const color = 0xe06dff;
    for (const [index, origin] of origins.entries()) {
      const spread = (index - (origins.length - 1) / 2) * 5;
      beam.lineStyle(12, color, 0.22);
      beam.lineBetween(origin.x, origin.y, target.position.x + spread, target.position.y - spread * 0.3);
      beam.lineStyle(4, 0xfff3dc, 0.95);
      beam.lineBetween(origin.x, origin.y, target.position.x + spread, target.position.y - spread * 0.3);
    }
    const bloom = this.add.circle(target.position.x, target.position.y, 42, 0xdf69ff, 0.36).setBlendMode(Phaser.BlendModes.ADD).setDepth(42);
    this.tweens.add({ targets: bloom, scale: 2.7, alpha: 0, duration: 330, onComplete: () => bloom.destroy() });
    this.tweens.add({ targets: beam, alpha: 0, duration: 360, onComplete: () => beam.destroy() });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.cameras.main.shake(150, 0.005);
    return 210;
  }

  private emitBroadsideRound(origin: Vector2, target: Vector2, friendly: boolean, travelMs: number, index: number): void {
    const color = friendly ? 0xffb45f : 0xff715f;
    const muzzle = this.add.circle(origin.x, origin.y, 10 + index * 0.7, 0xffe0a6, 0.95).setBlendMode(Phaser.BlendModes.ADD).setDepth(46);
    const muzzleRing = this.add.circle(origin.x, origin.y, 15, 0, 0).setStrokeStyle(4, color, 0.85).setDepth(45);
    this.tweens.add({ targets: muzzle, scale: 3.3, alpha: 0, duration: 150, onComplete: () => muzzle.destroy() });
    this.tweens.add({ targets: muzzleRing, scale: 2.5, alpha: 0, duration: 190, onComplete: () => muzzleRing.destroy() });

    const angle = angleBetween(origin, target);
    const trail = this.add.rectangle(-18, 0, 38, 5, color, 0.5).setOrigin(1, 0.5);
    const core = this.add.rectangle(0, 0, 20, 7, 0xfff4d5, 1).setOrigin(0.5);
    const glow = this.add.circle(0, 0, 13, color, 0.34).setBlendMode(Phaser.BlendModes.ADD);
    const bolt = this.add.container(origin.x, origin.y, [trail, glow, core]).setRotation(angle).setDepth(45);
    this.tweens.add({
      targets: bolt,
      x: target.x,
      y: target.y,
      duration: travelMs,
      ease: 'Quad.In',
      onComplete: () => {
        bolt.destroy(true);
        this.showMicroImpact(target, color, index);
      },
    });
  }

  private showMicroImpact(position: Vector2, color: number, index: number): void {
    const flash = this.add.circle(position.x, position.y, 14 + index * 2, color, 0.7).setBlendMode(Phaser.BlendModes.ADD).setDepth(46);
    const ring = this.add.circle(position.x, position.y, 17, 0, 0).setStrokeStyle(3, 0xffe5b5, 0.78).setDepth(47);
    this.tweens.add({ targets: flash, scale: 2.8, alpha: 0, duration: 180, onComplete: () => flash.destroy() });
    this.tweens.add({ targets: ring, scale: 2.1, alpha: 0, duration: 230, onComplete: () => ring.destroy() });
  }

  private showImpact(
    targetId: string,
    shieldDamage: number,
    hullDamage: number,
    weapon: 'broadside' | 'lance' | 'torpedo',
    delayMs = 0,
  ): void {
    const target = this.combatState.ships[targetId];
    if (!target) return;
    const impactPosition = { ...target.position };
    this.time.delayedCall(delayMs, () => {
      const color = shieldDamage > 0 ? 0x5ab6ff : 0xff8a5c;
      const scale = weapon === 'lance' ? 1.45 : weapon === 'torpedo' ? 1.25 : 1;
      const impact = this.add.circle(impactPosition.x, impactPosition.y, 28 * scale, color, 0.78).setBlendMode(Phaser.BlendModes.ADD).setDepth(45);
      const ring = this.add.circle(impactPosition.x, impactPosition.y, 34 * scale, 0, 0).setStrokeStyle(6, color, 0.92).setDepth(46);
      const damage = this.add
        .text(impactPosition.x, impactPosition.y - target.radius * 1.65, `−${shieldDamage + hullDamage}`, {
          fontFamily: 'Inter, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: shieldDamage > 0 ? '#bce9ff' : '#ffc09f',
          stroke: '#05070c', strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(49);
      this.tweens.add({ targets: impact, scale: 3.4, alpha: 0, duration: 360, onComplete: () => impact.destroy() });
      this.tweens.add({ targets: ring, scale: 3.1, alpha: 0, duration: 480, ease: 'Cubic.Out', onComplete: () => ring.destroy() });
      this.tweens.add({ targets: damage, y: damage.y - 62, alpha: 0, duration: 820, onComplete: () => damage.destroy() });

      if (hullDamage > 0) {
        for (let index = 0; index < 7; index += 1) {
          const angle = (Math.PI * 2 * index) / 7 + 0.25;
          const shard = this.add.triangle(impactPosition.x, impactPosition.y, 7, 0, -4, -3, -4, 3, 0xffba76, 0.9).setRotation(angle).setDepth(48);
          this.tweens.add({
            targets: shard,
            x: impactPosition.x + Math.cos(angle) * (70 + index * 5),
            y: impactPosition.y + Math.sin(angle) * (70 + index * 5),
            rotation: angle + 2.2,
            alpha: 0,
            duration: 420 + index * 25,
            onComplete: () => shard.destroy(),
          });
        }
      }
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && weapon !== 'broadside') {
        this.cameras.main.shake(weapon === 'lance' ? 150 : 110, weapon === 'lance' ? 0.006 : 0.004);
      }
    });
  }

  private showShieldBoost(shipId: string): void {
    const ship = this.combatState.ships[shipId];
    if (!ship) return;
    const ring = this.add.circle(ship.position.x, ship.position.y, ship.radius * 1.1, 0, 0).setStrokeStyle(8, 0x65d7ff, 0.95).setDepth(44);
    this.tweens.add({ targets: ring, scale: 2.8, alpha: 0, duration: 520, onComplete: () => ring.destroy() });
  }

  private showExplosion(shipId: string): void {
    const view = this.shipViews.get(shipId);
    if (!view) return;
    const blast = this.add.circle(view.x, view.y, 30, 0xff9d4c, 0.95).setDepth(48);
    this.tweens.add({ targets: blast, scale: 4.5, alpha: 0, duration: 520, onComplete: () => blast.destroy() });
  }

  private refreshHud(): void {
    if (!this.hud || !this.combatState) return;
    const flagship = this.combatState.ships[this.combatState.flagshipId];
    const escort = Object.values(this.combatState.ships).find((ship) => ship.role === 'escort');
    const target = flagship.targetId ? this.combatState.ships[flagship.targetId] : undefined;
    const shell = document.getElementById('game-shell');
    if (shell) {
      shell.dataset.simulationTime = String(Math.floor(this.combatState.elapsedMs));
      shell.dataset.coursePoints = String(flagship.course.length);
      shell.dataset.desiredHeading = flagship.desiredHeading.toFixed(4);
      shell.dataset.projectiles = String(Object.keys(this.combatState.projectiles).length);
      shell.dataset.timeScale = String(this.timeScale);
      shell.dataset.mission = this.combatState.missionId;
      shell.dataset.objectiveOwner = this.combatState.objective.owner ?? 'neutral';
      shell.dataset.objectiveProgress = this.combatState.objective.captureProgress.toFixed(3);
      shell.dataset.shipScreens = JSON.stringify(Object.fromEntries(
        Object.values(this.combatState.ships).map((ship) => [ship.id, {
          x: Number((((ship.position.x - this.cameras.main.worldView.x) * this.cameras.main.zoom + this.cameras.main.x) / this.scale.width).toFixed(4)),
          y: Number((((ship.position.y - this.cameras.main.worldView.y) * this.cameras.main.zoom + this.cameras.main.y) / this.scale.height).toFixed(4)),
        }]),
      ));
    }
    this.hud.update({
      state: this.combatState,
      flagship,
      escort,
      target: target?.alive ? target : undefined,
      mode: this.mode,
      timeScale: this.timeScale,
      lancePreview: getAbilityPreview(this.combatState, flagship.id, 'lance', target?.id),
      torpedoPreview: getAbilityPreview(this.combatState, flagship.id, 'torpedo', target?.id),
      shieldPreview: getAbilityPreview(this.combatState, flagship.id, 'shield'),
    });
  }

  private restartBattle(): void {
    this.hud.closeResult();
    this.combatState = createCombatState(getStarterShipId(), this.currentMissionId, getCampaignState().upgrades);
    this.timeScale = 1;
    this.accumulatorMs = 0;
    this.mode = undefined;
    this.pendingAbility = undefined;
    this.routeDrawing = false;
    this.routeSamples = [];
    for (const view of this.projectileViews.values()) view.container.destroy(true);
    this.projectileViews.clear();
    for (const view of this.shipViews.values()) view.destroy(true);
    this.shipViews.clear();
    for (const label of this.telegraphLabels.values()) label.destroy();
    this.telegraphLabels.clear();
    this.pendingImpactDelays.clear();
    this.createShipViews();
    this.createTelegraphLabels();
    this.updateCameraAnchor(true);
    this.syncPresentation();
    this.drawOverlays();
    this.refreshHud();
    this.hud.toast(`MISSION 0${MISSIONS[this.currentMissionId].number} · ${MISSIONS[this.currentMissionId].name.toUpperCase()}`);
  }

  private continueCampaign(): void {
    if (this.combatState.status !== 'player-won') return;
    const finalMission = MISSIONS[this.currentMissionId].number === 3;
    if (!finalMission) this.currentMissionId = selectNextMission(this.currentMissionId);
    this.restartBattle();
    if (finalMission) this.hud.toast('DREI-MISSIONEN-SLICE ABGESCHLOSSEN · WERFTGEFECHT WIRD WIEDERHOLT');
  }

  private updateCameraAnchor(immediate = false): void {
    if (!this.cameraAnchor || !this.combatState) return;
    const flagship = this.combatState.ships[this.combatState.flagshipId];
    if (!flagship) return;
    let x = flagship.position.x + Math.cos(flagship.facing) * 450;
    let y = flagship.position.y + Math.sin(flagship.facing) * 450;
    const escort = Object.values(this.combatState.ships).find((ship) => ship.role === 'escort' && ship.alive);
    if (escort) {
      x = Phaser.Math.Linear(x, escort.position.x, 0.18);
      y = Phaser.Math.Linear(y, escort.position.y, 0.18);
    }
    const target = flagship.targetId ? this.combatState.ships[flagship.targetId] : undefined;
    if (target?.alive) {
      x = Phaser.Math.Linear(x, target.position.x, 0.2);
      y = Phaser.Math.Linear(y, target.position.y, 0.2);
    }
    this.cameraAnchor.setPosition(
      clamp(x, 0, BATTLEFIELD_WIDTH),
      clamp(y, 0, BATTLEFIELD_HEIGHT),
    );
    if (immediate) this.cameras.main.centerOn(this.cameraAnchor.x, this.cameraAnchor.y);
  }

  private directiveDescription(directive: EscortDirective): string {
    const descriptions: Record<EscortDirective, string> = {
      follow: 'Formation folgen',
      'flank-left': 'links flankieren',
      'flank-right': 'rechts flankieren',
      protect: 'Flaggschiff schützen',
    };
    return descriptions[directive];
  }

  private translateError(error: string): string {
    const translations: Record<string, string> = {
      'Not enough Energy.': 'Nicht genügend Energie.',
      'Ability is cooling down.': 'System lädt noch nach.',
      'Designate an enemy target.': 'Zuerst ein gegnerisches Ziel erfassen.',
      'Target is outside weapon range.': 'Ziel außerhalb der Waffenreichweite.',
      'Target is outside the weapon arc.': 'Ziel außerhalb des Frontbogens. Kurs anpassen.',
      'Shield boost is already active.': 'Schildboost ist bereits aktiv.',
      'Firing solution lost during charge.': 'Feuerlösung während der Ladephase verloren.',
      'Draw a longer course.': 'Eine längere Route ziehen.',
    };
    return translations[error] ?? error;
  }

  private bindPinchZoom(): void {
    const canvas = this.game.canvas;
    const position = (event: PointerEvent): { x: number; y: number } => {
      const bounds = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - bounds.left) / bounds.width) * this.scale.width,
        y: ((event.clientY - bounds.top) / bounds.height) * this.scale.height,
      };
    };
    const touchDistance = (): number => {
      const [first, second] = [...this.touchPointers.values()];
      return first && second ? Math.hypot(second.x - first.x, second.y - first.y) : 0;
    };
    const midpoint = (): { x: number; y: number } => {
      const [first, second] = [...this.touchPointers.values()];
      return first && second ? { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } : { x: 0, y: 0 };
    };
    const onPointerDown = (event: PointerEvent): void => {
      if (event.pointerType !== 'touch') return;
      this.touchPointers.set(event.pointerId, position(event));
      if (this.touchPointers.size === 2) {
        this.gestureActive = true;
        this.suspendCameraFollow();
        this.routeDrawing = false;
        this.routeSamples = [];
        this.pinchStartDistance = Math.max(1, touchDistance());
        this.pinchStartZoom = this.cameraZoomFactor;
        this.lastGestureMidpoint = midpoint();
      }
    };
    const onPointerMove = (event: PointerEvent): void => {
      if (!this.touchPointers.has(event.pointerId)) return;
      this.touchPointers.set(event.pointerId, position(event));
      if (this.touchPointers.size !== 2 || this.pinchStartDistance <= 0) return;
      event.preventDefault();
      const currentMidpoint = midpoint();
      this.applyCameraZoom(this.pinchStartZoom * (touchDistance() / this.pinchStartDistance), currentMidpoint);
      if (this.lastGestureMidpoint) {
        this.cameras.main.scrollX -= (currentMidpoint.x - this.lastGestureMidpoint.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY -= (currentMidpoint.y - this.lastGestureMidpoint.y) / this.cameras.main.zoom;
      }
      this.lastGestureMidpoint = currentMidpoint;
    };
    const onPointerUp = (event: PointerEvent): void => {
      this.touchPointers.delete(event.pointerId);
      if (this.touchPointers.size < 2) {
        this.pinchStartDistance = 0;
        this.lastGestureMidpoint = undefined;
      }
      if (this.touchPointers.size === 0) {
        window.setTimeout(() => (this.gestureActive = false), 80);
        this.scheduleCameraFollow();
      }
    };
    canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp, { passive: true });
    canvas.addEventListener('pointercancel', onPointerUp, { passive: true });
    this.removePinchListeners = () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }

  private suspendCameraFollow(): void {
    this.cameraResumeTimer?.remove(false);
    this.cameraResumeTimer = undefined;
    this.cameras.main.stopFollow();
  }

  private scheduleCameraFollow(): void {
    this.cameraResumeTimer?.remove(false);
    this.cameraResumeTimer = this.time.delayedCall(2_200, () => this.resumeCameraFollow());
  }

  private resumeCameraFollow(): void {
    if (!this.cameraAnchor) return;
    this.cameraResumeTimer = undefined;
    this.cameras.main.startFollow(this.cameraAnchor, true, 0.055, 0.055);
  }

  private bindHiDpiResize(): void {
    const host = document.getElementById('game-root');
    if (!host || typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const width = Math.max(1, Math.round(entry.contentRect.width * RENDER_DENSITY));
      const height = Math.max(1, Math.round(entry.contentRect.height * RENDER_DENSITY));
      if (this.scale.width === width && this.scale.height === height) return;
      this.scale.resize(width, height);
    });
    this.resizeObserver.observe(host);
  }
}
