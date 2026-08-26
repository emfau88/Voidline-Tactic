import Phaser from 'phaser';
import { getProfile, subscribe } from '../../app/gameFlow';
import { canUpgrade } from '../../domain/outpost/outpostEngine';
import { FACILITIES, type FacilityId } from '../../domain/outpost/types';
import { SHIP_VARIANTS } from '../../domain/ship/types';

type Point = Readonly<{ x: number; y: number }>;
type ModuleLayout = Readonly<{ id: FacilityId; x: number; y: number; width: number; height: number; accent: number }>;

const MODULE_ACCENTS: Record<FacilityId, number> = {
  hangar: 0xd5ad68,
  scanner: 0x72d9e8,
  labor: 0xc7a0e8,
  navigation: 0x8ed9bd,
};

/** A small state-driven station board: rooms only appear when they have been built. */
export class OutpostScene extends Phaser.Scene {
  private unsubscribe?: () => void;
  private readonly moduleLayouts = new Map<FacilityId, ModuleLayout>();
  private readonly setInteractionLock = (locked: boolean): void => { this.input.enabled = !locked; };
  private readonly animateBuiltFacility = (facilityId: FacilityId): void => this.playDockingAnimation(facilityId);

  public constructor() { super('outpost'); }

  public create(): void {
    this.scale.on('resize', this.draw, this);
    this.game.events.on('farhaven:outpost-interaction-lock', this.setInteractionLock);
    this.game.events.on('farhaven:facility-built', this.animateBuiltFacility);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.draw, this);
      this.game.events.off('farhaven:outpost-interaction-lock', this.setInteractionLock);
      this.game.events.off('farhaven:facility-built', this.animateBuiltFacility);
      this.unsubscribe?.();
    });
    this.unsubscribe = subscribe(() => this.draw());
    this.draw();
  }

  private draw(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const profile = getProfile();
    const guidedFacility = this.guidedFacility();
    // Keep Farhaven the primary navigation object on a landscape phone without
    // returning to the oversized, cropped station from the early prototype.
    const unit = Math.min(width / 1120, height / 600, 1.55);
    const center: Point = { x: width * 0.5, y: height * 0.51 };
    // Positions compensate for transparent padding inside the generated cut-outs.
    // Their painted docking collars touch directly; no debug line or synthetic
    // corridor is required between the assets.
    const coreWidth = 214 * unit;
    const coreHeight = 214 * unit;
    const scannerSize = 164 * unit;
    const laborSize = 170 * unit;
    const hangarWidth = 196 * unit;
    const hangarHeight = 148 * unit;
    const navigationSize = 166 * unit;

    this.tweens.killAll();
    this.children.removeAll();
    this.cameras.main.setBackgroundColor('#050911');
    this.drawSpace(width, height);

    const layouts: ModuleLayout[] = [
      { id: 'scanner', x: center.x, y: center.y - 140 * unit, width: scannerSize, height: scannerSize, accent: MODULE_ACCENTS.scanner },
      { id: 'labor', x: center.x - 151 * unit, y: center.y, width: laborSize, height: laborSize, accent: MODULE_ACCENTS.labor },
      { id: 'hangar', x: center.x + 174 * unit, y: center.y, width: hangarWidth, height: hangarHeight, accent: MODULE_ACCENTS.hangar },
      { id: 'navigation', x: center.x, y: center.y + 138 * unit, width: navigationSize, height: navigationSize, accent: MODULE_ACCENTS.navigation },
    ];
    this.moduleLayouts.clear();
    for (const layout of layouts) this.moduleLayouts.set(layout.id, layout);

    const graphics = this.add.graphics();
    this.drawCore(center, coreWidth, coreHeight);
    for (const layout of layouts) {
      const built = profile.facilities[layout.id] > 0;
      const guided = layout.id === guidedFacility;
      const buildReady = guided && canUpgrade(profile, layout.id);
      this.drawModule(graphics, layout, built, guided, buildReady);
      this.addModuleLabel(layout, built, guided, buildReady, unit);
      this.addModuleTarget(layout);
    }
    this.addDockedShip(center, layouts.find((layout) => layout.id === 'hangar')!, unit);

  }

  private drawSpace(width: number, height: number): void {
    const texture = this.textures.get('farhaven-space-v1').getSourceImage() as HTMLImageElement;
    const scale = Math.max(width / texture.width, height / texture.height);
    this.add.image(width / 2, height / 2, 'farhaven-space-v1')
      .setDisplaySize(texture.width * scale, texture.height * scale)
      .setAlpha(.82);
    const veil = this.add.graphics();
    veil.fillStyle(0x02060b, .16);
    veil.fillRect(0, 0, width, height);
  }

  private drawCore(center: Point, width: number, height: number): void {
    this.add.image(center.x, center.y, 'farhaven-core-v2').setDisplaySize(width, height).setAlpha(.94);
  }

  /** The chosen hull exists before a hangar: it starts at Farhaven's temporary emergency berth. */
  private addDockedShip(center: Point, hangar: ModuleLayout, unit: number): void {
    const ship = getProfile().ship;
    if (!ship) return;
    const inHangar = getProfile().facilities.hangar > 0;
    const position = inHangar
      ? { x: hangar.x - hangar.width * .1, y: hangar.y + hangar.height * .03 }
      : { x: center.x + 76 * unit, y: center.y + 92 * unit };
    const berth = this.add.graphics().setDepth(5);
    if (!inHangar) {
      berth.lineStyle(Math.max(1, unit * 2), 0x8cdae4, .64);
      berth.lineBetween(center.x + 53 * unit, center.y + 66 * unit, position.x - 14 * unit, position.y - 11 * unit);
      berth.lineBetween(center.x + 72 * unit, center.y + 72 * unit, position.x + 14 * unit, position.y + 11 * unit);
      berth.fillStyle(0xf1c56f, .82); berth.fillCircle(position.x - 13 * unit, position.y - 11 * unit, Math.max(1.6, unit * 3));
      berth.fillCircle(position.x + 13 * unit, position.y + 11 * unit, Math.max(1.6, unit * 3));
    }
    const craft = this.add.image(position.x, position.y, SHIP_VARIANTS[ship.variant].assetKey)
      .setName('farhaven-player-ship')
      .setDisplaySize(76 * unit, 76 * unit)
      .setDepth(6)
      .setRotation(inHangar ? 0 : -.34);
    if (!inHangar) {
      this.add.text(position.x, position.y + 46 * unit, `NOTDOCK · ${SHIP_VARIANTS[ship.variant].name.toUpperCase()}`, {
        fontFamily: 'Arial', fontSize: Math.max(6, 7 * unit), color: '#c6edf1', fontStyle: 'bold', letterSpacing: Math.max(.15, unit * .45),
      }).setOrigin(.5).setDepth(7);
    }
  }

  private drawModule(graphics: Phaser.GameObjects.Graphics, layout: ModuleLayout, built: boolean, guided: boolean, buildReady: boolean): void {
    const { id, x, y, width, height } = layout;
    if (built) {
      graphics.fillStyle(0x03080d, .42);
      graphics.fillEllipse(x, y + height * .12, width * .82, height * .4);
    }
    const spriteSize = Math.max(width, height) * 1.02;
    const module = this.add.image(x, y, 'farhaven-module-kit-v2', this.moduleFrame(id))
      .setName(`farhaven-module-${id}`)
      .setDisplaySize(spriteSize, spriteSize)
      .setAlpha(built ? .96 : buildReady ? .5 : guided ? .37 : .26);
    if (id === 'hangar') module.setFlipX(true);
    if (!built) module.setTint(buildReady ? 0xffdfa3 : guided ? 0xa4c0c7 : 0x6f8d96);
  }

  private moduleFrame(id: FacilityId): number | string {
    return id === 'hangar' ? 0 : id === 'scanner' ? 'scanner-clean' : id === 'labor' ? 2 : 3;
  }

  private addModuleLabel(layout: ModuleLayout, built: boolean, guided: boolean, buildReady: boolean, unit: number): void {
    if (!built && !guided) return;
    const facility = FACILITIES[layout.id];
    // The upper scanner sits directly below the resource strip on landscape
    // phones. Put its guidance beside the physical module instead of above it.
    const labelX = layout.id === 'scanner' ? layout.x - layout.width * 0.9 : layout.x;
    const labelY = layout.id === 'scanner' ? layout.y : layout.y + layout.height * 0.72;
    const text = built
      ? guided ? `${facility.name.toUpperCase()} · NÄCHSTER SCHRITT\nWERKSTATT ÖFFNEN` : `${facility.name.toUpperCase()}\nANTIPPEN · ÖFFNEN`
      : buildReady ? `${facility.name.toUpperCase()} · BAUBEREIT\nANTIPPEN · ERRICHTEN` : guided ? `NÄCHSTER AUSBAU · ${facility.name.toUpperCase()}\nANTIPPEN · KOSTEN ANSEHEN` : '';
    const label = this.add.text(labelX, labelY, text, {
      fontFamily: 'Arial', fontSize: Math.max(8, 9 * unit), color: buildReady || guided && built ? '#ffe0a0' : built ? '#f3e2bd' : '#9eb5bc', fontStyle: 'bold', align: 'center', lineSpacing: Math.max(1, 2 * unit),
    }).setOrigin(0.5);
    label.setAlpha(built || guided ? 1 : 0.78);
  }

  private addModuleTarget(layout: ModuleLayout): void {
    const target = this.add.zone(layout.x, layout.y, layout.width + 28, layout.height + 28)
      .setInteractive({ useHandCursor: true });
    target.on('pointerover', () => {
      target.setScale(1.035);
      this.game.canvas.style.cursor = 'pointer';
    });
    target.on('pointerout', () => {
      target.setScale(1);
      this.game.canvas.style.cursor = 'default';
    });
    target.on('pointerdown', () => this.game.events.emit('farhaven:facility-selected', layout.id));
  }

  private guidedFacility(): FacilityId | undefined {
    const profile = getProfile();
    if (!profile.facilities.hangar) return 'hangar';
    if (profile.story.routeTraceRecovered && !profile.facilities.navigation) return 'navigation';
    if (!profile.facilities.scanner) return 'scanner';
    if (!profile.facilities.labor) return 'labor';
    if (!profile.facilities.navigation) return 'navigation';
    return undefined;
  }

  private playDockingAnimation(facilityId: FacilityId): void {
    const layout = this.moduleLayouts.get(facilityId);
    const module = this.children.getByName(`farhaven-module-${facilityId}`) as Phaser.GameObjects.Image | null;
    if (!layout || !module) return;
    const horizontal = facilityId === 'hangar' || facilityId === 'labor';
    const direction = facilityId === 'hangar' || facilityId === 'navigation' ? 1 : -1;
    const travel = Math.max(layout.width, layout.height) * .32;
    if (horizontal) module.x += direction * travel; else module.y += direction * travel;
    module.setAlpha(.08).setScale(module.scaleX * .94, module.scaleY * .94);
    this.tweens.add({
      targets: module,
      x: layout.x,
      y: layout.y,
      alpha: .96,
      scaleX: module.scaleX / .94,
      scaleY: module.scaleY / .94,
      duration: 720,
      ease: 'Cubic.Out',
      onComplete: () => {
        const clamp = this.add.circle(layout.x, layout.y, Math.min(layout.width, layout.height) * .32, 0xe4b86c, .18).setDepth(6);
        clamp.setStrokeStyle(2, 0xf3d295, .72);
        this.tweens.add({ targets: clamp, alpha: 0, scale: 1.25, duration: 420, onComplete: () => clamp.destroy() });
      },
    });
    if (facilityId === 'hangar') {
      const craft = this.children.getByName('farhaven-player-ship') as Phaser.GameObjects.Image | null;
      if (craft) {
        const targetX = craft.x; const targetY = craft.y;
        craft.setPosition(layout.x - layout.width * .82, layout.y + layout.height * .04).setAlpha(.15);
        this.tweens.add({ targets: craft, x: targetX, y: targetY, alpha: 1, duration: 880, delay: 160, ease: 'Cubic.InOut' });
      }
    }
  }

}
