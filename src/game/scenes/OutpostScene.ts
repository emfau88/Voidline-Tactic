import Phaser from 'phaser';
import { getProfile, subscribe } from '../../app/gameFlow';
import { FACILITIES, type FacilityId } from '../../domain/outpost/types';

type Point = Readonly<{ x: number; y: number }>;
type ModuleLayout = Readonly<{ id: FacilityId; x: number; y: number; width: number; height: number; accent: number }>;
type FutureSocket = Readonly<{ x: number; y: number; label: string }>;

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
    const unit = Math.min(width / 1500, height / 760);
    const center: Point = { x: width * 0.53, y: height * 0.51 };
    const coreWidth = 198 * unit;
    const coreHeight = 128 * unit;
    const armX = 236 * unit;
    const armY = 138 * unit;

    this.tweens.killAll();
    this.children.removeAll();
    this.cameras.main.setBackgroundColor('#050911');
    this.drawSpace(width, height, unit);

    const board = this.add.graphics();
    const boardWidth = 720 * unit;
    const boardHeight = 520 * unit;
    board.fillStyle(0x07111c, 0.82);
    board.fillRoundedRect(center.x - boardWidth / 2, center.y - boardHeight / 2, boardWidth, boardHeight, 30 * unit);
    board.lineStyle(Math.max(1, 1.4 * unit), 0x2a5b68, 0.52);
    board.strokeRoundedRect(center.x - boardWidth / 2, center.y - boardHeight / 2, boardWidth, boardHeight, 30 * unit);
    this.drawBoardMarks(board, center, boardWidth, boardHeight, unit);

    const layouts: ModuleLayout[] = [
      { id: 'scanner', x: center.x, y: center.y - armY, width: 136 * unit, height: 88 * unit, accent: MODULE_ACCENTS.scanner },
      { id: 'labor', x: center.x - armX, y: center.y, width: 154 * unit, height: 92 * unit, accent: MODULE_ACCENTS.labor },
      { id: 'hangar', x: center.x + armX, y: center.y, width: 182 * unit, height: 104 * unit, accent: MODULE_ACCENTS.hangar },
      { id: 'navigation', x: center.x, y: center.y + armY, width: 146 * unit, height: 92 * unit, accent: MODULE_ACCENTS.navigation },
    ];

    const graphics = this.add.graphics();
    for (const layout of layouts) this.drawConnector(graphics, center, layout, coreWidth, coreHeight, profile.facilities[layout.id] > 0);
    this.drawCore(graphics, center, coreWidth, coreHeight, unit);
    for (const layout of layouts) {
      const built = profile.facilities[layout.id] > 0;
      this.drawModule(graphics, layout, built, unit);
      this.addModuleLabel(layout, built, unit);
      this.addModuleTarget(layout);
    }

    const futureSockets: FutureSocket[] = [
      { x: center.x - armX * .72, y: center.y - armY * .72, label: 'SPÄTER · RAFFINERIE' },
      { x: center.x + armX * .72, y: center.y - armY * .72, label: 'SPÄTER · VERTEIDIGUNG' },
      { x: center.x - armX * .72, y: center.y + armY * .72, label: 'SPÄTER · LAGER' },
      { x: center.x + armX * .72, y: center.y + armY * .72, label: 'SPÄTER · DROHNENHUB' },
    ];
    for (const socket of futureSockets) this.drawFutureSocket(graphics, socket, center, unit);

    this.add.text(center.x, center.y + coreHeight * 0.63, 'FARHAVEN · KERNPLATTE', {
      fontFamily: 'Arial', fontSize: Math.max(8, 9 * unit), color: '#e9d6ac', fontStyle: 'bold', letterSpacing: 1.3,
    }).setOrigin(0.5);
    this.add.text(center.x, center.y - boardHeight * 0.44, 'FARHAVEN · BERÜHRE EINEN ANDOCKPLATZ', {
      fontFamily: 'Arial', fontSize: Math.max(7, 8 * unit), color: '#8ccbd8', fontStyle: 'bold', letterSpacing: 1.05,
    }).setOrigin(0.5).setAlpha(0.9);
  }

  private drawFutureSocket(graphics: Phaser.GameObjects.Graphics, socket: FutureSocket, center: Point, unit: number): void {
    graphics.lineStyle(Math.max(4, 7 * unit), 0x091723, .92);
    graphics.lineBetween(center.x + (socket.x - center.x) * .56, center.y + (socket.y - center.y) * .56, socket.x, socket.y);
    graphics.lineStyle(Math.max(1, unit), 0x4e7582, .5);
    graphics.lineBetween(center.x + (socket.x - center.x) * .56, center.y + (socket.y - center.y) * .56, socket.x, socket.y);
    graphics.fillStyle(0x091722, .84);
    graphics.fillCircle(socket.x, socket.y, Math.max(18, 27 * unit));
    graphics.lineStyle(Math.max(1, 1.2 * unit), 0x4e8191, .58);
    graphics.strokeCircle(socket.x, socket.y, Math.max(18, 27 * unit));
    this.add.text(socket.x, socket.y + Math.max(29, 38 * unit), socket.label, {
      fontFamily: 'Arial', fontSize: Math.max(6, 6.5 * unit), color: '#7894a0', fontStyle: 'bold', align: 'center', letterSpacing: .5,
    }).setOrigin(.5).setAlpha(.78);
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

  private drawBoardMarks(graphics: Phaser.GameObjects.Graphics, center: Point, width: number, height: number, unit: number): void {
    graphics.lineStyle(Math.max(1, unit), 0x28525f, 0.24);
    for (let column = -2; column <= 2; column += 1) {
      const x = center.x + column * width * 0.16;
      graphics.lineBetween(x, center.y - height * 0.44, x, center.y + height * 0.44);
    }
    for (let row = -1; row <= 1; row += 1) {
      const y = center.y + row * height * 0.25;
      graphics.lineBetween(center.x - width * 0.44, y, center.x + width * 0.44, y);
    }
  }

  private drawCore(graphics: Phaser.GameObjects.Graphics, center: Point, width: number, height: number, unit: number): void {
    const x = center.x - width / 2;
    const y = center.y - height / 2;
    graphics.fillStyle(0x0b202c, 1);
    graphics.fillRoundedRect(x, y, width, height, 22 * unit);
    graphics.lineStyle(Math.max(1.5, 2 * unit), 0x73cad5, 0.86);
    graphics.strokeRoundedRect(x, y, width, height, 22 * unit);
    graphics.fillStyle(0x122f3c, 1);
    graphics.fillRoundedRect(x + width * 0.11, y + height * 0.14, width * 0.78, height * 0.72, 14 * unit);
    graphics.lineStyle(Math.max(1, unit), 0x497e89, 0.9);
    graphics.strokeRoundedRect(x + width * 0.11, y + height * 0.14, width * 0.78, height * 0.72, 14 * unit);
    const reactor = this.add.circle(center.x, center.y, 22 * unit, 0xd8ad60, 0.9);
    reactor.setStrokeStyle(Math.max(1, unit), 0xffe0a0, 0.86);
    this.add.circle(center.x, center.y, 10 * unit, 0xffe0a0, 0.72);
    this.tweens.add({ targets: reactor, alpha: { from: 0.58, to: 1 }, scale: { from: 0.92, to: 1.06 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    for (let index = -2; index <= 2; index += 1) {
      if (index === 0) continue;
      graphics.fillStyle(0x78ddeb, 0.76);
      graphics.fillRoundedRect(center.x + index * width * 0.14 - 4 * unit, center.y - height * 0.25, 8 * unit, 13 * unit, 2 * unit);
      graphics.fillRoundedRect(center.x + index * width * 0.14 - 4 * unit, center.y + height * 0.15, 8 * unit, 13 * unit, 2 * unit);
    }
  }

  private drawConnector(graphics: Phaser.GameObjects.Graphics, center: Point, layout: ModuleLayout, coreWidth: number, coreHeight: number, built: boolean): void {
    const horizontal = Math.abs(layout.x - center.x) > Math.abs(layout.y - center.y);
    const start: Point = horizontal
      ? { x: center.x + Math.sign(layout.x - center.x) * coreWidth / 2, y: center.y }
      : { x: center.x, y: center.y + Math.sign(layout.y - center.y) * coreHeight / 2 };
    const end: Point = horizontal
      ? { x: layout.x - Math.sign(layout.x - center.x) * layout.width / 2, y: layout.y }
      : { x: layout.x, y: layout.y - Math.sign(layout.y - center.y) * layout.height / 2 };
    graphics.lineStyle(Math.max(7, Math.min(layout.width, layout.height) * 0.11), 0x091723, 1);
    graphics.lineBetween(start.x, start.y, end.x, end.y);
    graphics.lineStyle(Math.max(1, Math.min(layout.width, layout.height) * 0.025), built ? layout.accent : 0x517282, built ? 0.84 : 0.5);
    graphics.lineBetween(start.x, start.y, end.x, end.y);
    graphics.fillStyle(built ? layout.accent : 0x517282, built ? 0.94 : 0.54);
    graphics.fillCircle(end.x, end.y, Math.max(4, Math.min(layout.width, layout.height) * 0.07));
  }

  private drawModule(graphics: Phaser.GameObjects.Graphics, layout: ModuleLayout, built: boolean, unit: number): void {
    const { id, x, y, width, height, accent } = layout;
    const left = x - width / 2;
    const top = y - height / 2;
    const corner = 13 * unit;
    graphics.fillStyle(built ? 0x102531 : 0x0a151e, built ? 1 : 0.74);
    graphics.fillRoundedRect(left, top, width, height, corner);
    graphics.lineStyle(Math.max(1, 1.5 * unit), built ? accent : 0x4d6674, built ? 0.96 : 0.66);
    graphics.strokeRoundedRect(left, top, width, height, corner);
    if (!built) {
      this.drawBuildSocket(graphics, layout, unit);
      return;
    }
    const spriteSize = Math.min(width, height) * 0.9;
    this.add.image(x, y, 'farhaven-module-kit-v1', this.moduleFrame(id)).setDisplaySize(spriteSize, spriteSize);
  }

  private drawBuildSocket(graphics: Phaser.GameObjects.Graphics, layout: ModuleLayout, unit: number): void {
    const { x, y, width, height, accent } = layout;
    const insetX = width * 0.16;
    const insetY = height * 0.21;
    graphics.lineStyle(Math.max(1, unit), accent, 0.44);
    const dash = Math.max(9, 13 * unit);
    for (let offset = -width / 2 + insetX; offset < width / 2 - insetX; offset += dash * 1.75) {
      graphics.lineBetween(x + offset, y - height / 2 + insetY, x + Math.min(offset + dash, width / 2 - insetX), y - height / 2 + insetY);
      graphics.lineBetween(x + offset, y + height / 2 - insetY, x + Math.min(offset + dash, width / 2 - insetX), y + height / 2 - insetY);
    }
    graphics.lineStyle(Math.max(1, unit), 0x6d8997, 0.5);
    graphics.lineBetween(x - width * 0.27, y, x + width * 0.27, y);
    graphics.lineBetween(x, y - height * 0.28, x, y + height * 0.28);
    graphics.fillStyle(accent, 0.52);
    graphics.fillCircle(x, y, Math.max(5, 7 * unit));
  }

  private moduleFrame(id: FacilityId): number {
    return id === 'hangar' ? 0 : id === 'scanner' ? 1 : id === 'labor' ? 2 : 3;
  }

  private addModuleLabel(layout: ModuleLayout, built: boolean, unit: number): void {
    const facility = FACILITIES[layout.id];
    const labelY = layout.id === 'scanner' ? layout.y - layout.height * 0.72 : layout.y + layout.height * 0.72;
    const state = built ? 'ONLINE' : `BAUPLATZ · ${this.compactCost(layout.id)}`;
    const label = this.add.text(layout.x, labelY, `${facility.name.toUpperCase()}\n${state}`, {
      fontFamily: 'Arial', fontSize: Math.max(7, 8 * unit), color: built ? '#f3e2bd' : '#9fbbc4', fontStyle: 'bold', align: 'center', lineSpacing: Math.max(1, 2 * unit),
    }).setOrigin(0.5);
    label.setAlpha(built ? 1 : 0.84);
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
}
