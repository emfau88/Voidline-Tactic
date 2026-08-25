import Phaser from 'phaser';
import { getProfile, subscribe } from '../../app/gameFlow';
import { FACILITIES, type FacilityId } from '../../domain/outpost/types';
import { FIRST_FIELD_UPGRADE_ID, SECOND_FIELD_UPGRADE_ID } from '../../domain/ship/types';

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
  private readonly setInteractionLock = (locked: boolean): void => { this.input.enabled = !locked; };

  public constructor() { super('outpost'); }

  public create(): void {
    this.scale.on('resize', this.draw, this);
    this.game.events.on('farhaven:outpost-interaction-lock', this.setInteractionLock);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.draw, this);
      this.game.events.off('farhaven:outpost-interaction-lock', this.setInteractionLock);
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
    const unit = Math.min(width / 1540, height / 790);
    const center: Point = { x: width * 0.5, y: height * 0.51 };
    // Farhaven starts as a command core, not a finished ring station. Every room
    // is positioned from the same collar-to-collar bridge measurement below.
    const coreWidth = 214 * unit;
    const coreHeight = 214 * unit;
    const bridgeLength = 58 * unit;
    const scannerSize = 164 * unit;
    const laborSize = 170 * unit;
    const hangarWidth = 196 * unit;
    const hangarHeight = 148 * unit;
    const navigationSize = 166 * unit;

    this.tweens.killAll();
    this.children.removeAll();
    this.cameras.main.setBackgroundColor('#050911');
    this.drawSpace(width, height, unit);

    const layouts: ModuleLayout[] = [
      { id: 'scanner', x: center.x, y: center.y - coreHeight / 2 - bridgeLength - scannerSize / 2, width: scannerSize, height: scannerSize, accent: MODULE_ACCENTS.scanner },
      { id: 'labor', x: center.x - coreWidth / 2 - bridgeLength - laborSize / 2, y: center.y, width: laborSize, height: laborSize, accent: MODULE_ACCENTS.labor },
      { id: 'hangar', x: center.x + coreWidth / 2 + bridgeLength + hangarWidth / 2, y: center.y, width: hangarWidth, height: hangarHeight, accent: MODULE_ACCENTS.hangar },
      { id: 'navigation', x: center.x, y: center.y + coreHeight / 2 + bridgeLength + navigationSize / 2, width: navigationSize, height: navigationSize, accent: MODULE_ACCENTS.navigation },
    ];

    const graphics = this.add.graphics();
    for (const layout of layouts) {
      const built = profile.facilities[layout.id] > 0;
      this.drawConnector(graphics, center, layout, coreWidth, coreHeight, built || layout.id === guidedFacility, built);
    }
    this.drawCore(graphics, center, coreWidth, coreHeight, unit);
    for (const layout of layouts) {
      const built = profile.facilities[layout.id] > 0;
      const guided = layout.id === guidedFacility;
      this.drawModule(graphics, layout, built, guided);
      this.addModuleLabel(layout, built, guided, unit);
      this.addModuleTarget(layout);
    }

    this.add.text(center.x, center.y + coreHeight * 0.63, 'FARHAVEN · KERNPLATTE', {
      fontFamily: 'Arial', fontSize: Math.max(8, 9 * unit), color: '#e9d6ac', fontStyle: 'bold', letterSpacing: 1.3,
    }).setOrigin(0.5);
  }

  private drawSpace(width: number, height: number, unit: number): void {
    const space = this.add.graphics();
    space.fillStyle(0x050911, 1);
    space.fillRect(0, 0, width, height);
    const nebula = this.add.graphics();
    nebula.fillStyle(0x17364a, 0.11);
    nebula.fillEllipse(width * 0.09, height * 0.28, 420 * unit, 230 * unit);
    nebula.fillStyle(0x43284b, 0.08);
    nebula.fillEllipse(width * 0.88, height * 0.72, 360 * unit, 240 * unit);
    for (let index = 0; index < 46; index += 1) {
      const x = ((index * 137) % 997) / 997 * width;
      const y = ((index * 271 + 89) % 773) / 773 * height;
      const radius = Math.max(1, ((index % 3) + 1) * unit * 0.75);
      const color = index % 9 === 0 ? 0xe7c06c : index % 5 === 0 ? 0x6ebed0 : 0x9ab7c7;
      this.add.circle(x, y, radius, color, index % 9 === 0 ? 0.68 : 0.42);
    }
  }

  private drawCore(graphics: Phaser.GameObjects.Graphics, center: Point, width: number, height: number, unit: number): void {
    graphics.fillStyle(0x5fcce2, .1);
    graphics.fillCircle(center.x, center.y, width * .52);
    this.add.image(center.x, center.y, 'farhaven-core-v2').setDisplaySize(width, height).setAlpha(.94);
  }

  private drawConnector(graphics: Phaser.GameObjects.Graphics, center: Point, layout: ModuleLayout, coreWidth: number, coreHeight: number, visible: boolean, built: boolean): void {
    if (!visible) return;
    const horizontal = Math.abs(layout.x - center.x) > Math.abs(layout.y - center.y);
    const start: Point = horizontal
      ? { x: center.x + Math.sign(layout.x - center.x) * coreWidth / 2, y: center.y }
      : { x: center.x, y: center.y + Math.sign(layout.y - center.y) * coreHeight / 2 };
    const end: Point = horizontal
      ? { x: layout.x - Math.sign(layout.x - center.x) * layout.width / 2, y: layout.y }
      : { x: layout.x, y: layout.y - Math.sign(layout.y - center.y) * layout.height / 2 };
    // Generated cut-outs carry transparent breathing room around their visible
    // metal. Extend the corridor into that padding so it reads as bolted to both
    // pieces rather than as a floating UI line between rectangles.
    const direction = horizontal ? Math.sign(layout.x - center.x) : Math.sign(layout.y - center.y);
    const overlap = Math.max(8, Math.min(layout.width, layout.height) * .14);
    const visualStart: Point = horizontal ? { x: start.x - direction * overlap, y: start.y } : { x: start.x, y: start.y - direction * overlap };
    const visualEnd: Point = horizontal ? { x: end.x + direction * overlap, y: end.y } : { x: end.x, y: end.y + direction * overlap };
    const thickness = Math.max(12, Math.min(layout.width, layout.height) * .16);
    const length = horizontal ? Math.abs(visualEnd.x - visualStart.x) : Math.abs(visualEnd.y - visualStart.y);
    const left = horizontal ? Math.min(visualStart.x, visualEnd.x) : visualStart.x - thickness / 2;
    const top = horizontal ? visualStart.y - thickness / 2 : Math.min(visualStart.y, visualEnd.y);
    const corridorWidth = horizontal ? length : thickness;
    const corridorHeight = horizontal ? thickness : length;
    graphics.fillStyle(0x111a21, .98);
    graphics.fillRoundedRect(left, top, corridorWidth, corridorHeight, thickness * .16);
    graphics.lineStyle(Math.max(1, thickness * .07), 0x465158, built ? .72 : .32);
    graphics.strokeRoundedRect(left, top, corridorWidth, corridorHeight, thickness * .16);
    const lightSize = Math.max(2, thickness * .14);
    graphics.fillStyle(built ? 0xd5ad68 : 0x52727d, built ? .7 : .26);
    for (const fraction of [.28, .72]) {
      const lightX = horizontal ? left + corridorWidth * fraction : left + corridorWidth / 2;
      const lightY = horizontal ? top + corridorHeight / 2 : top + corridorHeight * fraction;
      graphics.fillRect(lightX - lightSize / 2, lightY - lightSize / 2, lightSize, lightSize);
    }
  }

  private drawModule(graphics: Phaser.GameObjects.Graphics, layout: ModuleLayout, built: boolean, guided: boolean): void {
    if (!built && !guided) return;
    const { id, x, y, width, height } = layout;
    if (built) {
      graphics.fillStyle(0x03080d, .42);
      graphics.fillEllipse(x, y + height * .12, width * .82, height * .4);
    }
    const spriteSize = Math.max(width, height) * 1.02;
    const module = this.add.image(x, y, 'farhaven-module-kit-v2', this.moduleFrame(id)).setDisplaySize(spriteSize, spriteSize).setAlpha(built ? .94 : .16);
    if (id === 'hangar') module.setFlipX(true);
  }

  private moduleFrame(id: FacilityId): number {
    return id === 'hangar' ? 0 : id === 'scanner' ? 1 : id === 'labor' ? 2 : 3;
  }

  private addModuleLabel(layout: ModuleLayout, built: boolean, guided: boolean, unit: number): void {
    if (!built && !guided) return;
    const facility = FACILITIES[layout.id];
    const labelY = layout.id === 'scanner' ? layout.y - layout.height * 0.72 : layout.y + layout.height * 0.72;
    const state = built ? 'ANTIPPEN · ÖFFNEN' : `ANTIPPEN · BAUEN · ${this.compactCost(layout.id)}`;
    const prefix = guided ? 'NÄCHSTER SCHRITT\n' : '';
    const label = this.add.text(layout.x, labelY, `${prefix}${facility.name.toUpperCase()}\n${state}`, {
      fontFamily: 'Arial', fontSize: Math.max(8, 9 * unit), color: guided ? '#ffe0a0' : built ? '#f3e2bd' : '#b7d2da', fontStyle: 'bold', align: 'center', lineSpacing: Math.max(1, 2 * unit),
    }).setOrigin(0.5);
    label.setAlpha(built || guided ? 1 : 0.78);
  }

  private compactCost(id: FacilityId): string {
    return Object.entries(FACILITIES[id].cost)
      .map(([kind, amount]) => `${amount} ${kind === 'alloys' ? 'LEG' : kind === 'data' ? 'DAT' : 'REL'}`)
      .join(' · ');
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
    const upgrades = profile.ship?.upgrades ?? [];
    if (!upgrades.includes(FIRST_FIELD_UPGRADE_ID) || !upgrades.includes(SECOND_FIELD_UPGRADE_ID)) return 'hangar';
    if (!profile.facilities.scanner) return 'scanner';
    if (!profile.facilities.labor) return 'labor';
    if (!profile.facilities.navigation) return 'navigation';
    return undefined;
  }

}
