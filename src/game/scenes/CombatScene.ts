import Phaser from 'phaser';
import { chooseEnemyCommand } from '../../domain/combat/ai';
import {
  createCombatState,
  executeCommand,
  getAttackPreview,
  getLivingShips,
} from '../../domain/combat/combatEngine';
import { BATTLEFIELD_HEIGHT, BATTLEFIELD_WIDTH } from '../../domain/combat/constants';
import { WEAPONS } from '../../domain/combat/content';
import { angleBetween, distance } from '../../domain/combat/math';
import type {
  AttackPreview,
  CombatCommand,
  CombatEvent,
  CombatState,
  CommandResult,
  ShipState,
  Vector2,
  WeaponKind,
} from '../../domain/combat/types';
import { ShipView } from '../presentation/ShipView';
import { weaponOrigins } from '../presentation/shipPresentation';
import { CombatHud } from '../../ui/CombatHud';
import type { ActionMode } from '../../ui/CombatHud';
import { getStarterShipId } from '../../app/starterSelection';

interface PendingMove {
  readonly type: 'move' | 'rotate';
  readonly destination: Vector2;
  facing: number;
}

export class CombatScene extends Phaser.Scene {
  private combatState!: CombatState;
  private selectedShipId: string = getStarterShipId();
  private targetShipId?: string;
  private mode?: ActionMode;
  private pending?: PendingMove;
  private preview?: AttackPreview;
  private busy = false;
  private hud!: CombatHud;
  private overlay!: Phaser.GameObjects.Graphics;
  private vfx!: Phaser.GameObjects.Graphics;
  private baseCameraZoom = 0.39;
  private cameraZoomFactor = 1;
  private readonly shipViews = new Map<string, ShipView>();

  public constructor() {
    super('combat');
  }

  public create(): void {
    this.layoutCamera();
    this.cameras.main.setBackgroundColor('#05070c');
    this.createBattlefield();
    this.overlay = this.add.graphics().setDepth(10);
    this.vfx = this.add.graphics().setDepth(40);
    this.combatState = createCombatState(0x51a7c0de, getStarterShipId());
    this.createShipViews();
    this.hud = new CombatHud({
      onAction: (action) => this.handleAction(action),
      onEndTurn: () => void this.runEnemyTurn(),
      onConfirm: () => void this.confirmAction(),
      onCancel: () => this.cancelAction(),
      onRestart: () => this.restartBattle(),
      onZoom: (direction) => this.adjustCameraZoom(direction),
      onZoomReset: () => this.resetCameraZoom(),
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer));
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.handlePointerMove(pointer));
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _objects: unknown, _deltaX: number, deltaY: number) => {
      this.adjustCameraZoom(deltaY > 0 ? -1 : 1);
    });
    this.scale.on('resize', this.layoutCamera, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.layoutCamera, this));
    this.refresh();
    this.hud.toast('Wähle ein Schiff oder plane direkt seine erste Bewegung.');
    const shell = document.getElementById('game-shell');
    shell?.setAttribute('aria-busy', 'false');
    if (shell) shell.dataset.gameReady = 'true';
  }

  private createBattlefield(): void {
    this.add
      .image(BATTLEFIELD_WIDTH / 2, BATTLEFIELD_HEIGHT / 2, 'battlefield-nebula-v1')
      .setDisplaySize(BATTLEFIELD_WIDTH * 1.28, BATTLEFIELD_HEIGHT * 1.16)
      .setDepth(-30);

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

  private layoutCamera(): void {
    const width = this.scale.width || 390;
    const height = this.scale.height || 844;
    const topInset = 62;
    const hudHeight = Math.max(218, Math.min(270, height * 0.27));
    const viewportHeight = Math.max(300, height - topInset - hudHeight);
    this.cameras.main.setViewport(0, topInset, width, viewportHeight);
    this.baseCameraZoom = Math.min(width / BATTLEFIELD_WIDTH, viewportHeight / BATTLEFIELD_HEIGHT);
    this.cameras.main.setZoom(this.baseCameraZoom * this.cameraZoomFactor);
    this.cameras.main.centerOn(BATTLEFIELD_WIDTH / 2, BATTLEFIELD_HEIGHT / 2);
    this.hud?.setZoom(this.cameraZoomFactor);
  }

  private adjustCameraZoom(direction: number): void {
    if (this.busy) return;
    this.cameraZoomFactor = Phaser.Math.Clamp(this.cameraZoomFactor + direction * 0.1, 0.8, 1.4);
    this.layoutCamera();
  }

  private resetCameraZoom(): void {
    this.cameraZoomFactor = 1;
    this.layoutCamera();
  }

  private createShipViews(): void {
    for (const ship of Object.values(this.combatState.ships)) {
      this.shipViews.set(ship.id, new ShipView(this, ship));
    }
  }

  private handleAction(action: ActionMode | 'shield'): void {
    if (this.busy || this.combatState.phase !== 'player') return;
    if (action === 'shield') {
      void this.applyCommand({ type: 'reinforce-shield', shipId: this.selectedShipId });
      return;
    }
    this.mode = this.mode === action ? undefined : action;
    this.pending = undefined;
    this.preview = undefined;
    this.targetShipId = undefined;
    const instructions: Record<ActionMode, string> = {
      move: 'Ziel antippen und um das Ghost-Schiff ziehen, um Facing zu setzen.',
      rotate: 'Richtung um das Schiff antippen und bestätigen.',
      broadside: 'Ein Ziel im linken oder rechten Feuerbogen wählen.',
      lance: 'Ein Ziel im violetten Frontbogen wählen.',
      torpedo: 'Ein Ziel im orangenen Frontbogen wählen.',
    };
    if (this.mode) this.hud.toast(instructions[this.mode]);
    this.refresh();
  }

  private pointerWorld(pointer: Phaser.Input.Pointer): Vector2 {
    return { x: pointer.worldX, y: pointer.worldY };
  }

  private findShipAt(point: Vector2): ShipState | undefined {
    return Object.values(this.combatState.ships)
      .filter((ship) => ship.alive)
      .find((ship) => distance(point, ship.position) <= ship.radius * 1.8);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.busy || this.combatState.phase !== 'player' || this.combatState.status !== 'active') return;
    const point = this.pointerWorld(pointer);
    const hit = this.findShipAt(point);
    if (hit) {
      if (hit.team === 'player' && !this.mode) {
        this.selectedShipId = hit.id;
        this.targetShipId = undefined;
        this.preview = undefined;
        this.refresh();
        this.hud.toast(`${hit.name} ausgewählt.`);
        return;
      }
      if (hit.team === 'enemy' && this.isWeaponMode(this.mode)) {
        this.selectAttackTarget(hit, this.mode);
        return;
      }
    }

    const selected = this.combatState.ships[this.selectedShipId];
    if (this.mode === 'move') {
      const facing = this.pending?.facing ?? selected.facing;
      const command: CombatCommand = {
        type: 'move',
        shipId: selected.id,
        destination: point,
        facing,
      };
      const validation = executeCommand(this.combatState, command);
      if (validation.error) {
        this.hud.toast(this.translateError(validation.error));
        return;
      }
      this.pending = { type: 'move', destination: point, facing };
      this.refresh();
      return;
    }
    if (this.mode === 'rotate') {
      this.pending = {
        type: 'rotate',
        destination: selected.position,
        facing: angleBetween(selected.position, point),
      };
      this.refresh();
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!pointer.isDown || !this.pending || this.busy) return;
    const point = this.pointerWorld(pointer);
    if (distance(this.pending.destination, point) < 25) return;
    this.pending.facing = angleBetween(this.pending.destination, point);
    this.refresh();
  }

  private selectAttackTarget(target: ShipState, weapon: WeaponKind): void {
    this.targetShipId = target.id;
    this.preview = getAttackPreview(this.combatState, this.selectedShipId, target.id, weapon);
    if (!this.preview.valid) this.hud.toast(this.translateError(this.preview.reason ?? 'Invalid attack.'));
    else this.hud.toast('Prognose prüfen und FEUERN bestätigen.');
    this.refresh();
  }

  private isWeaponMode(mode?: ActionMode): mode is WeaponKind {
    return mode === 'broadside' || mode === 'lance' || mode === 'torpedo';
  }

  private async confirmAction(): Promise<void> {
    if (this.pending) {
      const command: CombatCommand =
        this.pending.type === 'move'
          ? {
              type: 'move',
              shipId: this.selectedShipId,
              destination: this.pending.destination,
              facing: this.pending.facing,
            }
          : { type: 'rotate', shipId: this.selectedShipId, facing: this.pending.facing };
      await this.applyCommand(command);
      return;
    }
    if (this.preview?.valid && this.targetShipId && this.isWeaponMode(this.mode)) {
      await this.applyCommand({
        type: 'attack',
        shipId: this.selectedShipId,
        targetId: this.targetShipId,
        weapon: this.mode,
      });
    }
  }

  private cancelAction(): void {
    this.mode = undefined;
    this.pending = undefined;
    this.preview = undefined;
    this.targetShipId = undefined;
    this.refresh();
  }

  private async applyCommand(command: CombatCommand): Promise<boolean> {
    const result = executeCommand(this.combatState, command);
    if (result.error) {
      this.hud.toast(this.translateError(result.error));
      return false;
    }
    this.busy = true;
    this.refresh();
    this.combatState = result.state;
    await this.animateEvents(result);
    this.mode = undefined;
    this.pending = undefined;
    this.preview = undefined;
    if (command.type !== 'attack') this.targetShipId = undefined;
    this.busy = false;
    this.refresh();
    return true;
  }

  private async animateEvents(result: CommandResult): Promise<void> {
    for (const event of result.events) {
      await this.animateEvent(event);
    }
  }

  private async animateEvent(event: CombatEvent): Promise<void> {
    switch (event.type) {
      case 'ship-moved': {
        const view = this.shipViews.get(event.shipId);
        if (!view) return;
        await this.tween({ targets: view, x: event.to.x, y: event.to.y, rotation: event.facing, duration: 420 });
        return;
      }
      case 'ship-rotated': {
        const view = this.shipViews.get(event.shipId);
        if (view) await this.tween({ targets: view, rotation: event.facing, duration: 220 });
        return;
      }
      case 'attack-resolved':
        await this.animateAttack(event);
        this.hud.toast(
          event.intercepted
            ? 'Torpedo abgefangen.'
            : !event.hit
              ? 'Angriff verfehlt.'
              : `${event.shieldDamage} Schild · ${event.hullDamage} Hülle`,
        );
        return;
      case 'shield-reinforced': {
        const view = this.shipViews.get(event.shipId);
        if (view) await this.tween({ targets: view, alpha: 0.55, yoyo: true, repeat: 2, duration: 100 });
        this.hud.toast(`Schild um ${event.amount} verstärkt.`);
        return;
      }
      case 'ship-destroyed':
        await this.animateExplosion(event.shipId);
        return;
      case 'phase-changed':
      case 'combat-ended':
        return;
    }
  }

  private async animateAttack(event: Extract<CombatEvent, { type: 'attack-resolved' }>): Promise<void> {
    const attacker = this.shipViews.get(event.shipId);
    const target = this.shipViews.get(event.targetId);
    if (!attacker || !target) return;
    const attackerState = this.combatState.ships[event.shipId];
    const targetState = this.combatState.ships[event.targetId];
    const origins = weaponOrigins(attackerState, targetState.position, event.weapon);
    if (event.weapon === 'torpedo') {
      const origin = origins[0];
      const launch = this.add.circle(origin.x, origin.y, 11, 0xffd098, 0.82).setDepth(42);
      await this.tween({ targets: launch, scale: 2.1, alpha: 0, duration: 110 });
      launch.destroy();
      const glow = this.add.circle(0, 0, 13, 0xff8f3e, 0.32).setBlendMode(Phaser.BlendModes.ADD);
      const core = this.add.circle(0, 0, 6, 0xfff1c6, 1);
      const projectile = this.add.container(origin.x, origin.y, [glow, core]).setDepth(41);
      const trail = this.add
        .line(0, 0, origin.x, origin.y, target.x, target.y, 0xffc879, 0.2)
        .setOrigin(0)
        .setDepth(39);
      await this.tween({ targets: projectile, x: target.x, y: target.y, duration: 430, ease: 'Sine.In' });
      projectile.destroy(true);
      trail.destroy();
    } else {
      this.vfx.clear();
      const color = event.weapon === 'lance' ? 0xd76dff : 0xff9d4c;
      const flashes = origins.map((origin) =>
        this.add.circle(origin.x, origin.y, event.weapon === 'lance' ? 15 : 9, color, 0.82).setDepth(42),
      );
      await Promise.all(
        flashes.map((flash) => this.tween({ targets: flash, scale: 1.8, alpha: 0.25, duration: event.weapon === 'lance' ? 150 : 80 })),
      );
      this.vfx.lineStyle(event.weapon === 'lance' ? 10 : 6, color, 0.22);
      this.vfx.lineBetween(origins[0].x, origins[0].y, target.x, target.y);
      this.vfx.lineStyle(event.weapon === 'lance' ? 4 : 2, color, 1);
      if (event.weapon === 'broadside') {
        for (const [index, origin] of origins.entries()) {
          const spread = (index - (origins.length - 1) / 2) * 8;
          this.vfx.lineBetween(origin.x, origin.y, target.x + spread, target.y - spread * 0.35);
        }
      } else {
        this.vfx.lineBetween(origins[0].x, origins[0].y, target.x, target.y);
      }
      await this.tween({ targets: this.vfx, alpha: 0, duration: 280 });
      this.vfx.setAlpha(1).clear();
      for (const flash of flashes) flash.destroy();
    }
    if (event.hit && !event.intercepted) {
      const impactColor = event.shieldDamage > 0 ? 0x5ab6ff : 0xff9d4c;
      const impact = this.add.circle(target.x, target.y, 22, impactColor, 0.72).setDepth(42);
      const ripple = this.add.circle(target.x, target.y, 26, 0x000000, 0).setStrokeStyle(5, impactColor, 0.9).setDepth(43);
      await Promise.all([
        this.tween({ targets: impact, scale: 2.2, alpha: 0, duration: 240 }),
        this.tween({ targets: ripple, scale: 2.8, alpha: 0, duration: 330 }),
      ]);
      impact.destroy();
      ripple.destroy();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.cameras.main.shake(90, 0.0045);
    }
  }

  private async animateExplosion(shipId: string): Promise<void> {
    const view = this.shipViews.get(shipId);
    if (!view) return;
    const blast = this.add.circle(view.x, view.y, 28, 0xff9d4c, 0.9).setDepth(45);
    await Promise.all([
      this.tween({ targets: blast, scale: 4, alpha: 0, duration: 440 }),
      this.tween({ targets: view, alpha: 0, scale: 0.65, duration: 420 }),
    ]);
    blast.destroy();
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.tweens.add({ ...config, duration: 1 });
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.tweens.add({ ...config, onComplete: () => resolve() });
    });
  }

  private async runEnemyTurn(): Promise<void> {
    if (this.busy || this.combatState.phase !== 'player' || this.combatState.status !== 'active') return;
    this.cancelAction();
    await this.applyCommand({ type: 'end-turn' });
    if (this.combatState.status !== 'active') return;
    for (const enemy of getLivingShips(this.combatState, 'enemy')) {
      for (let step = 0; step < 2; step += 1) {
        const command = chooseEnemyCommand(this.combatState, enemy.id);
        if (!command) break;
        const succeeded = await this.applyCommand(command);
        if (!succeeded || this.combatState.status !== 'active') return;
        await new Promise((resolve) => window.setTimeout(resolve, 90));
      }
    }
    await this.applyCommand({ type: 'end-turn' });
    const nextSelected = getLivingShips(this.combatState, 'player')[0];
    if (nextSelected && !this.combatState.ships[this.selectedShipId]?.alive) this.selectedShipId = nextSelected.id;
    this.hud.toast('Deine Flotte ist wieder am Zug.');
    this.refresh();
  }

  private restartBattle(): void {
    this.hud.closeResult();
    this.combatState = createCombatState(0x51a7c0de, getStarterShipId());
    this.selectedShipId = getStarterShipId();
    this.targetShipId = undefined;
    this.mode = undefined;
    this.pending = undefined;
    this.preview = undefined;
    this.busy = false;
    for (const view of this.shipViews.values()) view.setAlpha(1).setScale(1);
    this.refresh();
    this.hud.toast('Mission neu gestartet.');
  }

  private refresh(): void {
    const selected = this.combatState.ships[this.selectedShipId] ?? getLivingShips(this.combatState, 'player')[0];
    if (!selected) return;
    const target = this.targetShipId ? this.combatState.ships[this.targetShipId] : undefined;
    for (const [id, view] of this.shipViews) {
      view.sync(this.combatState.ships[id], id === selected.id, id === target?.id, !this.busy);
    }
    this.drawOverlays(selected);
    this.hud?.update({
      state: this.combatState,
      selected,
      target,
      preview: this.preview,
      mode: this.mode,
      hasPendingAction: Boolean(this.pending || this.preview?.valid),
      busy: this.busy,
    });
  }

  private drawOverlays(selected: ShipState): void {
    this.overlay.clear();
    if (this.mode === 'move' || this.pending?.type === 'move') {
      this.overlay.fillStyle(0x4fa9ec, 0.08);
      this.overlay.lineStyle(4, 0x5ab6ff, 0.45);
      this.overlay.fillCircle(selected.position.x, selected.position.y, selected.moveRange);
      this.overlay.strokeCircle(selected.position.x, selected.position.y, selected.moveRange);
    }
    if (this.isWeaponMode(this.mode)) {
      const weapon = WEAPONS[this.mode];
      const color = this.mode === 'lance' ? 0xd46dff : this.mode === 'torpedo' ? 0xff9d4c : 0x5ab6ff;
      if (weapon.arc === 'front') {
        this.drawArc(selected.position, selected.facing, weapon.range, weapon.halfAngle, color);
      } else {
        this.drawArc(selected.position, selected.facing - Math.PI / 2, weapon.range, weapon.halfAngle, color);
        this.drawArc(selected.position, selected.facing + Math.PI / 2, weapon.range, weapon.halfAngle, color);
      }
    }
    if (this.pending) {
      const from = selected.position;
      const to = this.pending.destination;
      this.overlay.lineStyle(5, 0x82d5ff, 0.8);
      this.overlay.lineBetween(from.x, from.y, to.x, to.y);
      this.overlay.fillStyle(0x78e39a, 0.2);
      this.overlay.fillCircle(to.x, to.y, selected.radius * 1.35);
      this.overlay.lineStyle(5, 0x78e39a, 0.9);
      this.overlay.strokeCircle(to.x, to.y, selected.radius * 1.38);
      const arrowLength = selected.radius * 2.1;
      this.overlay.lineBetween(
        to.x,
        to.y,
        to.x + Math.cos(this.pending.facing) * arrowLength,
        to.y + Math.sin(this.pending.facing) * arrowLength,
      );
      if (this.pending.type === 'move') {
        this.drawArc(to, this.pending.facing, WEAPONS.lance.range, WEAPONS.lance.halfAngle, 0xd46dff, 0.035);
      }
    }
  }

  private drawArc(
    origin: Vector2,
    facing: number,
    range: number,
    halfAngle: number,
    color: number,
    alpha = 0.09,
  ): void {
    this.overlay.fillStyle(color, alpha);
    this.overlay.lineStyle(3, color, 0.38);
    this.overlay.beginPath();
    this.overlay.moveTo(origin.x, origin.y);
    this.overlay.arc(origin.x, origin.y, range, facing - halfAngle, facing + halfAngle, false);
    this.overlay.closePath();
    this.overlay.fillPath();
    this.overlay.strokePath();
  }

  private translateError(error: string): string {
    const translations: Record<string, string> = {
      'Not enough AP.': 'Nicht genügend AP.',
      'Not enough Energy.': 'Nicht genügend Energie.',
      'Target is outside weapon range.': 'Ziel außerhalb der Waffenreichweite.',
      'Target is outside the weapon arc.': 'Ziel außerhalb des Feuerbogens.',
      'Destination is outside movement range.': 'Ziel außerhalb der Bewegungsreichweite.',
      'Destination is outside the battlefield.': 'Ziel außerhalb des Schlachtfelds.',
      'Shield is already at maximum strength.': 'Schild bereits vollständig geladen.',
    };
    return translations[error] ?? error;
  }
}
